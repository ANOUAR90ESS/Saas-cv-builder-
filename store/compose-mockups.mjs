// Composites real app screenshots into device-frame marketing mockups (phone /
// tablet bezel, browser window) on a dark gradient background, for the Play
// Store listing. Source images come from capture-screenshots.mjs and
// capture-template-mockups.mjs — this script only lays them out.
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'screenshots', 'mockups');
fs.mkdirSync(OUT, { recursive: true });

function b64(relPath) {
  const data = fs.readFileSync(path.join(ROOT, relPath));
  return `data:image/png;base64,${data.toString('base64')}`;
}

const BG = `radial-gradient(ellipse 900px 700px at 50% 42%, #24304a 0%, #16202f 45%, #0a0f1a 100%)`;

function phoneFrameHtml(imgSrc, { canvasW, canvasH, screenW, screenH }) {
  return `<!doctype html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:${canvasW}px;height:${canvasH}px;background:${BG};display:flex;align-items:center;justify-content:center;font-family:sans-serif;}
    .device{position:relative;width:${screenW + 28}px;height:${screenH + 96}px;background:linear-gradient(155deg,#2a3244,#0c0f16);border-radius:52px;box-shadow:0 40px 90px -20px rgba(0,0,0,.65), 0 0 0 2px rgba(255,255,255,.04) inset;padding:14px;}
    .notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:120px;height:24px;background:#0c0f16;border-radius:14px;z-index:2;}
    .screen{width:100%;height:100%;border-radius:38px;overflow:hidden;background:#fff;}
    .screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
  </style></head><body>
    <div class="device"><div class="notch"></div><div class="screen"><img src="${imgSrc}"/></div></div>
  </body></html>`;
}

function tabletFrameHtml(imgSrc, { canvasW, canvasH, screenW, screenH }) {
  return `<!doctype html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:${canvasW}px;height:${canvasH}px;background:${BG};display:flex;align-items:center;justify-content:center;font-family:sans-serif;}
    .device{position:relative;width:${screenW + 44}px;height:${screenH + 44}px;background:linear-gradient(155deg,#2a3244,#0c0f16);border-radius:34px;box-shadow:0 40px 90px -20px rgba(0,0,0,.65), 0 0 0 2px rgba(255,255,255,.04) inset;padding:22px;}
    .cam{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:7px;height:7px;border-radius:50%;background:#333;}
    .screen{width:100%;height:100%;border-radius:14px;overflow:hidden;background:#fff;}
    .screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
  </style></head><body>
    <div class="device"><div class="cam"></div><div class="screen"><img src="${imgSrc}"/></div></div>
  </body></html>`;
}

function desktopFrameHtml(imgSrc, { canvasW, canvasH, screenW, screenH }) {
  return `<!doctype html><html><head><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:${canvasW}px;height:${canvasH}px;background:${BG};display:flex;align-items:center;justify-content:center;font-family:sans-serif;}
    .device{width:${screenW}px;border-radius:14px;overflow:hidden;box-shadow:0 40px 90px -20px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.06);}
    .bar{height:38px;background:#1b2231;display:flex;align-items:center;gap:7px;padding:0 16px;}
    .dot{width:11px;height:11px;border-radius:50%;}
    .r{background:#ff5f57;} .y{background:#febc2e;} .g{background:#28c840;}
    .screen{width:${screenW}px;height:${screenH}px;background:#fff;overflow:hidden;}
    .screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}
  </style></head><body>
    <div class="device">
      <div class="bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
      <div class="screen"><img src="${imgSrc}"/></div>
    </div>
  </body></html>`;
}

const PHONE_QUICK = { canvasW: 1200, canvasH: 1500, screenW: 620, screenH: 1103 };
const PHONE_TEMPLATE = { canvasW: 1200, canvasH: 1500, screenW: 620, screenH: 878 };
const TABLET = { canvasW: 2000, canvasH: 1400, screenW: 1500, screenH: 1125 };
const DESKTOP = { canvasW: 2000, canvasH: 1250, screenW: 1560, screenH: 878 };

const JOBS = [
  // Reused for both the "quick mockups" section and the phone device-format set.
  { out: 'editor-preview-phone.png', src: 'screenshots/phone/04-builder-preview.png', dims: PHONE_QUICK, frame: phoneFrameHtml },
  { out: 'template-modern.png', src: 'screenshots/templates/modern.png', dims: PHONE_TEMPLATE, frame: phoneFrameHtml },
  { out: 'template-ats.png', src: 'screenshots/templates/ats.png', dims: PHONE_TEMPLATE, frame: phoneFrameHtml },
  { out: 'template-executive.png', src: 'screenshots/templates/executive.png', dims: PHONE_TEMPLATE, frame: phoneFrameHtml },
  { out: 'templates-gallery-phone.png', src: 'screenshots/phone/02-templates.png', dims: PHONE_QUICK, frame: phoneFrameHtml },
  { out: 'builder-tablet.png', src: 'screenshots/tablet/04-builder-edit.png', dims: TABLET, frame: tabletFrameHtml },
  { out: 'templates-gallery-tablet.png', src: 'screenshots/tablet/03-templates.png', dims: TABLET, frame: tabletFrameHtml },
  { out: 'builder-desktop.png', src: 'screenshots/desktop/04-builder-edit.png', dims: DESKTOP, frame: desktopFrameHtml },
  { out: 'home-desktop.png', src: 'screenshots/desktop/01-home-hero.png', dims: DESKTOP, frame: desktopFrameHtml },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const job of JOBS) {
  const html = job.frame(b64(job.src), job.dims);
  const tmp = path.join(OUT, `_tmp-${job.out}.html`);
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: job.dims.canvasW, height: job.dims.canvasH }, deviceScaleFactor: 2 });
  await page.goto('file://' + tmp.replace(/\\/g, '/'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, job.out) });
  await page.close();
  fs.unlinkSync(tmp);
  console.log(`mockups/${job.out}`);
}
await browser.close();
