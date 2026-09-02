// Single entry point for the AI backend functions.
//
// Every call carries the language the user picked in the UI, so suggestions come
// back in that language. Routing all callers through one hook is the point: when
// each component called the backend directly, adding a field meant editing
// seven call sites and any new one silently omitted it — which is exactly how
// every suggestion ended up in English regardless of the chosen language.
import * as backend from "@/api/backend";
import { AuthRequiredError } from "@/api/backend";
import { useLang } from "@/lib/i18n";

// Thrown so callers can tell "you are not signed in" from "generation failed".
// Retrying is useless for the first and reasonable for the second, and telling
// someone to try again when it can never work is worse than saying nothing.
export { AuthRequiredError as AiAuthError };

export function useAiAssist() {
  const { lang } = useLang();

  // action: one of the actions aiAssist understands; payload: { text, context }.
  // Returns the function's `result`, or throws so callers keep their own error UI.
  async function aiAssist(action, payload = {}) {
    return backend.aiAssist(action, { lang, ...payload });
  }

  // Parses a pasted profile or an uploaded export. `lang` is only a fallback
  // here: imported content keeps the language it was written in.
  async function importProfile(payload = {}) {
    return backend.importProfile({ lang, ...payload });
  }

  return { aiAssist, importProfile, lang };
}
