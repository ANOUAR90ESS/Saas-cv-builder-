import React from "react";
import { ExperienceList, EducationList, SimpleList, fontStack, fmtDate, SkillMeter, SECTION_LABELS } from "@/components/cv/SharedBits";

// Modern tech feel: main column + light sidebar, monospaced uppercase labels, skill bars.
export default function Tech({ cv }) {
  const color = cv.theme?.primary_color || "#0d9488";
  const font = fontStack(cv.theme?.font_id);
  const mono = "'JetBrains Mono', monospace";
  const pi = cv.personal_info || {};
  const order = (cv.section_order || []).filter((k) => cv.enabled_sections?.[k]);
  const display = cv.theme?.skill_display || "bar";

  const sidebarKeys = ["skills", "languages", "certifications", "courses", "interests"];
  const mainKeys = order.filter((k) => !sidebarKeys.includes(k));
  const sideKeys = order.filter((k) => sidebarKeys.includes(k));

  const Label = ({ children, light }) => (
    <h2 className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1.5 ${light ? "text-white/80" : ""}`} style={{ fontFamily: mono, color: light ? undefined : color }}>
      {"// "}{children}
    </h2>
  );

  const renderSide = (key) => {
    if (key === "skills" && cv.skills?.length)
      return (
        <div key={key} className="mb-5">
          <Label light>{SECTION_LABELS.skills}</Label>
          <ul className="space-y-1.5">
            {cv.skills.map((s) => (
              <li key={s.id} className="text-[11px] text-white/90">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono">{s.name}</span>
                  <SkillMeter level={s.level} display={display} color="#fff" light />
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "languages" && cv.languages?.length)
      return (
        <div key={key} className="mb-5">
          <Label light>{SECTION_LABELS.languages}</Label>
          <ul className="space-y-0.5 text-[11px] text-white/90 font-mono">
            {cv.languages.map((l) => <li key={l.id}>{l.name} <span className="opacity-60">— {l.level}</span></li>)}
          </ul>
        </div>
      );
    if (key === "certifications" && cv.certifications?.length)
      return (
        <div key={key} className="mb-5">
          <Label light>{SECTION_LABELS.certifications}</Label>
          <ul className="space-y-1 text-[11px] text-white/90">
            {cv.certifications.map((c) => (
              <li key={c.id}>
                <div className="font-medium">{c.name}</div>
                <div className="opacity-70">{[c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</div>
              </li>
            ))}
          </ul>
        </div>
      );
    if (key === "courses" && cv.courses?.length)
      return (
        <div key={key} className="mb-5">
          <Label light>{SECTION_LABELS.courses}</Label>
          <ul className="space-y-0.5 text-[11px] text-white/90 font-mono">
            {cv.courses.map((c) => <li key={c.id}>{[c.name, c.organization, fmtDate(c.date)].filter(Boolean).join(" — ")}</li>)}
          </ul>
        </div>
      );
    if (key === "interests" && cv.interests?.length)
      return (
        <div key={key} className="mb-5">
          <Label light>{SECTION_LABELS.interests}</Label>
          <SimpleList items={cv.interests} light />
        </div>
      );
    return null;
  };

  const renderMain = (key) => {
    if (key === "summary" && cv.summary)
      return (
        <section key={key} className="mb-4">
          <Label>{SECTION_LABELS.summary}</Label>
          <p className="text-[11.5px] leading-relaxed text-gray-700">{cv.summary}</p>
        </section>
      );
    if (key === "experience" && cv.experience?.length)
      return (
        <section key={key} className="mb-4">
          <Label>{SECTION_LABELS.experience}</Label>
          <ExperienceList items={cv.experience} color={color} />
        </section>
      );
    if (key === "education" && cv.education?.length)
      return (
        <section key={key} className="mb-4">
          <Label>{SECTION_LABELS.education}</Label>
          <EducationList items={cv.education} />
        </section>
      );
    if (key === "projects" && cv.projects?.length)
      return (
        <section key={key} className="mb-4">
          <Label>{SECTION_LABELS.projects}</Label>
          {cv.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-[12.5px] text-gray-900 font-mono">{p.name}</h3>
                {p.url ? <span className="text-[10px] text-gray-500 font-mono">{p.url}</span> : null}
              </div>
              {p.technologies ? <div className="text-[10.5px] italic text-gray-500">{p.technologies}</div> : null}
              {p.description ? <p className="text-[11px] text-gray-700 mt-0.5">{p.description}</p> : null}
            </div>
          ))}
        </section>
      );
    if (key === "awards" && cv.awards?.length)
      return (
        <section key={key} className="mb-4">
          <Label>{SECTION_LABELS.awards}</Label>
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
        <section key={key} className="mb-4">
          <Label>{SECTION_LABELS.volunteer}</Label>
          {cv.volunteer.map((v) => (
            <div key={v.id} className="mb-1">
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
          <Label>{SECTION_LABELS.references}</Label>
          {cv.references.map((r) => (
            <div key={r.id} className="mb-1 text-[11px]">
              <span className="font-semibold text-gray-900">{r.name}</span> <span className="text-gray-500">{[r.relationship, r.contact].filter(Boolean).join(" — ")}</span>
            </div>
          ))}
        </section>
      );
    return null;
  };

  const initials = (pi.full_name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <div className="cv-page mx-auto flex" style={{ fontFamily: font, color: "#1a202c" }}>
      <aside className="w-[33%] p-7 text-white" style={{ background: color }}>
        <div className="mb-6">
          {pi.photo ? (
            <img src={pi.photo} alt="" className="w-20 h-20 rounded-lg object-cover mb-3 border-2 border-white/30" />
          ) : (
            <div className="w-20 h-20 rounded-lg mb-3 flex items-center justify-center bg-white/15 text-2xl font-bold font-mono">{initials}</div>
          )}
          <div className="text-lg font-bold leading-tight">{pi.full_name || "Your Name"}</div>
          {pi.professional_title ? <p className="text-[11px] text-white/85 mt-0.5 font-mono">{pi.professional_title}</p> : null}
        </div>
        <div className="mb-5">
          <Label light>Contact</Label>
          <ul className="space-y-1 text-[10.5px] text-white/90 break-words font-mono">
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