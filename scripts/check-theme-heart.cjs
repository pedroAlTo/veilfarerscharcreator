const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_BASE||'http://127.0.0.1:8893',out='output/theme-heart';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
   const qa=window.__heartQA={sources:0,frames:0,max:0,samples:[],state:''};
   const create=AudioContext.prototype.createMediaElementSource;
   AudioContext.prototype.createMediaElementSource=function(audio){qa.sources++;qa.state=this.state;return create.call(this,audio);};
   const read=AnalyserNode.prototype.getByteFrequencyData;
   AnalyserNode.prototype.getByteFrequencyData=function(data){read.call(this,data);qa.frames++;const value=data.slice(2,8).reduce((a,b)=>a+b,0);qa.max=Math.max(qa.max,value);if(qa.samples.length<200)qa.samples.push(value);};
 });
 await page.goto(base+'/books/hearts-in-the-void.html',{waitUntil:'domcontentloaded'});
 const host=page.locator('vf-theme-player'),heart=host.locator('.theme-heart'),audio=host.locator('audio');await heart.waitFor({state:'attached'});await page.waitForFunction(()=>getComputedStyle(document.querySelector('vf-theme-player').shadowRoot.querySelector('canvas')).opacity==='0');
 ok(await heart.evaluate(e=>+getComputedStyle(e).opacity===0),'Heart hidden before playback');
 ok(await page.evaluate(()=>__heartQA.sources===0),'No Web Audio routing before user choice');
 await host.getByRole('button',{name:'Play VeilFarers theme',exact:true}).click();
 await page.waitForFunction(()=>__heartQA.sources===1&&__heartQA.frames>5);
 await audio.evaluate(a=>a.currentTime=125);await page.waitForTimeout(1200);
 ok(await page.evaluate(()=>__heartQA.state==='running'&&__heartQA.max>50),'Analyser reads real bass from the supplied track');
 ok(await page.evaluate(()=>new Set(__heartQA.samples).size>5),'Spectrum varies with the music');
 ok(await heart.evaluate(e=>+getComputedStyle(e).opacity===1),'Heart revealed during playback');
 const bb=await heart.boundingBox();ok(bb.x>=0&&bb.x+bb.width<=width&&bb.height<=180,'Compact heart within viewport');
 await host.getByRole('button',{name:'Show floating lyrics',exact:true}).click();
 await audio.evaluate(a=>a.currentTime=127);await page.waitForTimeout(200);
 const lyric=await host.locator('.lyric').last().boundingBox();ok(lyric&&lyric.y<bb.y+bb.height&&lyric.y+lyric.height>bb.y,'Lyrics overlap heart region');
 ok(await heart.evaluate(e=>getComputedStyle(e).pointerEvents==='none'),'Particle layer cannot block page clicks');
 await page.screenshot({path:`${out}/heart-${width}.png`});
 await host.getByRole('button',{name:'Pause VeilFarers theme',exact:true}).click();await page.waitForTimeout(550);
 const frames=await page.evaluate(()=>__heartQA.frames);await page.waitForTimeout(150);
 ok(await page.evaluate(n=>__heartQA.frames===n,frames),'Pause stops analyser rendering');
 ok(await heart.evaluate(e=>+getComputedStyle(e).opacity===0),'Pause hides heart');
 await host.getByRole('button',{name:'Play VeilFarers theme',exact:true}).click();await page.waitForTimeout(250);
 ok(await page.evaluate(()=>__heartQA.sources===1),'Resume reuses one source without doubled audio');
 await host.getByRole('button',{name:'Music controls',exact:true}).click();await host.getByRole('button',{name:'Mute music',exact:true}).click();
 ok(await audio.evaluate(a=>a.muted),'Mute remains functional');
 await host.evaluate(e=>e.remove());await page.waitForTimeout(100);const count=await page.evaluate(()=>__heartQA.frames);await page.waitForTimeout(100);
 ok(await page.evaluate(n=>__heartQA.frames===n,count),'Removal releases renderer');ok(errors.length===0,errors.join('\n'));await context.close();
}
const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();await page.goto(base+'/behind-the-veil/',{waitUntil:'domcontentloaded'});
const host=page.locator('vf-theme-player');await host.getByRole('button',{name:'Play VeilFarers theme',exact:true}).click();await page.waitForFunction(()=>{const a=document.querySelector('vf-theme-player').shadowRoot.querySelector('audio');return !a.paused&&a.currentTime>.5;});
const first=await host.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(300);ok(await host.locator('canvas').evaluate((c,png)=>c.toDataURL()===png,first),'Reduced-motion heart stays stationary');await context.close();
// Audio must still work when the optional visualization API is unavailable.
const fallback=await browser.newContext(),q=await fallback.newPage();await q.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
await q.goto(base+'/behind-the-veil/',{waitUntil:'domcontentloaded'});await q.locator('vf-theme-player').getByRole('button',{name:'Play VeilFarers theme',exact:true}).click();await q.waitForFunction(()=>document.querySelector('vf-theme-player').shadowRoot.querySelector('audio').currentTime>.1);ok(true,'Native audio works without Web Audio');await fallback.close();
console.log(`PASS ${checks} particle-heart browser checks.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
