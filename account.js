(function(){
  'use strict';

  const ID=window.netlifyIdentity;
  const REGISTRY=window.VeilFarersCharacterRegistry;
  const CREATOR_KEY='veilfarers-character';
  let activeUser=null;
  let showTrash=false;
  let pendingTrashId='';
  let pendingRestoreId='';
  let vaultBusy=false;

  const el=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const accountStatus=el('account-status');
  const list=el('vault-list');
  const signedOut=el('signed-out-actions');
  const signedIn=el('signed-in-actions');

  function setStatus(text,type=''){
    accountStatus.textContent=text;
    accountStatus.className='vf-status'+(type?` ${type}`:'');
  }
  function summary(record){return REGISTRY?.summary(record)||{characterId:record?.characterId||'',name:'Unnamed Veilfarer',level:1,path:'',className:'',subclass:'',status:record?.status||'active',cloudState:record?.cloudState||'local',updatedAt:record?.updatedAt||''};}
  function allRecords(){return REGISTRY?(REGISTRY.listForCurrentUser?REGISTRY.listForCurrentUser({includeDeleted:true,includeUnowned:true,completedOnly:true}):REGISTRY.list({includeDeleted:true})):[];}
  function visibleRecords(){return allRecords().filter(record=>showTrash?record.status==='trashed':record.status!=='trashed');}
  function dateText(value){try{return value?new Date(value).toLocaleString():'—';}catch(_){return '—';}}

  async function makeCurrent(record,source){
    if(!record)return;
    const creator=record.characterData?.creatorState;
    if(creator)localStorage.setItem(CREATOR_KEY,JSON.stringify({...creator,characterId:record.characterId}));
    REGISTRY?.replaceLocalRecord(record,{select:true,source:source||'account-vault-open'});
    if(REGISTRY?.setActive)await REGISTRY.setActive(record.characterId,{strict:false});
  }
  async function openRecord(record,destination){await makeCurrent(record,`account-open-${destination}`);location.href=destination;}
  function exportRecord(record){
    const item=summary(record);
    const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download=`${(item.name||'veilfarers-character').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${item.characterId||'vault'}.json`;
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }

  function renderVault(){
    const records=visibleRecords();
    el('vault-mode').textContent=showTrash?'Trash':'Characters · one active';
    el('toggle-trash').textContent=showTrash?'Show characters':'Open Trash';
    if(!records.length){
      list.innerHTML=`<div class="vf-empty">${showTrash?'Trash is empty.':'No completed characters are available in this Vault yet.'}</div>`;
      return;
    }
    list.innerHTML=records.map(record=>{
      const item=summary(record);const trashConfirm=pendingTrashId===item.characterId;const restoreConfirm=pendingRestoreId===item.characterId;const isActive=REGISTRY?.currentId?.()===item.characterId;
      const meta=[item.path,item.className,item.subclass].filter(Boolean).join(' · ')||'Incomplete build';
      const state=item.cloudState==='deferred'?'Cloud pending':item.cloudState==='synced'?'Cloud synced':'Local';
      return `<article class="vf-character-row" data-id="${esc(item.characterId)}">
        <div><div class="vf-eyebrow">${esc(item.characterId)} ${isActive?'<span class="vf-active-character">ACTIVE</span>':''}</div><h3>${esc(item.name)}</h3><p>${esc(meta)} · Level ${Number(item.level||1)}</p><p class="vf-muted">${esc(state)} · Updated ${esc(dateText(item.updatedAt))}</p></div>
        <div class="vf-actions">
          ${showTrash?`${restoreConfirm?'<span class="vf-status bad">Restore this character?</span>':''}<button class="vf-button ${restoreConfirm?'primary':''}" data-action="restore">${restoreConfirm?'Confirm restore':'Restore'}</button>${restoreConfirm?'<button class="vf-button" data-action="cancel">Cancel</button>':''}`:
          `${isActive?'<button class="vf-button active-character" disabled>Active</button>':'<button class="vf-button" data-action="activate">Set Active</button>'}<button class="vf-button primary" data-action="sheet">Charsheet</button><button class="vf-button" data-action="player">Player Tool</button><button class="vf-button" data-action="level">Level Up</button><button class="vf-button" data-action="export">Export</button>${trashConfirm?'<span class="vf-status bad">Move this character to Trash?</span>':''}<button class="vf-button ${trashConfirm?'danger':''}" data-action="trash">${trashConfirm?'Confirm Trash':'Trash'}</button>${trashConfirm?'<button class="vf-button" data-action="cancel">Cancel</button>':''}`}
        </div>
      </article>`;
    }).join('');
  }

  async function refreshVault(){
    if(!REGISTRY||vaultBusy)return;
    vaultBusy=true;el('refresh-vault').disabled=true;setStatus(activeUser?'Refreshing your Character Vault…':'Loading local character records…');
    try{
      if(activeUser&&window.VF_IS_LOCAL_TEST!==true)await REGISTRY.refreshVault({force:true});
      renderVault();setStatus(activeUser?'Character Vault synchronized.':'Local character records loaded.','ok');
    }catch(error){
      renderVault();setStatus(`Cloud Vault unavailable: ${error.message||error}. Local saved records remain available.`,'bad');
    }finally{vaultBusy=false;el('refresh-vault').disabled=false;}
  }

  async function syncCurrent(){
    const record=REGISTRY?.get();
    if(!record){setStatus('No current completed character is selected.','bad');return;}
    setStatus(`Synchronizing ${summary(record).name}…`);
    const result=await REGISTRY.sync(record,{source:'account-manual-sync'});
    renderVault();
    setStatus(result?.cloudState==='deferred'?`Saved locally; cloud sync is pending: ${result.syncError||'connection unavailable'}`:'Current character synchronized. ',result?.cloudState==='deferred'?'bad':'ok');
  }

  function renderUser(user){
    activeUser=user||null;const logged=!!activeUser;
    signedOut.classList.toggle('vf-hidden',logged);signedIn.classList.toggle('vf-hidden',!logged);
    if(logged){
      el('account-email').textContent=activeUser.email||activeUser.id;
      const roles=activeUser.app_metadata?.roles||activeUser.appMetadata?.roles||[];
      el('account-role').textContent=roles.length?roles.join(', '):'member pending refresh';
      setStatus('Signed in. Loading the Firebase-backed Character Vault…');refreshVault();
    }else{
      el('account-email').textContent='Guest';el('account-role').textContent='—';
      setStatus('Sign in to synchronize your Character Vault. Local and exported backups remain available.');renderVault();
    }
  }

  list.addEventListener('click',async event=>{
    const row=event.target.closest('[data-id]'),button=event.target.closest('[data-action]');if(!row||!button)return;
    const record=REGISTRY?.get(row.dataset.id);if(!record)return;
    const action=button.dataset.action;
    if(action==='cancel'){pendingTrashId='';pendingRestoreId='';renderVault();return;}
    if(action==='activate'){await makeCurrent(record,'account-set-active');renderVault();setStatus(`${summary(record).name} is now the active character.`,'ok');}
    if(action==='sheet')await openRecord(record,'/charsheet.html');
    if(action==='player')await openRecord(record,'/player-tool.html');
    if(action==='level')await openRecord(record,'/creator.html#level-up');
    if(action==='export')exportRecord(record);
    if(action==='trash'){
      if(pendingTrashId!==record.characterId){pendingTrashId=record.characterId;pendingRestoreId='';renderVault();return;}
      pendingTrashId='';REGISTRY.trash(record.characterId,{source:'account-vault-trash'}).then(()=>{renderVault();setStatus('Character moved to Trash.','ok');}).catch(error=>setStatus(error.message||String(error),'bad'));
    }
    if(action==='restore'){
      if(pendingRestoreId!==record.characterId){pendingRestoreId=record.characterId;pendingTrashId='';renderVault();return;}
      pendingRestoreId='';REGISTRY.restore(record.characterId,{source:'account-vault-restore'}).then(()=>{renderVault();setStatus('Character restored.','ok');}).catch(error=>setStatus(error.message||String(error),'bad'));
    }
  });

  el('toggle-trash').addEventListener('click',()=>{showTrash=!showTrash;pendingTrashId='';pendingRestoreId='';renderVault();});
  el('refresh-vault').addEventListener('click',refreshVault);
  el('sync-current').addEventListener('click',()=>syncCurrent().catch(error=>setStatus(error.message||String(error),'bad')));
  el('new-character').addEventListener('click',()=>location.href='/creator.html');
  el('import-character').addEventListener('click',()=>{const input=el('vault-import-input');if(input){input.value='';input.click();}});
  el('vault-import-input').addEventListener('change',event=>{
    const file=event.target.files&&event.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{try{const raw=JSON.parse(reader.result);localStorage.setItem('veilfarers.character.pendingImport.v1',JSON.stringify(raw));location.href='/creator.html?import=vault';}catch(error){setStatus(`Import failed: ${error.message||error}`,'bad');}};
    reader.onerror=()=>setStatus('Import failed: the JSON file could not be read.','bad');
    reader.readAsText(file);
  });
  el('login-button').addEventListener('click',()=>ID?.open('login'));
  el('signup-button').addEventListener('click',()=>ID?.open('signup'));
  el('logout-button').addEventListener('click',()=>ID?.logout());

  window.addEventListener('veilfarers:active-character-changed',renderVault);
  renderVault();
  if(window.VF_IS_LOCAL_TEST===true){
    signedOut.classList.add('vf-hidden');signedIn.classList.remove('vf-hidden');
    el('logout-button').classList.add('vf-hidden');el('account-email').textContent='Local test';el('account-role').textContent='offline';
    setStatus('Local test mode. The same Character Vault UI uses local records; cloud synchronization requires the deployed authenticated site.');
    return;
  }
  if(!ID){setStatus('Netlify Identity did not load. Open this page from the deployed Netlify site.','bad');return;}
  ID.on('init',renderUser);ID.on('login',user=>{renderUser(user);ID.close();});ID.on('logout',()=>renderUser(null));ID.on('error',error=>setStatus(`Netlify Identity: ${error.message||error}`,'bad'));ID.init();
})();
