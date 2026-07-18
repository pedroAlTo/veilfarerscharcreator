(function(root){
'use strict';
const weaponMods=[
{id:'extended-magazine',name:'Extended Magazine',hardpoints:1,effect:'Auto-Fire weapons resupply per session',cost:'1 Cr (WT1)'},
{id:'heavy-barrel',name:'Heavy Barrel',hardpoints:1,effect:'+1 damage modifier; adds Heavy',cost:'1 Cr (WT1)',damageBonus:1},
{id:'suppressor',name:'Suppressor',hardpoints:1,effect:'Adds Silent; reduces range one band',cost:'4 Cr (WT2)'},
{id:'smart-sight',name:'Smart Sight',hardpoints:1,effect:'+1 attacks at Close and Far',cost:'4 Cr (WT2)'},
{id:'bayonet',name:'Bayonet',hardpoints:1,effect:'Melee attack for 1d6 damage',cost:'1 Cr (WT1)'},
{id:'custom-grip',name:'Custom Grip',hardpoints:1,effect:'+1 attacks at Close',cost:'1 Cr (WT1)'},
{id:'mono-molecular-edge',name:'Mono-Molecular Edge',hardpoints:1,effect:'Armor Piercing (2) on melee',cost:'9 Cr (WT3)'},
{id:'shock-emitter',name:'Shock Emitter',hardpoints:1,effect:'Stun on hit (melee)',cost:'4 Cr (WT2)'},
{id:'toxin-reservoir',name:'Toxin Reservoir',hardpoints:1,effect:'Poison delivery (melee or needle)',cost:'4 Cr (WT2)'},
{id:'beam-splitter',name:'Beam Splitter',hardpoints:2,effect:'Energy weapons can target multiple foes',cost:'9 Cr (WT3)'},
{id:'heat-sink-upgrade',name:'Heat Sink Upgrade',hardpoints:1,effect:'Removes Overheating',cost:'4 Cr (WT2)'},
{id:'variable-yield',name:'Variable Yield',hardpoints:2,effect:'Adjustable damage (configurable)',cost:'9 Cr (WT3)'}
];
const armorMods=[
{id:'reinforced-plating',name:'Reinforced Plating',hardpoints:1,effect:'+1 Minor and Major thresholds',cost:'4 Cr (WT2)',thresholdBonus:1},
{id:'stealth-coating',name:'Stealth Coating',hardpoints:1,effect:'Adds Stealth-Coated',cost:'4 Cr (WT2)'},
{id:'power-cell',name:'Power Cell',hardpoints:1,effect:'Adds Powered; requires recharge',cost:'4 Cr (WT2)'},
{id:'veil-lining',name:'Veil Lining',hardpoints:1,effect:'Adds Veil-Hardened',cost:'9 Cr (WT3)'},
{id:'servo-assist',name:'Servo-Assist',hardpoints:2,effect:'Removes Heavy / Very Heavy penalties',cost:'9 Cr (WT3)'},
{id:'vacuum-seal-enhancement',name:'Vacuum Seal Enhancement',hardpoints:1,effect:'Doubles Life Support duration',cost:'4 Cr (WT2)'},
{id:'radiation-hardening',name:'Radiation Hardening',hardpoints:1,effect:'Immunity to radiation hazards',cost:'4 Cr (WT2)'},
{id:'sensor-integration',name:'Sensor Integration',hardpoints:1,effect:'Motion, thermal and EM sensors',cost:'4 Cr (WT2)'},
{id:'tool-integration',name:'Tool Integration',hardpoints:1,effect:'Built-in Basic Toolkit',cost:'4 Cr (WT2)'},
{id:'medical-compartments',name:'Medical Compartments',hardpoints:1,effect:'+1 Medicine; field medkit',cost:'4 Cr (WT2)'},
{id:'fortified-construction',name:'Fortified Construction',hardpoints:2,effect:'Adds Fortified',cost:'9 Cr (WT3)'}
];
const byId=new Map([...weaponMods,...armorMods].map(x=>[x.id,x]));
const slug=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function resolve(value,type){
 const list=type==='armor'?armorMods:weaponMods;
 if(value&&typeof value==='object'){const found=byId.get(value.id)||list.find(x=>slug(x.name)===slug(value.name));return found?{...found,...value}:{...value,id:value.id||slug(value.name)};}
 return byId.get(String(value))||list.find(x=>slug(x.name)===slug(value))||null;
}
function normalize(value,type){
 let raw=value;
 if(typeof raw==='string'){try{raw=JSON.parse(raw);}catch(_){raw=raw.split(/[|\n,]+/).map(x=>x.trim()).filter(Boolean);}}
 if(!Array.isArray(raw))return [];
 const map=new Map();raw.forEach(v=>{const item=resolve(v,type);if(item)map.set(item.id,item);});return [...map.values()];
}
function tierHardpoints(value){if(value&&typeof value==='object')value=value.code||value.name||value.raw||value.label||value.tier||'';const s=String(value||'').toLowerCase();const n=Number((s.match(/(?:tier|t)\s*(\d+)/i)||[])[1]);if(n)return Math.max(1,Math.min(3,n));if(/experimental/.test(s))return 3;if(/military/.test(s))return 2;return 1;}
function used(items,type){return normalize(items,type).reduce((n,x)=>n+Number(x.hardpoints||1),0);}
function damageBonus(items){return normalize(items,'weapon').reduce((n,x)=>n+Number(x.damageBonus||0),0);}
function thresholdBonus(items){return normalize(items,'armor').reduce((n,x)=>n+Number(x.thresholdBonus||0),0);}
function addDamageBonus(damage,bonus){const b=Number(bonus||0);if(!b)return String(damage||'');const s=String(damage||'').trim();const m=s.match(/^(.*?)(\s+(?:phys\.?|energy|void|impact|kinetic|fire|cold|electric|toxic).*)$/i);const head=m?m[1]:s,tail=m?m[2]:'';const dm=head.match(/^(.*?)([+-]\d+)$/);if(dm){const n=Number(dm[2])+b;return `${dm[1]}${n>=0?'+':''}${n}${tail}`;}return `${head}+${b}${tail}`;}
function printLines(baseName,items,type){return normalize(items,type).map(x=>`[${baseName||'Equipment'}] ${x.name} — ${x.effect}`);}
root.VFEquipmentMods=Object.freeze({weaponMods,armorMods,resolve,normalize,tierHardpoints,used,damageBonus,thresholdBonus,addDamageBonus,printLines});
})(typeof window!=='undefined'?window:this);

