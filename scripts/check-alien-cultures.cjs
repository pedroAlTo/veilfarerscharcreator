const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_BASE||'http://127.0.0.1:8892',out='output/alien-cultures-qa';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
try{for(const width of [1440,900,390]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/books/alien-archives.html#peoples',{waitUntil:'domcontentloaded'});await p.locator('.xa-terminal.is-online').waitFor();
 const cards=p.locator('.xa-culture-card');ok(await cards.count()===9,'Nine cultural plates');
 await cards.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(im=>{im.loading='eager';return im.decode();})));
 ok(await cards.locator('img').evaluateAll(imgs=>imgs.every(im=>im.complete&&im.naturalWidth>0&&im.currentSrc.includes('/alien-cultures/'))),'All responsive cultural artwork loads');
 ok(await p.locator('#peoples img[src*="ancestry/"]').count()===0,'Portraits removed from cultural section');
 ok(await p.locator('.xa-species-atlas img').evaluateAll(imgs=>imgs.every(im=>im.src.includes('/alien-cultures/'))),'Field index matches the cultural plates');
 for(let i=0;i<9;i++){
  const card=cards.nth(i),im=await card.locator('img').boundingBox(),copy=await card.locator('div').boundingBox();
  ok(copy.y>=im.y+im.height-2,'Cultural context is below, never covering, the illustration');
  ok(Math.abs(im.width/im.height-1.5)<.02,'Complete landscape plate retains its aspect ratio');
 }
 ok((await p.locator('#species-rift-spinner').textContent()).includes('Clothing can conceal those markings'),'Identity and privacy explained');
 ok(!(await p.locator('#peoples').textContent()).includes('Four-armed'),'Incorrect Rift Spinner anatomy copy removed');
 const rift=p.locator('#species-rift-spinner [data-book-art]');await rift.click();ok(await p.locator('[data-book-dialog]').evaluate(d=>d.open),'Rift cultural plate opens full size');await p.keyboard.press('Escape');ok(await rift.evaluate(a=>a===document.activeElement),'Viewer returns keyboard focus');
 await p.locator('#peoples').screenshot({path:`${out}/cultures-${width}.png`,style:'[data-site-header],.skip{visibility:hidden!important}'});
 await p.locator('#species-rift-spinner').screenshot({path:`${out}/rift-culture-${width}.png`,style:'[data-site-header],.skip{visibility:hidden!important}'});
 await p.locator('[data-record-link="crystallis"]').click();
 ok(await p.locator('#record-crystallis .xa-mugshot').evaluate(el=>getComputedStyle(el).backgroundImage.includes('npc-surveillance-marked.webp')),'Crystallis uses the marked still');
 ok(await p.locator('[data-record-panel]:not(#record-crystallis) .xa-mugshot').evaluateAll(els=>els.every(el=>getComputedStyle(el).backgroundImage.includes('npc-surveillance.webp'))),'Other five subjects preserve their original stills');
 await p.locator('.xa-terminal').screenshot({path:`${out}/crystallis-${width}.png`,style:'[data-site-header],.skip{visibility:hidden!important}'});
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
 await p.goto(base+'/books/corebook.html',{waitUntil:'domcontentloaded'});const v=p.locator('img[src*="class-09-vanguard-marked.webp"]');ok(await v.count()===2,'Both Corebook appearances use the same marked Vanguard');await v.evaluateAll(imgs=>Promise.all(imgs.map(im=>{im.loading='eager';return im.decode();})));
 ok(await v.evaluateAll(imgs=>imgs.every(im=>im.complete&&im.naturalWidth>0)),'Marked Vanguard loads');
 ok(errors.length===0,JSON.stringify(errors));console.log(`PASS ${width}px cultural plates, full-image viewer and Rift Spinner continuity.`);await ctx.close();
}
const ctx=await browser.newContext({javaScriptEnabled:false}),p=await ctx.newPage();await p.goto(base+'/books/alien-archives.html',{waitUntil:'domcontentloaded'});ok(await p.locator('.xa-culture-card [data-book-art][href$=".webp"]').count()===9,'All cultural illustrations retain direct image links without JavaScript');await ctx.close();console.log(`PASS ${checks} cultural presentation checks.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
