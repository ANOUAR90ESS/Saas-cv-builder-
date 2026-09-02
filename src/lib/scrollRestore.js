// Tiny sessionStorage-backed scroll cache, keyed per route pathname.
// ScrollSaver records the viewport offset for the current route; ScrollToTop
// replays it when the user navigates back (POP) to that route, so they reopen
// the dashboard at the exact place they left instead of jumping to the top.

const key = (pathname) => `dexacv_scroll:${pathname}`;

export function saveScrollPosition(pathname, y) {
  if (typeof window === "undefined") return;
  try {
    if (y > 0) sessionStorage.setItem(key(pathname), String(Math.round(y)));
    else sessionStorage.removeItem(key(pathname));
  } catch {
    /* storage may be unavailable (private mode) — ignore */
  }
}

export function getSavedScrollPosition(pathname) {
  try {
    const v = sessionStorage.getItem(key(pathname));
    const n = v ? Number(v) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}