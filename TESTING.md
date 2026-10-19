# Verification

## Public deployment

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
