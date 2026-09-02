// Simulated ATS Benchmark Scoring Engine
// Evaluates CV content against real-world Applicant Tracking System (ATS) parsing rules,
// keyword density benchmarks, quantifiable metric ratios, and structural criteria.

const ATS_ACTION_VERBS = [
  "accelerated", "achieved", "acquired", "administered", "advised", "amplified",
  "analyzed", "architected", "automated", "built", "championed", "collaborated",
  "consolidated", "constructed", "coordinated", "created", "decreased", "delivered",
  "deployed", "designed", "developed", "devised", "directed", "eliminated",
  "engineered", "enhanced", "established", "executed", "expanded", "expedited",
  "facilitated", "formulated", "generated", "guided", "implemented", "improved",
  "increased", "initiated", "innovated", "installed", "instituted", "integrated",
  "launched", "led", "managed", "maximized", "mentored", "migrated", "minimized",
  "modernized", "negotiated", "optimized", "orchestrated", "overhauled", "pioneered",
  "produced", "reduced", "reengineered", "resolved", "restructured", "revamped",
  "scaled", "spearheaded", "standardized", "streamlined", "strengthened", "supervised",
  "surpassed", "transformed", "unified", "upgraded", "validated"
];

const PASSIVE_OR_WEAK_PHRASES = [
  "responsible for", "duties included", "worked on", "helped with", "assisted in",
  "participated in", "tasked with", "handled"
];

// Regex for numbers, percentages, metrics, currency
const METRIC_REGEX = /(\b\d+([.,]\d+)?%|\$\d+([.,]\d+)?|\b\d+([.,]\d+)?\s*(k|m|million|billion|users|clients|projects|hours|days|weeks|months|years|members|teams|pts|x)\b|\b\d{1,4}\b)/i;

