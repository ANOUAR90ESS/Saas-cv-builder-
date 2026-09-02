import { useNavigate } from "react-router-dom";

// Smart mobile back button: pops real in-app history when it exists
// (returning the user to their previous dashboard view) and otherwise
// navigates to the provided `fallback` route.
//
// Uses the router's history entry index (window.history.state.idx), which is
// reliable for the current tab, instead of window.history.length — which
// counts external/forward entries and persists across reloads, so a
// deep-linked or reloaded page would otherwise bounce the user out of the app
// or leave the back button dead.
export function useSmartBack(fallback = "/") {
  const navigate = useNavigate();
  return () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback);
  };
}