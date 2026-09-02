// Collects the rendered CV's text, with the position of every run, so the PDF
// can carry a real text layer instead of being a picture of a document.
//
// Why this exists: the export rasterises the template with html2canvas, which
// reproduces all 45 designs exactly but produces a PDF with no text in it at
// all. Applicant tracking systems parse the text stream, so a CV exported that
// way is invisible to them — while the product is sold as ATS-friendly. Drawing
// the same words invisibly on top of the image keeps the design pixel-identical
// and makes the file selectable, searchable and machine-readable.
//
// The alternative — rebuilding 45 templates as drawing commands — would fork
// the design from the on-screen preview and drift out of sync immediately.

// jsPDF's built-in fonts encode Latin-1 (WinAnsi). Text outside that range —
// Arabic above all — would be written as the wrong bytes, and a parser would
// extract confident nonsense, which is worse than extracting nothing.
//
// But most of what falls outside Latin-1 in a CV is ordinary typography: em
// dashes between a company and a city, curly apostrophes, bullets, ellipses.
// Dropping those runs wholesale threw away real content — company names, dates,
// locations — so they are folded to their ASCII equivalents first. The glyphs
// a reader sees come from the image underneath; this layer only has to carry
// the words accurately.
const TYPOGRAPHY = [
  [/[\u2010-\u2015\u2212]/g, "-"],   // hyphens, en/em dashes, minus
  [/[\u2018\u2019\u201B]/g, "'"],   // curly single quotes
  [/[\u201C\u201D\u201F]/g, '"'],   // curly double quotes
  [/[\u2022\u2023\u25E6\u2043]/g, "-"], // bullets
  [/\u2026/g, "..."],                 // ellipsis
  [/[\u00A0\u2007\u202F\u2009\u200A]/g, " "], // fixed-width spaces
  [/[\u2044\u2215]/g, "/"],          // fraction slashes
  [/\u2122/g, "(TM)"],
  [/\u2117|\u00A9/g, "(c)"],
];

const LATIN1_SAFE = /^[\x20-\x7E\xA0-\xFF\s]*$/;

/** Folds typographic characters to their ASCII equivalents. */
export function normalizeForTextLayer(text) {
  let out = text;
  for (const [re, to] of TYPOGRAPHY) out = out.replace(re, to);
  return out;
}

export function isTextLayerSupported(text) {
  return LATIN1_SAFE.test(normalizeForTextLayer(text));
}

// Walks the rendered node and returns one entry per line of text, in document
// order, carrying the box the browser laid it out in. Client rects are used
// rather than the element box so that a paragraph wrapping over three lines
// yields three runs at the right vertical positions.
export function collectTextRuns(root) {
  const runs = [];
  const rootBox = root.getBoundingClientRect();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node;
  while ((node = walker.nextNode())) {
    const el = node.parentElement;
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize) || 12;
    const transform = style.textTransform;

    const range = document.createRange();
    range.selectNodeContents(node);

    for (const rect of range.getClientRects()) {
      if (rect.width < 0.5 || rect.height < 0.5) continue;
      // The characters inside this rect, so a wrapped paragraph splits into the
      // lines the reader actually sees.
      const text = textForRect(node, range, rect, transform);
      if (!text) continue;
      runs.push({
        text,
        x: rect.left - rootBox.left,
        // Baseline: browsers give the line box, and the baseline sits roughly
        // 80% down for the common CV faces. Exactness is not required — the
        // glyphs are invisible — but staying inside the line keeps extraction
        // order and any on-screen selection sensible.
        y: rect.top - rootBox.top + rect.height * 0.8,
        width: rect.width,
        fontSize,
      });
    }
    range.detach?.();
  }
  return runs;
}

// Slices the node's text down to the characters that fall inside one client
// rect, by walking character offsets and testing which rect each lands in.
function textForRect(node, range, rect, transform) {
  const value = node.nodeValue;
  const probe = document.createRange();
  let out = "";
  for (let i = 0; i < value.length; i++) {
    probe.setStart(node, i);
    probe.setEnd(node, i + 1);
    const r = probe.getBoundingClientRect();
    // Same visual line: vertical centre falls within this rect.
    const mid = r.top + r.height / 2;
    if (mid >= rect.top - 1 && mid <= rect.bottom + 1 && r.left >= rect.left - 1 && r.right <= rect.right + 1) {
      out += value[i];
    }
  }
  probe.detach?.();
  out = out.replace(/\s+/g, " ").trim();
  if (!out) return "";
  if (transform === "uppercase") out = out.toUpperCase();
  else if (transform === "lowercase") out = out.toLowerCase();
  return out;
}
