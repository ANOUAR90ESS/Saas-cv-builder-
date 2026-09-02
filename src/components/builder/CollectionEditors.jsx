import React, { useState } from "react";
import { useT, useLang } from "@/lib/i18n";
import { Plus, Trash2, Wand2, Loader2, X } from "lucide-react";
import { Field, TextInput, TextArea, YearInput } from "./Fields";
import { emptyItem, SKILL_LEVELS, LANGUAGE_LEVELS, levelLabel, levelValue } from "@/lib/cvSchema";
import { AddButton, EmptyHint } from "./ExperienceEditor";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import SheetSelect from "./SheetSelect";
import AiTextImprover from "./AiTextImprover";

/* Skills */
export function SkillsEditor({ items, onChange, cv }) {
  const t = useT();
  const { lang } = useLang();
  const { aiAssist } = useAiAssist();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const add = () => set([...items, emptyItem("skills")]);
  const remove = (id) => set(items.filter((s) => s.id !== id));

  const suggest = async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await aiAssist("suggest_skills", {
        text: (cv.experience || []).map((e) => e.job_title).join(", "),
        context: { professional_title: cv.personal_info?.professional_title },
      });
      const names = result || [];
      const merged = [...items, ...names.filter((n) => !items.some((s) => s.name === n)).map((n) => ({ id: emptyItem("skills").id, name: n, level: "Intermediate" }))];
      set(merged);
    } catch (e) {
      setErr(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.ai.errSuggestions"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.skills")} onAdd={add} />}
      {items.map((s) => (
        <div key={s.id} className="rounded-xl border border-border p-3 space-y-2">
          <TextInput value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} placeholder={t("builder.ph.skillName")} />
          <div className="flex gap-2 items-center">
            <SheetSelect value={levelLabel(s.level, lang)} onChange={(v) => update(s.id, { level: levelValue(v, lang) })} options={SKILL_LEVELS.map((l) => levelLabel(l, lang))} className="flex-1" label={t("builder.field.skillLevel")} />
            <button onClick={() => remove(s.id)} className="shrink-0 p-2 text-gray-400 hover:text-destructive"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <AddButton onClick={add} label={t("builder.add.skill")} />
        <button onClick={suggest} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} {t("builder.ai.suggestSkills")}
        </button>
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}

