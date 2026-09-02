import React from "react";
import { ContactLine, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";
import { renderExtraSection } from "@/components/cv/ExtraSections";

// Vertical timeline for experience; clean single column elsewhere.
export default function Timeline({ cv }) {
  const color = cv.theme?.primary_color || "#4f46e5";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const Title = ({ label }) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color }}>{label}</h2>
  );

  const render = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.summary} />
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.experience} />
          <div className="relative pl-5">
            <span className="absolute left-[3px] top-1 bottom-1 w-px" style={{ background: color + "55" }} />
            {cv.experience.map((it) => (
              <div key={it.id} className="mb-3 relative">
                <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: color, boxShadow: `0 0 0 2px ${color}55` }} />
                <div className="flex justify-between items-baseline gap-3">
                  <h3 className="font-semibold text-[13px] text-gray-900">{it.job_title || "Job title"}</h3>
                  <span className="text-[10.5px] text-gray-500 whitespace-nowrap">{date(it)}</span>
                </div>
                <div className="text-[11px] font-medium" style={{ color }}>{[it.company, it.location].filter(Boolean).join(" — ")}</div>
                {it.description ? <p className="text-[11px] text-gray-700 mt-1">{it.description}</p> : null}
                {(it.bullet_points || []).filter(Boolean).length > 0 && (
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {it.bullet_points.filter(Boolean).map((b, i) => <li key={i} className="text-[11px] text-gray-700 leading-snug">{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.education} />
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "skills" && cv.skills?.length)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.skills} />
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
            {cv.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-[11.5px] text-gray-800">
                <span>{s.name}</span>
                <SkillMeter level={s.level} display={display} color={color} />
              </li>
            ))}
          </ul>
        </section>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.languages} />
          <SimpleList items={cv.languages.map((l) => `${l.name} (${l.level})`)} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.projects} />
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="flex justify-between">
                <h3 className="font-semibold text-[12.5px] text-gray-900">{p.name}</h3>
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
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.certifications} />
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
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.awards} />
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
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.volunteer} />
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
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.interests} />
          <SimpleList items={cv.interests} />
        </section>
      );
    if (key === "references" && cv.references?.length)
      return (
        <section key={key} className="mb-5">
          <Title label={SECTION_LABELS.references} />
          {cv.references.map((r) => (
            <div key={r.id} className="text-[11px] mb-0.5">
              <span className="font-semibold text-gray-900">{r.name}</span> <span className="text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return renderExtraSection(key, cv, (k) => <Title label={SECTION_LABELS[k]} />);
  };

  return (
    <div className="cv-page mx-auto p-12" style={{ fontFamily: font, color: "#1a202c" }}>
      <header className="mb-7">
        <div className="text-[28px] font-bold tracking-tight" style={{ color }}>{pi.full_name || "Your Name"}</div>
        {pi.professional_title ? <p className="text-[13px] text-gray-600 mt-0.5">{pi.professional_title}</p> : null}
        <ContactLine pi={pi} className="text-[10.5px] text-gray-500 mt-2" />
      </header>
      {order.map(render)}
    </div>
  );
}

function date(it) {
  const fmt = (d) => (d ? String(d) : "");
  return [fmt(it.start_date), it.current ? "Present" : fmt(it.end_date)].filter(Boolean).join(" – ");
}