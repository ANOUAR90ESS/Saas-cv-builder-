import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Outline({ cv }) {
  const color = cv.theme?.primary_color || "#0ea5e9";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color }}>{SECTION_LABELS[k]}</h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 pt-10 pb-6">
        <div className="inline-block px-5 py-3 border-2" style={{ borderColor: color }}>
          <div className="text-[26px] font-extrabold tracking-[0.08em] uppercase leading-none">{pi.full_name || "Your Name"}</div>
        </div>
        {pi.professional_title ? <p className="text-[13px] mt-3 font-medium" style={{ color }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-3" />
      </header>
      <div className="p-10 pt-0">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}