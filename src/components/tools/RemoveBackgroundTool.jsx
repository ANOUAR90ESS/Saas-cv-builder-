import React, { useState } from "react";
import { Upload, Download, Eraser, RefreshCw } from "lucide-react";
import { removeImageBackground } from "../../lib/imageUtils";

export default function RemoveBackgroundTool() {
  const [file, setFile] = useState(null);
  const [backdrop, setBackdrop] = useState("transparent"); // 'transparent' | 'white' | 'blue'
  const [tolerance, setTolerance] = useState(35);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    await process(uploaded, backdrop, tolerance);
  }

  async function process(targetFile, targetColor, tolVal) {
    try {
      setLoading(true);
      const res = await removeImageBackground(targetFile, {
        targetColor,
        tolerance: tolVal
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to process background.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackdropChange(newColor) {
    setBackdrop(newColor);
    if (file) {
      await process(file, newColor, tolerance);
    }
  }

  async function handleToleranceChange(val) {
    setTolerance(val);
    if (file) {
      await process(file, backdrop, val);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (file?.name.replace(/\.[^/.]+$/, "") || "photo") + `_clean_bg.${backdrop === "transparent" ? "png" : "jpg"}`;
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
          <Eraser className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Clean Photo Background for CV & Profile
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Replace cluttered snapshot backdrops with transparent PNG, crisp white studio, or soft blue.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Headshot Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {file && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Backdrop Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "transparent", label: "Transparent" },
                  { id: "white", label: "Studio White" },
                  { id: "blue", label: "Soft Blue" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleBackdropChange(opt.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      backdrop === opt.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tolerance Threshold
                </label>
                <span className="text-xs font-mono text-slate-500">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={tolerance}
                onChange={(e) => handleToleranceChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-center">
              <div className="flex justify-center">
                <div 
                  className="max-w-xs rounded-xl overflow-hidden border border-slate-200 p-2"
                  style={{
                    background: backdrop === "transparent"
                      ? "repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 50% / 16px 16px"
                      : "transparent"
                  }}
                >
                  <img
                    src={result.url}
                    alt="Processed output"
                    className="max-h-64 mx-auto object-contain rounded-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Processed Photo</span>
                </button>
                <button
                  onClick={reset}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Process Another</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
