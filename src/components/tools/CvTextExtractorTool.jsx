import React, { useState } from "react";
import { Upload, Copy, Check, Download, FileText, RefreshCw, AlertCircle } from "lucide-react";
import { extractPdfText } from "../../lib/pdfUtils";

export default function CvTextExtractorTool() {
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setFileName(file.name);
      const res = await extractPdfText(file);
      setExtracted(res);
    } catch (err) {
      console.error(err);
      alert("Could not extract text from this PDF file.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!extracted?.fullText) return;
    navigator.clipboard.writeText(extracted.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadTxt() {
    if (!extracted?.fullText) return;
    const blob = new Blob([extracted.fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.pdf$/i, "") || "cv_text") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setExtracted(null);
    setFileName("");
  }

  return (
    <div className="space-y-6">
      {!extracted && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Extract clean text from your CV PDF
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Extract pure formatted text from your CV ready to paste into online application forms (Workday, Taleo, Greenhouse).
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select PDF CV</span>
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
          <p className="text-sm font-semibold text-slate-700">Extracting text from PDF pages...</p>
        </div>
      )}

      {extracted && !loading && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">Document</span>
              <h4 className="text-sm font-bold text-slate-900">{fileName}</h4>
              <p className="text-xs text-slate-500">
                {extracted.numPages} page{extracted.numPages > 1 ? "s" : ""} • ~{extracted.fullText.split(/\s+/).length} words
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
              <button
                onClick={handleDownloadTxt}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download .txt</span>
              </button>
              <button
                onClick={reset}
                className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-500 transition-colors"
                title="Extract another file"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {extracted.isScanned && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Note: Very little text was extracted. If this is a scanned paper CV, OCR or re-typing in our CV Builder is advised.
              </span>
            </div>
          )}

          <div className="relative">
            <textarea
              value={extracted.fullText}
              readOnly
              rows={16}
              className="w-full font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
