import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Brutalist({ cv }) {
  const color = cv.theme?.primary_color || "#111111";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] mb-2 inline-block px-2 py-1 border-2" style={{ borderColor: color, color }}>
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#111" }}>
      <header className="m-8 border-4 p-6" style={{ borderColor: color }}>
        <div className="text-[36px] font-black uppercase tracking-tight leading-[0.95]">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-2 font-bold uppercase tracking-wide" style={{ color }}>{pi.professional_title}</p> : null}
        <div className="mt-3 pt-3 border-t-2" style={{ borderColor: color }}>
          <ContactLine pi={pi} className="text-[10.5px] text-gray-700" />
        </div>
      </header>
      <div className="px-8 pb-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="list" />
      </div>
    </div>
  );
}