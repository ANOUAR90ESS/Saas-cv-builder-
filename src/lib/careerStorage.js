// Local-first persistent storage for DexaCV Career Features.
// Works seamlessly without an account, with optional Firestore synchronization.

import { loadAllCVs, getActiveId } from "./cvStorage";
import { getDb, auth } from "./firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const APPS_KEY = "dexacv.applications.v1";
const MATCHES_KEY = "dexacv.matches.v1";
const COVER_LETTERS_KEY = "dexacv.coverletters.v1";
const INTERVIEWS_KEY = "dexacv.interviews.v1";
const PROFILE_KEY = "dexacv.careerprofile.v1";
const PORTFOLIO_KEY = "dexacv.portfolioprojects.v1";

const uid = () => Math.random().toString(36).slice(2, 10);

// Demo seed applications for immediate interactivity
const DEFAULT_APPLICATIONS = [
  {
    id: "app_linear_1",
    company: "Linear",
    jobTitle: "Product Engineer (Frontend)",
    location: "Remote",
    salary: "$140,000 - $175,000",
    jobUrl: "https://linear.app/careers",
    applicationDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    status: "Interview",
    interviewDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    contactPerson: "Sarah Jenkins (Head of Engineering)",
    notes: "Technical interview scheduled. Prepare questions about component sync and keyboard-first UI.",
    followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_vercel_2",
    company: "Vercel",
    jobTitle: "Senior Web Developer",
    location: "San Francisco / Remote",
    salary: "$160,000 - $190,000",
    jobUrl: "https://vercel.com/careers",
    applicationDate: new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10),
    status: "Screening",
    interviewDate: "",
    contactPerson: "Alex Rivera (Recruiter)",
    notes: "Passed initial resume review. Recruiter screening call scheduled next Tuesday.",
    followUpDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_stripe_3",
    company: "Stripe",
    jobTitle: "Frontend Platform Engineer",
    location: "Dublin / Hybrid",
    salary: "€110,000 - €135,000",
    jobUrl: "https://stripe.com/jobs",
    applicationDate: new Date(Date.now() - 18 * 86400000).toISOString().slice(0, 10),
    status: "Offer",
    interviewDate: "",
    contactPerson: "Emma Watson (Talent Lead)",
    notes: "Received formal offer letter. Reviewing compensation package and equity vesting.",
    followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_github_4",
    company: "GitHub",
    jobTitle: "UI Systems Developer",
    location: "Remote",
    salary: "$130,000 - $160,000",
    jobUrl: "https://github.com/about/careers",
    applicationDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    status: "Applied",
    interviewDate: "",
    contactPerson: "",
    notes: "Submitted tailored CV and cover letter highlighting accessibility and design tokens.",
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_figma_5",
    company: "Figma",
    jobTitle: "Design Systems Engineer",
    location: "San Francisco, CA",
    salary: "$170,000 - $210,000",
    jobUrl: "https://figma.com/careers",
    applicationDate: "",
    status: "Saved",
    interviewDate: "",
    contactPerson: "",
    notes: "Bookmarked role. Need to polish portfolio before applying.",
    followUpDate: "",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed sample job matches for dashboard
const DEFAULT_MATCHES = [
  {
    id: "match_1",
    jobTitle: "Software Engineer",
    company: "Linear",
    matchScore: 94,
    date: new Date().toISOString(),
    matchingSkills: ["React", "JavaScript", "REST APIs", "Git"],
    missingSkills: ["GraphQL"]
  },
  {
    id: "match_2",
    jobTitle: "Frontend Developer",
    company: "Vercel",
    matchScore: 91,
    date: new Date(Date.now() - 86400000).toISOString(),
    matchingSkills: ["React", "Tailwind CSS", "TypeScript", "Next.js"],
    missingSkills: ["Edge Middleware"]
  },
  {
    id: "match_3",
    jobTitle: "React Developer",
    company: "Remote Work Inc",
    matchScore: 88,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    matchingSkills: ["React", "State Management", "Component Design"],
    missingSkills: ["Docker"]
  }
];

// ------------------------------------------------------------- APPLICATIONS

export function getApplications() {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) {
      localStorage.setItem(APPS_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_APPLICATIONS;
  } catch {
    return DEFAULT_APPLICATIONS;
  }
}

export function saveApplications(apps) {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
    return true;
  } catch {
    return false;
  }
}

