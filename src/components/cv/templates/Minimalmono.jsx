import React from "react";
import { ContactLine, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Minimalmono({ cv }) {
  const color = cv.theme?.primary_color || "#111111";
  const mono = "'JetBrains Mono', monospace";
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-400 mb-2" style={{ fontFamily: mono }}>{SECTION_LABELS[k]}</h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: mono, color: "#111" }}>
      <header className="px-12 pt-16 pb-10 text-center">
        <div className="text-[26px] font-medium tracking-tight">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[11px] mt-2 uppercase tracking-[0.3em] text-gray-400">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10px] text-gray-400 mt-4 justify-center" />
      </header>
      <div className="px-12 pb-12">
        <SectionKit cv={cv} color={color} title={title} skillStyle="list" />
      </div>
    </div>
  );
}