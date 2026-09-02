import React from "react";
import { ContactLine, fontStack, SECTION_LABELS } from "@/components/cv/SharedBits";
import { SectionKit } from "@/components/cv/SectionKit";

export default function Confetti({ cv }) {
  const color = cv.theme?.primary_color || "#f43f5e";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const title = (k) => (
    <h2 className="text-[13px] font-extrabold mb-2 inline-block px-2.5 py-0.5 rounded-full text-white" style={{ background: color }}>{SECTION_LABELS[k]}</h2>
  );
  const dots = [{ x: "8%", y: "20%", c: color }, { x: "85%", y: "15%", c: "#f59e0b" }, { x: "92%", y: "70%", c: "#10b981" }, { x: "12%", y: "75%", c: "#6366f1" }];
  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="relative px-10 pt-10 pb-6 overflow-hidden">
        {dots.map((d, i) => <span key={i} className="absolute w-2.5 h-2.5 rounded-full" style={{ left: d.x, top: d.y, background: d.c }} />)}
        <div className="text-[32px] font-black tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1.5 text-gray-600">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-3" />
      </header>
      <div className="p-10">
        <SectionKit cv={cv} color={color} title={title} skillStyle="chips" />
      </div>
    </div>
  );
}