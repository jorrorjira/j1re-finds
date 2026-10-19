import { filterProducts, affiliateHref } from './catalog.mjs';

const grid = document.querySelector('#product-grid');
const search = document.querySelector('#search');
const categories = document.querySelector('#categories');
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty-state');
const error = document.querySelector('#error-state');
let data;
let category = 'all';
let toastTimer;
const iconPaths = {
  all: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  tech: '<path d="M5 15v-3a7 7 0 0 1 14 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',
  desk: '<path d="M3 14h18M6 14v7m12-7v7M9 11l4-8 7 5-4 3ZM13 3l-7 8v3"/>',
  life: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
};
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function card(product) {
  const article = node('article', 'product-card');
  article.dataset.productId = product.id;
  const figure = node('div', 'product-image');
  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.demo ? `ภาพประกอบตัวอย่าง ${product.name}` : product.name;
  image.width = 450; image.height = 450;
  image.loading = 'lazy'; image.decoding = 'async';
  image.addEventListener('error', () => { image.src = './assets/fallback.svg'; }, { once: true });
  figure.append(image, node('span', 'product-number', `#${product.id}`));
  if (product.demo) figure.append(node('span', 'sample-tag', 'ตัวอย่าง'));
  const copy = node('div', 'product-copy');
  const group = data.categories.find(item => item.id === product.category);
  copy.append(node('span', 'product-category', group?.english || 'FINDS'), node('h3', '', product.name), node('p', 'product-description', product.description));
  const href = affiliateHref(product);
  const link = node(href ? 'a' : 'button', 'product-link');
  if (href) {
    link.href = href; link.target = '_blank'; link.rel = 'sponsored noopener noreferrer';
    link.setAttribute('aria-label', `ดู ${product.name} บน Shopee (เปิดแท็บใหม่)`);
  } else {
    link.type = 'button'; link.disabled = true;
  }
  link.append(node('span', '', href ? 'ดูพิกัด Shopee' : product.demo ? 'รอลิงก์จริง' : 'ยังไม่มีลิงก์'), node('span', '', href ? '↗' : '—'));
  copy.append(link); article.append(figure, copy);
  return article;
}
function render() {
  if (!data) return;
  const products = filterProducts(data.products, { query: search.value, category });
  grid.replaceChildren(...products.map(card));
  empty.hidden = products.length > 0;
  count.textContent = `${products.length} พิกัด${data.products.every(item => item.demo) ? 'ตัวอย่าง' : ''}`;
  for (const button of categories.children) button.setAttribute('aria-pressed', String(button.dataset.category === category));
}
async function load() {
  error.hidden = true; empty.hidden = true; grid.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Catalog request failed');
    const incoming = await response.json();
    if (!Array.isArray(incoming.products) || !Array.isArray(incoming.categories)) throw new Error('Invalid catalog');
    data = incoming;
    document.querySelector('#demo-notice').hidden = !data.products.some(item => item.demo);
    categories.replaceChildren();
    for (const group of [{ id: 'all', name: 'ทั้งหมด' }, ...data.categories]) {
      const button = node('button', 'category-button');
      button.type = 'button'; button.dataset.category = group.id;
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = iconPaths[group.id] || iconPaths.all;
      button.append(icon, node('span', '', group.name));
      button.addEventListener('click', () => { category = group.id; render(); });
      categories.append(button);
    }
    render();
  } catch {
    data = undefined; grid.replaceChildren(); categories.replaceChildren(); count.textContent = ''; error.hidden = false;
  } finally { grid.setAttribute('aria-busy', 'false'); }
}
search.addEventListener('input', render);
document.querySelector('#reset').addEventListener('click', () => { search.value = ''; category = 'all'; render(); search.focus(); });
document.querySelector('#retry').addEventListener('click', load);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable && !document.querySelector('dialog[open]')) {
    event.preventDefault(); search.focus();
  }
});
document.querySelector('#share').addEventListener('click', async () => {
  const url = new URL(location.href); url.hash = ''; url.search = '';
  try {
    await navigator.clipboard.writeText(url.href);
    const toast = document.querySelector('#toast');
    toast.textContent = location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? 'คัดลอกแล้ว · ลิงก์ตัวอย่างนี้เปิดได้เฉพาะเครื่องนี้' : 'คัดลอกลิงก์แล้ว ส่งต่อได้เลย';
    toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  } catch {
    const input = document.querySelector('#share-url'); input.value = url.href;
    document.querySelector('#share-dialog').showModal(); input.focus(); input.select();
  }
});
load();
