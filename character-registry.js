(function(){
  'use strict';

  const REGISTRY_KEY='veilfarers.characters.registry.v1';
  const CURRENT_KEY='veilfarers.character.currentId.v1';
  const CHANNEL='veilfarers-character-sync-v1';
  const SCHEMA='veilfarers.character/2';
  const MAX_VAULT_RECORDS=200;

  let bc=null;
  let dbPromise=null;
  let vaultPromise=null;
  const listeners=new Set();
  try{ bc=new BroadcastChannel(CHANNEL); }catch(_){ }

  const parse=(value,fallback)=>{ try{return JSON.parse(value);}catch(_){return fallback;} };
  const now=()=>new Date().toISOString();
  const normalizeId=id=>String(id||'').trim().toUpperCase();
  const isFinal=id=>/^VF-\d{6,}$/.test(normalizeId(id));
  const pendingId=()=>`PENDING-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const read=()=>parse(localStorage.getItem(REGISTRY_KEY),{})||{};
  const write=registry=>localStorage.setItem(REGISTRY_KEY,JSON.stringify(registry));
  const cleanText=value=>String(value||'').replace(/[&<>]/g,'').trim();
  const timestampToIso=value=>{
    if(!value)return null;
    if(typeof value==='string')return value;
    if(typeof value.toDate==='function'){ try{return value.toDate().toISOString();}catch(_){ } }
    if(typeof value.seconds==='number')return new Date(value.seconds*1000).toISOString();
    if(value instanceof Date)return value.toISOString();
    return null;
  };

  function currentId(){ return normalizeId(localStorage.getItem(CURRENT_KEY)); }
  function setCurrentId(id){
    id=normalizeId(id);
    if(id)localStorage.setItem(CURRENT_KEY,id); else localStorage.removeItem(CURRENT_KEY);
    renderBadge(id);
  }

  function list(options={}){
    const includeDeleted=!!options.includeDeleted;
    return Object.values(read())
      .filter(record=>includeDeleted||record.status!=='trashed')
      .sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  }
  function currentOwnerId(){
    try{if(typeof firebase!=='undefined'&&firebase.auth&&firebase.auth().currentUser?.uid)return firebase.auth().currentUser.uid;}catch(_){ }
    try{const user=window.netlifyIdentity?.currentUser?.();if(user?.id)return user.id;}catch(_){ }
    return null;
  }
  function listForCurrentUser(options={}){
    const ownerId=options.ownerId||currentOwnerId();
    const includeUnowned=options.includeUnowned!==false;
    let records=list(options);
    if(options.completedOnly)records=records.filter(record=>!!record.completedAt||!!record.characterData?.sheetPayload?.fields);
    if(!ownerId)return records;
    return records.filter(record=>record.ownerId===ownerId||(includeUnowned&&!record.ownerId));
  }
  function get(id=currentId()){ return read()[normalizeId(id)]||null; }

  function emit(record,source='local',extra={}){
    const detail={record,source,...extra};
    listeners.forEach(fn=>{try{fn(detail);}catch(_){ }});
    window.dispatchEvent(new CustomEvent('veilfarers:character-updated',{detail}));
    try{bc&&bc.postMessage({type:'character-updated',detail});}catch(_){ }
  }
  function emitVault(records,source='vault'){
    const detail={records,source};
    window.dispatchEvent(new CustomEvent('veilfarers:vault-refreshed',{detail}));
    try{bc&&bc.postMessage({type:'vault-refreshed',detail});}catch(_){ }
  }
  function subscribe(fn){ listeners.add(fn); return()=>listeners.delete(fn); }

  function normalizeRemoteRecord(id,data={}){
    id=normalizeId(id||data.characterId);
    return {
      ...data,
      schema:data.schema||SCHEMA,
      characterId:id,
      status:data.status==='trashed'?'trashed':'active',
      createdAt:timestampToIso(data.createdAt)||data.createdAt||now(),
      updatedAt:timestampToIso(data.updatedAt)||data.updatedAt||now(),
      completedAt:timestampToIso(data.completedAt)||data.completedAt||null,
      deletedAt:timestampToIso(data.deletedAt)||data.deletedAt||null,
      characterData:data.characterData&&typeof data.characterData==='object'?data.characterData:{},
      cloudState:'synced',
      syncError:null
    };
  }

  function saveLocalData(characterId,characterData={},opts={}){
    characterId=normalizeId(characterId)||pendingId();
    const registry=read();
    const previous=registry[characterId]||{};
    const status=opts.status||previous.status||'active';
    const record={
      schema:SCHEMA,
      characterId,
      ownerId:opts.ownerId||previous.ownerId||null,
      ownerEmail:opts.ownerEmail||previous.ownerEmail||null,
      status,
      createdAt:previous.createdAt||opts.createdAt||now(),
      updatedAt:opts.updatedAt||now(),
      completedAt:opts.completedAt||previous.completedAt||null,
      deletedAt:status==='trashed'?(opts.deletedAt||previous.deletedAt||now()):null,
      source:opts.source||previous.source||'unknown',
      cloudState:opts.cloudState||previous.cloudState||'local',
      syncError:opts.syncError===undefined?(previous.syncError||null):opts.syncError,
      characterData:{...(previous.characterData||{}),...(characterData||{})}
    };
    registry[characterId]=record;
    write(registry);
    if(status!=='trashed'&&opts.select!==false)setCurrentId(characterId);
    renderBadge(currentId());
    if(opts.emit!==false)emit(record,opts.source||'local');
    return record;
  }

  function replaceLocalRecord(record,opts={}){
    if(!record||!record.characterId)return null;
    const registry=read();
    registry[normalizeId(record.characterId)]={...record,characterId:normalizeId(record.characterId)};
    write(registry);
    if(opts.select)setCurrentId(record.characterId);
    if(opts.emit!==false)emit(registry[normalizeId(record.characterId)],opts.source||'local-replace');
    return registry[normalizeId(record.characterId)];
  }

  function removeLocal(id){
    id=normalizeId(id);
    const registry=read();
    const existed=!!registry[id];
    delete registry[id];
    write(registry);
    if(currentId()===id)setCurrentId('');
    if(existed)emit(null,'local-remove',{characterId:id});
    return existed;
  }

  async function loadScript(src){
    if([...document.scripts].some(script=>script.src===src))return;
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});
  }

  async function identityAuthHeaders(extra={}){
    const headers={...extra};
    try{
      const identity=window.netlifyIdentity;
      const current=identity&&typeof identity.currentUser==='function'?identity.currentUser():null;
      if(!current)return headers;
      let token='';
      try{if(typeof current.jwt==='function')token=await current.jwt();}catch(_){ }
      if(!token&&current.token&&current.token.access_token)token=current.token.access_token;
      if(token)headers.authorization=`Bearer ${token}`;
    }catch(_){ }
    return headers;
  }

  async function waitForIdentityUser(timeoutMs=5000){
    const identity=window.netlifyIdentity;
    if(!identity)throw Error('Netlify Identity is unavailable');
    const current=()=>{try{return identity.currentUser&&identity.currentUser();}catch(_){return null;}};
    const immediate=current();if(immediate)return immediate;
    return new Promise((resolve,reject)=>{
      let done=false,timer=null;const finish=(value,error)=>{if(done)return;done=true;if(timer)clearTimeout(timer);try{identity.off&&identity.off('login',onLogin);identity.off&&identity.off('init',onInit);}catch(_){ }error?reject(error):resolve(value)};
      const onLogin=user=>finish(user);const onInit=user=>user&&finish(user);
      try{identity.on('login',onLogin);identity.on('init',onInit);identity.init&&identity.init();}catch(_){ }
      timer=setTimeout(()=>{const user=current();user?finish(user):finish(null,Error('Sign in required for Character Vault cloud sync'));},timeoutMs);
    });
  }

  async function vaultApi(action,payload={}){
    await waitForIdentityUser();
    const response=await fetch('/api/character-vault',{method:'POST',credentials:'same-origin',cache:'no-store',headers:await identityAuthHeaders({'content-type':'application/json'}),body:JSON.stringify({action,...payload})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||`Character Vault request failed (${response.status})`);
    return data;
  }

  async function firestore(){
    if(dbPromise)return dbPromise;
    dbPromise=(async()=>{
      await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
      const config=await fetch('/api/firebase-config',{cache:'no-store'}).then(response=>{
        if(!response.ok)throw Error('Firebase config unavailable');
        return response.json();
      });
      if(!firebase.apps.length)firebase.initializeApp(config);
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const identityUser=window.netlifyIdentity&&typeof window.netlifyIdentity.currentUser==='function'?window.netlifyIdentity.currentUser():null;
      if(!identityUser)throw Error('Sign in required for Character Vault cloud sync');
      const response=await fetch('/api/firebase-auth-token',{credentials:'same-origin',cache:'no-store',headers:await identityAuthHeaders()});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(data.error||'Sign in required for Character Vault cloud sync');
      if(!firebase.auth().currentUser||firebase.auth().currentUser.uid!==data.user.id){
        await firebase.auth().signInWithCustomToken(data.customToken);
      }
      return firebase.firestore();
    })().catch(error=>{dbPromise=null;throw error;});
    return dbPromise;
  }

  async function allocate(){
    const response=await fetch('/api/allocate-character-id',{method:'POST',credentials:'same-origin',cache:'no-store',headers:await identityAuthHeaders({'content-type':'application/json'}),body:'{}'});
    if(response.ok){
      const data=await response.json();
      if(isFinal(data.characterId))return normalizeId(data.characterId);
    }
    let message='Central ID allocation unavailable';
    try{const data=await response.json();if(data&&data.error)message=data.error;}catch(_){ }
    throw Error(message);
  }

  async function ensureId(characterData={},opts={}){
    let id=normalizeId(
      characterData.characterId||
      characterData.creatorState?.characterId||
      characterData.sheetPayload?.characterId||
      characterData.sheetPayload?.fields?.character_id||
      currentId()
    );
    if(!id)id=pendingId();
    let record=saveLocalData(id,{...characterData},opts);
    if(!isFinal(id)){
      try{
        const previousCharacterId=id;
        const finalId=await allocate();
        const registry=read();
        delete registry[previousCharacterId];
        write(registry);
        id=finalId;
        const data={...(record.characterData||{})};
        if(data.creatorState)data.creatorState={...data.creatorState,characterId:id};
        if(data.sheetPayload)data.sheetPayload={...data.sheetPayload,characterId:id,fields:{...(data.sheetPayload.fields||{}),character_id:id}};
        record=saveLocalData(id,data,{...opts,source:opts.source||'id-allocation',emit:false});
        emit(record,opts.source||'id-allocation',{previousCharacterId});
      }catch(error){
        console.warn('Character ID allocation deferred:',error.message);
        record=saveLocalData(id,record.characterData,{...opts,select:true,emit:false,cloudState:'deferred',syncError:error.message});
      }
    }
    return record;
  }

  async function sync(recordOrId,opts={}){
    let record=typeof recordOrId==='string'?get(recordOrId):recordOrId;
    if(!record)return null;
    if(!isFinal(record.characterId))record=await ensureId(record.characterData,opts);
    if(!isFinal(record.characterId))return record;
    try{
      const result=await vaultApi('upsert',{record});
      const saved=normalizeRemoteRecord(record.characterId,result.record||record);
      replaceLocalRecord(saved,{emit:false});
      emit(saved,opts.source||'cloud-sync',{cloudSynced:true});
      return saved;
    }catch(error){
      const failed={...record,cloudState:'deferred',syncError:error.message||String(error),updatedAt:now()};
      replaceLocalRecord(failed,{emit:false});
      console.warn('Character cloud sync deferred:',failed.syncError);
      window.dispatchEvent(new CustomEvent('veilfarers:character-sync-error',{detail:{record:failed,error}}));
      return failed;
    }
  }

  function mergeRemoteRecords(records){
    const registry=read();
    records.forEach(record=>{
      const id=normalizeId(record.characterId);
      const local=registry[id];
      if(!local){registry[id]=record;return;}
      const localTime=Date.parse(local.updatedAt||0)||0;
      const remoteTime=Date.parse(record.updatedAt||0)||0;
      registry[id]=remoteTime>=localTime?{...local,...record,characterData:{...(local.characterData||{}),...(record.characterData||{})}}:local;
    });
    write(registry);
    return list();
  }

  async function refreshVault(options={}){
    if(vaultPromise&&!options.force)return vaultPromise;
    vaultPromise=(async()=>{
      const result=await vaultApi('list');
      const remote=(result.records||[]).map(item=>normalizeRemoteRecord(item.characterId,item));
      mergeRemoteRecords(remote);
      const records=listForCurrentUser({includeUnowned:true,completedOnly:true});
      emitVault(records,'cloud');
      return records;
    })().catch(error=>{
      window.dispatchEvent(new CustomEvent('veilfarers:vault-error',{detail:{error}}));
      throw error;
    }).finally(()=>{vaultPromise=null;});
    return vaultPromise;
  }

  const listRemote=refreshVault;

  async function fetchRemote(id=currentId()){
    id=normalizeId(id);
    if(!isFinal(id))return get(id);
    try{
      const result=await vaultApi('get',{characterId:id});
      if(result.record){
        const record=normalizeRemoteRecord(id,result.record);
        replaceLocalRecord(record,{source:'cloud-load',select:true});
        return record;
      }
    }catch(error){ console.warn('Character cloud load deferred:',error.message); }
    return get(id);
  }

  async function trash(id=currentId(),opts={}){
    id=normalizeId(id);
    const record=get(id);
    if(!record)return null;
    const trashed={...record,status:'trashed',deletedAt:now(),updatedAt:now(),source:opts.source||'vault-trash'};
    replaceLocalRecord(trashed,{emit:false});
    if(currentId()===id)setCurrentId('');
    emit(trashed,opts.source||'vault-trash');
    return sync(trashed,{source:opts.source||'vault-trash'});
  }

  async function restore(id,opts={}){
    id=normalizeId(id);
    const record=get(id);
    if(!record)return null;
    const restored={...record,status:'active',deletedAt:null,updatedAt:now(),source:opts.source||'vault-restore'};
    replaceLocalRecord(restored,{emit:false});
    emit(restored,opts.source||'vault-restore');
    return sync(restored,{source:opts.source||'vault-restore'});
  }

  function summary(record){
    const creator=record?.characterData?.creatorState||{};
    const fields=record?.characterData?.sheetPayload?.fields||{};
    return {
      characterId:record?.characterId||'',
      name:creator.name||fields.name||'Unnamed Veilfarer',
      level:Number(creator.level||fields.level||1)||1,
      path:creator.path||fields.chosen_path||fields.path||'',
      className:creator.className||creator.cls||fields.class||'',
      subclass:creator.subclass||fields.subclass||'',
      updatedAt:record?.updatedAt||'',
      status:record?.status||'active',
      cloudState:record?.cloudState||'local'
    };
  }

  function renderBadge(id=currentId()){
    id=normalizeId(id);
    const record=id&&get(id);
    if(record&&record.status==='trashed')id='';
    const element=document.getElementById('vf-nav-character-id');
    const value=element&&element.querySelector('strong');
    if(!element)return;
    element.hidden=!id;
    if(value)value.textContent=cleanText(id);
    element.title=id?`Current character: ${cleanText(id)}`:'';
  }

  function injectStyle(){ /* Character ID presentation is owned by the shared portal navigation. */ }

  if(bc)bc.onmessage=event=>{
    const data=event.data;
    if(data?.type==='character-updated'){
      const record=data.detail?.record;
      if(record){
        const registry=read();registry[record.characterId]=record;write(registry);renderBadge(currentId());
        listeners.forEach(fn=>{try{fn(data.detail);}catch(_){ }});
      }
    }
    if(data?.type==='vault-refreshed')window.dispatchEvent(new CustomEvent('veilfarers:vault-refreshed',{detail:data.detail}));
  };

  const start=()=>{injectStyle();renderBadge();setTimeout(()=>fetchRemote(),250);try{window.netlifyIdentity?.on?.('login',()=>{dbPromise=null;vaultPromise=null;fetchRemote();});window.netlifyIdentity?.on?.('logout',()=>{dbPromise=null;vaultPromise=null;});}catch(_){ }};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

  window.VeilFarersCharacterRegistry=Object.freeze({
    SCHEMA,normalizeId,isFinal,currentId,setCurrentId,currentOwnerId,list,listForCurrentUser,get,summary,subscribe,
    saveLocalData,replaceLocalRecord,removeLocal,ensureId,sync,fetchRemote,
    refreshVault,listRemote,trash,restore,renderBadge
  });
})();
