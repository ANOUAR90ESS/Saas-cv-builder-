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

// Strong typographic hierarchy: section titles get a thick accent underline.
export default function Underline({ cv }) {
  const color = cv.theme?.primary_color || "#2563eb";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    const t = (k) => (
      <h2 className="text-[14px] font-bold mb-2.5 pb-1 border-b-[3px] w-full" style={{ borderColor: color, color: "#1a202c" }}>
        {SECTION_LABELS[k]}
      </h2>
    );
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-5">
          {t("summary")}
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-5">
          {t("experience")}
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-5">
          {t("education")}
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-5">
          {t("skills")}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {cv.skills.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <span className="text-[11px]">{s.name}</span>
                <SkillMeter level={s.level} display={display} color={color} />
              </div>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-5">
          {t("languages")}
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-5">
          {t("projects")}
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <h3 className="font-semibold text-[12.5px]">{p.name}</h3>
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-5">
          {t("certifications")}
          {cv.certifications.map((c) => (
            <div key={c.id} className="text-[11px] mb-0.5">
              <span className="font-semibold" style={{ color }}>{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-5">
          {t("interests")}
          <SimpleList items={cv.interests} />
        </section>
      );
    return renderExtraSection(key, cv, t);
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 pt-10 pb-5">
        <div className="text-[34px] font-black tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] mt-1 font-medium" style={{ color }}>{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-600 mt-2" />
      </header>
      <div className="px-10 pb-10">{order.map(render)}</div>
    </div>
  );
}