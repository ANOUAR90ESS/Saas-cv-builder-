// Captures a clean, chrome-free resume crop for a few templates, used as the
// source image for the marketing device-frame mockups (see compose-mockups.mjs).
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots', 'templates');
fs.mkdirSync(OUT, { recursive: true });

const TEMPLATES = [
  { id: 'modern', name: 'Modern' },
  { id: 'ats', name: 'ATS Friendly' },
  { id: 'executive', name: 'Executive' },
];

const browser = await chromium.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 3 });

async function dismissDialogs(page) {
  try {
    const acceptAll = page.getByRole('button', { name: 'Accept all' });
    if (await acceptAll.count()) { await acceptAll.first().click({ timeout: 3000 }); await page.waitForTimeout(500); }
  } catch { /* no dialog */ }
  try {
    const startBuilding = page.getByRole('button', { name: 'Start building' });
    if (await startBuilding.count()) { await startBuilding.first().click({ timeout: 3000 }); await page.waitForTimeout(500); }
  } catch { /* no dialog */ }
}

for (const t of TEMPLATES) {
  const page = await ctx.newPage();
  await page.goto(BASE + '/templates', { waitUntil: 'networkidle', timeout: 60000 });
  await dismissDialogs(page);

  const card = page.locator('div.group', { has: page.getByRole('heading', { name: t.name, exact: true }) }).first();
  await card.getByRole('button', { name: 'Use this template' }).click();
  await page.waitForURL('**/builder', { timeout: 15000 });
  // The welcome guide opens from a post-mount effect, slightly after navigation.
  await page.waitForTimeout(1500);
  await dismissDialogs(page);

  const preview = page.getByRole('button', { name: 'Preview' });
  if (await preview.count()) { await preview.first().click({ timeout: 5000 }); }
  await page.waitForTimeout(1200);

  try {
    const resume = page.locator('.cv-shadow').last();
    await resume.waitFor({ state: 'visible', timeout: 10000 });
    await resume.screenshot({ path: path.join(OUT, `${t.id}.png`) });
    console.log(`templates/${t.id}.png`);
  } catch (e) {
    console.log(`  ! resume crop failed for ${t.id}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

await ctx.close();
await browser.close();
