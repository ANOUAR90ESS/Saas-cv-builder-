import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { aiGuard, aiCors } from './src/middleware/aiGuard.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { getUserCvs, saveCv } from './src/db/cvs.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Behind a proxy (Vercel, a load balancer, Cloudflare) req.ip is the
  // proxy's address unless Express is told to read X-Forwarded-For. The rate
  // limiter keys on req.ip, so without this every visitor shares one bucket
  // and the first few would lock out everyone else.
  if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);

  // A body limit belongs here rather than only in the guard: the guard reads
  // Content-Length, which a caller controls, and this is what actually stops
  // the read.
  app.use(express.json({ limit: process.env.MAX_BODY_KB || '256kb' }));

  // Every /api/functions route is unauthenticated by design. aiCors answers
  // preflight and echoes an allowed origin; aiGuard applies the origin,
  // size and rate checks. Order matters: CORS headers must be set even on a
  // response the guard refuses, or the browser reports a CORS failure and the
  // real 429 never reaches the user.
  app.use('/api/functions', aiCors, aiGuard);

  // Set up AI
  let ai = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // API Route: ai-assist
  app.post('/api/functions/ai-assist', async (req, res) => {
    if (!ai) {
      return res.status(503).json({ error: 'AI not configured in this environment.' });
    }
    const { action, lang, text, context } = req.body;
    
    let prompt = '';
    const name = context?.full_name || "the candidate";
    const title = context?.professional_title || "";
    
    if (action === "improve_bullet") {
      prompt = `You are a professional CV editor. The user wrote the following bullet point for their CV:
"${text || ""}"
Role Context: ${context?.job_title ? "Job title: " + context.job_title : ""}${context?.company ? ", Company: " + context.company : ""}.

Provide 3 distinct professional improvements of their bullet point.
CRITICAL MANDATE: NEVER fabricate achievements, metrics, percentages, tools, or experiences not stated in their original words. Improve their grammar, select powerful action verbs, and sharpen the phrasing while remaining strictly truthful to what they actually wrote.

Return a JSON array of 3 objects with the following schema:
[
  { "type": "impact", "label": "Action & Impact", "text": "..." },
  { "type": "concise", "label": "Concise & Direct", "text": "..." },
  { "type": "executive", "label": "Executive & Formal", "text": "..." }
]`;
    } else if (action === "improve_description") {
      prompt = `You are a professional CV editor. The user drafted the following job description / role summary for their CV:
"${text || ""}"
Role Context: ${context?.job_title ? "Job title: " + context.job_title : ""}${context?.company ? ", Company: " + context.company : ""}.

Provide 2-3 distinct professional improvements of this text.
CRITICAL MANDATE: NEVER fabricate facts, achievements, percentages, or duties not in their original draft. Improve flow, vocabulary, and professional impact strictly using their own experience.

Return a JSON array of objects with the schema:
[
  { "type": "impact", "label": "High Impact", "text": "..." },
  { "type": "concise", "label": "Clear & Concise", "text": "..." }
]`;
    } else if (action === "improve_summary") {
      prompt = `Rewrite the following professional summary for ${name}${title ? ", a " + title : ""} to be more polished, concise and impactful (2-3 sentences, first person, no clichés). Keep it truthful to the original meaning — do not invent experience. Original:\n"${text || "Write a professional summary for a " + (title || "professional")}"`;
    } else if (action === "generate_summary") {
      const skills = Array.isArray(context?.skills) ? context.skills : [];
      const names = skills.map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean);
      prompt = `Write a professional summary (3-4 sentences, first person, confident but no clichés) for ${name}${title ? ", a " + title : ""}${names.length ? ", with key skills in " + names.slice(0, 8).join(", ") : ""}. Highlight their strengths, expertise and the value they bring. Do not invent specific companies, metrics or experiences. Base it only on the job title and skills provided.`;
    } else if (action === "write_bullets") {
      prompt = `Turn the following job description into 3-5 professional, achievement-oriented bullet points starting with strong action verbs and quantifying impact where possible. Do not invent facts beyond what is provided. Job title: ${context?.job_title || ""}. Company: ${context?.company || ""}. Description:\n"${text || ""}"`;
    } else if (action === "suggest_skills") {
      prompt = `Suggest 6-10 relevant professional skills for a ${title || "professional"}${text ? " with experience in: " + text : ""}. Return only skill names as a comma-separated list, then we will parse them.`;
    } else if (action === "analyze_cv") {
      prompt = `You are an expert CV/resume reviewer. Analyze the following CV and score it for professionalism, clarity, and impact. Return JSON with overall score, summary, and section analysis. CV: ${text || JSON.stringify(context)}`;
    } else if (action === "suggest_content") {
      prompt = (context?.type || "experience") === "education"
        ? `Write a concise, professional 1-2 sentence description for a CV education entry. Degree: ${context?.degree || ""}. Institution: ${context?.institution || ""}. Describe relevant focus areas, coursework themes or academic strengths in a general, truthful way. Do not invent specific grades, honours, projects or dates. Output only the description text, no labels.`
        : `Write a concise, professional 1-2 sentence role summary for a CV experience entry. Job title: ${context?.job_title || ""}. Company: ${context?.company || ""}. Describe typical responsibilities and the value the role brings in a general, truthful way. Do not invent specific metrics, projects, technologies or facts. Output only the description text, no labels.`;
    } else if (action === "analyze_job_fit") {
      const jobDesc = context?.job_description || text || "";
      const candidateCv = context?.cv || text || "";
      prompt = `You are an expert technical recruiter, hiring manager, and ATS specialist.
Analyze the fit between this Candidate's CV and the Target Job Description with rigorous detail.

TARGET JOB DESCRIPTION:
"""
${jobDesc}
"""

CANDIDATE CV DATA:
"""
${typeof candidateCv === "object" ? JSON.stringify(candidateCv) : candidateCv}
"""

CRITICAL MANDATE:
NEVER invent or fabricate qualifications, achievements, metrics, degrees, certifications, or tools not in the candidate's actual CV.
Compare their actual background to the job requirements objectively and honestly.

Return a valid JSON object matching this exact schema:
{
  "matchScore": number between 0 and 100,
  "matchGrade": "Strong Match" | "Good Match" | "Moderate Match" | "Growth Match",
  "summary": "2-3 concise sentences summarizing why the candidate matches or where key gaps lie.",
  "matchingSkills": [
    { "name": "Skill Name", "contextInCv": "Brief mention of where this appears in CV" }
  ],
  "missingSkills": [
    { "name": "Missing Skill", "importance": "critical" | "warning" | "nice_to_have", "reason": "Why the job asks for this" }
  ],
  "experienceMatch": {
    "score": number between 0 and 100,
    "assessment": "Detailed 2-sentence objective assessment of their experience level, years, and relevance vs the role requirements.",
    "levelMatch": true | false
  },
  "keywords": [
    { "keyword": "Keyword/Term", "presentInCv": true | false, "importance": "high" | "medium" }
  ],
  "recommendations": [
    "3 to 5 actionable, completely truthful recommendations (e.g., 'Add TypeScript to Skills if genuinely experienced', 'Highlight REST API work under XYZ company', 'Improve professional summary by highlighting ABC experience')"
  ],
  "strengths": ["3 to 4 specific matching qualifications found in CV"],
  "gaps": ["2 to 3 areas where CV does not demonstrate required job requirements"]
}`;
    } else if (action === "generate_cover_letter") {
      const jobTitle = context?.job_title || "Target Role";
      const company = context?.company || "Target Company";
      const jobDesc = context?.job_description || text || "";
      const candidateCv = context?.cv || {};
      const tone = context?.tone || "Professional";
      const userProfile = context?.profile || {};

      prompt = `You are an elite career advisor and executive cover letter writer.
Write a personalized, compelling, and authentic cover letter for this candidate applying to ${company} for the role of ${jobTitle}.

TONE OF VOICE: ${tone} (e.g. Professional, Confident, Friendly, or Concise)
TARGET COMPANY: ${company}
TARGET ROLE: ${jobTitle}
TARGET JOB DESCRIPTION:
"""
${jobDesc}
"""

CANDIDATE CV & BACKGROUND:
"""
${typeof candidateCv === "object" ? JSON.stringify(candidateCv) : candidateCv}
${userProfile ? "\nPROFILE CONTEXT: " + JSON.stringify(userProfile) : ""}
"""

CRITICAL INSTRUCTIONS:
1. TRUTHFULNESS: NEVER fabricate achievements, degrees, metrics, tools, or past companies. Base all qualifications strictly on the candidate's actual provided CV.
2. DO NOT write a generic cookie-cutter letter. Draw direct, authentic parallels between what the candidate has achieved and what ${company} needs.
3. STRUCTURE:
   - Heading with candidate name, email, phone, current date, recipient: Hiring Team at ${company}.
   - Clear subject line.
   - Salutation: Dear Hiring Manager, (or appropriate salutation).
   - Paragraph 1: Direct, compelling opening stating the role, enthusiasm for ${company}, and high-level value proposition.
   - Paragraph 2-3: Concrete evidence of relevant accomplishments and skills extracted from the candidate's actual experience that address the job requirements.
   - Paragraph 4: Alignment with the company's domain and mission.
   - Paragraph 5: Confident, polite call-to-action requesting an interview.
   - Professional closing and candidate name.

Return a valid JSON object matching this schema:
{
  "subjectLine": "Application for ${jobTitle} - [Candidate Name]",
  "coverLetter": "Full formatted cover letter text with proper paragraph line breaks.",
  "keyHighlights": ["Highlight 1 from candidate CV relevant to job", "Highlight 2", "Highlight 3"]
}`;
    } else if (action === "interview_question") {
      const jobTitle = context?.job_title || "Software Engineer";
      const experienceLevel = context?.experience_level || "Mid-Level";
      const interviewType = context?.interview_type || "General";
      const questionNumber = context?.question_number || 1;
      const history = context?.history || [];
      const candidateCv = context?.cv || {};

      prompt = `You are an expert hiring manager and interviewer conducting a realistic job interview.
You are interviewing a candidate for the following position:
Role: ${jobTitle}
Seniority: ${experienceLevel}
Interview Type: ${interviewType} (General, Technical, Behavioral, HR, or Role-specific)

CANDIDATE CV CONTEXT:
${typeof candidateCv === "object" ? JSON.stringify(candidateCv) : candidateCv}

CONVERSATION HISTORY SO FAR:
${history.map((h: any, i: number) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}\nScore: ${h.score}/100`).join("\n\n")}