/* Charsheet integration: custom, button-based mod inventory/install controls. */
(function(){
 if(typeof document==='undefined')return;
 const api=window.VFEquipmentMods;
 const readField=(key)=>{const el=document.querySelector(`[data-f="${key}"]`);if(el)return el.value||'';try{return JSON.parse(localStorage.getItem('veilfarers_sheet_fields_v2_40')||'{}')[key]||'';}catch(_){return '';}};
 const writeField=(key,value)=>{const els=[...document.querySelectorAll(`[data-f="${key}"]`)];if(!els.length)return;els.forEach(el=>{el.value=typeof value==='string'?value:JSON.stringify(value);el.dispatchEvent(new Event('input',{bubbles:true}));});};
 const installedAnywhere=(id,type)=>['wpri_mods','wsec_mods','armor_mods'].some(key=>api.normalize(readField(key),key==='armor_mods'?'armor':'weapon').some(x=>x.id===id))&&type;
 function render(root){
  const type=root.dataset.modType||'weapon',target=root.dataset.modTarget,installedKey=`${target}_mods`,inventoryKey=`mod_inventory_${type}`;
  const catalog=type==='armor'?api.armorMods:api.weaponMods,installed=api.normalize(readField(installedKey),type),inventory=api.normalize(readField(inventoryKey),type);
  const tier=readField(`${target}_tier`)||readField(target==='armor'?'armor_tier':`${target}_tier`),cap=api.tierHardpoints(tier),used=api.used(installed,type);
  const expanded=root.dataset.open==='1';
  root.innerHTML=`<div class="vf-mod-head"><div><b>Mods</b><span>${used}/${cap} Hardpoints</span></div><button type="button" data-mod-toggle>${expanded?'Close':'Manage'}</button></div>${installed.length?`<div class="vf-mod-installed">${installed.map(x=>`<span title="${x.effect}">${x.name}</span>`).join('')}</div>`:'<div class="vf-mod-empty">No installed mods.</div>'}${expanded?`<div class="vf-mod-panel"><div class="vf-mod-note">Hardpoints equal equipment Tier: Common 1 · Military 2 · Experimental 3.</div>${catalog.map(mod=>{const own=inventory.some(x=>x.id===mod.id),on=installed.some(x=>x.id===mod.id),fits=used+mod.hardpoints<=cap;return `<div class="vf-mod-row"><div><b>${mod.name}</b><small>${mod.hardpoints} HP · ${mod.effect} · ${mod.cost}</small></div><div>${!own?`<button type="button" data-mod-add="${mod.id}">Add</button>`:on?`<button type="button" data-mod-uninstall="${mod.id}">Uninstall</button>`:`<button type="button" data-mod-install="${mod.id}" ${fits?'':'disabled'}>${fits?'Install':'No HP'}</button><button type="button" data-mod-remove="${mod.id}">Remove</button>`}</div></div>`;}).join('')}</div>`:''}`;
  root.querySelector('[data-mod-toggle]')?.addEventListener('click',()=>{root.dataset.open=expanded?'0':'1';render(root);});
  root.querySelectorAll('[data-mod-add]').forEach(b=>b.addEventListener('click',()=>{const mod=api.resolve(b.dataset.modAdd,type);writeField(inventoryKey,inventory.concat(mod).map(x=>x.id));renderAll();}));
  root.querySelectorAll('[data-mod-install]').forEach(b=>b.addEventListener('click',()=>{const mod=api.resolve(b.dataset.modInstall,type);if(!mod||used+mod.hardpoints>cap)return;writeField(installedKey,installed.concat(mod).map(x=>x.id));renderAll();}));
  root.querySelectorAll('[data-mod-uninstall]').forEach(b=>b.addEventListener('click',()=>{writeField(installedKey,installed.filter(x=>x.id!==b.dataset.modUninstall).map(x=>x.id));renderAll();}));
  root.querySelectorAll('[data-mod-remove]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.modRemove;if(installedAnywhere(id,type))return;writeField(inventoryKey,inventory.filter(x=>x.id!==id).map(x=>x.id));renderAll();}));
 }
 function renderAll(){document.querySelectorAll('[data-vf-mod-manager]').forEach(render);window.dispatchEvent(new CustomEvent('veilfarers:mods-updated'));}
 function boot(){if(!document.querySelector('[data-vf-mod-manager]'))return; if(!document.getElementById('vf-mod-style')){const st=document.createElement('style');st.id='vf-mod-style';st.textContent=`[data-vf-mod-manager]{margin-top:5px;border-top:1px solid rgba(125,211,252,.18);padding-top:5px}.vf-mod-head{display:flex;justify-content:space-between;align-items:center;gap:6px}.vf-mod-head>div{display:flex;align-items:center;gap:6px}.vf-mod-head b{font-size:9px;text-transform:uppercase;color:#7dd3fc}.vf-mod-head span,.vf-mod-note,.vf-mod-empty{font-size:8px;color:#64748b}.vf-mod-head button,.vf-mod-row button{border:1px solid #155e75;background:#082f49;color:#a5f3fc;border-radius:5px;padding:3px 6px;font-size:8px;font-weight:800;text-transform:uppercase}.vf-mod-row button[disabled]{opacity:.35}.vf-mod-installed{display:flex;gap:3px;flex-wrap:wrap;margin-top:4px}.vf-mod-installed span{font-size:8px;border:1px solid #334155;border-radius:999px;padding:2px 5px;color:#cbd5e1}.vf-mod-panel{margin-top:5px;max-height:220px;overflow:auto;border:1px solid #1e293b;border-radius:6px;background:#020617;padding:5px}.vf-mod-row{display:flex;justify-content:space-between;gap:7px;padding:5px 2px;border-bottom:1px solid #172033}.vf-mod-row:last-child{border-bottom:0}.vf-mod-row b{display:block;font-size:9px;color:#f8fafc}.vf-mod-row small{display:block;font-size:8px;color:#94a3b8;line-height:1.25}.vf-mod-row>div:last-child{display:flex;align-items:center;gap:3px;flex-shrink:0}`;document.head.appendChild(st);}renderAll();document.addEventListener('input',e=>{if(e.target&&e.target.matches('[data-f$="_tier"],[data-f$="_mods"],[data-f^="mod_inventory_"]'))setTimeout(renderAll,0);});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
 new MutationObserver(()=>{if(document.querySelector('[data-vf-mod-manager]:not([data-vf-ready])')){document.querySelectorAll('[data-vf-mod-manager]').forEach(x=>x.dataset.vfReady='1');boot();}}).observe(document.documentElement,{childList:true,subtree:true});
})();
