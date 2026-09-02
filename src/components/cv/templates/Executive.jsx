import React from "react";
import { ContactLine, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

export default function Executive({ cv }) {
  const color = cv.theme?.primary_color || "#1f2937";
  const font = cv.theme?.font_id === "serif" || cv.theme?.font_id === "playfair" ? "'Playfair Display', Georgia, serif" : fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.summary}</h2>
          <p className="text-[11.5px] leading-relaxed text-gray-700 font-serif-cv">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.experience}</h2>
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.education}</h2>
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.skills}</h2>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
            {cv.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-[11.5px] text-gray-800 font-serif-cv">
                <span>{s.name}</span>
                <SkillMeter level={s.level} display={display} color={color} />
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.languages}</h2>
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.projects}</h2>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="font-semibold text-[12.5px] text-gray-900">{p.name}</div>
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS.certifications}</h2>
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex justify-between text-[11px] mb-0.5">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, (k) => (
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color }}>{SECTION_LABELS[k]}</h2>
    ));
  };

  return (
    <div className="cv-page mx-auto p-10" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="mb-6 text-center pb-4 border-b" style={{ borderColor: color }}>
        <div className="text-[28px] font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif", color }}>
          {pi.full_name || "Your Name"}
        </div>
        {pi.professional_title ? <p className="text-[12px] uppercase tracking-[0.22em] text-gray-500 mt-1">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-2 justify-center" />
      </header>
      {order.map(render)}
    </div>
  );
}