import React, { useState } from "react";
import { Plus, Copy, Trash2, Wand2, Loader2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Field, TextInput, TextArea, DateInput } from "./Fields";
import { emptyItem } from "@/lib/cvSchema";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import AiTextImprover from "./AiTextImprover";

export default function ExperienceEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const add = () => set([...items, emptyItem("experience")]);
  const remove = (id) => set(items.filter((it) => it.id !== id));
  const duplicate = (id) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const copy = { ...it, id: emptyItem("experience").id };
    set([...items, copy]);
  };
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    set(next);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    const updated = Array.from(items);
    const [movedItem] = updated.splice(from, 1);
    updated.splice(to, 0, movedItem);
    set(updated);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && <EmptyHint label={t("builder.empty.experience")} onAdd={add} />}
      
      {items.length > 1 && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 py-0.5">
          <span className="flex items-center gap-1.5 font-medium">
            <GripVertical size={13} className="text-primary" />
            <span>Drag items using the grip handle to reorder your career history</span>
          </span>
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-semibold">
            {items.length} roles
          </span>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="experience-droppable-list">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-3 rounded-2xl transition-colors duration-200",
                snapshot.isDraggingOver && "bg-primary/5 p-2 ring-1 ring-primary/20"
              )}
            >
              {items.map((it, idx) => (
                <Draggable key={it.id} draggableId={String(it.id)} index={idx}>
                  {(dragProvided, dragSnapshot) => (
                    <ItemCard
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      dragHandleProps={dragProvided.dragHandleProps}
                      isDragging={dragSnapshot.isDragging}
                      item={it}
                      idx={idx}
                      total={items.length}
                      onUpdate={(patch) => update(it.id, patch)}
                      onRemove={() => remove(it.id)}
                      onDuplicate={() => duplicate(it.id)}
                      onMove={(dir) => move(idx, dir)}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AddButton onClick={add} label={t("builder.add.experience")} />
    </div>
  );
}

function ItemCard({
  item,
  idx,
  total,
  onUpdate,
  onRemove,
  onDuplicate,
  onMove,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging
}) {
  const t = useT();
  const { aiAssist } = useAiAssist();
  const [open, setOpen] = useState(idx === 0 && !item.job_title);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");
  const [descLoading, setDescLoading] = useState(false);
  const [descErr, setDescErr] = useState("");

  const suggestContent = async () => {
    setDescLoading(true);
    setDescErr("");
    try {
      const result = await aiAssist("suggest_content", {
        text: "",
        context: { type: "experience", job_title: item.job_title, company: item.company },
      });
      onUpdate({ description: result || "" });
    } catch (e) {
      setDescErr(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.ai.errDescription"));
    } finally {
      setDescLoading(false);
    }
  };

  const canWriteBullets = Boolean((item.description || "").trim());

  const writeBullets = async () => {
    if (!canWriteBullets) {
      setAiErr(t("builder.ai.needsDescription"));
      return;
    }
    setAiLoading(true);
    setAiErr("");
    try {
      const result = await aiAssist("write_bullets", {
        text: item.description,
        context: { job_title: item.job_title, company: item.company },
      });
      const bullets = result || [];
      onUpdate({ bullet_points: bullets.length ? bullets : [""] });
    } catch (e) {
      setAiErr(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.ai.errBullets"));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={cn(
        "rounded-xl border border-border bg-card transition-all duration-150",
        isDragging && "shadow-xl ring-2 ring-primary/50 border-primary bg-card z-50 scale-[1.01]"
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/70">
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition shrink-0 select-none"
          title="Drag up or down to reorder"
          aria-label="Drag to reorder role"
        >
          <GripVertical size={16} />
        </div>
        <button className="flex-1 text-left text-sm font-medium truncate" onClick={() => setOpen((v) => !v)}>
          {item.job_title || t("builder.new.experience")} {item.company ? <span className="text-muted-foreground font-normal">· {item.company}</span> : null}
        </button>
        <IconBtn title={t("builder.action.moveUp")} disabled={idx === 0} onClick={() => onMove(-1)}><ChevronUp size={15} /></IconBtn>
        <IconBtn title={t("builder.action.moveDown")} disabled={idx === total - 1} onClick={() => onMove(1)}><ChevronDown size={15} /></IconBtn>
        <IconBtn title={t("builder.action.duplicate")} onClick={onDuplicate}><Copy size={14} /></IconBtn>
        <IconBtn title={t("builder.action.delete")} onClick={onRemove}><Trash2 size={14} /></IconBtn>
      </div>
      {open && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("builder.field.jobTitle")}><TextInput value={item.job_title} onChange={(e) => onUpdate({ job_title: e.target.value })} placeholder={t("builder.ph.jobTitle")} /></Field>
            <Field label={t("builder.field.company")}><TextInput value={item.company} onChange={(e) => onUpdate({ company: e.target.value })} placeholder={t("builder.ph.company")} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t("builder.field.start")}><DateInput value={item.start_date} onChange={(e) => onUpdate({ start_date: e.target.value })} /></Field>
            <Field label={t("builder.field.end")}><DateInput value={item.end_date} disabled={item.current} onChange={(e) => onUpdate({ end_date: e.target.value })} /></Field>
            <Field label={t("builder.field.location")}><TextInput value={item.location} onChange={(e) => onUpdate({ location: e.target.value })} placeholder={t("builder.ph.remote")} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={item.current} onChange={(e) => onUpdate({ current: e.target.checked })} className="accent-primary" />
            {t("builder.field.currentRole")}
          </label>
          <Field label={t("builder.field.descriptionOptional")}>
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <AiTextImprover
                text={item.description}
                type="description"
                context={{ job_title: item.job_title, company: item.company }}
                onApply={(improved) => onUpdate({ description: improved })}
              />
              <button
                onClick={suggestContent}
                disabled={descLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-60"
              >
                {descLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {t("builder.ai.suggestContent")}
              </button>
            </div>
            <TextArea value={item.description} onChange={(e) => onUpdate({ description: e.target.value })} rows={3} placeholder={t("builder.ph.roleSummary")} />
            {descErr && <p className="text-xs text-destructive mt-1">{descErr}</p>}
          </Field>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t("builder.field.bulletPoints")}</span>
              <button
                onClick={writeBullets}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-60"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {t("builder.ai.writeBullets")}
              </button>
            </div>
            <div className="space-y-2">
              {(item.bullet_points || [""]).map((b, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                  <TextArea
                    value={b}
                    onChange={(e) => {
                      const next = [...(item.bullet_points || [""])];
                      next[i] = e.target.value;
                      onUpdate({ bullet_points: next });
                    }}
                    rows={1}
                    className="min-h-[40px] flex-1 text-xs"
                    placeholder={t("builder.ph.achieved")}
                  />
                  <div className="flex items-center gap-0.5 shrink-0 pt-1">
                    <AiTextImprover
                      compact
                      text={b}
                      type="bullet"
                      context={{ job_title: item.job_title, company: item.company }}
                      onApply={(improved) => {
                        const next = [...(item.bullet_points || [""])];
                        next[i] = improved;
                        onUpdate({ bullet_points: next });
                      }}
                    />
                    <button
                      onClick={() => onUpdate({ bullet_points: (item.bullet_points || [""]).filter((_, j) => j !== i) })}
                      className="p-1.5 text-gray-400 hover:text-destructive rounded-md"
                      title="Remove bullet point"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => onUpdate({ bullet_points: [...(item.bullet_points || [""]), ""] })}
                className="text-xs text-primary hover:underline"
              >
                + {t("builder.action.addBullet")}
              </button>
            </div>
            {aiErr && <p className="text-xs text-destructive mt-1">{aiErr}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function IconBtn({ children, ...props }) {
  return (
    <button className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent lg:min-w-0 lg:min-h-0 lg:p-1.5" {...props}>
      {children}
    </button>
  );
}

export function AddButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="w-full py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
      <Plus size={15} className="inline mr-1" /> {label}
    </button>
  );
}

export function EmptyHint({ label, onAdd }) {
  return (
    <div className="text-center py-6 rounded-xl border border-dashed border-border">
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      <button onClick={onAdd} className="text-sm font-medium text-primary hover:underline">+ Add</button>
    </div>
  );
}
