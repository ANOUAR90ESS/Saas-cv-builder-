import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Prism({ cv }) {
  const color = cv.theme?.primary_color || "#db2777";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-[2px] rounded" style={{ background: color }} />
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto overflow-hidden" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="relative px-10 pt-10 pb-8">
        <div className="absolute top-0 right-0 h-full w-[45%]" style={{ background: color, clipPath: "polygon(28% 0, 100% 0, 100% 100%, 0 100%)" }} />
        <div className="relative">
          <div className="text-[32px] font-black tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[14px] mt-1 font-medium text-white" style={{ marginLeft: "55%" }}>{pi.professional_title}</p> : null}
          <ContactLine pi={pi} className="text-[10.5px] text-gray-700 mt-3 relative" />
        </div>
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}