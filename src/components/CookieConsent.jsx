import React, { useState } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const KEY = "dexacv_consent";

export function getConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  const c = getConsent();
  return !!c && c.analytics === true;
}

export default function CookieConsent() {
  const t = useT();
  const [choice, setChoice] = useState(() => getConsent());
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  if (choice) return null;

  const save = (analyticsValue) => {
    const c = { necessary: true, analytics: analyticsValue, date: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
    setChoice(c);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-6">
        <h2 className="text-lg font-bold leading-tight">{t("consent.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t("consent.body")}</p>

        {customizing ? (
          <div className="mt-4 space-y-3">
            <ConsentRow
              label={t("consent.necessary")}
              desc={t("consent.necessaryDesc")}
              checked
              onChange={() => {}}
              disabled
            />
            <ConsentRow
              label={t("consent.analytics")}
              desc={t("consent.analyticsDesc")}
              checked={analytics}
              onChange={setAnalytics}
            />
            <button
              onClick={() => save(analytics)}
              className="w-full mt-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
            >
              {t("consent.savePrefs")}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            <button
              onClick={() => save(true)}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
            >
              {t("consent.acceptAll")}
            </button>
            <button
              onClick={() => setCustomizing(true)}
              className="w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition"
            >
              {t("consent.customize")}
            </button>
            <button
              onClick={() => save(false)}
              className="w-full py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 transition"
            >
              {t("consent.rejectAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentRow({ label, desc, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "shrink-0 w-10 h-6 rounded-full transition relative mt-0.5",
          checked ? "bg-primary" : "bg-muted-foreground/40",
          disabled && "opacity-70"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
            checked ? "start-[18px]" : "start-0.5"
          )}
        />
      </button>
    </div>
  );
}