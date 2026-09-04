import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Gauge, CheckCircle2, XCircle, ArrowRight, RefreshCw, FileText } from "lucide-react";
import { formatBytes, getPdfPageCount } from "../../lib/pdfUtils";

const PORTAL_LIMITS = [
  { name: "Workday Portal", limitBytes: 5 * 1024 * 1024, limitStr: "5 MB" },
  { name: "Taleo / Oracle", limitBytes: 2 * 1024 * 1024, limitStr: "2 MB" },
  { name: "Greenhouse / Lever", limitBytes: 10 * 1024 * 1024, limitStr: "10 MB" },
  { name: "Email Application Attachment", limitBytes: 10 * 1024 * 1024, limitStr: "10 MB (safe limit)" },
  { name: "Government & Academic Portals", limitBytes: 2 * 1024 * 1024, limitStr: "2 MB" }
];

export default function FileSizeCheckerTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [imageDims, setImageDims] = useState(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setPageCount(null);
    setImageDims(null);

    if (uploaded.type === "application/pdf") {
      try {
        const count = await getPdfPageCount(uploaded);
        setPageCount(count);
      } catch (err) {
        console.error(err);
      }
    } else if (uploaded.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        setImageDims({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(uploaded);
    }
  }

  function reset() {
    setFile(null);
    setPageCount(null);
    setImageDims(null);
  }

  return (
    <div className="space-y-6">
      {!file && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <Gauge className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Check Document File Size & Portal Compliance
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Verify whether your CV, certificate, or portfolio meets upload limits for major application portals.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select File to Check</span>
            <input
              type="file"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {file && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{file.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-indigo-600 text-sm">{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>{file.type || "Document"}</span>
                  {pageCount && (
                    <>
                      <span>•</span>
                      <span>{pageCount} page{pageCount > 1 ? "s" : ""}</span>
                    </>
                  )}
                  {imageDims && (
                    <>
                      <span>•</span>
                      <span>{imageDims.width} × {imageDims.height} px</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {file.type === "application/pdf" && file.size > 2 * 1024 * 1024 && (
                <Link
                  to="/tools/compress-pdf"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <span>Compress PDF</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              {file.type.startsWith("image/") && file.size > 1 * 1024 * 1024 && (
                <Link
                  to="/tools/compress-image"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <span>Compress Image</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              <button
                onClick={reset}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"
                title="Check another file"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Application Portal Compatibility Matrix:
            </h4>
            <div className="space-y-2.5">
              {PORTAL_LIMITS.map((portal, idx) => {
                const passes = file.size <= portal.limitBytes;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      passes ? "bg-white border-slate-200" : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {passes ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <span className="text-sm font-semibold text-slate-800 block">
                          {portal.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Maximum limit: {portal.limitStr}
                        </span>
                      </div>
                    </div>

                    <div>
                      {passes ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Passes Limit
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          Exceeds Limit
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
