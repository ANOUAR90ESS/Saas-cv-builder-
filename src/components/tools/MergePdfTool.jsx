import React, { useState } from "react";
import { Upload, Download, Combine, Trash2, ArrowUp, ArrowDown, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { mergePdfs, formatBytes } from "../../lib/pdfUtils";

export default function MergePdfTool() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleFileAdd(e) {
    const uploaded = Array.from(e.target.files || []);
    if (uploaded.length === 0) return;
    setFiles((prev) => [...prev, ...uploaded]);
    setResult(null);
  }

  function moveUp(index) {
    if (index === 0) return;
    setFiles((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      return arr;
    });
  }

  function moveDown(index) {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      return arr;
    });
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  async function handleMerge() {
    if (files.length < 2) {
      alert("Please add at least 2 PDF files to merge.");
      return;
    }

    try {
      setLoading(true);
      const res = await mergePdfs(files);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to merge PDF files. Please ensure files are not password-protected.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = "merged_application_documents.pdf";
    a.click();
  }

  function reset() {
    setFiles([]);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {/* File Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-slate-50/50">
        <Combine className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Add PDF documents to merge
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          Combine CV, cover letter, references, and credentials into one ordered file.
        </p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer shadow-sm transition-all">
          <Upload className="w-4 h-4" />
          <span>Add PDF Files</span>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileAdd}
            className="hidden"
          />
        </label>
      </div>

      {/* Files List */}
      {files.length > 0 && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">
              Files to Merge ({files.length})
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-sm font-semibold text-slate-800 block truncate">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === files.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleMerge}
              disabled={loading || files.length < 2}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Combine className="w-4 h-4" />
              <span>{loading ? "Merging..." : `Merge ${files.length} PDFs into One`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              PDFs Successfully Merged!
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {result.pageCount} total pages • Size: {formatBytes(result.size)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Merged PDF</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Merge Other Files</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
