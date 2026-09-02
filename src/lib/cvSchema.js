// Central CV data model. All templates consume this shape.
// Keeping it in one place makes the brand rename + future features trivial.

export const SECTION_KEYS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "languages",
  "certifications",
  "awards",
  "courses",
  "volunteer",
  "interests",
  "references",
];

export const SECTION_LABELS_BY_LANG = {
  en: { contact: "Contact", summary: "Professional Summary", experience: "Work Experience", education: "Education", skills: "Skills", projects: "Projects", languages: "Languages", certifications: "Certifications", awards: "Awards", courses: "Courses", volunteer: "Volunteer Experience", interests: "Interests", references: "References" },
  es: { contact: "Contacto", summary: "Resumen Profesional", experience: "Experiencia Laboral", education: "Educación", skills: "Habilidades", projects: "Proyectos", languages: "Idiomas", certifications: "Certificaciones", awards: "Premios", courses: "Cursos", volunteer: "Experiencia Voluntaria", interests: "Intereses", references: "Referencias" },
  fr: { contact: "Contact", summary: "Résumé Professionnel", experience: "Expérience Professionnelle", education: "Éducation", skills: "Compétences", projects: "Projets", languages: "Langues", certifications: "Certifications", awards: "Prix", courses: "Cours", volunteer: "Expérience Bénévole", interests: "Centres d'intérêt", references: "Références" },
  ar: { contact: "معلومات التواصل", summary: "الملخّص المهني", experience: "الخبرة العملية", education: "التعليم", skills: "المهارات", projects: "المشاريع", languages: "اللغات", certifications: "الشهادات", awards: "الجوائز", courses: "الدورات", volunteer: "العمل التطوعي", interests: "الاهتمامات", references: "المراجع" },
};

let _activeCvLang = "en";
export function setActiveCvLang(lang) { _activeCvLang = SECTION_LABELS_BY_LANG[lang] ? lang : "en"; }
export function getActiveCvLang() { return _activeCvLang; }
export function cvLangDir(lang) { return lang === "ar" ? "rtl" : "ltr"; }

// Localized section labels resolved against the active CV language (set by
// TemplateRenderer before rendering). Templates read SECTION_LABELS as before.
export const SECTION_LABELS = new Proxy(
  {},
  {
    get(_target, key) {
      if (typeof key === "symbol") return undefined;
      const dict = SECTION_LABELS_BY_LANG[_activeCvLang] || SECTION_LABELS_BY_LANG.en;
      return key in dict ? dict[key] : SECTION_LABELS_BY_LANG.en[key] || key;
    },
  }
);

export const FONT_OPTIONS = [
  { id: "inter", label: "Inter", stack: "'Inter', sans-serif" },
  { id: "poppins", label: "Poppins", stack: "'Poppins', sans-serif" },
  { id: "montserrat", label: "Montserrat", stack: "'Montserrat', sans-serif" },
  { id: "manrope", label: "Manrope", stack: "'Manrope', sans-serif" },
  { id: "outfit", label: "Outfit", stack: "'Outfit', sans-serif" },
  { id: "archivo", label: "Archivo", stack: "'Archivo', sans-serif" },
  { id: "spacegrotesk", label: "Space Grotesk", stack: "'Space Grotesk', sans-serif" },
  { id: "bricolage", label: "Bricolage", stack: "'Bricolage Grotesque', sans-serif" },
  { id: "serif", label: "Source Serif", stack: "'Source Serif 4', Georgia, serif" },
  { id: "lora", label: "Lora", stack: "'Lora', Georgia, serif" },
  { id: "fraunces", label: "Fraunces", stack: "'Fraunces', Georgia, serif" },
  { id: "dmserif", label: "DM Serif", stack: "'DM Serif Display', Georgia, serif" },
  { id: "playfair", label: "Playfair Display", stack: "'Playfair Display', Georgia, serif" },
  { id: "mono", label: "JetBrains Mono", stack: "'JetBrains Mono', monospace" },
];

