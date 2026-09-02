import React from "react";
import { COLOR_OPTIONS, FONT_OPTIONS, SKILL_DISPLAY_OPTIONS } from "@/lib/cvSchema";
import { LANGUAGES, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function ThemePanel({ theme, onChange, language, onLanguageChange }) {
  const t = useT();
  const set = (patch) => onChange({ ...theme, ...patch });
  const skillDisplay = theme.skill_display || "bar";
  return (
    <div className="space-y-5">
      {/* Language of the document itself: its printed section headings and text
          direction. Separate from the interface language, because a CV is often
          written for an employer who reads a different language. */}
      {onLanguageChange ? (
        <div>
          <span className="block text-xs font-medium text-muted-foreground mb-2">{t("builder.design.cvLanguage")}</span>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm transition",
                  (language || "en") === l.code ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{t("builder.design.cvLanguageHint")}</p>
        </div>
      ) : null}
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-2">{t("builder.design.accent")}</span>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => set({ primary_color: c.hex })}
              className={cn("w-8 h-8 rounded-full ring-offset-2 transition", theme.primary_color === c.hex ? "ring-2 ring-primary" : "ring-0")}
              style={{ background: c.hex }}
              aria-label={c.id}
            />
          ))}
          <label className="w-8 h-8 rounded-full border border-border grid place-items-center cursor-pointer overflow-hidden relative">
            <input type="color" value={theme.primary_color} onChange={(e) => set({ primary_color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
            <span className="text-[10px] text-muted-foreground">{t("builder.design.custom")}</span>
          </label>
        </div>
      </div>
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-2">{t("builder.design.skillIndicator")}</span>
        <div className="grid grid-cols-3 gap-2">
          {SKILL_DISPLAY_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => set({ skill_display: o.id })}
              className={cn("px-2 py-2 rounded-lg border text-xs transition", skillDisplay === o.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-2">{t("builder.design.typography")}</span>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => set({ font_id: f.id })}
              className={cn("px-3 py-2 rounded-lg border text-sm transition", theme.font_id === f.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
              style={{ fontFamily: f.stack }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}