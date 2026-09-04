/**
 * Application & Career Preparation Tools Logic
 * Handles Job Description analysis, Cover Letter generation, Email generation, and File renaming.
 */

/**
 * Common technical and professional keywords list for extraction
 */
const COMMON_SKILLS = [
  "javascript", "typescript", "react", "next.js", "vue", "angular", "node.js", "python",
  "java", "c++", "c#", "golang", "ruby", "sql", "postgresql", "mongodb", "aws", "docker",
  "kubernetes", "git", "ci/cd", "rest api", "graphql", "tailwind", "html", "css",
  "project management", "agile", "scrum", "leadership", "communication", "problem solving",
  "data analysis", "figma", "ui/ux", "product design", "customer service", "sales",
  "marketing", "seo", "budget management", "cross-functional", "collaboration"
];

/**
 * Analyze Job Description and compare against CV
 */
export function analyzeJobDescription({ jobDescription = "", cvText = "", cvData = null }) {
  if (!jobDescription.trim()) {
    throw new Error("Please enter a job description to analyze.");
  }

  const jdLower = jobDescription.toLowerCase();

  // Combine CV sources
  let combinedCv = (cvText || "").toLowerCase();
  if (cvData) {
    const skills = Array.isArray(cvData.skills) ? cvData.skills.map((s) => s.name || s).join(" ") : "";
    const titles = Array.isArray(cvData.experience) ? cvData.experience.map((e) => e.job_title + " " + e.description).join(" ") : "";
    combinedCv += " " + skills.toLowerCase() + " " + titles.toLowerCase();
  }

  // Extract detected keywords from JD
  const foundKeywords = [];
  COMMON_SKILLS.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i");
    if (regex.test(jdLower)) {
      foundKeywords.push(skill);
    }
  });

  // Extract custom words appearing frequently in JD (3+ letters, non-stop words)
  const stopWords = new Set(["with", "this", "that", "from", "they", "will", "have", "more", "your", "their", "about", "work", "team", "experience", "role", "years", "skills"]);
  const jdWords = jdLower.match(/[a-z]{3,}/g) || [];
  const wordFreq = {};
  jdWords.forEach((w) => {
    if (!stopWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });

  const frequentTerms = Object.entries(wordFreq)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  const allKeyTerms = Array.from(new Set([...foundKeywords, ...frequentTerms]));

  // Compare with CV
  const matchedKeywords = [];
  const missingKeywords = [];

  allKeyTerms.forEach((term) => {
    const inCv = combinedCv.includes(term.toLowerCase());
    if (inCv) {
      matchedKeywords.push(term);
    } else {
      missingKeywords.push(term);
    }
  });

  // Estimated match percentage
  const totalTerms = allKeyTerms.length;
  let matchPercentage = totalTerms > 0 ? Math.round((matchedKeywords.length / totalTerms) * 100) : 75;
  matchPercentage = Math.min(95, Math.max(30, matchPercentage));

  // Key requirements / responsibilities summary lines from JD
  const lines = jobDescription.split("\n").map((l) => l.trim()).filter((l) => l.length > 25);
  const responsibilitySnippets = lines.slice(0, 5);

  return {
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    totalTermsDetected: totalTerms,
    responsibilitySnippets,
    recommendations: [
      missingKeywords.length > 0
        ? `Incorporate missing target terms (${missingKeywords.slice(0, 3).join(", ")}) into your CV experience or skills where you have relevant experience.`
        : "Your CV strongly reflects the key terms highlighted in this position description.",
      "Review the role's primary responsibilities and align the first 2 bullet points under your current role to demonstrate identical problem-solving impact.",
      "Include a tailored Cover Letter reiterating your motivation and exact fit for their team."
    ]
  };
}

/**
 * Generate Tailored Cover Letter
 */
