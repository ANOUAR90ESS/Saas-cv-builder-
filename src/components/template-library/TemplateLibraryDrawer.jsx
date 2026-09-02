import React, { useState, useMemo } from "react";
import { X, Search, Check, Sparkles, LayoutGrid, List, ShieldCheck } from "lucide-react";
import { TEMPLATES, CATEGORIES } from "@/lib/templates/registry";
import MiniCVPreview from "@/components/cv/MiniCVPreview";

export default function TemplateLibraryDrawer({
  open,
  onClose,
  currentTemplateId,
  onSelectTemplate,
  cv,
  color = "#2563eb"
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesCat = selectedCategory === "All" || t.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl bg-card border-l border-border h-full flex flex-col shadow-2xl text-card-foreground animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  CV Template Library
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                  {TEMPLATES.length} Styles
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Browse, preview, and toggle professional designs for your CV.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
              aria-label="Close template library"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search and Layout controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates (e.g. ATS, Modern, Executive, Clean)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  viewMode === "grid" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid layout"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  viewMode === "list" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="List layout"
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Gallery List / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-muted-foreground">
              <p className="text-sm">No templates matched your search criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs text-primary font-medium hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((t) => {
                const isSelected = t.id === currentTemplateId;
                const isAts = t.id === "ats" || t.id === "atsmax" || t.category === "ATS Friendly";
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTemplate(t.id)}
                    className={`group relative flex flex-col rounded-2xl border transition-all cursor-pointer overflow-hidden text-left bg-background ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 shadow-md"
                        : "border-border hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    {/* Preview canvas */}
                    <div className="h-56 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-3 relative overflow-hidden border-b border-border/60">
                      <div className="w-full h-full transform scale-90 transition group-hover:scale-95 duration-200">
                        <MiniCVPreview cv={cv} templateId={t.id} color={color} />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                          {t.category}
                        </span>
                        {isAts && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-0.5">
                            <ShieldCheck size={10} /> ATS Ready
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 bg-primary text-white p-1 rounded-full shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {t.name}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {t.description || "Clean, professionally formatted layout."}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {isSelected ? "Active template" : "Click to apply"}
                        </span>
                        <button
                          type="button"
                          className={`text-xs font-semibold px-3 py-1 rounded-lg transition ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "bg-muted hover:bg-primary hover:text-white text-foreground"
                          }`}
                        >
                          {isSelected ? "Applied" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((t) => {
                const isSelected = t.id === currentTemplateId;
                const isAts = t.id === "ats" || t.id === "atsmax" || t.category === "ATS Friendly";
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTemplate(t.id)}
                    className={`flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl border transition cursor-pointer bg-background ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-24 h-28 shrink-0 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative border border-border/60">
                      <MiniCVPreview cv={cv} templateId={t.id} color={color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground">{t.name}</h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {t.category}
                        </span>
                        {isAts && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-0.5">
                            <ShieldCheck size={10} /> ATS Benchmark 100%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        className={`text-xs font-semibold px-4 py-2 rounded-xl transition ${
                          isSelected
                            ? "bg-primary text-white"
                            : "border border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        {isSelected ? "Current" : "Apply Template"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            Current: <strong className="text-foreground">{TEMPLATES.find((t) => t.id === currentTemplateId)?.name || currentTemplateId}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
