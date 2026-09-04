import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { extractPdfText, formatBytes } from "../../lib/pdfUtils";
import { analyzeCvContent } from "../../lib/cvCheckerUtils";
import { loadAllCVs } from "../../lib/cvStorage";

export default function CvCheckerTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const localCvs = loadAllCVs();

  async function handleFileUpload(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    processFile(uploaded);
  }

  async function processFile(uploadedFile) {
    try {
      setLoading(true);
      setError("");
      setFile(uploadedFile);

      if (uploadedFile.type === "application/pdf" || uploadedFile.name.endsWith(".pdf")) {
        const { fullText, isScanned } = await extractPdfText(uploadedFile);
        const analysis = analyzeCvContent({
          text: fullText,
          file: uploadedFile
        });
        setReport({ ...analysis, isScanned, fullText });
      } else {
        // Plain text or fallback
        const text = await uploadedFile.text();
        const analysis = analyzeCvContent({ text, file: uploadedFile });
        setReport({ ...analysis, fullText: text });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to parse the file. Please ensure it is a valid PDF or text document.");
    } finally {
      setLoading(false);
    }
  }

  function handleCheckLocalCv(cv) {
    setLoading(true);
    setFile({ name: cv.name || "DexaCV Document", size: 450 * 1024 });
    const text = [
      cv.personal?.full_name,
      cv.personal?.email,
      cv.personal?.phone,
      cv.personal?.location,
      cv.personal?.summary,
      ...(Array.isArray(cv.experience) ? cv.experience.map((e) => `${e.job_title} at ${e.company}. ${e.description} ${(e.bullet_points || []).join(" ")}`) : []),
      ...(Array.isArray(cv.skills) ? cv.skills.map((s) => s.name || s) : []),
      ...(Array.isArray(cv.education) ? cv.education.map((ed) => `${ed.degree} at ${ed.institution}`) : [])
    ].join("\n");

    const analysis = analyzeCvContent({ text, cvData: cv });
    setReport({ ...analysis, fullText: text });
    setLoading(false);
  }

  function reset() {
    setFile(null);
    setReport(null);
    setError("");
  }

  return (
    <div className="space-y-8">
      {!report && !loading && (
        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Upload your CV to check ATS compatibility
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Drop your PDF or DOCX file here. Analysis runs in your browser with complete privacy.
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
              <Upload className="w-4 h-4" />
              <span>Select CV Document</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-3">PDF, DOCX up to 15MB</p>
          </div>

          {/* Or Pick an existing DexaCV document */}
          {localCvs.length > 0 && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Or audit a CV created in DexaCV:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {localCvs.map((cv) => (
                  <button
                    key={cv.id}
                    onClick={() => handleCheckLocalCv(cv)}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {cv.name || "Untitled CV"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Audit →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 space-y-4">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-base font-semibold text-slate-800">
            Analyzing CV structure & ATS parsing...
          </p>
          <p className="text-xs text-slate-500">
            Checking sections, metrics, contact details, and file attributes
          </p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-8">
          {/* Top Score Summary Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-6">
              {/* Circular Score Display */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full bg-white/10 border-4 border-indigo-400">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-white">
                    {report.score}
                  </span>
                  <span className="text-xs text-slate-300 block -mt-1">/100</span>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {report.score >= 80 ? "Excellent ATS Readiness" : report.score >= 65 ? "Good Baseline – Minor Fixes" : "Needs Optimization"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {file?.name || "CV Analysis"}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {report.wordCount} words detected • {file?.size ? formatBytes(file.size) : "Standard size"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Another CV</span>
              </button>
              <Link
                to="/builder"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fix in CV Builder</span>
              </Link>
            </div>
          </div>

          {/* Scanned Warning if detected */}
          {report.isScanned && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Scanned / Raster PDF Warning</h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  This PDF appears to be a scanned image or photo of paper. Most ATS robots (Workday, Greenhouse, Lever) cannot extract text from raster images. Create a clean digital PDF with our CV Builder for 100% readability.
                </p>
              </div>
            </div>
          )}

          {/* Actionable Issues & Improvements */}
          {report.issues.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Recommended Fixes ({report.issues.length})</span>
              </h3>
              <div className="space-y-3">
                {report.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      issue.type === "critical"
                        ? "bg-rose-50/50 border-rose-200"
                        : "bg-amber-50/40 border-amber-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {issue.type === "critical" ? (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {issue.category}
                          </span>
                          {issue.type === "critical" && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                              High Priority
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {issue.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    </div>
                    {issue.fixAction && (
                      <Link
                        to={issue.fixAction}
                        className="shrink-0 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:border-indigo-300 transition-all inline-flex items-center gap-1 self-start sm:self-auto shadow-xs"
                      >
                        <span>{issue.fixLabel || "Fix"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passed Checks */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Passed ATS Criteria ({report.passes.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.passes.map((pass, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {pass.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {pass.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {pass.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
