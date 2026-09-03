import React, { useState } from "react";
import { useT } from "@/lib/i18n";
import { Linkedin, Loader2, Upload, Wand2 } from "lucide-react";
import { uploadFile } from "@/api/backend";
import { useAiAssist } from "@/lib/aiAssist";
import { uid } from "@/lib/cvSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Imports professional history from a LinkedIn profile — either pasted text/HTML
// or an uploaded LinkedIn PDF/HTML export — and merges it into the current CV.
export default function ImportDialog({ open, onClose, onImport }) {
  const t = useT();
  const { importProfile } = useAiAssist();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setText("");
    setFileName("");
    setFileUrl("");
    setError("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    try {
      setFileName(f.name);
      setFileUrl(await uploadFile(f));
    } catch {
      setError(t("builder.import.errUpload"));
    }
  };

  const mapLevel = (raw) => {
    const m = String(raw || "").match(/\(([^)]+)\)\s*$/);
    return m ? m[1] : "Fluent";
  };
  const stripLevel = (raw) => String(raw || "").replace(/\s*\([^)]*\)\s*$/, "").trim();

  const run = async () => {
    if (!text.trim() && !fileUrl) {
      setError(t("builder.import.errEmpty"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = (await importProfile({
        text: text.trim(),
        file_urls: fileUrl ? [fileUrl] : undefined,
      })) || {};
      const patch = {};
      const pi = r.personal_info || {};
      const piOut = {};
      if (pi.full_name) piOut.full_name = pi.full_name;
      if (pi.professional_title) piOut.professional_title = pi.professional_title;
      if (pi.email) piOut.email = pi.email;
      if (pi.phone) piOut.phone = pi.phone;
      if (pi.location) piOut.location = pi.location;
      if (pi.website) piOut.website = pi.website;
      if (pi.linkedin) piOut.linkedin = pi.linkedin;
      if (pi.github) piOut.github = pi.github;
      if (Object.keys(piOut).length) patch.personal_info = piOut;
      if (r.summary) patch.summary = r.summary;
      if (Array.isArray(r.experience) && r.experience.length)
        patch.experience = r.experience.map((e) => ({
          id: uid(),
          job_title: e.job_title || "",
          company: e.company || "",
          location: e.location || "",
          start_date: e.start_date || "",
          end_date: e.current ? "" : e.end_date || "",
          current: !!e.current,
          description: e.description || "",
          bullet_points: (e.bullet_points || []).filter(Boolean),
        }));
      if (Array.isArray(r.education) && r.education.length)
        patch.education = r.education.map((e) => ({
          id: uid(),
          degree: e.degree || "",
          institution: e.institution || "",
          location: e.location || "",
          start_date: e.start_date || "",
          end_date: e.end_date || "",
          description: e.description || "",
        }));
      if (Array.isArray(r.skills) && r.skills.length)
        patch.skills = r.skills.map((s) => ({ id: uid(), name: s, level: "Intermediate" }));
      if (Array.isArray(r.languages) && r.languages.length)
        patch.languages = r.languages.map((l) => ({ id: uid(), name: stripLevel(l), level: mapLevel(l) }));
      if (Array.isArray(r.projects) && r.projects.length)
        patch.projects = r.projects.map((p) => ({
          id: uid(),
          name: p.name || "",
          description: p.description || "",
          url: p.url || "",
          technologies: p.technologies || "",
        }));
      if (Array.isArray(r.certifications) && r.certifications.length)
        patch.certifications = r.certifications.map((c) => ({
          id: uid(),
          name: c.name || "",
          organization: c.organization || "",
          date: c.date || "",
          url: "",
        }));
      onImport(patch);
      close();
    } catch (e) {
      setError(e?.response?.data?.error || "Unable to import. Please try again or paste your profile text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin size={18} className="text-[#0a66c2]" /> Import from LinkedIn
          </DialogTitle>
          <DialogDescription>
            Paste your public LinkedIn profile text (or an exported PDF/HTML) and we'll fill in your details automatically. Only information found in the source is used.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("builder.import.pasteTitle")}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={t("builder.import.placeholder")}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="text-center text-xs text-muted-foreground">— or —</div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("builder.import.uploadTitle")}</label>
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted">
              <Upload size={16} />
              {fileName || t("builder.import.chooseFile")}
              <input type="file" accept=".pdf,.html,.htm,.txt" onChange={handleFile} className="hidden" />
            </label>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={close} className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">{t("builder.action.cancel")}</button>
            <button
              onClick={run}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Import
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}