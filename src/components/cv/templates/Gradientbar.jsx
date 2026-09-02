import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Gradientbar({ cv }) {
  const color = cv.theme?.primary_color || "#2563eb";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-[2px] rounded" style={{ background: color }} />
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${color}, #ec4899, ${color})` }} />
      <header className="px-10 pt-8 pb-6">
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1 text-gray-600">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-3" />
      </header>
      <div className="p-10 pt-0">
        <SectionKit cv={cv} color={color} title={title} skillStyle="bars" />
      </div>
    </div>
  );
}