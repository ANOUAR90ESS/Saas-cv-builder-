import React from "react";

export default function ApexExecutive({ cv, color = "#0f172a" }) {
  const pi = cv.personal_info || {};
  const exp = cv.experience || [];
  const edu = cv.education || [];
  const skills = cv.skills || [];
  const projects = cv.projects || [];
  const certs = cv.certifications || [];
  const langs = cv.languages || [];

  return (
    <div className="p-8 font-serif text-slate-900 bg-white leading-relaxed max-w-[800px] mx-auto min-h-[1050px]">
      {/* Executive Header */}
      <header className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
          {pi.full_name || "Your Name"}
        </h1>
        {pi.professional_title && (
          <p className="text-sm font-sans font-medium tracking-widest text-slate-600 uppercase mt-1">
            {pi.professional_title}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-sans text-slate-600 mt-2.5">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>| {pi.phone}</span>}
          {pi.location && <span>| {pi.location}</span>}
          {pi.linkedin && <span>| {pi.linkedin}</span>}
          {pi.website && <span>| {pi.website}</span>}
        </div>
      </header>

      {/* Executive Summary */}
      {cv.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2 border-b border-slate-200">
            Executive Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Professional Experience */}
      {exp.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 pb-1 mb-3 border-b border-slate-200">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {exp.map((item, idx) => (
              <div key={item.id || idx} className="text-xs">
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-bold text-slate-900">{item.job_title}</span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {item.start_date} — {item.currently_work_here ? "Present" : item.end_date}
                  </span>
                </div>
                <div className="text-[11px] font-sans font-medium text-slate-700 italic mb-1.5">
                  {item.company} {item.location && `| ${item.location}`}
                </div>
                {item.description && (
                  <p className="text-slate-700 mb-1.5 leading-relaxed">{item.description}</p>
                )}
                {item.bullet_points && item.bullet_points.length > 0 && (
                  <ul className="list-disc list-outside space-y-1 text-slate-700 ml-4">
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

      {/* Education */}
      {edu.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 pb-1 mb-3 border-b border-slate-200">
            Education & Credentials
          </h2>
          <div className="space-y-2.5">
            {edu.map((item, idx) => (
              <div key={item.id || idx} className="text-xs flex justify-between items-baseline font-sans">
                <div>
                  <span className="font-bold text-slate-900">{item.degree}</span>
                  <span className="text-slate-600">, {item.institution}</span>
                </div>
                {item.graduation_date && (
                  <span className="text-[11px] text-slate-600">{item.graduation_date}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Competencies / Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2.5 border-b border-slate-200">
            Core Competencies
          </h2>
          <p className="text-xs font-sans text-slate-700 leading-relaxed">
            {skills.map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean).join("  •  ")}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2.5 border-b border-slate-200">
            Key Strategic Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((p, idx) => (
              <div key={p.id || idx} className="text-xs">
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-bold text-slate-900">{p.name}</span>
                  {p.technologies && <span className="text-[10px] text-slate-500">{p.technologies}</span>}
                </div>
                {p.description && <p className="text-slate-700 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {(certs.length > 0 || langs.length > 0) && (
        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200 font-sans text-xs">
          {certs.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Certifications: </span>
              <span className="text-slate-700">{certs.map((c) => c.name).filter(Boolean).join(", ")}</span>
            </div>
          )}
          {langs.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Languages: </span>
              <span className="text-slate-700">{langs.map((l) => l.name).filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
