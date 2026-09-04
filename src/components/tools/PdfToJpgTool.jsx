import React, { useState } from "react";
import { Upload, Download, FileImage, RefreshCw } from "lucide-react";
import { renderPdfPagesToImages } from "../../lib/pdfUtils";

export default function PdfToJpgTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    try {
      setLoading(true);
      setFile(uploaded);
      const rendered = await renderPdfPagesToImages(uploaded, { scale: 1.5 });
      setPages(rendered);
    } catch (err) {
      console.error(err);
      alert("Failed to render PDF pages. Please verify the file is a valid PDF.");
    } finally {
      setLoading(false);
    }
  }

  function downloadImage(page) {
    const a = document.createElement("a");
    a.href = page.dataUrl;
    a.download = `${file.name.replace(/\.pdf$/i, "")}_page_${page.pageNum}.jpg`;
    a.click();
  }

  function downloadAll() {
    pages.forEach((p) => downloadImage(p));
  }

  function reset() {
    setFile(null);
    setPages([]);
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <FileImage className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Convert PDF to JPG Images
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Render your PDF pages into high-resolution JPG images for portfolio sharing or previews.
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
          <p className="text-sm font-semibold text-slate-700">Rendering high-res pages to JPG...</p>
        </div>
      )}

      {pages.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Rendered Pages</span>
              <p className="text-sm font-bold text-slate-900">{pages.length} page{pages.length > 1 ? "s" : ""} from {file?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadAll}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Images</span>
              </button>
              <button
                onClick={reset}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-600"
                title="Convert another"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pages.map((p) => (
              <div key={p.pageNum} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between">
                <div className="border border-slate-100 rounded-lg overflow-hidden mb-3 bg-slate-50 flex items-center justify-center">
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.pageNum}`}
                    className="w-full h-auto max-h-72 object-contain"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700">
                    Page {p.pageNum}
                  </span>
                  <button
                    onClick={() => downloadImage(p)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-semibold text-slate-700 inline-flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JPG</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
