// Run in ego-browser: import this module, then verifyLanding(task.page('p1')).
import assert from 'node:assert/strict';

export async function verifyLanding(page) {
  const passed = [];
  const check = (condition, label) => { assert.ok(condition, label); passed.push(label); };
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 4);
  await page.click('#theme-toggle');
  check(await page.evaluate(() => document.documentElement.dataset.theme === 'dark' && document.querySelector('#theme-toggle').getAttribute('aria-pressed') === 'true'), 'Dark theme and pressed state');
  await page.click('#theme-toggle');
  check(await page.evaluate(() => document.documentElement.dataset.theme === 'light'), 'Return to light theme');
  check(await page.evaluate(() => !/[\u0E00-\u0E7F]/.test(document.body.innerText)), 'All rendered interface text is English');
  const expected = ['https://s.shopee.co.th/7AeS06RQfd', 'https://s.shopee.co.th/4LKGcvhFdP', 'https://s.shopee.co.th/4qGXDsHAME', 'https://s.shopee.co.th/W7Y3vuHxE'];
  const links = await page.evaluate(() => [...document.querySelectorAll('.product-link')].map(a => ({ href: a.href, rel: a.rel, target: a.target, label: a.getAttribute('aria-label') })));
  assert.deepEqual(links.map(a => a.href), expected);
  check(links.every(a => a.rel.includes('sponsored') && a.rel.includes('noopener') && a.rel.includes('noreferrer') && a.target === '_blank' && a.label), 'All four original affiliate links and safe attributes');
  for (const brand of ['atk', 'logitech', 'ninjutso', 'rawm']) {
    await page.click(`[data-category="${brand}"]`);
    check(await page.evaluate(() => document.querySelectorAll('.product-card').length === 1), `Brand filter: ${brand}`);
    await page.click('[data-category="all"]');
    await page.fill('#search', 'no-such-product-xyz');
    await page.click(`[data-filter-link="${brand}"]`);
    check(await page.evaluate(id => document.querySelector(`[data-category="${id}"]`).getAttribute('aria-pressed') === 'true' && document.querySelectorAll('.product-card').length === 1 && document.querySelector('#search').value === '', brand), `Footer filter: ${brand}`);
  }
  await page.click('[data-category="all"]');
  for (const [query, name] of [['003', 'Ninjutso'], ['SUPERSTRIKE', 'Logitech'], ['Phantom', 'ATK']]) {
    await page.fill('#search', query);
    check(await page.evaluate(name => document.querySelectorAll('.product-card').length === 1 && document.querySelector('.product-card h3').textContent.includes(name), name), `Search: ${query}`);
  }
  await page.fill('#search', 'no-such-product-xyz');
  check(await page.evaluate(() => !document.querySelector('#empty-state').hidden && document.querySelectorAll('.product-card').length === 0), 'Empty state');
  await page.click('#reset');
  check(await page.evaluate(() => document.querySelectorAll('.product-card').length === 4 && document.activeElement.id === 'search'), 'Reset restores four products and focus');
  for (const id of ['privacy', 'terms', 'contact']) {
    await page.click(`[data-dialog="${id}"]`);
    check(await page.evaluate(id => document.getElementById(id).open, id), `Open ${id} dialog`);
    await page.keyboard.press('Escape');
    check(await page.evaluate(id => !document.getElementById(id).open && document.activeElement.dataset.dialog === id, id), `Dismiss ${id} and restore focus`);
  }
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('QA: permission denied'); }; });
  await page.click('#share');
  check(await page.evaluate(() => document.querySelector('#share-dialog').open && document.activeElement.id === 'share-url' && document.querySelector('#share-url').value === location.origin + location.pathname), 'Share permission-denied fallback selects canonical page URL');
  await page.keyboard.press('Escape');
  check(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every(a => document.getElementById(a.hash.slice(1)))), 'Every in-page navigation target exists');
  for (const [width, height] of [[1440, 1000], [1024, 900], [768, 1024], [390, 844], [320, 800]]) {
    await page.cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 761 });
    await page.waitForFunction(w => innerWidth === w, width);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`);
    check(await page.evaluate(() => ![...document.querySelectorAll('h1,h2,h3,.button,.product-link,.category-button')].some(e => e.getBoundingClientRect().width && e.scrollWidth > e.clientWidth + 1)), `No clipped headings or controls at ${width}px`);
    if (width === 390) {
      await page.click('#nav-toggle');
      check(await page.evaluate(() => document.querySelector('#nav-toggle').getAttribute('aria-expanded') === 'true' && getComputedStyle(document.querySelector('#primary-nav')).display !== 'none'), 'Mobile navigation opens');
      await page.click('#primary-nav a[href="#pricing"]');
      check(await page.evaluate(() => document.querySelector('#nav-toggle').getAttribute('aria-expanded') === 'false'), 'Mobile navigation closes after navigation');
      await page.click('#nav-toggle');
      await page.keyboard.press('Escape');
      check(await page.evaluate(() => document.querySelector('#nav-toggle').getAttribute('aria-expanded') === 'false' && document.activeElement.id === 'nav-toggle'), 'Escape closes mobile navigation and restores focus');
    }
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
  await page.focus('#retry');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 4);
  check(await page.evaluate(() => document.querySelector('#error-state').hidden), 'Catalog retry recovers all four products');
  await page.cdp('Network.setCacheDisabled', { cacheDisabled: false });
  await page.evaluate(() => { document.querySelector('#finds').scrollIntoView({ behavior: 'instant' }); });
  await page.waitForFunction(() => [...document.querySelectorAll('.product-image img')].every(i => i.complete && i.naturalWidth > 0));
  check(await page.evaluate(() => [...document.querySelectorAll('.product-image img')].every(i => i.src.endsWith('.webp'))), 'Four original product images loaded without fallback');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  return { passed: passed.length, checks: passed };
}
