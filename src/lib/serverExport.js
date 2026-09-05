// The client half of paid exports.
//
// Nothing is generated here. The CV goes to the server, the server decides
// whether this visitor may have a file, and only then does it build one. That
// asymmetry is the entire point: while the PDF was produced in the browser,
// any paywall was a question the client asked itself with the answer already
// in its own memory, and no amount of client code could change that.
//
// The cost is real and worth naming: exporting now needs a connection. The
// builder still works offline -- editing, previewing, switching templates,
// everything is local -- but the download is not something the browser can do
// by itself any more.
import { Capacitor } from "@capacitor/core";
import { auth } from "@/lib/firebase";

const CLAIM_KEY = "dexacv_claims";

/**
 * Purchase claim tokens this browser is holding.
 *
 * A one-time purchase needs no account, so there is nowhere to put it but
 * here. The token is an unguessable id, not a credential: presenting one only
 * points the server at a purchase row, and spending it is still a conditional
 * update on the server side.
 */
export function getClaimTokens() {
  try {
    const raw = JSON.parse(localStorage.getItem(CLAIM_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((t) => typeof t === "string" && t) : [];
  } catch {
    return [];
  }
}

export function addClaimToken(token) {
  if (!token) return;
  try {
    const next = [...new Set([token, ...getClaimTokens()])].slice(0, 20);
    localStorage.setItem(CLAIM_KEY, JSON.stringify(next));
  } catch {
    // Private mode. The purchase still exists server-side and can be attached
    // to an account, but this browser will not remember it.
  }
}

export function clearClaimTokens() {
  try {
    localStorage.removeItem(CLAIM_KEY);
  } catch {
    /* ignore */
  }
}

/** Headers that say who is asking: an account if there is one, tokens if not. */
async function identityHeaders() {
  const headers = {};
  const tokens = getClaimTokens();
  if (tokens.length) headers["X-Claim-Tokens"] = tokens.join(",");
  try {
    const idToken = await auth?.currentUser?.getIdToken();
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
  } catch {
    // Not signed in, or the token refresh failed. Claim tokens may still carry
    // the purchase, so this is not fatal.
  }
  return headers;
}

/** Thrown when the server refused for want of payment, with what it reported. */
export class PaymentRequiredError extends Error {
  constructor(entitlement) {
    super("Payment required");
    this.name = "PaymentRequiredError";
    this.entitlement = entitlement || null;
  }
}

/** Thrown when this deployment cannot produce files at all. */
export class ExportUnavailableError extends Error {
  constructor(message) {
    super(message || "Exports are unavailable right now.");
    this.name = "ExportUnavailableError";
  }
}

/** What this visitor may currently do. Null when billing is switched off. */
export async function fetchEntitlement() {
  const res = await fetch("/api/billing/entitlement", { headers: await identityHeaders() });
  if (res.status === 503) return null;
  if (!res.ok) throw new Error("Could not check your entitlement.");
  return res.json();
}

async function requestFile(kind, cv) {
  const res = await fetch(`/api/export/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await identityHeaders()) },
    body: JSON.stringify({ cv }),
  });

  if (res.status === 402) {
    const body = await res.json().catch(() => ({}));
    throw new PaymentRequiredError(body.entitlement);
  }
  if (res.status === 503) {
    const body = await res.json().catch(() => ({}));
    throw new ExportUnavailableError(body.error);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Export failed (${res.status})`);
  }

  return {
    blob: await res.blob(),
    fileName: fileNameFrom(res.headers.get("Content-Disposition"), cv, kind),
  };
}

/** The server names the file; this only reads that name back off the response. */
function fileNameFrom(disposition, cv, kind) {
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition || "");
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      /* fall through */
    }
  }
  const plain = /filename="([^"]+)"/i.exec(disposition || "");
  if (plain) return plain[1];
  return `${String(cv?.title || "cv").replace(/\s+/g, "_")}.${kind}`;
}

async function deliver(blob, fileName, mime) {
  // Android's WebView ignores `<a download>`, so the bytes go to the share
  // sheet instead — see nativeSave.js.
  if (Capacitor.isNativePlatform()) {
    const { saveAndShareFile, blobToBase64 } = await import("./nativeSave");
    await saveAndShareFile(fileName, await blobToBase64(blob), mime);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoked on a later tick: Safari has not started reading the blob when
  // click() returns, and revoking immediately gives it an empty file.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function exportPDF(cv) {
  const { blob, fileName } = await requestFile("pdf", cv);
  await deliver(blob, fileName, "application/pdf");
}

export async function exportDocx(cv) {
  const { blob, fileName } = await requestFile("docx", cv);
  await deliver(
    blob,
    fileName,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}
