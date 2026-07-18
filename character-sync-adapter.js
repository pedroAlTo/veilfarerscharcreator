(function(){
  'use strict';

  const PLAYER_KEY='veilfarers-player-tool-characters';
  const stableDroneId=(characterId,index)=>`drone-${characterId}-${index}`;

  function parseList(){
    try{const value=JSON.parse(localStorage.getItem(PLAYER_KEY)||'[]');return Array.isArray(value)?value:[];}catch(_){return [];}
  }
  function writeList(list){localStorage.setItem(PLAYER_KEY,JSON.stringify(list));}

  function droneRecord(owner,drone,index){
    const modules=(drone.modules||[]).map(item=>typeof item==='string'?{name:item}:{...item});
    const thresholds=String(drone.thresholds||'').match(/(\d+)\s*\/\s*(\d+)/);
    return {
      id:stableDroneId(owner.characterId,index),
      characterId:`${owner.characterId}:DRONE:${index+1}`,
      entityType:'drone',
      operatorId:owner.characterId,
      name:drone.name||`Drone ${index+1}`,
      playerName:owner.playerName||'',
      droneGradeId:drone.grade||'',
      droneGrade:drone.grade||'',
      hp:{current:Number(drone.hp)||1,max:Number(drone.hp)||1},
      thresholds:{major:thresholds?Number(thresholds[1]):0,severe:thresholds?Number(thresholds[2]):0},
      evasion:Number(drone.evasion)||10,
      shields:Number(drone.armor)||0,
      armorMax:Number(drone.armor)||0,
      moduleSlots:Number(drone.slots)||modules.length,
      installedModules:modules,
      moduleInventory:modules.map(item=>item.id||item.name).filter(Boolean),
      droneContext:{temporaryEvasion:0},
      signalState:'stable',signalRange:'Close',linkMode:'Direct RF Link',
      loadedProtocol:'Return to the operator or nearest safe point.',
      playerNotes:[drone.notes,drone.access&&`Access: ${drone.access}`].filter(Boolean).join('\n'),
      savedNotes:[],inventory:Array(6).fill(''),weapons:[],weaponInventory:[],weaponArsenal:[],activeWeaponId:''
    };
  }

  function preserveTrack(existing,incoming,key){
    if(!existing||!existing[key]||!incoming||!incoming[key])return incoming&&incoming[key];
    return {...incoming[key],current:existing[key].current};
  }

  function mergeOwner(existing,mapped,record,source){
    const ownerId=existing&&existing.id?existing.id:(mapped.id||record.characterId||('char-'+Date.now()));
    const merged={...(existing||{}),...mapped,id:ownerId,characterId:record.characterId,registrySource:source||record.source||'registry'};
    const preserveRuntime=!!existing&&String(source||'').startsWith('level-up');
    if(preserveRuntime){
      ['hp','stress','hope','effort','resolve'].forEach(key=>{merged[key]=preserveTrack(existing,mapped,key);});
      if(existing.shields!=null)merged.shields=existing.shields;
      if(existing.armorMarked!=null)merged.armorMarked=existing.armorMarked;
      if(existing.conditions!=null)merged.conditions=existing.conditions;
      if(existing.savedNotes!=null)merged.savedNotes=existing.savedNotes;
      if(existing.signalState!=null)merged.signalState=existing.signalState;
    }
    return merged;
  }

  function removeTrashed(record){
    const list=parseList();
    const next=list.filter(item=>!(item&&(item.characterId===record.characterId||item.operatorId===record.characterId)));
    if(next.length!==list.length){
      writeList(next);
      window.dispatchEvent(new CustomEvent('veilfarers:player-record-updated',{detail:{characterId:record.characterId,removed:true}}));
    }
  }

  function applyToPlayer(record,source){
    if(!record)return;
    if(record.status==='trashed'){removeTrashed(record);return;}
    const payload=record?.characterData?.sheetPayload;
    if(!payload?.fields||!window.veilfarersImportSheet)return;
    try{
      const mapped=window.veilfarersImportSheet(payload,window.VF_CANON||window.VeilFarersCanonical);
      if(!mapped)return;
      mapped.characterId=record.characterId;
      const list=parseList();
      const index=list.findIndex(item=>item&&item.entityType!=='drone'&&item.characterId===record.characterId);
      const existing=index>=0?list[index]:null;
      const owner=mergeOwner(existing,mapped,record,source);
      if(index>=0)list[index]=owner;else list.push(owner);

      const incoming=(mapped.drones||[]).map((drone,droneIndex)=>droneRecord(owner,drone,droneIndex));
      const incomingIds=new Set(incoming.map(item=>item.id));
      const kept=list.filter(item=>!(item&&item.entityType==='drone'&&item.operatorId===record.characterId&&!incomingIds.has(item.id)));
      incoming.forEach(drone=>{
        const droneIndex=kept.findIndex(item=>item&&item.id===drone.id);
        if(droneIndex>=0){
          const runtime=kept[droneIndex];
          kept[droneIndex]={...runtime,...drone,id:runtime.id,signalState:runtime.signalState||drone.signalState};
          if(runtime.hp&&drone.hp)kept[droneIndex].hp={...drone.hp,current:Math.min(drone.hp.max,Number(runtime.hp.current)||0)};
          if(runtime.shields!=null)kept[droneIndex].shields=Math.min(drone.armorMax,Number(runtime.shields)||0);
        }else kept.push(drone);
      });
      writeList(kept);
      window.dispatchEvent(new CustomEvent('veilfarers:player-record-updated',{detail:{characterId:record.characterId,drones:incoming.length,source}}));
    }catch(error){console.warn('Could not apply registry record to Player Tool:',error);}
  }

  function applyToSheet(record){
    if(record?.status==='trashed')return;
    const payload=record?.characterData?.sheetPayload;
    if(!payload?.fields)return;
    try{
      localStorage.setItem('veilfarers_sheet_fields_v2_40',JSON.stringify(payload.fields));
      localStorage.setItem('veilfarers_sheet_tracks_v2_40',JSON.stringify(payload.tracks||{}));
      localStorage.setItem('veilfarers.sheet.latestPayload.v1',JSON.stringify(payload));
    }catch(_){ }
  }

  function start(){
    const registry=window.VeilFarersCharacterRegistry;
    if(!registry)return;
    registry.subscribe(({record,source})=>{
      if(!record)return;
      applyToSheet(record);
      applyToPlayer(record,source);
      const path=location.pathname;
      const playerExternal=path.endsWith('/player-tool.html')&&!String(source||'').startsWith('player-tool');
      const keeperExternal=path.endsWith('/keeper-tool.html')&&!String(source||'').startsWith('keeper-tool');
      if(playerExternal||keeperExternal){
        clearTimeout(window.__vfRegistryReload);
        window.__vfRegistryReload=setTimeout(()=>location.reload(),350);
      }
    });
    const current=registry.get();
    if(current){applyToSheet(current);applyToPlayer(current,'initial-registry');}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
