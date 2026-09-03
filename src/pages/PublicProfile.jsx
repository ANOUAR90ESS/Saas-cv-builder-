import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Lock,
  Share2,
  Check
} from "lucide-react";
import {
  getCareerProfile,
  getPortfolioProjects
} from "@/lib/careerStorage";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function PublicProfile() {
  const { username } = useParams();
  const location = useLocation();

  const isPortfolioTab = location.pathname.endsWith("/portfolio");

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const cleanUsername = (username || "").toLowerCase();

      // 1. Check local storage first
      const localProfile = getCareerProfile();
      if (localProfile && (localProfile.username || "").toLowerCase() === cleanUsername) {
        setProfile(localProfile);
        setProjects(getPortfolioProjects());
        setLoading(false);
        return;
      }

      // 2. Query Firestore for public profile
      try {
        const q = query(
          collection(db, "career_profiles"),
          where("username", "==", cleanUsername)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          const pData = docData.data || docData;
          setProfile(pData);
          setProjects(pData.portfolioProjects || []);
        } else {
          // Fallback to local profile for developer testing if username matches default
          setProfile(localProfile);
          setProjects(getPortfolioProjects());
        }
      } catch (err) {
        console.warn("Error fetching profile from cloud:", err);
        setProfile(localProfile);
        setProjects(getPortfolioProjects());
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Lock size={20} />
          </div>
          <h1 className="text-xl font-bold">Profile Not Found</h1>
          <p className="text-xs text-muted-foreground">
            The profile <code>@{username}</code> does not exist or has not been published yet.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Go to DexaCV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Floating Bar for Published Profile */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs font-black tracking-tight text-primary">
              DexaCV
            </Link>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs font-medium text-foreground">@{profile.username}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
              <span>{copied ? "Link Copied" : "Share"}</span>
            </button>
            <Link
              to="/builder"
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-2xs"
            >
              Build Your Own CV
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.fullName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-primary text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-sm">
                  {(profile.fullName || "U")[0].toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {profile.fullName}
                  </h1>
                  <span className="inline-flex items-center text-primary" title="Verified CV Profile">
                    <Sparkles size={16} />
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-primary">
                  {profile.title}
                </p>

                {profile.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <MapPin size={13} />
                    <span>{profile.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-start sm:justify-end">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition"
                  title="Send Email"
                >
                  <Mail size={16} />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition"
                  title="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition"
                  title="GitHub"
                >
                  <Github size={16} />
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition"
                  title="Personal Website"
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Bio Summary */}
          {profile.summary && (
            <div className="mt-6 pt-6 border-t border-border/80">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {profile.summary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Overview vs Portfolio) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-2 border-b border-border pb-px">
          <Link
            to={`/u/${profile.username}`}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 inline-flex items-center gap-2 ${
              !isPortfolioTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase size={14} />
            <span>Profile & Experience</span>
          </Link>

          <Link
            to={`/u/${profile.username}/portfolio`}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 inline-flex items-center gap-2 ${
              isPortfolioTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderGit2 size={14} />
            <span>Portfolio & Projects ({projects.length})</span>
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {isPortfolioTab ? (
          /* Portfolio Showcase View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/40 transition flex flex-col justify-between"
                >
                  <div>
                    {proj.imageUrl && (
                      <div className="h-48 w-full overflow-hidden bg-muted">
                        <img
                          src={proj.imageUrl}
                          alt={proj.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <h3 className="text-base font-bold text-foreground">
                        {proj.name}
                      </h3>
                      {proj.role && (
                        <span className="text-xs font-semibold text-primary block">
                          {proj.role}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {proj.description}
                      </p>

                      {proj.technologies && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.technologies.split(",").map((tech, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {proj.achievements && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                          ★ {proj.achievements}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-3">
                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center gap-1.5"
                      >
                        <span>Live Demo</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5"
                      >
                        <Github size={12} />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-xs">
                No portfolio projects published yet.
              </div>
            )}
          </div>
        ) : (
          /* Profile & Experience View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Timeline Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Experience */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Briefcase size={16} className="text-primary" />
                  <span>Professional Experience</span>
                </h2>

                <div className="space-y-6">
                  {(profile.experience || []).map((exp, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-border/80 space-y-1.5">
                      <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground">
                          {exp.job_title}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {exp.start_date} – {exp.current ? "Present" : exp.end_date || "Past"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary">
                        {exp.company} {exp.location ? `• ${exp.location}` : ""}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}
                      {Array.isArray(exp.bullet_points) && exp.bullet_points.length > 0 && (
                        <ul className="space-y-1 text-xs text-muted-foreground pt-1">
                          {exp.bullet_points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {(!profile.experience || profile.experience.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">No experience listed.</p>
                  )}
                </div>
              </div>

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <GraduationCap size={16} className="text-primary" />
                    <span>Education</span>
                  </h2>

                  <div className="space-y-4">
                    {profile.education.map((edu, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xs font-bold text-foreground">{edu.degree}</h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {edu.start_date} – {edu.end_date}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-medium">{edu.institution}</p>
                        {edu.description && (
                          <p className="text-xs text-muted-foreground">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Skills */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Sparkles size={15} className="text-primary" />
                  <span>Skills & Competencies</span>
                </h2>

                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((skill, i) => {
                    const name = typeof skill === "string" ? skill : skill.name;
                    return (
                      <span
                        key={i}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
                    Languages
                  </h2>
                  <div className="space-y-1.5 text-xs">
                    {profile.languages.map((lang, i) => {
                      const name = typeof lang === "string" ? lang : lang.name;
                      const level = typeof lang === "object" ? lang.level : "";
                      return (
                        <div key={i} className="flex items-center justify-between text-muted-foreground">
                          <span className="font-semibold text-foreground">{name}</span>
                          <span>{level}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
