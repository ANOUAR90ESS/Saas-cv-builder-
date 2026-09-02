import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { TEMPLATES } from "@/lib/templates/registry";
import { createDemoCV } from "@/lib/cvSchema";
import MiniCVPreview from "@/components/cv/MiniCVPreview";
import Seo from "@/components/Seo";
import { useT } from "@/lib/i18n";

// Hand-picked 12 featured templates spanning every style family.
const FEATURED_IDS = [
  "modern",
  "professional",
  "minimal",
  "ats",
  "executive",
  "creative",
  "classic",
  "elegant",
  "tech",
  "timeline",
  "midnight",
  "navy",
];

const demo = createDemoCV();

export default function FeaturedGallery() {
  const t = useT();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const featured = FEATURED_IDS.map((id) => TEMPLATES.find((t2) => t2.id === id)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Seo
        title="Featured CV Templates — DexaCV"
        description="A curated set of 12 standout CV templates. Preview each layout, then start editing — no watermark, no signup."
        path="/featured-templates"
      />

      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Sparkles size={13} /> {t("featured.badge")}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t("featured.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("featured.subtitle")}</p>
      </div>

      {/* Large hero preview of the active template */}
      {active && (
        <div className="mb-10 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="bg-muted/40 p-6 max-h-[70vh] overflow-y-auto">
              <MiniCVPreview cv={{ ...demo, template_id: active.id }} />
            </div>
            <div className="p-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">{active.category}</span>
              <h2 className="text-2xl font-bold mt-1">{active.name}</h2>
              <p className="text-sm text-muted-foreground mt-2">{active.description}</p>
              <button
                onClick={() => navigate("/builder", { state: { templateId: active.id } })}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                {t("featured.useThis")} <ArrowRight size={16} />
              </button>
              <Link to="/templates" className="mt-2 text-center text-sm text-muted-foreground hover:text-primary transition">
                {t("featured.seeAll")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => setActive(tpl)}
            className={`group text-left rounded-2xl border bg-card overflow-hidden transition ${active?.id === tpl.id ? "border-primary ring-2 ring-primary/30 shadow-lg" : "border-border hover:shadow-lg hover:border-primary/40"}`}
          >
            <div className="bg-muted/30 max-h-64 overflow-hidden">
              <MiniCVPreview cv={{ ...demo, template_id: tpl.id }} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">{tpl.name}</h3>
                <span className="text-xs text-gray-400">{tpl.category}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition"
        >
          {t("featured.browseAll")} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}