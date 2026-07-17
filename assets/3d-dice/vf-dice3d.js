import DiceBox from './dice-box.es.min.js';
import DisplayResults from './display-results.js';

const THEME_COLORS = {
  vfHope: '#f4c542',
  vfFear: '#8b5cf6',
  vfDamage: '#c92a38',
  vfNeutral: '#168ca8',
  vfBioHope: '#ffffff',
  vfBioFear: '#ffffff',
  vfBioDamage: '#ffffff',
  vfDiscarded: '#ffffff',
  vfPlainHope: '#ffffff',
  vfPlainFear: '#ffffff',
  vfPlainDamage: '#ffffff',
  vfPlainNeutral: '#ffffff'
};
const PRELOAD_THEMES = ['vfHope','vfFear','vfDamage','vfNeutral','vfBioHope','vfBioFear','vfBioDamage','vfDiscarded','vfPlainHope','vfPlainFear','vfPlainDamage','vfPlainNeutral'];
let box = null;
let display = null;
let initPromise = null;
let stage = null;
let labelNode = null;
let closeTimer = null;
let lastError = null;
let currentStyle = 'box';
let currentCritical = false;
let lastFlat = [];
let discardTransitionToken = 0;
const ASSET_PATH = new URL('./assets/', import.meta.url).href;

