import React, { useState } from "react";
import { Upload, Download, Minimize2, RefreshCw } from "lucide-react";
import { compressPdf, formatBytes } from "../../lib/pdfUtils";

export default function CompressPdfTool() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState("recommended");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setResult(null);
    await runCompression(uploaded, level);
  }

  async function runCompression(targetFile, targetLevel) {
    try {
      setLoading(true);
      const res = await compressPdf(targetFile, targetLevel);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to compress PDF. Please check if the file is encrypted or corrupted.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLevelChange(newLevel) {
    setLevel(newLevel);
    if (file) {
      await runCompression(file, newLevel);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (file?.name.replace(/\.pdf$/i, "") || "document") + "_compressed.pdf";
    a.click();
  }

  function reset() {
    setFile(null);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Minimize2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Compress PDF Document
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Reduce file size below upload limits (2MB/5MB) while keeping text razor sharp.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select PDF File</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-400 mt-3">Processes 100% locally in your browser</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Compressing & optimizing PDF streams...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {/* Compression Level Selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Compression Level
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: "low", label: "Light Clean", desc: "Best quality, minor reduction" },
                { id: "recommended", label: "Balanced", desc: "Optimal for CVs & ATS portals" },
                { id: "extreme", label: "Maximum", desc: "Smallest size for strict limits" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleLevelChange(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    level === opt.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${level === opt.id ? "text-indigo-100" : "text-slate-400"}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Original</span>
                <span className="text-lg sm:text-2xl font-bold text-slate-700">
                  {formatBytes(result.originalSize)}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-600 block font-bold">Compressed</span>
                <span className="text-lg sm:text-2xl font-extrabold text-emerald-600">
                  {formatBytes(result.compressedSize)}
                </span>
              </div>
              <div>
                <span className="text-xs text-indigo-600 block font-bold">Saved</span>
                <span className="text-lg sm:text-2xl font-extrabold text-indigo-600">
                  {result.savedPercent}%
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed PDF</span>
              </button>
              <button
                onClick={reset}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Compress Another</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
