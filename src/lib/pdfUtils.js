import { PDFDocument, rgb, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/build/pdf.min.mjs";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Reads File or Blob as ArrayBuffer
 */
export async function fileToArrayBuffer(file) {
  return await file.arrayBuffer();
}

/**
 * Extracts text from PDF using pdfjs
 */
export async function extractPdfText(fileOrBuffer) {
  const buffer = fileOrBuffer instanceof ArrayBuffer ? fileOrBuffer : await fileToArrayBuffer(fileOrBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages = [];
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push({ pageNumber: i, text: pageText });
    fullText += (fullText ? "\n\n" : "") + `[Page ${i}]\n` + pageText;
  }

  const isScanned = fullText.replace(/\[Page \d+\]/g, "").trim().length < 40;

  return {
    numPages,
    pages,
    fullText,
    isScanned
  };
}

/**
 * Gets the page count of a PDF file
 */
export async function getPdfPageCount(fileOrBuffer) {
  const buffer = fileOrBuffer instanceof ArrayBuffer ? fileOrBuffer : await fileToArrayBuffer(fileOrBuffer);
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
}

/**
 * Renders PDF pages to Canvas / Images (JPEG or PNG)
 */
export async function renderPdfPages(fileOrBuffer, { scale = 1.5, maxPages = 50 } = {}) {
  const buffer = fileOrBuffer instanceof ArrayBuffer ? fileOrBuffer : await fileToArrayBuffer(fileOrBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const count = Math.min(pdf.numPages, maxPages);
  const rendered = [];

  for (let i = 1; i <= count; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.9));

    rendered.push({
      pageNumber: i,
      dataUrl,
      blob,
      width: viewport.width,
      height: viewport.height
    });
  }

  return rendered;
}

/**
 * Compresses PDF document
 * Level: 'low' (light clean), 'recommended' (balanced), 'extreme' (high compression)
 */
export async function compressPdf(fileOrBuffer, level = "recommended") {
  const buffer = fileOrBuffer instanceof ArrayBuffer ? fileOrBuffer : await fileToArrayBuffer(fileOrBuffer);
  const originalSize = buffer.byteLength;

  // Load PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Re-save with object streams enabled and unreferenced objects removed
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50
  });

  let compressedBuffer = pdfBytes.buffer;
  let compressedSize = compressedBuffer.byteLength;

  // If compression level is recommended or extreme, or original was huge,
  // we can also re-rasterize and compress pages if needed for extreme level
  if (level === "extreme" && compressedSize > 800 * 1024) {
    try {
      const rendered = await renderPdfPages(buffer, { scale: 1.2 });
      const newPdf = await PDFDocument.create();
      for (const item of rendered) {
        const jpgImage = await newPdf.embedJpg(await item.blob.arrayBuffer());
        const page = newPdf.addPage([item.width, item.height]);
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: item.width,
          height: item.height
        });
      }
      const rasterBytes = await newPdf.save({ useObjectStreams: true });
      if (rasterBytes.byteLength < compressedSize) {
        compressedBuffer = rasterBytes.buffer;
        compressedSize = rasterBytes.byteLength;
      }
    } catch (e) {
      console.warn("Extreme raster compression skipped:", e);
    }
  }

  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  const blob = new Blob([compressedBuffer], { type: "application/pdf" });

  return {
    blob,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent,
    url: URL.createObjectURL(blob)
  };
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePdfs(files) {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const buffer = await fileToArrayBuffer(file);
    const donorPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  const blob = new Blob([mergedBytes], { type: "application/pdf" });
  return {
    blob,
    size: blob.size,
    url: URL.createObjectURL(blob),
    pageCount: mergedPdf.getPageCount()
  };
}

/**
 * Split PDF into pages or ranges
 * ranges: e.g. "1-2, 3-5" or empty for all individual pages
 */
export async function splitPdf(file, rangesStr = "") {
  const buffer = await fileToArrayBuffer(file);
  const srcPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const results = [];

  if (!rangesStr.trim()) {
    // Extract every single page as an individual PDF
    for (let i = 0; i < totalPages; i++) {
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcPdf, [i]);
      singleDoc.addPage(copiedPage);
      const bytes = await singleDoc.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: "application/pdf" });
      results.push({
        name: `page_${i + 1}.pdf`,
        blob,
        url: URL.createObjectURL(blob),
        pageRange: `${i + 1}`,
        size: blob.size
      });
    }
  } else {
    // Parse ranges e.g. "1-3, 4, 5-7"
    const parts = rangesStr.split(",").map((p) => p.trim()).filter(Boolean);
    for (let pIdx = 0; pIdx < parts.length; pIdx++) {
      const part = parts[pIdx];
      let indices = [];
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let k = Math.max(1, start); k <= Math.min(totalPages, end); k++) {
            indices.push(k - 1);
          }
        }
      } else {
        const single = parseInt(part, 10);
        if (!isNaN(single) && single >= 1 && single <= totalPages) {
          indices.push(single - 1);
        }
      }

      if (indices.length > 0) {
        const subDoc = await PDFDocument.create();
        const copied = await subDoc.copyPages(srcPdf, indices);
        copied.forEach((p) => subDoc.addPage(p));
        const bytes = await subDoc.save({ useObjectStreams: true });
        const blob = new Blob([bytes], { type: "application/pdf" });
        results.push({
          name: `split_${part.replace(/\s+/g, "_")}.pdf`,
          blob,
          url: URL.createObjectURL(blob),
          pageRange: part,
          size: blob.size
        });
      }
    }
  }

  return results;
}

