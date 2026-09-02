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

// Editorial magazine layout: name band, then a 3-column top row for short sections.
export default function Magazine({ cv }) {
  const color = cv.theme?.primary_color || "#e11d48";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";
  const topKeys = ["skills", "languages", "interests"];
  const colTitle = (k) => (
    <h2 className="text-[11px] font-extrabold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color, borderColor: color + "55" }}>
      {SECTION_LABELS[k]}
    </h2>
  );

  const col = (key) => {
    if (key === "skills" && cv.skills?.length)
      return (
        <div key={key}>
          {colTitle("skills")}
          <ul className="space-y-1">
            {cv.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-[11px]">
                <span>{s.name}</span>
                <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color={color} />
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <div key={key}>
          {colTitle("languages")}
          <ul className="space-y-1">
            {cv.languages.map((l) => (
              <li key={l.id} className="flex justify-between text-[11px]">
                <span>{l.name}</span><span className="text-gray-500">{l.level}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <div key={key}>
          {colTitle("interests")}
          <SimpleList items={cv.interests} />
        </div>
      );
    return null;
  };

  const main = (key) => {
    const t = (k) => (
      <h2 className="text-[13px] font-extrabold uppercase tracking-wide mb-2" style={{ color }}>{SECTION_LABELS[k]}</h2>
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
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          {t("projects")}
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <h3 className="font-bold text-[12.5px]">{p.name}</h3>
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
    return renderExtraSection(key, cv, t);
  };

  const topRow = order.filter((k) => topKeys.includes(k));
  const mainKeys = order.filter((k) => !topKeys.includes(k));

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 pt-10 pb-5 flex items-end justify-between border-b-2" style={{ borderColor: color }}>
        <div>
          <div className="text-[30px] font-black tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[13px] mt-1 text-gray-600">{pi.professional_title}</p> : null}
        </div>
        <ContactLine pi={pi} className="text-[10px] text-gray-600 text-right" />
      </header>
      <div className="px-10 py-6">
        {topRow.length > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-6">{topRow.map(col)}</div>
        )}
        {mainKeys.map(main)}
      </div>
    </div>
  );
}