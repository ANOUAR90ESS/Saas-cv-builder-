import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { SECTION_LABELS } from "@/lib/cvSchema";
import { useT } from "@/lib/i18n";

// Drag & drop to reorder CV sections, plus toggle to enable/disable each.
export default function SectionManager({ order, enabled, onReorder, onToggle }) {
  const t = useT();
  const handleEnd = (res) => {
    if (!res.destination) return;
    const next = [...order];
    const [moved] = next.splice(res.source.index, 1);
    next.splice(res.destination.index, 0, moved);
    onReorder(next);
  };

  return (
    <DragDropContext onDragEnd={handleEnd}>
      <Droppable droppableId="sections">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
            {order.map((key, index) => (
              <Draggable key={key} draggableId={key} index={index}>
                {(p, snapshot) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    {...p.dragHandleProps}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-card transition ${snapshot.isDragging ? "border-primary shadow-md" : "border-border"}`}
                  >
                    <GripVertical size={15} className="text-muted-foreground/60" />
                    <span className="flex-1 text-sm font-medium">{SECTION_LABELS[key]}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(key);
                      }}
                      className={`p-1.5 rounded-md ${enabled[key] ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"}`}
                      aria-label={enabled[key] ? t("builder.action.hideSection") : t("builder.action.showSection")}
                    >
                      {enabled[key] ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}