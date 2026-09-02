import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveScrollPosition } from "@/lib/scrollRestore";

// Records the viewport scroll for the current route (throttled to one
// rAF per scroll burst) and flushes it on unmount/pagehide. ScrollToTop
// consumes the saved offset on POP (back) navigations to restore the
// user's place. Mounted once globally inside the Router.
export default function ScrollSaver() {
  const { pathname } = useLocation();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        saveScrollPosition(pathname, window.scrollY);
        frame = 0;
      });
    };
    const flush = () => saveScrollPosition(pathname, window.scrollY);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}