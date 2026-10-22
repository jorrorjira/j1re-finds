import { affiliateHref, productHref } from './catalog.mjs?v=gallery-1';

const $ = selector => document.querySelector(selector);
const image = $('#gallery-image');
const dialog = $('#image-dialog');
let product, variant, imageIndex = 0;

function showImage(index) {
  imageIndex = (index + variant.images.length) % variant.images.length;
  const view = variant.images[imageIndex];
  image.hidden = false;
  $('#image-error').hidden = true;
  $('#open-image').disabled = false;
  image.alt = view.alt;
  image.width = view.width; image.height = view.height;
  image.src = view.src;
  $('#open-image').setAttribute('aria-label', `ขยายรูป ${view.alt}`);
  $('#image-status').textContent = `${view.label} · ${imageIndex + 1} / ${variant.images.length}`;
  for (const [i, button] of [...$('#thumbnails').children].entries()) button.setAttribute('aria-pressed', String(i === imageIndex));
}

function selectVariant(next) {
  variant = next;
  $('#thumbnails').replaceChildren(...variant.images.map((view, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'thumbnail';
    button.setAttribute('aria-label', `ดู${view.label} ${variant.name}`);
    const thumb = document.createElement('img');
    thumb.src = view.src; thumb.alt = ''; thumb.width = 80; thumb.height = 80;
    thumb.loading = 'lazy';
    const caption = document.createElement('span'); caption.textContent = view.label;
    button.append(thumb, caption);
    button.addEventListener('click', () => showImage(index));
    return button;
  }));
  $('#previous-image').disabled = $('#next-image').disabled = variant.images.length < 2;
  $('#variant-note').textContent = `${variant.name} · มีภาพ ${variant.images.length} มุม`;
  showImage(0);
}

async function load() {
  $('#detail-loading').hidden = false;
  $('#detail-error').hidden = true;
  $('#product-content').hidden = true;
  $('#detail-retry').hidden = false;
  try {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const data = await response.json();
    if (!Array.isArray(data.products)) throw new Error('Invalid catalog');
    product = params.getAll('id').length === 1 && productHref({id}) ? data.products.find(item => item.id === id) : undefined;
    if (!product) {
      $('#error-title').textContent = 'ไม่พบสินค้านี้';
      $('#error-copy').textContent = 'ลิงก์อาจไม่ครบหรือไม่มีรุ่นนี้ในรายการ กดกลับไปเลือกเมาส์ด้านบนได้เลย';
      $('#detail-retry').hidden = true;
      $('#detail-error').hidden = false;
      document.title = 'ไม่พบสินค้า — j1re';
      return;
    }
    if (typeof product.name !== 'string' || typeof product.description !== 'string' || !Array.isArray(product.variants) || !product.variants.length || product.variants.some(v =>
      typeof v.id !== 'string' || typeof v.name !== 'string' || !/^#[0-9a-f]{6}$/i.test(v.color) || !Array.isArray(v.images) || !v.images.length || v.images.some(view =>
        !/^\.\/assets\/gallery\/[a-z0-9_-]+\/[a-z0-9_-]+\/\d{2}\.webp$/.test(view.src) || typeof view.alt !== 'string' || typeof view.label !== 'string' || !Number.isInteger(view.width) || view.width <= 0 || !Number.isInteger(view.height) || view.height <= 0
      )
    )) throw new Error('Gallery unavailable');
    document.title = `${product.name} — รูปและสี | j1re`;
    $('#product-name').textContent = product.name;
    $('#product-description').textContent = product.description;
    const href = affiliateHref(product);
    $('#affiliate-link').hidden = !href;
    $('#affiliate-unavailable').hidden = Boolean(href);
    if (href) {
      $('#affiliate-link').href = href;
      $('#affiliate-link').setAttribute('aria-label', `ดู ${product.name} บน Shopee (เปิดแท็บใหม่)`);
    } else $('#affiliate-link').removeAttribute('href');
    $('#color-options').replaceChildren(...product.variants.map((v, index) => {
      const label = document.createElement('label'); label.className = 'color-option';
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'color'; input.value = v.id; input.checked = index === 0;
      input.addEventListener('change', () => { if (input.checked) selectVariant(v); });
      const swatch = document.createElement('span'); swatch.className = 'color-swatch';
      swatch.style.backgroundColor = v.color; swatch.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span'); name.textContent = v.name;
      label.append(input, swatch, name);
      return label;
    }));
    selectVariant(product.variants[0]);
    $('#product-content').hidden = false;
  } catch {
    $('#error-title').textContent = 'โหลดสินค้าไม่สำเร็จ';
    $('#error-copy').textContent = 'ตรวจการเชื่อมต่อ แล้วลองอีกครั้ง หรือกลับไปเลือกเมาส์ด้านบน';
    $('#detail-error').hidden = false;
  } finally { $('#detail-loading').hidden = true; }
}

image.addEventListener('error', () => {
  image.hidden = true; $('#image-error').hidden = false; $('#open-image').disabled = true;
});
$('#previous-image').addEventListener('click', () => showImage(imageIndex - 1));
$('#next-image').addEventListener('click', () => showImage(imageIndex + 1));
$('#detail-retry').addEventListener('click', load);
$('#open-image').addEventListener('click', () => {
  const view = variant.images[imageIndex];
  $('#zoom-image').hidden = false;
  $('#zoom-image').src = view.src; $('#zoom-image').alt = view.alt;
  $('#zoom-caption').textContent = `${product.name} · ${variant.name} · ${view.label}`;
  dialog.showModal();
});
$('#zoom-image').addEventListener('error', () => {
  $('#zoom-image').hidden = true; $('#zoom-caption').textContent = 'โหลดรูปขยายไม่สำเร็จ ปิดหน้าต่างแล้วลองเลือกมุมอื่น';
});
load();
