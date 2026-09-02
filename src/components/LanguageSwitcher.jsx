import React, { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, useLang } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-muted dark:text-gray-200 dark:hover:bg-muted/60 transition-colors ${compact ? "p-2" : "px-2.5 py-2"}`}
      >
        <Globe size={16} />
        {!compact && <span>{current.label}</span>}
        {!compact && <ChevronDown size={14} className="opacity-60" />}
      </button>
      {open && (
        <div className={`absolute mt-1 w-40 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden ${compact ? "right-0" : "right-0"}`}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors ${l.code === lang ? "text-primary font-medium" : "text-foreground"}`}
            >
              <span dir={l.dir === "rtl" ? "rtl" : "ltr"}>{l.label}</span>
              {l.code === lang && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}