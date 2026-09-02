import React from "react";
import { ContactLine, SectionTitle, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// Traditional, formal single-column resume — serif, ruled section titles, black ink.
export default function Classic({ cv }) {
  const font = cv.theme?.font_id === "inter" ? "'Source Serif 4', Georgia, serif" : fontStack(cv.theme?.font_id);
  const ink = "#111111";
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.summary} color={ink} />
          <p className="text-[11.5px] leading-relaxed text-gray-800">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.experience} color={ink} />
          <ExperienceList items={cv.experience} color={ink} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.education} color={ink} />
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.skills} color={ink} />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {cv.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-[11px] text-gray-800">
                <span>{s.name}</span>
                <SkillMeter level={s.level} display={display} color={ink} />
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.languages} color={ink} />
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.projects} color={ink} />
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="font-semibold text-[12px] text-gray-900">{p.name}</div>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-600">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-800">{p.description}</p> : null}
              {p.url ? <div className="text-[10.5px] text-gray-700">{p.url}</div> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.certifications} color={ink} />
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex justify-between text-[11px] mb-0.5">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-gray-600">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.awards} color={ink} />
          {cv.awards.map((a) => (
            <div key={a.id} className="mb-1">
              <div className="font-semibold text-[12px] text-gray-900">{a.name}</div>
              <div className="text-[10.5px] text-gray-600">{[a.organization, fmtDate(a.date)].filter(Boolean).join(" — ")}</div>
            </div>
          ))}
        </section>
      );
    if (key === "volunteer" && cv.volunteer?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.volunteer} color={ink} />
          {cv.volunteer.map((v) => (
            <div key={v.id} className="mb-1">
              <div className="font-semibold text-[12px] text-gray-900">{v.role}</div>
              <div className="text-[10.5px] italic text-gray-600">{[v.organization, v.location].filter(Boolean).join(" — ")}</div>
              {v.description ? <p className="text-[11px] text-gray-800">{v.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.interests} color={ink} />
          <SimpleList items={cv.interests} />
        </section>
      );
    if (key === "references" && cv.references?.length)
      return (
        <section key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.references} color={ink} />
          {cv.references.map((r) => (
            <div key={r.id} className="text-[11px] mb-0.5">
              <span className="font-semibold text-gray-900">{r.name}</span> <span className="text-gray-600">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, (k) => <SectionTitle label={SECTION_LABELS[k]} color={ink} />);
  };

  return (
    <div className="cv-page mx-auto p-12" style={{ fontFamily: font, color: ink }}>
      <header className="mb-6 text-center">
        <div className="text-[26px] font-bold tracking-tight">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12px] text-gray-700 mt-1">{pi.professional_title}</p> : null}
        <div className="mt-2 border-t border-b border-gray-800 py-1.5">
          <ContactLine pi={pi} className="text-[10.5px] text-gray-700 justify-center" />
        </div>
      </header>
      {order.map(render)}
    </div>
  );
}