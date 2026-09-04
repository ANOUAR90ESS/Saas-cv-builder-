import React, { useState } from "react";
import { Upload, Download, PackageCheck, CheckCircle2, AlertTriangle, Archive } from "lucide-react";
import JSZip from "jszip";
import { mergePdfs, convertImagesToPdf, formatBytes } from "../../lib/pdfUtils";

export default function ApplicationPackageGeneratorTool() {
  const [candidateName, setCandidateName] = useState("Alex Morgan");
  const [cvFile, setCvFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [certs, setCerts] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  const totalBytes = (cvFile?.size || 0) + (coverLetterFile?.size || 0) + certs.reduce((acc, c) => acc + c.size, 0) + (photo?.size || 0);
  const isTooLargeForEmail = totalBytes > 5 * 1024 * 1024;

  async function handleMergeAll() {
    try {
      setLoading(true);
      const pdfsToMerge = [];
      if (cvFile) pdfsToMerge.push(cvFile);
      if (coverLetterFile) pdfsToMerge.push(coverLetterFile);

      for (const cert of certs) {
        if (cert.type === "application/pdf") {
          pdfsToMerge.push(cert);
        } else if (cert.type.startsWith("image/")) {
          const converted = await convertImagesToPdf([cert]);
          pdfsToMerge.push(new File([converted.blob], cert.name + ".pdf", { type: "application/pdf" }));
        }
      }

      if (pdfsToMerge.length === 0) {
        alert("Please add at least your CV or Cover letter.");
        return;
      }

      const merged = await mergePdfs(pdfsToMerge);
      setMergedPdfUrl(merged.url);
    } catch (err) {
      console.error(err);
      alert("Failed to package documents into PDF.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadZip() {
    try {
      setLoading(true);
      const zip = new JSZip();
      const prefix = candidateName.trim().replace(/\s+/g, "_") || "Candidate";

      if (cvFile) zip.file(`${prefix}_CV.pdf`, cvFile);
      if (coverLetterFile) zip.file(`${prefix}_Cover_Letter.pdf`, coverLetterFile);
      if (photo) zip.file(`${prefix}_Photo.${photo.name.split(".").pop()}`, photo);

      certs.forEach((cert, i) => {
        zip.file(`Certificates/${prefix}_Certificate_${i + 1}_${cert.name}`, cert);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prefix}_Application_Package.zip`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Failed to build ZIP archive.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
          Candidate Name (used for standardized file naming)
        </label>
        <input
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          className="w-full max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CV Slot */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">1. CV / Resume (Required)</span>
            <div className="text-sm font-semibold text-slate-800">
              {cvFile ? cvFile.name : "No file selected"}
            </div>
            {cvFile && <span className="text-xs text-slate-400">{formatBytes(cvFile.size)}</span>}
          </div>
          <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer self-start transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{cvFile ? "Change CV" : "Upload CV (PDF)"}</span>
            <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files?.[0])} className="hidden" />
          </label>
        </div>

        {/* Cover Letter Slot */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">2. Cover Letter (Optional)</span>
            <div className="text-sm font-semibold text-slate-800">
              {coverLetterFile ? coverLetterFile.name : "No file selected"}
            </div>
            {coverLetterFile && <span className="text-xs text-slate-400">{formatBytes(coverLetterFile.size)}</span>}
          </div>
          <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer self-start transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{coverLetterFile ? "Change Letter" : "Upload Letter (PDF)"}</span>
            <input type="file" accept=".pdf" onChange={(e) => setCoverLetterFile(e.target.files?.[0])} className="hidden" />
          </label>
        </div>

        {/* Certificates Slot */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">3. Diplomas & Certificates</span>
            <div className="text-sm font-semibold text-slate-800">
              {certs.length > 0 ? `${certs.length} document(s)` : "None added"}
            </div>
            {certs.length > 0 && (
              <span className="text-xs text-slate-400">
                {formatBytes(certs.reduce((a, b) => a + b.size, 0))}
              </span>
            )}
          </div>
          <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer self-start transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Add Certificates</span>
            <input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => setCerts((prev) => [...prev, ...Array.from(e.target.files || [])])}
              className="hidden"
            />
          </label>
        </div>

        {/* Headshot Photo Slot */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">4. Profile Portrait Photo</span>
            <div className="text-sm font-semibold text-slate-800">
              {photo ? photo.name : "None selected"}
            </div>
            {photo && <span className="text-xs text-slate-400">{formatBytes(photo.size)}</span>}
          </div>
          <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer self-start transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{photo ? "Change Photo" : "Upload Photo"}</span>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} className="hidden" />
          </label>
        </div>
      </div>

      {/* Package Size Audit */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-500 block font-medium">Total Dossier Size</span>
          <span className="text-lg font-bold text-slate-800">{formatBytes(totalBytes)}</span>
          <span className="text-xs text-slate-400 ml-2">
            {isTooLargeForEmail ? "(Over 5MB email threshold — consider PDF compression)" : "(Well within standard email and portal upload limits)"}
          </span>
        </div>
        {isTooLargeForEmail && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Package exceeds 5MB</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={handleMergeAll}
          disabled={loading || (!cvFile && !coverLetterFile)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <PackageCheck className="w-4 h-4" />
          <span>{loading ? "Packaging..." : "Merge into Single PDF Dossier"}</span>
        </button>

        <button
          onClick={handleDownloadZip}
          disabled={loading || (!cvFile && !coverLetterFile)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Archive className="w-4 h-4" />
          <span>Download Organized ZIP Archive</span>
        </button>
      </div>

      {mergedPdfUrl && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Unified PDF Dossier ready!</span>
          </div>
          <a
            href={mergedPdfUrl}
            download={`${candidateName.replace(/\s+/g, "_")}_Complete_Application.pdf`}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Dossier</span>
          </a>
        </div>
      )}
    </div>
  );
}
