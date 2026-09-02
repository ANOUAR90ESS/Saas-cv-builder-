import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";

// Mobile-friendly bottom-sheet picker (vaul) replacing native <select> in editors.
export default function SheetSelect({ value, onChange, options, className = "", label = "Select" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-center justify-between rounded-lg border border-input bg-card px-3 py-2 text-sm text-left text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={15} className="text-gray-400 shrink-0" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="safe-bottom">
          <DrawerTitle className="px-4 pt-2 pb-1 text-sm font-semibold text-muted-foreground">{label}</DrawerTitle>
          <div className="px-2 pb-4 max-h-[60vh] overflow-y-auto">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm hover:bg-muted"
              >
                <span>{o}</span>
                {o === value && <Check size={16} className="text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}