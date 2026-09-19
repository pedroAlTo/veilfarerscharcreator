const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_BASE||'http://127.0.0.1:8893',out='output/behind-the-veil';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
try{for(const width of [1440,900,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/behind-the-veil/',{waitUntil:'domcontentloaded'});
 await page.locator('h1').waitFor();ok((await page.title()).includes('Behind the Veil'),'Journal title');
 await page.locator('.journal-entry img').evaluate(e=>e.decode());ok(await page.locator('.journal-entry img').evaluate(e=>e.complete&&e.naturalWidth>0),'Existing book illustration loads');
 await page.screenshot({path:`${out}/index-${width}.png`,fullPage:true});
 await page.locator('.journal-entry').click();await page.waitForURL('**/overkill*');
 const slider=page.getByRole('slider',{name:'Rolled damage'});
 for(const [damage,hp]of [[31,'3 HP'],[32,'4 HP'],[42,'5 HP']]){await slider.fill(String(damage));ok(await page.locator('[data-hp]').textContent()===hp,`Standard ${damage}`);}
 await page.getByRole('combobox',{name:'Overkill interval'}).selectOption('deadly');
 await slider.fill('27');ok(await page.locator('[data-hp]').textContent()==='4 HP','Deadly exact first breakpoint');
 await slider.focus();await page.keyboard.press('ArrowLeft');ok(await page.locator('[data-hp]').textContent()==='3 HP','Keyboard changes damage');
 await slider.fill('42');const markers=page.locator('[data-armor-marker]');ok(await markers.count()===6,'Six armor markers');
 await markers.nth(0).click();ok(await page.locator('[data-hp]').textContent()==='6 HP','One slot removes one HP from 7 HP Overkill');
 for(let i=1;i<6;i++)await markers.nth(i).click();ok(await page.locator('[data-hp]').textContent()==='1 HP','Six slots remove six HP');
 ok(await page.locator('[data-armor-count]').textContent()==='6 / 6 spent','Spent count matches markers');
 await markers.nth(5).focus();await page.keyboard.press('Space');ok(await page.locator('[data-hp]').textContent()==='2 HP','Keyboard restores a marker');
 ok(await markers.nth(5).getAttribute('aria-pressed')==='false','Restored marker exposes correct state');
 await slider.fill('1');ok(await page.locator('[data-hp]').textContent()==='0 HP','HP loss stops at zero');
 await slider.fill('42');await page.getByRole('combobox',{name:'Overkill interval'}).selectOption('standard');ok(await page.locator('[data-hp]').textContent()==='0 HP','Mode change preserves five spent slots');
 await page.getByRole('combobox',{name:'Overkill interval'}).selectOption('deadly');
 ok(await page.getByRole('checkbox').count()===0,'Armor uses markers instead of a checkbox');
 ok((await page.locator('[data-explanation]').textContent()).includes('7 HP before armor'),'Raw damage consequence remains explained');
 ok(await page.locator('.journal-body').innerText().then(t=>t.includes('open-ended')&&t.includes('Massive Damage')),'Author rationale and original-system context');
 await page.locator('#experiment').scrollIntoViewIfNeeded();
 await page.screenshot({path:`${out}/lab-${width}.png`});
 ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 if(width<=1050){await page.getByRole('button',{name:'Menu',exact:true}).click();ok(await page.locator('.book-nav a[aria-current="page"]').isVisible(),'Journal available in mobile menu');await page.keyboard.press('Escape');}
 ok(await page.locator('vf-theme-player').count()===1,'Shared player on article');
 ok(errors.length===0,errors.join('\n'));await context.close();
}
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();
await page.goto(base+'/behind-the-veil/overkill.html');ok(await page.locator('.journal-table').isVisible(),'Static example without JavaScript');ok(await page.getByRole('heading',{name:'Let the thresholds keep going.'}).isVisible(),'Author account without JavaScript');await context.close();
console.log(`PASS ${checks} design journal browser checks.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
