import React from "react";
import { fmtDate } from "@/components/cv/SharedBits";

// Shared renderers for the "extra" CV sections (awards, courses, volunteer, references,
// projects) so every template displays them. `title` is a (key) => ReactNode factory that
// produces the template-specific section heading; the body is a clean, readable layout.
export function renderExtraSection(key, cv, title) {
  if (key === "awards" && cv.awards?.length)
    return (
      <section key={key} className="mb-4">
        {title("awards")}
        {cv.awards.map((a) => (
          <div key={a.id} className="mb-1.5" style={{ breakInside: "avoid" }}>
            <div className="font-semibold text-[12px] text-gray-900">{a.name}</div>
            <div className="text-[10.5px] text-gray-500">{[a.organization, fmtDate(a.date)].filter(Boolean).join(" — ")}</div>
            {a.description ? <p className="text-[11px] text-gray-700">{a.description}</p> : null}
          </div>
        ))}
      </section>
    );
  if (key === "courses" && cv.courses?.length)
    return (
      <section key={key} className="mb-4">
        {title("courses")}
        {cv.courses.map((c) => (
          <div key={c.id} className="text-[11px] mb-0.5">
            <span className="font-medium text-gray-900">{c.name}</span>{" "}
            <span className="text-gray-500">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</span>
          </div>
        ))}
      </section>
    );
  if (key === "volunteer" && cv.volunteer?.length)
    return (
      <section key={key} className="mb-4">
        {title("volunteer")}
        {cv.volunteer.map((v) => (
          <div key={v.id} className="mb-1.5" style={{ breakInside: "avoid" }}>
            <div className="font-semibold text-[12px] text-gray-900">{v.role}</div>
            <div className="text-[10.5px] italic text-gray-500">{[v.organization, v.location].filter(Boolean).join(" — ")}</div>
            {v.description ? <p className="text-[11px] text-gray-700">{v.description}</p> : null}
          </div>
        ))}
      </section>
    );
  if (key === "references" && cv.references?.length)
    return (
      <section key={key} className="mb-4">
        {title("references")}
        {cv.references.map((r) => (
          <div key={r.id} className="text-[11px] mb-0.5">
            <span className="font-semibold text-gray-900">{r.name}</span>{" "}
            <span className="text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
          </div>
        ))}
      </section>
    );
  if (key === "projects" && cv.projects?.length)
    return (
      <section key={key} className="mb-4">
        {title("projects")}
        {cv.projects.map((p) => (
          <div key={p.id} className="mb-1.5" style={{ breakInside: "avoid" }}>
            <h3 className="font-semibold text-[12.5px] text-gray-900">{p.name}</h3>
            {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
            {p.description ? <p className="text-[11px] text-gray-700">{p.description}</p> : null}
          </div>
        ))}
      </section>
    );
  return null;
}