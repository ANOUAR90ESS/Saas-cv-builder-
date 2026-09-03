import React from "react";
import { ContactLine, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// Dense single-column layout to fit more content on one page.
export default function Compact({ cv }) {
  const color = cv.theme?.primary_color || "#2563eb";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "dots";

  const Title = ({ label }) => (
    <h2 className="text-[10.5px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color }}>{label}</h2>
  );

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.summary} />
          <p className="text-[10.5px] leading-snug text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.experience} />
          {cv.experience.map((it) => (
            <div key={it.id} className="mb-1.5">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="font-semibold text-[11px] text-gray-900">{it.job_title || "Job title"}{it.company ? <span className="font-normal text-gray-600"> · {it.company}</span> : ""}</h3>
                <span className="text-[9.5px] text-gray-500 whitespace-nowrap">{date(it)}</span>
              </div>
              {(it.bullet_points || []).filter(Boolean).length > 0 && (
                <ul className="list-disc pl-4 space-y-0">
                  {it.bullet_points.filter(Boolean).map((b, i) => <li key={i} className="text-[10px] text-gray-700 leading-tight">{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.education} />
          {cv.education.map((it) => (
            <div key={it.id} className="flex justify-between items-baseline gap-2 text-[10.5px]">
              <span className="text-gray-900"><span className="font-semibold">{it.degree}</span>{it.institution ? <span className="text-gray-600"> · {it.institution}</span> : ""}</span>
              <span className="text-gray-500 whitespace-nowrap">{date(it)}</span>
            </div>
          ))}
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.skills} />
          <ul className="grid grid-cols-3 gap-x-4 gap-y-1">
            {cv.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-[10.5px] text-gray-800">
                <span className="truncate">{s.name}</span>
                <SkillMeter level={s.level} display={display} color={color} />
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.languages} />
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.projects} />
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1 text-[10.5px]">
              <span className="font-semibold text-gray-900">{p.name}</span>
              {p.technologies ? <span className="text-gray-500"> — {p.technologies}</span> : null}
              {p.description ? <p className="text-gray-700">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.certifications} />
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex justify-between text-[10.5px]">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.awards} />
          {cv.awards.map((a) => (
            <div key={a.id} className="text-[10.5px]">
              <span className="font-semibold text-gray-900">{a.name}</span> <span className="text-gray-500">{[a.organization, fmtDate(a.date)].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "volunteer" && cv.volunteer?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.volunteer} />
          {cv.volunteer.map((v) => (
            <div key={v.id} className="text-[10.5px]">
              <span className="font-semibold text-gray-900">{v.role}</span> <span className="text-gray-500">{[v.organization, v.location].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.interests} />
          <SimpleList items={cv.interests} />
        </section>
      );
    if (key === "references" && cv.references?.length)
      return (
        <section key={key} className="mb-3">
          <Title label={SECTION_LABELS.references} />
          {cv.references.map((r) => (
            <div key={r.id} className="text-[10.5px]">
              <span className="font-semibold text-gray-900">{r.name}</span> <span className="text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, (k) => <Title label={SECTION_LABELS[k]} />);
  };

  return (
    <div className="cv-page mx-auto p-8" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="mb-3 pb-2 border-b-2" style={{ borderColor: color }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="text-[20px] font-bold tracking-tight" style={{ color }}>{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[11px] font-medium text-gray-600">{pi.professional_title}</p> : null}
        </div>
        <ContactLine pi={pi} className="text-[9.5px] text-gray-500 mt-1" />
      </header>
      {order.map(render)}
    </div>
  );
}

function date(it) {
  const fmt = (d) => (d ? String(d) : "");
  return [fmt(it.start_date), it.current ? "Present" : fmt(it.end_date)].filter(Boolean).join(" – ");
}