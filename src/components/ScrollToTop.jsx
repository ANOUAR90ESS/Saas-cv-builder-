import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getSavedScrollPosition } from "@/lib/scrollRestore";

const getHashId = (hash) => {
  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") {
      // Returning via back/forward: restore the exact scroll the user left at
      // this route (captured by ScrollSaver) instead of jumping to the top.
      const y = getSavedScrollPosition(pathname);
      if (y > 0) {
        const t = window.setTimeout(() => window.scrollTo({ top: y, left: 0, behavior: "instant" }), 60);
        return () => window.clearTimeout(t);
      }
      return;
    }

    if (hash) {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, navigationType]);

  return null;
}