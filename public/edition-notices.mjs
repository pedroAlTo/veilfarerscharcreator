// Independent notice state; the shared carousel remains responsible for navigation.
let diceBox, dicePromise, diceToken=0;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const diceHost=document.querySelector('#vf-crossing-dice');
function stopDice(){diceToken++;if(diceBox)try{diceBox.clear();}catch{}if(diceHost)delete diceHost.dataset.ready;}
async function rollDice(modal){
 const token=++diceToken;
 if(motion.matches||!diceHost)return;
 try{
  if(!dicePromise)dicePromise=(async()=>{
   const {default:DiceBox}=await import('./assets/3d-dice/dice-box.es.min.js');
   const box=new DiceBox({container:'#vf-crossing-dice',assetPath:'/assets/3d-dice/assets/',origin:location.origin,
    // Account for the taller cinematic canvas: roughly twice the original on-screen size.
    theme:'vfHope',preloadThemes:['vfHope','vfFear'],scale:14.2,gravity:1.15,mass:1.15,friction:.72,restitution:.64,
    spinForce:6,throwForce:2,startingHeight:8,settleTimeout:5000,delay:12,lightIntensity:1.05,enableShadows:true,shadowTransparency:.72,offscreen:false});
   await box.init();diceBox=box;return box;
  })();
  const box=await dicePromise;
  if(token!==diceToken||!modal.open||motion.matches)return;
  window.dispatchEvent(new Event('resize'));
  diceHost.dataset.ready='true';
  await box.roll([{qty:1,sides:12,theme:'vfHope',themeColor:'#f4c542'},{qty:1,sides:12,theme:'vfFear',themeColor:'#8b5cf6'}]);
 }catch{if(token===diceToken&&diceHost)delete diceHost.dataset.ready;console.warn('First Crossing: static dice shown.');}
}
motion.addEventListener('change',()=>{stopDice();const modal=document.querySelector('#first-crossing-notice');if(modal?.open&&!motion.matches)rollDice(modal);});
document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('vf-cta-paused',document.hidden);if(document.hidden)stopDice();else{const modal=document.querySelector('#first-crossing-notice');if(modal?.open)rollDice(modal);}});
window.addEventListener('pagehide',stopDice);
if(window.VF_MINI_SURVEY_ENABLED)import('./mini-survey.mjs?v=20260909-1');
for(const modal of document.querySelectorAll('[data-simple-notice]')){
 const id=modal.dataset.ctaNotice;
 const key=id==='minis'?'vf-ancestry-minis-01-notice':`vf-${id}-notice-${id==='books'?'12.06':'1.1'}`;
 const inbox=document.querySelector('[data-cta-inbox]');let deleted=false,shelved=false;
 const shelvedKey=key+'-shelved';
 try{shelved=sessionStorage.getItem(shelvedKey)==='1';}catch{}
 try{deleted=localStorage.getItem(key)==='deleted';}catch{}
 const report=()=>window.dispatchEvent(new CustomEvent('vf:cta-inbox-update',{detail:{target:id,active:!deleted&&!modal.open,deleted,open:modal.open,auto:id!=='minis'&&!shelved&&!deleted}}));
 function close(target){shelved=true;try{sessionStorage.setItem(shelvedKey,'1');}catch{}if(id==='crossing')stopDice();modal.close();report();if(target)window.dispatchEvent(new CustomEvent('vf:cta-open',{detail:{target}}));else inbox?.focus({preventScroll:true});}
 modal.querySelector('[data-notice-minimize]').addEventListener('click',()=>close());
 modal.querySelector('[data-notice-delete]').addEventListener('click',()=>{deleted=true;try{localStorage.setItem(key,'deleted');}catch{}close();});
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});modal.addEventListener('click',e=>{if(e.target===modal)close();});
 modal.addEventListener('close',()=>{if(id==='crossing')stopDice();report();});
 window.addEventListener('vf:cta-state-request',report);
 window.addEventListener('vf:cta-switch-request',e=>{if(e.detail?.from===id&&modal.open)close(e.detail.to);});
 window.addEventListener('vf:cta-open',e=>{
  if(e.detail?.target!==id)return;
  if(e.detail.explicit){deleted=false;try{localStorage.removeItem(key);}catch{}}
  if(deleted||document.querySelector('dialog[open]'))return;
  modal.showModal();report();if(id==='crossing')rollDice(modal);
 });
 report();
}
