import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Techneo({ cv }) {
  const color = cv.theme?.primary_color || "#8b5cf6";
  const font = fontStack(cv.theme?.font_id);
  const mono = "'JetBrains Mono', monospace";
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2 pl-2 border-l-2" style={{ color, borderColor: color, fontFamily: mono }}>
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-9 text-white relative" style={{ background: `linear-gradient(120deg, #0f172a 0%, ${color} 140%)` }}>
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12px] mt-1.5 font-mono text-white/80">{"> "}{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/80 mt-3 font-mono" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="bars" />
      </div>
    </div>
  );
}