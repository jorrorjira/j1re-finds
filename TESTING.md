# Verification

## Current catalog: four real affiliate links

- All four supplied short URLs returned redirects to Shopee product pages. Opened those pages in the existing browser session and read the product names and lead images.
- Product order: ATK Phantom ULTIMATE; Logitech G PRO X3 SUPERSTRIKE; Ninjutso Sora V3; RAWM LEVIATHAN V4 GT.
- Original short URLs are preserved byte-for-byte in products.json and rendered href attributes. Expanded redirects are not used as the affiliate links.
- `node --test tests/*.test.mjs`: 4 tests pass. `node --check app.mjs`: passes.
- Browser checks: 10 assertions pass, saved at `D:/Projects/j1re-qa/real-products-checks.json`. Covered all four brand filters, model/number search, absence of sample entries, original URL order, sponsored/noopener/noreferrer, new-tab behavior, and no horizontal overflow at 390px.
- Downloaded real product photos were inspected in `D:/Projects/j1re-qa/real-product-images.jpg`. Source image URLs are kept in each product's imageSource field. Square contain framing avoids cropping the listing artwork.
- No static prices, sales counts, review scores or claims of personal use were added. RAWM's seller title says COMING; its card asks visitors to check dispatch timing.

## Visual QA limitation

The original demo's desktop and 390px screenshots were inspected in the previous pass. Current product photos were inspected separately; the current catalog's responsive layout, image loading and contain framing were verified in the browser DOM. EGO screenshot capture timed out for the updated page, including the mobile wrapper and a clipped capture. No successful new full-page screenshot is claimed. The user-facing local preview contains the updated site.

## Not verified / not deployed

- Affiliate attribution and commission eligibility require checking through the owner's Shopee Affiliate account. Preserving a link does not prove commission attribution.
- No purchase or add-to-cart operation was performed. No price, stock, warranty or official-brand authenticity verification is claimed.
- No public website deployment, custom domain or Cloudflare project has been created. Uploading source code to GitHub does not deploy the website.
- Actual iPhone/Android hardware was not used.
- `tests/viewports.html` is a local QA wrapper and is excluded from the handoff ZIP.
