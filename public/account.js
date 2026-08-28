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
  const dangerZone=el('account-danger-zone');
  const vaultControls=el('vault-controls');
  const vaultPanel=el('vault-panel');
  const protectedControlIds=['new-character','import-character','vault-import-input','refresh-vault','sync-current','toggle-trash'];

  function setStatus(text,type=''){
    accountStatus.textContent=text;
    accountStatus.className='vf-status'+(type?` ${type}`:'');
  }
  function userRoles(user){
    const values=[
      ...(Array.isArray(user?.roles)?user.roles:[]),
      ...(Array.isArray(user?.appMetadata?.roles)?user.appMetadata.roles:[]),
      ...(Array.isArray(user?.app_metadata?.roles)?user.app_metadata.roles:[])
    ];
    return new Set(values.map(role=>String(role||'').trim().toLowerCase()).filter(Boolean));
  }
  function hasFriendAccess(user=activeUser){return !!user&&userRoles(user).has('friend');}
  function requireFriendAccess(){
    if(hasFriendAccess())return true;
    setStatus(activeUser?'This account is signed in, but the friend role is required for Character Vault and creator access.':'Sign in with an account tagged as friend to access Character Vault and creator tools.','bad');
    return false;
  }
  function setFriendUi(allowed){
    [vaultControls,vaultPanel].forEach(node=>{
      if(!node)return;
      node.hidden=!allowed;
      node.classList.toggle('vf-hidden',!allowed);
      node.setAttribute('aria-hidden',String(!allowed));
    });
    protectedControlIds.forEach(id=>{const node=el(id);if(node)node.disabled=!allowed;});
    if(!allowed){
      showTrash=false;pendingTrashId='';pendingRestoreId='';
      list.innerHTML='<div class="vf-empty">Friend access is required to open the Character Vault.</div>';
    }
  }
  function summary(record){return REGISTRY?.summary(record)||{characterId:record?.characterId||'',name:'Unnamed Veilfarer',level:1,path:'',className:'',subclass:'',status:record?.status||'active',cloudState:record?.cloudState||'local',updatedAt:record?.updatedAt||''};}
  function allRecords(){return REGISTRY?(REGISTRY.listForCurrentUser?REGISTRY.listForCurrentUser({includeDeleted:true,includeUnowned:true,completedOnly:true}):REGISTRY.list({includeDeleted:true})):[];}
  function visibleRecords(){return allRecords().filter(record=>showTrash?record.status==='trashed':record.status!=='trashed');}
  function dateText(value){try{return value?new Date(value).toLocaleString():'—';}catch(_){return '—';}}

  async function makeCurrent(record,source){
    if(!requireFriendAccess()||!record)return false;
    const creator=record.characterData?.creatorState;
    if(creator)localStorage.setItem(CREATOR_KEY,JSON.stringify({...creator,characterId:record.characterId}));
    REGISTRY?.replaceLocalRecord(record,{select:true,source:source||'account-vault-open'});
    if(REGISTRY?.setActive)await REGISTRY.setActive(record.characterId,{strict:false});
    return true;
  }
  async function openRecord(record,destination){if(await makeCurrent(record,`account-open-${destination}`))location.href=destination;}
  function exportRecord(record){
    if(!requireFriendAccess())return;
    const item=summary(record);
    const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download=`${(item.name||'veilfarers-character').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${item.characterId||'vault'}.json`;
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }

  function renderVault(){
    if(!hasFriendAccess()){
      list.innerHTML='<div class="vf-empty">Friend access is required to open the Character Vault.</div>';
      return;
    }
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
    if(!requireFriendAccess()||!REGISTRY||vaultBusy)return;
    vaultBusy=true;el('refresh-vault').disabled=true;setStatus(activeUser?'Refreshing your Character Vault…':'Loading local character records…');
    try{
      if(activeUser&&window.VF_IS_LOCAL_TEST!==true)await REGISTRY.refreshVault({force:true});
      renderVault();setStatus(activeUser?'Character Vault synchronized.':'Local character records loaded.','ok');
    }catch(error){
      renderVault();setStatus(`Cloud Vault unavailable: ${error.message||error}. Local saved records remain available.`,'bad');
    }finally{vaultBusy=false;el('refresh-vault').disabled=!hasFriendAccess();}
  }

  async function syncCurrent(){
    if(!requireFriendAccess())return;
    const record=REGISTRY?.get();
    if(!record){setStatus('No current completed character is selected.','bad');return;}
    setStatus(`Synchronizing ${summary(record).name}…`);
    const result=await REGISTRY.sync(record,{source:'account-manual-sync'});
    renderVault();
    setStatus(result?.cloudState==='deferred'?`Saved locally; cloud sync is pending: ${result.syncError||'connection unavailable'}`:'Current character synchronized. ',result?.cloudState==='deferred'?'bad':'ok');
  }

  function renderUser(user){
    activeUser=user||null;const logged=!!activeUser;const friend=hasFriendAccess(activeUser);
    signedOut.classList.toggle('vf-hidden',logged);signedIn.classList.toggle('vf-hidden',!logged);
    dangerZone?.classList.toggle('vf-hidden',!logged);
    setFriendUi(friend);
    if(logged){
      el('account-email').textContent=activeUser.email||activeUser.id;
      const roles=[...userRoles(activeUser)];
      el('account-role').textContent=roles.length?roles.join(', '):'member pending refresh';
      if(friend){setStatus('Friend access confirmed. Loading the Firebase-backed Character Vault…');refreshVault();}
      else{setStatus('Signed in, but this account is not tagged as friend. Character Vault and creator tools remain locked.','bad');renderVault();}
    }else{
      el('account-email').textContent='Guest';el('account-role').textContent='—';
      setStatus('Sign in with an account tagged as friend to access Character Vault and creator tools.');renderVault();
    }
  }

  list.addEventListener('click',async event=>{
    if(!requireFriendAccess())return;
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

  el('toggle-trash').addEventListener('click',()=>{if(!requireFriendAccess())return;showTrash=!showTrash;pendingTrashId='';pendingRestoreId='';renderVault();});
  el('refresh-vault').addEventListener('click',()=>{if(requireFriendAccess())refreshVault();});
  el('sync-current').addEventListener('click',()=>{if(requireFriendAccess())syncCurrent().catch(error=>setStatus(error.message||String(error),'bad'));});
  el('new-character').addEventListener('click',()=>{if(requireFriendAccess())location.href='/creator.html';});
  el('import-character').addEventListener('click',()=>{if(!requireFriendAccess())return;const input=el('vault-import-input');if(input){input.value='';input.click();}});
  el('vault-import-input').addEventListener('change',event=>{
    if(!requireFriendAccess()){event.target.value='';return;}
    const file=event.target.files&&event.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{try{const raw=JSON.parse(reader.result);localStorage.setItem('veilfarers.character.pendingImport.v1',JSON.stringify(raw));location.href='/creator.html?import=vault';}catch(error){setStatus(`Import failed: ${error.message||error}`,'bad');}};
    reader.onerror=()=>setStatus('Import failed: the JSON file could not be read.','bad');
    reader.readAsText(file);
  });
  el('login-button').addEventListener('click',()=>ID?.open('login'));
  el('signup-button').addEventListener('click',()=>ID?.open('signup'));
  el('logout-button').addEventListener('click',()=>ID?.logout());
  el('delete-account-button')?.addEventListener('click',async()=>{
    const button=el('delete-account-button'),deleteStatus=el('delete-account-status');
    if(!activeUser){deleteStatus.textContent='Sign in before deleting your account.';return}
    button.disabled=true;deleteStatus.textContent='Deleting cloud data and account…';
    try{
      const token=await activeUser.jwt(true);
      const response=await fetch('/api/account-delete',{
        method:'POST',credentials:'same-origin',cache:'no-store',
        headers:{'content-type':'application/json',authorization:`Bearer ${token}`},
        body:JSON.stringify({confirmEmail:el('delete-account-email').value.trim(),confirmation:el('delete-account-phrase').value}),
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(data.error||'Account deletion failed.');
      [localStorage,sessionStorage].forEach(storage=>{
        for(let index=storage.length-1;index>=0;index-=1){
          const key=storage.key(index);if(key&&key.toLowerCase().startsWith('veilfarers'))storage.removeItem(key);
        }
      });
      deleteStatus.textContent='Account and cloud data deleted.';
      setTimeout(()=>location.href='/',900);
    }catch(error){deleteStatus.textContent=error.message||String(error);button.disabled=false}
  });

  window.addEventListener('veilfarers:active-character-changed',renderVault);
  setFriendUi(false);
  renderVault();
  if(window.VF_IS_LOCAL_TEST===true){
    renderUser(null);
    dangerZone?.classList.add('vf-hidden');
    setStatus('Local test mode does not bypass friend authorization. Use the deployed Identity flow to verify friend access.','bad');
    return;
  }
  if(!ID){setStatus('Netlify Identity did not load. Open this page from the deployed Netlify site.','bad');return;}
  ID.on('init',renderUser);ID.on('login',user=>{renderUser(user);ID.close();});ID.on('logout',()=>renderUser(null));ID.on('error',error=>setStatus(`Netlify Identity: ${error.message||error}`,'bad'));ID.init();
})();
