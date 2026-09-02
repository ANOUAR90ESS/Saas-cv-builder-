import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Vibrant({ cv }) {
  const color = cv.theme?.primary_color || "#f43f5e";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[13px] font-extrabold uppercase tracking-wide mb-2 pb-1 border-b-2" style={{ color, borderColor: color }}>{SECTION_LABELS[k]}</h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-10 text-white" style={{ background: color }}>
        <div className="text-[34px] font-black tracking-tight leading-none uppercase">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] mt-1.5 text-white/90 font-medium">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/85 mt-3" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}