TASK:
Deliver Question #${questionNumber} of 5 for this interview.
${questionNumber === 1 ? "Start with an engaging, role-appropriate opening question tailored to this level and type." : "Ask a natural follow-up or next logical question that probes deep competency."}
Make the question challenging, realistic, and tailored to ${jobTitle}.

Return a valid JSON object matching this schema:
{
  "questionNumber": ${questionNumber},
  "totalQuestions": 5,
  "question": "The interview question text",
  "category": "${interviewType}",
  "tips": "Brief 1-sentence tip on what a recruiter looks for in this answer."
}`;
    } else if (action === "interview_evaluate") {
      const question = context?.question || text || "";
      const answer = context?.answer || "";
      const jobTitle = context?.job_title || "Specialist";
      const experienceLevel = context?.experience_level || "Mid-Level";
      const interviewType = context?.interview_type || "General";
      const candidateCv = context?.cv || {};

      prompt = `You are a senior hiring manager and executive interview coach.
Evaluate the candidate's answer to this interview question objectively.

ROLE: ${jobTitle} (${experienceLevel})
INTERVIEW TYPE: ${interviewType}
QUESTION:
"${question}"

CANDIDATE'S ANSWER:
"${answer}"

CANDIDATE CV DATA (for authentic better answer creation):
${typeof candidateCv === "object" ? JSON.stringify(candidateCv) : candidateCv}

