/**
 * Comprehensive ATS & Structure CV Checker
 * Evaluates CV content, formatting, sections, contact details, and ATS parsability.
 */

export function analyzeCvContent({ text = "", file = null, cvData = null }) {
  const issues = [];
  const passes = [];
  let score = 70; // baseline

  const cleanText = text.toLowerCase();

  // 1. File Size & Format Check
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      issues.push({
        type: "warning",
        category: "File Format",
        title: "File Size is over 2MB",
        description: `Your CV is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Many job portals and ATS systems reject files over 2MB. Use our Compress PDF tool.`,
        fixAction: "/tools/compress-pdf",
        fixLabel: "Compress PDF"
      });
      score -= 8;
    } else {
      passes.push({
        category: "File Format",
        title: "Optimal File Size",
        description: `File size is ${(file.size / 1024).toFixed(0)}KB, well within ATS upload limits.`
      });
      score += 4;
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && !file.name.toLowerCase().endsWith(".docx")) {
      issues.push({
        type: "critical",
        category: "File Format",
        title: "Non-standard file format",
        description: "Submit your CV in standard PDF or DOCX format for maximum ATS readability."
      });
      score -= 15;
    }
  }

  // 2. Parsable Text / Scanned Image Check
  if (text.length < 150) {
    issues.push({
      type: "critical",
      category: "ATS Readability",
      title: "Scanned or Image-Only CV Detected",
      description: "Very little selectable text was found in your document. ATS robots cannot read text locked inside images or raster scans. We recommend building a native vector PDF using our CV Builder.",
      fixAction: "/builder",
      fixLabel: "Open CV Builder"
    });
    score -= 30;
  } else {
    passes.push({
      category: "ATS Readability",
      title: "Text is ATS Parsable",
      description: "Document contains live selectable text that applicant tracking systems can easily index."
    });
    score += 8;
  }

  // 3. Contact Information Check
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;

  const hasEmail = emailRegex.test(text) || Boolean(cvData?.personal?.email);
  const hasPhone = phoneRegex.test(text) || Boolean(cvData?.personal?.phone);
  const hasLinkedin = linkedinRegex.test(text) || Boolean(cvData?.personal?.linkedin);

  if (hasEmail) {
    passes.push({
      category: "Contact Info",
      title: "Email Address Present",
      description: "Recruiters and automated confirmation emails have a direct contact address."
    });
    score += 5;
  } else {
    issues.push({
      type: "critical",
      category: "Contact Info",
      title: "Missing Email Address",
      description: "No clear email address was detected. Ensure your contact email is clearly visible at the top."
    });
    score -= 15;
  }

  if (hasPhone) {
    passes.push({
      category: "Contact Info",
      title: "Phone Number Detected",
      description: "Phone number with standard formatting found."
    });
    score += 4;
  } else {
    issues.push({
      type: "warning",
      category: "Contact Info",
      title: "Missing Phone Number",
      description: "Include a direct phone number with your country code for phone screen invitations."
    });
    score -= 8;
  }

  if (hasLinkedin) {
    passes.push({
      category: "Contact Info",
      title: "Professional Profile Link Included",
      description: "Found LinkedIn or portfolio URL to substantiate your work history."
    });
    score += 4;
  } else {
    issues.push({
      type: "info",
      category: "Contact Info",
      title: "No LinkedIn or Portfolio URL",
      description: "Adding your LinkedIn profile or GitHub link increases employer trust and response rates."
    });
  }

  // 4. Core Sections Check
  const sections = [
    { name: "Experience / Work History", regex: /(experience|work history|employment|career history)/i },
    { name: "Education", regex: /(education|academic|university|degree|qualifications)/i },
    { name: "Skills", regex: /(skills|technical skills|core competencies|expertise|tools)/i },
    { name: "Professional Summary", regex: /(summary|profile|about me|objective)/i }
  ];

  sections.forEach((s) => {
    if (s.regex.test(text)) {
      passes.push({
        category: "Sections",
        title: `Found ${s.name} section`,
        description: `Standard ATS header for ${s.name} is clearly recognized.`
      });
      score += 4;
    } else {
      issues.push({
        type: "warning",
        category: "Sections",
        title: `Missing or Non-Standard ${s.name}`,
        description: `Consider using the explicit section title "${s.name.split(" / ")[0]}" to help automated parsers categorize your details.`
      });
      score -= 6;
    }
  });

  // 5. Quantified Achievements & Action Verbs
  const metricRegex = /(\d+%\s*|\$\d+|\d+\s*percent|\b[1-9]\d{0,3}\b\s*(users|clients|customers|projects|leads|sales|revenue|engineers|team members|hours))/i;
  const actionVerbsRegex = /(led|spearheaded|developed|built|managed|increased|reduced|optimized|delivered|implemented|engineered|designed|launched|scaled)/i;

  if (metricRegex.test(text)) {
    passes.push({
      category: "Impact & Metrics",
      title: "Quantified Achievements Included",
      description: "Found numeric metrics, percentages, or measurable indicators showing tangible impact."
    });
    score += 8;
  } else {
    issues.push({
      type: "warning",
      category: "Impact & Metrics",
      title: "Few or No Quantified Metrics",
      description: "Recruiters prioritize results over lists of duties. Try adding numbers (e.g., 'Reduced turnaround time by 30%', 'Managed team of 6', 'Delivered 12 client projects')."
    });
    score -= 7;
  }

  if (actionVerbsRegex.test(text)) {
    passes.push({
      category: "Action Verbs",
      title: "Strong Action Verbs Used",
      description: "Your bullet points utilize decisive verbs (e.g. Led, Built, Reduced, Engineered) instead of passive descriptions."
    });
    score += 4;
  }

  // 6. Word Count Check
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 100 && wordCount < 300) {
    issues.push({
      type: "info",
      category: "Length",
      title: "Relatively Brief CV Content",
      description: `Document has ~${wordCount} words. For experienced roles, 400–800 words across 1–2 pages provides more depth.`
    });
  } else if (wordCount > 1400) {
    issues.push({
      type: "warning",
      category: "Length",
      title: "CV May Be Too Long",
      description: `Document contains ~${wordCount} words (~3+ pages). Recruiters typically spend 7 seconds on initial screening; aim for 1-2 focused pages.`
    });
    score -= 5;
  } else if (wordCount >= 300 && wordCount <= 1200) {
    passes.push({
      category: "Length",
      title: "Ideal Length (~1-2 Pages)",
      description: `Document contains ~${wordCount} words, right in the optimal range for ATS and hiring managers.`
    });
    score += 6;
  }

  const finalScore = Math.min(98, Math.max(25, score));

  return {
    score: finalScore,
    wordCount,
    issues,
    passes,
    isAtsCompliant: finalScore >= 75 && text.length > 200,
    hasCriticalIssues: issues.some((i) => i.type === "critical")
  };
}
