(function(){
'use strict';
const PLAYER_KEY='veilfarers-player-tool-characters';
function applyToPlayer(record){
 const payload=record?.characterData?.sheetPayload;if(!payload?.fields||!window.veilfarersImportSheet)return;
 try{const mapped=window.veilfarersImportSheet(payload,window.VF_CANON||window.VeilFarersCanonical);if(!mapped)return;mapped.characterId=record.characterId;const list=JSON.parse(localStorage.getItem(PLAYER_KEY)||'[]');const i=list.findIndex(x=>x&&x.entityType!=='drone'&&x.characterId===record.characterId);if(i>=0)list[i]={...list[i],...mapped,id:list[i].id};else list.push({...mapped,id:mapped.id||('char-'+Date.now())});localStorage.setItem(PLAYER_KEY,JSON.stringify(list));window.dispatchEvent(new CustomEvent('veilfarers:player-record-updated',{detail:{characterId:record.characterId}}))}catch(e){console.warn(e)}
}
function applyToSheet(record){const p=record?.characterData?.sheetPayload;if(!p?.fields)return;try{localStorage.setItem('veilfarers_sheet_fields_v2_40',JSON.stringify(p.fields));localStorage.setItem('veilfarers_sheet_tracks_v2_40',JSON.stringify(p.tracks||{}));localStorage.setItem('veilfarers.sheet.latestPayload.v1',JSON.stringify(p))}catch(_){}}
const start=()=>{const r=window.VeilFarersCharacterRegistry;if(!r)return;r.subscribe(({record,source})=>{if(!record)return;applyToSheet(record);applyToPlayer(record);const path=location.pathname;if((path.endsWith('/player-tool.html')&&!String(source||'').startsWith('player-tool'))||(path.endsWith('/keeper-tool.html')&&!String(source||'').startsWith('keeper-tool'))){clearTimeout(window.__vfRegistryReload);window.__vfRegistryReload=setTimeout(()=>location.reload(),350)}});const current=r.get();if(current){applyToSheet(current);applyToPlayer(current)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
