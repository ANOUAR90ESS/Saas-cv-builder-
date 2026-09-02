import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Wave({ cv }) {
  const color = cv.theme?.primary_color || "#06b6d4";
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
      <header className="px-10 pt-9 pb-12 text-white relative" style={{ background: color }}>
        <div className="text-[32px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] mt-1 text-white/90">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/85 mt-3" />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ height: 36 }}>
          <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" fill="#fff" />
        </svg>
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}