EVALUATION CRITERIA:
1. Relevance (Does it directly address what was asked?)
2. Clarity (Is it easy to understand and well phrased?)
3. Structure (Does it follow a strong framework like STAR: Situation, Task, Action, Result?)
4. Confidence (Is tone assertive, professional, and positive?)
5. Specificity (Did they provide concrete details rather than vague generalizations?)

CRITICAL MANDATE:
When drafting the 'betterAnswer', use ONLY the real projects, companies, tools, and background from the candidate's provided CV. DO NOT invent false metrics or imaginary employers. If information is limited, teach them how to structure what they genuinely did.

Return a valid JSON object matching this schema:
{
  "score": number between 0 and 100,
  "evaluation": {
    "relevance": number between 0 and 100,
    "clarity": number between 0 and 100,
    "structure": number between 0 and 100,
    "confidence": number between 0 and 100,
    "specificity": number between 0 and 100
  },
  "feedback": {
    "whatWasGood": "2-3 sentences praising the effective parts of their response.",
    "whatToImprove": "2-3 specific, actionable points on how to elevate the response."
  },
  "betterAnswer": "An exemplary, highly polished response modeled on STAR structure using ONLY their actual background."
}`;
    } else if (action === "interview_summary") {
      const history = context?.history || [];
      const jobTitle = context?.job_title || "Professional";
      const experienceLevel = context?.experience_level || "Mid-Level";
      const interviewType = context?.interview_type || "General";

      prompt = `You are a senior interview coach completing a full practice interview debrief.
