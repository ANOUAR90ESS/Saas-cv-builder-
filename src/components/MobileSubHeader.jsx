import React from "react";
import { ChevronLeft } from "lucide-react";
import { useSmartBack } from "@/hooks/useSmartBack";

// Mobile-only back button shown at the top of content pages.
// Gives mobile users a clean, visible back affordance that scrolls naturally
// with the content and never overlaps or cuts through page headings.
export default function MobileSubHeader({ title, fallback = "/" }) {
  const back = useSmartBack(fallback);
  return (
    <div className="md:hidden mb-5">
      <button
        type="button"
        onClick={back}
        aria-label="Back"
        className="inline-flex items-center gap-1.5 py-1.5 px-2.5 -ml-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition text-sm font-medium"
      >
        <ChevronLeft size={18} />
        {title ? <span className="truncate">{title}</span> : <span>Back</span>}
      </button>
    </div>
  );
}