function normalizeStyle(value){ return value === 'overlay' ? 'overlay' : 'box'; }
function applyStyle(value){
  currentStyle = normalizeStyle(value);
  if (!stage) return;
  stage.classList.toggle('is-overlay', currentStyle === 'overlay');
  stage.classList.toggle('is-boxed', currentStyle !== 'overlay');
  stage.dataset.style = currentStyle;
  stage.classList.toggle('is-critical', currentCritical);
}
function applyCritical(value){
  currentCritical = !!value;
  if (stage) stage.classList.toggle('is-critical', currentCritical);
}
function ensureStage(){
  if (stage) return stage;
  stage=document.createElement('section');
  stage.id='vf-dice3d-stage';
  stage.className='vf-dice3d-stage is-hidden is-boxed';
  stage.setAttribute('aria-label','VeilFarers 3D dice roller');
  stage.innerHTML=`<div class="vf-dice3d-shell"><div id="vf-dice3d-box" class="vf-dice3d-box"></div><header class="vf-dice3d-hud"><div><span class="vf-dice3d-kicker">3D ROLL</span><strong id="vf-dice3d-label">Rolling…</strong></div><button type="button" id="vf-dice3d-close" aria-label="Close 3D dice">×</button></header><footer>Powered by @3d-dice/dice-box + DisplayResults · MIT</footer></div>`;
  document.body.append(stage);
  labelNode=stage.querySelector('#vf-dice3d-label');
  stage.querySelector('#vf-dice3d-close').addEventListener('click',hide);
  display=new DisplayResults('#vf-dice3d-box');
  applyStyle(currentStyle);
  return stage;
}
async function init(){
  if (box) return box;
  if (initPromise) return initPromise;
  ensureStage();
  initPromise=(async()=>{
    box=new DiceBox({
      container:'#vf-dice3d-box',
      assetPath:ASSET_PATH,
      origin:'',
      theme:'vfNeutral',
      preloadThemes:PRELOAD_THEMES,
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
      enableShadows:true,
      shadowTransparency:0.72,
      offscreen:false
    });
    await box.init();
    lastError=null;
    return box;
  })().catch(err=>{ box=null; initPromise=null; lastError=err; console.error('VeilFarers 3D dice initialization failed:', err); throw err; });
  return initPromise;
}
function show(label, style){
  ensureStage();
  applyStyle(style || currentStyle);
  if (labelNode) labelNode.textContent=label || 'Rolling…';
  stage.classList.remove('is-hidden');
  stage.classList.add('is-visible');
  clearTimeout(closeTimer);
  try { box && box.show(); } catch(_) {}
}
function hide(){
  if (!stage) return;
  stage.classList.remove('is-visible');
  stage.classList.add('is-hidden');
  try { box && box.clear(); } catch(_) {}
}
function flattenResults(result){
  const flat=[];
  const addRoll=(roll,groupIndex,rollIndex,group)=>{
    if (!roll || typeof roll !== 'object') return;
    const value=Number(roll.value ?? roll.result ?? roll.roll);
    const sides=Number(roll.sides ?? roll.die);
    if (!Number.isFinite(value)) return;
    flat.push({
      value,
      sides:Number.isFinite(sides)?sides:null,
      groupIndex:Number.isFinite(Number(roll.groupId))?Number(roll.groupId):groupIndex,
      rollIndex:Number.isFinite(Number(roll.rollId))?Number(roll.rollId):rollIndex,
      theme:roll.theme || (group && group.theme) || '',
      raw:roll
    });
  };
  const groups=Array.isArray(result)?result:[result];
  groups.filter(Boolean).forEach((group,groupIndex)=>{
    if (Array.isArray(group)) {
      group.forEach((roll,rollIndex)=>addRoll(roll,groupIndex,rollIndex,null));
      return;
    }
    if (Array.isArray(group.rolls)) {
      group.rolls.forEach((roll,rollIndex)=>addRoll(roll,groupIndex,rollIndex,group));
      return;
    }
    if (group.rolls && typeof group.rolls === 'object') {
      Object.values(group.rolls).forEach((roll,rollIndex)=>addRoll(roll,groupIndex,rollIndex,group));
      return;
    }
    addRoll(group,groupIndex,0,null);
  });
  return flat;
}
async function roll(groups, options={}){
  const roller=await init();
  applyCritical(false);
  show(options.label || 'Rolling…', options.style);
  const prepared=(Array.isArray(groups)?groups:[groups]).map(group=>{
    const theme=group.theme || 'vfNeutral';
    return {...group, theme, themeColor:group.themeColor || THEME_COLORS[theme] || '#ffffff'};
  });
  const result=await roller.roll(prepared);
  const flat=flattenResults(result);
  lastFlat=flat.slice();
  if (!flat.length) throw new Error('The 3D engine completed without readable die results.');
  if (!options.deferResults) display.showResults({
    rolls:flat.map((item)=>({value:item.value,sides:item.sides,role:prepared[item.groupIndex] && prepared[item.groupIndex].role})),
    value:flat.reduce((n,item)=>n+item.value,0), label:options.label || ''
  });
  closeTimer=setTimeout(hide,7600);
  return {raw:result, flat, values:flat.map(item=>item.value)};
}
async function applyDiscardedDice(data){
  const rolls=Array.isArray(data && data.rolls)?data.rolls:[];
  const dropped=[];
  rolls.forEach((roll,index)=>{ if (roll && (roll.drop || roll.status==='discarded' || String(roll.role||'').toUpperCase()==='DROP')) dropped.push(index); });
  if (!dropped.length || !box || !lastFlat.length) return;
  const token=++discardTransitionToken;
  if (stage) stage.classList.add('is-discard-fading');
  await new Promise(resolve=>setTimeout(resolve,260));
  if (token!==discardTransitionToken) return;
  for (const index of dropped){
    const source=lastFlat[index] && lastFlat[index].raw;
    if (!source || source.groupId == null || source.rollId == null) continue;
    const replacement={...source,theme:'vfDiscarded',themeColor:'#ffffff'};
    try {
      await box.remove({groupId:source.groupId,rollId:source.rollId});
      const added=await box.add(replacement,{newStartPoint:false});
      const addedFlat=flattenResults(added);
      if (addedFlat.length) lastFlat[index]=addedFlat[0];
    } catch (error) {
      console.warn('Could not replace discarded 3D die with gray-off material:', error);
    }
  }
  if (stage) {
    stage.classList.remove('is-discard-fading');
    stage.classList.add('has-discarded-die');
  }
}
function showResults(data){
  ensureStage();
  show(data && data.label, data && data.style);
  applyCritical(!!(data && data.crit));
  display.showResults(data || {});
  applyDiscardedDice(data || {});
  clearTimeout(closeTimer);
  closeTimer=setTimeout(hide,7600);
}
window.VFDice3D={
  init,roll,showResults,hide,setStyle:applyStyle,setCritical:applyCritical,
  status:()=>({ready:!!box,assetPath:ASSET_PATH,style:currentStyle,critical:currentCritical,error:lastError?String(lastError.message||lastError):null}),
  version:'@3d-dice/dice-box 1.1.4 + @3d-dice/dice-ui DisplayResults 0.5.2'
};
