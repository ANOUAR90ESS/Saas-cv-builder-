import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Dots({ cv }) {
  const color = cv.theme?.primary_color || "#7c3aed";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-[2px] rounded" style={{ background: color }} />
      {SECTION_LABELS[k]}
    </h2>
  );
  const dots = `radial-gradient(${color}33 1.5px, transparent 1.6px)`;
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-9 relative" style={{ background: dots, backgroundSize: "14px 14px" }}>
        <div className="text-[32px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] mt-1 font-medium" style={{ color }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-600 mt-3" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}