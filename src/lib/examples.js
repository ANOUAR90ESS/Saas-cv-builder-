import { createEmptyCV, uid } from "./cvSchema";

// Fictional example CVs across professions. No real personal data.
export const EXAMPLES = [
  build({
    id: "developer",
    name: "Marcus Lin",
    title: "Full-Stack Developer",
    template: "modern",
    summary: "Full-stack developer with 6 years building performant web apps in TypeScript, React and Node. I care about clean architecture, accessibility and shipping fast.",
    experience: [
      { job_title: "Senior Software Engineer", company: "Brightloop", location: "Remote", start_date: "2021-04", end_date: "", current: true, bullet_points: ["Architected a real-time collaboration layer serving 40k concurrent users.", "Cut p95 API latency from 480ms to 120ms via query and caching overhaul.", "Mentored 4 engineers and led the migration to a typed design system."] },
      { job_title: "Software Engineer", company: "Tidewave", location: "Porto", start_date: "2018-02", end_date: "2021-03", current: false, bullet_points: ["Shipped 30+ features across the core product with 98% test coverage.", "Introduced CI pipelines that reduced release time from 2 days to 20 minutes."] },
    ],
    education: [{ degree: "B.Sc. Computer Science", institution: "University of Porto", location: "Porto", start_date: "2013", end_date: "2017" }],
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL"],
    languages: ["English (Fluent)", "Portuguese (Native)"],
    projects: [{ name: "OpenLog", description: "Open-source structured logging library for Node.", technologies: "TypeScript, Pino", url: "github.com/marcus/openlog" }],
  }),
  build({
    id: "designer",
    name: "Sofia Reyes",
    title: "Product Designer",
    template: "creative",
    summary: "Product designer pairing systems thinking with craft. I help teams ship intuitive products backed by research and a strong design system.",
    experience: [
      { job_title: "Lead Product Designer", company: "Mosaic", location: "Madrid", start_date: "2020-01", end_date: "", current: true, bullet_points: ["Led end-to-end design of a B2B dashboard used by 12k businesses.", "Built a 90-component design system adopted by 5 squads."] },
    ],
    education: [{ degree: "B.A. Design", institution: "IE University", location: "Madrid", start_date: "2012", end_date: "2016" }],
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "HTML/CSS"],
    languages: ["Spanish (Native)", "English (Fluent)"],
    projects: [{ name: "Palette", description: "Accessible color token generator.", technologies: "Figma, TypeScript" }],
  }),
  build({
    id: "student",
    name: "Tomás Almeida",
    title: "Computer Science Student",
    template: "minimal",
    summary: "Motivated CS student seeking a software engineering internship. Strong fundamentals in algorithms and web development, with project experience outside coursework.",
    experience: [
      { job_title: "Teaching Assistant", company: "University of Coimbra", location: "Coimbra", start_date: "2023-09", end_date: "", current: true, bullet_points: ["Led weekly lab sessions for 60 first-year students in data structures."] },
    ],
    education: [{ degree: "B.Sc. Computer Science (in progress)", institution: "University of Coimbra", location: "Coimbra", start_date: "2022", end_date: "2025" }],
    skills: ["Python", "Java", "Git", "SQL", "Linux"],
    languages: ["Portuguese (Native)", "English (Advanced)"],
    projects: [{ name: "StudyBuddy", description: "P2P study scheduling app built during a hackathon (2nd place).", technologies: "React, Firebase" }],
  }),
  build({
    id: "manager",
    name: "Diane Foster",
    title: "Engineering Manager",
    template: "executive",
    summary: "Engineering manager with 10+ years leading distributed teams that deliver reliable software at scale. I focus on people, clarity and sustainable pace.",
    experience: [
      { job_title: "Engineering Manager", company: "Northwind", location: "Dublin", start_date: "2019-06", end_date: "", current: true, bullet_points: ["Grew a team from 4 to 14 engineers while keeping engagement in the top quartile.", "Reduced incident rate by 60% through reliability investments and on-call reform."] },
    ],
    education: [{ degree: "B.Eng. Software", institution: "Trinity College Dublin", location: "Dublin", start_date: "2010", end_date: "2014" }],
    skills: ["Team Leadership", "Roadmapping", "Hiring", "Agile Delivery", "OKRs"],
    languages: ["English (Native)"],
  }),
  build({
    id: "marketer",
    name: "Priya Nair",
    title: "Digital Marketing Manager",
    template: "professional",
    summary: "Data-driven marketing manager specialising in growth, content and lifecycle campaigns for SaaS. I turn analytics into pipeline.",
    experience: [
      { job_title: "Marketing Manager", company: "Lumen", location: "London", start_date: "2020-03", end_date: "", current: true, bullet_points: ["Grew qualified leads 3x in 18 months through SEO and lifecycle automation.", "Managed a $500k annual budget with 4.2x ROAS."] },
    ],
    education: [{ degree: "B.A. Marketing", institution: "KCL", location: "London", start_date: "2013", end_date: "2016" }],
    skills: ["SEO", "Google Ads", "HubSpot", "Content Strategy", "Analytics"],
    languages: ["English (Fluent)", "Hindi (Native)"],
  }),
  build({
    id: "accountant",
    name: "Henrik Olsen",
    title: "Senior Accountant",
    template: "ats",
    summary: "Certified accountant with 8 years in audit and financial reporting. Detail-oriented and reliable under tight deadlines.",
    experience: [
      { job_title: "Senior Accountant", company: "NordLedger", location: "Copenhagen", start_date: "2019-08", end_date: "", current: true, bullet_points: ["Managed month-end close for 6 entities with zero material adjustments.", "Implemented automated reconciliations saving 30 hours monthly."] },
    ],
    education: [{ degree: "M.Sc. Accounting", institution: "Copenhagen Business School", location: "Copenhagen", start_date: "2013", end_date: "2015" }],
    skills: ["IFRS", "Excel", "SAP", "Audit", "Financial Reporting"],
    languages: ["Danish (Native)", "English (Fluent)"],
  }),
];

function build({ id, name, title, template, summary, experience, education, skills, languages, projects = [] }) {
  const cv = createEmptyCV();
  cv.id = "ex-" + id;
  cv.title = `${name} — ${title}`;
  cv.template_id = template;
  cv.personal_info = {
    full_name: name,
    professional_title: title,
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    photo: "",
  };
  cv.summary = summary;
  cv.experience = experience.map((e) => ({ id: uid(), bullet_points: ["", ""], ...e }));
  cv.education = education.map((e) => ({ id: uid(), ...e }));
  cv.skills = skills.map((s) => ({ id: uid(), name: s, level: "Advanced" }));
  cv.languages = languages.map((l) => {
    const [name, level] = l.split(" (");
    return { id: uid(), name, level: (level || "Fluent)").replace(")", "") };
  });
  cv.projects = projects.map((p) => ({ id: uid(), ...p }));
  return cv;
}