// Small shared helpers used across templates to keep them DRY.
import React from "react";
import { dateRange, fmtDate } from "@/lib/dates";
import { SECTION_LABELS, FONT_OPTIONS } from "@/lib/cvSchema";
import { levelLabel, getActiveCvLang } from "@/lib/cvSchema";

export function fontStack(fontId) {
  const f = FONT_OPTIONS.find((o) => o.id === fontId);
  return f ? f.stack : FONT_OPTIONS[0].stack;
}

export function ContactLine({ pi, className = "", sep = "•" }) {
  const bits = [pi.email, pi.phone, pi.location, pi.website, pi.linkedin, pi.github].filter(Boolean);
  if (!bits.length) return null;
  return (
    <div className={className}>
      {bits.map((b, i) => (
        <span key={i}>
          {b}
          {i < bits.length - 1 ? <span className="mx-1.5 opacity-40">{sep}</span> : null}
        </span>
      ))}
    </div>
  );
}

export function SectionTitle({ label, color, light = false, uppercase = true }) {
  return (
    <h2
      className={`font-semibold tracking-wide ${uppercase ? "uppercase" : ""} ${light ? "text-white/90" : ""}`}
      style={{ color: light ? undefined : color, fontSize: "12.5px", letterSpacing: "0.06em", marginBottom: "6px" }}
    >
      {label}
    </h2>
  );
}

export function ExperienceList({ items, color, light = false }) {
  return items.map((it) => (
    <div key={it.id} className="mb-2.5" style={{ breakInside: "avoid" }}>
      <div className="flex justify-between items-baseline gap-3">
        <h3 className="font-semibold" style={{ fontSize: "13px", color: light ? "#fff" : "#1a202c" }}>
          {it.job_title || "Job title"}
        </h3>
        <span className="text-[10.5px] whitespace-nowrap" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}>
          {dateRange(it.start_date, it.end_date, it.current)}
        </span>
      </div>
      <div className="text-[11px] italic" style={{ color: light ? "rgba(255,255,255,.75)" : "#6e7482" }}>
        {[it.company, it.location].filter(Boolean).join(" — ")}
      </div>
      {it.description ? (
        <p className="text-[11px] mt-1" style={{ color: light ? "rgba(255,255,255,.85)" : "#374151" }}>
          {it.description}
        </p>
      ) : null}
      {(it.bullet_points || []).filter(Boolean).length > 0 && (
        <ul className="list-disc pl-4 mt-1 space-y-0.5" style={{ color: light ? "rgba(255,255,255,.85)" : "#374151" }}>
          {it.bullet_points.filter(Boolean).map((b, i) => (
            <li key={i} className="text-[11px] leading-snug">
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  ));
}

export function EducationList({ items, light = false }) {
  return items.map((it) => (
    <div key={it.id} className="mb-2" style={{ breakInside: "avoid" }}>
      <div className="flex justify-between items-baseline gap-3">
        <h3 className="font-semibold" style={{ fontSize: "12.5px", color: light ? "#fff" : "#1a202c" }}>
          {it.degree || "Degree"}
        </h3>
        <span className="text-[10.5px] whitespace-nowrap" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}>
          {dateRange(it.start_date, it.end_date, false)}
        </span>
      </div>
      <div className="text-[11px] italic" style={{ color: light ? "rgba(255,255,255,.75)" : "#6e7482" }}>
        {[it.institution, it.location].filter(Boolean).join(" — ")}
      </div>
      {it.description ? (
        <p className="text-[11px] mt-0.5" style={{ color: light ? "rgba(255,255,255,.85)" : "#374151" }}>
          {it.description}
        </p>
      ) : null}
    </div>
  ));
}

export function SimpleList({ items, light = false }) {
  return (
    <p className="text-[11px]" style={{ color: light ? "rgba(255,255,255,.85)" : "#374151" }}>
      {items.join("  •  ")}
    </p>
  );
}

export function skillLevelValue(level) {
  return { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 }[level] || 2;
}

// Visual indicator for a skill's level. Respects theme.skill_display.
export function SkillMeter({ level, display = "bar", color = "#4f46e5", light = false, className = "" }) {
  if (!level || display === "none") return null;
  const v = skillLevelValue(level);
  const track = light ? "rgba(255,255,255,.22)" : "#e5e7eb";
  const fill = light ? "#ffffff" : color;
  if (display === "label")
    return <span className={className} style={{ color: light ? "rgba(255,255,255,.75)" : "#6e7482", fontSize: "10px" }}> · {levelLabel(level, getActiveCvLang())}</span>;
  if (display === "stars")
    return <span className={className} style={{ color: fill, fontSize: "11px", letterSpacing: "0.5px", lineHeight: 1 }}>{[1, 2, 3, 4].map((i) => (i <= v ? "★" : "☆")).join("")}</span>;
  if (display === "dots")
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i <= v ? fill : track }} />
        ))}
      </span>
    );
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="block h-1 w-12 rounded-full overflow-hidden" style={{ background: track }}>
        <span className="block h-full rounded-full" style={{ width: `${(v / 4) * 100}%`, background: fill }} />
      </span>
    </span>
  );
}

