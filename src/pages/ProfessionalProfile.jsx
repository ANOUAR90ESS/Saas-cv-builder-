import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  FolderGit2,
  BookmarkCheck
} from "lucide-react";
import { loadAllCVs, getActiveId } from "@/lib/cvStorage";
import {
  getCareerProfile,
  saveCareerProfile,
  importFromCvToProfile
} from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";

export default function ProfessionalProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loaded = loadAllCVs() || [];
    setCvs(loaded);
    setSelectedCvId(getActiveId() || loaded[0]?.id || "");
    setProfile(getCareerProfile());
  }, []);

  if (!profile) return null;

  const publicUrl = `${window.location.origin}/u/${profile.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    triggerHaptic("selection");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const updated = saveCareerProfile(profile);
    setProfile(updated);
    setSavedSuccess(true);
    triggerHaptic("success");
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportFromCv = () => {
    const cvToImport = cvs.find((c) => c.id === selectedCvId);
    if (!cvToImport) return;
    const imported = importFromCvToProfile(cvToImport);
    setProfile(imported);
    triggerHaptic("selection");
  };

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
                <UserCheck size={14} />
                <span>Online Presence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Professional Profile
              </h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Create and publish your personal web profile at <code>/u/{profile.username}</code> with verified experience, skills, and portfolio projects.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to={`/u/${profile.username}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
              >
                <ExternalLink size={14} />
                <span>Preview Public Page</span>
              </Link>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <BookmarkCheck size={14} />
                <span>{savedSuccess ? "Saved Successfully!" : "Save Profile"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Publishing & URL Handle */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    profile.isPublished ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
                  }`}
                />
                <h2 className="text-sm font-bold text-foreground">
                  {profile.isPublished ? "Profile is Publicly Accessible" : "Profile is Private (Draft)"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.isPublished
                  ? `Live at: ${publicUrl}`
                  : "Enable publishing to allow recruiters and colleagues to view your profile and portfolio."}
              </p>

              {/* Username field */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">/u/</span>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => handleFieldChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="your-handle"
                  className="px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground">
                {profile.isPublished ? "Published" : "Draft"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={profile.isPublished}
                onClick={() => handleFieldChange("isPublished", !profile.isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  profile.isPublished ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    profile.isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Import From CV */}
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Sync with Existing CV</h3>
                <p className="text-[11px] text-muted-foreground">
                  Quickly populate name, summary, skills, and experience from your CV.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
              >
                {cvs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title || c.personal?.full_name || "Untitled CV"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleImportFromCv}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition"
              >
                Import from CV
              </button>
            </div>
          </div>

          {/* Core Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
              Profile Header & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.fullName || ""}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Professional Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={profile.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                About / Professional Summary
              </label>
              <textarea
                rows={4}
                value={profile.summary || ""}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="A compelling overview of your background, architectural focus, and impact..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
              />
            </div>

            {/* Contact & Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Mail size={12} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Phone size={12} />
                  <span>Phone</span>
                </label>
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <MapPin size={12} />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Linkedin size={12} />
                  <span>LinkedIn URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={profile.linkedin || ""}
                  onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Github size={12} />
                  <span>GitHub URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={profile.github || ""}
                  onChange={(e) => handleFieldChange("github", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Globe size={12} />
                  <span>Personal Website / Blog</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={profile.website || ""}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/portfolio/edit"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <FolderGit2 size={14} />
              <span>Configure Portfolio Projects & Code Showcases →</span>
            </Link>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              {savedSuccess ? "Saved!" : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
