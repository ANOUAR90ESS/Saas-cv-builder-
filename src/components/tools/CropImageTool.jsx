import React, { useState } from "react";
import { Upload, Download, Crop, RefreshCw, CheckCircle2 } from "lucide-react";
import { cropImage, loadImage } from "../../lib/imageUtils";

export default function CropImageTool() {
  const [file, setFile] = useState(null);
  const [imgObj, setImgObj] = useState(null);
  const [ratio, setRatio] = useState("1:1"); // '1:1' | '4:5' | '16:9' | 'free'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);

  async function handleFile(e) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setResult(null);
    const loaded = await loadImage(uploaded);
    setImgObj(loaded);
  }

  async function handleApplyCrop() {
    if (!file || !imgObj) return;
    try {
      setLoading(true);
      // Determine center crop rect based on selected ratio
      let cropW = imgObj.width;
      let cropH = imgObj.height;

      if (ratio === "1:1") {
        const side = Math.min(imgObj.width, imgObj.height);
        cropW = side;
        cropH = side;
      } else if (ratio === "4:5") {
        const targetRatio = 4 / 5;
        if (imgObj.width / imgObj.height > targetRatio) {
          cropH = imgObj.height;
          cropW = Math.round(cropH * targetRatio);
        } else {
          cropW = imgObj.width;
          cropH = Math.round(cropW / targetRatio);
        }
      } else if (ratio === "16:9") {
        const targetRatio = 16 / 9;
        if (imgObj.width / imgObj.height > targetRatio) {
          cropH = imgObj.height;
          cropW = Math.round(cropH * targetRatio);
        } else {
          cropW = imgObj.width;
          cropH = Math.round(cropW / targetRatio);
        }
      }

      const cropX = Math.round((imgObj.width - cropW) / 2);
      const cropY = Math.round((imgObj.height - cropH) / 2);

      const res = await cropImage(file, {
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to crop image.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.blob) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = (file?.name.replace(/\.[^/.]+$/, "") || "image") + `_cropped.png`;
    a.click();
  }

  function reset() {
    setFile(null);
    setImgObj(null);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {!file && !loading && (
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-12 text-center transition-colors bg-slate-50/50">
          <Crop className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Crop Profile Photos & Headshots
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Frame headshots into square 1:1, portrait 4:5, or landscape ratios for CVs and social profiles.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Photo to Crop</span>
            <input
              type="file"
              accept="image/*"
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
              <span className="text-xs font-bold uppercase text-slate-500">Image</span>
              <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
              <p className="text-xs text-slate-500">{imgObj?.width} × {imgObj?.height} px</p>
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Change file
            </button>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Select Crop Ratio
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "1:1", label: "Square (1:1)", desc: "LinkedIn & CV Avatars" },
                { id: "4:5", label: "Portrait (4:5)", desc: "Standard Headshot" },
                { id: "16:9", label: "Landscape (16:9)", desc: "Banners & Covers" },
                { id: "free", label: "Full Center", desc: "Keep natural balance" }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    ratio === r.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className={`text-[10px] mt-0.5 ${ratio === r.id ? "text-indigo-100" : "text-slate-400"}`}>
                    {r.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-sm mx-auto rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex justify-center">
            {imgObj && (
              <img
                src={imgObj.src}
                alt="Source preview"
                className="max-h-72 object-contain rounded-lg"
              />
            )}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleApplyCrop}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Crop className="w-4 h-4" />
              <span>{loading ? "Cropping..." : `Apply ${ratio} Center Crop`}</span>
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Cropped Image Ready!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {result.width} × {result.height} px
            </p>
          </div>

          <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-200 p-2 bg-slate-50">
            <img
              src={result.url}
              alt="Cropped output"
              className="max-h-60 mx-auto object-contain rounded-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Cropped Photo</span>
            </button>
            <button
              onClick={reset}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Crop Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
