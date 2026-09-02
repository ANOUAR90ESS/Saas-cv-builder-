// The boot screen is the purple panel in index.html that covers the app until
// the first route has actually rendered. It is plain DOM rather than a React
// component on purpose: it has to paint before any JavaScript is parsed, which
// is what keeps the launch from flashing white between the installed app's
// splash screen and the first page.
//
// Dismissal is idempotent and safe to call more than once, from more than one
// place — App.jsx calls it when the first route commits, main.jsx calls it on a
// timeout so a failed or suspended render can never leave the panel stranded
// over a working app.

const FADE_MS = 300;

let dismissed = false;

export function dismissBootScreen() {
  if (dismissed) return;
  dismissed = true;
  const el = typeof document !== "undefined" && document.getElementById("boot-screen");
  if (!el) return;
  el.classList.add("boot-done");
  window.setTimeout(() => el.remove(), FADE_MS);
}