export function AwardList({ items, color, light = false }) {
  return items.map((it) => (
    <div key={it.id} className="mb-1.5" style={{ breakInside: "avoid" }}>
      <div className="flex justify-between items-baseline gap-3">
        <h3 className="font-semibold" style={{ fontSize: "12px", color: light ? "#fff" : "#1a202c" }}>
          {it.name}
        </h3>
        <span className="text-[10px] whitespace-nowrap" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}>
          {fmtDate(it.date)}
        </span>
      </div>
      {it.organization ? <div className="text-[10.5px] italic" style={{ color: light ? "rgba(255,255,255,.75)" : "#6e7482" }}>{it.organization}</div> : null}
      {it.description ? <p className="text-[10.5px] mt-0.5" style={{ color: light ? "rgba(255,255,255,.85)" : "#374151" }}>{it.description}</p> : null}
    </div>
  ));
}

export function CourseList({ items, light = false }) {
  return items.map((it) => (
    <div key={it.id} className="mb-1 flex justify-between items-baseline gap-3" style={{ breakInside: "avoid" }}>
      <span className="text-[11px]" style={{ color: light ? "rgba(255,255,255,.9)" : "#374151" }}>
        <span className="font-semibold" style={{ color: light ? "#fff" : "#1a202c" }}>{it.name}</span>
        {it.organization ? <span className="italic" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}> — {it.organization}</span> : null}
      </span>
      {it.date ? <span className="text-[10px] whitespace-nowrap" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}>{fmtDate(it.date)}</span> : null}
    </div>
  ));
}

export function VolunteerList({ items, light = false }) {
  return items.map((it) => (
    <div key={it.id} className="mb-1.5" style={{ breakInside: "avoid" }}>
      <div className="flex justify-between items-baseline gap-3">
        <h3 className="font-semibold" style={{ fontSize: "12px", color: light ? "#fff" : "#1a202c" }}>{it.role}</h3>
        <span className="text-[10px] whitespace-nowrap" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}>{dateRange(it.start_date, it.end_date, false)}</span>
      </div>
      <div className="text-[10.5px] italic" style={{ color: light ? "rgba(255,255,255,.75)" : "#6e7482" }}>{[it.organization, it.location].filter(Boolean).join(" — ")}</div>
      {it.description ? <p className="text-[10.5px] mt-0.5" style={{ color: light ? "rgba(255,255,255,.85)" : "#374151" }}>{it.description}</p> : null}
    </div>
  ));
}

export function ReferenceList({ items, light = false }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <div key={it.id} style={{ breakInside: "avoid" }}>
          <div className="font-semibold text-[11.5px]" style={{ color: light ? "#fff" : "#1a202c" }}>{it.name}</div>
          {it.relationship ? <div className="text-[10px] italic" style={{ color: light ? "rgba(255,255,255,.7)" : "#6e7482" }}>{it.relationship}</div> : null}
          {it.contact ? <div className="text-[10px]" style={{ color: light ? "rgba(255,255,255,.8)" : "#6e7482" }}>{it.contact}</div> : null}
        </div>
      ))}
    </div>
  );
}

export { dateRange, fmtDate, SECTION_LABELS };