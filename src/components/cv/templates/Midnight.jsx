import React from "react";
import {
  ContactLine,
  ExperienceList,
  EducationList,
  SimpleList,
  SkillMeter,
  fontStack,
  fmtDate,
  SECTION_LABELS,
} from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// Inverted dark sidebar layout: charcoal left rail, light content.
export default function Midnight({ cv }) {
  const color = cv.theme?.primary_color || "#6366f1";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const display = cv.theme?.skill_display || "bar";

  const sidebar = (key) => {
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">{SECTION_LABELS.skills}</h2>
          <div className="space-y-1.5">
            {cv.skills.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/85">{s.name}</span>
                <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color={color} light />
              </div>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">{SECTION_LABELS.languages}</h2>
          <ul className="space-y-1">
            {cv.languages.map((l) => (
              <li key={l.id} className="flex justify-between text-[11px]">
                <span className="text-white/85">{l.name}</span>
                <span className="text-white/55">{l.level}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">{SECTION_LABELS.certifications}</h2>
          {cv.certifications.map((c) => (
            <div key={c.id} className="mb-1.5">
              <div className="text-[11px] font-semibold text-white">{c.name}</div>
              <div className="text-[10px] text-white/55">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" · ")}</div>
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">{SECTION_LABELS.interests}</h2>
          <SimpleList items={cv.interests} light />
        </section>
      );
    return null;
  };

  const main = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-1.5" style={{ color }}>{SECTION_LABELS.summary}</h2>
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2" style={{ color }}>{SECTION_LABELS.experience}</h2>
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2" style={{ color }}>{SECTION_LABELS.education}</h2>
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2" style={{ color }}>{SECTION_LABELS.projects}</h2>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="flex justify-between">
                <h3 className="font-semibold text-[12.5px]" style={{ color }}>{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-500">{p.url}</span> : null}
              </div>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "skills" || key === "languages" || key === "certifications" || key === "interests") return null;
    return renderExtraSection(key, cv, (k) => (
      <h2 className="text-[13px] font-bold mb-2" style={{ color }}>{SECTION_LABELS[k]}</h2>
    ));
  };

  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const sideKeys = ["skills", "languages", "certifications", "interests"];

  return (
    <div className="cv-page mx-auto flex" style={{ fontFamily: font, color: "#1a202c" }}>
      <aside className="w-[34%] p-8" style={{ background: "#111827" }}>
        <div className="text-[22px] font-extrabold text-white leading-tight">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12px] mt-1 mb-5" style={{ color }}>{pi.professional_title}</p> : <div className="mb-5" />}
        <ContactLine pi={pi} className="text-[10.5px] text-white/70 leading-relaxed mb-5" />
        {order.filter((k) => sideKeys.includes(k)).map(sidebar)}
      </aside>
      <main className="flex-1 p-8">{order.filter((k) => !sideKeys.includes(k)).map(main)}</main>
    </div>
  );
}