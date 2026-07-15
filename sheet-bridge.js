(function(){
  'use strict';
  const CREATOR_KEY='veilfarers-character';
  const FIELDS_KEY='veilfarers_sheet_fields_v2_36';
  const TRACKS_KEY='veilfarers_sheet_tracks_v2_36';
  const LAST_SYNC_KEY='veilfarers.sheet.lastCreatorDraft.v1';
  const q=(s,r=document)=>r.querySelector(s);
  const text=(name,value)=>value?[name,value].filter(Boolean).join(': '):'';
  const find=(list,value)=>list.find(x=>x.id===value||x.slug===value||x.name===value)||null;
  const rules=x=>x&&(x.rules||x)||{};
  async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`Could not load ${path}`);return r.json();}
  async function canonical(){
    const names=['ancestries','communities','classes','subclasses','affiliations','weapons','armor','powers'];
    const values=await Promise.all(names.map(n=>json(`/rules-data/core/${n}.json`)));
    return Object.fromEntries(names.map((n,i)=>[n,values[i]]));
  }
  function signed(v){const n=Number(v||0);return n>=0?`+${n}`:String(n);}
  function currentDraft(){try{return JSON.parse(localStorage.getItem(CREATOR_KEY)||'null');}catch(_){return null;}}
  async function convert(raw){
    if(raw&&raw.fields)return {fields:raw.fields,tracks:raw.tracks||{}};
    if(!raw||(!raw.name&&!raw.ancestry&&!raw.cls))throw new Error('No Character Creator draft is stored in this browser.');
    const c=await canonical();
    const anc=find(c.ancestries,raw.ancestry), com=find(c.communities,raw.community), cls=find(c.classes,raw.cls), sub=find(c.subclasses,raw.subclass), aff=find(c.affiliations,raw.affiliation);
    const ar=rules(anc), cr=rules(com), clr=rules(cls), sr=rules(sub);
    const strain=(ar.subStrains||[]).find(x=>x.id===raw.subStrain||x.name===raw.subStrain);
    const ancestryParts=(ar.gifts||[]).map(g=>text(g.name,g.text));
    if(ar.extra)ancestryParts.push(text(ar.extra.name,ar.extra.text));
    if(strain)ancestryParts.push([strain.name,strain.featName,strain.featText].filter(Boolean).join(' · '));
    const communityFeature=cr.feature?text(cr.feature.name,cr.feature.text):'';
    const classFeature=clr.classFeature?text(clr.classFeature.name,clr.classFeature.text):'';
    const hopeFeature=clr.hopeFeature||{};
    const path=String(raw.path||'Awakened').toLowerCase()==='sleeping'?'Sleeping':'Awakened';
    const selectedWeapons=(raw.weapons||[]).map(n=>find(c.weapons,n)).filter(Boolean);
    const selectedArmor=(raw.armors||[]).map(n=>find(c.armor,n)).filter(Boolean)[0]||null;
    const selectedPowers=(raw.powers||[]).map(v=>{const parts=String(v).split('::');const name=parts.pop();const domain=parts.join('::');return c.powers.find(x=>x.name===name&&(!domain||x.domain===domain));}).filter(Boolean);
    const f={
      name:raw.name||'',pron:raw.pronouns||'',level:String(raw.level||1),chosen_path:path,
      ancestry:ar.name||raw.ancestry||'',ancestry_gift:ancestryParts.join('\n\n'),ancestry_note:ancestryParts.join('\n\n'),ailuran_variant:strain?strain.name:'',
      community:cr.name||raw.community||'',community_note:communityFeature,community_gift:communityFeature,community_advantages:communityFeature,
      affiliation:(rules(aff).name||aff?.name||raw.affiliation||''),class:clr.name||raw.cls||'',subclass:sr.name||raw.subclass||'',
      signature_trait:sr.trait||clr.spellcastTrait||'',features:classFeature,
      a_featname:hopeFeature.name||'',a_feattext:hopeFeature.text||'',
      base_hp_max:String(cls?.statistics?.hitPoints||clr.hp||6),base_stress_max:'6',base_evasion:String(cls?.statistics?.evasion||clr.evasion||10),evasion:String(cls?.statistics?.evasion||clr.evasion||10),
      wealth:String(raw.wealth||1),kit_class:(clr.items||[]).join(' · '),kit_personal:raw.kit||'',
      s_exp_0:raw.experiences?.[0]||'',s_exp_1:raw.experiences?.[1]||'',a_exp_0:raw.experiences?.[0]||'',a_exp_1:raw.experiences?.[1]||'',
      s_exp_0_bonus:'+2',s_exp_1_bonus:'+2',a_exp_0_bonus:'+2',a_exp_1_bonus:'+2',
      tr_agility:signed(raw.traits?.agility),tr_strength:signed(raw.traits?.strength),tr_finesse:signed(raw.traits?.finesse),tr_knowledge:signed(raw.traits?.knowledge),tr_instinct:signed(raw.traits?.instinct),tr_presence:signed(raw.traits?.presence),
      base_tr_agility:signed(raw.traits?.agility),base_tr_strength:signed(raw.traits?.strength),base_tr_finesse:signed(raw.traits?.finesse),base_tr_knowledge:signed(raw.traits?.knowledge),base_tr_instinct:signed(raw.traits?.instinct),base_tr_presence:signed(raw.traits?.presence),
      seed_motive:raw.bgAnswer||'',s_anchor:raw.anchor||'',equipment_notes:raw.wound||'',aff_notes:[raw.appearance,raw.voice].filter(Boolean).join('\n')
    };
    if(selectedWeapons[0]){const w=selectedWeapons[0];f.wpri_name=w.name;f.wpri_trait=[w.trait,w.range].filter(Boolean).join(' · ');f.wpri_dmg=w.damage||'';f.wpri_dmg_final=w.damage||'';f.wpri_feat=(w.features||[]).join(', ');f.wpri_tier=`${w.tier?.code||''} ${w.tier?.name||''}`.trim();}
    if(selectedWeapons[1]){const w=selectedWeapons[1];f.wsec_name=w.name;f.wsec_trait=[w.trait,w.range].filter(Boolean).join(' · ');f.wsec_dmg=w.damage||'';f.wsec_dmg_final=w.damage||'';f.wsec_feat=(w.features||[]).join(', ');f.wsec_tier=`${w.tier?.code||''} ${w.tier?.name||''}`.trim();}
    if(selectedArmor){f.armor_name=selectedArmor.name;f.armor_thr=selectedArmor.thresholds?.raw||`${selectedArmor.thresholds?.major||''} / ${selectedArmor.thresholds?.severe||''}`;f.thr_major=String(selectedArmor.thresholds?.major||'');f.thr_severe=String(selectedArmor.thresholds?.severe||'');f.armor_score=String(selectedArmor.armorSlots||0);f.base_armor_slots=String(selectedArmor.armorSlots||0);f.armor_feat=(selectedArmor.features||[]).join(', ');f.armor_tier=`${selectedArmor.tier?.code||''} ${selectedArmor.tier?.name||''}`.trim();}
    selectedPowers.slice(0,5).forEach((power,i)=>{f[`a_pwr_${i}_n`]=power.name;f[`a_pwr_${i}_d`]=`${power.domain} · L${power.level}`;f[`a_pwr_${i}_rc`]=String(power.recallCost||'');});
    if(sr.foundation){f.s_move_0_n=`Foundation · ${sr.foundation.name}${sr.foundation.type?` (${sr.foundation.type})`:''}`;f.s_move_0_t=sr.foundation.desc||sr.foundation.text||'';}
    const tracks={max:{hp:Number(f.base_hp_max||6),armor_slots:Number(f.base_armor_slots||0),stress:6,s_resolve:2,a_hope:6,s_effort:6},current:{}};
    return {fields:f,tracks};
  }
  async function sync(){
    const button=q('#vf-sync-creator');
    const previous=button&&button.textContent;
    if(button){button.disabled=true;button.textContent='Syncing…';}
    try{
      const raw=currentDraft();
      const out=await convert(raw);
      localStorage.setItem(FIELDS_KEY,JSON.stringify(out.fields));
      localStorage.setItem(TRACKS_KEY,JSON.stringify(out.tracks));
      localStorage.setItem(LAST_SYNC_KEY,JSON.stringify(raw));
      location.reload();
    }catch(err){alert('Could not sync the Creator draft: '+err.message);if(button){button.disabled=false;button.textContent=previous;}}
  }
  function addButton(){
    const group=q('.toolbar-section.io-tools .tool-subgroup')||q('.toolbar-section.io-tools')||q('.tb-actions');
    if(!group||q('#vf-sync-creator'))return;
    const b=document.createElement('button');b.id='vf-sync-creator';b.type='button';b.textContent='Creator Draft';b.title='Load the current canonical RC2 Character Creator draft into the full sheet';b.addEventListener('click',sync);group.prepend(b);
  }
  function firstOpenSync(){
    if(localStorage.getItem(FIELDS_KEY))return;
    const raw=currentDraft();if(!raw)return;
    convert(raw).then(out=>{localStorage.setItem(FIELDS_KEY,JSON.stringify(out.fields));localStorage.setItem(TRACKS_KEY,JSON.stringify(out.tracks));localStorage.setItem(LAST_SYNC_KEY,JSON.stringify(raw));location.reload();}).catch(()=>{});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{addButton();firstOpenSync();});else{addButton();firstOpenSync();}
})();
