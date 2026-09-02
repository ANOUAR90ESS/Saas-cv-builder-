import React from "react";
import { ContactLine, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

export default function Creative({ cv }) {
  const color = cv.theme?.primary_color || "#7c3aed";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-1.5 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.summary}
          </h2>
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.experience}
          </h2>
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.education}
          </h2>
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.skills}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 text-[10.5px] px-2 py-1 rounded-full font-medium" style={{ background: color + "18", color }}>
                {s.name}
                <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color={color} />
              </span>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.languages}
          </h2>
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.projects}
          </h2>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5 p-2 rounded-lg" style={{ background: color + "0a" }}>
              <div className="flex justify-between">
                <h3 className="font-bold text-[12.5px]" style={{ color }}>{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-500">{p.url}</span> : null}
              </div>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.certifications}
          </h2>
          {cv.certifications.map((c) => (
            <div key={c.id} className="text-[11px] mb-0.5">
              <span className="font-semibold" style={{ color }}>{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>
            {SECTION_LABELS.interests}
          </h2>
          <SimpleList items={cv.interests} />
        </section>
      );
    return renderExtraSection(key, cv, (k) => (
      <h2 className="text-[13px] font-bold mb-2 inline-block px-2 py-0.5 rounded text-white" style={{ background: color }}>{SECTION_LABELS[k]}</h2>
    ));
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-8 text-white" style={{ background: color }}>
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] mt-1 text-white/85">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/80 mt-2" />
      </header>
      <div className="p-10">{order.map(render)}</div>
    </div>
  );
}