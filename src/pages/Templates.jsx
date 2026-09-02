import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { TEMPLATES, CATEGORIES } from "@/lib/templates/registry";
import { createDemoCV } from "@/lib/cvSchema";
import MiniCVPreview from "@/components/cv/MiniCVPreview";
import PullToRefresh from "@/components/PullToRefresh";
import Seo from "@/components/Seo";

const demo = createDemoCV();

export default function Templates() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = TEMPLATES.filter((t) => (cat === "All" || t.category === cat) && t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <PullToRefresh onRefresh={async () => {}}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Seo title="Free CV Templates — DexaCV" description="Browse original, professional CV templates. Pick one and start editing instantly — no watermark, no signup." path="/templates" />
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Free CV templates</h1>
        <p className="mt-3 text-muted-foreground">Original, professional designs — pick one and start editing instantly. No watermark, no signup.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${cat === c ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" className="pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm w-full sm:w-64" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div key={t.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-muted/30">
              <MiniCVPreview cv={{ ...demo, template_id: t.id }} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">{t.name}</h3>
                <span className="text-xs text-gray-400">{t.category}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{t.description}</p>
              <button
                onClick={() => navigate("/builder", { state: { templateId: t.id } })}
                className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                Use this template
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </PullToRefresh>
  );
}