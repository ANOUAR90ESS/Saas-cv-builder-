import React, { useState } from "react";
import { Copy, Trash2, ChevronUp, ChevronDown, Wand2, Loader2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Field, TextInput, TextArea, YearInput } from "./Fields";
import { emptyItem } from "@/lib/cvSchema";
import { AddButton, EmptyHint, IconBtn } from "./ExperienceEditor";
import { useAiAssist, AiAuthError } from "@/lib/aiAssist";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function EducationEditor({ items, onChange }) {
  const t = useT();
  const set = (next) => onChange(next);
  const update = (id, patch) => set(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const add = () => set([...items, emptyItem("education")]);
  const remove = (id) => set(items.filter((it) => it.id !== id));
  const duplicate = (id) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    set([...items, { ...it, id: emptyItem("education").id }]);
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
      {items.length === 0 && <EmptyHint label={t("builder.empty.education")} onAdd={add} />}

      {items.length > 1 && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 py-0.5">
          <span className="flex items-center gap-1.5 font-medium">
            <GripVertical size={13} className="text-primary" />
            <span>Drag items using the grip handle to reorder degrees and diplomas</span>
          </span>
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-semibold">
            {items.length} credentials
          </span>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="education-droppable-list">
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
                    <Card
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      dragHandleProps={dragProvided.dragHandleProps}
                      isDragging={dragSnapshot.isDragging}
                      item={it}
                      idx={idx}
                      total={items.length}
                      onUpdate={(p) => update(it.id, p)}
                      onRemove={() => remove(it.id)}
                      onDuplicate={() => duplicate(it.id)}
                      onMove={(d) => move(idx, d)}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AddButton onClick={add} label={t("builder.add.education")} />
    </div>
  );
}

function Card({
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
  const [open, setOpen] = useState(true);
  const [descLoading, setDescLoading] = useState(false);
  const [descErr, setDescErr] = useState("");

  const suggestContent = async () => {
    setDescLoading(true);
    setDescErr("");
    try {
      const result = await aiAssist("suggest_content", {
        text: "",
        context: { type: "education", degree: item.degree, institution: item.institution },
      });
      onUpdate({ description: result || "" });
    } catch (e) {
      setDescErr(e instanceof AiAuthError ? t("builder.ai.errAuth") : t("builder.ai.errDescription"));
    } finally {
      setDescLoading(false);
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
          aria-label="Drag to reorder education"
        >
          <GripVertical size={16} />
        </div>
        <button className="flex-1 text-left text-sm font-medium truncate" onClick={() => setOpen((v) => !v)}>
          {item.degree || t("builder.new.education")} {item.institution ? <span className="text-muted-foreground font-normal">· {item.institution}</span> : null}
        </button>
        <IconBtn title={t("builder.action.moveUp")} disabled={idx === 0} onClick={() => onMove(-1)}><ChevronUp size={15} /></IconBtn>
        <IconBtn title={t("builder.action.moveDown")} disabled={idx === total - 1} onClick={() => onMove(1)}><ChevronDown size={15} /></IconBtn>
        <IconBtn title={t("builder.action.duplicate")} onClick={onDuplicate}><Copy size={14} /></IconBtn>
        <IconBtn title={t("builder.action.delete")} onClick={onRemove}><Trash2 size={14} /></IconBtn>
      </div>
      {open && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("builder.field.degree")}><TextInput value={item.degree} onChange={(e) => onUpdate({ degree: e.target.value })} placeholder={t("builder.ph.degree")} /></Field>
            <Field label={t("builder.field.institution")}><TextInput value={item.institution} onChange={(e) => onUpdate({ institution: e.target.value })} placeholder={t("builder.ph.institution")} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t("builder.field.start")}><YearInput value={item.start_date} onChange={(e) => onUpdate({ start_date: e.target.value })} /></Field>
            <Field label={t("builder.field.end")}><YearInput value={item.end_date} onChange={(e) => onUpdate({ end_date: e.target.value })} /></Field>
            <Field label={t("builder.field.location")}><TextInput value={item.location} onChange={(e) => onUpdate({ location: e.target.value })} placeholder={t("builder.ph.city")} /></Field>
          </div>
          <Field label={t("builder.field.descriptionOptional")}>
            <div className="flex justify-end mb-1">
              <button
                onClick={suggestContent}
                disabled={descLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-60"
              >
                {descLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {t("builder.ai.suggestContent")}
              </button>
            </div>
            <TextArea value={item.description} onChange={(e) => onUpdate({ description: e.target.value })} rows={2} />
            {descErr && <p className="text-xs text-destructive mt-1">{descErr}</p>}
          </Field>
        </div>
      )}
    </div>
  );
}
