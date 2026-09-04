import React, { useState } from "react";
import { Upload, Download, Layers, Trash2, ArrowLeft, ArrowRight, RotateCw, CheckCircle2, RefreshCw } from "lucide-react";
import { renderPdfPagesToImages, organizePdf, formatBytes } from "../../lib/pdfUtils";

export default function PdfOrganizerTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]); // [{ origIdx, pageNum, dataUrl, rotation }]
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    try {
      setLoading(true);
      setFile(uploaded);
      setResult(null);
      const rendered = await renderPdfPagesToImages(uploaded, { scale: 0.8 });
      setPages(
        rendered.map((p, idx) => ({
          origIdx: idx,
          pageNum: p.pageNum,
          dataUrl: p.dataUrl,
          rotation: 0
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to read PDF document.");
    } finally {
      setLoading(false);
    }
  }

  function moveLeft(idx) {
    if (idx === 0) return;
    setPages((prev) => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
      return arr;
    });
  }

  function moveRight(idx) {
    if (idx === pages.length - 1) return;
    setPages((prev) => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
      return arr;
    });
  }

  function deletePage(idx) {
    if (pages.length <= 1) {
      alert("Document must have at least one page.");
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== idx));
  }

  function rotatePage(idx) {
    setPages((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], rotation: (arr[idx].rotation + 90) % 360 };
      return arr;
    });
  }

  async function handleSave() {
    if (!file || pages.length === 0) return;
    try {
      setLoading(true);
      const pageOperations = pages.map((p) => ({
        sourceIndex: p.origIdx,
        rotation: p.rotation
      }));
      const res = await organizePdf(file, pageOperations);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to organize PDF.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}_organized.pdf`;
    a.click();
  }

  function reset() {
    setFile(null);
    setPages([]);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <Layers className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Visual PDF Page Organizer
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Reorder pages, delete blank sheets, and rotate page angles visually.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select PDF Document</span>
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
          <p className="text-sm font-semibold text-slate-700">Loading page thumbnails...</p>
        </div>
      )}

      {pages.length > 0 && !result && !loading && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Workspace</span>
              <p className="text-sm font-bold text-slate-900">{pages.length} page{pages.length > 1 ? "s" : ""} active</p>
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Choose different file
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between"
              >
                <div className="aspect-[3/4] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-3 relative">
                  <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center justify-center z-10">
                    {idx + 1}
                  </span>
                  <img
                    src={p.dataUrl}
                    alt={`Page ${idx + 1}`}
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveLeft(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-20"
                      title="Move left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveRight(idx)}
                      disabled={idx === pages.length - 1}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-20"
                      title="Move right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => rotatePage(idx)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => deletePage(idx)}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Reorganized PDF ({pages.length} Pages)</span>
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
              Reorganized PDF Ready!
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
              <span>Download PDF</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Organize Another Document</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
