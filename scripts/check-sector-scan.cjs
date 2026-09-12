const {chromium}=require('C:/Users/iomis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 fs.mkdirSync('output/sector-scan',{recursive:true});
 try{
  for(const [name,width,motion] of [['desktop',1440,'no-preference'],['mobile',390,'no-preference'],['reduced',390,'reduce']]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion});
   await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:8892'?r.continue():r.abort());
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8892/books/hearts-in-the-void.html#sector-research');
   await page.locator('.hv-station-art img').evaluate(n=>n.decode());
   await page.locator('.hv-station-art').scrollIntoViewIfNeeded();
   for(const sector of ['docking','commercial','residential','engineering','research']){
    await page.locator(`[data-sector="${sector}"]`).click();
    await page.locator('.hv-station-art').scrollIntoViewIfNeeded();
    await page.waitForTimeout(motion==='reduce'?100:650);
    const geometry=await page.evaluate(()=>{
     const target=document.querySelector('[data-hud-target]');
     const frame=target.getBoundingClientRect();
     const number=document.querySelector('[data-hud-target-numbers]').getBoundingClientRect();
     const art=document.querySelector('.hv-station-art').getBoundingClientRect();
     return {right:Math.abs(frame.right-number.right),gap:number.top-frame.bottom,inside:number.bottom<=art.bottom+.5&&number.left>=art.left-.5,color:getComputedStyle(target).backgroundColor};
    });
    assert.ok(geometry.right<1&&geometry.gap>=4&&geometry.gap<=6&&geometry.inside,`${name}/${sector}: ${JSON.stringify(geometry)}`);
    assert.equal(geometry.color,'rgba(255, 139, 59, 0.1)');
    assert.match(await page.locator('[data-hud-target-numbers]').textContent(),/^\d{3}\.\d{3} \/ \d{2}\.\d{3} \/ \d{6}$/);
   }
   const before=await page.locator('[data-hud-target-numbers]').textContent();
   await page.waitForTimeout(220);
   const after=await page.locator('[data-hud-target-numbers]').textContent();
   if(motion==='reduce')assert.equal(before,after);else assert.notEqual(before,after);
   const animations=await page.locator('.hv-hud-scan-surface').evaluate(n=>({noise:getComputedStyle(n,'::before').animationName,sweep:getComputedStyle(n,'::after').animationName}));
   assert.deepEqual(animations,motion==='reduce'?{noise:'none',sweep:'none'}:{noise:'hv-selection-static',sweep:'hv-sector-sweep'});
   await page.locator('.hv-station-display').screenshot({path:`output/sector-scan/research-${name}.jpg`,quality:90});
   await page.locator('[data-sector="docking"]').click();await page.locator('.hv-station-art').scrollIntoViewIfNeeded();await page.waitForTimeout(motion==='reduce'?100:750);
   await page.locator('.hv-station-display').screenshot({path:`output/sector-scan/docking-${name}.jpg`,quality:90});
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
   const paused=await page.locator('[data-hud-target-numbers]').textContent();
   await page.waitForTimeout(250);assert.equal(await page.locator('[data-hud-target-numbers]').textContent(),paused);
   assert.equal(await page.locator('.hv-hud-scan-surface').evaluate(n=>getComputedStyle(n,'::after').animationPlayState),'paused');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${name}: 10% overlay, all sector corner alignments, live numbers, static/sweep effects and offscreen pause.`);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
