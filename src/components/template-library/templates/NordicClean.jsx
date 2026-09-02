import React from "react";

export default function NordicClean({ cv, color = "#0284c7" }) {
  const pi = cv.personal_info || {};
  const exp = cv.experience || [];
  const edu = cv.education || [];
  const skills = cv.skills || [];
  const projects = cv.projects || [];
  const certs = cv.certifications || [];
  const langs = cv.languages || [];

  return (
    <div className="p-8 font-sans text-slate-800 bg-white leading-relaxed max-w-[800px] mx-auto min-h-[1050px]">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6 mb-6">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 uppercase">
          {pi.full_name || "Your Name"}
        </h1>
        {pi.professional_title && (
          <p className="text-sm font-medium tracking-wide text-slate-500 uppercase mt-1" style={{ color }}>
            {pi.professional_title}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-3 font-normal">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>• {pi.phone}</span>}
          {pi.location && <span>• {pi.location}</span>}
          {pi.linkedin && <span>• {pi.linkedin}</span>}
          {pi.website && <span>• {pi.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Profile
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-light">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {exp.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {exp.map((item, idx) => (
              <div key={item.id || idx} className="text-xs">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-semibold text-slate-900">{item.job_title}</span>
                  <span className="text-[11px] text-slate-400 font-light">
                    {item.start_date} — {item.currently_work_here ? "Present" : item.end_date}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mb-1.5">
                  {item.company} {item.location && `• ${item.location}`}
                </div>
                {item.description && (
                  <p className="text-slate-600 mb-1.5 font-light leading-relaxed">{item.description}</p>
                )}
                {item.bullet_points && item.bullet_points.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-slate-600 font-light ml-1">
                    {item.bullet_points.filter(Boolean).map((b, bi) => (
                      <li key={bi} className="leading-relaxed">
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grid: Education & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Education */}
        {edu.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {edu.map((item, idx) => (
                <div key={item.id || idx} className="text-xs">
                  <div className="font-semibold text-slate-900">{item.degree}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.institution} {item.graduation_date && `(${item.graduation_date})`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => {
                const name = typeof s === "string" ? s : s?.name;
                if (!name) return null;
                return (
                  <span
                    key={s.id || idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60 font-medium"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Key Projects
          </h2>
          <div className="space-y-3">
            {projects.map((p, idx) => (
              <div key={p.id || idx} className="text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{p.name}</span>
                  {p.url && <span className="text-[10px] text-slate-400">{p.url}</span>}
                </div>
                {p.technologies && (
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.technologies}</div>
                )}
                {p.description && <p className="text-slate-600 mt-1 font-light">{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {(certs.length > 0 || langs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {certs.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Certifications
              </h2>
              <div className="space-y-1 text-xs">
                {certs.map((c, idx) => (
                  <div key={c.id || idx} className="text-slate-700">
                    <span className="font-medium">{c.name}</span>
                    {c.organization && <span className="text-slate-500"> — {c.organization}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {langs.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Languages
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                {langs.map((l, idx) => (
                  <span key={l.id || idx} className="text-slate-700">
                    {l.name} {l.level && <span className="text-slate-400">({l.level})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
