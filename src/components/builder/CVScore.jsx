import React, { useState, useMemo } from "react";
import { useT } from "@/lib/i18n";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  FileCheck2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import { analyzeCvATS } from "@/lib/atsBenchmark";

function scoreColor(score) {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  if (score >= 50) return "text-amber-500 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
}

function scoreBg(score) {
  if (score >= 85) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
  if (score >= 70) return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400";
  if (score >= 50) return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400";
}

function progressBarColor(score, maxScore) {
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export default function CVScore({ cv }) {
  const t = useT();
  const { aiAssist } = useAiAssist();
  
  // Instant simulated ATS benchmark calculation
  const atsResult = useMemo(() => analyzeCvATS(cv), [cv]);

  const [aiData, setAiData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");
  const [expandedCat, setExpandedCat] = useState(null);

  const runAiCheck = async () => {
    setLoadingAi(true);
    setAiError("");
    try {
      const result = await aiAssist("analyze_cv", {
        text: JSON.stringify({
          personal_info: cv.personal_info,
          summary: cv.summary,
          experience: cv.experience,
          education: cv.education,
          skills: cv.skills,
        }),
      });
      setAiData(result || null);
    } catch (e) {
      setAiError(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.score.error"));
    } finally {
      setLoadingAi(false);
    }
  };

  const toggleCat = (id) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  return (
    <div className="space-y-5 text-foreground">
      {/* ATS Benchmark Header Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Radial score badge */}
          <div className="shrink-0 relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-muted/50 border-2 border-border shadow-inner">
            <span className={`text-3xl font-extrabold tracking-tight ${scoreColor(atsResult.overallScore)}`}>
              {atsResult.overallScore}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              / 100 ATS
            </span>
            <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shadow-xs ${scoreBg(atsResult.overallScore)}`}>
              {atsResult.grade}
            </div>
          </div>

          {/* Assessment summary */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                <Target size={13} /> Simulated ATS Benchmark
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${scoreBg(atsResult.overallScore)}`}>
                {atsResult.gradeLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {atsResult.summary}
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                <Zap size={12} className="text-amber-500" />
                {atsResult.stats.actionVerbsCount} Action Verbs
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                <FileCheck2 size={12} className="text-primary" />
                {atsResult.stats.skillsCount} Skills
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                <TrendingUp size={12} className="text-emerald-500" />
                {atsResult.stats.experienceCount} Roles Analyzed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Priority Action Items */}
      {atsResult.actionItems.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
            <AlertTriangle size={15} />
            <span>Top Recommended Improvements for High ATS Pass-Rate</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {atsResult.actionItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Benchmark Dimension Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ATS Benchmark Breakdown
        </h3>

        {atsResult.categories.map((cat) => {
          const isExpanded = expandedCat === cat.id;
          const pct = Math.round((cat.score / cat.maxScore) * 100);

          return (
            <div
              key={cat.id}
              className="rounded-xl border border-border bg-card p-3.5 transition hover:border-border/80"
            >
              <div
                onClick={() => toggleCat(cat.id)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {cat.title}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {cat.score} / {cat.maxScore} <span className="font-normal text-[11px]">({pct}%)</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressBarColor(cat.score, cat.maxScore)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/60 text-xs space-y-2">
                  {cat.passed && cat.passed.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10.5px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        Passed Criteria:
                      </span>
                      {cat.passed.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cat.suggestions && cat.suggestions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10.5px] uppercase font-bold text-amber-600 dark:text-amber-400">
                        Recommended Fixes:
                      </span>
                      {cat.suggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                          <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Deep Scan Option */}
      <div className="pt-2">
        {aiError && <p className="text-xs text-destructive mb-2">{aiError}</p>}

        {aiData ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Sparkles size={14} />
              <span>AI Deep Assessment</span>
            </div>
            <p className="text-xs text-foreground/90">{aiData.summary}</p>
            {aiData.sections && aiData.sections.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {aiData.sections.map((s, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    <strong className="text-foreground">{s.label}: </strong>
                    <span>{s.suggestions?.join("; ") || s.feedback || "Looks good."}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={runAiCheck}
            disabled={loadingAi}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition font-medium text-xs disabled:opacity-60"
          >
            {loadingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Run In-Depth AI Qualitative Review</span>
          </button>
        )}
      </div>
    </div>
  );
}
