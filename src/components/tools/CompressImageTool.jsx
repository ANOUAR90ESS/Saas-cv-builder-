import React, { useState } from "react";
import { Upload, Download, FileArchive, RefreshCw } from "lucide-react";
import { compressImage } from "../../lib/imageUtils";
import { formatBytes } from "../../lib/pdfUtils";

export default function CompressImageTool() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    await process(uploaded, quality);
  }

  async function process(imgFile, qVal) {
    try {
      setLoading(true);
      const res = await compressImage(imgFile, { quality: qVal / 100 });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to compress image.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQualityChange(newVal) {
    setQuality(newVal);
    if (file) {
      await process(file, newVal);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (file?.name.replace(/\.[^/.]+$/, "") || "image") + "_compressed.jpg";
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
          <FileArchive className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Compress JPG, PNG & WebP Images
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Reduce profile photo and portfolio image sizes by up to 80% without noticeable blur.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Image File</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {file && (
        <div className="space-y-6">
          {/* Quality Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-700">
                Compression Quality: {quality}%
              </span>
              <span className="text-xs text-slate-500">
                {quality > 75 ? "High Clarity (Recommended)" : quality > 45 ? "Balanced" : "Maximum Shrink"}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={quality}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Original</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-700">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-emerald-600 block font-bold">Compressed</span>
                  <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
                    {formatBytes(result.compressedSize)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-indigo-600 block font-bold">Saved</span>
                  <span className="text-lg sm:text-xl font-extrabold text-indigo-600">
                    {result.savedPercent}%
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50 p-2">
                  <img
                    src={result.url}
                    alt="Compressed output"
                    className="max-h-64 mx-auto object-contain rounded-lg"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    {result.width} × {result.height} px
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed Image</span>
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
          )}
        </div>
      )}
    </div>
  );
}
