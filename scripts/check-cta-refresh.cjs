const {chromium}=require('C:/Users/iomis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const base='http://127.0.0.1:8892';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});fs.mkdirSync('output/cta-refresh',{recursive:true});
 try{
  for(const [name,width,motion] of [['desktop',1440,'no-preference'],['mobile',390,'reduce']]){
   const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion});
   await ctx.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
   const page=await ctx.newPage();const errors=[],missing=[],polls=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url())});page.on('request',r=>{if(r.url().includes('ancestry-vote'))polls.push(r.url())});
   await page.goto(base+'/');await page.locator('#books-1206-notice').waitFor({state:'visible'});
   assert.deepEqual(await page.locator('#books-1206-notice [data-cta-target]').evaluateAll(ns=>ns.map(n=>n.dataset.ctaTarget)),['books','crossing','release','beta','minis']);
   await page.locator('#books-1206-notice').waitFor({state:'visible'});
   await page.locator('#books-1206-notice img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
   await page.locator('#books-1206-notice').screenshot({path:`output/cta-refresh/books-${name}.jpg`,type:'jpeg',quality:70});
   await page.locator('#books-1206-notice [data-cta-target="crossing"]').click();
   await page.locator('#first-crossing-notice').waitFor({state:'visible'});
   await page.locator('.vf-lite-book img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
   assert.equal(await page.locator('.vf-lite-library img').count(),3);
   if(motion==='no-preference'){
    await page.waitForFunction(()=>document.querySelector('#vf-crossing-dice').dataset.ready==='true',{},{timeout:20000});
    await page.waitForTimeout(6500);
    assert.equal(await page.locator('#vf-crossing-dice canvas').count(),1);
   }else assert.equal(await page.locator('#vf-crossing-dice canvas').count(),0);
   await page.locator('#first-crossing-notice').screenshot({path:`output/cta-refresh/lite-${name}.jpg`,type:'jpeg',quality:70});
   await page.locator('#first-crossing-notice [data-cta-target="minis"]').click();
   await page.locator('#mini-invitation').waitFor({state:'visible'});
   assert.equal(await page.locator('#mini-invitation form').count(),0);assert.deepEqual(polls,[]);
   assert.match(await page.locator('#mini-invitation').innerText(),/Coming soon!/);
   await page.locator('#mini-invitation').screenshot({path:`output/cta-refresh/coming-${name}.jpg`,type:'jpeg',quality:70});
   await page.locator('#mini-invitation [data-cta-target="crossing"]').click();
   if(motion==='no-preference')await page.waitForFunction(()=>document.querySelector('#vf-crossing-dice').dataset.ready==='true');
   await page.locator('#first-crossing-notice [data-notice-minimize]').click();
   assert.equal(await page.locator('dialog[open]').count(),0);
   await page.goto(base+'/books/hearts-in-the-void.html#station');
   await page.locator('.hv-station-art img').evaluate(n=>n.decode());
   for(const sector of ['docking','commercial','residential','engineering','research']){
    await page.locator('[data-sector="'+sector+'"]').click();await page.waitForTimeout(motion==='reduce'?100:2400);
    const active=await page.locator('.hv-station-lamp').evaluateAll(ns=>[...new Set(ns.filter(n=>+n.style.opacity>.05).map(n=>n.dataset.windowSector))]);assert.deepEqual(active,[sector]);
    assert.equal(await page.locator('[data-station-lights] circle').count(),0);
    if(name==='desktop')await page.locator('.hv-station-art').screenshot({path:`output/cta-refresh/windows-${sector}.jpg`,type:'jpeg',quality:85});
   }
   await page.locator('#first-crossing').screenshot({path:`output/cta-refresh/section-${name}.jpg`,type:'jpeg',quality:70});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS '+name+': five notices, dice, dormant survey, five window groups, three First Crossing covers and no page errors');await ctx.close();
  }
  // Preview activation without changing the actual release flag or submitting votes.
  const ctx=await browser.newContext({reducedMotion:'reduce'});await ctx.route('**/*',async r=>{
   const url=r.request().url();if(new URL(url).origin!==base)return r.abort();
   if(url.includes('/notice-config.js'))return r.fulfill({contentType:'application/javascript',body:fs.readFileSync('public/notice-config.js','utf8').replace('= false','= true')});
   if(url.includes('ancestry-vote'))return r.fulfill({contentType:'application/json',body:JSON.stringify({state:'draft',results:[]})});
   return r.continue();
  });const page=await ctx.newPage();await page.goto(base+'/');await page.locator('#books-1206-notice').waitFor({state:'visible'});await page.locator('#books-1206-notice [data-cta-target="minis"]').click();await page.locator('#mini-invitation form').waitFor({state:'visible'});assert.equal(await page.locator('[data-mini-choices] input').count(),9);console.log('PASS retained survey can be activated with nine options');await ctx.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
