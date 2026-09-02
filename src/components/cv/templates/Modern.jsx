import React from "react";
import { ContactLine, SectionTitle, ExperienceList, EducationList, SimpleList, fontStack, dateRange, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";

export default function Modern({ cv }) {
  const color = cv.theme?.primary_color || "#4f46e5";
  const font = fontStack(cv.theme?.font_id);
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const sidebarKeys = ["skills", "languages", "certifications", "courses", "interests"];
  const mainKeys = order.filter((k) => !sidebarKeys.includes(k));
  const sideKeys = order.filter((k) => sidebarKeys.includes(k));

  const renderSide = (key) => {
    if (key === "skills" && cv.skills?.length)
      return (
        <div key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.skills} color={color} light />
          <ul className="space-y-1.5">
            {cv.skills.map((s, idx) => (
              <li key={s.id || idx} className="text-[11px] text-white/90">
                <div className="flex items-center justify-between gap-2">
                  <span>{s.name}</span>
                  <SkillMeter level={s.level} display={display} color="#fff" light />
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <div key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.languages} color={color} light />
          <ul className="space-y-0.5 text-[11px] text-white/90">
            {cv.languages.map((l, idx) => (
              <li key={l.id || idx}>
                {l.name} <span className="opacity-70">— {l.level}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <div key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.certifications} color={color} light />
          <ul className="space-y-1 text-[11px] text-white/90">
            {cv.certifications.map((c, idx) => (
              <li key={c.id || idx}>
                <div className="font-medium">{c.name}</div>
                <div className="opacity-70">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</div>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "courses" && cv.courses?.length)
      return (
        <div key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.courses} color={color} light />
          <ul className="space-y-0.5 text-[11px] text-white/90">
            {cv.courses.map((c, idx) => (
              <li key={c.id || idx}>{[c.name, c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</li>
            ))}
          </ul>
        </div>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <div key={key} className="mb-4">
          <SectionTitle label={SECTION_LABELS.interests} color={color} light />
          <SimpleList items={cv.interests} light />
        </div>
      );
    return null;
  };

  const renderMain = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.summary} color={color} />
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.experience} color={color} />
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.education} color={color} />
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.projects} color={color} />
          {cv.projects.map((p, idx) => (
            <div key={p.id || idx} className="mb-2" style={{ breakInside: "avoid" }}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-[12.5px] text-gray-900">{p.name}</h3>
                {p.url ? <span className="text-[10.5px] text-blue-600">{p.url}</span> : null}
              </div>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-700 mt-0.5">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.awards} color={color} />
          {cv.awards.map((a) => (
            <div key={a.id} className="mb-1.5">
              <div className="font-semibold text-[12px] text-gray-900">{a.name}</div>
              <div className="text-[10.5px] text-gray-500">{[a.organization, fmtDate(a.date)].filter(Boolean).join(" — ")}</div>
              {a.description ? <p className="text-[11px] text-gray-700">{a.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "volunteer" && cv.volunteer?.length)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.volunteer} color={color} />
          {cv.volunteer.map((v) => (
            <div key={v.id} className="mb-1.5">
              <div className="font-semibold text-[12px] text-gray-900">{v.role}</div>
              <div className="text-[10.5px] italic text-gray-500">{[v.organization, v.location].filter(Boolean).join(" — ")}</div>
              {v.description ? <p className="text-[11px] text-gray-700">{v.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "references" && cv.references?.length)
      return (
        <section className="mb-4" key={key}>
          <SectionTitle label={SECTION_LABELS.references} color={color} />
          {cv.references.map((r) => (
            <div key={r.id} className="mb-1">
              <div className="font-semibold text-[12px] text-gray-900">{r.name}</div>
              <div className="text-[10.5px] text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</div>
            </div>
          ))}
        </section>
      );
    return null;
  };

  return (
    <div className="cv-page mx-auto flex" style={{ fontFamily: font, color: "#1a202c" }}>
      <aside className="w-[34%] p-7 text-white" style={{ background: color }}>
        <div className="mb-6">
          {pi.photo ? (
            <img src={pi.photo} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-white/40" />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/15 text-3xl font-semibold">
              {initials(pi.full_name)}
            </div>
          )}
          <div className="text-xl font-bold leading-tight text-center">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[12px] text-white/85 text-center mt-0.5">{pi.professional_title}</p> : null}
        </div>
        <div className="mb-5">
          <SectionTitle label={SECTION_LABELS.contact} color={color} light />
          <ul className="space-y-1 text-[10.5px] text-white/90 break-words">
            {pi.email ? <li>{pi.email}</li> : null}
            {pi.phone ? <li>{pi.phone}</li> : null}
            {pi.location ? <li>{pi.location}</li> : null}
            {pi.website ? <li>{pi.website}</li> : null}
            {pi.linkedin ? <li>{pi.linkedin}</li> : null}
            {pi.github ? <li>{pi.github}</li> : null}
          </ul>
        </div>
        {sideKeys.map(renderSide)}
      </aside>
      <main className="flex-1 p-8">{mainKeys.map(renderMain)}</main>
    </div>
  );
}

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
function levelWidth(level) {
  return { Beginner: "25%", Intermediate: "50%", Advanced: "75%", Expert: "100%" }[level] || "60%";
}