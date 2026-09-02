import React from "react";
import { ExperienceList, EducationList, SimpleList, SkillMeter, fmtDate, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// Single-column modern body used by the newer templates. Each template supplies a
// `title(k)` heading factory and an accent `color`; awards/courses/volunteer/references
// are delegated to the shared extra-section renderer so nothing is dropped.
export function SectionKit({ cv, color, title, skillStyle = "chips", display }) {
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const disp = display || cv.theme?.skill_display || "bar";
  const render = (key) => {
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
    if (key === "skills" && cv.skills?.length) {
      if (skillStyle === "list")
        return (
          <section key={key} className="mb-4">
            {title("skills")}
            <SimpleList items={cv.skills.map((s) => s.name + (s.level ? ` (${s.level})` : ""))} />
          </section>
        );
      if (skillStyle === "bars")
        return (
          <section key={key} className="mb-4">
            {title("skills")}
            <div className="space-y-1.5">
              {cv.skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-800">{s.name}</span>
                  <SkillMeter level={s.level} display="bar" color={color} />
                </div>
              ))}
            </div>
          </section>
        );
      return (
        <section key={key} className="mb-4">
          {title("skills")}
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-full font-medium" style={{ background: color + "14", color }}>
                {s.name}
                <SkillMeter level={s.level} display={disp === "bar" ? "dots" : disp} color={color} />
              </span>
            ))}
          </div>
        </section>
      );
    }
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
              <h3 className="font-semibold text-[12.5px] text-gray-900">{p.name}</h3>
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
  return <>{order.map(render)}</>;
}