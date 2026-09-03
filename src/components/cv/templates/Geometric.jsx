import React from "react";
import {
  ContactLine,
  ExperienceList,
  EducationList,
  SimpleList,
  fontStack,
  fmtDate,
  SECTION_LABELS,
} from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// Bold geometric header with an angled color block, confident single column.
export default function Geometric({ cv }) {
  const color = cv.theme?.primary_color || "#ea580c";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    const t = (k) => (
      <h2 className="text-[13px] font-extrabold uppercase tracking-wide mb-2.5 pl-3 border-l-4" style={{ borderColor: color, color: "#1a202c" }}>
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
          <ExperienceList items={cv.experience} color={color} />
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
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span key={s.id} className="text-[10.5px] font-bold px-2.5 py-1 text-white" style={{ background: color, clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}>
                {s.name}
              </span>
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
              <h3 className="font-bold text-[12.5px]" style={{ color }}>{p.name}</h3>
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
              <span className="font-semibold" style={{ color }}>{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
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
    <div className="cv-page mx-auto overflow-hidden" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="relative px-10 pt-10 pb-8">
        <div className="absolute top-0 right-0 h-full w-[42%]" style={{ background: color, clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" }} />
        <div className="relative">
          <div className="text-[32px] font-black tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[14px] mt-1 text-white font-medium" style={{ marginLeft: "58%" }}>{pi.professional_title}</p> : null}
        </div>
        <ContactLine pi={pi} className="text-[10.5px] text-gray-700 mt-3 relative" />
      </header>
      <div className="px-10 pb-10">{order.map(render)}</div>
    </div>
  );
}