import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

test('New palette keeps text at AAA contrast on the original layout', () => {
  const css = readFileSync(new URL('styles.css', root), 'utf8');
  const luminance = hex => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  for (const selector of [':root']) {
    const start = css.indexOf(selector);
    assert.ok(start >= 0, selector);
    const block = css.slice(start, css.indexOf('}', start));
    const tokens = Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[a-fA-F0-9]{6})/g)].map(m => [m[1], m[2]]));
    for (const [fg, bg] of [['ink', 'canvas'], ['ink', 'surface'], ['muted', 'canvas'], ['muted', 'surface'], ['accent-color', 'canvas'], ['accent-color', 'surface'], ['on-accent', 'accent-color']]) {
      assert.ok(tokens[fg] && tokens[bg], `${selector}: ${fg}/${bg} tokens`);
      const [a, b] = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => b - a);
      const ratio = (a + .05) / (b + .05);
      assert.ok(ratio >= 7, `${selector}: ${fg}/${bg} = ${ratio.toFixed(2)} (AAA needs 7)`);
    }
  }
  assert.match(css, /grid-template-columns:1fr 1fr/);
  assert.match(css, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(css, /(?:linear|radial)-gradient\(/);
});

test('Y2K decorations are local original vectors with noninteractive placement', () => {
  const hero = readFileSync(new URL('assets/hero.svg', root), 'utf8');
  assert.ok(hero.includes('id="y2k-orbit"') && hero.includes('id="y2k-spark"'), 'Original Y2K orbit and spark exist');
  const speed = readFileSync(new URL('assets/y2k-speed.svg', root), 'utf8');
  assert.match(speed, /<svg[^>]+viewBox=/);
  assert.doesNotMatch(speed, /<script|<image|<foreignObject|(?:href|src)=/);
  const css = readFileSync(new URL('styles.css', root), 'utf8');
  assert.match(css, /\.about::after\{[^}]*position:absolute[^}]*pointer-events:none/);
  assert.match(css, /@media\(max-width:1000px\)\{\.about::after\{display:none\}/);
});

const data = JSON.parse(readFileSync(new URL('products.json', root), 'utf8'));
test('four supplied affiliate URLs are preserved in order with real catalog entries', () => {
  assert.deepEqual(data.products.map(p => p.url), [
    'https://s.shopee.co.th/7AeS06RQfd',
    'https://s.shopee.co.th/4LKGcvhFdP',
    'https://s.shopee.co.th/4qGXDsHAME',
    'https://s.shopee.co.th/W7Y3vuHxE',
  ]);
  assert.equal(new Set(data.products.map(p => p.id)).size, data.products.length);
  for (const p of data.products) {
    assert.match(p.id, /^\d{3}$/);
    assert.ok(p.name.trim());
    assert.ok(data.categories.some(c => c.id === p.category));
    assert.ok(existsSync(fileURLToPath(new URL(p.image, root))), p.image);
    assert.equal(p.demo, false);
    assert.match(p.image, /\.webp$/);
    assert.match(p.url, /^https:\/\/s\.shopee\.co\.th\/[A-Za-z0-9]+$/);
  }
});
test('all HTML assets are relative and exist, with a labeled mobile share button', () => {
  const html = readFileSync(new URL('index.html', root), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]*)"/g)) {
    assert.ok(existsSync(fileURLToPath(new URL(match[1],root))), match[1]);
  }
  assert.match(html, /id="share"[^>]*aria-label="แชร์หน้านี้"/);
  assert.match(html, /rel="icon"/);
  assert.match(html, /<html lang="th"/);
  assert.deepEqual([...html.matchAll(/<section\b[^>]*class="([^"]+)"/g)].map(m => m[1]), ['hero', 'finds', 'about']);
  assert.match(html, /class="page-wrap"/);
  assert.ok(html.includes('<span class="small-spark" aria-hidden="true"><img src="./assets/j-mark.png" width="23" height="23" alt=""></span>') && !html.includes('✳'), 'Handwritten J replaces the decorative star');
  assert.match(html, /ของน่าใช้<br>ที่อยาก/);
  assert.match(html, /src="\.\/assets\/hero\.svg"/);
  assert.doesNotMatch(html, /id="(?:features|testimonials|pricing|final-cta|theme-toggle|nav-toggle)"/);
  assert.match(html, /property="og:image"/);
  for (const product of data.products) assert.match(product.description, /[\u0E00-\u0E7F]/);
  assert.doesNotMatch(html, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i);
});
