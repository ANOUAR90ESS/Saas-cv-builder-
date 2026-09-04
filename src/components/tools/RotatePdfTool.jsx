import React, { useState } from "react";
import { Upload, Download, RotateCw, RotateCcw, CheckCircle2, RefreshCw } from "lucide-react";
import { renderPdfPagesToImages, rotatePdfPages, formatBytes } from "../../lib/pdfUtils";

export default function RotatePdfTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [rotations, setRotations] = useState({}); // { pageIndex: degrees }
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    try {
      setLoading(true);
      setFile(uploaded);
      setResult(null);
      setRotations({});
      const rendered = await renderPdfPagesToImages(uploaded, { scale: 0.8 });
      setPages(rendered);
    } catch (err) {
      console.error(err);
      alert("Failed to load PDF pages.");
    } finally {
      setLoading(false);
    }
  }

  function rotatePage(pageIdx, angleDelta) {
    setRotations((prev) => {
      const current = prev[pageIdx] || 0;
      const next = (current + angleDelta + 360) % 360;
      return { ...prev, [pageIdx]: next };
    });
  }

  function rotateAll(angleDelta) {
    setRotations((prev) => {
      const next = {};
      pages.forEach((_, idx) => {
        const current = prev[idx] || 0;
        next[idx] = (current + angleDelta + 360) % 360;
      });
      return next;
    });
  }

  async function handleSave() {
    if (!file) return;
    try {
      setLoading(true);
      const res = await rotatePdfPages(file, rotations);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to rotate PDF pages.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}_rotated.pdf`;
    a.click();
  }

  function reset() {
    setFile(null);
    setPages([]);
    setRotations({});
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <RotateCw className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Rotate PDF Pages Permanently
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Fix upside-down or sideways pages. Rotate individual pages or the entire document.
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
        </div>
      )}

      {loading && (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading document pages...</p>
        </div>
      )}

      {pages.length > 0 && !result && !loading && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Document</span>
              <p className="text-sm font-bold text-slate-900">{file?.name} ({pages.length} pages)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => rotateAll(90)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-50 shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>
              <button
                onClick={reset}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                title="Change document"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((p, idx) => {
              const rot = rotations[idx] || 0;
              return (
                <div key={p.pageNum} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between">
                  <div className="aspect-[3/4] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                    <img
                      src={p.dataUrl}
                      alt={`Page ${p.pageNum}`}
                      style={{ transform: `rotate(${rot}deg)` }}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700">
                      Page {p.pageNum}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => rotatePage(idx, -90)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                        title="Rotate Left"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => rotatePage(idx, 90)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                        title="Rotate Right"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>Apply Rotation & Save PDF</span>
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
              Rotated PDF Ready!
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
              <span>Download Rotated PDF</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rotate Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
