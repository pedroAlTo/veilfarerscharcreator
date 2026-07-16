(function(){
  'use strict';
  const D = window.VeilFarersData;
  const I = window.VeilFarersInventory;
  const pageType = document.body.dataset.catalog;
  const config = pageType === 'items'
    ? { tabs:[['gear','Gear'],['augments','Augments']], intro:'General gear and augmentations from the canonical 11.1 RC3 datasets.' }
    : { tabs:[['weapons','Weapons'],['armor','Armor']], intro:'Weapons and armor from Core and Rust & Steel, using stable canonical IDs.' };
  let active = config.tabs[0][0];
  let data = {};
  let visibleItems = [];
  const els = {
    tabs: document.querySelector('#catalog-tabs'), cards:document.querySelector('#catalog-cards'), count:document.querySelector('#catalog-count'),
    search:document.querySelector('#catalog-search'), pack:document.querySelector('#catalog-pack'), tier:document.querySelector('#catalog-tier'), sort:document.querySelector('#catalog-sort'),
    inventory:document.querySelector('#inventory-list'), invCount:document.querySelector('#inventory-count'), invCredits:document.querySelector('#inventory-credits'), release:document.querySelector('#canonical-release'),
    exportBtn:document.querySelector('#inventory-export'), importInput:document.querySelector('#inventory-import'), clearBtn:document.querySelector('#inventory-clear')
  };

  const esc = D.escapeHtml;
  const featureText = item => Array.isArray(item.features) ? item.features.join(', ') : '';
  function primaryDescription(item){
    if(item.type === 'weapon') return featureText(item) || `${item.damage || '—'} at ${item.range || '—'} range.`;
    if(item.type === 'armor') return featureText(item) || `Major ${item.thresholds?.major ?? '—'} / Severe ${item.thresholds?.severe ?? '—'}.`;
    if(item.type === 'gear') return item.use || 'General equipment.';
    if(item.type === 'augment') return [item.benefit, item.drawback ? `Drawback: ${item.drawback}` : ''].filter(Boolean).join(' ');
    return '';
  }
  function meta(item){
    const parts = [D.tierName(item), D.packLabel(item.pack)];
    if(item.type === 'weapon') parts.push(item.weaponFamily || item.trait || '', item.range || '', item.damage || '');
    if(item.type === 'armor') parts.push(item.weightClass || '', `${item.armorSlots ?? '—'} slots`, `${item.thresholds?.major ?? '—'} / ${item.thresholds?.severe ?? '—'}`);
    if(item.type === 'augment' && item.complexity) parts.push(`Complexity ${item.complexity}`);
    return parts.filter(Boolean);
  }
  function inventoryQty(id){ return Number(I.read().entries[id]?.quantity || 0); }
  function renderTabs(){
    els.tabs.innerHTML = config.tabs.map(([id,label]) => `<button class="vf-tab ${id===active?'active':''}" data-tab="${id}">${esc(label)} <span>${data[id]?.length ?? '…'}</span></button>`).join('');
  }
  function filterItems(){
    const q = els.search.value.trim().toLowerCase();
    const pack = els.pack.value;
    const tier = els.tier.value;
    let items = [...(data[active] || [])];
    items = items.filter(item => {
      const haystack = [item.name, item.pack, item.type, item.trait, item.range, item.damage, item.weaponFamily, item.weightClass, item.use, item.benefit, item.drawback, featureText(item)].join(' ').toLowerCase();
      return (!q || haystack.includes(q)) && (!pack || item.pack===pack) && (!tier || D.tierName(item)===tier);
    });
    const sort = els.sort.value;
    if(sort === 'tier') items.sort((a,b)=>D.tierRank(a)-D.tierRank(b) || String(a.name).localeCompare(String(b.name)));
    else if(sort === 'cost') items.sort((a,b)=>Number(a.cost?.credits ?? 999)-Number(b.cost?.credits ?? 999) || String(a.name).localeCompare(String(b.name)));
    else items.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    visibleItems = items;
    renderCards();
  }
  function renderCards(){
    els.count.textContent = `${visibleItems.length} of ${(data[active] || []).length} entries`;
    if(!visibleItems.length){ els.cards.innerHTML='<div class="vf-empty">No canonical entries match these filters.</div>'; return; }
    els.cards.innerHTML = visibleItems.map(item => {
      const qty = inventoryQty(item.id);
      return `<article class="vf-card" data-id="${esc(item.id)}">
        <div class="vf-card-top"><h2>${esc(item.name)}</h2><span class="vf-badge">${esc(D.tierName(item))}</span></div>
        <div class="vf-meta">${meta(item).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
        <p class="vf-description">${esc(primaryDescription(item))}</p>
        <div class="vf-card-actions"><span class="vf-cost">Cost <strong>${esc(D.costLabel(item))}</strong></span><button class="vf-button ${qty?'':'primary'}" data-add="${esc(item.id)}">${qty?`Add another · ${qty} owned`:'Add to inventory'}</button></div>
      </article>`;
    }).join('');
  }
  function allLoaded(){ return Object.values(data).flat(); }
  function renderInventory(){
    const state = I.read();
    const entries = Object.values(state.entries).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    els.invCount.textContent = entries.reduce((n,e)=>n+Number(e.quantity||0),0);
    let totalCredits=0;
    for(const e of entries){
      const item = allLoaded().find(x=>x.id===e.id);
      const value = Number(e.credits ?? item?.cost?.credits);
      if(Number.isFinite(value)) totalCredits += value * Number(e.quantity||0);
    }
    els.invCredits.textContent = totalCredits ? `${totalCredits} Cr` : '0 Cr';
    if(!entries.length){ els.inventory.innerHTML='<div class="vf-empty">Your local inventory is empty.</div>'; return; }
    els.inventory.innerHTML = entries.map(e=>`<div class="vf-inventory-row" data-inventory-id="${esc(e.id)}">
      <div><strong>${esc(e.name)}</strong><small>${esc(D.packLabel(e.pack))} · ${esc(e.type)} · ${esc(D.costLabel({cost:{credits:e.credits}}))}</small></div>
      <div class="vf-qty"><button data-dec="${esc(e.id)}" aria-label="Remove one">−</button><span>${Number(e.quantity||0)}</span><button data-inc="${esc(e.id)}" aria-label="Add one">+</button></div>
    </div>`).join('');
  }
  async function init(){
    try{
      const [manifest, ...groups] = await Promise.all([D.manifest(), ...config.tabs.map(([name])=>D.loadCollection(name))]);
      config.tabs.forEach(([name],i)=>data[name]=groups[i]);
      els.release.textContent = manifest.release || manifest.version || '11.1 RC3';
      renderTabs(); filterItems(); renderInventory();
    }catch(err){
      els.cards.innerHTML=`<div class="vf-error">Canonical data could not be loaded: ${esc(err.message)}</div>`;
    }
  }
  els.tabs.addEventListener('click',e=>{ const b=e.target.closest('[data-tab]'); if(!b)return; active=b.dataset.tab; renderTabs(); filterItems(); });
  [els.search,els.pack,els.tier,els.sort].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',filterItems));
  els.cards.addEventListener('click',e=>{ const b=e.target.closest('[data-add]'); if(!b)return; const item=allLoaded().find(x=>x.id===b.dataset.add); if(item) I.add(item,1); });
  els.inventory.addEventListener('click',e=>{
    const inc=e.target.closest('[data-inc]'), dec=e.target.closest('[data-dec]');
    if(inc){ const item=allLoaded().find(x=>x.id===inc.dataset.inc); if(item)I.add(item,1); }
    if(dec){ const state=I.read(); const id=dec.dataset.dec; I.setQuantity(id,Number(state.entries[id]?.quantity||0)-1); }
  });
  els.exportBtn.addEventListener('click',I.exportFile);
  els.importInput.addEventListener('change',async e=>{ try{ if(e.target.files[0]) await I.importFile(e.target.files[0]); }catch(err){ alert(err.message); } e.target.value=''; });
  els.clearBtn.addEventListener('click',()=>{ if(confirm('Clear the local VeilFarers inventory?')) I.clear(); });
  I.subscribe(()=>{ renderInventory(); renderCards(); });
  init();
})();
