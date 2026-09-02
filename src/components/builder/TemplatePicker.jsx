import React, { useState } from "react";
import { TEMPLATES, CATEGORIES } from "@/lib/templates/registry";
import { createDemoCV } from "@/lib/cvSchema";
import MiniCVPreview from "@/components/cv/MiniCVPreview";
import { cn } from "@/lib/utils";
import { Sparkles, ShieldCheck } from "lucide-react";

const demo = createDemoCV();

export default function TemplatePicker({ value, onChange, onOpenLibrary, cv }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    const matchesCat = selectedCategory === "All" || t.category === selectedCategory;
    const matchesQuery = !query || t.name.toLowerCase().includes(query.toLowerCase()) || (t.description && t.description.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Quick launch Template Library drawer banner */}
      {onOpenLibrary && (
        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">Interactive Template Library</div>
              <div className="text-[11px] text-muted-foreground">Full-screen browser with real-time CV preview & ATS filters</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLibrary}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition shrink-0 shadow-xs"
          >
            Open Library
          </button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition",
              selectedCategory === cat
                ? "bg-primary text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of templates */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((t) => {
          const active = value === t.id;
          const isAts = t.id === "ats" || t.id === "atsmax" || t.category === "ATS Friendly";
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "group relative rounded-xl border overflow-hidden bg-card text-left transition hover:shadow-sm",
                active ? "border-primary ring-2 ring-primary/30 shadow-xs" : "border-border hover:border-primary/40"
              )}
            >
              <div className="bg-muted/30 relative">
                <MiniCVPreview cv={cv ? { ...cv, template_id: t.id } : { ...demo, template_id: t.id }} />
                {isAts && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-0.5 shadow-xs">
                    <ShieldCheck size={9} /> ATS
                  </span>
                )}
                {active && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white shadow-xs">
                    Active
                  </span>
                )}
              </div>
              <div className="px-2.5 py-2">
                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{t.name}</div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">{t.description || t.category}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
