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
  image.alt = product.demo ? `Sample image: ${product.name}` : product.name;
  image.width = 450; image.height = 450;
  image.loading = 'lazy'; image.decoding = 'async';
  image.addEventListener('error', () => { image.src = './assets/fallback.svg'; }, { once: true });
  figure.append(image, node('span', 'product-number', `#${product.id}`));
  if (product.demo) figure.append(node('span', 'sample-tag', 'Sample'));
  const copy = node('div', 'product-copy');
  const group = data.categories.find(item => item.id === product.category);
  copy.append(node('span', 'product-category', group?.english || 'FINDS'), node('h3', '', product.name), node('p', 'product-description', product.description));
  const href = affiliateHref(product);
  const link = node(href ? 'a' : 'button', 'product-link');
  if (href) {
    link.href = href; link.target = '_blank'; link.rel = 'sponsored noopener noreferrer';
    link.setAttribute('aria-label', `View ${product.name} on Shopee (opens a new tab)`);
  } else {
    link.type = 'button'; link.disabled = true;
  }
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrow.setAttribute('class', 'icon'); arrow.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#i-external'); arrow.append(use);
  link.append(node('span', '', href ? 'View on Shopee' : product.demo ? 'Link pending' : 'Link unavailable'), arrow);
  copy.append(link); article.append(figure, copy);
  return article;
}
function render() {
  if (!data) return;
  const products = filterProducts(data.products, { query: search.value, category });
  grid.replaceChildren(...products.map(card));
  empty.hidden = products.length > 0;
  count.textContent = `${products.length} ${products.length === 1 ? 'find' : 'finds'} in the collection`;
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
    for (const group of [{ id: 'all', name: 'All finds' }, ...data.categories]) {
      const button = node('button', 'category-button');
      button.type = 'button'; button.dataset.category = group.id;
      button.textContent = group.name;
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
const navigation = document.querySelector('#primary-nav');
const navToggle = document.querySelector('#nav-toggle');
function closeNavigation() {
  navigation.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}
navToggle.addEventListener('click', () => {
  navToggle.setAttribute('aria-expanded', String(navigation.classList.toggle('is-open')));
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
document.querySelector('#theme-toggle').addEventListener('click', event => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  event.currentTarget.setAttribute('aria-pressed', String(dark));
  event.currentTarget.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#000000' : '#FFFFFF';
});
for (const button of document.querySelectorAll('[data-dialog]')) {
  button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal());
}
for (const link of document.querySelectorAll('[data-filter-link]')) {
  link.addEventListener('click', () => { category = link.dataset.filterLink; search.value = ''; render(); });
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) { closeNavigation(); navToggle.focus(); }
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable && !document.querySelector('dialog[open]')) {
    event.preventDefault(); search.focus();
  }
});
document.querySelector('#share').addEventListener('click', async () => {
  const url = new URL(location.href); url.hash = ''; url.search = '';
  try {
    await navigator.clipboard.writeText(url.href);
    const toast = document.querySelector('#toast');
    toast.textContent = location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? 'Copied. This local preview link works only on this computer.' : 'Link copied. Pass it on.';
    toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  } catch {
    const input = document.querySelector('#share-url'); input.value = url.href;
    document.querySelector('#share-dialog').showModal(); input.focus(); input.select();
  }
});
load();
