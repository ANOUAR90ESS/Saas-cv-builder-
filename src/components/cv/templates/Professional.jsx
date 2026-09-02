import React from "react";
import { ContactLine, SectionTitle, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

export default function Professional({ cv }) {
  const color = cv.theme?.primary_color || "#4f46e5";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.summary} color={color} />
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.experience} color={color} />
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.education} color={color} />
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.skills} color={color} />
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 text-[10.5px] px-2 py-0.5 rounded border" style={{ borderColor: color + "55", color: "#374151" }}>
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
          <SectionTitle label={SECTION_LABELS.languages} color={color} />
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.projects} color={color} />
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="flex justify-between">
                <h3 className="font-semibold text-[12.5px] text-gray-900">{p.name}</h3>
                {p.url ? <span className="text-[10px] text-blue-600">{p.url}</span> : null}
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
          <SectionTitle label={SECTION_LABELS.certifications} color={color} />
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex justify-between text-[11px] mb-0.5">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.awards} color={color} />
          {cv.awards.map((a) => (
            <div key={a.id} className="mb-1">
              <div className="font-semibold text-[12px] text-gray-900">{a.name}</div>
              <div className="text-[10.5px] text-gray-500">{[a.organization, fmtDate(a.date)].filter(Boolean).join(" — ")}</div>
            </div>
          ))}
        </section>
      );
    if (key === "volunteer" && cv.volunteer?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.volunteer} color={color} />
          {cv.volunteer.map((v) => (
            <div key={v.id} className="mb-1">
              <div className="font-semibold text-[12px] text-gray-900">{v.role}</div>
              <div className="text-[10.5px] italic text-gray-500">{[v.organization, v.location].filter(Boolean).join(" — ")}</div>
              {v.description ? <p className="text-[11px] text-gray-700">{v.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.interests} color={color} />
          <SimpleList items={cv.interests} />
        </section>
      );
    if (key === "references" && cv.references?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.references} color={color} />
          {cv.references.map((r) => (
            <div key={r.id} className="mb-1 text-[11px]">
              <span className="font-semibold text-gray-900">{r.name}</span>{" "}
              <span className="text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, (k) => <SectionTitle label={SECTION_LABELS[k]} color={color} />);
  };

  return (
    <div className="cv-page mx-auto p-10" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="mb-5 pb-4 border-b-2" style={{ borderColor: color }}>
        <div className="text-2xl font-bold tracking-tight" style={{ color }}>
          {pi.full_name || "Your Name"}
        </div>
        {pi.professional_title ? <p className="text-[13px] text-gray-600 mt-0.5">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-2" />
      </header>
      {order.map(render)}
    </div>
  );
}