import React from "react";
import { Link } from "react-router-dom";
import { Check, FileText, FileType, Sparkles, Eye, Smartphone, Palette, Wand2, Star, FileUp, Download } from "lucide-react";
import { createDemoCV } from "@/lib/cvSchema";
import { TEMPLATES } from "@/lib/templates/registry";
import MiniCVPreview from "@/components/cv/MiniCVPreview";
import Seo from "@/components/Seo";
import { useT } from "@/lib/i18n";

const demo = createDemoCV();

const FEATURES = [
  { icon: Check },
  { icon: Palette },
  { icon: FileText },
  { icon: FileType },
  { icon: Eye },
  { icon: Wand2 },
  { icon: Smartphone },
  { icon: Sparkles },
];

const STEP_ICONS = [FileUp, Wand2, Palette, Download];

export default function Home() {
  const t = useT();
  return (
    <div>
      <Seo
        title="DexaCV – AI CV Builder | Build a CV That Gets Noticed"
        description="DexaCV is an AI-powered CV builder that helps you create professional, ATS-friendly CVs, explore career opportunities, and prepare for job interviews."
        path="/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 lg:pt-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary mb-5">
              <Sparkles size={13} /> {t("common.freeForever")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-[1.05]">
              {t("home.heroTitleBefore")}<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-indigo-300 dark:to-fuchsia-300">{t("home.heroTitleHighlight")}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("home.heroText")}
            </p>
            {/* Visible brand statement. States plainly what DexaCV is, so both
                readers and search engines can place the brand as a CV/resume
                product. The two links point at the public pages that carry the
                same topic, using their own descriptive names as anchor text. */}
            <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
              {t("home.brandStatement")}{" "}
              <Link to="/ats-cv" className="text-primary hover:underline">{t("home.brandStatementAts")}</Link>
              {" · "}
              <Link to="/guides" className="text-primary hover:underline">{t("home.brandStatementGuides")}</Link>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/builder" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">
                {t("common.createMyCv")}
              </Link>
              <Link to="/templates" className="px-6 py-3 rounded-xl border border-border bg-card font-semibold text-foreground hover:bg-muted transition-colors">
                {t("common.browseTemplates")}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Check size={15} className="text-primary" /> {t("common.noAccountNeeded")}</span>
              <span className="flex items-center gap-1.5"><Check size={15} className="text-primary" /> {t("common.autoSaves")}</span>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">{t("home.trustCount")}</span>
                <span className="text-muted-foreground"> · {t("home.trustRating")}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative grid grid-cols-2 gap-4">
              <PreviewCard templateId="modern" className="rotate-[-4deg] mt-8" />
              <PreviewCard templateId="professional" className="rotate-[3deg]" />
              <PreviewCard templateId="creative" className="rotate-[2deg] -mt-4 col-span-2 mx-auto w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center">{t("home.stepsTitle")}</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEP_ICONS.map((Icon, i) => (
            <div key={i} className="relative p-5 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow">
              <span className="absolute top-4 end-5 text-4xl font-bold text-primary/10">{i + 1}</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold mb-1">{t(`home.steps.${i}.title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.steps.${i}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why use */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">{t("home.whyTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("home.whyText")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold mb-1">{t(`home.features.${i}.title`)}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{t(`home.features.${i}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates strip */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t("home.templatesTitle")}</h2>
              <p className="mt-2 text-muted-foreground">{t("home.templatesText")}</p>
            </div>
            <Link to="/templates" className="text-primary font-semibold hover:underline">{t("home.viewAll")} →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.slice(0, 6).map((tpl) => (
              <Link key={tpl.id} to="/builder" state={{ templateId: tpl.id }} className="group">
                <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] overflow-hidden bg-muted/30">
                    <MiniPreview templateId={tpl.id} />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-semibold text-sm">{tpl.name}</span>
                    <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">{t("home.useThis")} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10">{t("home.testimonialsTitle")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">“{t(`home.testimonials.${i}.text`)}”</p>
                <p className="mt-4 text-sm font-semibold">{t(`home.testimonials.${i}.name`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("home.ctaTitle")}</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("home.ctaText")}</p>
        <Link to="/builder" className="inline-block mt-8 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold shadow-sm hover:shadow-md transition-all">
          {t("common.createMyCv")}
        </Link>
      </section>
    </div>
  );
}

function PreviewCard({ templateId, className = "" }) {
  return (
    <div className={`rounded-lg overflow-hidden cv-shadow bg-card ${className}`}>
      <MiniCVPreview cv={{ ...demo, template_id: templateId }} />
    </div>
  );
}

function MiniPreview({ templateId }) {
  return <MiniCVPreview cv={{ ...demo, template_id: templateId }} />;
}