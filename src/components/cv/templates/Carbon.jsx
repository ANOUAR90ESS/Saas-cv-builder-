import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Carbon({ cv }) {
  const color = cv.theme?.primary_color || "#f59e0b";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.16em] mb-2 pl-3 border-l-4" style={{ color, borderColor: color }}>
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-9 text-white relative" style={{ background: `linear-gradient(160deg, #111827 0%, #1f2937 100%)` }}>
        <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: color }} />
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1.5 font-medium" style={{ color }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/75 mt-3" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="bars" />
      </div>
    </div>
  );
}