/* Languages */
export function LanguagesEditor({ items, onChange }) {
  const t = useT();
  const { lang } = useLang();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const add = () => set([...items, emptyItem("languages")]);
  const remove = (id) => set(items.filter((l) => l.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.languages")} onAdd={add} />}
      {items.map((l) => (
        <div key={l.id} className="rounded-xl border border-border p-3 space-y-2.5">
          <Field label={t("builder.field.language")}>
            <TextInput value={l.name} onChange={(e) => update(l.id, { name: e.target.value })} placeholder={t("builder.ph.languageExample")} className="text-base py-2.5" />
          </Field>
          <div className="flex gap-2 items-center">
            <SheetSelect value={levelLabel(l.level, lang)} onChange={(v) => update(l.id, { level: levelValue(v, lang) })} options={LANGUAGE_LEVELS.map((l) => levelLabel(l, lang))} className="flex-1" label={t("builder.field.languageLevel")} />
            <button onClick={() => remove(l.id)} className="shrink-0 p-2 text-gray-400 hover:text-destructive"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.language")} />
    </div>
  );
}

/* Projects */
export function ProjectsEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const add = () => set([...items, emptyItem("projects")]);
  const remove = (id) => set(items.filter((p) => p.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.projects")} onAdd={add} />}
      {items.map((p) => (
        <div key={p.id} className="rounded-xl border border-border p-3 space-y-2">
          <Field label={t("builder.field.projectName")}><TextInput value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} /></Field>
          <Field label={t("builder.field.technologies")}><TextInput value={p.technologies} onChange={(e) => update(p.id, { technologies: e.target.value })} placeholder={t("builder.ph.technologies")} /></Field>
          <Field label={t("builder.field.url")}><TextInput value={p.url} onChange={(e) => update(p.id, { url: e.target.value })} /></Field>
          <Field label={t("builder.field.description")}>
            {p.description && (
              <div className="flex justify-end mb-1">
                <AiTextImprover
                  text={p.description}
                  type="description"
                  context={{ project_name: p.name, technologies: p.technologies }}
                  onApply={(improved) => update(p.id, { description: improved })}
                />
              </div>
            )}
            <TextArea value={p.description} onChange={(e) => update(p.id, { description: e.target.value })} rows={2} />
          </Field>
          <button onClick={() => remove(p.id)} className="text-xs text-destructive hover:underline">{t("builder.action.remove")}</button>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.project")} />
    </div>
  );
}

/* Certifications */
export function CertificationsEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const add = () => set([...items, emptyItem("certifications")]);
  const remove = (id) => set(items.filter((c) => c.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.certifications")} onAdd={add} />}
      {items.map((c) => (
        <div key={c.id} className="rounded-xl border border-border p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("builder.field.name")}><TextInput value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} /></Field>
            <Field label={t("builder.field.organization")}><TextInput value={c.organization} onChange={(e) => update(c.id, { organization: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("builder.field.date")}><YearInput value={c.date} onChange={(e) => update(c.id, { date: e.target.value })} /></Field>
            <Field label={t("builder.field.url")}><TextInput value={c.url} onChange={(e) => update(c.id, { url: e.target.value })} /></Field>
          </div>
          <button onClick={() => remove(c.id)} className="text-xs text-destructive hover:underline">{t("builder.action.remove")}</button>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.certification")} />
    </div>
  );
}

/* Awards */
export function AwardsEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const add = () => set([...items, emptyItem("awards")]);
  const remove = (id) => set(items.filter((a) => a.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.awards")} onAdd={add} />}
      {items.map((a) => (
        <div key={a.id} className="rounded-xl border border-border p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("builder.field.name")}><TextInput value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} /></Field>
            <Field label={t("builder.field.organization")}><TextInput value={a.organization} onChange={(e) => update(a.id, { organization: e.target.value })} /></Field>
          </div>
          <Field label={t("builder.field.date")}><YearInput value={a.date} onChange={(e) => update(a.id, { date: e.target.value })} /></Field>
          <Field label={t("builder.field.description")}><TextArea value={a.description} onChange={(e) => update(a.id, { description: e.target.value })} rows={2} /></Field>
          <button onClick={() => remove(a.id)} className="text-xs text-destructive hover:underline">{t("builder.action.remove")}</button>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.award")} />
    </div>
  );
}

/* Courses */
export function CoursesEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const add = () => set([...items, emptyItem("courses")]);
  const remove = (id) => set(items.filter((c) => c.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.courses")} onAdd={add} />}
      {items.map((c) => (
        <div key={c.id} className="rounded-xl border border-border p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("builder.field.courseName")}><TextInput value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} /></Field>
            <Field label={t("builder.field.organization")}><TextInput value={c.organization} onChange={(e) => update(c.id, { organization: e.target.value })} /></Field>
          </div>
          <Field label={t("builder.field.date")}><YearInput value={c.date} onChange={(e) => update(c.id, { date: e.target.value })} /></Field>
          <button onClick={() => remove(c.id)} className="text-xs text-destructive hover:underline">{t("builder.action.remove")}</button>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.course")} />
    </div>
  );
}

/* Volunteer */
export function VolunteerEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const add = () => set([...items, emptyItem("volunteer")]);
  const remove = (id) => set(items.filter((v) => v.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.volunteer")} onAdd={add} />}
      {items.map((v) => (
        <div key={v.id} className="rounded-xl border border-border p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("builder.field.role")}><TextInput value={v.role} onChange={(e) => update(v.id, { role: e.target.value })} /></Field>
            <Field label={t("builder.field.organization")}><TextInput value={v.organization} onChange={(e) => update(v.id, { organization: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("builder.field.start")}><YearInput value={v.start_date} onChange={(e) => update(v.id, { start_date: e.target.value })} /></Field>
            <Field label={t("builder.field.end")}><YearInput value={v.end_date} onChange={(e) => update(v.id, { end_date: e.target.value })} /></Field>
          </div>
          <Field label={t("builder.field.description")}><TextArea value={v.description} onChange={(e) => update(v.id, { description: e.target.value })} rows={2} /></Field>
          <button onClick={() => remove(v.id)} className="text-xs text-destructive hover:underline">{t("builder.action.remove")}</button>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.volunteer")} />
    </div>
  );
}

/* References */
export function ReferencesEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => set([...items, emptyItem("references")]);
  const remove = (id) => set(items.filter((r) => r.id !== id));
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyHint label={t("builder.empty.references")} onAdd={add} />}
      {items.map((r) => (
        <div key={r.id} className="rounded-xl border border-border p-3 space-y-2">
          <Field label={t("builder.field.name")}><TextInput value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} /></Field>
          <Field label={t("builder.field.relationship")}><TextInput value={r.relationship} onChange={(e) => update(r.id, { relationship: e.target.value })} placeholder={t("builder.ph.formerManager")} /></Field>
          <Field label={t("builder.field.contact")}><TextInput value={r.contact} onChange={(e) => update(r.id, { contact: e.target.value })} placeholder={t("builder.ph.emailOrPhone")} /></Field>
          <button onClick={() => remove(r.id)} className="text-xs text-destructive hover:underline">{t("builder.action.remove")}</button>
        </div>
      ))}
      <AddButton onClick={add} label={t("builder.add.reference")} />
    </div>
  );
}

/* Interests (tag list) */
export function InterestsEditor({ items, onChange }) {
  const t = useT();
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim();
    if (!v) return;
    onChange([...items, v]);
    setVal("");
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <TextInput value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={t("builder.ph.interest")} className="flex-1" />
        <button onClick={add} className="px-3 rounded-lg bg-primary text-white"><Plus size={16} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-sm bg-muted px-2.5 py-1 rounded-full">
            {t}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-400 hover:text-destructive"><X size={13} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}