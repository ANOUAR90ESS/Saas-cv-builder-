// The single seam between this app and whatever backend is behind it.
//
// Every network call the frontend makes goes through one of the functions
// below. Nothing else in src/ imports a backend SDK. That is the whole point:
// swapping providers becomes a change to this file rather than a hunt through
// thirty call sites, and any component can be read without knowing which
// service is answering.
//
// Errors are normalised here too. A refusal for want of a session arrives as a
// status on one call and a code in the body on another, and callers that have
// to tell "sign in" from "try again" should not each learn both shapes.
import { supabase, isSupabaseConfigured } from "@/api/supabase";

/**
 * Thrown when the backend refused for want of a session. Retrying cannot help,
 * so the UI says "sign in" rather than "something went wrong".
 */
export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

/**
 * Calls a Supabase edge function. Its client reports transport failures on
 * `error` and the function's own 4xx/5xx body on `data`, so both are unpacked
 * into the exceptions the callers already expect.
 */
async function callFunction(name, body = {}) {
  const res = await fetch(`/api/functions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new AuthRequiredError();
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `${name} failed with status ${res.status}`);
  }
  
  const data = await res.json();
  if (data?.error) {
    if (data.code === "auth_required") throw new AuthRequiredError();
    throw new Error(data.error);
  }
  return data;
}

// ---------------------------------------------------------------- AI

/**
 * Improves the user's own writing — a summary, bullet points, skill names.
 * `lang` decides the language of the reply, not of the input.
 * Returns whatever shape the action produces: a string, or a list of strings.
 */
export async function aiAssist(action, { lang, text, context } = {}) {
  const data = await callFunction("ai-assist", { action, lang, text, context });
  return data?.result;
}

/**
 * Turns a pasted or uploaded profile into the CV shape the builder uses.
 * `lang` is only a tie-breaker: imported content keeps the language it was
 * written in, because translating someone's own CV is not importing it.
 */
export async function importProfile(payload = {}) {
  const data = await callFunction("import-profile", payload);
  return data?.result;
}

// ---------------------------------------------------------------- files

// Read-public, write-open, and capped by type and size at the bucket — see the
// migration that creates it for why those limits are the whole defence.
const BUCKET = "uploads";

/**
 * Stores a file and returns a URL that can be put straight into an `<img>` or
 * handed to the import parser. Callers never see the storage layout.
 */
export async function uploadFile(file) {
  if (isSupabaseConfigured) {
    try {
      const ext = (file.name?.match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase();
      const path = `${crypto.randomUUID()}${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
      if (!error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (e) {
      console.warn("Storage upload failed, falling back to local file reader:", e);
    }
  }

  // Fallback for offline/local mode: read file as base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------- misc

/** Sends the contact form. Resolves when it has been accepted for delivery. */
export async function sendContact({ name, email, subject, message }) {
  await callFunction("contact", { name, email, subject, message });
}

/** Erases the account and everything the backend holds for it. Irreversible. */
export async function deleteAccount() {
  await callFunction("delete-account", {});
}
