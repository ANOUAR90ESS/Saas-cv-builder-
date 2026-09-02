import React, { useState } from "react";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import { useT } from "@/lib/i18n";
import { emptyItem } from "@/lib/cvSchema";
import {
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FileText,
  Briefcase
} from "lucide-react";

const SAMPLE_JOBS = [
  {
    title: "Senior Full-Stack Engineer",
    text: `We are looking for a Senior Full-Stack Engineer with 4+ years of experience building modern web applications.
Key Requirements:
- Proficiency in React, TypeScript, Node.js, and modern CSS/Tailwind.
- Experience with RESTful APIs, database design (SQL/PostgreSQL), and cloud deployments.
- Demonstrated experience in automated testing, CI/CD pipelines, and performance optimization.
- Strong communication and cross-functional leadership skills in an agile team environment.`
  },
  {
    title: "Product Manager",
    text: `Seeking an experienced Product Manager to drive product strategy, roadmaps, and execution.
Key Requirements:
- 3+ years managing SaaS digital products from conception through release.
- Proven ability to synthesize user feedback, data analytics, and business metrics (KPIs, OKRs).
- Agile product development, sprint planning, and backlog prioritization.
- Cross-functional collaboration with engineering, design, and executive stakeholders.`
  },
  {
    title: "Data Analyst & BI Specialist",
    text: `Join our analytics team as a Data Analyst responsible for business intelligence and actionable insights.
Key Requirements:
- Proven experience with SQL querying, data cleaning, and statistical analysis.
- Dashboard creation with Tableau, PowerBI, or Metabase.
- Strong knowledge of Python/R, data modeling, and predictive reporting.
- Ability to communicate quantitative findings clearly to business decision-makers.`
  }
];

export default function JobFitAnalyzer({ cv, onUpdateCv }) {
  const t = useT();
  const { aiAssist } = useAiAssist();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [addedSkills, setAddedSkills] = useState(new Set());

  const currentSkillNames = new Set(
    (cv.skills || []).map((s) => (s.name || "").toLowerCase().trim())
  );

  const runAnalysis = async (descToUse) => {
    const textToAnalyze = descToUse || jobDescription;
    if (!textToAnalyze.trim()) {
      setError("Please paste a job description or select one of the samples below.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cvPayload = {
        personal_info: cv.personal_info,
        summary: cv.summary,
        experience: cv.experience,
        education: cv.education,
        skills: cv.skills,
        projects: cv.projects,
        certifications: cv.certifications
      };

      const res = await aiAssist("analyze_job_fit", {
        text: textToAnalyze,
        context: {
          job_description: textToAnalyze,
          cv: cvPayload
        }
      });

      setAnalysis(res);
    } catch (e) {
      setError(
        e instanceof AiAuthError
          ? t("builder.ai.errAuth")
          : "Failed to analyze role fit. Please ensure the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skillName) => {
    if (!skillName || !onUpdateCv) return;
    const existing = cv.skills || [];
    const lower = skillName.toLowerCase().trim();

    if (existing.some((s) => (s.name || "").toLowerCase().trim() === lower)) {
      setAddedSkills((prev) => new Set([...prev, lower]));
      return;
    }

    const newSkill = {
      id: emptyItem("skills").id,
      name: skillName,
      level: "Intermediate"
    };

    onUpdateCv({ skills: [...existing, newSkill] });
    setAddedSkills((prev) => new Set([...prev, lower]));
  };

  const isSkillInCv = (skillName) => {
    const lower = (skillName || "").toLowerCase().trim();
    return currentSkillNames.has(lower) || addedSkills.has(lower);
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Intro Header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Target size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Target Role Fit & Skill Matcher</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste a job description to cross-reference your CV against employer requirements using Gemini.
              Discover your match percentage, identify resume gaps, and pinpoint missing keyword skills to add.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-primary" />
            <span>Target Job Description</span>
          </label>
          {jobDescription && (
            <button
              type="button"
              onClick={() => {
                setJobDescription("");
                setAnalysis(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick sample chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">Or choose a sample role:</span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_JOBS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setJobDescription(sample.text);
                  runAnalysis(sample.text);
                }}
                className="text-xs px-2.5 py-1 rounded-lg border border-border bg-muted/50 hover:bg-muted hover:border-primary/40 transition flex items-center gap-1 font-medium"
              >
                <Briefcase size={12} className="text-primary" />
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the target job description or requirements here (responsibilities, required skills, tools, qualifications)..."
          className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition leading-relaxed resize-y"
        />

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="button"
          onClick={() => runAnalysis()}
          disabled={loading || !jobDescription.trim()}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Analyzing CV Fit with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Analyze Job Match & Skills</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Match Score Overview Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/20 shadow-inner">
                <span className="text-3xl font-black text-primary tracking-tight">
                  {analysis.matchScore || 75}%
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Fit Score
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {analysis.matchGrade || "Strong Match"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp size={13} className="text-emerald-500" />
                    AI Role Audit
                  </span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Skill Keywords */}
          {analysis.suggestedSkills && analysis.suggestedSkills.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Target Skill Keywords from Job Description
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Employers and ATS parsers scan for these specific terms. Click to add missing skills directly into your CV.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {analysis.suggestedSkills.length} identified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {analysis.suggestedSkills.map((skill, idx) => {
                  const inCv = isSkillInCv(skill.name);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30 hover:border-border/80 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {skill.name}
                          </span>
                          {skill.importance === "high" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              High
                            </span>
                          )}
                        </div>
                        {skill.category && (
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {skill.category}
                          </span>
                        )}
                      </div>

                      <div>
                        {inCv ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 size={12} />
                            <span>In CV</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddSkill(skill.name)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white px-2.5 py-1 rounded-lg transition shadow-2xs"
                            title={`Add "${skill.name}" to your CV Skills section`}
                          >
                            <Plus size={12} />
                            <span>Add to CV</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths and Gaps Dual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 size={15} />
                  <span>Matching CV Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {analysis.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {analysis.gaps && analysis.gaps.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                  <AlertTriangle size={15} />
                  <span>Missing or Under-Emphasized Areas</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {analysis.gaps.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actionable Tailoring Tips */}
          {analysis.tailoringTips && analysis.tailoringTips.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Sparkles size={14} className="text-primary" />
                <span>Truthful CV Tailoring Recommendations</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Adjust your bullet points and summary to highlight relevant past experience using terms from the job post, without exaggerating or fabricating facts.
              </p>
              <div className="space-y-2 pt-1">
                {analysis.tailoringTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs p-2 rounded-xl bg-muted/40 text-foreground/90"
                  >
                    <ArrowRight size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset / New scan button */}
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setJobDescription("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl border border-border hover:bg-muted transition"
            >
              <RefreshCw size={13} />
              <span>Test Another Job Description</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
