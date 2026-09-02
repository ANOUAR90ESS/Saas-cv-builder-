# Store publishing assets

Screenshots and localized store copy for publishing DexaCV.

## Contents

```
store/
├── capture-screenshots.mjs      # Playwright script that regenerates every screenshot
├── listings/
│   ├── en.md                    # English  — name, subtitle, short/full description, keywords, captions
│   ├── ar.md                    # العربية
│   ├── fr.md                    # Français
│   └── es.md                    # Español
└── screenshots/
    ├── phone/    01…05          # 5 shots — 1080 × 1920 (9:16 portrait)
    ├── tablet/   01…06          # 6 shots — 2732 × 2048 (4:3 landscape)
    └── desktop/  01…06          # 6 shots — 1920 × 1080 (16:9)
```

## Screenshot sizes

| Form factor | Output      | Captured at            | Accepted by |
|-------------|-------------|------------------------|-------------|
| Phone       | 1080 × 1920 | 360 × 640 CSS @3x      | Google Play phone (9:16, within the 320–3840 px range) |
| Tablet      | 2732 × 2048 | 1366 × 1024 CSS @2x    | Google Play 10-inch tablet; also the exact App Store iPad Pro 12.9" landscape size |
| Desktop     | 1920 × 1080 | 1920 × 1080 CSS @1x    | Google Play Chromebook/desktop (16:9); Microsoft Store desktop |

Tablet shots are landscape on purpose: the builder's split view and A4 preview fill the frame,
where a portrait tablet leaves the lower third of the shot empty. The header nav itself now
works correctly in portrait (see "Resolved before publishing" below), so this is a framing
choice rather than a workaround.

## Shot list

**Phone (5)** — home hero · template gallery · builder (edit) · builder (live preview) · CV examples
**Tablet (6)** — home hero · feature grid · template gallery · builder split view · in-builder template picker · Mock Interview Coach
**Desktop (6)** — same six as tablet

Caption text for every shot, in all four languages, is in `listings/*.md`.

## Regenerating the screenshots

```bash
npm install
npm run dev                      # serves on http://localhost:5173
node store/capture-screenshots.mjs           # all three form factors
node store/capture-screenshots.mjs phone     # one form factor only
```

The script needs the `playwright` package. It uses Playwright's own Chromium by default; set
`CHROMIUM_PATH` to point at another binary, or `BASE_URL` to capture a different origin. The
builder pages seed themselves with the demo CV from
`src/lib/cvSchema.js`, so no login or backend data is required.

## Resolved before publishing

All three issues found during the first screenshot pass have been fixed in the app, and the
screenshots above were re-captured afterwards.

1. **Pricing copy now matches the product.** The app previously advertised "Free forever",
   "100% free CV builder" and "no hidden upgrade wall" while `PayDownloadDialog` charged €0.99
   for every PDF and DOCX export. The pay-per-download model is intentional — a one-time charge
   suits people who need a CV once and do not want a subscription — so the copy was corrected to
   match it rather than the paywall being removed. Updated in all four languages across the hero
   badge, hero text, feature grid, calls to action and footer (`src/lib/i18n.jsx`), the eight SEO
   landing pages (`src/pages/SeoLanding.jsx`), page-level SEO descriptions, and the meta tags plus
   `schema.org` offer in `index.html` (now `"price": "0.99"`, `"priceCurrency": "EUR"`). The Terms
   of Service were rewritten with explicit Payments, Refunds and Changes-to-pricing sections.

   Remaining declarations are the publisher's to make: the €0.99 export must be declared as an
   in-app purchase in each store's listing, and the Terms text is written in plain language rather
   than reviewed by a lawyer — worth a legal read before launch, particularly the EU withdrawal
   right on immediately delivered digital goods.

2. **The header nav now switches at the right width.** The full nav used to appear at `md:`
   (768 px) but only fits from roughly 1024 px, so labels wrapped and "Get Started" was clipped on
   portrait tablets. `src/components/Layout.jsx` now switches the desktop nav, the desktop actions
   and the mobile tab bar at `lg:` (1024 px), and holds the "AI CV BUILDER" tagline until `xl:`.
   Verified at 768, 900, 1024, 1280 and 1440 px: the header stays 64 px tall with no wrapping and
   nothing overflowing its container.

3. **Mock Interview is now presentable.** The page used to fire the notification-consent dialog on
   load, over an empty panel. `src/pages/MockInterview.jsx` now asks for notification consent only
   when the user actually starts a session — which is also what the stores expect — and the empty
   state explains what the coach does. Starting a session also handles backend failures instead of
   throwing an unhandled rejection. The page is now shot 6 in the tablet and desktop sets.