export function addApplication(appData) {
  const apps = getApplications();
  const newApp = {
    id: appData.id || uid(),
    company: appData.company || "Unnamed Company",
    jobTitle: appData.jobTitle || "Role Title",
    location: appData.location || "",
    salary: appData.salary || "",
    jobUrl: appData.jobUrl || "",
    applicationDate: appData.applicationDate || new Date().toISOString().slice(0, 10),
    status: appData.status || "Saved",
    interviewDate: appData.interviewDate || "",
    contactPerson: appData.contactPerson || "",
    notes: appData.notes || "",
    followUpDate: appData.followUpDate || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  apps.unshift(newApp);
  saveApplications(apps);
  syncApplicationToFirestore(newApp).catch(() => {});
  return newApp;
}

export function updateApplication(id, updates) {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const updated = {
    ...apps[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  apps[idx] = updated;
  saveApplications(apps);
  syncApplicationToFirestore(updated).catch(() => {});
  return updated;
}

export function deleteApplication(id) {
  const apps = getApplications().filter((a) => a.id !== id);
  saveApplications(apps);
  deleteApplicationFromFirestore(id).catch(() => {});
  return apps;
}

export function getUpcomingReminders() {
  const apps = getApplications();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const twoWeeksLater = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);

  const reminders = [];

  apps.forEach((app) => {
    if (app.interviewDate) {
      reminders.push({
        id: `int_${app.id}`,
        appId: app.id,
        type: "interview",
        title: `Interview with ${app.company}`,
        subtitle: app.jobTitle,
        date: app.interviewDate,
        isOverdue: app.interviewDate < todayStr,
        isToday: app.interviewDate === todayStr,
        notes: app.notes,
        company: app.company
      });
    }
    if (app.followUpDate) {
      reminders.push({
        id: `fup_${app.id}`,
        appId: app.id,
        type: "followup",
        title: `Follow-up with ${app.company}`,
        subtitle: app.contactPerson || app.jobTitle,
        date: app.followUpDate,
        isOverdue: app.followUpDate < todayStr,
        isToday: app.followUpDate === todayStr,
        notes: app.notes,
        company: app.company
      });
    }
  });

  return reminders.sort((a, b) => (a.date > b.date ? 1 : -1));
}

// ------------------------------------------------------------- JOB MATCHES

export function getJobMatches() {
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    if (!raw) {
      localStorage.setItem(MATCHES_KEY, JSON.stringify(DEFAULT_MATCHES));
      return DEFAULT_MATCHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MATCHES;
  } catch {
    return DEFAULT_MATCHES;
  }
}

export function saveJobMatch(match) {
  const matches = getJobMatches().filter((m) => m.id !== match.id);
  const newMatch = {
    ...match,
    id: match.id || uid(),
    date: match.date || new Date().toISOString()
  };
  matches.unshift(newMatch);
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches.slice(0, 30)));
  } catch {}
  return newMatch;
}

export function deleteJobMatch(id) {
  const matches = getJobMatches().filter((m) => m.id !== id);
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  return matches;
}

// ------------------------------------------------------------- COVER LETTERS