/**
 * Extract specific pages into a single new PDF
 */
export async function extractPdfPages(file, selectedPages = []) {
  const buffer = await fileToArrayBuffer(file);
  const srcPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const validIndices = selectedPages
    .map((p) => p - 1)
    .filter((i) => i >= 0 && i < totalPages);

  if (validIndices.length === 0) {
    throw new Error("No valid pages selected for extraction.");
  }

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(srcPdf, validIndices);
  copied.forEach((page) => newDoc.addPage(page));

  const bytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: "application/pdf" });

  return {
    blob,
    size: blob.size,
    url: URL.createObjectURL(blob),
    pageCount: validIndices.length
  };
}

/**
 * Rotate PDF pages
 * rotationMap: { [pageIndex: number]: 90 | 180 | 270 }
 */
export async function rotatePdf(file, rotationMap = {}) {
  const buffer = await fileToArrayBuffer(file);
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    const addRotation = rotationMap[idx] || 0;
    if (addRotation !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + addRotation) % 360));
    }
  });

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    blob,
    size: blob.size,
    url: URL.createObjectURL(blob)
  };
}

/**
 * Visual PDF Organizer: reorder, delete, and rotate pages
 */
export async function organizePdfPages(file, { pageOrder = [], deletedPages = [], rotationMap = {} }) {
  const buffer = await fileToArrayBuffer(file);
  const srcPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const newDoc = await PDFDocument.create();

  // Determine final order of page indices (0-based)
  const finalIndices = (pageOrder.length > 0 ? pageOrder : Array.from({ length: totalPages }, (_, i) => i))
    .filter((idx) => !deletedPages.includes(idx));

  if (finalIndices.length === 0) {
    throw new Error("Cannot remove all pages from PDF.");
  }

  for (const idx of finalIndices) {
    const [copiedPage] = await newDoc.copyPages(srcPdf, [idx]);
    const rot = rotationMap[idx] || 0;
    if (rot !== 0) {
      const curr = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((curr + rot) % 360));
    }
    newDoc.addPage(copiedPage);
  }

  const bytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    blob,
    size: blob.size,
    url: URL.createObjectURL(blob),
    pageCount: finalIndices.length
  };
}

/**
 * Convert JPG/PNG Images to PDF
 */
export async function imagesToPdf(files, { pageSize = "A4", orientation = "portrait", margin = 20 } = {}) {
  const pdfDoc = await PDFDocument.create();

  // Page dimensions (points, 72 pt/inch)
  // A4 is 595.28 x 841.89 pt
  // Letter is 612 x 792 pt
  let pWidth = pageSize === "Letter" ? 612 : 595.28;
  let pHeight = pageSize === "Letter" ? 792 : 841.89;

  if (orientation === "landscape") {
    const tmp = pWidth;
    pWidth = pHeight;
    pHeight = tmp;
  }

  for (const file of files) {
    const buffer = await fileToArrayBuffer(file);
    let image;
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");

    try {
      if (isPng) {
        image = await pdfDoc.embedPng(buffer);
      } else {
        image = await pdfDoc.embedJpg(buffer);
      }
    } catch {
      // Fallback: render image through canvas to jpg
      const bmp = await createImageBitmap(new Blob([buffer]));
      const cvs = document.createElement("canvas");
      cvs.width = bmp.width;
      cvs.height = bmp.height;
      const ctx = cvs.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      const jpgBlob = await new Promise((r) => cvs.toBlob(r, "image/jpeg", 0.95));
      image = await pdfDoc.embedJpg(await jpgBlob.arrayBuffer());
    }

    const imgDims = image.scale(1);
    const availWidth = pWidth - margin * 2;
    const availHeight = pHeight - margin * 2;

    const scaleFactor = Math.min(availWidth / imgDims.width, availHeight / imgDims.height);
    const finalWidth = imgDims.width * scaleFactor;
    const finalHeight = imgDims.height * scaleFactor;

    // Centered placement
    const x = (pWidth - finalWidth) / 2;
    const y = (pHeight - finalHeight) / 2;

    const page = pdfDoc.addPage([pWidth, pHeight]);
    page.drawImage(image, {
      x,
      y,
      width: finalWidth,
      height: finalHeight
    });
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    blob,
    size: blob.size,
    url: URL.createObjectURL(blob),
    pageCount: files.length
  };
}

// Aliases for convenience
export const convertImagesToPdf = imagesToPdf;
export const renderPdfPagesToImages = renderPdfPages;
export const rotatePdfPages = rotatePdf;

/**
 * Organizes PDF with page operations array [{ sourceIndex, rotation }]
 */
export async function organizePdf(file, pageOperations = []) {
  const pageOrder = pageOperations.map(p => p.sourceIndex);
  const rotationMap = {};
  pageOperations.forEach((p, idx) => {
    if (p.rotation) {
      rotationMap[p.sourceIndex] = p.rotation;
    }
  });
  return organizePdfPages(file, { pageOrder, rotationMap });
}

