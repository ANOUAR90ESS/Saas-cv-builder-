import React from "react";
import { ContactLine, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// ATS-friendly: plain single column, no colors, no columns, simple headings.
export default function Ats({ cv }) {
  const font = "'Inter', sans-serif";
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Summary</h2>
          <p className="text-[11.5px] leading-relaxed text-gray-800">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Experience</h2>
          <ExperienceList items={cv.experience} color="#000" />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Education</h2>
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Skills</h2>
          <SimpleList items={cv.skills.map((s) => s.name + (s.level ? " (" + s.level + ")" : ""))} />
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Languages</h2>
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Projects</h2>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="font-semibold text-[12.5px]">{p.name}</div>
              {p.description ? <p className="text-[11px] text-gray-800">{p.description}</p> : null}
              {p.url ? <p className="text-[10.5px] text-gray-600">{p.url}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Certifications</h2>
          {cv.certifications.map((c) => (
            <div key={c.id} className="text-[11px] mb-0.5">
              <span className="font-semibold">{c.name}</span> — {[c.organization, fmtDate(c.date)].filter(Boolean).join(", ")}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-4">
          <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">Interests</h2>
          <SimpleList items={cv.interests} />
        </section>
      );
    return renderExtraSection(key, cv, (k) => (
      <h2 className="text-[12px] font-bold uppercase mb-1 border-b border-gray-300">{SECTION_LABELS[k]}</h2>
    ));
  };

  return (
    <div className="cv-page mx-auto p-10" style={{ fontFamily: font, color: "#000" }}>
      <header className="mb-5 text-center">
        <div className="text-[22px] font-bold">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[12px] mt-0.5">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] mt-1 justify-center" />
      </header>
      {order.map(render)}
    </div>
  );
}