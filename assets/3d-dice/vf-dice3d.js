import DiceBox from './dice-box.es.min.js';
import DisplayResults from './display-results.js';

const THEME_COLORS = {
  vfHope: '#f4c542',
  vfFear: '#8b5cf6',
  vfDamage: '#c92a38',
  vfNeutral: '#168ca8'
};
let box = null;
let display = null;
let initPromise = null;
let stage = null;
let labelNode = null;
let closeTimer = null;

function ensureStage(){
  if (stage) return stage;
  stage=document.createElement('section');
  stage.id='vf-dice3d-stage';
  stage.className='vf-dice3d-stage is-hidden';
  stage.setAttribute('aria-label','VeilFarers 3D dice roller');
  stage.innerHTML=`<div class="vf-dice3d-shell"><div id="vf-dice3d-box" class="vf-dice3d-box"></div><header class="vf-dice3d-hud"><div><span class="vf-dice3d-kicker">3D ROLL</span><strong id="vf-dice3d-label">Rolling…</strong></div><button type="button" id="vf-dice3d-close" aria-label="Close 3D dice">×</button></header><footer>Powered by @3d-dice/dice-box + DisplayResults · MIT</footer></div>`;
  document.body.append(stage);
  labelNode=stage.querySelector('#vf-dice3d-label');
  stage.querySelector('#vf-dice3d-close').addEventListener('click',hide);
  display=new DisplayResults('#vf-dice3d-box');
  return stage;
}
async function init(){
  if (box) return box;
  if (initPromise) return initPromise;
  ensureStage();
  initPromise=(async()=>{
    box=new DiceBox('#vf-dice3d-box',{
      assetPath:'./assets/3d-dice/assets/',
      theme:'vfNeutral',
      preloadThemes:['vfHope','vfFear','vfDamage','vfNeutral'],
      scale:5.2,
      gravity:1.15,
      mass:1.15,
      friction:0.72,
      restitution:0.64,
      spinForce:6,
      throwForce:6.5,
      startingHeight:8,
      settleTimeout:5000,
      delay:12,
      lightIntensity:1.05,
      enableShadows:true
    });
    await box.init();
    return box;
  })().catch(err=>{ box=null; initPromise=null; throw err; });
  return initPromise;
}
function show(label){
  ensureStage();
  if (labelNode) labelNode.textContent=label || 'Rolling…';
  stage.classList.remove('is-hidden');
  stage.classList.add('is-visible');
  clearTimeout(closeTimer);
}
function hide(){
  if (!stage) return;
  stage.classList.remove('is-visible');
  stage.classList.add('is-hidden');
  try { box && box.clear(); } catch(_) {}
}
function flattenResults(result){
  const groups=Array.isArray(result)?result:[result];
  const flat=[];
  groups.filter(Boolean).forEach((group,gi)=>{
    const rolls=Array.isArray(group.rolls)?group.rolls:(group.rolls?Object.values(group.rolls):[]);
    rolls.flat().forEach((roll,ri)=>flat.push({
      value:Number(roll.value), sides:Number(roll.sides||roll.die), groupIndex:gi, rollIndex:ri,
      theme:roll.theme || group.theme || '', raw:roll
    }));
  });
  return flat;
}
async function roll(groups, options={}){
  const roller=await init();
  show(options.label || 'Rolling…');
  const prepared=(Array.isArray(groups)?groups:[groups]).map(group=>{
    const theme=group.theme || 'vfNeutral';
    return {...group, theme, themeColor:group.themeColor || THEME_COLORS[theme]};
  });
  const result=await roller.roll(prepared);
  const flat=flattenResults(result);
  if (!options.deferResults) display.showResults({
    rolls:flat.map((item,i)=>({value:item.value,sides:item.sides,role:prepared[item.groupIndex] && prepared[item.groupIndex].role})),
    value:flat.reduce((n,item)=>n+item.value,0), label:options.label || ''
  });
  closeTimer=setTimeout(hide,7600);
  return {raw:result, flat, values:flat.map(item=>item.value)};
}
function showResults(data){ ensureStage(); show(data && data.label); display.showResults(data || {}); clearTimeout(closeTimer); closeTimer=setTimeout(hide,7600); }
window.VFDice3D={init,roll,showResults,hide,version:'@3d-dice/dice-box 1.1.4 + @3d-dice/dice-ui DisplayResults 0.5.2'};
