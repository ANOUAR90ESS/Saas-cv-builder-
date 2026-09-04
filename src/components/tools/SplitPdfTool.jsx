import React, { useState } from "react";
import { Upload, Download, Split, FileText } from "lucide-react";
import { splitPdf, formatBytes } from "../../lib/pdfUtils";

export default function SplitPdfTool() {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setResults(null);
  }

  async function handleSplit() {
    if (!file) return;
    try {
      setLoading(true);
      const res = await splitPdf(file, ranges);
      setResults(res);
    } catch (err) {
      console.error(err);
      alert("Failed to split PDF. Please verify your page range format.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPart(part) {
    const a = document.createElement("a");
    a.href = part.url;
    a.download = `${file.name.replace(/\.pdf$/i, "")}_${part.name}.pdf`;
    a.click();
  }

  function reset() {
    setFile(null);
    setResults(null);
    setRanges("");
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <Split className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Split PDF Pages
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Separate a multi-page document into individual pages or custom page ranges.
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

      {file && !results && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Change file
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Page Ranges (optional)
            </label>
            <input
              type="text"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g. 1-2, 3-5 (Leave blank to split all pages individually)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Example: &quot;1&quot; for just first page, &quot;1-2, 3&quot; for two parts, or leave blank.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleSplit}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Split className="w-4 h-4" />
              <span>{loading ? "Splitting..." : "Split Document Now"}</span>
            </button>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Split Outputs ({results.length} files generated)
            </h3>
            <button
              onClick={reset}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Split Another Document
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((part, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {part.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {part.pagesCount} page{part.pagesCount > 1 ? "s" : ""} • {formatBytes(part.size)}
                  </span>
                </div>
                <button
                  onClick={() => downloadPart(part)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
