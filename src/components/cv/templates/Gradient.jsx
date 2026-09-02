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

// Vibrant gradient header band, clean white body.
export default function Gradient({ cv }) {
  const color = cv.theme?.primary_color || "#7c3aed";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    const title = (k) => (
      <h2 className="text-[12.5px] font-bold uppercase tracking-wide mb-2 flex items-center gap-2" style={{ color }}>
        <span className="w-5 h-[2px] rounded" style={{ background: color }} />
        {SECTION_LABELS[k]}
      </h2>
    );
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          {title("summary")}
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          {title("experience")}
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          {title("education")}
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          {title("skills")}
          <div className="space-y-1.5">
            {cv.skills.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-[11px] w-32 truncate">{s.name}</span>
                <SkillMeter level={s.level} display={display} color={color} className="flex-1" />
              </div>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          {title("languages")}
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          {title("projects")}
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <h3 className="font-semibold text-[12.5px]" style={{ color }}>{p.name}</h3>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-4">
          {title("certifications")}
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
          {title("interests")}
          <SimpleList items={cv.interests} />
        </section>
      );
    return renderExtraSection(key, cv, title);
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header
        className="px-10 py-9 text-white"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 55%, #111827 130%)` }}
      >
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] mt-1 text-white/90">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/80 mt-3" />
      </header>
      <div className="p-10">{order.map(render)}</div>
    </div>
  );
}