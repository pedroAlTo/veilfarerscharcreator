(function(){
  'use strict';
  const CREATOR_KEY='veilfarers-character';
  const FIELDS_KEY='veilfarers_sheet_fields_v2_41';
  const TRACKS_KEY='veilfarers_sheet_tracks_v2_41';
  const LAST_SYNC_KEY='veilfarers.sheet.lastCreatorDraft.v2';
  const FORCE_SYNC_KEY='veilfarers.sheet.syncCreatorOnOpen.v1';
  const RELEASE_KEY='veilfarers.sheet.creatorRelease.v1';
  const q=(s,r=document)=>r.querySelector(s);
  const clean=v=>String(v==null?'':v).trim();
  const text=(name,value)=>[clean(name),clean(value)].filter(Boolean).join(': ');
  const rules=x=>x&&(x.rules||x)||{};
  const byIdentity=(list,value)=>{
    const wanted=clean(value).toLowerCase();
    if(!wanted)return null;
    return (list||[]).find(x=>[x.id,x.slug,x.name,rules(x).id,rules(x).name].some(v=>clean(v).toLowerCase()===wanted))||null;
  };
  const byName=(list,value)=>{
    const wanted=clean(value).toLowerCase();
    return (list||[]).find(x=>clean(x&&x.name).toLowerCase()===wanted)||null;
  };
  async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`Could not load ${path}`);return r.json();}
  async function canonical(){
    const names=['ancestries','communities','classes','subclasses','affiliations','weapons','armor','powers','gear','augments'];
    const values=await Promise.all(names.map(n=>json(`/rules-data/core/${n}.json`)));
    const classCompat=await json('/data/classes.json');
    let rs={weapons:[],armor:[],gear:[],augments:[]};
    await Promise.all(Object.keys(rs).map(async n=>{try{rs[n]=await json(`/rules-data/rust-and-steel/${n}.json`);}catch(_){rs[n]=[];}}));
    const out=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
    out.classCompat=classCompat;
    ['weapons','armor','gear','augments'].forEach(n=>{
      const map=new Map();
      [...(out[n]||[]),...(rs[n]||[])].forEach(item=>map.set(item.id||`${item.pack}:${item.name}`,item));
      out[n]=Array.from(map.values());
    });
    return out;
  }
  function signed(v){const n=Number(v||0);return n>=0?`+${n}`:String(n);}
  function tierLabel(item){const t=item&&item.tier;return clean(typeof t==='object'?(t.code||t.name):t);}
  function currentDraft(){try{return JSON.parse(localStorage.getItem(CREATOR_KEY)||'null');}catch(_){return null;}}
  function proficiencyFloor(level){level=Math.max(1,Math.min(10,Number(level)||1));return level>=8?4:level>=5?3:level>=2?2:1;}
  function featureText(feature){return feature?text(feature.name,feature.text||feature.desc):'';}
  function selectedByName(list,names){return (names||[]).map(name=>byIdentity(list,name)).filter(Boolean);}
  function powerFromValue(list,value){
    const bits=clean(value).split('::');
    const name=bits.pop(); const domain=bits.join('::');
    return (list||[]).find(x=>clean(x.name)===name&&(!domain||clean(x.domain)===domain))||byIdentity(list,value);
  }
  function pathKey(raw){return clean(raw&&raw.path).toLowerCase()==='sleeping'?'sleeping':'awakened';}
  function pathClassData(compat,path){return path==='sleeping'?(compat.sleepingRules||compat):(compat||{});}
  function pathSubclasses(compat,path){
    if(path==='sleeping')return compat.sleepingSubclasses||compat.sleepingRules?.subclasses||[];
    return compat.awakenedSubclasses||compat.subclasses||[];
  }
  function techSummary(compat,level){
    const tiers=compat?.technologyAccess?.tiers||[];
    const available=tiers.filter(t=>(Number(t.level)||1)<=level).sort((a,b)=>(Number(a.level)||1)-(Number(b.level)||1));
    const current=available[available.length-1]||tiers[0];
    if(!current)return '';
    return [`${current.name||'Access'} access`,current.summary].filter(Boolean).join(' · ');
  }
  async function convert(raw){
    if(raw&&raw.fields)return {fields:raw.fields,tracks:raw.tracks||{}};
    if(!raw||(!raw.name&&!raw.ancestry&&!raw.cls))throw new Error('No Character Creator draft is stored in this browser.');
    const c=await canonical();
    const path=pathKey(raw);
    const pathLabel=path==='sleeping'?'Sleeping':'Awakened';
    const cls=byIdentity(c.classes,raw.cls);
    const compat=byIdentity(c.classCompat,raw.cls)||byName(c.classCompat,cls&&cls.name)||{};
    const classRules=pathClassData(compat,path);
    const subclass=byIdentity(pathSubclasses(compat,path),raw.subclass);
    const anc=byIdentity(c.ancestries,raw.ancestry);
    const com=byIdentity(c.communities,raw.community);
    const aff=byIdentity(c.affiliations,raw.affiliation);
    const ar=rules(anc), cr=rules(com), sr=rules(subclass), afr=rules(aff);
    const strain=(ar.subStrains||[]).find(x=>[x.id,x.name].some(v=>clean(v).toLowerCase()===clean(raw.subStrain).toLowerCase()));
    const ancestryParts=(ar.gifts||[]).map(featureText).filter(Boolean);
    if(ar.extra)ancestryParts.push(featureText(ar.extra));
    if(strain)ancestryParts.push([strain.name,strain.featName,strain.featText].filter(Boolean).join(' · '));
    const communityFeature=featureText(cr.feature);
    const classFeature=featureText(classRules.classFeature);
    const pathFeature=path==='sleeping'?(classRules.effortFeature||{}):(classRules.hopeFeature||{});
    const foundation=sr.foundation||{};
    const level=Math.max(1,Math.min(10,Number(raw.level)||1));
    const proficiency=Math.max(proficiencyFloor(level),Math.min(6,Number(raw.proficiency)||proficiencyFloor(level)));
    const selectedWeapons=selectedByName(c.weapons,raw.weapons).slice(0,2);
    const selectedArmor=selectedByName(c.armor,raw.armors)[0]||null;
    const selectedPowers=path==='awakened'?(raw.powers||[]).map(v=>powerFromValue(c.powers,v)).filter(Boolean).slice(0,5):[];
    const selectedGear=[];
    if(raw.kit){const exact=byIdentity(c.gear,raw.kit);if(exact)selectedGear.push(exact);}
    const experiences=(Array.isArray(raw.experiences)?raw.experiences:[]).slice(0,3);
    while(experiences.length<3)experiences.push('');
    const baseHp=Number(classRules.hp||classRules.statistics?.hitPoints||cls?.statistics?.hitPoints)||6;
    const baseEvasion=Number(classRules.evasion||classRules.statistics?.evasion||cls?.statistics?.evasion)||10;
    const affiliationNotes=[afr.tag,afr.benefit&&`Benefit: ${afr.benefit}`,afr.obligation&&`Obligation: ${afr.obligation}`].filter(Boolean).join('\n');
    const appearanceNotes=[raw.appearance&&`Appearance: ${raw.appearance}`,raw.voice&&`Voice: ${raw.voice}`].filter(Boolean).join('\n');
    const foundationSummary=foundation.name?`Subclass Foundation — ${featureText(foundation)}`:'';
    const generalFeatures=[classFeature,foundationSummary].filter(Boolean).join('\n\n');
    const signatureTrait=sr.trait||classRules.spellcastTrait||classRules.trait||compat.spellcastTrait||compat.trait||'';
    const f={
      name:clean(raw.name),pron:clean(raw.pronouns),level:String(level),prof:String(proficiency),chosen_path:pathLabel,
      ancestry:(anc&&anc.name)||clean(raw.ancestry),ancestry_gift:ancestryParts.join('\n\n'),ancestry_note:ancestryParts.join('\n\n'),ailuran_variant:strain?strain.name:'',
      community:(com&&com.name)||clean(raw.community),community_note:communityFeature,community_gift:communityFeature,community_advantages:communityFeature,
      affiliation:(aff&&aff.name)||clean(raw.affiliation),aff_standing:'+1 Good Standing',aff_reputation:'Unknown (0)',aff_notes:[affiliationNotes,appearanceNotes].filter(Boolean).join('\n\n'),aff_faction_notes:affiliationNotes,
      class:(cls&&cls.name)||compat.name||clean(raw.cls),subclass:(subclass&&subclass.name)||clean(raw.subclass),signature_trait:signatureTrait,
      features:generalFeatures,
      a_featname:path==='awakened'?clean(pathFeature.name):'',a_feattext:path==='awakened'?clean(pathFeature.text||pathFeature.desc):'',
      s_featname:path==='sleeping'?clean(pathFeature.name):'',s_feattext:path==='sleeping'?clean(pathFeature.text||pathFeature.desc):'',
      s_honed:path==='sleeping'?'HONED EDGE':'',s_active_move:'',s_active_move_text:'',
      class_proficiencies:techSummary(compat,level),tech_access:techSummary(compat,level),
      base_hp_max:String(baseHp),base_stress_max:'6',base_evasion:String(baseEvasion),evasion:String(baseEvasion),
      wealth:String(raw.wealth||1),kit_class:(classRules.items||compat.items||[]).join(' · '),kit_personal:clean(raw.kit),
      tr_agility:signed(raw.traits&&raw.traits.agility),tr_strength:signed(raw.traits&&raw.traits.strength),tr_finesse:signed(raw.traits&&raw.traits.finesse),tr_knowledge:signed(raw.traits&&raw.traits.knowledge),tr_instinct:signed(raw.traits&&raw.traits.instinct),tr_presence:signed(raw.traits&&raw.traits.presence),
      base_tr_agility:signed(raw.traits&&raw.traits.agility),base_tr_strength:signed(raw.traits&&raw.traits.strength),base_tr_finesse:signed(raw.traits&&raw.traits.finesse),base_tr_knowledge:signed(raw.traits&&raw.traits.knowledge),base_tr_instinct:signed(raw.traits&&raw.traits.instinct),base_tr_presence:signed(raw.traits&&raw.traits.presence),
      seed_motive:clean(raw.bgAnswer),s_anchor:clean(raw.anchor),equipment_notes:clean(raw.wound),a_quick_notes:clean(raw.levelNotes)
    };
    experiences.forEach((value,i)=>{
      f[`s_exp_${i}`]=clean(value);f[`a_exp_${i}`]=clean(value);
      f[`s_exp_${i}_bonus`]='+2';f[`a_exp_${i}_bonus`]='+2';
    });
    selectedWeapons.forEach((w,i)=>{
      const p=i===0?'wpri':'wsec';
      f[`${p}_name`]=w.name;f[`${p}_trait`]=[w.trait,w.range].filter(Boolean).join(' · ');
      f[`${p}_dmg`]=clean(w.damage);f[`${p}_dmg_final`]=clean(w.damage);f[`${p}_dmg_final_aw`]=clean(w.damage);
      f[`${p}_feat`]=(w.features||[]).join(', ');f[`${p}_tier`]=tierLabel(w);
    });
    if(selectedArmor){
      const th=selectedArmor.thresholds||{};
      f.armor_name=selectedArmor.name;f.armor_thr=th.raw||`${th.major||''} / ${th.severe||''}`;
      f.thr_major=String(th.major||'');f.thr_severe=String(th.severe||'');
      f.armor_score=String(selectedArmor.armorSlots||0);f.base_armor_slots=String(selectedArmor.armorSlots||0);
      f.armor_feat=(selectedArmor.features||[]).join(', ');f.armor_tier=tierLabel(selectedArmor);
    }
    selectedPowers.forEach((power,i)=>{
      f[`a_pwr_${i}_n`]=power.name;
      f[`a_pwr_${i}_d`]=[power.domain,`L${power.level}`,power.powerType,power.cost].filter(Boolean).join(' · ');
      f[`a_pwr_${i}_rc`]=clean(power.recallCost??power.rc??0);
    });
    selectedGear.slice(0,8).forEach((item,i)=>{f[`eq_${i}_name`]=item.name;f[`eq_${i}_tier`]=tierLabel(item);f[`eq_${i}_use`]=clean(item.use);f[`eq_${i}_qty`]='1';});
    if(raw.kit&&!selectedGear.length){f.eq_0_name=clean(raw.kit);f.eq_0_qty='1';}
    const tracks={
      max:{hp:baseHp,armor_slots:selectedArmor?Number(selectedArmor.armorSlots||0):0,stress:6,s_resolve:2,a_hope:6,s_effort:6},
      current:{hp:baseHp,armor_slots:selectedArmor?Number(selectedArmor.armorSlots||0):0,stress:0,s_resolve:path==='sleeping'?2:0,a_hope:path==='awakened'?2:0,s_effort:path==='sleeping'?2:0}
    };
    return {fields:f,tracks};
  }
  function saveOutput(out,raw){
    localStorage.setItem(FIELDS_KEY,JSON.stringify(out.fields));
    localStorage.setItem(TRACKS_KEY,JSON.stringify(out.tracks));
    localStorage.setItem(LAST_SYNC_KEY,JSON.stringify(raw));
    localStorage.setItem(RELEASE_KEY,'11.1-RC3.2');
  }
  async function sync({replaceUrl=false}={}){
    const button=q('#vf-sync-creator');const previous=button&&button.textContent;
    if(button){button.disabled=true;button.textContent='Syncing…';}
    try{
      const raw=currentDraft();const out=await convert(raw);saveOutput(out,raw);localStorage.removeItem(FORCE_SYNC_KEY);
      if(replaceUrl){location.replace(location.pathname);}else{location.reload();}
    }catch(err){alert('Could not sync the Creator draft: '+err.message);if(button){button.disabled=false;button.textContent=previous;}}
  }
  function addButton(){
    const group=q('.toolbar-section.io-tools .tool-subgroup')||q('.toolbar-section.io-tools')||q('.tb-actions');
    if(!group||q('#vf-sync-creator'))return;
    const b=document.createElement('button');b.id='vf-sync-creator';b.type='button';b.textContent='Sync Draft';
    b.title='Import the current canonical RC3.2 Character Creator draft into the digital sheet';b.addEventListener('click',()=>sync());group.prepend(b);
  }
  function automaticSync(){
    const params=new URLSearchParams(location.search);const forced=params.get('sync')==='1'||localStorage.getItem(FORCE_SYNC_KEY)==='1';
    if(forced){sync({replaceUrl:true});return;}
    if(localStorage.getItem(FIELDS_KEY))return;
    const raw=currentDraft();if(!raw)return;
    convert(raw).then(out=>{saveOutput(out,raw);location.reload();}).catch(()=>{});
  }
  window.VeilFarersSheetBridge=Object.freeze({convert,sync});
  const start=()=>{addButton();automaticSync();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
