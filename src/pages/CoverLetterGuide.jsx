import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Seo from "@/components/Seo";
import MobileSubHeader from "@/components/MobileSubHeader";

// Public, content-rich cover-letter guide. Single semantic <h1>, 200+ words of
// topical content to improve AI-search citability.
export default function CoverLetterGuide() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Seo
        title="How to Write a Cover Letter That Complements Your CV — DexaCV"
        description="A practical guide to writing a cover letter that strengthens your application. Structure, opening, body, closing, tone and length, with concrete examples."
        path="/cover-letter-guide"
      />
      <MobileSubHeader title="Cover Letter Guide" />
      <article className="prose-cv">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How to write a cover letter that complements your CV</h1>
        <p className="text-gray-600 leading-relaxed">
          A cover letter is the one place in your application where you can show personality and
          explain, in your own words, why you are the right person for the role. Where your CV lists
          what you have done, your cover letter connects the dots: it tells the hiring manager how
          your experience maps to their needs. A strong letter is concise, specific and tailored —
          never a generic paragraph that could belong to anyone.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Start with a clear header: your name and contact details, the date, and the recruiter or
          hiring manager's name if you know it. Open with a strong first sentence that names the role
          you are applying for and one concrete reason you are a great fit — for example, "I am a
          product designer with six years in fintech, and I would love to bring that experience to
          the team at Mosaic." Avoid weak openings like "I am writing to apply for the job posted
          on your website."
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          In the body, pick two or three achievements from your CV and expand on the story behind
          them. Explain the problem, what you did, and the result — then connect it directly to
          something in the job description. This is where tailoring matters most: a paragraph that
          mirrors the employer's stated priorities signals that you have read the posting and
          understood it. Keep each paragraph focused on one idea.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Close with a confident, simple call to action: thank the reader for their time, restate
          your enthusiasm, and say you would welcome the chance to discuss the role further. Sign
          off professionally. The whole letter should fit on a single page — roughly 250 to 400
          words. Recruiters skim, so keep sentences short and use white space generously.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          Common mistakes to avoid: repeating your CV word for word, writing in a stiff or overly
          formal tone, addressing the letter "To whom it may concern" when a name is available, and
          forgetting to proofread. A single typo can undercut an otherwise strong letter, so read
          it aloud and run a spell-check before you send. Pair a tailored cover letter with a clean,
          well-structured CV and your application will stand out for the right reasons.
        </p>

        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20">
          <h2 className="text-xl font-bold mb-2">Build a CV that matches your letter</h2>
          <p className="text-sm text-gray-600 mb-4">
            Create a polished, recruiter-ready CV in minutes — free to build, €0.99 per download, no signup.
          </p>
          <ul className="space-y-2 mb-5">
            <li className="flex items-center gap-2 text-sm text-foreground/80"><Check size={16} className="text-primary" /> Live preview as you type</li>
            <li className="flex items-center gap-2 text-sm text-foreground/80"><Check size={16} className="text-primary" /> PDF and DOCX export</li>
            <li className="flex items-center gap-2 text-sm text-foreground/80"><Check size={16} className="text-primary" /> Professional, ATS-friendly templates</li>
          </ul>
          <Link to="/builder" className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
            Create my CV
          </Link>
        </div>
      </article>
    </div>
  );
}