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

// Formal corporate look: navy headings with thin gold rules. Serif typography.
export default function Navy({ cv }) {
  const navy = cv.theme?.primary_color || "#1e3a5f";
  const gold = "#c9a227";
  const font = fontStack(cv.theme?.font_id === "inter" ? "serif" : cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    const t = (k) => (
      <h2 className="text-[12.5px] font-bold uppercase tracking-wide mb-2.5 pb-1.5 border-b" style={{ color: navy, borderColor: gold }}>
        {SECTION_LABELS[k]}
      </h2>
    );
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          {t("summary")}
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          {t("experience")}
          <ExperienceList items={cv.experience} color={navy} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          {t("education")}
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          {t("skills")}
          <div className="space-y-1.5">
            {cv.skills.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <span className="text-[11px]">{s.name}</span>
                <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color={navy} />
              </div>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          {t("languages")}
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          {t("projects")}
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <h3 className="font-bold text-[12.5px]" style={{ color: navy }}>{p.name}</h3>
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-4">
          {t("certifications")}
          {cv.certifications.map((c) => (
            <div key={c.id} className="text-[11px] mb-0.5">
              <span className="font-semibold" style={{ color: navy }}>{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-4">
          {t("interests")}
          <SimpleList items={cv.interests} />
        </section>
      );
    return renderExtraSection(key, cv, t);
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 pt-12 pb-5 text-center">
        <div className="text-[30px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: navy }}>{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12.5px] mt-1 uppercase tracking-[0.2em]" style={{ color: gold }}>{pi.professional_title}</p> : null}
        <div className="mx-auto my-3 h-px w-32" style={{ background: gold }} />
        <ContactLine pi={pi} className="text-[10.5px] text-gray-600 justify-center text-center" />
      </header>
      <div className="px-12 pb-12">{order.map(render)}</div>
    </div>
  );
}