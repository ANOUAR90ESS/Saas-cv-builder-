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

// Each section sits in its own rounded bordered card with a soft shadow.
export default function Card({ cv }) {
  const color = cv.theme?.primary_color || "#059669";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    const t = (k) => (
      <h2 className="text-[12.5px] font-bold mb-2.5 flex items-center gap-2" style={{ color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {SECTION_LABELS[k]}
      </h2>
    );
    let body = null;
    if (key === "summary" && cv.summary)
      body = <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>;
    else if (key === "experience" && cv.experience?.length)
      body = <ExperienceList items={cv.experience} color={color} />;
    else if (key === "education" && cv.education?.length)
      body = <EducationList items={cv.education} />;
    else if (key === "skills" && cv.skills?.length)
      body = (
        <div className="flex flex-wrap gap-2">
          {cv.skills.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-2 text-[10.5px] px-2.5 py-1 rounded-full font-medium" style={{ background: color + "14", color }}>
              {s.name}
              <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color={color} />
            </span>
          ))}
        </div>
      );
    else if (key === "languages" && cv.languages?.length)
      body = <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />;
    else if (key === "projects" && cv.projects?.length)
      body = cv.projects.map((p) => (
        <div key={p.id} className="mb-1.5">
          <h3 className="font-semibold text-[12.5px]" style={{ color }}>{p.name}</h3>
          {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
        </div>
      ));
    else if (key === "certifications" && cv.certifications?.length)
      body = cv.certifications.map((c) => (
        <div key={c.id} className="text-[11px] mb-0.5">
          <span className="font-semibold" style={{ color }}>{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
        </div>
      ));
    else if (key === "interests" && cv.interests?.length)
      body = <SimpleList items={cv.interests} />;
    if (!body) {
      const extra = renderExtraSection(key, cv, t);
      if (extra) return extra;
      return null;
    }
    return (
      <section key={key} className="mb-4 p-4 rounded-xl border border-gray-200" style={{ boxShadow: "0 1px 2px rgba(16,24,40,.05)" }}>
        {t(key)}
        {body}
      </section>
    );
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c", background: "#f9fafb" }}>
      <header className="px-10 py-8">
        <div className="text-[28px] font-extrabold tracking-tight">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] mt-1" style={{ color }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-600 mt-2" />
      </header>
      <div className="px-8 pb-10">{order.map(render)}</div>
    </div>
  );
}