import React, { useState } from "react";
import { Upload, FileCode, Download, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { extractPdfText, formatBytes } from "../../lib/pdfUtils";
import { createDocxFromText } from "../../lib/docxExport";

export default function PdfToWordTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setFileName(file.name);
      const { fullText, isScanned } = await extractPdfText(file);
      const docxTitle = file.name.replace(/\.pdf$/i, "");
      const docxResult = await createDocxFromText(fullText, docxTitle);
      setResult({
        ...docxResult,
        previewText: fullText.slice(0, 800),
        isScanned
      });
    } catch (err) {
      console.error(err);
      alert("Failed to convert PDF to Word document.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (fileName.replace(/\.pdf$/i, "") || "document") + ".docx";
    a.click();
  }

  function reset() {
    setResult(null);
    setFileName("");
  }

  return (
    <div className="space-y-6">
      {!result && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <FileCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Convert PDF to Editable Word (.docx)
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Convert your PDF into an editable Word document format compatible with Microsoft Word, Google Docs, and LibreOffice.
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
          <p className="text-sm font-semibold text-slate-700">Converting PDF structure to Word (.docx)...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Word (.docx) Document Ready!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Converted from {fileName} • Size: {formatBytes(result.size)}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download .docx</span>
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert Another</span>
              </button>
            </div>
          </div>

          {result.isScanned && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Note: This PDF has limited selectable text. Text from scanned images cannot be converted directly into Word paragraphs without manual transcription.
              </span>
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Extracted Content Preview:
            </h4>
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
              {result.previewText}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
