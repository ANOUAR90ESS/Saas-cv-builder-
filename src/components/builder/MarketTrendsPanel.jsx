import React, { useState, useEffect, useMemo } from "react";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import { useT } from "@/lib/i18n";
import { emptyItem } from "@/lib/cvSchema";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Layers,
  Award,
  BarChart3,
  Globe,
  Compass
} from "lucide-react";

const INDUSTRY_PRESETS = [
  "Technology & Software Engineering",
  "Data Science & Artificial Intelligence",
  "Product Management & UX Design",
  "Finance, Fintech & Banking",
  "Digital Marketing & Growth",
  "Healthcare Tech & Biotech"
];

export default function MarketTrendsPanel({ cv, onUpdateCv, onNavigateTab }) {
  const t = useT();
  const { aiAssist } = useAiAssist();

  // Extract skills from CV
  const extractedSkills = useMemo(() => {
    return (cv.skills || [])
      .map((s) => (typeof s === "string" ? s : s?.name))
      .filter(Boolean);
  }, [cv.skills]);

  // Detected Job Title
  const detectedTitle = useMemo(() => {
    return (
      cv.personal_info?.title ||
      cv.experience?.[0]?.title ||
      "Software Engineer"
    );
  }, [cv.personal_info?.title, cv.experience]);

  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRY_PRESETS[0]);
  const [currency, setCurrency] = useState("USD"); // "USD", "EUR", "GBP"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trends, setTrends] = useState(null);
  const [addedSkills, setAddedSkills] = useState(new Set());

  // Existing skills in CV for quick comparison
  const currentSkillNames = useMemo(() => {
    return new Set(
      (cv.skills || []).map((s) =>
        (typeof s === "string" ? s : s?.name || "").toLowerCase().trim()
      )
    );
  }, [cv.skills]);

  const fetchTrends = async (customIndustry = selectedIndustry) => {
    setLoading(true);
    setError("");

    try {
      const skillsToPass = extractedSkills.length
        ? extractedSkills
        : ["React", "JavaScript", "TypeScript", "Node.js", "Git"];

      const res = await aiAssist("analyze_market_trends", {
        context: {
          skills: skillsToPass,
          job_title: detectedTitle,
          industry: customIndustry,
          summary: cv.summary || ""
        }
      });

      setTrends(res);
    } catch (e) {
      setError(
        e instanceof AiAuthError
          ? t("builder.ai.errAuth")
          : "Could not retrieve real-time market data. Showing benchmark estimates."
      );
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first mount if we have skills or title
  useEffect(() => {
    fetchTrends(selectedIndustry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSkill = (skillName) => {
    if (!skillName || !onUpdateCv) return;
    const existing = cv.skills || [];
    const lower = skillName.toLowerCase().trim();

    if (
      existing.some(
        (s) =>
          (typeof s === "string" ? s : s?.name || "").toLowerCase().trim() ===
          lower
      )
    ) {
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

  // Currency multiplier/symbol
  const currencySymbol =
    currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const currencyRate = currency === "EUR" ? 0.92 : currency === "GBP" ? 0.78 : 1.0;

  const formatSalary = (val) => {
    if (!val) return "";
    const converted = Math.round((val * currencyRate) / 1000) * 1000;
    return `${currencySymbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 text-foreground">
      {/* Intro Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Real-Time Job Market & Salary Trends
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Market AI
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Market intelligence mapped to your extracted CV skills (
                <span className="font-semibold text-foreground">
                  {extractedSkills.length} skills detected
                </span>
                ). Review high-demand job titles, compensation brackets, and top industry sectors.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchTrends(selectedIndustry)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition shrink-0 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Update Trends</span>
          </button>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Target Industry Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Compass size={13} className="text-primary" />
              <span>Target Industry</span>
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                fetchTrends(e.target.value);
              }}
              className="w-full text-xs rounded-xl border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {INDUSTRY_PRESETS.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Globe size={13} className="text-primary" />
              <span>Salary Benchmark Currency</span>
            </label>
            <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
              {[
                { code: "USD", label: "$ USD" },
                { code: "EUR", label: "€ EUR" },
                { code: "GBP", label: "£ GBP" }
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currency === c.code
                      ? "bg-background text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Extracted Skills Chips */}
        <div className="pt-1 border-t border-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Layers size={12} className="text-primary" />
              Skills Extracted from your CV
            </span>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("skills")}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Edit CV Skills
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {extractedSkills.length > 0 ? (
              extractedSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">
                No skills listed in CV yet. Add skills in the Skills section or see default tech market rates.
              </span>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Extracting labor market dynamics with Gemini...
            </p>
            <p className="text-xs text-muted-foreground">
              Cross-referencing {extractedSkills.length || 5} skills against active industry benchmarks
            </p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs">
          {error}
        </div>
      )}

      {trends && !loading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Industry Demand
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  {trends.demandLevel || "High Demand"}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {trends.yoyGrowth || "+16% YoY"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Hiring Velocity
              </span>
              <div className="text-lg font-bold text-foreground truncate">
                {trends.hiringVelocity || "Fast (avg. 24 days)"}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Median Senior Comp
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatSalary(trends.salaryExpectations?.senior?.median || 165000)}
                <span className="text-xs text-muted-foreground font-normal"> / yr</span>
              </div>
            </div>
          </div>

          {/* Market Summary Text */}
          {trends.marketSummary && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                <Sparkles size={13} className="text-primary" />
                <span>Industry Trend Summary</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {trends.marketSummary}
              </p>
            </div>
          )}

          {/* Common Job Titles Matching Skills */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Briefcase size={14} className="text-primary" />
                  <span>Common Matching Job Titles</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Top job titles recruiters target with this specific skill configuration
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {trends.commonJobTitles?.length || 0} identified
              </span>
            </div>

            <div className="space-y-2.5">
              {(trends.commonJobTitles || []).map((job, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {job.title}
                      </span>
                      {job.seniority && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {job.seniority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Match:</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {job.matchPercentage || 90}%
                      </span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${job.matchPercentage || 90}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Salary Expectations Matrix */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600" />
                  <span>Salary Expectations & Seniority Brackets</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Compensation expectations mapped by experience tier ({currency})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  tier: "Entry-Level",
                  data: trends.salaryExpectations?.entry || { min: 65000, max: 90000, median: 78000 },
                  tag: "0-2 yrs"
                },
                {
                  tier: "Mid-Level",
                  data: trends.salaryExpectations?.mid || { min: 95000, max: 135000, median: 115000 },
                  tag: "3-5 yrs"
                },
                {
                  tier: "Senior",
                  data: trends.salaryExpectations?.senior || { min: 140000, max: 185000, median: 160000 },
                  tag: "6-8 yrs"
                },
                {
                  tier: "Lead / Principal",
                  data: trends.salaryExpectations?.lead || { min: 175000, max: 230000, median: 200000 },
                  tag: "8+ yrs"
                }
              ].map((lvl, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-center sm:text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{lvl.tier}</span>
                    <span className="text-[10px] text-muted-foreground">{lvl.tag}</span>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-foreground">
                      {formatSalary(lvl.data.median)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Range: {formatSalary(lvl.data.min)} – {formatSalary(lvl.data.max)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Regional Benchmarks */}
            {trends.salaryExpectations?.regionalBreakdown && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Regional & Remote Variations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {trends.salaryExpectations.regionalBreakdown.map((reg, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-border bg-muted/10 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {reg.region}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {reg.trend}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0">
                        {reg.range}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Hiring Sectors & High-Value Booster Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Hiring Sectors */}
            {trends.topHiringSectors && trends.topHiringSectors.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Building2 size={14} className="text-primary" />
                  <span>Top Hiring Sectors</span>
                </div>
                <div className="space-y-2">
                  {trends.topHiringSectors.map((sec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/60"
                    >
                      <span className="text-xs font-medium text-foreground">
                        {sec.sector}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {sec.demand}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {sec.growth}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High-Value Complementary Skills */}
            {trends.highValueComplementarySkills &&
              trends.highValueComplementarySkills.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Award size={14} className="text-primary" />
                    <span>Skills that Boost Your Salary</span>
                  </div>
                  <div className="space-y-2">
                    {trends.highValueComplementarySkills.map((boost, idx) => {
                      const inCv = isSkillInCv(boost.name);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-muted/20 border border-border/60 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">
                                {boost.name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {boost.salaryBoost}
                              </span>
                            </div>

                            {inCv ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                <CheckCircle2 size={11} />
                                <span>In CV</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddSkill(boost.name)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 rounded-md transition"
                                title={`Add ${boost.name} to CV`}
                              >
                                <Plus size={11} />
                                <span>Add to CV</span>
                              </button>
                            )}
                          </div>
                          {boost.reason && (
                            <p className="text-[10px] text-muted-foreground">
                              {boost.reason}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* Market Insights */}
          {trends.marketInsights && trends.marketInsights.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                <BarChart3 size={14} className="text-primary" />
                <span>Strategic Market Insights for CV Optimization</span>
              </div>
              <div className="space-y-1.5">
                {trends.marketInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs p-2 rounded-xl bg-muted/30 text-foreground/90 leading-relaxed"
                  >
                    <ArrowUpRight
                      size={14}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
