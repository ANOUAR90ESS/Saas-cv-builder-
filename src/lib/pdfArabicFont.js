// Loads the Arabic font the PDF text layer needs, on demand.
//
// jsPDF's built-in faces encode Latin-1 only, so before this an Arabic CV
// exported with no text in it at all — invisible to every applicant tracking
// system, and to the reader's own Ctrl+F.
//
// The file is served from /fonts rather than bundled as base64: it is 192 KB,
// only an Arabic CV ever needs it, and keeping it out of the JavaScript means
// nobody else downloads or parses it. It is fetched at export time, cached by
// the browser afterwards, and a failure degrades to the previous behaviour
// (those runs are skipped) instead of breaking the export.
//
// Noto Sans Arabic, SIL Open Font License 1.1 — see the licence beside it,
// which permits embedding in a document.

const FONT_URL = "/fonts/NotoSansArabic-Regular.ttf";
export const ARABIC_FONT = "NotoSansArabic";

let cached = null;   // base64 of the font file
let failed = false;

async function fetchFontBase64() {
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`font ${res.status}`);
  const buf = await res.arrayBuffer();
  // Chunked so a 192 KB file does not blow the argument limit of fromCharCode.
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/**
 * Registers the Arabic face on a jsPDF document. Returns true when the document
 * can render Arabic afterwards, false when the font could not be loaded — the
 * caller then falls back to omitting those runs rather than writing wrong bytes.
 */
export async function ensureArabicFont(pdf) {
  if (failed) return false;
  try {
    if (!cached) cached = await fetchFontBase64();
    pdf.addFileToVFS("NotoSansArabic-Regular.ttf", cached);
    pdf.addFont("NotoSansArabic-Regular.ttf", ARABIC_FONT, "normal");
    return true;
  } catch (err) {
    failed = true;
    console.warn("pdfExport: Arabic font unavailable, text layer will omit non-Latin runs", err);
    return false;
  }
}
