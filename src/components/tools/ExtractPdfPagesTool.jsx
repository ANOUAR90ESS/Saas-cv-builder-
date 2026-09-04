import React, { useState } from "react";
import { Upload, Download, FileCheck2, CheckCircle2, RefreshCw } from "lucide-react";
import { extractPdfPages, getPdfPageCount, formatBytes } from "../../lib/pdfUtils";

export default function ExtractPdfPagesTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    try {
      setLoading(true);
      setFile(uploaded);
      setResult(null);
      const count = await getPdfPageCount(uploaded);
      setPageCount(count);
      setSelectedPages(new Set([1]));
    } catch (err) {
      console.error(err);
      alert("Failed to read PDF pages.");
    } finally {
      setLoading(false);
    }
  }

  function togglePage(pageNum) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        if (next.size > 1) next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  }

  async function handleExtract() {
    if (!file || selectedPages.size === 0) return;
    try {
      setLoading(true);
      const sorted = Array.from(selectedPages).sort((a, b) => a - b);
      const res = await extractPdfPages(file, sorted);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to extract pages.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}_extracted.pdf`;
    a.click();
  }

  function reset() {
    setFile(null);
    setPageCount(0);
    setSelectedPages(new Set());
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <FileCheck2 className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Extract Specific PDF Pages
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Choose exact pages from any PDF document and bundle them into a clean new file.
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

      {file && !result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Document</span>
              <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
              <p className="text-xs text-slate-500">
                {pageCount} total page{pageCount > 1 ? "s" : ""} • Select pages to extract
              </p>
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Change file
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-slate-700">
                Click pages to select/deselect ({selectedPages.size} selected):
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)))}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setSelectedPages(new Set([1]))}
                  className="text-xs text-slate-500 hover:underline font-medium"
                >
                  Only Page 1
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedPages.has(num);
                return (
                  <button
                    key={num}
                    onClick={() => togglePage(num)}
                    className={`aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-lg">{num}</span>
                    <span className="text-[10px] uppercase font-semibold">Page</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleExtract}
              disabled={loading || selectedPages.size === 0}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? "Extracting..." : `Extract ${selectedPages.size} Page(s) into New PDF`}</span>
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
              Pages Successfully Extracted!
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              New PDF with {result.pageCount} page{result.pageCount > 1 ? "s" : ""} • Size: {formatBytes(result.size)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Extracted PDF</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Extract From Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
