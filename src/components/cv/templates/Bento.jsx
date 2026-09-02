import React from "react";
import { fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Bento({ cv }) {
  const color = cv.theme?.primary_color || "#f97316";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-[2px] rounded" style={{ background: color }} />
      {SECTION_LABELS[k]}
    </h2>
  );
  const bits = [pi.email, pi.phone, pi.location, pi.website, pi.linkedin, pi.github].filter(Boolean);
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c", background: "#fafafa" }}>
      <header className="p-8 grid grid-cols-3 gap-3">
        <div className="col-span-2 rounded-2xl p-6 text-white flex flex-col justify-center" style={{ background: color }}>
          <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[13px] mt-1 text-white/90">{pi.professional_title}</p> : null}
        </div>
        <div className="rounded-2xl p-4 bg-white border border-border flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Contact</span>
          <div className="space-y-0.5 text-[10px] text-gray-600 leading-snug break-words">
            {bits.length ? bits.map((b, i) => <div key={i}>{b}</div>) : <div className="text-gray-300">—</div>}
          </div>
        </div>
      </header>
      <div className="px-8 pb-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}