export function generateCoverLetterText({
  candidateName = "Candidate",
  candidateEmail = "",
  candidatePhone = "",
  candidateLocation = "",
  jobTitle = "Professional",
  company = "the Hiring Team",
  recipient = "Hiring Manager",
  keySkills = [],
  summary = "",
  tone = "Professional & Confident",
  language = "English"
} = {}) {
  const skillsList = keySkills.length > 0 ? keySkills.slice(0, 4).join(", ") : "problem-solving, collaboration, and high standards of execution";
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let opening = `I am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}.`;
  if (tone === "Concise & Direct") {
    opening = `Please accept this letter and attached CV for the ${jobTitle} position at ${company}.`;
  } else if (tone === "Formal & Traditional") {
    opening = `I wish to submit my formal application for the vacant position of ${jobTitle} currently open at ${company}.`;
  }

  let body = `With proven experience across ${skillsList}, I have built a track record of delivering measurable results while collaborating effectively with cross-functional teams. In my previous work, I focused on high-efficiency output, systematic problem-solving, and ensuring project goals align seamlessly with operational priorities.`;

  if (summary) {
    body += `\n\n${summary}`;
  }

  const closing = `I would welcome the opportunity to discuss how my background and dedication can contribute to ${company}'s upcoming milestones. Thank you for your time and consideration.`;

  return `${candidateName}
${candidateLocation ? candidateLocation + " • " : ""}${candidateEmail}${candidatePhone ? " • " + candidatePhone : ""}

${dateStr}

To: ${recipient}
${company}

Dear ${recipient},

${opening}

${body}

${closing}

Sincerely,

${candidateName}`;
}

/**
 * Generate Application Email
 */
export function generateApplicationEmail({
  recipientName = "Hiring Manager",
  jobTitle = "Role",
  company = "Company",
  senderName = "Candidate",
  scenario = "application", // 'application' | 'followup' | 'speculative' | 'referral'
  attachments = "CV and Cover Letter"
} = {}) {
  let subject = "";
  let body = "";

  if (scenario === "application") {
    subject = `Application: ${jobTitle} – ${senderName}`;
    body = `Dear ${recipientName},

I hope this email finds you well.

I am writing to submit my application for the ${jobTitle} opening at ${company}. Having reviewed the requirements, I believe my background and hands-on skill set make me a strong candidate for your team.

Please find attached my ${attachments} for your review. I would welcome the opportunity to connect for a brief introductory conversation.

Thank you very much for your time and consideration.

Best regards,

${senderName}`;
  } else if (scenario === "followup") {
    subject = `Following Up: Application for ${jobTitle} – ${senderName}`;
    body = `Dear ${recipientName},

I hope you are having a productive week.

I am following up on my application submitted for the ${jobTitle} position at ${company}. I remain very enthusiastic about the opportunity to contribute to your team and wanted to inquire if any additional information or portfolio examples would be helpful at this stage.

Thank you again for your time and review.

Warm regards,

${senderName}`;
  } else if (scenario === "speculative") {
    subject = `Inquiry: Career Opportunities in ${jobTitle} – ${senderName}`;
    body = `Dear ${recipientName},

I have been following ${company}'s impressive trajectory and work in the industry. As a professional experienced in ${jobTitle}, I am reaching out to explore potential opportunities where my skill set could support your growth.

I have attached my ${attachments} for your reference and would love to have a brief introductory chat if any relevant openings arise.

Thank you for your consideration.

Sincerely,

${senderName}`;
  }

  return { subject, body };
}

/**
 * Generate Professional Clean CV File Names
 */
export function generateStandardCvFileNames({ fullName = "Alex Morgan", jobTitle = "Software Engineer", date = new Date() }) {
  const cleanName = fullName.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  const cleanTitle = jobTitle.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  const year = date.getFullYear();

  return [
    {
      id: "standard",
      label: "Classic Clean (Recommended)",
      filename: `${cleanName}_CV.pdf`,
      description: "Universally accepted by recruiters and ATS systems."
    },
    {
      id: "role_specific",
      label: "Role-Specific",
      filename: `${cleanName}_${cleanTitle}_CV.pdf`,
      description: "Helps hiring managers identify your target position immediately."
    },
    {
      id: "resume_year",
      label: "Resume with Year",
      filename: `${cleanName}_Resume_${year}.pdf`,
      description: "Shows that your resume is up-to-date for the current year."
    },
    {
      id: "international",
      label: "International Format",
      filename: `${cleanName.toUpperCase()}_Curriculum_Vitae.pdf`,
      description: "Formal structure preferred in European and academic job submissions."
    }
  ];
}
