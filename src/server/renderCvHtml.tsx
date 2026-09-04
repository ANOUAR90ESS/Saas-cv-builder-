import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import TemplateRenderer from '@/components/cv/TemplateRenderer';

// The CV as a complete, self-contained HTML document, ready for Chromium to
// print.
//
// The templates are plain React components over `cv` -- the same ones the
// on-screen preview uses -- so the server renders the identical tree. This is
// what keeps a server export from drifting away from what the user was looking
// at when they paid: there is one set of templates, not a browser set and a
// server set.

const A4_WIDTH_PX = 794; // 210mm at 96dpi, matching the on-screen page

/**
 * The app's compiled stylesheet.
 *
 * Read from dist at run time rather than imported, because the styles are
 * Tailwind output produced by the client build and there is no meaningful way
 * to reach them from a Node bundle. Cached after the first read: it is a
 * hundred kilobytes and it cannot change without a redeploy.
 */
let cachedCss: string | null = null;

function appCss(): string {
  if (cachedCss != null) return cachedCss;
  try {
    const dir = path.join(process.cwd(), 'dist', 'assets');
    const file = fs.readdirSync(dir).find((f) => f.endsWith('.css'));
    cachedCss = file ? fs.readFileSync(path.join(dir, file), 'utf8') : '';
  } catch {
    // Missing dist means `npm run build` has not run. The PDF would come out
    // unstyled, which is worse than an honest failure, so the caller checks.
    cachedCss = '';
  }
  if (!cachedCss) {
    console.error(
      '[export] no stylesheet found in dist/assets. Run `npm run build` before serving exports.'
    );
  }
  return cachedCss;
}

export function hasStylesheet(): boolean {
  return appCss().length > 0;
}

/** The fonts the templates can ask for, same list the app loads. */
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800' +
  '&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800' +
  '&family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800' +
  '&family=Archivo:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700' +
  '&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700' +
  '&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Lora:wght@400;500;600' +
  '&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700' +
  '&family=DM+Serif+Display:wght@400&family=Playfair+Display:wght@500;600;700' +
  '&family=JetBrains+Mono:wght@400;500&family=Noto+Naskh+Arabic:wght@400;500;600;700' +
  '&display=swap';

export function renderCvHtml(cv: any): string {
  const markup = renderToStaticMarkup(React.createElement(TemplateRenderer, { cv }));

  return `<!doctype html>
<html lang="${escapeAttr(cv?.language || 'en')}">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${FONTS_HREF}" />
<style>${appCss()}</style>
<style>
  /* The .cv-print-root wrapper is not decoration. index.css carries the app's
     print rules, and they hide everything on the page except that class --
     written for the browser's own Print button, where the CV sits inside the
     whole builder UI. Without the wrapper this document renders perfectly on
     screen and prints a blank page, which is exactly how it failed the first
     time. Reusing those rules also means a change to how a CV prints is made
     once and applies to both paths.

     Print geometry. The page box is A4 with no margin because the templates
     draw their own; a margin here would inset designs that bleed to the edge. */
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { width: ${A4_WIDTH_PX}px; }
  /* Chromium drops backgrounds when printing unless asked; the templates are
     mostly colour, so this is not optional. */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head>
<body><div class="cv-print-root">${markup}</div></body>
</html>`;
}

function escapeAttr(v: string): string {
  return String(v).replace(/[<>"'&]/g, (c) => `&#${c.charCodeAt(0)};`);
}
