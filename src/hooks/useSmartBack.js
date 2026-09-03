import { useEffect, useRef } from "react";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { triggerHaptic } from "@/lib/haptics";

const SESSION_KEY = "dexacv_nav_depth";

function getNavDepth() {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function setNavDepth(depth) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, String(Math.max(0, depth)));
  } catch {
    // ignore
  }
}

export function NavigationTracker() {
  const location = useLocation();
  const navType = useNavigationType();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const current = getNavDepth();
    if (navType === "PUSH") {
      setNavDepth(current + 1);
    } else if (navType === "POP") {
      setNavDepth(Math.max(0, current - 1));
    }
  }, [location.key, navType]);

  return null;
}

export function useSmartBack(fallback = "/") {
  const navigate = useNavigate();
  return () => {
    triggerHaptic("light");
    const depth = getNavDepth();
    if (depth > 0) {
      navigate(-1);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