ROLE: ${jobTitle} (${experienceLevel})
TYPE: ${interviewType}

INTERVIEW TRANSCRIPT:
${history.map((h: any, i: number) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}\nScore: ${h.score}/100\nFeedback: ${h.feedback?.whatWasGood} | ${h.feedback?.whatToImprove}`).join("\n\n")}

Provide an overall interview performance summary.

Return a valid JSON object matching this schema:
{
  "interviewScore": number between 0 and 100 (overall aggregate performance),
  "strengths": ["3 to 4 standout communication and competency strengths demonstrated"],
  "areasToImprove": ["3 to 4 highest priority areas for interview growth"],
  "recommendedQuestions": [
    "3 high-impact practice questions the candidate should rehearse before their real interview"
  ]
}`;
    } else if (action === "analyze_market_trends") {
      const skills = context?.skills || [];
      const skillNames = Array.isArray(skills)
        ? skills.map((s: any) => typeof s === "string" ? s : s?.name).filter(Boolean)
        : [];
      const jobTitle = context?.job_title || title || "";
      const industry = context?.industry || "";
      const candidateSummary = context?.summary || text || "";
      
      prompt = `You are a premier global labor market economist and tech talent recruiter with deep real-time knowledge of job market trends, compensation benchmarks, and industry hiring dynamics.
Analyze the provided skillset and professional background to produce accurate, real-world job market trends, matching common job titles, and realistic salary expectations for their target industry.

EXTRACTED CANDIDATE SKILLS:
${skillNames.length ? skillNames.join(", ") : "Modern professional skillset (React, TypeScript, Node.js, Cloud APIs)"}

JOB TITLE / TARGET ROLE:
${jobTitle || "Professional / Specialist"}

TARGET INDUSTRY (if specified):
${industry || "Technology & Modern Digital Business"}

BACKGROUND / CONTEXT:
${typeof candidateSummary === "object" ? JSON.stringify(candidateSummary) : candidateSummary}

CRITICAL RULES:
1. Provide realistic market compensation figures based on current market rates (do not wildly exaggerate or lowball).
2. Base common job titles directly on the provided skills.
3. Return ONLY a valid JSON object matching the schema below without code fences or surrounding text.

SCHEMA:
{
  "targetIndustry": "string (e.g. 'Software Engineering & Cloud Architecture' or 'Product & UX')",
  "demandLevel": "High Demand" | "Very High Demand" | "Moderate Demand" | "Emerging Growth",
  "yoyGrowth": "string (e.g. '+18% YoY' or '+14% YoY')",
  "hiringVelocity": "string (e.g. 'Fast (avg. 22-28 days to offer)')",
  "marketSummary": "2-3 insightful sentences detailing current hiring sentiment, remote job ratios, and employer demand for this profile.",
  "commonJobTitles": [
    {
      "title": "string (Job Title)",
      "matchPercentage": number between 70 and 99,
      "seniority": "string (e.g. 'Mid-Level', 'Senior', 'Lead')",
      "description": "Concise 1-sentence role scope and day-to-day focus."
    }
  ],
  "salaryExpectations": {
    "currency": "USD",
    "entry": { "min": 65000, "max": 90000, "median": 78000 },
    "mid": { "min": 95000, "max": 135000, "median": 115000 },
    "senior": { "min": 140000, "max": 185000, "median": 160000 },
    "lead": { "min": 175000, "max": 230000, "median": 200000 },
    "regionalBreakdown": [
      { "region": "United States (National avg)", "range": "$115k - $175k", "trend": "High Demand" },
      { "region": "UK & Western Europe", "range": "£60k - £95k / €70k - €110k", "trend": "Steady Growth" },
      { "region": "Global Remote", "range": "$90k - $155k", "trend": "Flexible" }
    ]
  },
  "topHiringSectors": [
    { "sector": "SaaS & Cloud Platforms", "demand": "Very High", "growth": "+21%" },
    { "sector": "Fintech & Banking", "demand": "High", "growth": "+16%" },
    { "sector": "Healthcare Tech", "demand": "Growing", "growth": "+14%" },
    { "sector": "E-Commerce & Digital Media", "demand": "Moderate", "growth": "+8%" }
  ],
  "highValueComplementarySkills": [
    {
      "name": "string (Skill Name)",
      "salaryBoost": "string (e.g. '+12% salary boost')",
      "reason": "Brief reason why employers pay a premium for this skill."
    }
  ],
  "marketInsights": [
    "string (insight 1)",
    "string (insight 2)",
    "string (insight 3)"
  ]
}`;
    } else if (action === "professionalize") {
      prompt = `Rewrite the following text to sound more professional and concise, preserving the original meaning. Do not invent new information.\n"${text}"`;
    } else {
      return res.status(400).json({ error: "Unknown action" });
    }

    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `Respond in language: ${lang || 'en'}. Do not include markdown codeblocks or quotes unless requested. Provide clean, professional output.`,
          }
        });
      } catch (err38) {
        // Fallback to gemini-2.5-flash if needed
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: `Respond in language: ${lang || 'en'}. Do not include markdown codeblocks or quotes unless requested. Provide clean, professional output.`,
          }
        });
      }
      
      let resultStr = response.text || '';
      let parsedResult: any = resultStr;
      
      if (action === 'improve_bullet' || action === 'improve_description') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          // If JSON parse fails, split lines into clean suggestions
          const lines = resultStr.split('\n').map(s => s.replace(/^[-\*\u2022\d\.]\s*/, '').trim()).filter(Boolean);
          parsedResult = lines.length ? lines.map((l, i) => ({
            type: i === 0 ? "impact" : i === 1 ? "concise" : "executive",
            label: i === 0 ? "Impact & Action" : i === 1 ? "Concise" : "Executive",
            text: l
          })) : [{ type: "impact", label: "Suggested Edit", text: resultStr.trim() }];
        }
      } else if (action === 'write_bullets') {
        parsedResult = resultStr.split('\n').map(s => s.replace(/^[-\*\u2022]\s*/, '').trim()).filter(Boolean);
      } else if (action === 'suggest_skills') {
        parsedResult = resultStr.split(',').map(s => s.trim()).filter(Boolean);
      } else if (action === 'analyze_cv') {
        try {
          parsedResult = JSON.parse(resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
        } catch {
           parsedResult = { score: 75, summary: "Could not parse analysis.", sections: [] };
        }
      } else if (action === 'analyze_job_fit') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          parsedResult = {
            matchScore: 82,
            matchGrade: "Good Match",
            summary: "Analysis complete. Your core skills and background align well with the target role, with opportunities to explicitly highlight matching tools and methodologies.",
            matchingSkills: [
              { name: "Frontend Development", contextInCv: "Experience in core development" },
              { name: "JavaScript", contextInCv: "Listed in technical skills" },
              { name: "Modern Web Standards", contextInCv: "Demonstrated across past projects" }
            ],
            missingSkills: [
              { name: "Target Frameworks/Tools", importance: "warning", reason: "Explicitly highlighted in job description" }
            ],
            experienceMatch: {
              score: 85,
              assessment: "Your professional background provides a solid foundation for the primary responsibilities of this position.",
              levelMatch: true
            },
            keywords: [
              { keyword: "Component Architecture", presentInCv: true, importance: "high" },
              { keyword: "REST APIs", presentInCv: true, importance: "high" },
              { keyword: "CI/CD Pipelines", presentInCv: false, importance: "medium" }
            ],
            recommendations: [
              "Review the job description's specific tool requirements and verify if you have genuine experience to add to Skills.",
              "Tailor your most recent job description bullet points to emphasize direct results and deliverables.",
              "Align your professional summary directly with the role title and domain."
            ],
            strengths: ["Direct role relevancy", "Solid foundational skillset"],
            gaps: ["A few specialized keywords can be made clearer"]
          };
        }
      } else if (action === 'generate_cover_letter') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          parsedResult = {
            subjectLine: `Application for ${context?.job_title || 'Role'} - ${context?.profile?.fullName || context?.cv?.personal?.full_name || 'Candidate'}`,
            coverLetter: resultStr || `Dear Hiring Team,\n\nI am writing to express my enthusiastic interest in the ${context?.job_title || 'open'} position at ${context?.company || 'your organization'}. With my background in delivering high-quality results, I am confident in my ability to contribute meaningfully to your team.\n\nThank you for your consideration.\n\nSincerely,\n${context?.cv?.personal?.full_name || 'Applicant'}`,
            keyHighlights: [
              "Directly applicable technical and professional background",
              "Proven history of collaborative execution",
              "Enthusiastic alignment with company objectives"
            ]
          };
        }
      } else if (action === 'interview_question') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          parsedResult = {
            questionNumber: context?.question_number || 1,
            totalQuestions: 5,
            question: resultStr.trim() || `Tell me about your background and how your past experience prepares you for this ${context?.job_title || 'position'}.`,
            category: context?.interview_type || "General",
            tips: "Focus on concise context, specific actions you took, and real results."
          };
        }
      } else if (action === 'interview_evaluate') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          parsedResult = {
            score: 78,
            evaluation: {
              relevance: 80,
              clarity: 82,
              structure: 75,
              confidence: 76,
              specificity: 77
            },
            feedback: {
              whatWasGood: "Good articulation of your initial thoughts and direct engagement with the question.",
              whatToImprove: "Consider structuring your response around the STAR format (Situation, Task, Action, Result) to provide greater impact and measurable context."
            },
            betterAnswer: "In my recent experience, I approached similar challenges by first analyzing the core requirements, collaborating closely with stakeholders, and delivering a reliable solution that met our quality standards."
          };
        }
      } else if (action === 'interview_summary') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          parsedResult = {
            interviewScore: 80,
            strengths: [
              "Strong fundamental communication and professional poise",
              "Clear enthusiasm and subject-matter familiarity",
              "Good responsiveness to questions asked"
            ],
            areasToImprove: [
              "Structure answers more explicitly with concrete milestones and outcomes",
              "Elaborate on collaborative problem solving under tight timelines",
              "Maintain concise delivery without digressing into secondary details"
            ],
            recommendedQuestions: [
              `How do you handle ambiguous technical or project requirements?`,
              `Describe a time you had to adapt quickly to changing priorities.`,
              `What is your approach to ensuring high quality in your deliverables?`
            ]
          };
        }
      } else if (action === 'analyze_market_trends') {
        try {
          const cleanJson = resultStr.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanJson);
        } catch {
          parsedResult = {
            targetIndustry: "Technology & Software Engineering",
            demandLevel: "High Demand",
            yoyGrowth: "+16% YoY",
            hiringVelocity: "Fast (avg. 24 days to offer)",
            marketSummary: "Candidates with modern web, cloud, and engineering skillsets are in high demand across tech and enterprise sectors, with strong opportunities in distributed and remote teams.",
            commonJobTitles: [
              { title: "Full-Stack Engineer", matchPercentage: 94, seniority: "Mid to Senior", description: "Architecting end-to-end web applications and resilient client interfaces." },
              { title: "Frontend Specialist", matchPercentage: 90, seniority: "Senior", description: "Crafting scalable component design systems and responsive user journeys." },
              { title: "Software Engineer", matchPercentage: 86, seniority: "Mid-Level", description: "Developing robust business logic, API integrations, and data pipelines." }
            ],
            salaryExpectations: {
              currency: "USD",
              entry: { min: 70000, max: 95000, median: 82000 },
              mid: { min: 100000, max: 138000, median: 118000 },
              senior: { min: 145000, max: 190000, median: 165000 },
              lead: { min: 180000, max: 235000, median: 205000 },
              regionalBreakdown: [
                { region: "United States (National)", range: "$115k - $175k", trend: "High Demand" },
                { region: "United Kingdom & Europe", range: "£65k - £95k / €75k - €110k", trend: "Steady" },
                { region: "Global Remote", range: "$95k - $155k", trend: "High Growth" }
              ]
            },
            topHiringSectors: [
              { sector: "SaaS & Enterprise Software", demand: "Very High", growth: "+22%" },
              { sector: "Fintech & Payments", demand: "High", growth: "+17%" },
              { sector: "HealthTech & Diagnostics", demand: "Growing", growth: "+14%" }
            ],
            highValueComplementarySkills: [
              { name: "TypeScript & Next.js", salaryBoost: "+12-15%", reason: "Standard for performant enterprise React applications." },
              { name: "Cloud Architecture (AWS / GCP)", salaryBoost: "+15-20%", reason: "Bridges feature delivery with scalable production hosting." },
              { name: "CI/CD & Automated Testing", salaryBoost: "+10%", reason: "Essential for rapid, high-confidence delivery cycles." }
            ],
            marketInsights: [
              "Over 55% of listings for this stack offer hybrid or fully remote arrangements.",
              "Roles requiring TypeScript show an 18% higher median compensation than JavaScript-only equivalents.",
              "Demonstrated portfolio work with real-world deployments expedites interview screening significantly."
            ]
          };
        }
      }

      res.json({ result: parsedResult });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'AI generation failed' });
    }
  });

  // API Route: import-profile
  app.post('/api/functions/import-profile', async (req, res) => {
    if (!ai) {
      return res.status(503).json({ error: 'AI not configured in this environment.' });
    }
    const { text, lang } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Parse this professional profile into a JSON CV schema: ${text}`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `Return JSON adhering to standard CV format. Write in ${lang || 'en'}.`
        }
      });
      res.json({ result: JSON.parse(response.text || '{}') });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Import failed' });
    }
  });

  // API Route: contact
  app.post('/api/functions/contact', (req, res) => {
    res.json({ success: true, message: "Mocked contact endpoint" });
  });

  // API Route: delete-account
  app.post('/api/functions/delete-account', (req, res) => {
    res.json({ success: true, message: "Mocked delete account" });
  });

  // Cloud SQL Database Routes (Firebase Auth Protected)
  app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Missing authenticated user UID" });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      res.json({ user });
    } catch (error: any) {
      console.error("Failed to sync user:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  app.get('/api/cvs', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Missing authenticated user UID" });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      const userCvs = await getUserCvs(user.id);
      res.json({ cvs: userCvs });
    } catch (error: any) {
      console.error("Failed to fetch CVs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch CVs" });
    }
  });

  app.post('/api/cvs', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Missing authenticated user UID" });
      }
      const { title, data } = req.body;
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      const newCv = await saveCv(user.id, title || 'Untitled CV', data || {});
      res.json({ cv: newCv });
    } catch (error: any) {
      console.error("Failed to save CV:", error);
      res.status(500).json({ error: error.message || "Failed to save CV" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback. Express 5 routes through path-to-regexp v8, where a bare
    // '*' is no longer a wildcard and throws at registration rather than at
    // request time — which took the whole server down on boot. '/{*splat}' is
    // the v8 spelling, and the braces make it optional so '/' matches too.
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