export const COLOR_OPTIONS = [
  { id: "indigo", hex: "#4f46e5" },
  { id: "violet", hex: "#7c3aed" },
  { id: "blue", hex: "#2563eb" },
  { id: "teal", hex: "#0d9488" },
  { id: "emerald", hex: "#059669" },
  { id: "rose", hex: "#e11d48" },
  { id: "amber", hex: "#d97706" },
  { id: "slate", hex: "#334155" },
  { id: "black", hex: "#111827" },
];

// Levels are stored as these canonical English strings — they are data, and
// rewriting them per language would break every CV already saved. Only the
// display is translated, via levelLabel below.
export const LANGUAGE_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const LEVEL_LABELS = {
  en: { Native: "Native", Fluent: "Fluent", Advanced: "Advanced", Intermediate: "Intermediate", Basic: "Basic", Beginner: "Beginner", Expert: "Expert" },
  es: { Native: "Nativo", Fluent: "Fluido", Advanced: "Avanzado", Intermediate: "Intermedio", Basic: "Básico", Beginner: "Principiante", Expert: "Experto" },
  fr: { Native: "Natif", Fluent: "Courant", Advanced: "Avancé", Intermediate: "Intermédiaire", Basic: "Notions", Beginner: "Débutant", Expert: "Expert" },
  ar: { Native: "لغة أم", Fluent: "طلاقة", Advanced: "متقدّم", Intermediate: "متوسّط", Basic: "أساسي", Beginner: "مبتدئ", Expert: "خبير" },
};

/** Display text for a stored level, in the given language. */
export function levelLabel(level, lang = "en") {
  const dict = LEVEL_LABELS[lang] || LEVEL_LABELS.en;
  return dict[level] || level || "";
}

/** Reverse of levelLabel: the canonical value behind a displayed label. */
export function levelValue(label, lang = "en") {
  const dict = LEVEL_LABELS[lang] || LEVEL_LABELS.en;
  const hit = Object.entries(dict).find(([, v]) => v === label);
  return hit ? hit[0] : label;
}
export const SKILL_DISPLAY_OPTIONS = [
  { id: "bar", label: "Progress bar" },
  { id: "stars", label: "Star rating" },
  { id: "dots", label: "Dots" },
  { id: "label", label: "Text label" },
  { id: "none", label: "None" },
];

export const uid = () => Math.random().toString(36).slice(2, 10);

export function emptyItem(kind) {
  switch (kind) {
    case "experience":
      return { id: uid(), job_title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "", bullet_points: [""] };
    case "education":
      return { id: uid(), degree: "", institution: "", location: "", start_date: "", end_date: "", description: "" };
    case "skills":
      return { id: uid(), name: "", level: "Intermediate" };
    case "languages":
      return { id: uid(), name: "", level: "Fluent" };
    case "projects":
      return { id: uid(), name: "", description: "", url: "", technologies: "" };
    case "certifications":
      return { id: uid(), name: "", organization: "", date: "", url: "" };
    case "awards":
      return { id: uid(), name: "", organization: "", date: "", description: "" };
    case "courses":
      return { id: uid(), name: "", organization: "", date: "" };
    case "volunteer":
      return { id: uid(), role: "", organization: "", location: "", start_date: "", end_date: "", description: "" };
    case "references":
      return { id: uid(), name: "", relationship: "", contact: "" };
    default:
      return { id: uid() };
  }
}

