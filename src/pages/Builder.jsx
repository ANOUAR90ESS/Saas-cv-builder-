import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Download, FileType, Check, Eye, Pencil, LayoutTemplate, Palette, ListOrdered, User, Sparkles, Printer, Linkedin, FolderOpen, ChevronLeft, HelpCircle, Gauge, X } from "lucide-react";
import { useSmartBack } from "@/hooks/useSmartBack";
import SheetSelect from "@/components/builder/SheetSelect";
import { BRAND } from "@/components/Layout";
import { LogoMark } from "@/components/Logo";
import Seo from "@/components/Seo";
import CVPreview from "@/components/cv/CVPreview";
import PersonalInfoForm from "@/components/builder/PersonalInfoForm";
import SummaryEditor from "@/components/builder/SummaryEditor";
import ExperienceEditor from "@/components/builder/ExperienceEditor";
import EducationEditor from "@/components/builder/EducationEditor";
import ThemePanel from "@/components/builder/ThemePanel";
import SectionManager from "@/components/builder/SectionManager";
import TemplatePicker from "@/components/builder/TemplatePicker";
import JobFitAnalyzer from "@/components/builder/JobFitAnalyzer";
import MarketTrendsPanel from "@/components/builder/MarketTrendsPanel";
import {
  SkillsEditor,
  LanguagesEditor,
  ProjectsEditor,
  CertificationsEditor,
  AwardsEditor,
  CoursesEditor,
  VolunteerEditor,
  ReferencesEditor,
  InterestsEditor,
} from "@/components/builder/CollectionEditors";
import { createEmptyCV } from "@/lib/cvSchema";
import { ensureSeed, upsertCV, loadAllCVs, getActiveId, setActiveId } from "@/lib/cvStorage";
import TemplateRenderer from "@/components/cv/TemplateRenderer";
import ImportDialog from "@/components/builder/ImportDialog";
import WelcomeGuide from "@/components/builder/WelcomeGuide";
import CVScore from "@/components/builder/CVScore";
import { Capacitor } from "@capacitor/core";
import { exportPDF, exportPDFNative } from "@/lib/pdfExport";
import { exportDocx, exportDocxNative } from "@/lib/docxExport";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { TemplateLibraryDrawer } from "@/components/template-library";
import { analyzeCvATS } from "@/lib/atsBenchmark";
import { Target, Loader2, TrendingUp } from "lucide-react";

// Labels resolve through i18n at render time; the key doubles as the i18n key.
const NAV = [
  { key: "personal", icon: User },
  { key: "summary", icon: Sparkles },
  { key: "experience", icon: Pencil },
  { key: "education", icon: Pencil },
  { key: "skills", icon: Pencil },
  { key: "languages", icon: Pencil },
  { key: "projects", icon: Pencil },
  { key: "certifications", icon: Pencil },
  { key: "awards", icon: Pencil },
  { key: "courses", icon: Pencil },
  { key: "volunteer", icon: Pencil },
  { key: "interests", icon: Pencil },
  { key: "references", icon: Pencil },
  { key: "score", icon: Gauge },
  { key: "job_fit", icon: Target },
  { key: "market_trends", icon: TrendingUp },
  { key: "template", icon: LayoutTemplate },
  { key: "design", icon: Palette },
  { key: "sections", icon: ListOrdered },
];

