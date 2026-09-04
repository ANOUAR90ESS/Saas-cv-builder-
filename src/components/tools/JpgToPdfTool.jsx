import React, { useState } from "react";
import { Upload, Download, ImageDown, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { convertImagesToPdf, formatBytes } from "../../lib/pdfUtils";

export default function JpgToPdfTool() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState("A4");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleAddImages(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImages((prev) => [...prev, ...files]);
    setResult(null);
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
  }

  async function handleConvert() {
    if (images.length === 0) return;
    try {
      setLoading(true);
      const res = await convertImagesToPdf(images, { pageSize });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to convert images to PDF.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = "converted_document.pdf";
    a.click();
  }

  function reset() {
    setImages([]);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {images.length === 0 && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <ImageDown className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Convert Images to PDF
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Convert JPG or PNG certificates, diploma photos, and document scans into a standardized PDF.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Images (JPG, PNG)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleAddImages}
              className="hidden"
            />
          </label>
        </div>
      )}

      {images.length > 0 && !result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Selected Images</span>
              <p className="text-sm font-bold text-slate-900">{images.length} image{images.length > 1 ? "s" : ""}</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">Page Size:</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="A4">A4 (Standard)</option>
                <option value="Letter">US Letter</option>
              </select>

              <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                Add More
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleAddImages}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative rounded-xl border border-slate-200 p-2 bg-white flex flex-col items-center">
                <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="h-28 w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 mb-2">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={img.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-700 truncate w-full text-center">
                  {img.name}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleConvert}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <ImageDown className="w-4 h-4" />
              <span>{loading ? "Generating PDF..." : `Convert ${images.length} Image(s) to PDF`}</span>
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              PDF Document Created!
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {result.pageCount} page{result.pageCount > 1 ? "s" : ""} • Size: {formatBytes(result.size)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Generated PDF</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Convert More</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
