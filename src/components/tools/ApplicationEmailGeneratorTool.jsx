import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { generateApplicationEmail } from "../../lib/applicationUtils";

export default function ApplicationEmailGeneratorTool() {
  const [scenario, setScenario] = useState("application");
  const [senderName, setSenderName] = useState("Alex Morgan");
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [jobTitle, setJobTitle] = useState("Senior Frontend Developer");
  const [company, setCompany] = useState("Acme Corp");
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const { subject, body } = generateApplicationEmail({
    scenario,
    senderName,
    recipientName,
    jobTitle,
    company
  });

  function copySubject() {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  }

  function copyBody() {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            1. Select Email Scenario
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "application", label: "Job Application", desc: "Submitting CV" },
              { id: "followup", label: "Follow-Up", desc: "Status update" },
              { id: "speculative", label: "Cold Inquiry", desc: "Open positions" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scenario === s.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-bold">{s.label}</div>
                <div className={`text-[10px] mt-0.5 ${scenario === s.id ? "text-indigo-100" : "text-slate-400"}`}>
                  {s.desc}
                </div>
              </button>
            ))}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pt-2">
            2. Details
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role / Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Generated Email Draft
          </span>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Subject Line</span>
                <button
                  onClick={copySubject}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                >
                  {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSubject ? "Copied" : "Copy Subject"}</span>
                </button>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 select-all">
                {subject}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Email Body</span>
                <button
                  onClick={copyBody}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                >
                  {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBody ? "Copied" : "Copy Body"}</span>
                </button>
              </div>
              <textarea
                value={body}
                readOnly
                rows={10}
                className="w-full bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans focus:outline-none select-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
