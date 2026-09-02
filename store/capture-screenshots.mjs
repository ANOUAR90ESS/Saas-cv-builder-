import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots');
// Leave unset to use Playwright's own Chromium download.
const EXE = process.env.CHROMIUM_PATH || undefined;

const DEVICES = {
  phone:   { viewport: { width: 360,  height: 640  }, deviceScaleFactor: 3, isMobile: true,  hasTouch: true  }, // -> 1080x1920
  // Landscape: the builder's split view and A4 preview fill the frame, where a
  // portrait tablet leaves the lower third empty.
  tablet:  { viewport: { width: 1366, height: 1024 }, deviceScaleFactor: 2, isMobile: false, hasTouch: true  }, // -> 2732x2048
  desktop: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false }, // -> 1920x1080
};

const GRID = 'div.grid.sm\\:grid-cols-2';

const SHOTS = {
  phone: [
    { name: '01-home-hero',         url: '/',            scrollY: 55 },
    { name: '02-templates',         url: '/templates' },
    { name: '03-builder-edit',      url: '/builder' },
    { name: '04-builder-preview',   url: '/builder',     click: 'Preview' },
    { name: '05-cv-examples',       url: '/cv-examples' },
  ],
  tablet: [
    { name: '01-home-hero',         url: '/' },
    { name: '02-home-features',     url: '/',            alignText: 'Why use DexaCV?' },
    { name: '03-templates',         url: '/templates',   align: GRID },
    { name: '04-builder-edit',      url: '/builder' },
    { name: '05-builder-templates', url: '/builder',     click: 'Template' },
    { name: '06-featured-templates', url: '/featured-templates' },
  ],
  desktop: [
    { name: '01-home-hero',         url: '/' },
    { name: '02-home-features',     url: '/',            alignText: 'Why use DexaCV?' },
    { name: '03-templates',         url: '/templates',   align: GRID },
    { name: '04-builder-edit',      url: '/builder' },
    { name: '05-builder-templates', url: '/builder',     click: 'Template' },
    { name: '06-featured-templates', url: '/featured-templates' },
  ],
};

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--font-render-hinting=none'] });

const only = process.argv[2];
for (const [device, shots] of Object.entries(SHOTS)) {
  if (only && device !== only) continue;
  const ctx = await browser.newContext(DEVICES[device]);
  for (const shot of shots) {
    const page = await ctx.newPage();
    await page.goto(BASE + shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500);

    // Dismiss the cookie-consent dialog if it appeared.
    try {
      const acceptAll = page.getByRole('button', { name: 'Accept all' });
      if (await acceptAll.count()) { await acceptAll.first().click({ timeout: 3000 }); await page.waitForTimeout(800); }
    } catch { /* no dialog */ }

    // Dismiss the builder's first-visit welcome guide if it appeared.
    try {
      const startBuilding = page.getByRole('button', { name: 'Start building' });
      if (await startBuilding.count()) { await startBuilding.first().click({ timeout: 3000 }); await page.waitForTimeout(800); }
    } catch { /* no dialog */ }

    if (shot.click) {
      try { await page.getByText(shot.click, { exact: true }).first().click({ timeout: 8000 }); await page.waitForTimeout(1800); }
      catch (e) { console.log(`  ! click "${shot.click}" failed`); }
    }

    if (shot.alignText) {
      const ok = await page.evaluate((txt) => {
        const el = Array.from(document.querySelectorAll('h2')).find((h) => h.innerText.trim() === txt);
        if (!el) return false;
        const h = document.querySelector('header')?.getBoundingClientRect().height || 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h - 48, behavior: 'instant' });
        return true;
      }, shot.alignText);
      if (!ok) console.log(`  ! heading "${shot.alignText}" not found for ${shot.name}`);
    } else if (shot.align) {
      const ok = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const h = document.querySelector('header')?.getBoundingClientRect().height || 0;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h - 12, behavior: 'instant' });
        return true;
      }, shot.align);
      if (!ok) console.log(`  ! align selector not found for ${shot.name}`);
    } else if (shot.scrollY) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), shot.scrollY);
    }
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(OUT, device, `${shot.name}.png`) });
    console.log(`${device}/${shot.name}.png`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
