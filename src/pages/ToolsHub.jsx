import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  FileCheck,
  FileText,
  FileCode,
  FileSignature,
  Minimize2,
  Combine,
  Split,
  FileCheck2,
  ImageDown,
  FileImage,
  RotateCw,
  Layers,
  FileArchive,
  Scaling,
  RefreshCcw,
  Crop,
  Eraser,
  PenTool,
  SearchCode,
  MailQuestion,
  Send,
  PackageCheck,
  QrCode,
  Gauge
} from "lucide-react";
import { ALL_TOOLS, TOOL_CATEGORIES } from "../tools/toolsData";
import { getRecentTools } from "../lib/careerStorage";

// Icon mapping for dynamic render
const ICON_MAP = {
  FileCheck,
  FileText,
  FileCode,
  FileSignature,
  Minimize2,
  Combine,
  Split,
  FileCheck2,
  ImageDown,
  FileImage,
  RotateCw,
  Layers,
  FileArchive,
  Scaling,
  RefreshCcw,
  Crop,
  Eraser,
  PenTool,
  SearchCode,
  MailQuestion,
  Send,
  PackageCheck,
  QrCode,
  Gauge
};

export default function ToolsHub() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const recentTools = getRecentTools();

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchesCat = activeCategory === "all" || tool.category === activeCategory;
      const matchesSearch = !searchQuery.trim() || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>20+ Free Career & Document Utilities</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Career & Document Utility Toolkit
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Fast, client-side tools to audit your CV, compress PDFs, polish photos, and assemble job application documents.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Instant • No Signup Required</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Search and Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Tools ({ALL_TOOLS.length})
            </button>
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. compress, merge)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => {
            const IconComp = ICON_MAP[tool.icon] || FileText;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <IconComp className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {tool.shortDesc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Open tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tools found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Bottom CTA to CV Builder */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Ready to create a clean, ATS-optimized CV?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Build a professional resume in minutes with our account-free, local-storage CV Builder.
            </p>
          </div>
          <Link
            to="/builder"
            className="shrink-0 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition-all inline-flex items-center gap-2"
          >
            <span>Launch CV Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
