import test from 'node:test';
import assert from 'node:assert/strict';
import * as catalog from '../catalog.mjs';

const items = [
  { id: '001', name: 'โคมไฟตั้งโต๊ะ', category: 'desk', tags: ['lamp', 'แสง'] },
  { id: '002', name: 'หูฟังไร้สาย', category: 'tech', tags: ['Headphones'] },
];

test('search matches Thai names, English tags and product numbers within a category', () => {
  assert.equal(typeof catalog.filterProducts, 'function');
  assert.deepEqual(catalog.filterProducts(items, { query: ' โต๊ะ ', category: 'all' }), [items[0]]);
  assert.deepEqual(catalog.filterProducts(items, { query: 'HEADPHONES', category: 'tech' }), [items[1]]);
  assert.deepEqual(catalog.filterProducts(items, { query: '002', category: 'all' }), [items[1]]);
  assert.deepEqual(catalog.filterProducts(items, { query: 'โต๊ะ', category: 'tech' }), []);
  assert.deepEqual(catalog.filterProducts(items, { query: '', category: 'all' }), items);
  assert.deepEqual(catalog.filterProducts([], {}), []);
});

test('affiliate URLs accept only HTTPS Shopee hosts and preserve the exact tracking URL', () => {
  assert.equal(typeof catalog.affiliateHref, 'function');
  for (const url of ['https://s.shopee.co.th/EXAMPLE?src=a%2Fb&x=1', 'https://shope.ee/EXAMPLE', 'https://shopee.co.th/product/1/2']) {
    assert.equal(catalog.affiliateHref({ url, demo: false }), url);
    assert.equal(catalog.affiliateHref({ url, demo: true }), null);
  }
  for (const url of ['', ' https://shope.ee/a', 'https://shope.ee/a ', 'http://shope.ee/a', 'javascript:alert(1)', 'https://shopee.co.th.evil.com/a', 'https://user@shope.ee/a', 'https://shope.ee:444/a', 'https://evil.com', null]) {
    assert.equal(catalog.affiliateHref({ url }), null);
  }
});
