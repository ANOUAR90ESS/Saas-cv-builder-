import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  FileText,
  Briefcase,
  Bot,
  UserCheck,
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ChevronRight,
  ExternalLink,
  Target,
  Send
} from "lucide-react";
import { loadAllCVs, getActiveId } from "@/lib/cvStorage";
import {
  getApplications,
  getJobMatches,
  getUpcomingReminders,
  getCareerProfile,
  calculateCareerScore
} from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";
import { useAuth } from "@/lib/AuthContext";

export default function CareerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cvs, setCvs] = useState([]);
  const [activeCv, setActiveCv] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [scoreData, setScoreData] = useState({ totalScore: 82, breakdown: {}, recommendations: [] });

  useEffect(() => {
    const loadedCvs = loadAllCVs() || [];
    const activeId = getActiveId();
    const currentCv = loadedCvs.find((c) => c.id === activeId) || loadedCvs[0] || null;
    const apps = getApplications();
    const matches = getJobMatches();
    const prof = getCareerProfile();
    const rems = getUpcomingReminders();

    setCvs(loadedCvs);
    setActiveCv(currentCv);
    setApplications(apps);
    setJobMatches(matches);
    setProfile(prof);
    setReminders(rems);

    const score = calculateCareerScore({ cv: currentCv, profile: prof, applications: apps, jobMatches: matches });
    setScoreData(score);
  }, []);

  // Compute application stats
  const totalApps = applications.length;
  const interviewsCount = applications.filter((a) => a.status === "Interview").length;
  const offersCount = applications.filter((a) => a.status === "Offer").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;
  const savedCount = applications.filter((a) => a.status === "Saved").length;
  const appliedCount = applications.filter((a) => a.status === "Applied" || a.status === "Screening").length;

  const publicProfileUrl = profile?.username ? `/u/${profile.username}` : "/profile/edit";
  const publicPortfolioUrl = profile?.username ? `/u/${profile.username}/portfolio` : "/portfolio/edit";

  const handleActionClick = (path) => {
    triggerHaptic("selection");
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <Sparkles size={14} />
                <span>AI Career Assistant</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Career Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-2xl">
                Build your CV. Find the right jobs. Get ready. Get hired. Everything you need to accelerate your career in one place.
              </p>
            </div>

            {/* Top Quick Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/career/job-matcher"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <Target size={16} />
                <span>Analyze Job Fit</span>
              </Link>
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-sm font-medium transition"
              >
                <FileText size={16} />
                <span>Open CV Builder</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Career Score & Application Pipeline Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Career Score Card */}
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overall Readiness
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp size={12} />
                  Top 15%
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-foreground tracking-tight">
                  {scoreData.totalScore}
                </span>
                <span className="text-2xl font-bold text-muted-foreground">/ 100</span>
              </div>

              <h2 className="text-lg font-bold text-foreground mt-2">Career Score</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Calculated from available profile information, CV quality, skills, experience, portfolio completeness, and job-match readiness.
              </p>

              {/* Progress meter */}
              <div className="mt-5 space-y-2">
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full transition-all duration-700"
                    style={{ width: `${scoreData.totalScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Developing</span>
                  <span>Competitive</span>
                  <span className="font-semibold text-primary">Recruiter Ready</span>
                </div>
              </div>

              {/* Breakdown highlights */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">CV Quality</span>
                  <span className="font-bold text-foreground">
                    {scoreData.breakdown.cvScore || 24} / 30 pts
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Profile Details</span>
                  <span className="font-bold text-foreground">
                    {scoreData.breakdown.profileScore || 20} / 25 pts
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Portfolio</span>
                  <span className="font-bold text-foreground">
                    {scoreData.breakdown.portfolioScore || 12} / 15 pts
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Pipeline Activity</span>
                  <span className="font-bold text-foreground">
                    {scoreData.breakdown.appScore || 14} / 15 pts
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Link
                to="/profile/edit"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Improve score & optimize profile</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Applications Stats Card */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Job Applications</h2>
                  <p className="text-xs text-muted-foreground">
                    Live overview of your active hiring pipeline stages.
                  </p>
                </div>
                <Link
                  to="/career/applications"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Kanban Tracker</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                {/* Total */}
                <div className="p-4 rounded-xl border border-border bg-background/60 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Applications</span>
                  <span className="text-3xl font-extrabold text-foreground mt-2">{totalApps}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">Total logged</span>
                </div>

                {/* Interviews */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Interviews</span>
                  <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                    {interviewsCount}
                  </span>
                  <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">In progress</span>
                </div>

                {/* Offers */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Offers</span>
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                    {offersCount}
                  </span>
                  <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Received</span>
                </div>

                {/* Saved */}
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between">
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Saved Jobs</span>
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                    {savedCount}
                  </span>
                  <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">Bookmarked</span>
                </div>

                {/* Rejected / Withdrawn */}
                <div className="p-4 rounded-xl border border-border bg-background/60 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Rejected</span>
                  <span className="text-3xl font-extrabold text-muted-foreground mt-2">
                    {rejectedCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">Archived</span>
                </div>
              </div>

              {/* Active Pipeline Preview */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                  <span>Recent Applications</span>
                  <span>Status</span>
                </div>
                <div className="space-y-2">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => navigate("/career/applications")}
                      className="p-3 rounded-xl border border-border/80 bg-background/50 hover:bg-muted/50 cursor-pointer transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {app.company[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{app.company}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.jobTitle}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                          app.status === "Interview"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : app.status === "Offer"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : app.status === "Applied"
                            ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Keep your applications updated to track conversion rates.</span>
              <Link
                to="/career/applications"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>+ Add Application</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 2: Quick Actions Grid */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
            <p className="text-xs text-muted-foreground">
              Direct shortcuts to DexaCV tools and career modules.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Create / Edit CV */}
            <button
              type="button"
              onClick={() => handleActionClick("/builder")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Create / Edit CV
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Edit ATS resume</p>
              </div>
            </button>

            {/* Analyze a Job */}
            <button
              type="button"
              onClick={() => handleActionClick("/career/job-matcher")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Analyze a Job
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Match score & gaps</p>
              </div>
            </button>

            {/* Generate Cover Letter */}
            <button
              type="button"
              onClick={() => handleActionClick("/career/cover-letter")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Send size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Cover Letter
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">AI tailored letter</p>
              </div>
            </button>

            {/* Practice Interview */}
            <button
              type="button"
              onClick={() => handleActionClick("/career/interview-coach")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Bot size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Practice Interview
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">AI mock questions</p>
              </div>
            </button>

            {/* Track Application */}
            <button
              type="button"
              onClick={() => handleActionClick("/career/applications")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Track Application
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Kanban pipeline</p>
              </div>
            </button>

            {/* Edit Profile */}
            <button
              type="button"
              onClick={() => handleActionClick("/profile/edit")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Edit Profile
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Public web profile</p>
              </div>
            </button>

            {/* Open Portfolio */}
            <button
              type="button"
              onClick={() => handleActionClick("/portfolio/edit")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left flex flex-col justify-between group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FolderGit2 size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                  Open Portfolio
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Showcase projects</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Job Matches & Upcoming Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Job Matches */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Target size={15} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Top Job Matches</h2>
                    <p className="text-xs text-muted-foreground">
                      Roles that strongly match your skills and experience.
                    </p>
                  </div>
                </div>
                <Link
                  to="/career/job-matcher"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Analyze new</span>
                  <Plus size={13} />
                </Link>
              </div>

              <div className="space-y-3 mt-4">
                {jobMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    onClick={() => navigate("/career/job-matcher")}
                    className="p-3.5 rounded-xl border border-border/80 bg-background/50 hover:bg-muted/40 cursor-pointer transition flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">
                          {match.jobTitle}
                        </span>
                        {match.company && (
                          <span className="text-xs text-muted-foreground border-l border-border pl-2 truncate">
                            {match.company}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(match.matchingSkills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          >
                            {s} ✓
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-black text-primary block leading-none">
                          {match.matchScore}%
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Match
                        </span>
                      </div>
                      <ChevronRight size={15} className="text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border">
              <Link
                to="/career/job-matcher"
                className="w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>Compare CV with a Target Job Description</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Upcoming Activity & Reminders */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Upcoming Activity & Reminders</h2>
                    <p className="text-xs text-muted-foreground">
                      Scheduled interviews, follow-ups, and application milestones.
                    </p>
                  </div>
                </div>
                <Link
                  to="/career/applications"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3 mt-4">
                {reminders.length > 0 ? (
                  reminders.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                        item.type === "interview"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border bg-background/50"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            item.type === "interview"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {item.type === "interview" ? <Bot size={15} /> : <Clock size={15} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          {item.notes && (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-1 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground block">{item.date}</span>
                        {item.isToday ? (
                          <span className="text-[10px] font-bold text-amber-600 uppercase">Today</span>
                        ) : item.isOverdue ? (
                          <span className="text-[10px] font-bold text-rose-500 uppercase">Overdue</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Upcoming</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold text-foreground">No upcoming reminders</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Add follow-up dates or interview dates to applications to see them here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Stay prepared before each hiring interview.</span>
              <Link
                to="/career/interview-coach"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Practice Interview Now</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 4: Public Identity & Portfolio Showcase */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-primary text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                {(profile?.fullName || "U")[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    {profile?.fullName || "Your Professional Profile"}
                  </h2>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      profile?.isPublished
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {profile?.isPublished ? "Public & Live" : "Private / Unpublished"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Public profile: <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">/u/{profile?.username || "username"}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/profile/edit"
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
              >
                Edit Profile
              </Link>
              <Link
                to="/portfolio/edit"
                className="px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition"
              >
                Manage Portfolio
              </Link>
              {profile?.username && (
                <Link
                  to={`/u/${profile.username}`}
                  target="_blank"
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center gap-1.5"
                >
                  <span>View Public Page</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
