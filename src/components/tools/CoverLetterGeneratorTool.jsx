import React, { useState } from "react";
import { Copy, Check, Download, Sparkles } from "lucide-react";
import { generateCoverLetterText } from "../../lib/applicationUtils";
import { createDocxFromText } from "../../lib/docxExport";
import { loadAllCVs } from "../../lib/cvStorage";

export default function CoverLetterGeneratorTool() {
  const localCvs = loadAllCVs();
  const [candidateName, setCandidateName] = useState("Alex Morgan");
  const [candidateEmail, setCandidateEmail] = useState("alex.morgan@example.com");
  const [candidatePhone, setCandidatePhone] = useState("+1 (555) 019-2834");
  const [candidateLocation, setCandidateLocation] = useState("San Francisco, CA");
  const [jobTitle, setJobTitle] = useState("Senior Frontend Engineer");
  const [company, setCompany] = useState("Acme Corporation");
  const [recipient, setRecipient] = useState("Hiring Team");
  const [tone, setTone] = useState("Professional & Confident");
  const [letterText, setLetterText] = useState("");
  const [copied, setCopied] = useState(false);

  function handleFillFromCv(cv) {
    if (cv.personal?.full_name) setCandidateName(cv.personal.full_name);
    if (cv.personal?.email) setCandidateEmail(cv.personal.email);
    if (cv.personal?.phone) setCandidatePhone(cv.personal.phone);
    if (cv.personal?.location) setCandidateLocation(cv.personal.location);
    if (cv.personal?.professional_title) setJobTitle(cv.personal.professional_title);
  }

  function handleGenerate() {
    const text = generateCoverLetterText({
      candidateName,
      candidateEmail,
      candidatePhone,
      candidateLocation,
      jobTitle,
      company,
      recipient,
      tone
    });
    setLetterText(text);
  }

  function handleCopy() {
    if (!letterText) return;
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadDocx() {
    if (!letterText) return;
    const res = await createDocxFromText(letterText, `Cover_Letter_${candidateName}`);
    const a = document.createElement("a");
    a.href = res.url;
    a.download = `Cover_Letter_${candidateName.replace(/\s+/g, "_")}.docx`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Your Details
            </span>
            {localCvs.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Auto-fill:</span>
                <select
                  onChange={(e) => {
                    const cv = localCvs.find((c) => c.id === e.target.value);
                    if (cv) handleFillFromCv(cv);
                  }}
                  className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 focus:outline-none"
                >
                  <option value="">Select CV...</option>
                  {localCvs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || "CV"}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={candidateLocation}
                onChange={(e) => setCandidateLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pt-2">
            2. Target Position & Company
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Role</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Hiring Manager"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Professional & Confident">Professional & Confident</option>
                <option value="Concise & Direct">Concise & Direct</option>
                <option value="Formal & Traditional">Formal & Traditional</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Tailored Cover Letter</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Preview & Editor
            </span>
            {letterText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownloadDocx}
                  className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 inline-flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .docx</span>
                </button>
              </div>
            )}
          </div>

          <textarea
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="Click 'Generate Tailored Cover Letter' or start typing directly here..."
            rows={16}
            className="w-full p-4 rounded-xl border border-slate-300 text-xs leading-relaxed font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
          />
        </div>
      </div>
    </div>
  );
}
