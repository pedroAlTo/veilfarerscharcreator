(function(){
  'use strict';
  const CHARACTER_KEY='veilfarers-character';
  const PROGRESS_KEY='veilfarers.progress.v1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const root=document.getElementById('sheet-root');
  let state=null;
  try{state=JSON.parse(localStorage.getItem(CHARACTER_KEY)||'null');}catch(_){ }
  function progress(){try{return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'null')||{level:1};}catch(_){return{level:1};}}
  async function data(name){const r=await fetch(`/data/${name}.json`,{cache:'no-store'});return r.ok?r.json():[];}
  function label(list,id){return list.find(x=>x.id===id)?.name||id||'—';}
  async function render(){
    if(!state){root.innerHTML='<div class="vf-empty"><h2>No local character found</h2><p>Create or load an RC2 character first.</p><a class="vf-button primary" href="/">Open Character Creator</a></div>';return;}
    const [ancestries,communities,classes]=await Promise.all([data('ancestries'),data('communities'),data('classes')]);
    const p=progress();
    const traits=state.traits||{};
    const inventory=window.VeilFarersInventory.read();
    const entries=Object.values(inventory.entries||{});
    root.innerHTML=`<section class="vf-panel vf-content"><div class="vf-actions" style="justify-content:space-between"><div><div class="vf-eyebrow">Level ${Number(p.level||1)} · ${esc(state.path||'Path unset')}</div><h2 style="font-size:32px;margin:.25rem 0">${esc(state.name||'Unnamed VeilFarer')}</h2><p>${esc(label(ancestries,state.ancestry))} · ${esc(label(communities,state.community))} · ${esc(label(classes,state.cls))}${state.subclass?` · ${esc(state.subclass)}`:''}</p></div><div class="vf-actions"><a class="vf-button" href="/">Edit in Creator</a><button class="vf-button" onclick="window.print()">Print</button><a class="vf-button primary" href="/login.html">Account Vault</a></div></div><div class="vf-sheet-grid"><div class="vf-sheet-block"><h3>Traits</h3><div class="vf-traits">${['agility','strength','finesse','knowledge','instinct','presence'].map(t=>`<div class="vf-trait"><strong>${Number(traits[t]??0)>=0?'+':''}${Number(traits[t]??0)}</strong><span>${esc(t)}</span></div>`).join('')}</div></div><div class="vf-sheet-block"><h3>Identity</h3><p><strong>Pronouns:</strong> ${esc(state.pronouns||'—')}</p><p><strong>Affiliation:</strong> ${esc(state.affiliation||'—')}</p><p><strong>Experiences:</strong> ${esc((state.experiences||[]).filter(Boolean).join(' · ')||'—')}</p></div><div class="vf-sheet-block"><h3>Creator Loadout</h3><p><strong>Weapons:</strong> ${esc((state.weapons||[]).join(', ')||'—')}</p><p><strong>Armor:</strong> ${esc((state.armors||[]).join(', ')||'—')}</p><p><strong>Kit:</strong> ${esc(state.kit||'—')}</p></div><div class="vf-sheet-block"><h3>Extended Inventory</h3>${entries.length?`<ul>${entries.map(e=>`<li>${esc(e.name)} × ${Number(e.quantity||0)}</li>`).join('')}</ul>`:'<p>No extended inventory items selected.</p>'}<div class="vf-actions"><a class="vf-button" href="/armory.html">Armory</a><a class="vf-button" href="/items.html">Items</a></div></div><div class="vf-sheet-block"><h3>Background</h3><p>${esc(state.bgAnswer||'No background answer saved.')}</p></div><div class="vf-sheet-block"><h3>Level Up</h3><p>The sheet bridge is active at Level ${Number(p.level||1)}. Automated advancement remains locked until the RC2 level-up decision matrix is mapped and validated, preventing unsupported rule assumptions.</p><p class="vf-muted">Next implementation target: class/subclass advancement, domain card selection, trait increases and threshold progression.</p></div></div></section>`;
  }
  render().catch(err=>root.innerHTML=`<div class="vf-error">Character sheet could not load: ${esc(err.message)}</div>`);
})();