export function getCoverLetters() {
  try {
    const raw = localStorage.getItem(COVER_LETTERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCoverLetter(letter) {
  const list = getCoverLetters().filter((l) => l.id !== letter.id);
  const newLetter = {
    ...letter,
    id: letter.id || uid(),
    date: letter.date || new Date().toISOString()
  };
  list.unshift(newLetter);
  localStorage.setItem(COVER_LETTERS_KEY, JSON.stringify(list));
  syncCoverLetterToFirestore(newLetter).catch(() => {});
  return newLetter;
}

export function deleteCoverLetter(id) {
  const list = getCoverLetters().filter((l) => l.id !== id);
  localStorage.setItem(COVER_LETTERS_KEY, JSON.stringify(list));
  deleteCoverLetterFromFirestore(id).catch(() => {});
  return list;
}

// ------------------------------------------------------------- INTERVIEWS

export function getInterviewSessions() {
  try {
    const raw = localStorage.getItem(INTERVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInterviewSession(session) {
  const sessions = getInterviewSessions().filter((s) => s.id !== session.id);
  const newSession = {
    ...session,
    id: session.id || uid(),
    date: session.date || new Date().toISOString()
  };
  sessions.unshift(newSession);
  localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(sessions));
  syncInterviewSessionToFirestore(newSession).catch(() => {});
  return newSession;
}

export function deleteInterviewSession(id) {
  const sessions = getInterviewSessions().filter((s) => s.id !== id);
  localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(sessions));
  return sessions;
}

// ------------------------------------------------------------- CAREER PROFILE

export function getCareerProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Construct initial profile from active CV
  const cvs = loadAllCVs() || [];
  const activeId = getActiveId();
  const activeCv = cvs.find((c) => c.id === activeId) || cvs[0] || {};
  const personal = activeCv.personal || {};

  const defaultUsername = (personal.full_name || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30) || "career-profile";

  const initialProfile = {
    username: defaultUsername,
    isPublished: false, // Default to private per requirements
    fullName: personal.full_name || "Alex Morgan",
    title: personal.professional_title || "Senior Software Engineer",
    summary:
      personal.summary ||
      "Passionate and results-driven engineer specializing in building high-performance, responsive web applications and scalable digital solutions.",
    photoURL: personal.photo || "",
    email: personal.email || "alex.morgan@example.com",
    phone: personal.phone || "+1 (555) 234-5678",
    location: personal.location || "San Francisco, CA",
    website: personal.website || "https://alexmorgan.dev",
    linkedin: personal.linkedin || "https://linkedin.com/in/alexmorgan",
    github: personal.github || "https://github.com/alexmorgan",
    portfolioUrl: "",
    skills: Array.isArray(activeCv.skills)
      ? activeCv.skills
      : [
          { id: "s1", name: "React", level: "Expert" },
          { id: "s2", name: "TypeScript", level: "Advanced" },
          { id: "s3", name: "Node.js", level: "Advanced" },
          { id: "s4", name: "Tailwind CSS", level: "Expert" },
          { id: "s5", name: "REST APIs", level: "Advanced" }
        ],
    experience: Array.isArray(activeCv.experience)
      ? activeCv.experience
      : [
          {
            id: "e1",
            job_title: "Senior Frontend Engineer",
            company: "TechFlow Labs",
            location: "San Francisco, CA",
            start_date: "2022",
            end_date: "Present",
            current: true,
            description: "Leading frontend architecture and building accessible component systems.",
            bullet_points: [
              "Engineered high-performance web applications using React and TypeScript.",
              "Reduced load times by 40% through code splitting and asset optimizations.",
              "Mentored junior engineers and led bi-weekly technical design reviews."
            ]
          }
        ],
    education: Array.isArray(activeCv.education)
      ? activeCv.education
      : [
          {
            id: "ed1",
            degree: "B.S. in Computer Science",
            institution: "University of California, Berkeley",
            location: "Berkeley, CA",
            start_date: "2018",
            end_date: "2022",
            description: "Specialized in Software Engineering and Distributed Systems."
          }
        ],
    certifications: Array.isArray(activeCv.certifications) ? activeCv.certifications : [],
    languages: Array.isArray(activeCv.languages) ? activeCv.languages : [{ id: "l1", name: "English", level: "Native" }],
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(initialProfile));
  return initialProfile;
}

export function saveCareerProfile(profile) {
  try {
    const stamped = {
      ...profile,
      username: (profile.username || "profile").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(stamped));
    syncCareerProfileToFirestore(stamped).catch(() => {});
    return stamped;
  } catch {
    return profile;
  }
}

export function importFromCvToProfile(cv) {
  if (!cv) return getCareerProfile();
  const current = getCareerProfile();
  const personal = cv.personal || {};

  const merged = {
    ...current,
    fullName: personal.full_name || current.fullName,
    title: personal.professional_title || current.title,
    summary: personal.summary || current.summary,
    photoURL: personal.photo || current.photoURL,
    email: personal.email || current.email,
    phone: personal.phone || current.phone,
    location: personal.location || current.location,
    website: personal.website || current.website,
    linkedin: personal.linkedin || current.linkedin,
    github: personal.github || current.github,
    skills: Array.isArray(cv.skills) && cv.skills.length ? cv.skills : current.skills,
    experience: Array.isArray(cv.experience) && cv.experience.length ? cv.experience : current.experience,
    education: Array.isArray(cv.education) && cv.education.length ? cv.education : current.education,
    certifications: Array.isArray(cv.certifications) && cv.certifications.length ? cv.certifications : current.certifications,
    languages: Array.isArray(cv.languages) && cv.languages.length ? cv.languages : current.languages,
    updatedAt: new Date().toISOString()
  };

  saveCareerProfile(merged);
  return merged;
}

// ------------------------------------------------------------- PORTFOLIO

const DEFAULT_PORTFOLIO_PROJECTS = [
  {
    id: "proj_1",
    name: "Enterprise Design System",
    description: "A comprehensive, accessible React component library powering multi-brand enterprise applications with light/dark theming and token automation.",
    technologies: "React, TypeScript, Tailwind CSS, Storybook, Radix UI",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
    demoUrl: "https://example.com/design-system",
    githubUrl: "https://github.com/example/design-system",
    role: "Lead Frontend Architect",
    achievements: "Adopted by 14 cross-functional product teams, reducing design-to-production turnaround by 35%."
  },
  {
    id: "proj_2",
    name: "Real-Time Collaborative Canvas",
    description: "Interactive visual workspace supporting multiplayer drawing, state persistence, and markdown documentation notes.",
    technologies: "TypeScript, WebSocket, Canvas API, IndexedDB",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    demoUrl: "https://example.com/canvas-demo",
    githubUrl: "https://github.com/example/canvas-workspace",
    role: "Full-Stack Engineer",
    achievements: "Scaled to handle concurrent sub-second canvas edits across distributed user sessions."
  }
];

export function getPortfolioProjects() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (!raw) {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(DEFAULT_PORTFOLIO_PROJECTS));
      return DEFAULT_PORTFOLIO_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PORTFOLIO_PROJECTS;
  } catch {
    return DEFAULT_PORTFOLIO_PROJECTS;
  }
}

export function savePortfolioProjects(projects) {
  try {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}

export function addPortfolioProject(proj) {
  const list = getPortfolioProjects();
  const newProj = {
    id: proj.id || uid(),
    name: proj.name || "Untitled Project",
    description: proj.description || "",
    technologies: proj.technologies || "",
    imageUrl: proj.imageUrl || "",
    demoUrl: proj.demoUrl || "",
    githubUrl: proj.githubUrl || "",
    role: proj.role || "",
    achievements: proj.achievements || "",
    updatedAt: new Date().toISOString()
  };
  list.unshift(newProj);
  savePortfolioProjects(list);
  return newProj;
}

export function deletePortfolioProject(id) {
  const list = getPortfolioProjects().filter((p) => p.id !== id);
  savePortfolioProjects(list);
  return list;
}

export function importProjectFromCv(cvProject) {
  if (!cvProject) return null;
  return addPortfolioProject({
    name: cvProject.name || "CV Project",
    description: cvProject.description || "",
    technologies: cvProject.technologies || "",
    demoUrl: cvProject.url || "",
    githubUrl: "",
    role: "Project Contributor",
    achievements: ""
  });
}

// ------------------------------------------------------------- CAREER SCORE

export function calculateCareerScore({ cv, profile, applications, interviewSessions, jobMatches } = {}) {
  const activeCv = cv || loadAllCVs()?.[0] || {};
  const activeProfile = profile || getCareerProfile();
  const apps = applications || getApplications();
  const interviews = interviewSessions || getInterviewSessions();
  const matches = jobMatches || getJobMatches();

  let cvScore = 0;
  // CV evaluation (max 30)
  if (activeCv.personal?.full_name && activeCv.personal?.email) cvScore += 8;
  if (activeCv.personal?.summary && activeCv.personal.summary.length > 50) cvScore += 7;
  if (Array.isArray(activeCv.experience) && activeCv.experience.length > 0) cvScore += 8;
  if (Array.isArray(activeCv.skills) && activeCv.skills.length >= 4) cvScore += 7;

  // Profile completeness (max 25)
  let profileScore = 0;
  if (activeProfile.fullName && activeProfile.title) profileScore += 8;
  if (activeProfile.summary) profileScore += 6;
  if (activeProfile.linkedin || activeProfile.github || activeProfile.website) profileScore += 6;
  if (activeProfile.isPublished) profileScore += 5;

  // Portfolio completeness (max 15)
  const portfolioProjects = getPortfolioProjects();
  let portfolioScore = 0;
  if (portfolioProjects.length >= 1) portfolioScore += 8;
  if (portfolioProjects.length >= 2) portfolioScore += 4;
  if (portfolioProjects.some((p) => p.demoUrl || p.githubUrl)) portfolioScore += 3;

  // Job Pipeline & Applications (max 15)
  let appScore = 0;
  if (apps.length >= 1) appScore += 5;
  if (apps.length >= 3) appScore += 4;
  if (apps.some((a) => a.status === "Interview" || a.status === "Offer")) appScore += 6;

  // Interview Coach practice (max 15)
  let interviewScore = 0;
  if (interviews.length >= 1) {
    const avgScore = interviews.reduce((acc, i) => acc + (i.score || 70), 0) / interviews.length;
    interviewScore = Math.min(15, Math.round((avgScore / 100) * 15));
  } else {
    interviewScore = 8; // Baseline readiness
  }

  const totalScore = Math.min(98, Math.max(45, cvScore + profileScore + portfolioScore + appScore + interviewScore));

  const recommendations = [];
  if (cvScore < 25) recommendations.push("Enhance CV bullet points with quantified achievements.");
  if (!activeProfile.isPublished) recommendations.push("Publish your professional profile to generate your public link.");
  if (portfolioProjects.length < 2) recommendations.push("Add another project to your portfolio showcasing real code or live demos.");
  if (!interviews.length) recommendations.push("Complete an AI interview practice session to test role-specific readiness.");
  if (!apps.some((a) => a.status === "Interview" || a.status === "Applied")) {
    recommendations.push("Use the AI Job Matcher to analyze open positions and track applications.");
  }

  return {
    totalScore,
    breakdown: {
      cvScore,
      profileScore,
      portfolioScore,
      appScore,
      interviewScore
    },
    recommendations
  };
}

// ------------------------------------------------------------- FIRESTORE SYNC

async function syncCareerProfileToFirestore(profile) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const db = await getDb();
    const docRef = doc(db, "career_profiles", user.uid);
    await setDoc(
      docRef,
      {
        id: user.uid,
        userId: user.uid,
        username: profile.username,
        isPublished: Boolean(profile.isPublished),
        data: profile,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore career profile sync error:", err);
  }
}

async function syncApplicationToFirestore(app) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const db = await getDb();
    const cleanId = (app.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const docRef = doc(db, "job_applications", cleanId);
    await setDoc(
      docRef,
      {
        id: cleanId,
        userId: user.uid,
        company: app.company,
        jobTitle: app.jobTitle,
        status: app.status,
        data: app,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore job application sync error:", err);
  }
}

async function deleteApplicationFromFirestore(id) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const db = await getDb();
    const cleanId = (id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    await deleteDoc(doc(db, "job_applications", cleanId));
  } catch (err) {
    console.warn("Firestore delete application error:", err);
  }
}

async function syncCoverLetterToFirestore(letter) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const db = await getDb();
    const cleanId = (letter.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const docRef = doc(db, "cover_letters", cleanId);
    await setDoc(
      docRef,
      {
        id: cleanId,
        userId: user.uid,
        jobTitle: letter.jobTitle,
        company: letter.company,
        data: letter,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore cover letter sync error:", err);
  }
}

async function deleteCoverLetterFromFirestore(id) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const db = await getDb();
    const cleanId = (id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    await deleteDoc(doc(db, "cover_letters", cleanId));
  } catch (err) {
    console.warn("Firestore delete cover letter error:", err);
  }
}

async function syncInterviewSessionToFirestore(session) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const db = await getDb();
    const cleanId = (session.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const docRef = doc(db, "interview_sessions", cleanId);
    await setDoc(
      docRef,
      {
        id: cleanId,
        userId: user.uid,
        jobTitle: session.jobTitle,
        score: session.score,
        data: session,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore interview session sync error:", err);
  }
}
