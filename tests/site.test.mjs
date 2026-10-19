import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
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
  assert.match(html, /noindex, nofollow/);
});
