import type { Browser } from 'playwright';
import { renderCvHtml, hasStylesheet } from './renderCvHtml.tsx';

// Server-side file generation.
//
// The export used to run entirely in the browser, which meant the paywall
// could only ever be a question the client asked itself: the file was already
// on the machine that was being asked to pay for it. Generating here is what
// makes the gate real -- the bytes do not exist until the server has decided
// the caller may have them.
//
// It also produces a better file. The browser path rasterised the template and
// drew invisible text over the image so an ATS could read it; Chromium's own
// print produces real vector text with no image and no second pass, so the
// words in the file are the words on the page rather than a copy positioned
// next to them.

const LAUNCH_TIMEOUT_MS = 30_000;
const RENDER_TIMEOUT_MS = 45_000;

/** Where Chromium lives when the image ships one, as this project's does. */
const EXECUTABLE_PATH = process.env.CHROMIUM_PATH || undefined;

let browserPromise: Promise<Browser> | null = null;

/**
 * One browser for the process, launched on first use.
 *
 * Launching per request costs about a second and a lot of memory. A crashed
 * browser is dropped so the next request launches a fresh one rather than
 * failing forever against a dead handle.
 */
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({
        executablePath: EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        timeout: LAUNCH_TIMEOUT_MS,
      });
      browser.on('disconnected', () => {
        browserPromise = null;
      });
      return browser;
    })().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }
  return browserPromise;
}

export class ExportUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportUnavailableError';
  }
}

/** True when this deployment can actually produce files. */
export async function canExportFiles(): Promise<boolean> {
  if (!hasStylesheet()) return false;
  try {
    await getBrowser();
    return true;
  } catch {
    return false;
  }
}

export async function renderPdf(cv: any): Promise<Buffer> {
  if (!hasStylesheet()) {
    throw new ExportUnavailableError('The stylesheet is missing; run the client build.');
  }

  let browser: Browser;
  try {
    browser = await getBrowser();
  } catch (error: any) {
    throw new ExportUnavailableError(`Chromium could not start: ${error?.message ?? error}`);
  }

  const context = await browser.newContext({
    // The page box is set in CSS; this only decides the layout viewport.
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(RENDER_TIMEOUT_MS);
    await page.setContent(renderCvHtml(cv), { waitUntil: 'load' });

    // Without this the first paint can use a fallback face and the printed
    // line breaks describe a layout the reader never sees.
    await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});

    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
  } finally {
    await context.close().catch(() => {});
  }
}

export async function renderDocx(cv: any): Promise<Buffer> {
  // The same builder the browser used. Moving the call rather than
  // reimplementing it is the point: one description of what a CV looks like as
  // a Word document, not a server copy that drifts from the client one.
  const { buildDocxBlob } = await import('@/lib/docxExport');
  const blob: Blob = await buildDocxBlob(cv);
  return Buffer.from(await blob.arrayBuffer());
}

export function exportFileName(cv: any, ext: 'pdf' | 'docx'): string {
  const base = String(cv?.title || 'cv')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80);
  return `${base || 'cv'}.${ext}`;
}
