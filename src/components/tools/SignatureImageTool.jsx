import React, { useState } from "react";
import { Upload, Download, PenTool, RefreshCw, ShieldCheck } from "lucide-react";
import { cleanSignature } from "../../lib/imageUtils";

export default function SignatureImageTool() {
  const [file, setFile] = useState(null);
  const [threshold, setThreshold] = useState(160);
  const [pureBlack, setPureBlack] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    await process(uploaded, threshold, pureBlack);
  }

  async function process(targetFile, threshVal, blackVal) {
    try {
      setLoading(true);
      const res = await cleanSignature(targetFile, {
        threshold: threshVal,
        makePureBlack: blackVal
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to process signature.");
    } finally {
      setLoading(false);
    }
  }

  async function handleThresholdChange(newVal) {
    setThreshold(newVal);
    if (file) {
      await process(file, newVal, pureBlack);
    }
  }

  async function handleBlackToggle(val) {
    setPureBlack(val);
    if (file) {
      await process(file, threshold, val);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (file?.name.replace(/\.[^/.]+$/, "") || "signature") + "_transparent.png";
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
          <PenTool className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Signature Image Cleaner
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Take a photo of your handwritten signature on paper. We remove paper shadows and turn it into a transparent PNG for documents.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Photo of Signature</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% private in browser memory. Never uploaded to a server.</span>
          </p>
        </div>
      )}

      {file && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Paper Removal Sensitivity
                </label>
                <span className="text-xs font-mono text-slate-500">{threshold}</span>
              </div>
              <input
                type="range"
                min="100"
                max="220"
                value={threshold}
                onChange={(e) => handleThresholdChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Slide right if paper shadows are still visible.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Pure Ink Enhancement
                </label>
                <p className="text-[11px] text-slate-500">
                  Enhance faint ballpoint lines to crisp dark ink
                </p>
              </div>
              <input
                type="checkbox"
                checked={pureBlack}
                onChange={(e) => handleBlackToggle(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-center">
              <div className="flex justify-center">
                <div 
                  className="max-w-md w-full rounded-xl overflow-hidden border border-slate-200 p-6 flex items-center justify-center min-h-[160px]"
                  style={{
                    background: "repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 50% / 16px 16px"
                  }}
                >
                  <img
                    src={result.url}
                    alt="Transparent Signature"
                    className="max-h-36 max-w-full object-contain drop-shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Transparent PNG Signature</span>
                </button>
                <button
                  onClick={reset}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clean Another Signature</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