// `lang` sets the language of the CV itself — the section headings printed on
// the document, and its text direction. It defaults to the language the user is
// reading the app in, which is almost always the language they are writing in,
// and stays changeable per CV from the Design panel.
export function createEmptyCV(lang = "en") {
  return {
    id: uid(),
    title: "Untitled CV",
    template_id: "modern",
    language: SECTION_LABELS_BY_LANG[lang] ? lang : "en",
    tags: [],
    personal_info: {
      full_name: "",
      professional_title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      photo: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    awards: [],
    courses: [],
    volunteer: [],
    interests: [],
    references: [],
    section_order: [...SECTION_KEYS],
    enabled_sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, true])),
    theme: { primary_color: "#4f46e5", font_id: "inter", skill_display: "bar" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function createDemoCV(lang = "en") {
  const base = createEmptyCV(lang);
  // Marks the CV as sample content nobody has edited yet, so the app can tell
  // "the user has not started" from "the user wrote this".
  base.is_demo = true;
  base.title = "Elena Marston — Product Designer";
  base.template_id = "modern";
  base.personal_info = {
    full_name: "Elena Marston",
    professional_title: "Senior Product Designer",
    email: "elena.marston@example.com",
    phone: "+1 (415) 555-0182",
    location: "Lisbon, Portugal",
    website: "elenamarston.design",
    linkedin: "linkedin.com/in/elenamarston",
    github: "github.com/elenamarston",
    photo: "",
  };
  base.summary =
    "Senior Product Designer with 8+ years crafting human-centred digital products for fintech and SaaS. I translate ambiguous problems into clear, measurable experiences, leading research, design systems and cross-functional delivery from concept to ship.";
  base.experience = [
    {
      id: uid(),
      job_title: "Senior Product Designer",
      company: "Northwind Labs",
      location: "Lisbon (Remote)",
      start_date: "2021-03",
      end_date: "",
      current: true,
      description: "",
      bullet_points: [
        "Led the redesign of the core onboarding flow, lifting activation by 34% and reducing time-to-value from 9 to 3 days.",
        "Built and maintained a 120-component design system adopted by 4 product teams.",
        "Mentored 3 mid-level designers and established weekly critique rituals.",
      ],
    },
    {
      id: uid(),
      job_title: "Product Designer",
      company: "Cobalt Finance",
      location: "Berlin",
      start_date: "2018-06",
      end_date: "2021-02",
      current: false,
      description: "",
      bullet_points: [
        "Designed a self-serve dashboard that cut support tickets by 41% within two quarters.",
        "Ran 60+ usability sessions to validate a new payments experience adopted by 200k users.",
      ],
    },
  ];
  base.education = [
    {
      id: uid(),
      degree: "B.A. in Interaction Design",
      institution: "University of the Arts London",
      location: "London, UK",
      start_date: "2013",
      end_date: "2016",
      description: "First-class honours. Thesis on accessible mobile banking.",
    },
  ];
  base.skills = [
    { id: uid(), name: "Product Design", level: "Expert" },
    { id: uid(), name: "Design Systems", level: "Expert" },
    { id: uid(), name: "Figma", level: "Expert" },
    { id: uid(), name: "User Research", level: "Advanced" },
    { id: uid(), name: "Prototyping", level: "Advanced" },
    { id: uid(), name: "HTML & CSS", level: "Intermediate" },
  ];
  base.languages = [
    { id: uid(), name: "English", level: "Fluent" },
    { id: uid(), name: "Portuguese", level: "Native" },
    { id: uid(), name: "German", level: "Intermediate" },
  ];
  base.projects = [
    {
      id: uid(),
      name: "Atlas Design Tokens",
      description: "Open-source token pipeline syncing Figma variables to code.",
      url: "github.com/elenamarston/atlas",
      technologies: "Figma, Style Dictionary, TypeScript",
    },
  ];
  base.certifications = [
    { id: uid(), name: "Nielsen Norman UX Certification", organization: "NN/g", date: "2022", url: "" },
  ];
  base.interests = ["Trail running", "Film photography", "Type design"];
  base.section_order = ["summary", "experience", "projects", "education", "skills", "languages", "certifications", "interests"];
  base.enabled_sections = Object.fromEntries(SECTION_KEYS.map((k) => [k, true]));
  base.theme = { primary_color: "#4f46e5", font_id: "inter", skill_display: "bar" };
  return base;
}