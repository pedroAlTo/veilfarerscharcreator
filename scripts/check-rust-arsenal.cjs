const {chromium}=require('C:/Users/iomis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.VF_PREVIEW_URL||'http://127.0.0.1:8892';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 fs.mkdirSync('output/rust-arsenal-qa',{recursive:true});
 try{
  for(const [name,width,motion] of [['desktop',1440,'no-preference'],['tablet',820,'reduce'],['mobile',390,'reduce']]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion});
   await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/books/rust-and-steel.html');
   await page.waitForSelector('body.has-rust-arsenal');
   assert.equal(await page.locator('.rust-catalog>.feature-panel').count(),9);
   const art=page.locator('[data-rust-art]');
   assert.equal(await art.count(),5);
   for(let i=0;i<5;i++){
    const link=art.nth(i);
    await link.scrollIntoViewIfNeeded();
    await link.locator('img').evaluate(img=>img.decode());
    await link.click();
    await page.locator('[data-rust-dialog] img').evaluate(img=>img.decode());
    assert.equal(await page.locator('[data-rust-dialog]').evaluate(n=>n.open),true);
    assert.equal(await page.locator('[data-rust-dialog] h2').textContent(),await link.getAttribute('data-rust-art'));
    const fits=await page.locator('[data-rust-dialog]').evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight});
    assert.ok(fits,name+' modal remains in viewport');
    if(i===0)await page.screenshot({path:`output/rust-arsenal-qa/${name}-expanded.jpg`,quality:85});
    if(i%2)await page.locator('[data-rust-dialog] button').click();else await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-rust-dialog]').evaluate(n=>n.open),false);
    assert.equal(await link.evaluate(n=>n===document.activeElement),true);
   }
   const heat=page.locator('[data-rust-heat]');
   const slider=heat.locator('input');
   assert.ok((await heat.locator('.rust-heat-track i').first().boundingBox()).height>=20,name+' Heat segments remain readable');
   await heat.scrollIntoViewIfNeeded();
   assert.ok(await heat.evaluate(n=>{const outer=n.getBoundingClientRect();return [...n.querySelectorAll('.rust-heat-display,.rust-heat-track,.rust-heat-level,.rust-heat-endpoints')].every(item=>{const r=item.getBoundingClientRect();return r.left>=outer.left&&r.right<=outer.right})}),name+' all Heat content fits its tile');
   if(motion==='no-preference'){
    await heat.locator('[data-heat-replay]').click();
    await page.waitForFunction(()=>Number(document.querySelector('[data-heat-level]').dataset.heatLevel)>=2);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);
    const paused=await slider.inputValue();await page.waitForTimeout(500);assert.equal(await slider.inputValue(),paused);
    await heat.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('[data-heat-level]').dataset.heatLevel==='10',null,{timeout:12000});
    assert.equal(await heat.locator('[data-heat-band]').textContent(),'Burned');
    assert.equal(await heat.locator('.rust-heat-display').evaluate(n=>n.style.getPropertyValue('--heat-glow')),'1.000');
    assert.equal(await heat.locator('.rust-heat-display').evaluate(n=>n.style.getPropertyValue('--heat-color')),'rgb(244,73,61)');
    await page.screenshot({path:`output/rust-arsenal-qa/${name}-heat-full.jpg`,quality:90});
   }else{
    assert.equal(await slider.inputValue(),'0');await page.waitForTimeout(250);assert.equal(await slider.inputValue(),'0');
   }
   for(const [level,band] of [[0,'Cold'],[2,'Cold'],[3,'Warm'],[4,'Warm'],[5,'Hot'],[6,'Hot'],[7,'Burning'],[8,'Burning'],[9,'Inferno'],[10,'Burned']]){
    await slider.fill(String(level));
    assert.equal(await heat.locator('[data-heat-band]').textContent(),band);
    assert.equal(await slider.getAttribute('aria-valuetext'),`${level} of 10, ${band}`);
   }
   await slider.focus();await page.keyboard.press('Home');assert.equal(await slider.inputValue(),'0');
   await page.keyboard.press('End');assert.equal(await slider.inputValue(),'10');
   await page.screenshot({path:`output/rust-arsenal-qa/${name}-heat-manual.jpg`,quality:90});
   await page.locator('.rust-catalog').screenshot({path:`output/rust-arsenal-qa/${name}-catalog.jpg`,quality:85});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name+' page overflow');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${name}: five images, nine topics, full image viewer, focus restoration, canonical Heat bands, red maximum, slider keyboard control and responsive layout.`);
   await context.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
  const page=await context.newPage();await page.goto(base+'/books/rust-and-steel.html');
  assert.equal(await page.locator('[data-rust-art]').count(),5);
  assert.equal(await page.locator('.rust-heat-controls').isVisible(),false);
  await page.locator('[data-rust-art]').first().click();
  assert.ok(page.url().endsWith('/rust-schematics/armory.webp'));
  console.log('PASS no-JavaScript: native full-image links and complete equipment descriptions remain available.');
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
