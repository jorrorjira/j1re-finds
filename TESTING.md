# Verification

## Current gallery release

- `node --test tests/*.test.mjs`: local tests cover exact original URLs, IDs, local assets, accessible markup, colour data, responsive colour tokens, supplied hero, CTA placement and removal of preview-only indexing/copy.
- `tests/landing.browser.mjs` exports `verifyLanding(page)` for the current page: filters, searches, empty/reset, share fallback, retry, loaded covers and responsive layouts.
- `tests/product.browser.mjs` exports `verifyGallery(page, product, base)` for a local or public base URL. It exercises every colour/view, exact affiliate href, zoom/Escape/focus, keyboard colour selection, CTA placement and responsive overflow.
- Runtime images preserve their aspect ratios. The gallery consists of 70 images across 12 colours for the four original products.
- The isolated preview passed gallery verification before promotion. Publication must additionally be checked against the actual Cloudflare build and live URLs; preview success alone is not deployment proof.
- The publication command in README copies only runtime files and assets to `dist`; source registries, tests, docs and QA output are excluded.

## Verification limits

- Browser mobile emulation is not physical-device testing or full accessibility certification.
- Original tracking URLs are preserved; commission attribution must be checked in the owner's affiliate account.
- No purchases, cart actions, stock, pricing, warranty, official colour authenticity or image-licence verification is implied.
- Older catalog/Swiss-layout verification reports describe superseded versions, not the current gallery release.