export default function Builder() {
  const { lang, t } = useLang();
  const back = useSmartBack("/projects");
  const location = useLocation();
  const [cv, setCv] = useState(null);
  const [active, setActive] = useState("personal");
  const [mobileTab, setMobileTab] = useState("edit"); // edit | preview
  const [saved, setSaved] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [jobFitDrawerOpen, setJobFitDrawerOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportNotice, setExportNotice] = useState("");
  const saveTimer = useRef(null);
  const [guideOpen, setGuideOpen] = useState(false);

  // Simulated ATS Benchmark live calculation
  const atsResult = useMemo(() => analyzeCvATS(cv), [cv]);

  // Load CV on mount: a local CV (cvId/active), or seed demo. All local — no account.
  useEffect(() => {
    const stateTpl = location.state?.templateId;
    ensureSeed(lang);
    let loaded = null;
    const cvs = loadAllCVs() || [];
    if (location.state?.cvId) {
      loaded = cvs.find((c) => c.id === location.state.cvId);
    }
    if (!loaded) {
      const id = getActiveId();
      loaded = cvs.find((c) => c.id === id) || cvs[0];
    }
    // Arriving from the gallery with a template, on a CV that is still the
    // seeded demo, means "start a CV in this style" — not "restyle Elena
    // Marston's". Anything the user has actually touched keeps its content.
    if (loaded?.is_demo && stateTpl) loaded = null;
    if (loaded) {
      let next = loaded;
      if (stateTpl) next = { ...loaded, template_id: stateTpl };
      setCv(next);
      setActiveId(next.id);
    } else {
      const fresh = createEmptyCV(lang);
      if (stateTpl) fresh.template_id = stateTpl;
      setCv(fresh);
      upsertCV(fresh);
    }
  }, []); // eslint-disable-line

  // Show the welcome guide on a user's first visit to the builder.
  useEffect(() => {
    try { if (!localStorage.getItem("dexacv_guide_done")) setGuideOpen(true); } catch { /* ignore */ }
  }, []);
  const closeGuide = () => {
    setGuideOpen(false);
    try { localStorage.setItem("dexacv_guide_done", "1"); } catch { /* ignore */ }
  };

  // Debounced auto-save to local storage.
  useEffect(() => {
    if (!cv) return;
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      upsertCV(cv);
      setSaved(true);
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [cv]);

  const patch = (p) => setCv((c) => ({ ...c, ...p, is_demo: false }));
  const patchPersonal = (pi) => patch({ personal_info: pi });
  const importProfile = (p) => setCv((c) => ({ ...c, ...p, personal_info: { ...c.personal_info, ...(p.personal_info || {}) } }));

  const doPrint = () => window.print();
  // Inside the Android shell the browser download does nothing at all, so the
  // export has to go out through the share sheet instead — see nativeSave.js.
  const native = Capacitor.isNativePlatform();
  const doExportPDF = async () => {
    if (exportingPdf || !cv) return;
    setExportingPdf(true);
    setExportNotice("Preparing PDF with jsPDF...");
    try {
      if (native) {
        await exportPDFNative(cv);
      } else {
        await exportPDF(cv);
      }
      setExportNotice("PDF downloaded successfully!");
      setTimeout(() => setExportNotice(""), 3500);
    } catch (e) {
      console.error("PDF export failed", e);
      setExportNotice("PDF export encountered an issue. Please try again.");
      setTimeout(() => setExportNotice(""), 4000);
    } finally {
      setExportingPdf(false);
    }
  };

  const doExportDocx = async () => {
    if (exportingDocx || !cv) return;
    setExportingDocx(true);
    setExportNotice("Generating DOCX document...");
    try {
      if (native) {
        await exportDocxNative(cv);
      } else {
        await exportDocx(cv);
      }
      setExportNotice("DOCX downloaded successfully!");
      setTimeout(() => setExportNotice(""), 3500);
    } catch (e) {
      console.error("DOCX export failed", e);
      setExportNotice("DOCX export encountered an issue. Please try again.");
      setTimeout(() => setExportNotice(""), 4000);
    } finally {
      setExportingDocx(false);
    }
  };

  const setCollection = (key) => (items) => patch({ [key]: items });

  const editor = useMemo(() => {
    if (!cv) return null;
    switch (active) {
      case "personal":
        return <PersonalInfoForm cv={cv} onChange={patchPersonal} />;
      case "summary":
        return <SummaryEditor cv={cv} onChange={(summary) => patch({ summary })} />;
      case "experience":
        return <ExperienceEditor items={cv.experience} onChange={setCollection("experience")} />;
      case "education":
        return <EducationEditor items={cv.education} onChange={setCollection("education")} />;
      case "skills":
        return <SkillsEditor items={cv.skills} onChange={setCollection("skills")} cv={cv} />;
      case "languages":
        return <LanguagesEditor items={cv.languages} onChange={setCollection("languages")} />;
      case "projects":
        return <ProjectsEditor items={cv.projects} onChange={setCollection("projects")} />;
      case "certifications":
        return <CertificationsEditor items={cv.certifications} onChange={setCollection("certifications")} />;
      case "awards":
        return <AwardsEditor items={cv.awards} onChange={setCollection("awards")} />;
      case "courses":
        return <CoursesEditor items={cv.courses} onChange={setCollection("courses")} />;
      case "volunteer":
        return <VolunteerEditor items={cv.volunteer} onChange={setCollection("volunteer")} />;
      case "interests":
        return <InterestsEditor items={cv.interests} onChange={setCollection("interests")} />;
      case "references":
        return <ReferencesEditor items={cv.references} onChange={setCollection("references")} />;
      case "score":
        return <CVScore cv={cv} />;
      case "job_fit":
        return <JobFitAnalyzer cv={cv} onUpdateCv={patch} />;
      case "market_trends":
        return (
          <MarketTrendsPanel
            cv={cv}
            onUpdateCv={patch}
            onNavigateTab={(tab) => setActive(tab)}
          />
        );
      case "template":
        return (
          <TemplatePicker
            value={cv.template_id}
            onChange={(template_id) => patch({ template_id })}
            onOpenLibrary={() => setTemplateLibraryOpen(true)}
            cv={cv}
          />
        );
      case "design":
        return (
          <ThemePanel
            theme={cv.theme}
            onChange={(theme) => patch({ theme })}
            language={cv.language}
            onLanguageChange={(language) => patch({ language })}
          />
        );
      case "sections":
        return (
          <SectionManager
            order={cv.section_order}
            enabled={cv.enabled_sections}
            onReorder={(section_order) => patch({ section_order })}
            onToggle={(key) => patch({ enabled_sections: { ...cv.enabled_sections, [key]: !cv.enabled_sections[key] } })}
          />
        );
      default:
        return null;
    }
  }, [cv, active]);

  if (!cv) {
    return <div className="h-[60vh] grid place-items-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <Seo title="CV Builder — DexaCV" description="Build and customize your CV with a live preview. Export to PDF or DOCX — free, no watermark." path="/builder" noindex />
      {/* Top bar */}
      <div className="border-b border-border bg-background px-4 h-16 sm:h-14 flex items-center gap-2 sm:gap-3 shrink-0 safe-top overflow-hidden">
        <button onClick={back} aria-label={t("builder.bar.back")} className="-ml-1 inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-muted-foreground hover:bg-muted transition shrink-0">
          <ChevronLeft size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold text-sm shrink-0">
          <LogoMark size={22} />
          <span className="hidden sm:inline">{BRAND}</span>
        </Link>
        <span className="hidden sm:inline text-gray-300">/</span>
        <input
          value={cv.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="font-semibold text-base lg:text-sm bg-transparent focus:outline-none focus:bg-muted rounded px-1 py-0.5 min-w-0 flex-1 sm:flex-initial sm:max-w-[40vw]"
        />
        <span className={cn("text-xs flex items-center gap-1 transition shrink-0", saved ? "text-green-600" : "text-gray-400")}>
          {saved ? <Check size={13} /> : <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          <span className="hidden sm:inline">{saved ? t("builder.bar.saved") : t("builder.bar.saving")}</span>
        </span>

        {/* ATS Benchmark Score Button */}
        <button
          type="button"
          onClick={() => setActive("score")}
          title="View Simulated ATS Benchmark Score & Feedback"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-card hover:bg-muted transition shrink-0"
        >
          <Target
            size={13}
            className={
              atsResult.overallScore >= 85
                ? "text-emerald-500"
                : atsResult.overallScore >= 70
                ? "text-blue-500"
                : "text-amber-500"
            }
          />
          <span className="font-bold">{atsResult.overallScore}% ATS</span>
        </button>

        {/* Target Role Job Fit Matcher Button */}
        <button
          type="button"
          onClick={() => setJobFitDrawerOpen(true)}
          title="Analyze CV fit against a job description with Gemini"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition shrink-0"
        >
          <Target size={13} className="text-primary" />
          <span className="font-bold">Job Fit AI</span>
        </button>

        {/* Real-time Job Market Trends Button */}
        <button
          type="button"
          onClick={() => setActive("market_trends")}
          title="View Real-Time Job Market Trends & Salary Expectations"
          className={cn(
            "hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition shrink-0",
            active === "market_trends"
              ? "border-blue-500 bg-blue-500 text-white shadow-xs"
              : "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
          )}
        >
          <TrendingUp size={13} className={active === "market_trends" ? "text-white" : "text-blue-500"} />
          <span className="font-bold">Market Trends</span>
        </button>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTemplateLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition text-foreground shrink-0"
            title="Browse CV Template Library"
          >
            <LayoutTemplate size={14} className="text-primary" />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <button onClick={() => setGuideOpen(true)} aria-label={t("builder.bar.guide")} className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0">
            <HelpCircle size={18} />
          </button>
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
            <FolderOpen size={15} /> <span className="hidden md:inline">{t("builder.bar.projects")}</span>
          </Link>
          <button onClick={() => setImportOpen(true)} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
            <Linkedin size={15} /> <span className="hidden md:inline">{t("builder.bar.import")}</span>
          </button>
          <button onClick={doPrint} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
            <Printer size={15} /> <span className="hidden md:inline">{t("builder.bar.print")}</span>
          </button>
          {/* DOCX Export */}
          <button
            onClick={doExportDocx}
            disabled={exportingDocx}
            title="Download editable Microsoft Word document (.docx)"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition disabled:opacity-60"
          >
            {exportingDocx ? <Loader2 size={14} className="animate-spin text-primary" /> : <FileType size={15} />}
            <span>DOCX</span>
          </button>
          {/* PDF Export via jsPDF */}
          <button
            onClick={doExportPDF}
            disabled={exportingPdf}
            title="Download PDF document using jsPDF"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-xs disabled:opacity-60"
          >
            {exportingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={15} />}
            <span className="hidden sm:inline">{t("builder.bar.downloadPdf")}</span>
            <span className="sm:hidden">{t("builder.bar.pdf")}</span>
          </button>
        </div>
      </div>

      {/* Export status banner */}
      {exportNotice && (
        <div className="bg-primary/10 border-b border-primary/20 text-primary text-xs px-4 py-1.5 flex items-center justify-between animate-in fade-in">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice("")} className="text-primary hover:underline font-bold">✕</button>
        </div>
      )}

      {/* Mobile Edit/Preview segmented toggle (sticky under the toolbar, never covered by keyboard) */}
      <div className="lg:hidden flex items-center gap-1 p-2 border-b border-border bg-background shrink-0">
        <button
          onClick={() => setMobileTab("edit")}
          className={cn("flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition", mobileTab === "edit" ? "bg-primary text-white" : "text-muted-foreground bg-muted")}
        >
          <Pencil size={15} /> {t("builder.bar.edit")}
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={cn("flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition", mobileTab === "preview" ? "bg-primary text-white" : "text-muted-foreground bg-muted")}
        >
          <Eye size={15} /> {t("builder.bar.preview")}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left nav (desktop) */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-muted/30 overflow-y-auto no-scrollbar">
          <nav className="p-2 space-y-0.5">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left",
                  active === n.key ? "bg-background text-primary font-semibold shadow-sm" : "text-muted-foreground hover:bg-background/60"
                )}
              >
                <n.icon size={15} className="shrink-0" />
                <span className="truncate">{t(`builder.nav.${n.key}`)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor */}
        <section className={cn("flex-1 overflow-y-auto bg-muted/20 safe-bottom", mobileTab === "preview" && "hidden lg:block")}>
          <div className="max-w-2xl mx-auto p-5 lg:p-8 pb-10">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{t(`builder.nav.${active}`)}</h2>
              <p className="text-sm text-muted-foreground">{hintFor(active, t)}</p>
            </div>
            {/* Mobile section selector */}
            <div className="lg:hidden mb-4">
              <SheetSelect
                value={t(`builder.nav.${active}`)}
                onChange={(label) => {
                  const found = NAV.find((n) => t(`builder.nav.${n.key}`) === label);
                  if (found) setActive(found.key);
                }}
                options={NAV.map((n) => t(`builder.nav.${n.key}`))}
                label={t("builder.bar.section")}
              />
            </div>
            {editor}
          </div>
        </section>

        {/* Desktop preview */}
        <aside className="hidden lg:flex w-[44%] xl:w-[46%] border-l border-border bg-muted overflow-y-auto p-6 flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live CV Preview</span>
            <button
              type="button"
              onClick={() => setJobFitDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition"
              title="Open Role Fit & Skill Matcher Sidebar Widget"
            >
              <Target size={13} />
              <span>Job Fit Matcher</span>
            </button>
          </div>
          <div className="w-full">
            <CVPreview cv={cv} />
          </div>
        </aside>

        {/* Mobile preview (inline scroll, replaces fixed overlay) */}
        <section className={cn("lg:hidden flex-1 overflow-y-auto bg-muted p-4 pb-10 safe-bottom", mobileTab === "edit" && "hidden")}>
          <CVPreview cv={cv} />
        </section>
      </div>

      {/* Hidden full-size render used only for browser printing */}
      <div className="cv-print-root" aria-hidden>
        <TemplateRenderer cv={cv} />
      </div>

      <WelcomeGuide open={guideOpen} onClose={closeGuide} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={importProfile} />
      <TemplateLibraryDrawer
        open={templateLibraryOpen}
        onClose={() => setTemplateLibraryOpen(false)}
        currentTemplateId={cv.template_id}
        onSelectTemplate={(templateId) => patch({ template_id: templateId })}
        cv={cv}
        color={cv.theme?.accent_color}
      />

      {/* Slide-over Job Fit Analyzer Sidebar Widget */}
      {jobFitDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-background border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Target Role Fit Sidebar Widget</h3>
                  <p className="text-[11px] text-muted-foreground">Analyze job description keywords & fit score with Gemini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setJobFitDrawerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                title="Close Job Fit Widget"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <JobFitAnalyzer cv={cv} onUpdateCv={patch} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function hintFor(key, t) {
  const KEYS = ["personal", "summary", "experience", "education", "skills", "template", "design", "sections", "score", "job_fit"];
  return KEYS.includes(key) ? t(`builder.hint.${key}`) : "";
}