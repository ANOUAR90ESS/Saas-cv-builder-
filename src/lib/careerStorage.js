// Local-first persistent storage for DexaCV Utilities & Documents.
// Works seamlessly without an account, with optional Firestore synchronization.

import { loadAllCVs, getActiveId } from "./cvStorage";
import { db, auth } from "./firebase";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const COVER_LETTERS_KEY = "dexacv.coverletters.v1";
const PROFILE_KEY = "dexacv.careerprofile.v1";
const PORTFOLIO_KEY = "dexacv.portfolioprojects.v1";
const RECENT_TOOLS_KEY = "dexacv.recent_tools.v1";

const uid = () => Math.random().toString(36).slice(2, 10);

// ------------------------------------------------------------- RECENT TOOLS USAGE
export function logToolUsage(toolId, toolName) {
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter((t) => t.id !== toolId);
    list.unshift({ id: toolId, name: toolName, timestamp: new Date().toISOString() });
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {}
}

export function getRecentTools() {
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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

// ------------------------------------------------------------- FIRESTORE SYNC

async function syncCareerProfileToFirestore(profile) {
  const user = auth.currentUser;
  if (!user) return;
  try {
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

async function syncCoverLetterToFirestore(letter) {
  const user = auth.currentUser;
  if (!user) return;
  try {
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
