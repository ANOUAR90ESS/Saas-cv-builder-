import React from "react";
import { ContactLine, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Mono({ cv }) {
  const color = cv.theme?.primary_color || "#111111";
  const mono = "'JetBrains Mono', monospace";
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color, fontFamily: mono }}>
      {"// "}{SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: mono, color: "#111" }}>
      <header className="px-10 pt-10 pb-6 border-b" style={{ borderColor: "#111" }}>
        <div className="text-[28px] font-bold tracking-tight leading-none uppercase">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12px] mt-1.5 uppercase tracking-[0.15em] text-gray-500">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10px] text-gray-600 mt-3" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="list" />
      </div>
    </div>
  );
}