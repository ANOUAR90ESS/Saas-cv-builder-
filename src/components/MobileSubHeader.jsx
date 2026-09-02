import React from "react";
import { ChevronLeft } from "lucide-react";
import { useSmartBack } from "@/hooks/useSmartBack";

// Mobile-only sub-header with safe-area-top padding and a native back button.
// Shown at the top of content pages to give mobile users an explicit back
// affordance; hidden on desktop where the main Layout header suffices.
// Sticks just under the Layout header (top-16) and uses safe-top so the
// back button clears the notch on iOS.
//
// The back button is "smart": it pops real in-app history when available
// (returning the user to their previous dashboard view) and otherwise falls
// back to `fallback` (default Home) so deep-linked or reloaded pages never
// bounce the user out of the app. Global scroll restoration reopens that
// previous view at the exact scroll position the user left.
export default function MobileSubHeader({ title, fallback = "/" }) {
  const back = useSmartBack(fallback);
  return (
    <div className="md:hidden sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border safe-top">
      <div className="h-12 flex items-center px-2 gap-1">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg text-foreground hover:bg-muted transition"
        >
          <ChevronLeft size={22} />
        </button>
        {title ? <span className="font-semibold text-sm truncate">{title}</span> : null}
      </div>
    </div>
  );
}