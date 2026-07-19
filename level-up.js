(function(){
'use strict';

const TRAIT_IDS=['agility','strength','finesse','knowledge','instinct','presence'];
const TIER_LEVELS=new Set([2,5,8]);
const copy=value=>JSON.parse(JSON.stringify(value));
const number=value=>Number(value)||0;
const tierFor=level=>Number(level)>=8?3:Number(level)>=5?2:1;
const resolveBase=level=>Number(level)>=8?6:Number(level)>=5?4:2;
const lower=value=>String(value||'').trim().toLowerCase();
const safe=value=>typeof esc==='function'?esc(value):String(value==null?'':value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const attr=value=>safe(value).replace(/`/g,'&#96;');

let resolveMoves=[];
let canonicalClasses=[];
let canonicalSubclasses=[];
let canonicalPowers=[];
let vaultLoading=false;
let vaultError='';
let vaultLoaded=false;
let selectedVaultId='';
let pendingTrashId='';
let plan=freshPlan();

function freshPlan(){
  return {
    choices:[],
    details:{},
    tier:{mode:'existing',a:0,b:1,existing:0,newName:''},
    message:'',
    applied:false
  };
}

function injectStyles(){
  if(document.getElementById('vf-levelup-v5948-style'))return;
  const style=document.createElement('style');
  style.id='vf-levelup-v5948-style';
  style.textContent=`
    .levelup-vault-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:14px}
    .levelup-vault-character{display:flex;flex-direction:column;gap:10px;text-align:left;border:1px solid rgba(233,192,104,.22);border-radius:13px;background:rgba(255,255,255,.025);padding:14px;color:var(--text-mid);cursor:pointer;transition:.18s ease}
    .levelup-vault-character:hover,.levelup-vault-character.active{border-color:rgba(233,192,104,.72);background:rgba(233,192,104,.08);transform:translateY(-1px)}
    .levelup-vault-character strong{color:#fff6d8;font:600 15px/1.2 Cinzel,serif}.levelup-vault-character small{color:var(--text-dim);font:500 9px/1.45 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
    .levelup-card.option{position:relative;margin:0;display:flex;flex-direction:column;min-height:230px}.levelup-card.option.selected{border-color:rgba(132,204,22,.72);box-shadow:0 0 0 1px rgba(132,204,22,.16),0 16px 40px rgba(0,0,0,.22)}
    .levelup-card.option.locked{opacity:.58}.levelup-card.option .option-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.levelup-card.option .option-cost{white-space:nowrap;border:1px solid rgba(233,192,104,.28);border-radius:999px;padding:5px 8px;font:700 9px/1 'JetBrains Mono',monospace;color:var(--gold-1);text-transform:uppercase}
    .levelup-card.option .option-reason{margin-top:auto;border-top:1px solid rgba(255,255,255,.07);padding-top:10px;color:#e6a5a5;font-size:10px}.levelup-card.option .btn{margin-top:auto}
    .levelup-choice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:8px;margin:10px 0}.levelup-choice{border:1px solid rgba(233,192,104,.22);border-radius:10px;background:rgba(0,0,0,.2);padding:10px;color:var(--text-mid);text-align:left;cursor:pointer}.levelup-choice:hover,.levelup-choice.active{border-color:rgba(233,192,104,.72);background:rgba(233,192,104,.1);color:#fff6d8}.levelup-choice:disabled{opacity:.38;cursor:not-allowed}
    .levelup-choice strong{display:block;color:inherit;font-size:11px}.levelup-choice span{display:block;margin-top:4px;color:var(--text-dim);font-size:9px;line-height:1.4}
    .levelup-config{margin-top:12px;padding-top:12px;border-top:1px solid rgba(233,192,104,.16)}.levelup-config label{display:block;margin:8px 0;color:var(--text-dim);font:700 9px/1.4 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.levelup-config input,.levelup-config textarea{box-sizing:border-box;width:100%;margin-top:6px;border:1px solid rgba(233,192,104,.26);border-radius:10px;background:rgba(0,0,0,.26);color:#fff6d8;padding:10px 11px;outline:none}.levelup-config textarea{min-height:82px;resize:vertical}.levelup-config input:focus,.levelup-config textarea:focus{border-color:rgba(233,192,104,.72)}
    .levelup-summary{display:grid;gap:7px;margin-top:12px}.levelup-summary-row{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(255,255,255,.06);padding:8px 0;font-size:11px}.levelup-summary-row strong{color:#fff6d8}.levelup-delta{color:#9fdb8c;font-family:'JetBrains Mono',monospace}.levelup-error{border:1px solid rgba(248,113,113,.5);border-radius:10px;background:rgba(127,29,29,.22);color:#fecaca;padding:10px 12px;font-size:11px}.levelup-success{border:1px solid rgba(132,204,22,.45);border-radius:10px;background:rgba(54,83,20,.2);color:#d9f99d;padding:10px 12px;font-size:11px}
    .levelup-inline-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.levelup-mini{padding:7px 9px;font-size:9px}.levelup-option-description{min-height:62px}.levelup-section-kicker{font:700 9px/1 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim);margin-bottom:7px}
  `;
  document.head.appendChild(style);
}

function ensureState(){
  state.characterId=String(state.characterId||'');
  state.level=Math.max(1,Math.min(10,number(state.level)||1));
  state.proficiency=Math.max(1,Math.min(6,number(state.proficiency)||1));
  state.hpMaxBonus=number(state.hpMaxBonus);
  state.stressMaxBonus=number(state.stressMaxBonus);
  state.evasionBonus=number(state.evasionBonus);
  state.technologyAccessLevel=Math.max(1,number(state.technologyAccessLevel)||1);
  state.resolveMaxBonus=number(state.resolveMaxBonus);
  state.resolveDie=state.resolveDie==='d6'?'d6':'d4';
  state.temperedResolve=state.resolveDie==='d6'||!!state.temperedResolve;
  if(!Array.isArray(state.experiences))state.experiences=[];
  while(state.experiences.length<3)state.experiences.push('');
  if(!Array.isArray(state.experienceBonuses))state.experienceBonuses=[];
  while(state.experienceBonuses.length<state.experiences.length)state.experienceBonuses.push(2);
  state.experienceBonuses=state.experienceBonuses.map(value=>Math.max(2,Math.min(5,number(value)||2)));
  if(!Array.isArray(state.resolveMoves))state.resolveMoves=[];
  if(!Array.isArray(state.vaultPowers))state.vaultPowers=[];
  if(!Array.isArray(state.advancementHistory))state.advancementHistory=[];
  if(!state.traitAdvances||typeof state.traitAdvances!=='object')state.traitAdvances={};
  state.subclassRank=['Foundation','Specialization','Mastery'].includes(state.subclassRank)?state.subclassRank:'Foundation';
  if(!state.traits||typeof state.traits!=='object')state.traits={};
  TRAIT_IDS.forEach(id=>{if(!Number.isFinite(Number(state.traits[id])))state.traits[id]=0;});
}

function classCatalogue(){
  if(canonicalClasses.length){
    return canonicalClasses.map(record=>{
      const base=record.rules||record;
      const rules=state.path==='Sleeping'?(base.sleepingRules||base):(base.awakenedRules||base);
      return {...rules,id:rules.id||record.slug||record.id,name:rules.name||record.name,domainList:rules.domainList||record.domains||[],_vfCanonicalRecord:record};
    });
  }
  return typeof CLASSES!=='undefined'?CLASSES:[];
}
function currentClass(){return classCatalogue().find(item=>item.id===state.cls||lower(item.name)===lower(state.cls))||null;}
function classRules(cls){return cls?(cls._vfCanonicalRecord?cls:(typeof classPathRules==='function'?(classPathRules(cls)||cls):cls)):null;}
function classDomains(cls){
  if(!cls)return [];
  const rules=classRules(cls)||cls;
  const list=rules.domainList||cls.domainList||cls.domains||[];
  return Array.isArray(list)?list:String(list).split(/\s*&\s*|\s*,\s*/).filter(Boolean);
}
function currentDomains(){
  const domains=typeof getCharDomains==='function'?getCharDomains():classDomains(currentClass());
  const all=Array.from(new Set((domains||[]).filter(Boolean)));
  if(state.multiclass&&state.multiclass.domain&&!all.includes(state.multiclass.domain))all.push(state.multiclass.domain);
  return all;
}
function currentSubclass(){
  const cls=currentClass();
  const classLabel=lower(cls?.name||className());
  const canonical=canonicalSubclasses.find(item=>lower(item.className)===classLabel&&lower(item.name)===lower(state.subclass));
  if(canonical){
    const rules=state.path==='Sleeping'?(canonical.sleepingRules||canonical.rules):(canonical.rules||canonical.sleepingRules);
    return rules?{...rules,_vfCanonicalRecord:canonical}:null;
  }
  const list=cls?(Array.isArray(cls.subclasses)?cls.subclasses:(typeof classSubclassList==='function'?classSubclassList(cls):[])):[];
  return (list||[]).find(item=>lower(item.name)===lower(state.subclass))||null;
}
function subclassNext(){
  const subclass=currentSubclass();
  const target=state.subclassRank==='Foundation'?'Specialization':'Mastery';
  const key=target.toLowerCase();
  const feature=subclass&&subclass[key];
  return {target,feature:feature||null,subclass};
}
function className(){return currentClass()?.name||state.cls||'';}

function experienceLabel(index){
  const name=String(state.experiences[index]||'').trim()||`Experience ${index+1}`;
  return `${name} (+${state.experienceBonuses[index]||2})`;
}
function experienceButtons(selected,handler,exclude=[]){
  return `<div class="levelup-choice-grid">${state.experiences.map((_,index)=>`<button type="button" class="levelup-choice ${Number(selected)===index?'active':''}" ${exclude.includes(index)?'disabled':''} onclick="${handler}(${index})"><strong>${safe(experienceLabel(index))}</strong></button>`).join('')}</div>`;
}
function chipButtons(items,selected,handler,disabledFn){
  return `<div class="levelup-choice-grid">${items.map(item=>{
    const value=String(item.value??item.id??item.name??item);
    const off=disabledFn&&disabledFn(item);
    return `<button type="button" class="levelup-choice ${String(selected)===value?'active':''}" ${off?'disabled':''} onclick="${handler}('${attr(value)}')"><strong>${safe(item.label||item.name||item)}</strong>${item.meta?`<span>${safe(item.meta)}</span>`:''}</button>`;
  }).join('')}</div>`;
}

function traitRaisedThisTier(trait,target){
  const key=String(tierFor(target));
  const direct=Array.isArray(state.traitAdvances[key])?state.traitAdvances[key]:[];
  const history=(state.advancementHistory||[]).filter(entry=>Number(entry.tier)===tierFor(target)).flatMap(entry=>entry.traits||[]);
  return direct.concat(history).includes(trait);
}

function ownedPowerKeys(){
  const raw=[...(state.powers||[]),...(state.vaultPowers||[])].map(lower);
  return new Set(raw);
}
function availablePowers(target){
  const primary=new Set((typeof getCharDomains==='function'?getCharDomains():classDomains(currentClass())).filter(Boolean));
  const multi=state.multiclass&&state.multiclass.domain;
  const owned=ownedPowerKeys();
  return (canonicalPowers.length?canonicalPowers:(typeof POWERS147!=='undefined'?POWERS147:[])).filter(power=>{
    const domain=power.d||power.domain;
    const level=number(power.l||power.level)||1;
    const effective=multi&&domain===multi?Math.ceil(target/2):target;
    if(!primary.has(domain)&&domain!==multi)return false;
    const key1=lower(`${domain}::${power.n||power.name}`);
    const key2=lower(`${domain} · L${level} · ${power.n||power.name}`);
    const key3=lower(power.id);
    return level<=effective&&!owned.has(key1)&&!owned.has(key2)&&!owned.has(key3);
  }).sort((a,b)=>number(a.l||a.level)-number(b.l||b.level)||String(a.d||a.domain).localeCompare(String(b.d||b.domain))||String(a.n||a.name).localeCompare(String(b.n||b.name)));
}
function powerByValue(value,target){return availablePowers(target).find(power=>power.id===value||`${power.d||power.domain}::${power.n||power.name}`===value)||null;}

function availableResolveMoves(){
  const cls=lower(className());
  const subclass=lower(state.subclass);
  const owned=new Set((state.resolveMoves||[]).map(item=>lower(typeof item==='string'?item:item.name||item.id)));
  return (resolveMoves||[]).filter(move=>{
    if(lower(move.class)!==cls)return false;
    if(move.subclass&&lower(move.subclass)!==subclass)return false;
    return !owned.has(lower(move.name))&&!owned.has(lower(move.id));
  });
}
function resolveMoveById(id){return availableResolveMoves().find(move=>move.id===id)||null;}

function definitions(target){
  const targetTier=tierFor(target);
  const sleeping=state.path==='Sleeping';
  const subclass=subclassNext();
  const defs=[
    {id:'hp',cost:1,title:'+1 Hit Point Slot',text:'Permanent HP maximum +1.'},
    {id:'stress',cost:1,title:'+1 Stress Slot',text:'Permanent Stress maximum +1.'},
    {id:'experiences',cost:1,title:'+1 to Experiences',text:'Two existing Experiences +1 each, or add one new Experience at +2 and one existing Experience +1.'},
    {id:'trait',cost:1,title:'+1 to a Trait',text:'One Trait +1. A Trait can be raised only once per Tier.'},
    {id:'evasion',cost:1,title:'+1 Evasion',text:'Permanent Evasion +1.'},
    {id:'proficiency',cost:2,title:'+1 Proficiency',text:'Damage Proficiency +1. Maximum 6.',disabled:state.proficiency>=6,reason:'Already at the Proficiency cap of 6.'},
    {id:'tech',cost:1,title:'+1 Technology Access',text:'Technology Access Level +1.'},
    {id:'power',cost:1,title:sleeping?'Resolve Growth':'New Domain Power',text:sleeping?'Choose +1 Resolve maximum or learn one available Class Resolve Move.':'Choose one eligible Power from an accessible Domain. It enters the Vault.',disabled:sleeping?false:availablePowers(target).length===0,reason:'No unowned Powers are currently eligible.'},
    {id:'multiclass',cost:2,title:'Multiclass',text:'Tier 2+. Add a second Class Feature, one genuinely new Domain and its Background Question.',disabled:target<5||!!state.multiclass,reason:target<5?'Unlocks at Level 5.':'This character has already multiclassed.'},
    {id:'subclass',cost:2,title:'Upgraded Subclass',text:subclass.target==='Specialization'?'Gain the current Subclass Specialization Feature.':'Gain the current Subclass Mastery Feature.',disabled:target<5||state.subclassRank==='Mastery'||(state.subclassRank==='Specialization'&&targetTier<3)||!subclass.feature,reason:target<5?'Unlocks at Level 5.':state.subclassRank==='Mastery'?'Subclass already at Mastery.':(state.subclassRank==='Specialization'&&targetTier<3)?'Mastery unlocks at Tier 3.':'No matching canonical Subclass Feature was found.'},
    {id:'tempered',cost:2,title:'Tempered Resolve',text:'Sleeping Tier 3 only. Upgrade the entire Resolve pool from d4 to d6.',disabled:!sleeping||targetTier<3||state.resolveDie==='d6',reason:!sleeping?'Sleeping characters only.':targetTier<3?'Unlocks at Level 8.':'Resolve dice are already d6.'}
  ];
  return defs;
}
function definition(id,target){return definitions(target).find(item=>item.id===id);}
function slotsUsed(target=state.level+1){return plan.choices.reduce((sum,id)=>sum+(definition(id,target)?.cost||0),0);}

function toggleOption(id){
  ensureState();
  const target=Math.min(10,state.level+1);
  const def=definition(id,target);
  if(!def||def.disabled)return;
  if(plan.choices.includes(id)){
    plan.choices=plan.choices.filter(value=>value!==id);
    delete plan.details[id];
  }else if(def.cost===2){
    plan.choices=[id];plan.details={};
  }else{
    plan.choices=plan.choices.filter(value=>(definition(value,target)?.cost||0)!==2);
    if(slotsUsed(target)<2)plan.choices.push(id);
  }
  plan.message='';plan.applied=false;render();
}
function setDetail(id,key,value){
  plan.details[id]={...(plan.details[id]||{}),[key]:value};
  plan.message='';render();
}
function setTier(key,value){plan.tier={...plan.tier,[key]:value};plan.message='';render();}

function configExperiences(id){
  const data=plan.details[id]||{mode:'existing',a:0,b:1,existing:0,newName:''};
  const mode=data.mode||'existing';
  return `<div class="levelup-config"><div class="levelup-section-kicker">Experience growth</div>${chipButtons([{value:'existing',label:'Two existing',meta:'+1 each'},{value:'new',label:'New + existing',meta:'New at +2; existing +1'}],mode,`VFLevelUp.detail.bind(null,'${id}','mode')`)}${mode==='existing'?`<label>First Experience${experienceButtons(number(data.a),`VFLevelUp.detail.bind(null,'${id}','a')`)}</label><label>Second Experience${experienceButtons(data.b==null?1:number(data.b),`VFLevelUp.detail.bind(null,'${id}','b')`,[number(data.a)])}</label>`:`<label>New Experience name<input value="${attr(data.newName||'')}" oninput="VFLevelUp.detail('${id}','newName',this.value)" placeholder="A concise invocable phrase"></label><label>Existing Experience +1${experienceButtons(number(data.existing),`VFLevelUp.detail.bind(null,'${id}','existing')`)}</label>`}</div>`;
}
function configTrait(target){
  const data=plan.details.trait||{};
  const items=TRAIT_IDS.map(id=>({value:id,label:id[0].toUpperCase()+id.slice(1),meta:`${number(state.traits[id])>=0?'+':''}${number(state.traits[id])}${traitRaisedThisTier(id,target)?' · already raised this Tier':''}`}));
  return `<div class="levelup-config"><div class="levelup-section-kicker">Choose Trait</div>${chipButtons(items,data.trait,`VFLevelUp.detail.bind(null,'trait','trait')`,item=>traitRaisedThisTier(item.value,target))}</div>`;
}
function configPower(target){
  const data=plan.details.power||{};
  if(state.path==='Sleeping'){
    const type=data.type||'resolve';
    const moves=availableResolveMoves();
    return `<div class="levelup-config"><div class="levelup-section-kicker">Resolve growth</div>${chipButtons([{value:'resolve',label:'+1 Resolve maximum',meta:`${Math.min(10,resolveBase(target)+state.resolveMaxBonus)} → ${Math.min(10,resolveBase(target)+state.resolveMaxBonus+1)}`},{value:'move',label:'Learn Resolve Move',meta:`${moves.length} available`}],type,`VFLevelUp.detail.bind(null,'power','type')`)}${type==='move'?`<div class="levelup-choice-grid">${moves.map(move=>`<button type="button" class="levelup-choice ${data.moveId===move.id?'active':''}" onclick="VFLevelUp.detail('power','moveId','${attr(move.id)}')"><strong>${safe(move.name)}</strong><span>${safe(move.cost)} · ${safe(move.text)}</span></button>`).join('')||'<p>No unowned canonical Resolve Move is available for this Class/Subclass.</p>'}</div>`:''}</div>`;
  }
  const powers=availablePowers(target);
  const grouped={};powers.forEach(power=>{const domain=power.d||power.domain;(grouped[domain]||(grouped[domain]=[])).push(power);});
  return `<div class="levelup-config"><div class="levelup-section-kicker">Eligible Domain Powers</div>${Object.entries(grouped).map(([domain,list])=>`<p><strong>${safe(domain)}</strong></p><div class="levelup-choice-grid">${list.map(power=>`<button type="button" class="levelup-choice ${data.powerId===power.id?'active':''}" onclick="VFLevelUp.detail('power','powerId','${attr(power.id)}')"><strong>${safe(`L${power.l||power.level} · ${power.n||power.name}`)}</strong><span>${safe([power.t||power.powerType,power.cost,power.dc].filter(Boolean).join(' · '))}<br>${safe(power.txt||power.text||'')}</span></button>`).join('')}</div>`).join('')||'<p>No eligible Powers remain.</p>'}</div>`;
}
function multiclassOptions(){
  return classCatalogue().filter(cls=>cls.id!==state.cls).map(cls=>({value:cls.id,label:cls.name,meta:classDomains(cls).join(' · ')}));
}
function configMulticlass(target){
  const data=plan.details.multiclass||{};
  const cls=classCatalogue().find(item=>item.id===data.classId)||null;
  const rules=classRules(cls);
  const existing=new Set(currentDomains().map(lower));
  const domains=classDomains(cls).filter(domain=>!existing.has(lower(domain)));
  const feature=rules&&rules.classFeature;
  return `<div class="levelup-config"><div class="levelup-section-kicker">Choose second Class</div>${chipButtons(multiclassOptions(),data.classId,`VFLevelUp.detail.bind(null,'multiclass','classId')`)}${cls?`<div class="levelup-note"><strong>${safe(feature?.name||'Class Feature')}</strong> — ${safe(feature?.text||'No canonical path-specific Class Feature was found.')}</div><div class="levelup-section-kicker" style="margin-top:14px">Choose genuinely new Domain</div>${chipButtons(domains.map(domain=>({value:domain,label:domain,meta:`Effective Domain level ${Math.ceil(target/2)}`})),data.domain,`VFLevelUp.detail.bind(null,'multiclass','domain')`)}<label>${safe(rules?.bgQuestion||cls.bgQuestion||'Background Question')}<textarea oninput="VFLevelUp.detail('multiclass','answer',this.value)">${safe(data.answer||'')}</textarea></label>`:''}</div>`;
}
function configSubclass(){
  const next=subclassNext();
  return `<div class="levelup-config"><div class="levelup-section-kicker">${safe(next.target)} Feature</div><p><strong>${safe(next.feature?.name||'Unavailable')}</strong> · ${safe(next.feature?.type||'')}</p><p>${safe(next.feature?.desc||next.feature?.text||'No canonical feature text was found.')}</p></div>`;
}
function configFor(id,target){
  if(id==='experiences')return configExperiences(id);
  if(id==='trait')return configTrait(target);
  if(id==='power')return configPower(target);
  if(id==='multiclass')return configMulticlass(target);
  if(id==='subclass')return configSubclass();
  return '';
}

function tierConfig(target){
  if(!TIER_LEVELS.has(target))return '';
  const mode=plan.tier.mode||'existing';
  return `<section class="levelup-card"><div class="levelup-section-kicker">Automatic package</div><h3>Tier Achievement · Level ${target}</h3><p><strong>+1 Proficiency</strong> and Experience growth, in addition to the two Advancement Slots.${target===5||target===8?' Marked Traits are also cleared.':''}</p>${chipButtons([{value:'existing',label:'Two existing Experiences',meta:'+1 each'},{value:'new',label:'New + existing',meta:'New at +2; existing +1'}],mode,'VFLevelUp.tier.bind(null,\'mode\')')}${mode==='existing'?`<label>First Experience${experienceButtons(number(plan.tier.a),'VFLevelUp.tier.bind(null,\'a\')')}</label><label>Second Experience${experienceButtons(plan.tier.b==null?1:number(plan.tier.b),'VFLevelUp.tier.bind(null,\'b\')',[number(plan.tier.a)])}</label>`:`<div class="levelup-config"><label>New Experience name<input value="${attr(plan.tier.newName||'')}" oninput="VFLevelUp.tier('newName',this.value)" placeholder="A concise invocable phrase"></label><label>Existing Experience +1${experienceButtons(number(plan.tier.existing),'VFLevelUp.tier.bind(null,\'existing\')')}</label></div>`}</section>`;
}

function recordSummary(record){return window.VeilFarersCharacterRegistry?.summary(record)||{characterId:record.characterId,name:'Unnamed Veilfarer',level:1,path:'',className:'',updatedAt:''};}
function vaultRecords(){const registry=window.VeilFarersCharacterRegistry;return registry?(registry.listForCurrentUser?registry.listForCurrentUser({includeUnowned:true,completedOnly:true}):registry.list()):[];}
async function refreshVault(){
  if(!window.VeilFarersCharacterRegistry)return;
  vaultLoading=true;vaultError='';render();
  try{await window.VeilFarersCharacterRegistry.refreshVault({force:true});vaultLoaded=true;}
  catch(error){vaultError=error.message||String(error);}
  finally{vaultLoading=false;render();}
}
function selectCharacter(id){
  const record=window.VeilFarersCharacterRegistry?.get(id);
  let creator=record?.characterData?.creatorState;
  if(!creator&&window.VFNormalizeCreatorImport){try{creator=window.VFNormalizeCreatorImport(record?.characterData?.sheetPayload||record?.characterData?.playerCharacter||record);}catch(_){}}
  if(!creator){plan.message='This Vault record has no editable Creator build.';render();return;}
  state=copy(creator);ensureState();state.characterId=record.characterId;selectedVaultId=record.characterId;plan=freshPlan();
  try{window.VeilFarersCharacterRegistry.setCurrentId(record.characterId);autosave();syncFieldsFromState();canonicalizeLevelState();}catch(_){ }
  render();
}
async function trashCharacter(id,event){
  event&&event.stopPropagation();
  if(pendingTrashId!==id){pendingTrashId=id;render();return;}
  pendingTrashId='';
  await window.VeilFarersCharacterRegistry.trash(id,{source:'level-up-vault'});
  if(selectedVaultId===id){selectedVaultId='';state=freshState();ensureState();autosave();syncFieldsFromState();}
  render();
}
function cancelTrash(event){event&&event.stopPropagation();pendingTrashId='';render();}


async function importLevelUpFile(event){
  const file=event?.target?.files?.[0];if(!file)return;
  try{
    const raw=JSON.parse(await file.text());
    if(!window.VFNormalizeCreatorImport)throw Error('The shared character importer is unavailable.');
    const imported=window.VFNormalizeCreatorImport(raw);
    const registered=window.VFRegisterImportedCreatorState?await window.VFRegisterImportedCreatorState(imported,'level-up-json-import'):imported;
    state=copy(registered);ensureState();selectedVaultId=state.characterId;plan=freshPlan();vaultError='';autosave();syncFieldsFromState();canonicalizeLevelState();
    plan.message=`Imported ${state.characterId||'character'} and added it to Character Vault.`;plan.applied=true;
  }catch(error){plan.message='Import failed: '+(error.message||String(error));plan.applied=false;}
  event.target.value='';render();
}
function chooseImportFile(){const input=document.getElementById('vf-levelup-import');if(input){input.value='';input.click();}}

function renderVault(){
  const records=vaultRecords();
  return `<section class="levelup-card"><div class="levelup-inline-actions" style="justify-content:space-between"><div><div class="levelup-section-kicker">Character Vault</div><h3>Select a saved character</h3></div><div class="levelup-inline-actions"><button class="btn btn-secondary levelup-mini" onclick="VFLevelUp.chooseImport()">Import JSON</button><button class="btn btn-secondary levelup-mini" onclick="VFLevelUp.refreshVault()" ${vaultLoading?'disabled':''}>${vaultLoading?'Refreshing…':'Refresh cloud Vault'}</button></div></div><input id="vf-levelup-import" type="file" accept="application/json,.json" hidden onchange="VFLevelUp.importFile(event)"><p>Level Up edits the same permanent <code>VF-######</code> record used by Charsheet and Player Tool. Older Creator, Charsheet and Player Tool JSON files are upgraded into the Vault on import.</p>${vaultError?`<div class="levelup-error">Vault refresh warning: ${safe(vaultError)}. Loaded local records remain available.</div>`:''}<div class="levelup-vault-list">${records.map(record=>{const item=recordSummary(record);const confirming=pendingTrashId===item.characterId;return `<article class="levelup-vault-character ${item.characterId===state.characterId?'active':''}" role="button" tabindex="0" onclick="VFLevelUp.select('${attr(item.characterId)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();VFLevelUp.select('${attr(item.characterId)}')}"><strong>${safe(item.name)}</strong><small>${safe(item.characterId)} · Level ${item.level} · ${safe([item.path,item.className,item.subclass].filter(Boolean).join(' · '))}</small><span class="levelup-inline-actions"><span class="levelup-badge">${safe(item.cloudState)}</span>${confirming?`<span class="levelup-error" style="padding:7px 9px">Move to Trash?</span><span class="btn btn-primary levelup-mini" role="button" onclick="VFLevelUp.trash('${attr(item.characterId)}',event)">Confirm</span><span class="btn btn-secondary levelup-mini" role="button" onclick="VFLevelUp.cancelTrash(event)">Cancel</span>`:`<span class="btn btn-secondary levelup-mini" role="button" onclick="VFLevelUp.trash('${attr(item.characterId)}',event)">Trash</span>`}</span></article>`;}).join('')||'<p>No completed characters are saved in this browser yet.</p>'}</div></section>`;
}

function validateExperienceChoice(data,label){
  const mode=data.mode||'existing';
  if(mode==='existing'){
    if(state.experiences.length<2)throw Error(`${label}: two existing Experiences are required.`);
    if(number(data.a)===number(data.b==null?1:data.b))throw Error(`${label}: choose two different Experiences.`);
  }else{
    if(!String(data.newName||'').trim())throw Error(`${label}: enter the new Experience name.`);
    if(state.experiences.some(name=>lower(name)===lower(data.newName)))throw Error(`${label}: that Experience already exists.`);
  }
}
function validate(target){
  if(!state.characterId)throw Error('Select a saved Vault character before applying Level Up.');
  if(state.level>=10)throw Error('This character is already Level 10.');
  const used=slotsUsed(target);
  if(used<1||used>2)throw Error('Choose one or two Advancement Slots.');
  if(TIER_LEVELS.has(target))validateExperienceChoice(plan.tier,'Tier Achievement');
  for(const id of plan.choices){
    const data=plan.details[id]||{};
    const def=definition(id,target);
    if(!def||def.disabled)throw Error(`${def?.title||id} is not currently available.`);
    if(id==='experiences')validateExperienceChoice(data,'Experience advancement');
    if(id==='trait'&&(!data.trait||traitRaisedThisTier(data.trait,target)))throw Error('Choose a Trait that has not already been raised in this Tier.');
    if(id==='power'&&state.path==='Sleeping'){
      const type=data.type||'resolve';
      if(type==='resolve'&&resolveBase(target)+state.resolveMaxBonus>=10)throw Error('Resolve maximum is already at the hard ceiling of 10.');
      if(type==='move'&&!resolveMoveById(data.moveId))throw Error('Choose an available canonical Resolve Move.');
    }
    if(id==='power'&&state.path!=='Sleeping'&&!powerByValue(data.powerId,target))throw Error('Choose an eligible Domain Power.');
    if(id==='multiclass'){
      const cls=classCatalogue().find(item=>item.id===data.classId);
      if(!cls)throw Error('Choose a second Class.');
      if(!classDomains(cls).includes(data.domain)||currentDomains().map(lower).includes(lower(data.domain)))throw Error('Choose a genuinely new Domain from the second Class.');
      if(!String(data.answer||'').trim())throw Error('Answer the second Class Background Question.');
    }
  }
}

function addExperience(name,bonus=2){state.experiences.push(String(name).trim());state.experienceBonuses.push(Math.max(2,Math.min(5,number(bonus)||2)));return state.experiences.length-1;}
function incrementExperience(index){if(index<0||index>=state.experienceBonuses.length)return;state.experienceBonuses[index]=Math.min(5,number(state.experienceBonuses[index]||2)+1);}
function applyExperienceChoice(data){
  if((data.mode||'existing')==='existing'){
    incrementExperience(number(data.a));incrementExperience(number(data.b==null?1:data.b));
    return {mode:'existing',indices:[number(data.a),number(data.b==null?1:data.b)]};
  }
  const newIndex=addExperience(data.newName,2);incrementExperience(number(data.existing));
  return {mode:'new',newIndex,newName:String(data.newName).trim(),existing:number(data.existing)};
}

function previewRows(target){
  const rows=[['Level',state.level,target]];
  if(TIER_LEVELS.has(target))rows.push(['Proficiency',state.proficiency,Math.min(6,state.proficiency+1)]);
  for(const id of plan.choices){
    const data=plan.details[id]||{};
    if(id==='hp')rows.push(['HP maximum bonus',state.hpMaxBonus,state.hpMaxBonus+1]);
    if(id==='stress')rows.push(['Stress maximum bonus',state.stressMaxBonus,state.stressMaxBonus+1]);
    if(id==='evasion')rows.push(['Evasion bonus',state.evasionBonus,state.evasionBonus+1]);
    if(id==='proficiency')rows.push(['Proficiency',state.proficiency,Math.min(6,state.proficiency+1)]);
    if(id==='tech')rows.push(['Technology Access',state.technologyAccessLevel,state.technologyAccessLevel+1]);
    if(id==='trait'&&data.trait)rows.push([data.trait[0].toUpperCase()+data.trait.slice(1),state.traits[data.trait],state.traits[data.trait]+1]);
    if(id==='power'&&state.path==='Sleeping'&&(data.type||'resolve')==='resolve')rows.push(['Resolve maximum',Math.min(10,resolveBase(target)+state.resolveMaxBonus),Math.min(10,resolveBase(target)+state.resolveMaxBonus+1)]);
    if(id==='subclass')rows.push(['Subclass rank',state.subclassRank,subclassNext().target]);
    if(id==='tempered')rows.push(['Resolve die',state.resolveDie,'d6']);
  }
  return rows;
}

async function ensureCharacterId(){
  const registry=window.VeilFarersCharacterRegistry;
  if(!registry)throw Error('Character Vault registry is not loaded.');
  const record=await registry.ensureId({characterId:state.characterId,creatorState:state},{source:'level-up'});
  state.characterId=record.characterId;autosave();registry.renderBadge(state.characterId);return state.characterId;
}

async function apply(){
  try{
    saveInputs();ensureState();
    const target=state.level+1;validate(target);
    const before=copy(state);const entries=[];const traits=[];
    if(TIER_LEVELS.has(target)){
      state.proficiency=Math.min(6,state.proficiency+1);
      const exp=applyExperienceChoice(plan.tier);
      entries.push({id:'tier-achievement',label:`Tier Achievement ${target}`,experienceGrowth:exp,clearMarkedTraits:target===5||target===8});
    }
    state.level=target;
    for(const id of plan.choices){
      const data=plan.details[id]||{};const def=definition(id,target);
      if(id==='hp')state.hpMaxBonus++;
      if(id==='stress')state.stressMaxBonus++;
      if(id==='evasion')state.evasionBonus++;
      if(id==='proficiency')state.proficiency=Math.min(6,state.proficiency+1);
      if(id==='tech')state.technologyAccessLevel++;
      if(id==='trait'){
        state.traits[data.trait]=number(state.traits[data.trait])+1;
        const key=String(tierFor(target));if(!Array.isArray(state.traitAdvances[key]))state.traitAdvances[key]=[];
        if(!state.traitAdvances[key].includes(data.trait))state.traitAdvances[key].push(data.trait);traits.push(data.trait);
      }
      if(id==='experiences')entries.push({id,label:def.title,experienceGrowth:applyExperienceChoice(data)});
      if(id==='power'&&state.path==='Sleeping'){
        if((data.type||'resolve')==='move'){
          const move=resolveMoveById(data.moveId);state.resolveMoves.push(move.name);entries.push({id,label:def.title,resolveMove:{id:move.id,name:move.name}});
        }else{state.resolveMaxBonus++;entries.push({id,label:def.title,resolveMaximum:+1});}
      }
      if(id==='power'&&state.path!=='Sleeping'){
        const power=powerByValue(data.powerId,target);const value=`${power.d||power.domain}::${power.n||power.name}`;
        if(!state.vaultPowers.includes(value))state.vaultPowers.push(value);
        entries.push({id,label:def.title,power:{id:power.id,domain:power.d||power.domain,level:number(power.l||power.level),name:power.n||power.name}});
      }
      if(id==='multiclass'){
        const cls=classCatalogue().find(item=>item.id===data.classId);const rules=classRules(cls);const feature=rules?.classFeature||null;
        state.multiclass={classId:cls.id,className:cls.name,domain:data.domain,effectiveDomainLevel:Math.ceil(target/2),classFeature:feature?copy(feature):null,backgroundQuestion:rules?.bgQuestion||cls.bgQuestion||'',backgroundAnswer:String(data.answer||'').trim()};
      }
      if(id==='subclass')state.subclassRank=subclassNext().target;
      if(id==='tempered'){state.resolveDie='d6';state.temperedResolve=true;}
      if(!['experiences','power'].includes(id))entries.push({id,label:def.title,details:copy(data)});
    }
    const history={level:target,tier:tierFor(target),at:new Date().toISOString(),characterId:state.characterId,options:entries.map(entry=>entry.label),entries,traits,before:{level:before.level,proficiency:before.proficiency},after:{level:state.level,proficiency:state.proficiency}};
    state.advancementHistory.push(history);
    canonicalizeLevelState();autosave();syncFieldsFromState();
    const id=await ensureCharacterId();
    let out=null;
    if(window.VeilFarersSheetBridge){out=await window.VeilFarersSheetBridge.convert(state);window.VeilFarersSheetBridge.saveOutput(out,state);}
    const payload=out?{app:'Veilfarers Character Sheet',version:'2.84-RC3.2',schema:'veilfarers.character/2',characterId:id,fields:{...out.fields,character_id:id},tracks:out.tracks,advancementHistory:state.advancementHistory}:null;
    const registry=window.VeilFarersCharacterRegistry;
    const record=registry.saveLocalData(id,{creatorState:copy(state),sheetPayload:payload,advancementHistory:copy(state.advancementHistory)},{source:'level-up-v59.51',status:'active',completedAt:registry.get(id)?.completedAt||new Date().toISOString()});
    const synced=await registry.sync(record,{source:'level-up-v59.51'});
    plan=freshPlan();plan.applied=true;plan.message=`Level ${target} applied to ${id}${synced?.cloudState==='deferred'?' locally; cloud sync is pending.':'. Vault, Charsheet and Player Tool payloads were updated.'}`;
    selectedVaultId=id;render();
  }catch(error){plan.message=error.message||String(error);plan.applied=false;render();}
}

function renderHistory(){
  const history=(state.advancementHistory||[]).slice().reverse();
  return `<section class="levelup-card"><h3>Advancement History</h3>${history.map(entry=>`<div class="levelup-summary-row"><span><strong>Level ${safe(entry.level)}</strong><br>${safe((entry.options||[]).join(' · '))}</span><span>${safe(String(entry.at||'').slice(0,10))}</span></div>`).join('')||'<p>No Level Ups recorded.</p>'}</section>`;
}

function render(){
  injectStyles();ensureState();
  const root=document.getElementById('levelup-root');if(!root)return;
  const target=Math.min(10,state.level+1);const used=state.level<10?slotsUsed(target):0;
  const current=window.VeilFarersCharacterRegistry?.get(state.characterId);const summary=current?recordSummary(current):{name:state.name||'Current draft',characterId:state.characterId||'No saved ID',level:state.level,path:state.path,className:className(),subclass:state.subclass};
  root.innerHTML=`<div class="levelup-shell">${renderVault()}<section class="levelup-card"><div class="levelup-section-kicker">Selected build</div><h3>${safe(summary.name)}</h3><div class="levelup-badges"><span class="levelup-badge">${safe(summary.characterId||'No saved ID')}</span><span class="levelup-badge">Level ${state.level}</span><span class="levelup-badge">Tier ${tierFor(state.level)}</span><span class="levelup-badge">${safe([state.path,className(),state.subclass].filter(Boolean).join(' · '))}</span></div>${!state.characterId?'<div class="levelup-error" style="margin-top:12px">Choose a completed character from Character Vault. Level Up will not create a second copy.</div>':''}</section>${state.level>=10?'<section class="levelup-card"><h3>Maximum Level</h3><p>The Core rules stop at Level 10.</p></section>':`${tierConfig(target)}<section class="levelup-card"><div class="levelup-inline-actions" style="justify-content:space-between"><div><div class="levelup-section-kicker">Advancement menu</div><h3>Level ${state.level} → ${target}</h3></div><span class="levelup-badge">${used}/2 slots selected</span></div><p>All Corebook options remain visible. Unavailable options explain why they are locked.</p><div class="levelup-grid">${definitions(target).map(def=>`<article class="levelup-card option ${def.disabled?'locked':''} ${plan.choices.includes(def.id)?'selected':''}"><div class="option-head"><h3>${safe(def.title)}</h3><span class="option-cost">${def.cost} slot${def.cost===1?'':'s'}</span></div><p class="levelup-option-description">${safe(def.text)}</p>${def.disabled?`<div class="option-reason">${safe(def.reason||'Unavailable')}</div>`:`<button class="btn ${plan.choices.includes(def.id)?'btn-primary':'btn-secondary'}" onclick="VFLevelUp.toggle('${def.id}')">${plan.choices.includes(def.id)?'Selected · remove':'Select'}</button>`}${plan.choices.includes(def.id)?configFor(def.id,target):''}</article>`).join('')}</div></section><section class="levelup-card"><div class="levelup-section-kicker">Review before applying</div><h3>Build changes</h3><div class="levelup-summary">${previewRows(target).map(row=>`<div class="levelup-summary-row"><strong>${safe(row[0])}</strong><span><span>${safe(row[1])}</span> <span class="levelup-delta">→ ${safe(row[2])}</span></span></div>`).join('')}</div>${plan.message?`<div class="${plan.applied?'levelup-success':'levelup-error'}" style="margin-top:12px">${safe(plan.message)}</div>`:''}<div class="levelup-actions"><button class="btn btn-primary" onclick="VFLevelUp.apply()" ${!state.characterId||used===0?'disabled':''}>Apply Level ${target}</button><a class="btn btn-secondary" href="/charsheet.html">Open Charsheet</a><a class="btn btn-secondary" href="/player-tool.html">Open Player Tool</a><a class="btn btn-secondary" href="#creator">Return to Creator</a></div><p class="levelup-note">Level Up changes the character build. Current HP, Stress, Hope/Effort, Resolve, Armor marks and Conditions in Player Tool are preserved when the same Character ID is updated.</p></section>`}${renderHistory()}</div>`;
  if(!vaultLoaded&&!vaultLoading&&window.VeilFarersCharacterRegistry){vaultLoaded=true;setTimeout(()=>refreshVault(),0);}
}

async function loadCanonicalLevelUpData(){
  const load=async path=>{const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw Error(`${path} (${response.status})`);return response.json();};
  try{
    const [moves,classes,subclasses,powers]=await Promise.all([
      load('/rules-data/core/resolve-moves.json'),load('/rules-data/core/classes.json'),load('/rules-data/core/subclasses.json'),load('/rules-data/core/powers.json')
    ]);
    resolveMoves=Array.isArray(moves)?moves:[];canonicalClasses=Array.isArray(classes)?classes:[];canonicalSubclasses=Array.isArray(subclasses)?subclasses:[];canonicalPowers=Array.isArray(powers)?powers:[];
  }catch(error){
    resolveMoves=window.VF_CANON?.resolveMoves||[];canonicalClasses=[];canonicalSubclasses=[];canonicalPowers=[];
    console.warn('Canonical Level Up catalogues unavailable; using embedded Creator data:',error);
  }
}

window.VFLevelUp={
  render,refreshVault,select:selectCharacter,trash:trashCharacter,toggle:toggleOption,
  detail:(id,key,value)=>setDetail(id,key,value),tier:setTier,cancelTrash,apply,chooseImport:chooseImportFile,importFile:importLevelUpFile
};

loadCanonicalLevelUpData().finally(render);
})();
