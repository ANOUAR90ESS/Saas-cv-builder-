import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Download,
  BookmarkPlus,
  RefreshCw,
  Trash2,
  FileText,
  Compass,
  Building2,
  AlertCircle
} from "lucide-react";
import { loadAllCVs, getActiveId } from "@/lib/cvStorage";
import { generateCoverLetter } from "@/api/backend";
import {
  getCoverLetters,
  saveCoverLetter,
  deleteCoverLetter,
  getCareerProfile
} from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";

export default function CoverLetterGenerator() {
  const location = useLocation();

  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(location.state?.cvId || "");
  const [jobTitle, setJobTitle] = useState(location.state?.jobTitle || "");
  const [company, setCompany] = useState(location.state?.company || "");
  const [jobDescription, setJobDescription] = useState(location.state?.jobDescription || "");
  const [tone, setTone] = useState("Professional");
  const [lang, setLang] = useState("en");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [savedList, setSavedList] = useState([]);

  useEffect(() => {
    const loaded = loadAllCVs() || [];
    setCvs(loaded);
    const active = location.state?.cvId || getActiveId() || loaded[0]?.id || "";
    setSelectedCvId(active);
    setSavedList(getCoverLetters());
  }, [location.state]);

  const activeCv = cvs.find((c) => c.id === selectedCvId) || cvs[0] || null;

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!jobTitle.trim() && !jobDescription.trim()) {
      setError("Please provide at least a job title or job description.");
      return;
    }

    setError(null);
    setLoading(true);
    triggerHaptic("selection");

    try {
      const profile = getCareerProfile();
      const res = await generateCoverLetter({
        jobTitle,
        company,
        jobDescription,
        cv: activeCv,
        profile,
        tone,
        lang
      });

      if (typeof res === "string") {
        setGeneratedLetter(res);
        setSubjectLine(`Application for ${jobTitle || "Role"} - ${activeCv?.personal?.full_name || "Applicant"}`);
      } else if (res?.coverLetter) {
        setGeneratedLetter(res.coverLetter);
        setSubjectLine(res.subjectLine || `Application for ${jobTitle || "Role"} - ${activeCv?.personal?.full_name || "Applicant"}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate cover letter. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `${subjectLine ? `Subject: ${subjectLine}\n\n` : ""}${generatedLetter}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    triggerHaptic("selection");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedLetter.trim()) return;
    const item = saveCoverLetter({
      jobTitle: jobTitle || "Role Application",
      company: company || "Organization",
      subjectLine,
      coverLetter: generatedLetter,
      tone,
      date: new Date().toISOString()
    });
    setSavedList(getCoverLetters());
    setSavedSuccess(true);
    triggerHaptic("success");
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id) => {
    deleteCoverLetter(id);
    setSavedList(getCoverLetters());
    triggerHaptic("selection");
  };

  const handleDownloadPDF = async () => {
    try {
      // jsPDF is ~380 kB and only needed once someone downloads.
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      const candidateName = activeCv?.personal?.full_name || "Candidate";
      const candidateEmail = activeCv?.personal?.email || "";
      const candidatePhone = activeCv?.personal?.phone || "";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(candidateName, 40, 50);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const contactLine = [candidateEmail, candidatePhone, activeCv?.personal?.location].filter(Boolean).join(" • ");
      doc.text(contactLine, 40, 68);

      doc.setDrawColor(200, 200, 200);
      doc.line(40, 80, 555, 80);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10.5);

      const splitText = doc.splitTextToSize(generatedLetter, 515);
      doc.text(splitText, 40, 105, { lineHeightFactor: 1.5 });

      const fileName = `Cover_Letter_${(company || "Job").replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
      triggerHaptic("success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTXT = () => {
    const content = `${subjectLine ? `Subject: ${subjectLine}\n\n` : ""}${generatedLetter}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cover_Letter_${(company || "Job").replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerHaptic("selection");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-2">
                <Send size={14} />
                <span>Targeted Outreach</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                AI Cover Letter Generator
              </h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Draft tailored, truthful cover letters grounded directly in your real CV experience and targeted to the role requirements.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground self-start md:self-auto px-3 py-2 rounded-xl border border-border bg-background transition"
            >
              <Compass size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                <span>Job Details & Preferences</span>
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Select CV */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Source CV to Reference
                  </label>
                  <select
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {cvs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title || c.personal?.full_name || "Untitled CV"} ({c.personal?.professional_title || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Title & Company */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Role / Position Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full-Stack Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Linear"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Tone & Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Writing Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Professional">Professional & Polished</option>
                      <option value="Confident">Confident & Impactful</option>
                      <option value="Friendly">Friendly & Collaborative</option>
                      <option value="Concise">Concise & Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Language
                    </label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>

                {/* Job Description (Optional or paste) */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Job Description / Responsibilities (Optional)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Paste job posting snippets or key requirements to help the AI highlight your most relevant experience..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-xs leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Writing Targeted Letter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate Cover Letter</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Saved Cover Letters Library */}
            {savedList.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  <span>Saved Letters ({savedList.length})</span>
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {savedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border/70 bg-background/60 hover:bg-muted/40 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div
                        onClick={() => {
                          setGeneratedLetter(item.coverLetter);
                          setSubjectLine(item.subjectLine || "");
                          setJobTitle(item.jobTitle || "");
                          setCompany(item.company || "");
                        }}
                        className="min-w-0 cursor-pointer flex-1"
                      >
                        <p className="font-bold text-foreground truncate">{item.jobTitle}</p>
                        <p className="text-muted-foreground truncate">{item.company}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Letter Editor & Preview */}
          <div className="lg:col-span-7 space-y-6">
            {generatedLetter ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Generated Letter</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5"
                    >
                      <BookmarkPlus size={13} />
                      <span>{savedSuccess ? "Saved!" : "Save"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadTXT}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
                    >
                      TXT
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Editable Letter Body */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Letter Body (Editable)
                  </label>
                  <textarea
                    rows={16}
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-sans resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pro Tip: Feel free to customize any specific team names or projects.</span>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                  <Send size={28} />
                </div>
                <h3 className="text-base font-bold text-foreground">Write a standout cover letter</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  Enter the job title and company on the left. DexaCV reads your CV's verified achievements to construct a professional, persuasive cover letter without exaggerations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
