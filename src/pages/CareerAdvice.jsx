import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Seo from "@/components/Seo";
import MobileSubHeader from "@/components/MobileSubHeader";

// Public, content-rich career resource page. Single semantic <h1>, 200+ words
// of topical content to improve search-engine citability.
export default function CareerAdvice() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Seo
        title="How to Write a CV That Gets You Interviews — DexaCV"
        description="A practical, in-depth guide to writing a CV that stands out to recruiters and passes applicant tracking systems. Structure, summary, experience, skills and design tips."
        path="/career-advice"
      />
      <MobileSubHeader title="Career Advice" />
      <article className="prose-cv">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How to write a CV that gets you interviews</h1>
        <p className="text-gray-600 leading-relaxed">
          A strong CV is a marketing document, not an autobiography. Its only job is to get you an
          interview — so every line should earn its place. Recruiters spend roughly six seconds on a
          first pass, which means the most important information must be obvious at a glance. Start
          with clear contact details: your name, professional title, email, phone, location and a
          link to your portfolio or LinkedIn profile. Keep them at the top so a recruiter can reach
          you in one motion.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Follow with a two-to-three sentence professional summary that positions you: who you are,
          what you specialise in, and the value you bring. Avoid generic buzzwords like "team player"
          or "results-driven". Instead, be specific: "Senior designer with 8 years shipping fintech
          products used by 200k people." A tailored summary tells the recruiter, in seconds, why
          you are worth reading on.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Your work experience is the heart of the CV. Lead with achievements, not duties. Use action
          verbs and quantify results wherever possible — "increased activation by 34%" beats
          "responsible for onboarding". For each role, give the job title, company, location and
          dates, then list three to five bullet points that describe the impact you had. If you can
          tie a number to the outcome, do it: revenue, time saved, users reached, error rate reduced.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          List your education, skills and languages clearly. Include certifications, projects or
          volunteer work if they strengthen your case, especially early in your career. Group
          skills by category (languages, frameworks, tools) so a recruiter can scan them quickly,
          and be honest about your level.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Most CVs today are first read by an applicant tracking system (ATS) before a human ever
          sees them. Use a simple, single-column layout with standard section headings — Experience,
          Education, Skills — and avoid putting critical information inside images, headers or
          complex tables that parsers struggle with. Mirror keywords from the job description
          naturally; never stuff them into a hidden block.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Keep the design clean and readable. One or two pages is enough for most careers; a
          recruiter reviewing junior applications expects concise, focused CVs. Choose a template
          that fits your field — restrained for finance, a little more expressive for design — and
          export as PDF unless the employer specifically asks for a Word document. Then proofread,
          tailor the CV to each role you apply for, and send it.
        </p>

        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20">
          <h2 className="text-xl font-bold mb-2">Ready to put this into practice?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Build a polished, recruiter-ready CV in minutes — free to build, €0.99 per download, no signup.
          </p>
          <ul className="space-y-2 mb-5">
            <li className="flex items-center gap-2 text-sm text-foreground/80"><Check size={16} className="text-primary" /> Live A4 preview as you type</li>
            <li className="flex items-center gap-2 text-sm text-foreground/80"><Check size={16} className="text-primary" /> Real text PDF and editable DOCX export</li>
            <li className="flex items-center gap-2 text-sm text-foreground/80"><Check size={16} className="text-primary" /> ATS-friendly single-column layouts</li>
          </ul>
          <Link to="/builder" className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
            Create my CV
          </Link>
        </div>
      </article>
    </div>
  );
}