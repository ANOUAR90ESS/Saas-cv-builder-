import React, { useState } from "react";
import { Upload, Download, RefreshCcw, CheckCircle2 } from "lucide-react";
import { convertImage } from "../../lib/imageUtils";
import { formatBytes } from "../../lib/pdfUtils";

export default function ConvertImageTool() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setResult(null);
  }

  async function handleConvert() {
    if (!file) return;
    try {
      setLoading(true);
      const res = await convertImage(file, targetFormat);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to convert image format.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}.${result.extension}`;
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
          <RefreshCcw className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Convert Image Format
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Switch between JPG, PNG, and WebP instantly in your browser.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Image to Convert</span>
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
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Source File</span>
              <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Change file
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Target Output Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { mime: "image/jpeg", label: "JPG / JPEG", desc: "Best for photos & small size" },
                { mime: "image/png", label: "PNG", desc: "Lossless with transparency" },
                { mime: "image/webp", label: "WebP", desc: "Modern web standard" }
              ].map((fmt) => (
                <button
                  key={fmt.mime}
                  onClick={() => setTargetFormat(fmt.mime)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetFormat === fmt.mime
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold">{fmt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${targetFormat === fmt.mime ? "text-indigo-100" : "text-slate-400"}`}>
                    {fmt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleConvert}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>{loading ? "Converting..." : "Convert Format Now"}</span>
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
              Image Converted to .{result.extension.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              New Size: {formatBytes(result.size)}
            </p>
          </div>

          <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-200 p-2 bg-slate-50">
            <img
              src={result.url}
              alt="Converted output"
              className="max-h-60 mx-auto object-contain rounded-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download .{result.extension.toUpperCase()}</span>
            </button>
            <button
              onClick={reset}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Convert Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
