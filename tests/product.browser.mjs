import assert from 'node:assert/strict';
export async function verifyProductFlow(page,id='001',base='http://127.0.0.1:4173/'){
  await page.goto(base);
  await page.waitForFunction(()=>document.querySelectorAll('.product-card').length===4);
  assert.equal(await page.evaluate(id=>document.querySelector(`[data-product-id="${id}"]`).tagName,id),'A','Whole catalog card opens a product page');
  await page.click(`[data-product-id="${id}"]`);
  await page.waitForFunction(()=>document.querySelector('#product-content')?.hidden===false);
  await page.waitForFunction(()=>document.querySelector('#gallery-image').complete&&document.querySelector('#gallery-image').naturalWidth>0);
  assert.ok(await page.evaluate(()=>!document.querySelector('#image-error').hidden===false),'Actual gallery image loaded');
  assert.ok(await page.evaluate(()=>document.querySelectorAll('input[name="color"]').length>0),'Colour choices available');
  assert.ok(await page.evaluate(()=>{
    const link=document.querySelector('#affiliate-link');
    return link.href.startsWith('https://s.shopee.co.th/')&&link.rel.includes('sponsored')&&link.target==='_blank'&&Boolean(link.closest('.product-options'))&&link.getBoundingClientRect().top>document.querySelector('#variant-note').getBoundingClientRect().bottom;
  }),'Affiliate purchase action is directly below colour choices');
}

export async function verifyGallery(page,product,base){
  const checks=[];
  const check=(ok,label)=>{assert.ok(ok,`${product.id}: ${label}`);checks.push(label);};
  await page.cdp('Emulation.clearDeviceMetricsOverride');
  await verifyProductFlow(page,product.id,base);
  check(await page.evaluate(p=>document.querySelector('#product-name').textContent===p.name&&document.querySelector('#affiliate-link').getAttribute('href')===p.url,product),'Correct name and exact tracking URL');
  for(const v of product.variants){
    await page.click(`.color-option:has(input[value="${v.id}"])`);
    check(await page.evaluate(v=>document.querySelector('input[name="color"]:checked').value===v.id&&document.querySelectorAll('.thumbnail').length===v.images.length&&document.querySelector('#image-status').textContent.includes(`1 / ${v.images.length}`),v),`${v.id}: selection resets view and thumbnails`);
    for(const [index,view] of v.images.entries()){
      await page.focus(`.thumbnail:nth-child(${index+1})`);
      await page.keyboard.press('Enter');
      await page.waitForFunction(view=>{const i=document.querySelector('#gallery-image');return i.getAttribute('src')===view.src&&i.complete&&i.naturalWidth===view.width;},view);
      check(await page.evaluate(view=>document.querySelector('#gallery-image').alt===view.alt&&document.querySelectorAll('.thumbnail[aria-pressed="true"]').length===1&&document.querySelector('#image-status').textContent.includes(view.label),view),`${v.id}: ${view.src}`);
    }
    if(v.images.length>1){
      await page.click('#next-image');
      check(await page.evaluate(src=>document.querySelector('#gallery-image').getAttribute('src')===src,v.images[0].src),`${v.id}: next wraps to first`);
      await page.click('#previous-image');
      check(await page.evaluate(src=>document.querySelector('#gallery-image').getAttribute('src')===src,v.images.at(-1).src),`${v.id}: previous wraps to last`);
    }else check(await page.evaluate(()=>document.querySelector('#previous-image').disabled&&document.querySelector('#next-image').disabled),`${v.id}: single-image arrows disabled`);
  }
  await page.click('#open-image');
  check(await page.evaluate(()=>document.querySelector('#image-dialog').open&&document.querySelector('#zoom-image').src===document.querySelector('#gallery-image').src&&document.activeElement.classList.contains('dialog-close')&&getComputedStyle(document.body).overflow==='hidden'),'Zoom modal and initial focus');
  await page.keyboard.press('Tab');
  check(await page.evaluate(()=>document.activeElement.closest('dialog')!==null||document.activeElement===document.body),'Modal traps focus');
  await page.keyboard.press('Escape');
  check(await page.evaluate(()=>!document.querySelector('#image-dialog').open&&document.activeElement.id==='open-image'),'Escape closes and restores focus');
  // Native radio arrow keys are exercised from an explicitly selected first colour.
  await page.click('.color-option:first-child');
  await page.focus(`input[name="color"][value="${product.variants[0].id}"]`);
  await page.keyboard.press('ArrowRight');
  check(await page.evaluate(id=>document.querySelector('input[name="color"]:checked').value===id,product.variants[1].id),'Native keyboard colour selection');
  for(const width of [1440,768,390,320]){
    await page.cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<701});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+width);
    check(await page.evaluate(()=>![...document.querySelectorAll('h1,h2,.primary-button,.color-option')].some(e=>e.scrollWidth>e.clientWidth+1)),'No clipped text or controls '+width);
  }
  return {id:product.id,passed:checks.length,checks};
}
