(function(){
  'use strict';
  const D = window.VeilFarersData;
  const I = window.VeilFarersInventory;
  const pageType = document.body.dataset.catalog;
  const config = pageType === 'items'
    ? { tabs:[['gear','Gear'],['augments','Augments']], intro:'General gear and augmentations from the canonical RC3 datasets.' }
    : { tabs:[['weapons','Weapons'],['armor','Armor']], intro:'Weapons and armor from Core and Rust & Steel, using stable canonical IDs.' };
  let active = config.tabs[0][0];
  let data = {};
  let visibleItems = [];
  const filterState = { pack:[], tier:[], category:[], property:[], owned:[], cost:[], sort:'name' };
  const multiFilterNames = new Set(['pack','tier','category','property','owned','cost']);
  const filterNames = Object.keys(filterState);
  const els = {
    tabs: document.querySelector('#catalog-tabs'), cards:document.querySelector('#catalog-cards'), count:document.querySelector('#catalog-count'),
    search:document.querySelector('#catalog-search'), filters:[...document.querySelectorAll('[data-filter-name]')], reset:document.querySelector('#catalog-reset'),
    inventory:document.querySelector('#inventory-list'), invCount:document.querySelector('#inventory-count'), invCredits:document.querySelector('#inventory-credits'), release:document.querySelector('#canonical-release'),
    exportBtn:document.querySelector('#inventory-export'), importInput:document.querySelector('#inventory-import'), clearBtn:document.querySelector('#inventory-clear'), transferStatus:document.querySelector('#inventory-transfer-status'),
    activeCharacter:document.querySelector('#inventory-active-character'), activeCharacterId:document.querySelector('#inventory-active-character-id'), activeCharacterPanel:document.querySelector('.vf-active-loadout'), transferButtons:[...document.querySelectorAll('[data-inventory-send]')]
  };

  const esc = D.escapeHtml;
  const featureText = item => Array.isArray(item.features) ? item.features.join(', ') : '';
  const clean = value => String(value || '').trim();
  const uniq = values => [...new Set(values.map(clean).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));
  const titleCase = value => clean(value).replace(/[-_]+/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase());

  function primaryDescription(item){
    if(item.type === 'weapon') return featureText(item) || `${item.damage || '—'} at ${item.range || '—'} range.`;
    if(item.type === 'armor') return featureText(item) || `Major ${item.thresholds?.major ?? '—'} / Severe ${item.thresholds?.severe ?? '—'}.`;
    if(item.type === 'gear') return item.use || 'General equipment.';
    if(item.type === 'augment') return [item.benefit, item.drawback ? `Drawback: ${item.drawback}` : ''].filter(Boolean).join(' ');
    return '';
  }
  function meta(item){
    const parts = [D.tierName(item), D.packLabel(item.pack)];
    if(item.type === 'weapon') parts.push(item.category || titleCase(item.weaponFamily), item.trait || '', item.range || '', item.damage || '');
    if(item.type === 'armor') parts.push(item.category || titleCase(item.weightClass), `${item.armorSlots ?? '—'} slots`, `${item.thresholds?.major ?? '—'} / ${item.thresholds?.severe ?? '—'}`);
    if(item.type === 'gear') parts.push(gearCategory(item));
    if(item.type === 'augment') {
      parts.push(augmentCategory(item));
      if(item.complexity) parts.push(`Complexity ${item.complexity}`);
      if(item.capacityCost) parts.push(`Capacity ${item.capacityCost}`);
      if(item.activationStress) parts.push(`${item.activationStress} Stress`);
    }
    return parts.filter(Boolean);
  }
  function inventoryQty(id){ return Number(I.read().entries[id]?.quantity || 0); }
  function renderTabs(){
    els.tabs.innerHTML = config.tabs.map(([id,label]) => `<button class="vf-tab ${id===active?'active':''}" data-tab="${id}">${esc(label)} <span>${data[id]?.length ?? '…'}</span></button>`).join('');
  }

  function textBlob(item){
    return [item.name,item.use,item.benefit,item.drawback,item.category,item.weaponFamily,item.weightClass,item.trait,item.range,item.damage,featureText(item),...(item.aliases||[])].join(' ').toLowerCase();
  }
  function gearCategory(item){
    const text=textBlob(item);
    if(/med|medical|surgery|heal|first aid|hospital|pharma|antitoxin|recovery/.test(text)) return 'Medical & Recovery';
    if(/tool|repair|maintenance|diagnostic|fabricat|salvage|engineering|omni-tool/.test(text)) return 'Tools & Repair';
    if(/comm|data|computer|datapad|signal|beacon|translator|network|scanner/.test(text)) return 'Communications & Data';
    if(/survival|environment|vacuum|climb|camp|ration|water|weather|hazard|life support/.test(text)) return 'Survival & Environment';
    if(/security|lock|detect|sensor|surveillance|stealth|disguise|countermeasure|alarm/.test(text)) return 'Security & Detection';
    if(/vehicle|travel|navigation|mobility|jet|grapple|transport|flight|exploration/.test(text)) return 'Mobility & Exploration';
    if(/ammo|ammunition|charge|battery|fuel|consum|supply|grenade/.test(text)) return 'Consumables & Supplies';
    if(/care|service|installation|rent|lodging|permit|license|treatment/.test(text)) return 'Services';
    return 'General Equipment';
  }
  function augmentCategory(item){
    const text=textBlob(item);
    if(/neural|memory|brain|mind|cognitive|data-jack|interface|processor/.test(text)) return 'Neural & Interface';
    if(/eye|vision|audio|hearing|sensor|olfactory|sensory/.test(text)) return 'Sensory';
    if(/muscle|limb|arm|leg|bone|strength|agility|speed|reflex/.test(text)) return 'Physical Enhancement';
    if(/armor|skin|shield|resist|toxin|immune|medical|repair|regener/.test(text)) return 'Defense & Medical';
    if(/communication|tool|storage|utility|grapple|compartment/.test(text)) return 'Utility';
    return 'General Augment';
  }
  function itemCategories(item){
    if(item.type==='weapon') return [clean(item.category) || titleCase(item.weaponFamily) || 'Unclassified Weapon'];
    if(item.type==='armor') return [clean(item.category) || titleCase(item.weightClass) || 'Unclassified Armor'];
    if(item.type==='gear') return [gearCategory(item)];
    if(item.type==='augment') return [augmentCategory(item)];
    return ['Unclassified'];
  }
  function itemProperties(item){
    const out=[];
    if(item.type==='weapon'){
      if(item.trait) out.push(`Trait · ${item.trait}`);
      if(item.range) out.push(`Range · ${item.range}`);
      (item.features||[]).forEach(value=>out.push(`Feature · ${value}`));
      if(Number(item.burden)>=2) out.push('Burden · Heavy');
      else if(item.burden!==undefined && item.burden!==null) out.push('Burden · Light');
    } else if(item.type==='armor'){
      const slots=Number(item.armorSlots);
      if(Number.isFinite(slots)) out.push(slots<=3?'Armor Slots · 1–3':slots<=6?'Armor Slots · 4–6':'Armor Slots · 7+');
      (item.features||[]).forEach(value=>out.push(`Feature · ${value}`));
    } else if(item.type==='gear'){
      const text=textBlob(item);
      if(/advantage/.test(text)) out.push('Effect · Grants Advantage');
      if(/heal|medical|recovery|first aid|hp/.test(text)) out.push('Effect · Medical / Healing');
      if(/repair|tool|tech|engineering|fabricat/.test(text)) out.push('Effect · Repair / Technology');
      if(/comm|signal|data|computer|translate/.test(text)) out.push('Effect · Communication / Data');
      if(/environment|vacuum|survival|weather|hazard/.test(text)) out.push('Effect · Environmental Protection');
      if(/security|detect|sensor|stealth|disguise/.test(text)) out.push('Effect · Security / Detection');
      if(/vehicle|travel|mobility|navigation|flight/.test(text)) out.push('Effect · Travel / Mobility');
      if(!out.length) out.push('Effect · General Utility');
    } else if(item.type==='augment'){
      out.push(item.activationStress ? 'Activation · Costs Stress' : 'Activation · Passive');
      if(item.drawback) out.push('Profile · Has Drawback');
      const capacity=Number(item.capacityCost || item.complexity);
      if(Number.isFinite(capacity)) out.push(capacity<=1?'Capacity · 1':capacity===2?'Capacity · 2':'Capacity · 3+');
      const text=textBlob(item);
      if(/advantage/.test(text)) out.push('Effect · Grants Advantage');
      if(/\+1|increase|enhanc/.test(text)) out.push('Effect · Improves Trait / Roll');
      if(/resist|immune|armor|protect/.test(text)) out.push('Effect · Protection');
    }
    return uniq(out);
  }
  function costBand(item){
    const value=D.creditValue(item);
    if(value===null) return 'Unpriced';
    if(value<=0) return 'Free / 0 Cr';
    if(value===1) return '1 Cr';
    if(value<=4) return '2–4 Cr';
    if(value<=9) return '5–9 Cr';
    if(value<=16) return '10–16 Cr';
    return '17+ Cr';
  }

  const defaultLabels={pack:'All sources',tier:'All tiers',category:'All categories',property:'All properties',owned:'Any ownership',cost:'Any cost',sort:'Name'};
  function filterOptions(name){
    const items=data[active]||[];
    if(name==='pack') return uniq(items.map(item=>item.pack)).map(value=>({value,label:D.packLabel(value)}));
    if(name==='tier') return uniq(items.map(D.tierName)).map(value=>({value,label:value}));
    if(name==='category') return uniq(items.flatMap(itemCategories)).map(value=>({value,label:value}));
    if(name==='property') return uniq(items.flatMap(itemProperties)).map(value=>({value,label:value}));
    if(name==='owned') return [{value:'owned',label:'Owned only'},{value:'not-owned',label:'Not owned'}];
    if(name==='cost') return ['Free / 0 Cr','1 Cr','2–4 Cr','5–9 Cr','10–16 Cr','17+ Cr','Unpriced'].map(value=>({value,label:value}));
    if(name==='sort') return [{value:'name',label:'Name'},{value:'tier',label:'Tier'},{value:'cost',label:'Cost'},{value:'owned',label:'Owned quantity'}];
    return [];
  }
  function closeFilters(except=null){
    els.filters.forEach(root=>{
      if(root===except)return;
      root.classList.remove('open');
      root.querySelector('[data-filter-toggle]')?.setAttribute('aria-expanded','false');
    });
  }
  function renderFilter(name){
    const root=els.filters.find(node=>node.dataset.filterName===name);
    if(!root)return;
    const options=filterOptions(name);
    if(multiFilterNames.has(name)){
      const valid=new Set(options.map(option=>option.value));
      filterState[name]=(Array.isArray(filterState[name])?filterState[name]:[]).filter(value=>valid.has(value));
      const selected=filterState[name];
      const label=selected.length===0?defaultLabels[name]:(selected.length===1?(options.find(option=>option.value===selected[0])?.label||selected[0]):`${selected.length} selected`);
      root.querySelector('[data-filter-label]').textContent=label;
      root.querySelector('[data-filter-menu]').innerHTML=[{value:'',label:`Clear · ${defaultLabels[name]}`},...options]
        .map(option=>{const active=option.value?selected.includes(option.value):selected.length===0;return `<button type="button" role="option" aria-selected="${active}" class="vf-filter-option ${active?'active':''}" data-filter-value="${esc(option.value)}"><span aria-hidden="true">${option.value?(active?'✓':'○'):'×'}</span> ${esc(option.label)}</button>`;}).join('');
      return;
    }
    const current=filterState[name];
    if(current && !options.some(option=>option.value===current)) filterState[name]='name';
    const finalValue=filterState[name];
    const label=options.find(option=>option.value===finalValue)?.label || defaultLabels[name];
    root.querySelector('[data-filter-label]').textContent=label;
    root.querySelector('[data-filter-menu]').innerHTML=options.map(option=>`<button type="button" role="option" aria-selected="${option.value===finalValue}" class="vf-filter-option ${option.value===finalValue?'active':''}" data-filter-value="${esc(option.value)}">${esc(option.label)}</button>`).join('');
  }
  function renderFilters(){ filterNames.forEach(renderFilter); }

  function filterItems(){
    const q=els.search.value.trim().toLowerCase();
    let items=[...(data[active]||[])];
    items=items.filter(item=>{
      const qty=inventoryQty(item.id);
      const matchAny=(selected,values)=>!selected.length||selected.some(value=>values.includes(value));
      return (!q || textBlob(item).includes(q))
        && matchAny(filterState.pack,[item.pack])
        && matchAny(filterState.tier,[D.tierName(item)])
        && matchAny(filterState.category,itemCategories(item))
        && matchAny(filterState.property,itemProperties(item))
        && matchAny(filterState.owned,[qty>0?'owned':'not-owned'])
        && matchAny(filterState.cost,[costBand(item)]);
    });
    const sort=filterState.sort;
    if(sort==='tier') items.sort((a,b)=>D.tierRank(a)-D.tierRank(b)||String(a.name).localeCompare(String(b.name)));
    else if(sort==='cost') items.sort((a,b)=>(D.creditValue(a)??9999)-(D.creditValue(b)??9999)||String(a.name).localeCompare(String(b.name)));
    else if(sort==='owned') items.sort((a,b)=>inventoryQty(b.id)-inventoryQty(a.id)||String(a.name).localeCompare(String(b.name)));
    else items.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    visibleItems=items;
    renderCards();
  }
  function renderCards(){
    els.count.textContent=`${visibleItems.length} of ${(data[active]||[]).length} entries`;
    if(!visibleItems.length){els.cards.innerHTML='<div class="vf-empty">No canonical entries match these filters.</div>';return;}
    els.cards.innerHTML=visibleItems.map(item=>{
      const qty=inventoryQty(item.id);
      return `<article class="vf-card" data-id="${esc(item.id)}">
        <div class="vf-card-top"><h2>${esc(item.name)}</h2><span class="vf-badge">${esc(D.tierName(item))}</span></div>
        <div class="vf-meta">${meta(item).map(value=>`<span>${esc(value)}</span>`).join('')}</div>
        <p class="vf-description">${esc(primaryDescription(item))}</p>
        <div class="vf-card-actions"><span class="vf-cost">Cost <strong>${esc(D.costLabel(item))}</strong></span><button class="vf-button ${qty?'':'primary'}" data-add="${esc(item.id)}">${qty?`Add another · ${qty} owned`:'Add to inventory'}</button></div>
      </article>`;
    }).join('');
  }
  function allLoaded(){return Object.values(data).flat();}
  function ownedCanonical(){
    const entries=I.read().entries;
    const byId=new Map(allLoaded().map(item=>[item.id,item]));
    const groups={weapons:[],armor:[],gear:[],augments:[]};
    Object.values(entries).forEach(entry=>{
      const item=byId.get(entry.id);if(!item||Number(entry.quantity||0)<1)return;
      const bucket=item.type==='weapon'?'weapons':item.type==='armor'?'armor':item.type==='augment'?'augments':'gear';
      groups[bucket].push({...item,quantity:Number(entry.quantity||1)});
    });
    return groups;
  }
  function mergeItems(existing,incoming){
    const map=new Map();[...(Array.isArray(existing)?existing:[]),...incoming].forEach(item=>{const key=String(item?.canonicalId||item?.id||item?.name||'').trim();if(key)map.set(key,item);});return [...map.values()];
  }
  function transferStatus(message,error=false){if(!els.transferStatus)return;els.transferStatus.textContent=message;els.transferStatus.classList.toggle('error',error);}
  function activeCharacterTarget(){
    const registry=window.VeilFarersCharacterRegistry;
    const id=String(registry?.currentId?.()||localStorage.getItem('veilfarers.character.currentId.v1')||'').trim().toUpperCase();
    const record=id&&registry?.get?.(id);
    let characters=[];try{characters=JSON.parse(localStorage.getItem('veilfarers-player-tool-characters')||'[]');}catch(_){ }
    if(!Array.isArray(characters))characters=[];
    const playerCharacter=characters.find(item=>item&&item.entityType!=='drone'&&id&&String(item.characterId||item.id||'').trim().toUpperCase()===id);
    const characterData=record?.characterData||{};
    const fields=characterData.sheetPayload?.fields||{};
    const name=clean(
      playerCharacter?.name||
      characterData.playerCharacter?.name||
      characterData.creatorState?.name||
      fields.character_name||fields.name||
      record?.name
    );
    return {id,name:name||id,record,playerCharacter};
  }
  function renderActiveCharacter(){
    if(!els.activeCharacter)return;
    const target=activeCharacterTarget();
    const ready=Boolean(target.id);
    els.activeCharacter.textContent=ready?(target.name||target.id):'No active character selected';
    els.activeCharacterId.textContent=ready?`${target.id} · All transfer buttons target this character.`:'Choose an active character in the Character Vault, Creator or Player Tool before transferring equipment.';
    els.activeCharacterPanel?.setAttribute('data-active-character-state',ready?'ready':'missing');
    els.transferButtons.forEach(button=>{button.disabled=!ready;button.setAttribute('aria-disabled',String(!ready));});
    if(!ready)transferStatus('Select an active character before sending this inventory.',true);
    else if(els.transferStatus?.classList.contains('error'))transferStatus('');
    return target;
  }
  function sendToPlayerTool(groups){
    const key='veilfarers-player-tool-characters';
    let characters=[];try{characters=JSON.parse(localStorage.getItem(key)||'[]');}catch(_){ }
    if(!Array.isArray(characters))characters=[];
    const registryId=window.VeilFarersCharacterRegistry?.currentId?.()||localStorage.getItem('veilfarers.character.currentId.v1')||'';
    if(!registryId)throw Error('Select an active character before sending equipment.');
    let index=characters.findIndex(item=>item&&item.entityType!=='drone'&&registryId&&String(item.characterId||item.id||'').toUpperCase()===String(registryId).toUpperCase());
    if(index<0)throw Error(`The active character ${registryId} is not available in Player Tool. Open or import that character first.`);
    const character={...characters[index]};
    character.weaponArsenal=mergeItems(character.weaponArsenal,groups.weapons);character.weaponInventory=character.weaponArsenal.map(item=>item.canonicalId||item.id||item.name);
    character.armorArsenal=mergeItems(character.armorArsenal,groups.armor);character.armorInventory=character.armorArsenal.map(item=>item.canonicalId||item.id||item.name);
    character.gearArsenal=mergeItems(character.gearArsenal,groups.gear);character.gearInventory=character.gearArsenal.map(item=>item.canonicalId||item.id||item.name);
    character.augmentArsenal=mergeItems(character.augmentArsenal,groups.augments);character.augmentInventory=character.augmentArsenal.map(item=>item.canonicalId||item.id||item.name);
    characters[index]=character;localStorage.setItem(key,JSON.stringify(characters));
    const id=String(character.characterId||character.id||'');const registry=window.VeilFarersCharacterRegistry;
    if(registry&&/^VF-\d{6,}$/i.test(id)&&registry.get(id))registry.saveLocalData(id,{playerCharacter:character},{source:'inventory-transfer-v59.78'});
    return character.name||id||'active character';
  }
  function sendToSheet(groups){
    const key='veilfarers_sheet_fields_v2_40';let fields={};try{fields=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){ }
    const target=activeCharacterTarget();if(!target.id)throw Error('Select an active character before sending equipment.');
    const sheetId=String(fields.character_id||'').trim().toUpperCase();
    if(sheetId&&sheetId!==target.id)throw Error(`Charsheet is showing ${sheetId}, but ${target.id} is active. Open the active character in Charsheet first.`);
    fields.character_id=target.id;
    const primary=groups.weapons[0],secondary=groups.weapons[1],armor=groups.armor[0];
    if(primary)fields.wpri_name=primary.name;if(secondary)fields.wsec_name=secondary.name;if(armor)fields.armor_name=armor.name;
    groups.gear.slice(0,8).forEach((item,index)=>{fields[`eq_${index}_name`]=item.name;fields[`eq_${index}_qty`]=String(item.quantity||1);});
    groups.augments.slice(0,10).forEach((item,index)=>{fields[`aug_${index}_name`]=item.name;});
    localStorage.setItem(key,JSON.stringify(fields));return true;
  }
  function sendInventory(target){
    try{
      const activeTarget=activeCharacterTarget();if(!activeTarget.id)throw Error('Select an active character before sending equipment.');
      const groups=ownedCanonical();const count=Object.values(groups).flat().length;if(!count)throw Error('Add equipment to the inventory before sending it.');
      let player='';if(target==='player'||target==='both')player=sendToPlayerTool(groups);if(target==='sheet'||target==='both')sendToSheet(groups);
      const activeName=player||activeTarget.name||activeTarget.id;
      transferStatus(target==='both'?`Sent ${count} equipment entries to ${activeName} in Player Tool and Charsheet.`:target==='player'?`Sent ${count} equipment entries to ${activeName} in Player Tool.`:`Sent ${count} equipment entries to ${activeName} in Charsheet.`);
    }catch(error){transferStatus(error.message||String(error),true);}
  }
  function renderInventory(){
    const state=I.read();
    const entries=Object.values(state.entries).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    els.invCount.textContent=entries.reduce((n,e)=>n+Number(e.quantity||0),0);
    let totalCredits=0;
    for(const entry of entries){
      const item=allLoaded().find(x=>x.id===entry.id);
      const value=Number(entry.credits??item?.cost?.credits);
      if(Number.isFinite(value))totalCredits+=value*Number(entry.quantity||0);
    }
    els.invCredits.textContent=totalCredits?`${totalCredits} Cr`:'0 Cr';
    if(!entries.length){els.inventory.innerHTML='<div class="vf-empty">Your local inventory is empty.</div>';return;}
    els.inventory.innerHTML=entries.map(entry=>`<div class="vf-inventory-row" data-inventory-id="${esc(entry.id)}">
      <div><strong>${esc(entry.name)}</strong><small>${esc(D.packLabel(entry.pack))} · ${esc(entry.type)} · ${esc(D.costLabel({cost:{credits:entry.credits}}))}</small></div>
      <div class="vf-qty"><button data-dec="${esc(entry.id)}" aria-label="Remove one">−</button><span>${Number(entry.quantity||0)}</span><button data-inc="${esc(entry.id)}" aria-label="Add one">+</button></div>
    </div>`).join('');
  }
  async function init(){
    try{
      const collectionNames=['weapons','armor','gear','augments'];
      const [manifest,...groups]=await Promise.all([D.manifest(),...collectionNames.map(name=>D.loadCollection(name))]);
      collectionNames.forEach((name,index)=>data[name]=groups[index]);
      els.release.textContent=manifest.release||manifest.version||'11.1 RC3';
      renderTabs();renderFilters();filterItems();renderInventory();
      renderActiveCharacter();
    }catch(error){els.cards.innerHTML=`<div class="vf-error">Canonical data could not be loaded: ${esc(error.message)}</div>`;}
  }

  els.tabs.addEventListener('click',event=>{
    const button=event.target.closest('[data-tab]');if(!button)return;
    active=button.dataset.tab;
    filterState.category=[];filterState.property=[];
    renderTabs();renderFilters();filterItems();
  });
  els.search.addEventListener('input',filterItems);
  els.filters.forEach(root=>{
    const toggle=root.querySelector('[data-filter-toggle]');
    toggle.addEventListener('click',event=>{
      event.stopPropagation();
      const opening=!root.classList.contains('open');
      closeFilters(root);root.classList.toggle('open',opening);toggle.setAttribute('aria-expanded',String(opening));
    });
    root.querySelector('[data-filter-menu]').addEventListener('click',event=>{
      event.stopPropagation();const option=event.target.closest('[data-filter-value]');if(!option)return;
      const name=root.dataset.filterName,value=option.dataset.filterValue;
      if(multiFilterNames.has(name)){
        const selected=Array.isArray(filterState[name])?filterState[name].slice():[];
        if(!value)filterState[name]=[];
        else filterState[name]=selected.includes(value)?selected.filter(item=>item!==value):selected.concat(value);
        renderFilter(name);filterItems();
      }else{
        filterState[name]=value;renderFilter(name);closeFilters();filterItems();
      }
    });
  });
  document.addEventListener('click',()=>closeFilters());
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeFilters();});
  els.reset.addEventListener('click',()=>{
    els.search.value='';Object.assign(filterState,{pack:[],tier:[],category:[],property:[],owned:[],cost:[],sort:'name'});
    renderFilters();filterItems();
  });
  els.cards.addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;const item=allLoaded().find(x=>x.id===button.dataset.add);if(item)I.add(item,1);});
  els.inventory.addEventListener('click',event=>{
    const inc=event.target.closest('[data-inc]'),dec=event.target.closest('[data-dec]');
    if(inc){const item=allLoaded().find(x=>x.id===inc.dataset.inc);if(item)I.add(item,1);}
    if(dec){const state=I.read();const id=dec.dataset.dec;I.setQuantity(id,Number(state.entries[id]?.quantity||0)-1);}
  });
  els.exportBtn.addEventListener('click',I.exportFile);
  els.importInput.addEventListener('change',async event=>{try{if(event.target.files[0])await I.importFile(event.target.files[0]);}catch(error){alert(error.message);}event.target.value='';});
  els.clearBtn.addEventListener('click',()=>{if(confirm('Clear the local VeilFarers inventory?'))I.clear();});
  document.querySelectorAll('[data-inventory-send]').forEach(button=>button.addEventListener('click',()=>sendInventory(button.dataset.inventorySend)));
  window.addEventListener('veilfarers:active-character-changed',renderActiveCharacter);
  window.addEventListener('veilfarers:character-updated',renderActiveCharacter);
  window.addEventListener('storage',event=>{if(['veilfarers.character.currentId.v1','veilfarers-player-tool-characters'].includes(event.key))renderActiveCharacter();});
  I.subscribe(()=>{renderInventory();renderFilters();filterItems();});
  init();
})();
