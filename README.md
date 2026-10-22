# j1re — รวมพิกัดเมาส์

Static Thai Shopee Affiliate catalog: HTML, CSS and JavaScript, without a framework or runtime dependencies.

- Live: https://j1re-finds.pages.dev/
- Four original products and tracking URLs remain in `products.json`.
- Cards open `product.html?id=001` through `004`: colour images, multiple angles, zoom, then the original Shopee CTA directly beneath colour choices.
- Colour selection only changes the displayed image; it does not select a Shopee variant or confirm shop stock.
- The supplied hero is displayed at its full aspect ratio. Gallery assets are white-background/transparent source derivatives, not generated replacements.
- Supplied Logitech/RAWM images are not represented as verified official photographs. Additional Sora V3 black/pink imagery was sourced from Ninjutso. Image provenance does not establish licensing.
- No fixed prices, checkout, backend, analytics or personal data collection.

## Local use

```sh
python -m http.server 4173 --bind 127.0.0.1
node --test tests/*.test.mjs
```

Open http://127.0.0.1:4173/ rather than `file://` so catalog fetches work.

## Publish

Cloudflare Pages project `j1re-finds`, GitHub repository `jorrorjira/j1re-finds`, branch `main`, framework None, root directory empty, output directory `dist`.

```sh
mkdir -p dist && cp index.html product.html styles.css app.mjs product.mjs catalog.mjs products.json dist/ && cp -R assets dist/
```

This allowlist excludes tests, documentation, QA files and the private source-path registry. Only runtime files and `assets/` are published. Push to `main` triggers the existing deployment. No paid infrastructure or custom domain is required.

## Update content

Edit `products.json`; preserve IDs, original tracking URLs and substantiated descriptions. `variants` contains source-labelled colours and local gallery images; `cover` is the listing image. Use licensed assets, preserve aspect ratio, and do not infer official stock or authenticity. Local fonts retain their SIL Open Font License in `assets/fonts/OFL.txt`.

Run unit/browser checks before publishing; verify the public site after deployment. Link preservation does not verify commission attribution. Do not commit credentials, private source paths or account data.
