import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bot,
  Check,
  RefreshCw,
  FileText,
  BookmarkPlus,
  Compass,
  AlertCircle
} from "lucide-react";
import { loadAllCVs, getActiveId } from "@/lib/cvStorage";
import { analyzeJobFit } from "@/api/backend";
import { saveJobMatch, addApplication } from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";
import confetti from "canvas-confetti";

const SAMPLE_JOB = `Role: Senior Frontend Engineer
Company: Linear
Location: Remote / San Francisco

About the Role:
We are looking for a Senior Frontend Engineer to build high-performance, polished web applications. You will collaborate closely with product designers and engineers to craft resilient, keyboard-first, ultra-fast interfaces.

Requirements:
- 4+ years of professional experience building web applications with React, TypeScript, and modern JavaScript.
- Strong knowledge of state management, component architecture, and responsive CSS / Tailwind CSS.
- Experience integrating with REST and GraphQL APIs.
- Familiarity with CI/CD pipelines, automated testing (Jest, Playwright), and Git version control.
- Attention to detail regarding typography, performance optimization, and accessibility (WCAG AA).
- Self-starter with excellent communication skills in distributed, asynchronous teams.`;

export default function JobMatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [jobTitle, setJobTitle] = useState(location.state?.jobTitle || "");
  const [company, setCompany] = useState(location.state?.company || "");
  const [jobDescription, setJobDescription] = useState(location.state?.jobDescription || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [trackedSuccess, setTrackedSuccess] = useState(false);

  useEffect(() => {
    const loaded = loadAllCVs() || [];
    setCvs(loaded);
    const active = getActiveId() || loaded[0]?.id || "";
    setSelectedCvId(active);
  }, []);

  const activeCv = cvs.find((c) => c.id === selectedCvId) || cvs[0] || null;

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim()) {
      setError("Please paste a job description or requirements to analyze.");
      return;
    }
    if (!activeCv) {
      setError("Please select a CV to compare against.");
      return;
    }

    setError(null);
    setLoading(true);
    triggerHaptic("selection");

    try {
      const data = await analyzeJobFit({
        jobDescription,
        cv: activeCv,
        lang: "en"
      });

      setResult(data);
      if (data?.matchScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      // Save to match history
      saveJobMatch({
        id: `match_${Date.now()}`,
        jobTitle: jobTitle || data?.extractedTitle || "Target Role",
        company: company || data?.extractedCompany || "",
        matchScore: data?.matchScore || 75,
        matchingSkills: (data?.matchingSkills || []).map((s) => (typeof s === "string" ? s : s.name)),
        missingSkills: (data?.missingSkills || []).map((s) => (typeof s === "string" ? s : s.name)),
        date: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError("AI analysis encountered an issue. Please try again or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackJob = () => {
    if (!jobTitle && !company) {
      setJobTitle("Target Role");
    }
    addApplication({
      company: company || "Target Company",
      jobTitle: jobTitle || "Target Role",
      notes: `Analyzed with AI Job Matcher. Match score: ${result?.matchScore || 80}%.`,
      status: "Saved"
    });
    setTrackedSuccess(true);
    triggerHaptic("success");
    setTimeout(() => setTrackedSuccess(false), 3000);
  };

  const handleCreateCoverLetter = () => {
    triggerHaptic("selection");
    navigate("/career/cover-letter", {
      state: {
        jobTitle: jobTitle || "",
        company: company || "",
        jobDescription: jobDescription || "",
        cvId: selectedCvId
      }
    });
  };

  const handlePracticeInterview = () => {
    triggerHaptic("selection");
    navigate("/career/interview-coach", {
      state: {
        jobTitle: jobTitle || "Software Engineer",
        cvId: selectedCvId
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                <Target size={14} />
                <span>Match & Gap Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                AI Job Matcher
              </h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Compare your real CV against any target job description. Uncover strengths, missing keywords, skill gaps, and ATS tailoring opportunities without invented claims.
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
          {/* Input Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span>Job & CV Selection</span>
              </h2>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {/* Select CV */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Select CV to Compare
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
                      Role Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Company (Optional)
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

                {/* Job Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground">
                      Job Description & Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() => setJobDescription(SAMPLE_JOB)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Paste Sample Job
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    placeholder="Paste the full job posting, responsibilities, and required qualifications here..."
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
                      <span>Analyzing CV Fit & Keywords...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Analyze Job Fit</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Score Header Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    {/* Score Circle / Badge */}
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-indigo-500/20 border border-primary/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-3xl font-black text-primary leading-none">
                        {result.matchScore}%
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                        Match
                      </span>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
                        <CheckCircle2 size={12} />
                        <span>{result.matchGrade || "Strong Candidate Alignment"}</span>
                      </div>
                      <h2 className="text-lg font-bold text-foreground">
                        {jobTitle || "Target Role"} Fit Report
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                        {result.summary}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleTrackJob}
                      className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center justify-center gap-1.5"
                    >
                      {trackedSuccess ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span>Tracked in Pipeline</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={14} />
                          <span>Track This Job</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCoverLetter}
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center gap-1.5"
                    >
                      <Send size={14} />
                      <span>Write Cover Letter</span>
                    </button>
                  </div>
                </div>

                {/* Matching Skills vs Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matching Skills */}
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={14} />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Matching Skills</h3>
                    </div>
                    <div className="space-y-2">
                      {(result.matchingSkills || []).map((skill, i) => {
                        const name = typeof skill === "string" ? skill : skill.name;
                        const context = typeof skill === "object" ? skill.contextInCv : null;
                        return (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs flex items-start justify-between gap-2"
                          >
                            <span className="font-semibold text-foreground">{name}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                              ✓ Verified in CV
                            </span>
                          </div>
                        );
                      })}
                      {(!result.matchingSkills || result.matchingSkills.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">No matching skills identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <AlertTriangle size={14} />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Missing / Target Skills</h3>
                    </div>
                    <div className="space-y-2">
                      {(result.missingSkills || []).map((skill, i) => {
                        const name = typeof skill === "string" ? skill : skill.name;
                        const reason = typeof skill === "object" ? skill.reason : null;
                        return (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{name}</span>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                ⚠ Desired in Posting
                              </span>
                            </div>
                            {reason && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{reason}</p>
                            )}
                          </div>
                        );
                      })}
                      {(!result.missingSkills || result.missingSkills.length === 0) && (
                        <p className="text-xs text-emerald-600 font-medium">
                          All primary required skills were found in your CV!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keywords Analysis */}
                {result.keywords && result.keywords.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Target size={15} className="text-primary" />
                      <span>ATS Keyword Presence</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw, i) => {
                        const name = typeof kw === "string" ? kw : kw.keyword;
                        const present = typeof kw === "object" ? kw.presentInCv : true;
                        return (
                          <span
                            key={i}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 ${
                              present
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {name}
                            <span className="text-[10px] font-bold">
                              {present ? "✓" : "–"}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tailoring Recommendations */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles size={15} className="text-primary" />
                    <span>Actionable Recommendations</span>
                  </h3>
                  <div className="space-y-2.5 text-xs text-muted-foreground">
                    {(result.recommendations || result.tailoringTips || [
                      "Tailor your experience summary to emphasize matching technical deliverables.",
                      "Verify if you have genuine experience with missing tools before adding them to skills."
                    ]).map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="leading-relaxed text-foreground">{rec}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                    <Link
                      to="/builder"
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center gap-1.5"
                    >
                      <FileText size={13} />
                      <span>Edit CV in Builder</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handlePracticeInterview}
                      className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5"
                    >
                      <Bot size={13} />
                      <span>Practice Mock Interview for this Role</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state before analysis */
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Target size={28} />
                </div>
                <h3 className="text-base font-bold text-foreground">Ready to analyze job fit</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  Paste the requirements from a job post on LinkedIn, Indeed, or a company site. DexaCV will inspect your CV for matching skills, missing keywords, and provide honest tailoring tips.
                </p>
                <button
                  type="button"
                  onClick={() => setJobDescription(SAMPLE_JOB)}
                  className="mt-5 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
                >
                  Load Sample Job Posting
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
