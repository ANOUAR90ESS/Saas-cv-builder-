import React from "react";

// AtsMax: Engineered specifically for 100% simulated ATS Benchmark pass rate.
// - Standard standard H1/H2 semantic structure
// - Clean linear single-column document flow without floats or multi-column disruption
// - Standard date format and clear position hierarchy
// - Standard section titles recognized by ATS parsers (Experience, Education, Skills, Summary)
export default function AtsMax({ cv }) {
  const pi = cv.personal_info || {};
  const exp = cv.experience || [];
  const edu = cv.education || [];
  const skills = cv.skills || [];
  const projects = cv.projects || [];
  const certs = cv.certifications || [];
  const langs = cv.languages || [];

  return (
    <div className="p-8 font-sans text-black bg-white leading-normal max-w-[800px] mx-auto min-h-[1050px]">
      {/* Header */}
      <header className="mb-5 pb-3 border-b border-black text-center">
        <h1 className="text-2xl font-bold text-black tracking-normal">
          {pi.full_name || "Candidate Name"}
        </h1>
        {pi.professional_title && (
          <div className="text-sm font-semibold text-neutral-800 mt-1">
            {pi.professional_title}
          </div>
        )}
        <div className="text-xs text-neutral-700 mt-2 space-x-2">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>| {pi.phone}</span>}
          {pi.location && <span>| {pi.location}</span>}
          {pi.linkedin && <span>| {pi.linkedin}</span>}
          {pi.website && <span>| {pi.website}</span>}
        </div>
      </header>

      {/* Professional Summary */}
      {cv.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-0.5 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs text-neutral-900 leading-relaxed">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {exp.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-0.5 mb-2.5">
            Work Experience
          </h2>
          <div className="space-y-3.5">
            {exp.map((item, idx) => (
              <div key={item.id || idx} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-black">
                  <span>{item.job_title}</span>
                  <span className="font-normal text-neutral-700">
                    {item.start_date} – {item.currently_work_here ? "Present" : item.end_date}
                  </span>
                </div>
                <div className="text-neutral-800 italic mb-1">
                  {item.company} {item.location && `— ${item.location}`}
                </div>
                {item.description && (
                  <p className="text-neutral-800 mb-1 leading-relaxed">{item.description}</p>
                )}
                {item.bullet_points && item.bullet_points.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-neutral-900">
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
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {edu.map((item, idx) => (
              <div key={item.id || idx} className="text-xs flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-black">{item.degree}</span>
                  <span className="text-neutral-800">, {item.institution}</span>
                </div>
                {item.graduation_date && (
                  <span className="text-neutral-700">{item.graduation_date}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-0.5 mb-2">
            Technical & Professional Skills
          </h2>
          <p className="text-xs text-neutral-900 leading-relaxed">
            {skills.map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean).join(", ")}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-0.5 mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((p, idx) => (
              <div key={p.id || idx} className="text-xs">
                <div className="font-bold text-black">
                  {p.name} {p.technologies && <span className="font-normal text-neutral-700">({p.technologies})</span>}
                </div>
                {p.description && <p className="text-neutral-800 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Languages */}
      {(certs.length > 0 || langs.length > 0) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-0.5 mb-2">
            Certifications & Languages
          </h2>
          <div className="text-xs text-neutral-900 space-y-1">
            {certs.length > 0 && (
              <div>
                <span className="font-semibold">Certifications: </span>
                <span>{certs.map((c) => c.name).filter(Boolean).join(", ")}</span>
              </div>
            )}
            {langs.length > 0 && (
              <div>
                <span className="font-semibold">Languages: </span>
                <span>{langs.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
