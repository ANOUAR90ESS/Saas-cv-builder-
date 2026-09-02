import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Glass({ cv }) {
  const color = cv.theme?.primary_color || "#6366f1";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-[2px] rounded" style={{ background: color }} />
      {SECTION_LABELS[k]}
    </h2>
  );
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c", background: `linear-gradient(135deg, ${color}14, #ec489914)` }}>
      <div className="m-8 rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.6)" }}>
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1" style={{ color }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-600 mt-3" />
      </div>
      <div className="px-10 pb-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}