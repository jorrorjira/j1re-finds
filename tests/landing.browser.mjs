// Run in ego-browser: import this module, then verifyLanding(task.page('p1')).
import assert from 'node:assert/strict';

export async function verifyLanding(page) {
  const passed = [];
  const check = (condition, label) => { assert.ok(condition, label); passed.push(label); };
  const activate = async selector => { await page.focus(selector); await page.keyboard.press('Enter'); };
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 4);
  check(await page.evaluate(() => document.documentElement.lang === 'th' && [...document.querySelectorAll('main > section')].map(e => e.className).join(',') === 'hero,finds,about'), 'Original Thai hero, collection and about structure');
  const expected = ['https://s.shopee.co.th/7AeS06RQfd', 'https://s.shopee.co.th/4LKGcvhFdP', 'https://s.shopee.co.th/4qGXDsHAME', 'https://s.shopee.co.th/W7Y3vuHxE'];
  const links = await page.evaluate(() => [...document.querySelectorAll('.product-link')].map(a => ({ href: a.href, rel: a.rel, target: a.target, label: a.getAttribute('aria-label') })));
  assert.deepEqual(links.map(a => a.href), expected);
  check(links.every(a => a.rel.includes('sponsored') && a.rel.includes('noopener') && a.rel.includes('noreferrer') && a.target === '_blank' && a.label), 'All four original affiliate links and safe attributes');
  for (const [brand, id] of [['atk', '001'], ['logitech', '002'], ['ninjutso', '003'], ['rawm', '004']]) {
    await activate(`[data-category="${brand}"]`);
    check(await page.evaluate(({ brand, id }) => document.querySelectorAll('.product-card').length === 1 && document.querySelector('.product-card').dataset.productId === id && document.querySelector(`[data-category="${brand}"]`).getAttribute('aria-pressed') === 'true', { brand, id }), `Brand filter: ${brand}`);
  }
  await activate('[data-category="all"]');
  for (const [query, name] of [['003', 'Ninjutso'], ['SUPERSTRIKE', 'Logitech'], ['Phantom', 'ATK']]) {
    await page.fill('#search', query);
    check(await page.evaluate(name => document.querySelectorAll('.product-card').length === 1 && document.querySelector('.product-card h3').textContent.includes(name), name), `Search: ${query}`);
  }
  await page.fill('#search', 'no-such-product-xyz');
  check(await page.evaluate(() => !document.querySelector('#empty-state').hidden && document.querySelectorAll('.product-card').length === 0), 'Empty state');
  await activate('#reset');
  check(await page.evaluate(() => document.querySelectorAll('.product-card').length === 4 && document.activeElement.id === 'search'), 'Reset restores four products and focus');
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('QA: permission denied'); }; });
  await activate('#share');
  check(await page.evaluate(() => document.querySelector('#share-dialog').open && document.activeElement.id === 'share-url' && document.querySelector('#share-url').value === location.origin + location.pathname), 'Share permission-denied fallback selects clean page URL');
  await page.keyboard.press('Escape');
  check(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every(a => a.getAttribute('href') === '#' || document.getElementById(a.hash.slice(1)))), 'Every in-page navigation target exists');
  await page.evaluate(() => document.fonts.ready);
  for (const [width, height] of [[1440, 1000], [1024, 900], [768, 1024], [390, 844], [320, 800]]) {
    await page.cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 701 });
    await page.waitForFunction(w => innerWidth === w, width);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`);
    if (width === 1440) check(await page.evaluate(() => [...document.querySelectorAll('.product-card h3')].every(e => e.clientHeight <= parseFloat(getComputedStyle(e).lineHeight) + 1)), 'Desktop product titles keep the original single-line layout');
    check(await page.evaluate(() => ![...document.querySelectorAll('h1,h2,h3,.primary-button,.product-link,.category-button')].some(e => e.getBoundingClientRect().width && e.scrollWidth > e.clientWidth + 1)), `No clipped headings or controls at ${width}px`);
    check(await page.evaluate(w => getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns.split(' ').length === (w > 1000 ? 4 : 2) && getComputedStyle(document.querySelector('.hero')).gridTemplateColumns.split(' ').length === (w > 700 ? 2 : 1), width), `Original column layout at ${width}px`);
  }
  await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await page.cdp('Network.enable');
  await page.cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await page.cdp('Network.setBlockedURLs', { urls: ['*products.json*'] });
  try {
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#error-state').hidden);
    check(await page.evaluate(() => document.querySelector('#product-grid').getAttribute('aria-busy') === 'false'), 'Catalog network failure is actionable');
  } finally { await page.cdp('Network.setBlockedURLs', { urls: [] }); }
  await activate('#retry');
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 4);
  check(await page.evaluate(() => document.querySelector('#error-state').hidden), 'Catalog retry recovers all four products');
  await page.cdp('Network.setCacheDisabled', { cacheDisabled: false });
  await page.evaluate(() => { document.querySelector('#finds').scrollIntoView({ behavior: 'instant' }); });
  await page.waitForFunction(() => [...document.querySelectorAll('.product-image img')].every(i => i.complete && i.naturalWidth > 0));
  check(await page.evaluate(() => [...document.querySelectorAll('.product-image img')].every(i => i.src.endsWith('.webp'))), 'Four original product images loaded without fallback');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  return { passed: passed.length, checks: passed };
}
