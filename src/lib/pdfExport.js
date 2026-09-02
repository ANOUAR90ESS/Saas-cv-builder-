// Template-faithful PDF export, with a real text layer.
//
// The CV is rendered to the actual selected template (the same React component
// used by the on-screen preview and browser print) and rasterised with
// html2canvas, so every one of the 45 templates exports exactly as it looks on
// screen. On top of that image the same words are drawn again as invisible PDF
// text, positioned where the browser laid them out.
//
// That second pass is the point. A rasterised-only PDF contains no text at all:
// nothing can be selected, searched, or read by an applicant tracking system —
// which is the one thing a CV has to survive. The text layer keeps the design
// pixel-identical and makes the file machine-readable.
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
import { createRoot } from "react-dom/client";
import TemplateRenderer from "@/components/cv/TemplateRenderer";
import { collectTextRuns, isTextLayerSupported, normalizeForTextLayer } from "@/lib/pdfTextLayer";
import { ensureArabicFont, ARABIC_FONT } from "@/lib/pdfArabicFont";

const A4_WIDTH_PX = 794; // 210mm @ 96dpi
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PX_TO_MM = A4_WIDTH_MM / A4_WIDTH_PX;
const PT_PER_MM = 72 / 25.4;

// Mount the selected template off-screen at full A4 width, measure its text,
// and rasterize it. Both come from the same layout pass, so the invisible text
// lines up with the image drawn from it.
async function renderTemplate(cv) {
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-99999px;top:0;width:794px;background:#ffffff;z-index:-1;";
  document.body.appendChild(host);

  const root = createRoot(host);
  await new Promise((resolve) => {
    root.render(React.createElement(ReadySignal, { onReady: resolve, cv }));
  });

  // Web fonts must be in before capture, or text renders in a fallback face and
  // the measured positions describe a layout the image does not show.
  try { await document.fonts.ready; } catch { /* ignore */ }
  await new Promise((r) => requestAnimationFrame(() => r()));
  await new Promise((r) => setTimeout(r, 60));

  const node = host.querySelector(".cv-page") || host.firstElementChild;

  const textRuns = collectTextRuns(node);
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: node.scrollWidth,
    height: node.scrollHeight,
    windowWidth: A4_WIDTH_PX,
  });

  root.unmount();
  host.remove();
  return { canvas, textRuns };
}

// Signals readiness from inside the rendered tree (layout effect runs after commit).
function ReadySignal({ onReady, cv }) {
  React.useLayoutEffect(() => { onReady(); }, []); // eslint-disable-line
  return React.createElement(TemplateRenderer, { cv });
}

async function buildPdf(canvas, textRuns) {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Only pay for the Arabic face when a run actually needs it.
  const needsArabic = textRuns.some((r) => !isTextLayerSupported(r.text));
  const hasArabic = needsArabic ? await ensureArabicFont(pdf) : false;
  const imgH = (canvas.height / canvas.width) * A4_WIDTH_MM;
  const imgData = canvas.toDataURL("image/png");

  // The rendered page is one tall image sliced across A4 pages; a run belongs
  // to the page its own vertical position falls in.
  const pageCount = Math.max(1, Math.ceil(imgH / A4_HEIGHT_MM));
  let skipped = 0;

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) pdf.addPage();
    const offset = page * A4_HEIGHT_MM;
    pdf.addImage(imgData, "PNG", 0, -offset, A4_WIDTH_MM, imgH, undefined, "FAST");

    for (const run of textRuns) {
      const yMm = run.y * PX_TO_MM - offset;
      if (yMm < 0 || yMm > A4_HEIGHT_MM) continue;
      const text = normalizeForTextLayer(run.text);
      const latin = isTextLayerSupported(text);
      if (!latin && !hasArabic) { skipped++; continue; }

      // Latin-1 runs stay on the built-in face; anything else needs the
      // embedded one, which carries its own encoding.
      pdf.setFont(latin ? "helvetica" : ARABIC_FONT, "normal");
      pdf.setFontSize(run.fontSize * PX_TO_MM * PT_PER_MM);
      pdf.text(text, run.x * PX_TO_MM, yMm, {
        // Drawn but never painted: the raster underneath supplies the visuals,
        // this supplies the words a parser reads.
        renderingMode: "invisible",
        // Match the width the browser produced, so the invisible glyphs sit
        // over the ones in the image rather than drifting across the line.
        maxWidth: undefined,
      });
    }
  }

  if (skipped) {
    // Reached only when the Arabic face could not be fetched: writing those
    // characters through a Latin-1 font would produce wrong bytes, and a parser
    // extracting confident nonsense is worse than one extracting nothing.
    console.warn(`pdfExport: ${skipped} text run(s) omitted from the text layer (font unavailable)`);
  }
  return pdf;
}

function fileName(cv) {
  return `${(cv.title || "cv").replace(/\s+/g, "_")}.pdf`;
}

export async function exportPDF(cv) {
  const { canvas, textRuns } = await renderTemplate(cv);
  (await buildPdf(canvas, textRuns)).save(fileName(cv));
}

// The same PDF, handed to Android instead of to the browser. jsPDF's save()
// relies on `<a download>`, which the WebView ignores — see nativeSave.js.
export async function exportPDFNative(cv) {
  const { saveAndShareFile } = await import("./nativeSave");
  const { canvas, textRuns } = await renderTemplate(cv);
  const pdf = await buildPdf(canvas, textRuns);
  const base64 = pdf.output("datauristring").split(",")[1];
  await saveAndShareFile(fileName(cv), base64, "application/pdf");
}

export async function getPdfBlob(cv) {
  const { canvas, textRuns } = await renderTemplate(cv);
  return (await buildPdf(canvas, textRuns)).output("blob");
}
