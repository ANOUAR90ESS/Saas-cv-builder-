import React, { useState } from "react";
import { Upload, Download, FileSignature } from "lucide-react";
import { generateStandardCvFileNames } from "../../lib/applicationUtils";
import { loadAllCVs } from "../../lib/cvStorage";

export default function CvFileRenamerTool() {
  const [file, setFile] = useState(null);
  const [fullName, setFullName] = useState("Alex Morgan");
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer");
  const localCvs = loadAllCVs();

  const options = generateStandardCvFileNames({
    fullName: fullName || "Candidate",
    jobTitle: jobTitle || "Professional"
  });

  function handleFileUpload(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
  }

  function handleSelectLocal(cv) {
    setFullName(cv.personal?.full_name || cv.name || "Alex Morgan");
    setJobTitle(cv.personal?.professional_title || "Professional");
    // Create a mock blob if needed
    const blob = new Blob(["DexaCV CV Content"], { type: "application/pdf" });
    setFile(new File([blob], `${cv.name || "CV"}.pdf`, { type: "application/pdf" }));
  }

  function handleDownloadWithNewName(filename) {
    if (!file) {
      alert("Please upload your CV file first to download it with the new name.");
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Your Information
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Job Title / Role
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {localCvs.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-slate-500 block mb-2 font-medium">
                Or fill from existing CV:
              </span>
              <div className="flex flex-wrap gap-2">
                {localCvs.slice(0, 3).map((cv) => (
                  <button
                    key={cv.id}
                    onClick={() => handleSelectLocal(cv)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-700 border border-slate-200 transition-colors"
                  >
                    {cv.name || "CV"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Attach CV File to Rename
          </h3>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50">
            {file ? (
              <div className="space-y-2">
                <FileSignature className="w-8 h-8 text-indigo-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Ready to rename</p>
                <label className="inline-block text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                  Change file
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <span className="text-xs font-semibold text-indigo-600 block">
                  Select CV file to rename
                </span>
                <span className="text-[11px] text-slate-400 block">PDF, DOCX, or any file</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          3. Choose Professional Naming Scheme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-700">{opt.label}</span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-2 rounded-lg break-all select-all">
                  {opt.filename}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-normal">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(opt.filename);
                    alert(`Copied "${opt.filename}" to clipboard!`);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Copy Name
                </button>
                <button
                  onClick={() => handleDownloadWithNewName(opt.filename)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Renamed</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
