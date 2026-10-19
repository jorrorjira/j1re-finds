# Verification

## Restored catalog layout (current)

- Original Thai page body and section order from `0469f1f` restored; only the illustration's colour description changed. No testimonial, pricing or extra marketing sections.
- Compared 259 layout declarations with the original CSS: only product-button inner horizontal padding differs. The existing hero SVG shapes/coordinates are unchanged; its colour values were updated. All four original product image bytes and affiliate URLs are unchanged.
- `node --test tests/*.test.mjs`: 5 passing tests. Restored-layout assertions failed before implementation. Text-token contrast is at least 7:1; this is not a full WCAG AAA certification.
- `tests/landing.browser.mjs`: 32 local-browser checks passed, with zero runtime exceptions. Original section/column layout, four brands/URLs/images, search, empty/reset, share fallback, network failure/retry and overflow at 1440/1024/768/390/320px are covered. A desktop heading-wrap regression followed red/green; 16px Arial keeps the original single-line product titles.
- Native pointer clicks passed for the hero CTA, Logitech filter and reset to all products. Exact 700/701px and 1000/1001px breakpoints passed overflow/column checks. Evidence: `D:/Projects/j1re-qa/restore-browser.json`, `restore-pointer-breakpoints.json`, `restore-layout-evidence.json`.
- Actual 1440px desktop and 390px mobile pages were visually inspected through scaled iframe viewports and native-window captures. Mobile capture shows consecutive top/bottom portions. Evidence: `restore-desktop-native.png`, `restore-mobile-native.png` in the same QA directory. Direct CDP full-page screenshot capture timed out; native captures are not browser full-page screenshots. No physical mobile devices tested.

## Previous Swiss redesign (superseded)

- `node --test tests/*.test.mjs`: 5 tests pass, including all original URLs in order, English page content and AAA text-token contrast (at least 7:1) in light and dark themes.
- `node --check app.mjs` and `git diff --check`: pass.
- `tests/landing.browser.mjs`: 41 checks passed in the real local browser. Covers all four brand filters and footer filters, original URLs and images, search, empty/reset, light/dark, dialogs and restored focus, clipboard-denied fallback, mobile menu, network failure/retry, and overflow/clipping at 1440, 1024, 768, 390 and 320 CSS pixels.
- Result: `D:/Projects/j1re-qa/swiss-browser.json`. The strengthened footer regression test also starts from a different category and a nonmatching query; the final rerun used native keyboard focus/Enter activation. Tests cover UI text; original product-listing images are retained without editing their artwork.
- Visual review: native-window captures of actual 1440px desktop and 390px mobile iframe viewports, scaled for inspection. Hero, collection, testimonial layout, pricing and footer were inspected. Evidence: `D:/Projects/j1re-qa/swiss-*-native.png`. Direct browser full-page screenshot capture timed out; these are cropped native-window captures, not full-page browser screenshots.
- AAA verification here is for text contrast, not a certification of complete WCAG AAA conformance. No physical mobile devices were tested.

## Original release evidence (before Swiss redesign)

- Production: https://j1re-finds.pages.dev/ on Cloudflare Pages, connected to `jorrorjira/j1re-finds`, branch `main`, automatic deployments enabled.
- The deployment command was exercised locally: only runtime files and `assets/` are copied to `dist/`; tests and docs are excluded.
- `node --test tests/*.test.mjs`: 4 tests pass. `node --check app.mjs` and `node --check catalog.mjs`: pass.
- Production indexing check followed red/green: the new assertion failed against the preview noindex meta tag, then passed after removing it.
- Live browser: 14 assertions pass, recorded in `D:/Projects/j1re-qa/cloudflare-live-browser.json`: each original affiliate URL, sponsored/noopener/noreferrer and new-tab behavior, image loading, each brand filter, model/number search, empty/reset states, desktop overflow.
- Live desktop and 390px mobile screenshots were captured and visually inspected: `D:/Projects/j1re-qa/cloudflare-live-desktop.png` and `cloudflare-live-mobile.png`. No horizontal overflow at 390px; all four product photos load with contain framing.

## Catalog integrity

- Product order: ATK Phantom ULTIMATE; Logitech G PRO X3 SUPERSTRIKE; Ninjutso Sora V3; RAWM LEVIATHAN V4 GT.
- Original short URLs remain unchanged in the catalog and rendered hrefs; expanded redirects do not replace affiliate links.
- Source image URLs are retained in each record. No fixed prices, sales counts, review scores or claims of personal use were added. RAWM visitors are asked to check dispatch timing.

## Limits of verification

- Commission attribution and eligibility must be checked in the owner's Shopee Affiliate account; preserving a link does not prove attribution.
- No purchases, add-to-cart actions, price/stock/warranty or official-brand authenticity verification were performed.
- No custom domain or paid add-on was configured. No actual iPhone/Android hardware was used.
