import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EXAMPLES } from "@/lib/examples";
import MiniCVPreview from "@/components/cv/MiniCVPreview";
import PullToRefresh from "@/components/PullToRefresh";
import { getTemplate } from "@/lib/templates/registry";
import Seo from "@/components/Seo";

const CATEGORIES = ["All", "Developer", "Designer", "Accountant", "Student", "Manager", "Marketing"];

export default function CVExamples() {
  const [cat, setCat] = useState("All");
  const navigate = useNavigate();
  const list = EXAMPLES.filter((e) => cat === "All" || e.id === cat.toLowerCase());

  return (
    <PullToRefresh onRefresh={async () => {}}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Seo title="CV Examples — DexaCV" description="Browse original CV examples for developers, designers, students and more. Pick one and make it yours in minutes — free to edit, no watermark." path="/cv-examples" />
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-bold tracking-tight">CV examples</h1>
        <p className="mt-3 text-gray-600">Real, original example CVs for inspiration. Pick one and make it yours in minutes.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${cat === c ? "bg-primary text-white" : "bg-muted text-gray-600 hover:bg-muted/70"}`}>{c}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((cv) => {
          const tpl = getTemplate(cv.template_id);
          return (
            <div key={cv.id} className="rounded-2xl border border-border bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-muted/30">
                <MiniCVPreview cv={cv} />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{cv.personal_info.full_name}</h3>
                <p className="text-sm text-gray-500">{cv.personal_info.professional_title}</p>
                <p className="text-xs text-gray-400 mt-1 mb-3">Template: {tpl.name}</p>
                <button onClick={() => navigate("/builder", { state: { templateId: cv.template_id } })} className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
                  Create a CV like this
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </PullToRefresh>
  );
}