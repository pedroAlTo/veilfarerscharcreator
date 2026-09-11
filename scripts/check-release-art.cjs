const {chromium}=require('C:/Users/iomis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 fs.mkdirSync('output/release-final',{recursive:true});
 for(const [name,width,motion] of [['desktop',1440,'no-preference'],['mobile',390,'reduce']]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion});
  await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:8892'?r.continue():r.abort());
  const page=await context.newPage();const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url())});
  await page.goto('http://127.0.0.1:8892/downloads.html');
  await page.locator('.vf-download-card').first().waitFor();
  assert.equal(await page.locator('.vf-download-card').count(),10);
  for(const title of ['First Crossing','First Crossing — Table Kit','First Crossing — Color Maps']){
   const card=page.locator('.vf-download-card').filter({has:page.getByRole('heading',{name:title,exact:true})});
   await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(n=>n.decode());
   assert.ok(await card.locator('img').evaluate(n=>n.naturalWidth===1024&&n.naturalHeight===1536));
   const file=title.includes('Table')?'kit':title.includes('Color')?'maps':'maya';
   await card.screenshot({path:`output/release-final/${file}-${name}.jpg`,type:'jpeg',quality:85});
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.goto('http://127.0.0.1:8892/books/hearts-in-the-void.html#station');
  await page.locator('.hv-station-art img').evaluate(n=>n.decode());
  await page.locator('.hv-station-art').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const starCount=await page.locator('[data-station-stars]').evaluate(n=>{const a=n.getContext('2d').getImageData(0,0,n.width,n.height).data;let count=0;for(let i=3;i<a.length;i+=4)if(a[i]>0)count++;return count;});
  assert.ok(starCount>100,'Visible particle starfield');
  const before=await page.locator('[data-station-stars]').evaluate(n=>n.toDataURL());await page.waitForTimeout(500);
  const after=await page.locator('[data-station-stars]').evaluate(n=>n.toDataURL());
  if(motion==='reduce')assert.equal(before,after);else assert.notEqual(before,after);
  await page.locator('.hv-station-console').screenshot({path:`output/release-final/station-${name}.jpg`,type:'jpeg',quality:90});
  assert.equal(await page.locator('.hv-station-lamp').count(),84);
  assert.equal(await page.locator('.hv-starter-portrait').count(),3);
  for(const im of await page.locator('.hv-starter-portrait').all()){await im.scrollIntoViewIfNeeded();await im.evaluate(n=>n.decode());}
  await page.locator('#first-crossing').screenshot({path:`output/release-final/starter-${name}.jpg`,type:'jpeg',quality:80});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(`PASS ${name}: all three portraits, 84 panes, ${starCount} star pixels, motion preference, no missing assets or page errors.`);
  await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
