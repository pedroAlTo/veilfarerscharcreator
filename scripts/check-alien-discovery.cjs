const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_BASE||'http://127.0.0.1:8892',out='output/alien-archive/qa';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;const errors=[],ok=(v,m)=>{assert.ok(v,m);checks++};
try{
for(const width of [1440,900,390]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/books/alien-archives.html',{waitUntil:'domcontentloaded'});await p.locator('.xa-terminal.is-online').waitFor();
 await p.evaluate(async()=>{await Promise.all([...document.images].map(im=>{im.loading='eager';return im.decode().catch(()=>{});}));});
 ok(await p.locator('.xa-card').count()===9,'All nine features expanded');
 ok(await p.locator('.xa-species-atlas a').count()===9,'Nine canonical ancestries');
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Alien page fits viewport');
 const tabs=p.locator('[data-record-link]'),panels=p.locator('[data-record-panel]:visible');ok(await tabs.count()===6,'Six archive subjects');
 for(let i=0;i<6;i++){await tabs.nth(i).click();ok(await panels.count()===1,'Single selected record');ok(await tabs.nth(i).getAttribute('aria-selected')==='true','Selected tab semantics');ok(await panels.locator('.xa-mugshot').isVisible(),'Selected portrait visible');ok((await panels.locator('a').getAttribute('href')).includes('#page='+(48+i)),'Sourcebook page linked');}
 await tabs.first().focus();await p.keyboard.press('End');ok(await tabs.last().getAttribute('aria-selected')==='true','End selects last record');await p.keyboard.press('ArrowRight');ok(await tabs.first().getAttribute('aria-selected')==='true','Keyboard selection wraps');
 await p.locator('.xa-terminal').screenshot({path:`${out}/terminal-${width}.png`});
 await p.locator('.xa-grid').screenshot({path:`${out}/archive-${width}.png`});
 const art=p.locator('[data-book-art]').first();await art.click();ok(await p.locator('[data-book-dialog]').evaluate(d=>d.open),'Plate viewer opens');await p.keyboard.press('Escape');ok(await art.evaluate(a=>a===document.activeElement),'Plate viewer restores focus');
 const current=await p.locator('[data-field-entry]:visible p').textContent();await p.locator('[data-field-table] button').click();ok(await p.locator('[data-field-entry]:visible').count()===1,'One table result shown');ok(await p.locator('[data-field-entry]:visible p').textContent()!==current,'Another detail does not repeat immediately');
 await p.goto(base+'/books/alien-archives.html#record-crystallis',{waitUntil:'domcontentloaded'});await p.locator('.xa-terminal.is-online').waitFor();ok(await p.locator('[data-record-panel="crystallis"]').isVisible(),'Direct record link selects correct subject');ok((await p.locator('[data-record-status]').textContent()).includes('052-B'),'Direct record status matches selected file');
 await p.goto(base+'/books/hearts-in-the-void.html',{waitUntil:'domcontentloaded'});await p.locator('.hv-station-console.is-interactive').waitFor();await p.locator('.hv-station-console').scrollIntoViewIfNeeded();await p.locator('.hv-station-art > img').evaluate(im=>im.decode());
 ok(await p.locator('.hv-sector-browser [data-station-hud]').count()===1,'Telemetry beside sector selector');ok(await p.locator('.hv-station-display [data-station-hud]').count()===0,'Telemetry removed from image column');ok(await p.locator('[data-hud-value]').count()===6,'Six system metrics');
 for(const sector of ['docking','commercial','residential','engineering','research']){await p.locator('[data-sector="'+sector+'"]').click();ok((await p.locator('.hv-station-hud [data-hud-sector-name]').textContent()).toLowerCase().includes(sector==='research'?'research':sector),'Telemetry follows '+sector);}
 await p.locator('.hv-station-console').screenshot({path:`${out}/station-${width}.png`});ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Station page fits viewport');
 await p.goto(base+'/',{waitUntil:'domcontentloaded'});await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await p.locator('.vf-first-step').waitFor();
 const entry=await p.locator('.vf-first-step>a').boundingBox();ok(entry.y>=0&&entry.y+entry.height<1000,'First Crossing entry appears in first viewport');ok((await p.locator('.vf-first-step>a').getAttribute('href')).endsWith('#first-crossing'),'Permanent entry reaches starter downloads');
 await p.screenshot({path:`${out}/home-${width}.png`});ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Homepage fits viewport');
 console.log(`PASS ${width}px archive, keyboard, plate viewer, table, station telemetry, homepage entry.`);await ctx.close();
}
const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),p=await ctx.newPage();await p.goto(base+'/books/alien-archives.html',{waitUntil:'domcontentloaded'});ok(await p.locator('[data-record-panel]:visible').count()===6,'All six records readable without JavaScript');ok(await p.locator('[data-field-entry]:visible').count()===10,'Entire source table readable without JavaScript');await ctx.close();
const live=await browser.newContext({viewport:{width:1440,height:1000}}),q=await live.newPage();await q.goto(base+'/books/alien-archives.html',{waitUntil:'domcontentloaded'});await q.locator('.xa-terminal.is-online').waitFor();await q.locator('.xa-terminal').scrollIntoViewIfNeeded();await q.waitForTimeout(180);let a=await q.locator('[data-record-stream]').textContent();await q.waitForTimeout(220);ok(a!==await q.locator('[data-record-stream]').textContent(),'Visible terminal data refreshes');await q.locator('h1').scrollIntoViewIfNeeded();await q.waitForTimeout(180);a=await q.locator('[data-record-stream]').textContent();await q.waitForTimeout(300);ok(a===await q.locator('[data-record-stream]').textContent(),'Offscreen terminal data pauses');await live.close();
ok(errors.length===0,JSON.stringify(errors));console.log(`PASS ${checks} assertions. No page errors.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
