(function(){
  'use strict';
  const CREATOR_KEY='veilfarers-character';
  const FALLBACK_FIELDS_KEY='veilfarers_sheet_fields_v2_40';
  const FALLBACK_TRACKS_KEY='veilfarers_sheet_tracks_v2_40';
  const TRANSFER_KEY='veilfarers.character.transfer.v1';
  const LATEST_SHEET_KEY='veilfarers.sheet.latestPayload.v1';
  function fieldsKey(){ try{ return (typeof LS_FIELDS!=='undefined'&&LS_FIELDS)||FALLBACK_FIELDS_KEY; }catch(_){ return FALLBACK_FIELDS_KEY; } }
  function tracksKey(){ try{ return (typeof LS_TRACKS!=='undefined'&&LS_TRACKS)||FALLBACK_TRACKS_KEY; }catch(_){ return FALLBACK_TRACKS_KEY; } }
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
  function currentDraft(){
    try{
      var creator=JSON.parse(localStorage.getItem(CREATOR_KEY)||'null');
      if(creator&&(creator.name||creator.ancestry||creator.cls||creator.fields||creator.creatorState||creator.state))return creator;
    }catch(_){/* fall through to sheet payload */}
    // No usable Creator draft: fall back to the sheet's own latest payload,
    // which is what the in-sheet Random Character generator writes. It already
    // carries {fields,tracks}, so unwrapInput() treats it as kind:'sheet'.
    try{return JSON.parse(localStorage.getItem(LATEST_SHEET_KEY)||'null');}catch(_){return null;}
  }
  function proficiencyFloor(level){level=Math.max(1,Math.min(10,Number(level)||1));return level>=8?4:level>=5?3:level>=2?2:1;}
  function featureText(feature){return feature?text(feature.name,feature.text||feature.desc):'';}
  const compactRule=(value,label)=>window.VFCompactRules?window.VFCompactRules.compactBundle(value,label):clean(value);
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
  function rankValue(value){
    const key=clean(value).toLowerCase();
    return key==='mastery'?3:key==='specialization'?2:1;
  }
  function pathSubclassRules(item,path){
    if(!item)return {};
    if(path==='sleeping'&&item.sleepingRules)return item.sleepingRules;
    return item.rules||item;
  }
  function acquiredSubclassFeatures(subclassRules,rank){
    const steps=[['Foundation',subclassRules.foundation],['Specialization',subclassRules.specialization],['Mastery',subclassRules.mastery]];
    const limit=rankValue(rank);
    return steps.slice(0,limit).filter(([,feature])=>feature&&feature.name).map(([label,feature])=>`${label} — ${featureText(feature)}`);
  }
  function multiclassSummary(value){
    if(!value||typeof value!=='object')return '';
    const parts=[value.className&&`Class — ${value.className}`,value.domain&&`Domain — ${value.domain}`,value.classFeature&&featureText(value.classFeature),value.backgroundQuestion&&value.backgroundAnswer&&`${value.backgroundQuestion} — ${value.backgroundAnswer}`].filter(Boolean);
    return parts.length?`Multiclass — ${parts.join(' · ')}`:'';
  }
  function techSummary(compat,level){
    const tiers=compat?.technologyAccess?.tiers||[];
    const available=tiers.filter(t=>(Number(t.level)||1)<=level).sort((a,b)=>(Number(a.level)||1)-(Number(b.level)||1));
    const current=available[available.length-1]||tiers[0];
    if(!current)return '';
    return [`${current.name||'Access'} access`,current.summary].filter(Boolean).join(' · ');
  }
  function unwrapInput(raw){
    let value=raw;
    const seen=new Set();
    for(let i=0;i<8&&value&&typeof value==='object'&&!seen.has(value);i++){
      seen.add(value);
      if(value.creatorState&&typeof value.creatorState==='object'){value=value.creatorState;continue;}
      if(value.payload&&value.payload.creatorState&&typeof value.payload.creatorState==='object'){value=value.payload.creatorState;continue;}
      if(value.fields&&typeof value.fields==='object')return {kind:'sheet',value:{fields:value.fields,tracks:value.tracks||{}}};
      if(value.payload&&value.payload.fields&&typeof value.payload.fields==='object')return {kind:'sheet',value:{fields:value.payload.fields,tracks:value.payload.tracks||{}}};
      if(value.state&&typeof value.state==='object'&&(value.state.name||value.state.ancestry||value.state.cls)){value=value.state;continue;}
      break;
    }
    return {kind:'creator',value};
  }
  async function convert(raw){
    const unwrapped=unwrapInput(raw);
    if(unwrapped.kind==='sheet')return unwrapped.value;
    raw=unwrapped.value;
    if(!raw||(!raw.name&&!raw.ancestry&&!raw.cls))throw new Error('No compatible Character Creator or Charsheet character data was found.');
    const c=await canonical();
    const path=pathKey(raw);
    const pathLabel=path==='sleeping'?'Sleeping':'Awakened';
    const cls=byIdentity(c.classes,raw.cls);
    const compat=byIdentity(c.classCompat,raw.cls)||byName(c.classCompat,cls&&cls.name)||{};
    const classRules=pathClassData(compat,path);
    const subclass=byIdentity(pathSubclasses(compat,path),raw.subclass);
    const canonicalSubclass=(c.subclasses||[]).find(item=>{
      const sameName=clean(item&&item.name).toLowerCase()===clean(raw.subclass).toLowerCase()||clean(item&&item.id).toLowerCase()===clean(raw.subclass).toLowerCase()||clean(item&&item.slug).toLowerCase()===clean(raw.subclass).toLowerCase();
      const sameClass=!cls||!item.className||clean(item.className).toLowerCase()===clean(cls.name).toLowerCase();
      return sameName&&sameClass;
    })||null;
    const anc=byIdentity(c.ancestries,raw.ancestry);
    const com=byIdentity(c.communities,raw.community);
    const aff=byIdentity(c.affiliations,raw.affiliation);
    const ar=rules(anc), cr=rules(com), sr=pathSubclassRules(canonicalSubclass||subclass,path), afr=rules(aff);
    const strain=(ar.subStrains||[]).find(x=>[x.id,x.name].some(v=>clean(v).toLowerCase()===clean(raw.subStrain).toLowerCase()));
    const humanInheritance=clean(raw.humanInheritance).toLowerCase();
    const humanGraft=humanInheritance==='graft'?byIdentity(c.augments,raw.humanInheritanceItem):null;
    const humanTool=humanInheritance==='tool'
      ?(byIdentity(c.weapons,raw.humanInheritanceItem)||byIdentity(c.armor,raw.humanInheritanceItem)||byIdentity(c.gear,raw.humanInheritanceItem))
      :null;
    const ancestryParts=(ar.gifts||[]).map(featureText).filter(Boolean);
    if(ar.extra)ancestryParts.push(featureText(ar.extra));
    if(strain)ancestryParts.push([strain.name,strain.featName,strain.featText].filter(Boolean).join(' · '));
    if(humanGraft)ancestryParts.push(`Inheritance Selected — The Graft: ${humanGraft.name} · ${tierLabel(humanGraft)==='TT1'?'0 Augment Slots':'1 Augment Slot'} · no drawback`);
    if(humanTool)ancestryParts.push(`Inheritance Selected — The Tool: ${humanTool.name} · Experimental (TT3) · 9 Cr · paid for`);
    const communityFeature=featureText(cr.feature);
    const classFeature=featureText(classRules.classFeature);
    const pathFeature=path==='sleeping'?(classRules.effortFeature||{}):(classRules.hopeFeature||{});
    const foundation=sr.foundation||{};
    const subclassRank=clean(raw.subclassRank||'Foundation');
    const level=Math.max(1,Math.min(10,Number(raw.level)||1));
    const proficiency=Math.max(proficiencyFloor(level),Math.min(6,Number(raw.proficiency)||proficiencyFloor(level)));
    const selectedWeapons=selectedByName(c.weapons,raw.weapons).slice(0,2);
    const selectedArmor=selectedByName(c.armor,raw.armors)[0]||null;
    const selectedPowers=path==='awakened'?(raw.powers||[]).map(v=>powerFromValue(c.powers,v)).filter(Boolean).slice(0,5):[];
    const selectedGear=[];
    if(raw.kit){const exact=byIdentity(c.gear,raw.kit);if(exact)selectedGear.push(exact);}
    if(humanTool)selectedGear.push({...humanTool,use:humanTool.use||humanTool.raw?.use||humanTool.damage||humanTool.thresholds?.raw||humanTool.category||'Inherited Experimental equipment'});
    const experiences=(Array.isArray(raw.experiences)?raw.experiences:[]).slice(0,5);
    const experienceBonuses=Array.isArray(raw.experienceBonuses)?raw.experienceBonuses:[];
    while(experiences.length<3)experiences.push('');
    const baseHp=Number(classRules.hp||classRules.statistics?.hitPoints||cls?.statistics?.hitPoints)||6;
    const baseEvasion=Number(classRules.evasion||classRules.statistics?.evasion||cls?.statistics?.evasion)||10;
    const finalHp=baseHp+Number(raw.hpMaxBonus||0),finalStress=6+Number(raw.stressMaxBonus||0),finalEvasion=baseEvasion+Number(raw.evasionBonus||0);
    const resolveBase=level>=8?6:(level>=5?4:2),resolveMax=Math.min(10,resolveBase+Number(raw.resolveMaxBonus||0));
    const affiliationNotes=[afr.tag,afr.benefit&&`Benefit: ${afr.benefit}`,afr.obligation&&`Obligation: ${afr.obligation}`].filter(Boolean).join('\n');
    const appearanceNotes=[raw.appearance&&`Appearance: ${raw.appearance}`,raw.voice&&`Voice: ${raw.voice}`].filter(Boolean).join('\n');
    const subclassFeatureSummaries=acquiredSubclassFeatures(sr,subclassRank);
    const sleepingDomainSummary=path==='sleeping'&&Array.isArray(raw.sleepingMysticDomains)&&raw.sleepingMysticDomains.length
      ? `Studied Domains — ${raw.sleepingMysticDomains.join(' + ')}` : '';
    const generalFeatures=[classFeature,...subclassFeatureSummaries,multiclassSummary(raw.multiclass),sleepingDomainSummary].filter(Boolean).join('\n\n');
    const selectedPowerSummary=selectedPowers.length?`Selected Level 1 Powers — ${selectedPowers.map(power=>`${power.domain}: ${power.name}`).join(' · ')}`:'';
    const awakenedDomainSummary=path==='awakened'?[raw.veilAlignment&&`Veil Alignment — ${raw.veilAlignment}`,selectedPowerSummary].filter(Boolean).join('\n'):'';
    const signatureTrait=sr.trait||classRules.spellcastTrait||classRules.trait||compat.spellcastTrait||compat.trait||'';
    const f={
      character_id:clean(raw.characterId),name:clean(raw.name),pron:clean(raw.pronouns),level:String(level),prof:String(proficiency),chosen_path:pathLabel,
      ancestry:(anc&&anc.name)||clean(raw.ancestry),ancestry_gift:compactRule(ancestryParts.join('\n\n'),'Ancestry Gift'),ancestry_note:compactRule(ancestryParts.join('\n\n'),'Ancestry Gift'),ailuran_variant:strain?strain.name:'',
      human_inheritance_kind:humanInheritance,human_inheritance_item_id:clean(raw.humanInheritanceItem),human_inheritance_item_name:humanGraft?.name||humanTool?.name||'',
      community:(com&&com.name)||clean(raw.community),community_note:compactRule(communityFeature,'Community'),community_gift:compactRule(communityFeature,'Community'),community_advantages:compactRule(communityFeature,'Community'),
      affiliation:(aff&&aff.name)||clean(raw.affiliation),aff_standing:'+1 Good Standing',aff_reputation:'Unknown (0)',aff_notes:[affiliationNotes,appearanceNotes].filter(Boolean).join('\n\n'),aff_faction_notes:affiliationNotes,
      class:(cls&&cls.name)||compat.name||clean(raw.cls),subclass:(subclass&&subclass.name)||clean(raw.subclass),signature_trait:signatureTrait,
      features:compactRule(generalFeatures,'Class Feature'),
      a_featname:path==='awakened'?clean(pathFeature.name):'',a_feattext:path==='awakened'?compactRule(clean(pathFeature.text||pathFeature.desc),clean(pathFeature.name)||'Feature'):'',
      s_featname:path==='sleeping'?clean(pathFeature.name):'',s_feattext:path==='sleeping'?compactRule(clean(pathFeature.text||pathFeature.desc),clean(pathFeature.name)||'Feature'):'',
      s_honed:path==='sleeping'?'HONED EDGE':'',s_active_move:'',s_active_move_text:'',
      class_proficiencies:techSummary(compat,level),tech_access:techSummary(compat,level),tech_access_level:String(Math.max(1,Number(raw.technologyAccessLevel||1))),
      base_hp_max:String(finalHp),base_stress_max:String(finalStress),base_evasion:String(finalEvasion),evasion:String(finalEvasion),
      wealth:String(raw.wealth||1),kit_class:(classRules.items||compat.items||[]).join(' · '),kit_personal:clean(raw.kit),
      a_domain_ref:awakenedDomainSummary,a_vault:(raw.vaultPowers||[]).join('\n'),s_resolve_die:clean(raw.resolveDie||'d4'),s_learned_moves:JSON.stringify(raw.resolveMoves||[]),subclass_rank:subclassRank,multiclass:clean(raw.multiclass&&raw.multiclass.className),multiclass_details:raw.multiclass?JSON.stringify(raw.multiclass):'',
      tr_agility:signed(raw.traits&&raw.traits.agility),tr_strength:signed(raw.traits&&raw.traits.strength),tr_finesse:signed(raw.traits&&raw.traits.finesse),tr_knowledge:signed(raw.traits&&raw.traits.knowledge),tr_instinct:signed(raw.traits&&raw.traits.instinct),tr_presence:signed(raw.traits&&raw.traits.presence),
      base_tr_agility:signed(raw.traits&&raw.traits.agility),base_tr_strength:signed(raw.traits&&raw.traits.strength),base_tr_finesse:signed(raw.traits&&raw.traits.finesse),base_tr_knowledge:signed(raw.traits&&raw.traits.knowledge),base_tr_instinct:signed(raw.traits&&raw.traits.instinct),base_tr_presence:signed(raw.traits&&raw.traits.presence),
      seed_motive:clean(raw.bgAnswer),s_anchor:clean(raw.anchor),equipment_notes:clean(raw.wound),a_quick_notes:clean(raw.levelNotes)
    };
    experiences.forEach((value,i)=>{
      f[`s_exp_${i}`]=clean(value);f[`a_exp_${i}`]=clean(value);
      const bonus=Math.max(2,Math.min(5,Number(experienceBonuses[i]||2)));f[`s_exp_${i}_bonus`]=`+${bonus}`;f[`a_exp_${i}_bonus`]=`+${bonus}`;
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
    if(humanGraft){
      f.aug_0_name=humanGraft.name;
      f.aug_0_tier=tierLabel(humanGraft);
      f.aug_0_benefit=clean(humanGraft.benefit||humanGraft.raw?.benefit);
      f.aug_0_stress=clean(humanGraft.activationStress);
      f.aug_0_deg='Human inheritance · no drawback · '+(tierLabel(humanGraft)==='TT1'?'0 Augment Slots':'1 Augment Slot');
      f.augment_notes='Human — Made for the Graft grants +2 Augment Capacity. Inherited graft has no drawback.';
    }
    selectedPowers.forEach((power,i)=>{
      f[`a_pwr_${i}_n`]=power.name;
      f[`a_pwr_${i}_d`]=[power.domain,`L${power.level}`,power.powerType,power.cost].filter(Boolean).join(' · ');
      f[`a_pwr_${i}_rc`]=clean(power.recallCost??power.rc??0);
    });
    selectedGear.slice(0,8).forEach((item,i)=>{f[`eq_${i}_name`]=item.name;f[`eq_${i}_tier`]=tierLabel(item);f[`eq_${i}_use`]=clean(item.use);f[`eq_${i}_qty`]='1';});
    if(raw.kit&&!selectedGear.length){f.eq_0_name=clean(raw.kit);f.eq_0_qty='1';}
    const tracks={
      max:{hp:finalHp,armor_slots:selectedArmor?Number(selectedArmor.armorSlots||0):0,stress:finalStress,s_resolve:resolveMax,a_hope:6,s_effort:6},
      current:{hp:finalHp,armor_slots:selectedArmor?Number(selectedArmor.armorSlots||0):0,stress:0,s_resolve:path==='sleeping'?resolveMax:0,a_hope:path==='awakened'?2:0,s_effort:path==='sleeping'?2:0}
    };
    return {fields:f,tracks,characterId:clean(raw.characterId),advancementHistory:raw.advancementHistory||[]};
  }
  function sheetPayload(out){
    return {app:'Veilfarers Character Sheet',version:'2.83-RC3.2',schema:'veilfarers.character/2',characterId:clean(out.characterId||out.fields?.character_id),exportedAt:new Date().toISOString(),fields:out.fields||{},tracks:out.tracks||{},advancementHistory:out.advancementHistory||[]};
  }
  function makeEnvelope(out,raw,source='creator',target='charsheet'){
    return {schema:'veilfarers.character-transfer/1',source,target,createdAt:new Date().toISOString(),creatorState:raw&&raw.fields?null:raw,payload:sheetPayload(out)};
  }
  function saveOutput(out,raw){
    localStorage.setItem(fieldsKey(),JSON.stringify(out.fields));
    localStorage.setItem(tracksKey(),JSON.stringify(out.tracks));
    localStorage.setItem(LATEST_SHEET_KEY,JSON.stringify(sheetPayload(out)));
    localStorage.setItem(LAST_SYNC_KEY,JSON.stringify(raw));
    localStorage.setItem(RELEASE_KEY,'11.35-Portal');
  }
  function queueTransfer(target,out,raw,source='charsheet'){
    const envelope=makeEnvelope(out,raw,source,target);
    localStorage.setItem(TRANSFER_KEY,JSON.stringify(envelope));
    localStorage.setItem(LATEST_SHEET_KEY,JSON.stringify(envelope.payload));
    return envelope;
  }
  function currentSheetPayload(){
    try{
      const fields=JSON.parse(localStorage.getItem(fieldsKey())||'null');
      if(!fields||typeof fields!=='object')return null;
      const tracks=JSON.parse(localStorage.getItem(tracksKey())||'{}');
      return sheetPayload({fields,tracks});
    }catch(_){return null;}
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
    if(localStorage.getItem(fieldsKey()))return;
    const raw=currentDraft();if(!raw)return;
    convert(raw).then(out=>{saveOutput(out,raw);location.reload();}).catch(()=>{});
  }
  window.VeilFarersSheetBridge=Object.freeze({convert,unwrapInput,sync,saveOutput,makeEnvelope,queueTransfer,currentSheetPayload,fieldsKey,tracksKey,TRANSFER_KEY,LATEST_SHEET_KEY});
  const start=()=>{if(!q('#sheet')||!q('#sheetWrap'))return;addButton();automaticSync();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
