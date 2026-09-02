import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Editorial({ cv }) {
  const color = cv.theme?.primary_color || "#b91c1c";
  const font = fontStack(cv.theme?.font_id);
  const display = "'Playfair Display', Georgia, serif";
  const pi = cv.personal_info || {};
  const title = (k) => (
    <div className="flex items-center gap-3 mb-2">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color }}>{SECTION_LABELS[k]}</h2>
      <span className="block flex-1 h-px" style={{ background: "#e5e7eb" }} />
    </div>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 pt-12 pb-6 border-b-2" style={{ borderColor: color }}>
        <div className="text-[44px] leading-[0.95] tracking-tight font-bold" style={{ fontFamily: display }}>{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-2 uppercase tracking-[0.25em] text-gray-500">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-600 mt-3" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}