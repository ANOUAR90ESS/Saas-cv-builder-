import React from "react";
import {
  ExperienceList, EducationList, SimpleList, ContactLine,
  AwardList, CourseList, VolunteerList, ReferenceList,
  fontStack, fmtDate, SkillMeter, SECTION_LABELS,
} from "@/components/cv/SharedBits";

// Apex — professional two-column: full-width header with a thin accent rule,
// a narrow left sidebar (skills, languages, certs) separated by a hairline,
// and a main column for experience, education and projects. Clean and tech-leaning.
export default function Apex({ cv }) {
  const color = cv.theme?.primary_color || "#0f766e";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const sidebarKeys = ["skills", "languages", "certifications", "courses", "interests"];
  const mainKeys = order.filter((k) => !sidebarKeys.includes(k));
  const sideKeys = order.filter((k) => sidebarKeys.includes(k));

  const Label = ({ children }) => (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2 pb-1.5 border-b" style={{ color, borderColor: color, opacity: 1 }}>
      {children}
    </h2>
  );

  const renderSide = (key) => {
    if (key === "skills" && cv.skills?.length)
      return (
        <div key={key} className="mb-5">
          <Label>{SECTION_LABELS.skills}</Label>
          <ul className="space-y-2">
            {cv.skills.map((s) => (
              <li key={s.id} className="text-[11px]">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <SkillMeter level={s.level} display={display} color={color} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <div key={key} className="mb-5">
          <Label>{SECTION_LABELS.languages}</Label>
          <ul className="space-y-0.5 text-[11px] text-gray-700">
            {cv.languages.map((l) => <li key={l.id}>{l.name}{l.level ? <span className="text-gray-400"> — {l.level}</span> : null}</li>)}
          </ul>
        </div>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <div key={key} className="mb-5">
          <Label>{SECTION_LABELS.certifications}</Label>
          {cv.certifications.map((c) => (
            <div key={c.id} className="mb-1.5" style={{ breakInside: "avoid" }}>
              <div className="font-semibold text-[11.5px] text-gray-900">{c.name}</div>
              <div className="text-[10px] text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</div>
            </div>
          ))}
        </div>
      );
    if (key === "courses" && cv.courses?.length)
      return (<div key={key} className="mb-5"><Label>{SECTION_LABELS.courses}</Label><CourseList items={cv.courses} /></div>);
    if (key === "interests" && cv.interests?.length)
      return (<div key={key} className="mb-5"><Label>{SECTION_LABELS.interests}</Label><SimpleList items={cv.interests} /></div>);
    return null;
  };

  const renderMain = (key) => {
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
    if (key === "awards" && cv.awards?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.awards}</Label><AwardList items={cv.awards} color={color} /></section>);
    if (key === "volunteer" && cv.volunteer?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.volunteer}</Label><VolunteerList items={cv.volunteer} /></section>);
    if (key === "references" && cv.references?.length)
      return (<section key={key} className="mb-5"><Label>{SECTION_LABELS.references}</Label><ReferenceList items={cv.references} /></section>);
    return null;
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      {/* Header */}
      <header className="px-9 pt-9 pb-5">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[27px] font-bold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
            {pi.professional_title ? <p className="text-[13px] font-medium mt-1" style={{ color }}>{pi.professional_title}</p> : null}
          </div>
          <ContactLine pi={pi} className="text-[10.5px] text-gray-600 text-right" sep="·" />
        </div>
        <div className="mt-4 h-0.5 w-full" style={{ background: color }} />
      </header>

      <div className="flex">
        <aside className="w-[33%] pl-9 pr-5 border-r border-gray-200">
          {sideKeys.map(renderSide)}
        </aside>
        <main className="flex-1 pl-6 pr-9">
          {mainKeys.map(renderMain)}
        </main>
      </div>
    </div>
  );
}