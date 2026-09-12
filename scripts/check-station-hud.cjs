const { chromium } = require('C:/Users/iomis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = 'http://127.0.0.1:8892';
(async () => {
 const browser = await chromium.launch({ headless: true, channel: 'msedge' });
 fs.mkdirSync('output/station-hud', { recursive: true });
 try {
  for (const [name, width, motion] of [['desktop',1440,'no-preference'], ['mobile',390,'reduce'], ['mobile-3d',390,'no-preference']]) {
   const context = await browser.newContext({ viewport:{width,height:1000}, reducedMotion:motion });
   await context.route('**/*', r => new URL(r.request().url()).origin === base ? r.continue() : r.abort());
   const page = await context.newPage(); const errors=[];
   page.on('pageerror', e=>errors.push(e.message));
   await page.goto(base+'/books/hearts-in-the-void.html#station');
   await page.locator('.hv-station-art img').evaluate(n=>n.decode());
   await page.locator('.hv-station-art').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-station-name]').dataset.typed==='true');
   assert.equal(await page.locator('[data-station-name]').innerText(), "CHARON'S REFUGE");
   const packet = await page.locator('[data-hud-stream]').first().textContent();
   await page.waitForTimeout(350);
   const later = await page.locator('[data-hud-stream]').first().textContent();
   if(motion==='reduce') assert.equal(later,packet); else assert.notEqual(later,packet);
   for (const sector of ['docking','commercial','residential','engineering','research']) {
    await page.locator(`[data-sector="${sector}"]`).click();
    assert.equal(await page.locator('[data-station-hud]').getAttribute('data-telemetry-sector'),sector);
    assert.equal(await page.locator('[data-hud-value]').count(),6);
    const power = +(await page.locator('[data-hud-value]').nth(1).innerText());
    assert.ok(power>15&&power<25);
   }
   await page.locator('[data-sector="docking"]').click();
   await page.waitForTimeout(motion==='reduce'?100:2300);
   await page.locator('.hv-station-console').screenshot({path:`output/station-hud/station-${name}.jpg`,quality:85});
   await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(150);
   const paused=await page.locator('[data-hud-stream]').first().textContent();
   await page.waitForTimeout(300);
   assert.equal(await page.locator('[data-hud-stream]').first().textContent(),paused);
   assert.equal(await page.locator('[data-station-name]').innerText(),"CHARON'S REFUGE");

   let unlock;
   const gate = new Promise(resolve=>unlock=resolve);
   await page.route('**/dice-box.es.min.js',async r=>{await gate;await r.continue();});
   await page.goto(base+'/');
   await page.locator('#books-1206-notice').waitFor({state:'visible'});
   await page.locator('#books-1206-notice [data-cta-target="crossing"]').click();
   assert.equal(await page.locator('#vf-crossing-dice .vf-dice-fallback').count(),0);
   assert.notEqual(await page.locator('#vf-crossing-dice').getAttribute('data-ready'),'true');
   assert.equal(await page.locator('#vf-crossing-dice canvas').count(),0);
   unlock();
   await page.locator('#first-crossing-notice img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
   if(motion!=='reduce') {
    await page.waitForFunction(()=>document.querySelector('#vf-crossing-dice').dataset.ready==='true');
    await page.waitForTimeout(6500);
   } else assert.equal(await page.locator('#vf-crossing-dice canvas').count(),0);
   const centered=await page.evaluate(()=>{
    const frame=document.querySelector('.vf-lite-art').getBoundingClientRect();
    const scene=document.querySelector('.vf-lite-library').getBoundingClientRect();
    return {x:Math.abs(frame.x+frame.width/2-scene.x-scene.width/2),y:Math.abs(frame.y+frame.height/2-scene.y-scene.height/2)};
   });
   assert.ok(centered.x<2&&centered.y<2,JSON.stringify(centered));
   assert.equal(await page.locator('.vf-table-sheet').count(),1);
   assert.equal(await page.locator('.vf-table-pencil').count(),1);
   await page.locator('#first-crossing-notice').screenshot({path:`output/station-hud/crossing-${name}.jpg`,quality:85});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.deepEqual(errors,[]);
   console.log(`PASS ${name}: HUD sectors, readings, title, live/paused telemetry, centered books, tabletop props and 3D-only loading.`);
   await context.close();
  }
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