export function analyzeCvATS(cv) {
  if (!cv) {
    return {
      overallScore: 0,
      grade: "Incomplete",
      status: "fail",
      summary: "No CV data provided for ATS evaluation.",
      categories: [],
      actionItems: ["Start building your CV by adding your contact info and work experience."]
    };
  }

  const pi = cv.personal_info || {};
  const exp = cv.experience || [];
  const edu = cv.education || [];
  const skills = cv.skills || [];
  const summary = (cv.summary || "").trim();

  // 1. Contact & Identification Check (Max: 20 pts)
  let contactScore = 0;
  const contactPassed = [];
  const contactFailed = [];

  if (pi.full_name?.trim()) {
    contactScore += 5;
    contactPassed.push("Full Name provided");
  } else {
    contactFailed.push("Full Name is missing");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (pi.email && emailRegex.test(pi.email.trim())) {
    contactScore += 5;
    contactPassed.push("Valid email address detected");
  } else if (pi.email) {
    contactScore += 3;
    contactPassed.push("Email address present");
  } else {
    contactFailed.push("Email address is missing (critical for ATS contact parsing)");
  }

  if (pi.phone?.trim()) {
    contactScore += 4;
    contactPassed.push("Phone number provided");
  } else {
    contactFailed.push("Phone number is missing");
  }

  if (pi.location?.trim()) {
    contactScore += 3;
    contactPassed.push("Location / City specified");
  } else {
    contactFailed.push("Location is missing (helps ATS filter by region/remote)");
  }

  if (pi.linkedin?.trim() || pi.github?.trim() || pi.website?.trim()) {
    contactScore += 3;
    contactPassed.push("Professional profile / portfolio link included");
  } else {
    contactFailed.push("LinkedIn or portfolio link recommended for digital verification");
  }

  // 2. Summary & Headline Benchmark (Max: 15 pts)
  let summaryScore = 0;
  const summaryPassed = [];
  const summaryFailed = [];

  if (pi.professional_title?.trim()) {
    summaryScore += 4;
    summaryPassed.push(`Target headline specified ("${pi.professional_title}")`);
  } else {
    summaryFailed.push("Professional title / target role headline is missing");
  }

  if (summary) {
    const wordCount = summary.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 30 && wordCount <= 120) {
      summaryScore += 8;
      summaryPassed.push(`Optimal summary length (${wordCount} words)`);
    } else if (wordCount < 30) {
      summaryScore += 4;
      summaryFailed.push(`Summary is too brief (${wordCount} words; target: 40-90 words)`);
    } else {
      summaryScore += 5;
      summaryFailed.push(`Summary is overly long (${wordCount} words; risk of ATS truncation)`);
    }

    // Check for excessive personal pronouns (I, my, me)
    const firstPersonCount = (summary.match(/\b(I|me|my|myself)\b/gi) || []).length;
    if (firstPersonCount === 0) {
      summaryScore += 3;
      summaryPassed.push("Strong third-person executive phrasing (no personal pronouns)");
    } else {
      summaryScore += 1;
      summaryFailed.push("Avoid first-person pronouns ('I', 'my') in summary for ATS best practice");
    }
  } else {
    summaryFailed.push("Professional summary missing (ATS algorithms weigh profile summaries heavily)");
  }

  // 3. Work Experience & Quantifiable Impact (Max: 25 pts)
  let expScore = 0;
  const expPassed = [];
  const expFailed = [];

  if (exp.length > 0) {
    expScore += 6;
    expPassed.push(`${exp.length} work experience role(s) documented`);

    let totalBullets = 0;
    let metricBullets = 0;
    let bulletsWithGoodLength = 0;

    exp.forEach((role) => {
      const bullets = (role.bullet_points || []).filter((b) => b && b.trim());
      totalBullets += bullets.length;

      bullets.forEach((b) => {
        if (METRIC_REGEX.test(b)) {
          metricBullets++;
        }
        const words = b.split(/\s+/).filter(Boolean).length;
        if (words >= 8 && words <= 30) {
          bulletsWithGoodLength++;
        }
      });
    });

    if (totalBullets >= 3) {
      expScore += 6;
      expPassed.push(`${totalBullets} bullet points across work experience`);
    } else if (totalBullets > 0) {
      expScore += 3;
      expFailed.push(`Only ${totalBullets} bullet point(s) found; add 3-5 bullets per position`);
    } else {
      expFailed.push("No bullet points found under work experience entries");
    }

    if (metricBullets >= 3) {
      expScore += 8;
      expPassed.push(`High quantifiable impact: ${metricBullets} bullets contain measurable metrics (%, $, numbers)`);
    } else if (metricBullets >= 1) {
      expScore += 4;
      expFailed.push(`Found ${metricBullets} metric(s); aim for metrics in at least 3-4 bullets to pass ATS impact filters`);
    } else {
      expFailed.push("Zero quantifiable metrics detected. Add numbers, percentages, or concrete outcomes");
    }

    if (totalBullets > 0 && bulletsWithGoodLength / totalBullets >= 0.6) {
      expScore += 5;
      expPassed.push("Concise and well-proportioned bullet point lengths (8-30 words)");
    } else if (totalBullets > 0) {
      expScore += 2;
      expFailed.push("Some bullets are too short (<8 words) or too dense (>30 words)");
    }
  } else {
    expFailed.push("No work experience added. ATS parsers require structured work history");
  }

  // 4. Action Verbs & Power Words (Max: 20 pts)
  let verbScore = 0;
  const verbPassed = [];
  const verbFailed = [];
  const allText = [
    summary,
    ...exp.map((e) => `${e.description || ""} ${(e.bullet_points || []).join(" ")}`),
    ...((cv.projects || []).map((p) => p.description || ""))
  ].join(" ").toLowerCase();

  const detectedActionVerbs = ATS_ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(allText)
  );

  const detectedWeakPhrases = PASSIVE_OR_WEAK_PHRASES.filter((phrase) =>
    allText.includes(phrase)
  );

  if (detectedActionVerbs.length >= 7) {
    verbScore += 15;
    verbPassed.push(`Outstanding vocabulary: ${detectedActionVerbs.length} high-impact action verbs detected`);
  } else if (detectedActionVerbs.length >= 4) {
    verbScore += 10;
    verbPassed.push(`Good action verbs (${detectedActionVerbs.length} found: ${detectedActionVerbs.slice(0, 4).join(", ")})`);
  } else if (detectedActionVerbs.length >= 1) {
    verbScore += 5;
    verbFailed.push(`Only ${detectedActionVerbs.length} action verb(s) detected. Begin bullets with power verbs (e.g. 'Orchestrated', 'Delivered')`);
  } else {
    verbFailed.push("No standard ATS power action verbs detected in bullet points");
  }

  if (detectedWeakPhrases.length === 0) {
    verbScore += 5;
    verbPassed.push("Zero passive or cliché phrases detected ('responsible for', 'helped with')");
  } else {
    verbFailed.push(`Replace passive phrases (${detectedWeakPhrases.slice(0, 2).map((p) => `"${p}"`).join(", ")}) with strong action verbs`);
  }

  // 5. Skills & Keyword Density (Max: 20 pts)
  let skillScore = 0;
  const skillPassed = [];
  const skillFailed = [];

  const skillCount = skills.length;
  if (skillCount >= 8) {
    skillScore += 12;
    skillPassed.push(`Robust keyword index: ${skillCount} professional skills declared`);
  } else if (skillCount >= 4) {
    skillScore += 7;
    skillPassed.push(`${skillCount} skills found (recommend 8-12 for optimal keyword matching)`);
  } else if (skillCount > 0) {
    skillScore += 3;
    skillFailed.push(`Only ${skillCount} skill(s) listed; ATS keyword matching requires a broader skill set`);
  } else {
    skillFailed.push("No skills listed. ATS engines index skills heavily for match ranking");
  }

  // Education presence
  if (edu.length > 0) {
    skillScore += 8;
    skillPassed.push(`${edu.length} education credential(s) listed with degrees and institutions`);
  } else {
    skillFailed.push("Education credentials missing (frequently required by ATS baseline filters)");
  }

  // Overall Score Calculation (0 - 100)
  const totalScore = Math.min(100, Math.round(contactScore + summaryScore + expScore + verbScore + skillScore));

  let grade = "C";
  let status = "needs_work";
  let gradeLabel = "Needs Optimization";

  if (totalScore >= 85) {
    grade = "A+";
    status = "good";
    gradeLabel = "ATS Benchmark Ready";
  } else if (totalScore >= 72) {
    grade = "B+";
    status = "good";
    gradeLabel = "Competitive ATS Match";
  } else if (totalScore >= 55) {
    grade = "C";
    status = "needs_work";
    gradeLabel = "Partially Optimized";
  } else {
    grade = "D";
    status = "fail";
    gradeLabel = "High ATS Rejection Risk";
  }

  // Compile top prioritized action items
  const actionItems = [
    ...contactFailed,
    ...summaryFailed,
    ...expFailed,
    ...verbFailed,
    ...skillFailed
  ].slice(0, 5);

  const categories = [
    {
      id: "contact",
      title: "Contact & Parser Readiness",
      score: contactScore,
      maxScore: 20,
      status: contactScore >= 16 ? "good" : contactScore >= 10 ? "needs_work" : "fail",
      passed: contactPassed,
      suggestions: contactFailed
    },
    {
      id: "summary",
      title: "Summary & Target Headline",
      score: summaryScore,
      maxScore: 15,
      status: summaryScore >= 12 ? "good" : summaryScore >= 7 ? "needs_work" : "fail",
      passed: summaryPassed,
      suggestions: summaryFailed
    },
    {
      id: "experience",
      title: "Work Experience & Quantifiable Impact",
      score: expScore,
      maxScore: 25,
      status: expScore >= 20 ? "good" : expScore >= 12 ? "needs_work" : "fail",
      passed: expPassed,
      suggestions: expFailed
    },
    {
      id: "verbs",
      title: "Action Verbs & Vocabulary Strength",
      score: verbScore,
      maxScore: 20,
      status: verbScore >= 15 ? "good" : verbScore >= 10 ? "needs_work" : "fail",
      passed: verbPassed,
      suggestions: verbFailed
    },
    {
      id: "skills",
      title: "Skills & Education Keyword Density",
      score: skillScore,
      maxScore: 20,
      status: skillScore >= 16 ? "good" : skillScore >= 10 ? "needs_work" : "fail",
      passed: skillPassed,
      suggestions: skillFailed
    }
  ];

  let summaryText = "";
  if (totalScore >= 85) {
    summaryText = "Your CV strongly aligns with modern ATS parsing standards. Structure, keywords, and quantifiable achievements are well-positioned to pass automated recruiter screening.";
  } else if (totalScore >= 70) {
    summaryText = "Solid ATS foundation. Implementing a few additional quantifiable metrics and power action verbs will push your CV into the top candidate tier.";
  } else {
    summaryText = "Your CV has key ATS gaps (missing metrics, contact details, or keyword density) that may cause automated screening parsers to rank it lower.";
  }

  return {
    overallScore: totalScore,
    grade,
    gradeLabel,
    status,
    summary: summaryText,
    categories,
    actionItems,
    stats: {
      actionVerbsCount: detectedActionVerbs.length,
      sampleVerbs: detectedActionVerbs.slice(0, 6),
      skillsCount: skillCount,
      experienceCount: exp.length
    }
  };
}
