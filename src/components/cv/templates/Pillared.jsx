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

// Centered, elegant single column with a thin vertical accent pillar under the name.
export default function Pillared({ cv }) {
  const color = cv.theme?.primary_color || "#334155";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    const t = (k) => (
      <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-center mb-3" style={{ color }}>
        {SECTION_LABELS[k]}
      </h2>
    );
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-5 text-center">
          {t("summary")}
          <p className="text-[11.5px] leading-relaxed text-gray-700 max-w-[150mm] mx-auto">{cv.summary}</p>
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
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {cv.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 text-[11px]">
                {s.name}
                <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color={color} />
              </span>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-5">
          {t("languages")}
          <p className="text-[11px] text-center text-gray-700">{cv.languages.map((l) => `${l.name} (${l.level})`).join("  •  ")}</p>
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-5">
          {t("certifications")}
          <div className="text-center">
            {cv.certifications.map((c) => (
              <div key={c.id} className="text-[11px] mb-0.5">
                <span className="font-semibold" style={{ color }}>{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
              </div>
            ))}
          </div>
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-5">
          {t("interests")}
          <p className="text-[11px] text-center text-gray-700"><SimpleList items={cv.interests} /></p>
        </section>
      );
    return renderExtraSection(key, cv, t);
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="pt-12 pb-6 text-center">
        <div className="text-[32px] font-light tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{pi.full_name || "Your Name"}</div>
        <div className="mx-auto my-3 w-px h-10" style={{ background: color }} />
        {pi.professional_title ? <p className="text-[13px] uppercase tracking-[0.2em] text-gray-500">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-3 text-center justify-center" />
      </header>
      <div className="px-12 pb-12">{order.map(render)}</div>
    </div>
  );
}