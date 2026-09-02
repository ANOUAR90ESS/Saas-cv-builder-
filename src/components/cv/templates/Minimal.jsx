import React from "react";
import { ContactLine, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

export default function Minimal({ cv }) {
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const ink = "#111827";
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-5">
          <p className="text-[12px] leading-relaxed text-gray-600">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.experience}</h2>
          <ExperienceList items={cv.experience} color={ink} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.education}</h2>
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.skills}</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {cv.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-[11.5px] text-gray-700">
                <span>{s.name}</span>
                <SkillMeter level={s.level} display={display} color={ink} />
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.languages}</h2>
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.projects}</h2>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="flex justify-between">
                <h3 className="font-medium text-[12.5px] text-gray-900">{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-400">{p.url}</span> : null}
              </div>
              {p.description ? <p className="text-[11px] text-gray-600">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.certifications}</h2>
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex justify-between text-[11px] mb-0.5">
              <span className="text-gray-900">{c.name}</span>
              <span className="text-gray-400">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS.interests}</h2>
          <SimpleList items={cv.interests} />
        </section>
      );
    return renderExtraSection(key, cv, (k) => (
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">{SECTION_LABELS[k]}</h2>
    ));
  };

  return (
    <div className="cv-page mx-auto p-12" style={{ fontFamily: font, color: ink }}>
      <header className="mb-7 text-center">
        <div className="text-[26px] font-light tracking-tight">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12px] text-gray-500 mt-1 tracking-wide">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-400 mt-2 justify-center" />
      </header>
      {order.map(render)}
    </div>
  );
}