import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Seo from "@/components/Seo";

// Slugs are indexed URLs and must not change. The copy is deliberately explicit
// about the pricing model: the builder is free, each export costs EUR 0.99.
const PAGES = {
  "cv-maker": {
    title: "CV Maker",
    h1: "CV maker — build a professional CV online",
    desc: "A fast CV maker. Choose a template, fill in your details and preview your CV for free — download a polished PDF for €0.99.",
    points: ["No account required", "Professional templates", "Free live preview", "Works on mobile and desktop"],
  },
  "resume-builder": {
    title: "Resume Builder",
    h1: "A resume builder that's actually good",
    desc: "Build a clean, recruiter-ready resume in minutes. Customizing and previewing are free; export to PDF or DOCX for €0.99.",
    points: ["Live preview", "Editable DOCX export", "ATS-friendly layouts", "No subscription"],
  },
  "cv-maker-free": {
    title: "CV Maker — No Watermark",
    h1: "CV maker with no watermark",
    desc: "Create a professional CV for free and download it without a watermark for €0.99 — one payment, never a subscription.",
    points: ["No watermark, ever", "Free to build and preview", "PDF and DOCX export", "Your data stays on your device"],
  },
  "resume-builder-free": {
    title: "Resume Builder — No Subscription",
    h1: "Resume builder with no subscription",
    desc: "Build and customize your resume for free. Pay €0.99 only when you download it — a one-time charge, no recurring fee.",
    points: ["Free to build", "€0.99 per download", "Real text PDF", "Editable Word export"],
  },
  "cv-without-experience": {
    title: "How to Write a CV with No Experience",
    h1: "CV with no experience? Here's how to start",
    desc: "A CV builder that helps you highlight projects, skills and potential when you're just starting out.",
    points: ["Lead with education and projects", "Skills-first templates", "Guided editor", "Free to build"],
  },
  "student-cv": {
    title: "Student CV Builder",
    h1: "Build a student CV that gets internships",
    desc: "Designed for students and new graduates. Showcase coursework, projects and part-time work clearly.",
    points: ["One-page layouts", "Project-friendly sections", "Clean, modern templates", "€0.99 per PDF export"],
  },
  "professional-cv": {
    title: "Professional CV Builder",
    h1: "Create a professional CV that stands out",
    desc: "Polished templates for experienced professionals. Customize colors and typography, export in one click.",
    points: ["Executive and modern templates", "Full customization", "Multi-page support", "€0.99 per download"],
  },
  "ats-cv": {
    title: "ATS-Friendly CV Builder",
    h1: "ATS-friendly CV that gets past the robots",
    desc: "A simple, parseable layout designed for applicant tracking systems — without looking generic.",
    points: ["Single-column structure", "Standard headings", "Clean PDF output", "Free to build"],
  },
};

export function getSeoPage(slug) {
  return PAGES[slug];
}

export default function SeoLanding({ slug }) {
  const p = PAGES[slug];
  if (!p) return null;
  return (
    <div>
      <Seo title={`${p.title} — DexaCV`} description={p.desc} path={`/${slug}`} />
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">{p.h1}</h1>
        <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">{p.desc}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/builder" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-sm hover:shadow-md transition">Create my CV</Link>
          <Link to="/templates" className="px-6 py-3 rounded-xl border border-border font-semibold text-foreground hover:bg-muted transition">Browse templates</Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          {p.points.map((pt) => (
            <span key={pt} className="flex items-center gap-1.5"><Check size={15} className="text-primary" /> {pt}</span>
          ))}
        </div>
      </section>
      <section className="bg-muted/40 py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Fast, private, no subscription</h2>
          <p className="text-gray-600">Your CV is saved on your device — no account needed, and building it costs nothing. When you're ready, export a clean PDF or editable DOCX for a one-time €0.99.</p>
          <Link to="/builder" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold">Start building</Link>
        </div>
      </section>
    </div>
  );
}