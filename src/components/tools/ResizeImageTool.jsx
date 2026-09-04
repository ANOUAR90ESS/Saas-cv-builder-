import React, { useState } from "react";
import { Upload, Download, Scaling, RefreshCw, CheckCircle2, Lock, Unlock } from "lucide-react";
import { resizeImage } from "../../lib/imageUtils";
import { formatBytes } from "../../lib/pdfUtils";

const PRESETS = [
  { label: "LinkedIn Profile (400×400)", w: 400, h: 400 },
  { label: "Passport Photo (600×600)", w: 600, h: 600 },
  { label: "CV Avatar (300×300)", w: 300, h: 300 },
  { label: "LinkedIn Banner (1584×396)", w: 1584, h: 396 },
  { label: "Full HD (1920×1080)", w: 1920, h: 1080 }
];

export default function ResizeImageTool() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);
  const [lockAspect, setLockAspect] = useState(true);
  const [origRatio, setOrigRatio] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setResult(null);

    const img = new Image();
    const url = URL.createObjectURL(uploaded);
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setOrigRatio(img.width / img.height);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function handleWidthChange(val) {
    const w = parseInt(val, 10) || 0;
    setWidth(w);
    if (lockAspect && origRatio && w > 0) {
      setHeight(Math.round(w / origRatio));
    }
  }

  function handleHeightChange(val) {
    const h = parseInt(val, 10) || 0;
    setHeight(h);
    if (lockAspect && origRatio && h > 0) {
      setWidth(Math.round(h * origRatio));
    }
  }

  function applyPreset(p) {
    setWidth(p.w);
    setHeight(p.h);
  }

  async function handleResize() {
    if (!file || !width || !height) return;
    try {
      setLoading(true);
      const res = await resizeImage(file, {
        width,
        height,
        maintainAspect: lockAspect
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to resize image.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (file?.name.replace(/\.[^/.]+$/, "") || "image") + `_${result.width}x${result.height}.jpg`;
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
          <Scaling className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Resize Images to Dimensions or Presets
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Scale photos for LinkedIn headshots, passport criteria, or custom pixel dimensions.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Image File</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {file && !result && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Popular Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Width & Height inputs */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Width (pixels)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (pixels)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-1 hover:underline"
              >
                {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockAspect ? "Aspect ratio locked" : "Free dimensions (may stretch)"}</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleResize}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Scaling className="w-4 h-4" />
              <span>{loading ? "Resizing..." : `Resize to ${width} × ${height} px`}</span>
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Image Successfully Resized!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dimensions: {result.width} × {result.height} px • Size: {formatBytes(result.size)}
            </p>
          </div>

          <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-200 p-2 bg-slate-50">
            <img
              src={result.url}
              alt="Resized output"
              className="max-h-60 mx-auto object-contain rounded-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Resized Image</span>
            </button>
            <button
              onClick={reset}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resize Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
