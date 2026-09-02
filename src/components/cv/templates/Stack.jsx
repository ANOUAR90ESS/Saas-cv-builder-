import React from "react";
import {
  ExperienceList, EducationList, SimpleList, ContactLine,
  AwardList, CourseList, VolunteerList, ReferenceList,
  fontStack, fmtDate, SkillMeter, SECTION_LABELS,
} from "@/components/cv/SharedBits";

// Stack — clean single-column tech resume: monospace section labels,
// outlined skill chips, a top accent rule. Modern and easy to scan.
export default function Stack({ cv }) {
  const color = cv.theme?.primary_color || "#2563eb";
  const font = fontStack(cv.theme?.font_id);
  const mono = "'JetBrains Mono', ui-monospace, monospace";
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const Label = ({ children }) => (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-2.5" style={{ fontFamily: mono, color }}>
      <span style={{ color, opacity: 0.55 }}>// </span>{children}
    </h2>
  );

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.summary}</Label><p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p></section>);
    if (key === "experience" && cv.experience?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.experience}</Label><ExperienceList items={cv.experience} color={color} /></section>);
    if (key === "education" && cv.education?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.education}</Label><EducationList items={cv.education} /></section>);
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-5">
          <Label>{SECTION_LABELS.projects}</Label>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-2" style={{ breakInside: "avoid" }}>
              <div className="flex justify-between items-baseline gap-3">
                <h3 className="font-semibold text-[12.5px] text-gray-900" style={{ fontFamily: mono }}>{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-500" style={{ fontFamily: mono }}>{p.url}</span> : null}
              </div>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-700 mt-0.5">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-5">
          <Label>{SECTION_LABELS.skills}</Label>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2.5 py-1 rounded-md border" style={{ borderColor: color, color, fontFamily: mono }}>
                {s.name}
                <SkillMeter level={s.level} display={display} color={color} />
              </span>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.languages}</Label><SimpleList items={cv.languages.map((l) => `${l.name}${l.level ? ` — ${l.level}` : ""}`)} /></section>);
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-5">
          <Label>{SECTION_LABELS.certifications}</Label>
          {cv.certifications.map((c) => (
            <div key={c.id} className="mb-1" style={{ breakInside: "avoid" }}>
              <div className="font-semibold text-[12px] text-gray-900">{c.name}</div>
              <div className="text-[10.5px] text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</div>
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.awards}</Label><AwardList items={cv.awards} color={color} /></section>);
    if (key === "courses" && cv.courses?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.courses}</Label><CourseList items={cv.courses} /></section>);
    if (key === "volunteer" && cv.volunteer?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.volunteer}</Label><VolunteerList items={cv.volunteer} /></section>);
    if (key === "interests" && cv.interests?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.interests}</Label><SimpleList items={cv.interests} /></section>);
    if (key === "references" && cv.references?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.references}</Label><ReferenceList items={cv.references} /></section>);
    return null;
  };

  return (
    <div className="cv-page mx-auto px-10 py-9" style={{ fontFamily: font, color: "#1a202c" }}>
      {/* Header */}
      <header className="mb-6">
        <div className="text-[26px] font-bold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] font-medium mt-1" style={{ fontFamily: mono, color }}>{pi.professional_title}</p> : null}
        <div className="mt-3 h-px w-full" style={{ background: color, opacity: 0.9 }} />
        <ContactLine pi={pi} className="mt-2.5 text-[10.5px] text-gray-600" sep="·" />
      </header>
      {order.map(render)}
    </div>
  );
}