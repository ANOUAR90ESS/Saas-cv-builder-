import React from "react";
import {
  ExperienceList, EducationList, SimpleList, ContactLine,
  AwardList, CourseList, VolunteerList, ReferenceList,
  fontStack, fmtDate, SkillMeter, SECTION_LABELS,
} from "@/components/cv/SharedBits";

// Canvas — creative but clean: a rounded accent header card holding the
// photo, name, title and contact row, then a single-column body with a
// small colored square marker before each section title.
export default function Canvas({ cv }) {
  const color = cv.theme?.primary_color || "#7c3aed";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";
  const initials = (pi.full_name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const Label = ({ children }) => (
    <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] mb-2.5 text-gray-900">
      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {children}
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
                <h3 className="font-semibold text-[12.5px] text-gray-900">{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-500">{p.url}</span> : null}
              </div>
              {p.technologies ? <div className="text-[10.5px] italic" style={{ color }}>{p.technologies}</div> : null}
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
              <span key={s.id} className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: "#f3f4f6", color: "#374151" }}>
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
      {/* Header card */}
      <header className="rounded-2xl p-6 mb-6 flex items-center gap-5" style={{ background: color }}>
        <div className="shrink-0">
          {pi.photo ? (
            <img src={pi.photo} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-white/40" />
          ) : (
            <div className="w-20 h-20 rounded-full grid place-items-center bg-white/15 text-2xl font-bold text-white">{initials}</div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-white">
          <div className="text-[24px] font-bold leading-tight">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[13px] text-white/90 mt-0.5">{pi.professional_title}</p> : null}
          <ContactLine pi={pi} className="mt-2 text-[10.5px] text-white/85" sep="•" />
        </div>
      </header>
      {order.map(render)}
    </div>
  );
}