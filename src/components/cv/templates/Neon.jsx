import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Neon({ cv }) {
  const color = cv.theme?.primary_color || "#22d3ee";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const mono = "'JetBrains Mono', monospace";
  const title = (k) => (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color, fontFamily: mono }}>
      {"// "}{SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-10 text-white relative overflow-hidden" style={{ background: "#0b0f19" }}>
        <div className="text-[34px] font-extrabold tracking-tight leading-none" style={{ color, textShadow: `0 0 20px ${color}90` }}>{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1.5 font-mono" style={{ color: "#94a3b8" }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/80 mt-3 font-mono" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="bars" />
      </div>
    </div>
  );
}