import React, { useState, useEffect } from "react";
import { Download, Copy, Check } from "lucide-react";
import { generateQrCode } from "../../lib/qrUtils";

export default function QrCodeGeneratorTool() {
  const [urlText, setUrlText] = useState("https://linkedin.com/in/yourname");
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [size, setSize] = useState(300);
  const [qrData, setQrData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!urlText.trim()) return;
    generateQrCode(urlText, { size, darkColor })
      .then(setQrData)
      .catch((err) => console.error(err));
  }, [urlText, darkColor, size]);

  function handleDownloadPng() {
    if (!qrData?.pngDataUrl) return;
    const a = document.createElement("a");
    a.href = qrData.pngDataUrl;
    a.download = "cv_qr_code.png";
    a.click();
  }

  function handleDownloadSvg() {
    if (!qrData?.svgUrl) return;
    const a = document.createElement("a");
    a.href = qrData.svgUrl;
    a.download = "cv_qr_code.svg";
    a.click();
  }

  function handleCopyImage() {
    if (!qrData?.pngDataUrl) return;
    fetch(qrData.pngDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        navigator.clipboard.writeText(urlText);
        alert("Copied URL to clipboard!");
      });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Profile URL or Link
            </label>
            <input
              type="text"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder="e.g. https://linkedin.com/in/alexmorgan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Recruiters can scan this with a phone camera from your printed CV to see your live portfolio or LinkedIn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "LinkedIn", val: "https://linkedin.com/in/" },
              { label: "GitHub", val: "https://github.com/" },
              { label: "Portfolio", val: "https://" }
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setUrlText(p.val)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-600 border border-slate-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                QR Code Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-slate-600">{darkColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution (px)
              </label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none"
              >
                <option value={200}>200 × 200 (Standard)</option>
                <option value={300}>300 × 300 (Crisp)</option>
                <option value={500}>500 × 500 (Print High-Res)</option>
              </select>
            </div>
          </div>
        </div>

        {/* QR Preview & Download */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          {qrData ? (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block">
                <img
                  src={qrData.pngDataUrl}
                  alt="Generated QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleDownloadPng}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>
                <button
                  onClick={handleCopyImage}
                  className="px-3 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Generating code...</p>
          )}
        </div>
      </div>
    </div>
  );
}
