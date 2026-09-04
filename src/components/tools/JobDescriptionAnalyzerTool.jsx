import React, { useState } from "react";
import { SearchCode, CheckCircle2, AlertTriangle, Sparkles, FileText } from "lucide-react";
import { analyzeJobDescription } from "../../lib/applicationUtils";
import { loadAllCVs } from "../../lib/cvStorage";
import { extractPdfText } from "../../lib/pdfUtils";

export default function JobDescriptionAnalyzerTool() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [selectedCv, setSelectedCv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const localCvs = loadAllCVs();

  function handleSelectCv(cv) {
    setSelectedCv(cv);
    const text = [
      cv.personal?.full_name,
      cv.personal?.summary,
      ...(Array.isArray(cv.skills) ? cv.skills.map((s) => s.name || s) : []),
      ...(Array.isArray(cv.experience) ? cv.experience.map((e) => `${e.job_title} ${e.description}`) : [])
    ].join(" ");
    setCvText(text);
  }

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { fullText } = await extractPdfText(file);
      setCvText(fullText);
      setSelectedCv({ name: file.name });
    } catch (err) {
      console.error(err);
      alert("Failed to parse PDF.");
    }
  }

  function handleAnalyze() {
    if (!jobDescription.trim()) {
      alert("Please paste the job description first.");
      return;
    }
    setLoading(true);
    try {
      const res = analyzeJobDescription({
        jobDescription,
        cvText,
        cvData: selectedCv
      });
      setAnalysis(res);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to analyze.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnalysis(null);
  }

  return (
    <div className="space-y-6">
      {!analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Paste Target Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting requirements, skills, and qualifications here..."
                rows={10}
                className="w-full p-4 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Select or Paste Your CV
              </label>

              {localCvs.length > 0 && (
                <div>
                  <span className="text-xs text-slate-500 block mb-2 font-medium">
                    Use an existing DexaCV profile:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {localCvs.map((cv) => (
                      <button
                        key={cv.id}
                        onClick={() => handleSelectCv(cv)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selectedCv?.id === cv.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {cv.name || "CV"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs text-slate-500 block mb-2 font-medium">
                  Or upload a PDF CV:
                </span>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedCv?.name || "Upload CV PDF"}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-2 font-medium">
                  Or paste CV text directly:
                </span>
                <textarea
                  value={cvText}
                  onChange={(e) => {
                    setCvText(e.target.value);
                    setSelectedCv(null);
                  }}
                  placeholder="Summary, skills, and past work history..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim()}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <SearchCode className="w-4 h-4" />
              <span>{loading ? "Analyzing Keywords..." : "Analyze Match & Keywords"}</span>
            </button>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-indigo-400 flex items-center justify-center shrink-0">
                <span className="text-2xl font-extrabold text-white">
                  {analysis.matchPercentage}%
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block mb-1">
                  Estimated Keyword Match
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {analysis.matchPercentage >= 75 ? "Strong Role Alignment" : "Partial Alignment – Tailoring Recommended"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {analysis.matchedKeywords.length} matched • {analysis.missingKeywords.length} missing high-frequency terms
                </p>
              </div>
            </div>

            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all shrink-0"
            >
              Analyze Another Posting
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-5 space-y-3">
              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Found in Your CV ({analysis.matchedKeywords.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold"
                  >
                    {kw}
                  </span>
                ))}
                {analysis.matchedKeywords.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No exact skill matches identified yet.</p>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-5 space-y-3">
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Missing Key Terms ({analysis.missingKeywords.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-800 text-xs font-semibold"
                  >
                    {kw}
                  </span>
                ))}
                {analysis.missingKeywords.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No missing high-frequency keywords found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Tailoring Recommendations</span>
            </h4>
            <div className="space-y-2.5">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
