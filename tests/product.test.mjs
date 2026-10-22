import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import * as catalog from '../catalog.mjs';
test('Shared product CTA follows colour choices without the removed explainer',()=>{
  const html=readFileSync(new URL('../product.html',import.meta.url),'utf8');
  const options=html.match(/<section class="product-options"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(options.indexOf('id="affiliate-link"')>options.indexOf('id="variant-note"'),'CTA is inside options after colour choices');
  assert.equal((html.match(/id="affiliate-link"/g)||[]).length,1);
  assert.doesNotMatch(html,/photo-note|ดูทรงให้ชัด ก่อนตัดสินใจ|กดรูปย่อยเพื่อเปลี่ยนมุม|สีที่เลือกใช้แสดงภาพเท่านั้น/);
  assert.match(html,/ลิงก์ Affiliate/);
});
test('Product route is local and rejects invalid IDs',()=>{
  assert.equal(typeof catalog.productHref,'function');
  assert.equal(catalog.productHref({id:'001'}),'./product.html?id=001');
  for(const id of [null,'','1','001/../../x','<svg>','002&redirect=evil']) assert.equal(catalog.productHref({id}),null);
});
test('Every current product has real gallery assets with explicit colour labels',()=>{
  const data=JSON.parse(readFileSync(new URL('../products.json',import.meta.url),'utf8'));
  assert.deepEqual(data.products.map(p=>p.id),['001','002','003','004']);
  for(const product of data.products){
    assert.ok(product.variants?.length,`Missing gallery: ${product.id}`);
    assert.equal(new Set(product.variants.map(v=>v.id)).size,product.variants.length);
    for(const variant of product.variants){
      assert.ok(variant.name&&variant.images.length);
      assert.match(variant.color,/^#[0-9a-f]{6}$/i);
      for(const image of variant.images){
        assert.match(image.src,/^\.\/assets\/gallery\/[a-z0-9_/-]+\.webp$/);
        assert.ok(image.label&&image.alt&&image.width>0&&image.height>0);
        assert.ok(readFileSync(new URL('../'+image.src,import.meta.url)).length>0);
      }
    }
  }
});
