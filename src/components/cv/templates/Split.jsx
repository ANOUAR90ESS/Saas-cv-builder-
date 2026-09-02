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

// Full-width name band on top, then a narrow sidebar + main content below.
export default function Split({ cv }) {
  const color = cv.theme?.primary_color || "#d97706";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";
  const sideKeys = ["skills", "languages", "certifications", "interests"];

  const side = (key) => {
    const t = (k) => (
      <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color }}>{SECTION_LABELS[k]}</h2>
    );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-5">
          {t("skills")}
          <div className="space-y-1.5">
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
          <ul className="space-y-1">
            {cv.languages.map((l) => (
              <li key={l.id} className="flex justify-between text-[11px]">
                <span>{l.name}</span><span className="text-gray-500">{l.level}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-5">
          {t("certifications")}
          {cv.certifications.map((c) => (
            <div key={c.id} className="mb-1.5">
              <div className="text-[11px] font-semibold">{c.name}</div>
              <div className="text-[10px] text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" · ")}</div>
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
    return null;
  };

  const main = (key) => {
    const t = (k) => (
      <h2 className="text-[13px] font-bold mb-2" style={{ color }}>{SECTION_LABELS[k]}</h2>
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
              <h3 className="font-semibold text-[12.5px]">{p.name}</h3>
              {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, t);
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-7 text-white" style={{ background: color }}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[26px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
            {pi.professional_title ? <p className="text-[13px] mt-1 text-white/90">{pi.professional_title}</p> : null}
          </div>
          <ContactLine pi={pi} className="text-[10.5px] text-white/85 text-right" />
        </div>
      </header>
      <div className="flex">
        <aside className="w-[30%] p-7" style={{ background: "#f8fafc" }}>
          {order.filter((k) => sideKeys.includes(k)).map(side)}
        </aside>
        <main className="flex-1 p-7">
          {order.filter((k) => !sideKeys.includes(k)).map(main)}
        </main>
      </div>
    </div>
  );
}