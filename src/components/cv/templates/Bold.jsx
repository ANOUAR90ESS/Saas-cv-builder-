import React from "react";
import { ContactLine, ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// High-contrast: name in a solid color block, thick colored section underlines, accent bars on items.
export default function Bold({ cv }) {
  const color = cv.theme?.primary_color || "#e11d48";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const Title = ({ label }) => (
    <h2 className="text-[13px] font-extrabold uppercase tracking-wide mb-2 pb-1 border-b-[3px]" style={{ color, borderColor: color }}>
      {label}
    </h2>
  );

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.summary} />
          <p className="text-[11.5px] leading-relaxed text-gray-800">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.experience} />
          {cv.experience.map((it) => (
            <div key={it.id} className="mb-2.5 pl-3 border-l-[3px]" style={{ borderColor: color }}>
              <div className="flex justify-between items-baseline gap-3">
                <h3 className="font-bold text-[13px] text-gray-900">{it.job_title || "Job title"}</h3>
                <span className="text-[10.5px] font-semibold text-gray-500 whitespace-nowrap">{date(it)}</span>
              </div>
              <div className="text-[11px] font-medium" style={{ color }}>{[it.company, it.location].filter(Boolean).join(" — ")}</div>
              {it.description ? <p className="text-[11px] text-gray-700 mt-1">{it.description}</p> : null}
              {(it.bullet_points || []).filter(Boolean).length > 0 && (
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {it.bullet_points.filter(Boolean).map((b, i) => <li key={i} className="text-[11px] text-gray-800 leading-snug">{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.education} />
          {cv.education.map((it) => (
            <div key={it.id} className="mb-2 pl-3 border-l-[3px]" style={{ borderColor: color }}>
              <div className="flex justify-between items-baseline gap-3">
                <h3 className="font-bold text-[12.5px] text-gray-900">{it.degree || "Degree"}</h3>
                <span className="text-[10.5px] text-gray-500 whitespace-nowrap">{date(it)}</span>
              </div>
              <div className="text-[11px]" style={{ color }}>{[it.institution, it.location].filter(Boolean).join(" — ")}</div>
              {it.description ? <p className="text-[11px] text-gray-700">{it.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.skills} />
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 text-[11px] font-medium px-2.5 py-1 rounded text-white" style={{ background: color }}>
                {s.name}
                <SkillMeter level={s.level} display={display === "bar" ? "dots" : display} color="#fff" light />
              </span>
            ))}
          </div>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.languages} />
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.projects} />
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5 pl-3 border-l-[3px]" style={{ borderColor: color }}>
              <div className="flex justify-between">
                <h3 className="font-bold text-[12.5px] text-gray-900">{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-500">{p.url}</span> : null}
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
          <Title label={SECTION_LABELS.certifications} />
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex justify-between text-[11px] mb-0.5">
              <span className="font-bold text-gray-900">{c.name}</span>
              <span className="text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.awards} />
          {cv.awards.map((a) => (
            <div key={a.id} className="mb-1">
              <div className="font-bold text-[12px] text-gray-900">{a.name}</div>
              <div className="text-[10.5px] text-gray-500">{[a.organization, fmtDate(a.date)].filter(Boolean).join(" — ")}</div>
            </div>
          ))}
        </section>
      );
    if (key === "volunteer" && cv.volunteer?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.volunteer} />
          {cv.volunteer.map((v) => (
            <div key={v.id} className="mb-1 pl-3 border-l-[3px]" style={{ borderColor: color }}>
              <div className="font-bold text-[12px] text-gray-900">{v.role}</div>
              <div className="text-[10.5px] italic" style={{ color }}>{[v.organization, v.location].filter(Boolean).join(" — ")}</div>
              {v.description ? <p className="text-[11px] text-gray-700">{v.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.interests} />
          <SimpleList items={cv.interests} />
        </section>
      );
    if (key === "references" && cv.references?.length)
      return (
        <section key={key} className="mb-4">
          <Title label={SECTION_LABELS.references} />
          {cv.references.map((r) => (
            <div key={r.id} className="text-[11px] mb-0.5">
              <span className="font-bold text-gray-900">{r.name}</span> <span className="text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, (k) => <Title label={SECTION_LABELS[k]} />);
  };

  return (
    <div className="cv-page mx-auto" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="px-10 py-7 text-white" style={{ background: color }}>
        <div className="text-[30px] font-extrabold tracking-tight leading-none">{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[14px] font-semibold mt-1 text-white/90">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-white/85 mt-2" />
      </header>
      <div className="p-10">{order.map(render)}</div>
    </div>
  );
}

function date(it) {
  const fmt = (d) => (d ? String(d) : "");
  const r = [fmt(it.start_date), it.current ? "Present" : fmt(it.end_date)].filter(Boolean).join(" – ");
  return r;
}