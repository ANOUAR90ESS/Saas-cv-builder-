import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Pastel({ cv }) {
  const color = cv.theme?.primary_color || "#a78bfa";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-[2px] rounded-full" style={{ background: color }} />
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c", background: "#faf5ff" }}>
      <div className="mx-8 mt-8 mb-2 rounded-3xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${color}, #f0abfc)` }}>
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1 text-white/95">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/90 mt-3" />
      </div>
      <div className="px-10 pb-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}