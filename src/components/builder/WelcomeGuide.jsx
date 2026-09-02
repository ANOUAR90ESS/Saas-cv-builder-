import React from "react";
import { X, User, Briefcase, Palette, Download, ArrowRight, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";

const STEP_ICONS = [User, Briefcase, Palette, Download];

export default function WelcomeGuide({ open, onClose }) {
  const t = useT();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-primary/15 to-accent/10">
          <button
            onClick={onClose}
            aria-label={t("guide.skip")}
            className="absolute top-3 end-3 w-8 h-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">{t("guide.badge")}</span>
          </div>
          <h2 className="text-xl font-bold leading-tight">{t("guide.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("guide.subtitle")}</p>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          {STEP_ICONS.map((Icon, i) => (
            <div key={i} className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">{t(`guide.steps.${i}.title`)}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{t(`guide.steps.${i}.text`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition"
          >
            {t("guide.skip")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-primary/90 transition"
          >
            {t("guide.start")} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}