// Genuinely useful guide content (not keyword-stuffed).
export const GUIDES = [
  {
    slug: "how-to-write-a-cv",
    title: "How to write a CV",
    excerpt: "A clear, practical walkthrough of every section a modern CV needs.",
    body: [
      "A strong CV is a marketing document, not an autobiography. Its job is to get you an interview — so every line should earn its place.",
      "Start with your contact details: name, professional title, email, phone, location and a link to your portfolio or LinkedIn. Keep them at the top so a recruiter can reach you in one glance.",
      "Write a 2–3 sentence professional summary that positions you: who you are, what you do well, and the value you bring. Tailor it to the role.",
      "For experience, lead with achievements not duties. Use action verbs and quantify results wherever possible — 'increased activation by 34%' beats 'responsible for onboarding'.",
      "List education, skills and languages clearly. Include projects or certifications if they strengthen your case, especially early in your career.",
      "Keep it to one or two pages, use a clean template, and proofread. Then export a PDF and send.",
    ],
  },
  {
    slug: "how-to-write-a-cv-with-no-experience",
    title: "How to write a CV with no experience",
    excerpt: "You have more to show than you think — here's how to frame it.",
    body: [
      "When you lack formal experience, lead with potential. A summary that communicates motivation and direction sets the tone.",
      "Put education first, and highlight relevant coursework, projects and academic achievements. Projects are experience — a hackathon, a class app or a side build all count.",
      "Add a skills section with the tools and technologies you've learned. Be honest about your level; 'familiar' is fine.",
      "Include volunteer work, clubs and part-time roles. They demonstrate reliability, teamwork and communication.",
      "Keep it to one page and focus on transferable skills. Recruiters hiring juniors care about attitude and aptitude as much as experience.",
    ],
  },
  {
    slug: "how-to-write-a-professional-summary",
    title: "How to write a professional summary",
    excerpt: "Three sentences that make recruiters want to keep reading.",
    body: [
      "Your summary sits at the top of your CV, so it carries disproportionate weight. Aim for 2–3 sentences that answer: who you are, what you specialise in, and the impact you create.",
      "Avoid generic buzzwords ('team player', 'results-driven'). Instead, be specific: 'Senior designer with 8 years shipping fintech products used by 200k people.'",
      "Tailor the summary to the role you're applying for. A small tweak per application is worth it.",
      "Write it last, once the rest of your CV is done — it's easier to summarise work you can see.",
    ],
  },
  {
    slug: "ats-friendly-cv",
    title: "How to write an ATS-friendly CV",
    excerpt: "Make sure automated systems can actually read your CV.",
    body: [
      "Applicant Tracking Systems (ATS) parse your CV before a human sees it. If they can't read it, you won't be considered — no matter how good you are.",
      "Use a simple, single-column layout. Avoid text inside images, headers/footers, or complex tables that parsers struggle with.",
      "Use standard section headings: Experience, Education, Skills. Don't get creative with names like 'My journey'.",
      "Mirror keywords from the job description naturally — in your skills and experience, not stuffed into a hidden block.",
      "Export as PDF unless the employer specifically asks for .docx. DexaCV's ATS template is designed to parse cleanly.",
    ],
  },
  {
    slug: "cv-for-students",
    title: "CV for students",
    excerpt: "Build a student CV that opens doors to internships and first roles.",
    body: [
      "As a student, your CV should emphasise learning, projects and potential. Lead with education and include relevant coursework.",
      "Projects are your strongest asset — describe what you built, the technologies used, and the outcome. A GitHub link helps.",
      "Include part-time work, volunteering and extracurriculars. They show reliability and soft skills.",
      "Keep it to one page. Recruiters reviewing junior applications expect concise, focused CVs.",
    ],
  },
  {
    slug: "cv-for-developers",
    title: "CV for developers",
    excerpt: "How to present technical experience without overwhelming recruiters.",
    body: [
      "Lead with a short summary and a skills section grouped by category (languages, frameworks, tools). Recruiters scan these first.",
      "For each role, describe the product and your impact, then list 3–5 achievement-focused bullets. Quantify where you can.",
      "Include a projects section with links. Open-source contributions and side projects signal genuine interest.",
      "Link your GitHub and portfolio. Make sure what's there is clean and readable.",
    ],
  },
  {
    slug: "cv-for-designers",
    title: "CV for designers",
    excerpt: "Balance a clean CV with a portfolio that does the talking.",
    body: [
      "Your CV should be well-designed but readable. Use restraint — a recruiter needs to parse it quickly.",
      "Lead with a summary, then experience. For each role, describe the product, your scope, and measurable outcomes.",
      "Link your portfolio prominently. The CV gets you to the portfolio; the portfolio gets you the interview.",
      "Mention the tools you use and any design systems you've built or contributed to.",
    ],
  },
];

export function getGuide(slug) {
  return GUIDES.find((g) => g.slug === slug);
}