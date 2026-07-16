(function(){
  'use strict';
  const ID = window.netlifyIdentity;
  const CHARACTER_KEY = 'veilfarers-character';
  const INVENTORY_KEY = 'veilfarers.inventory.v1';
  const VAULT_KEY = 'veilfarers_characters_rc2';
  const LINK_KEY = 'veilfarers_online_character_id_rc2';
  let activeUser = null;

  const el = id => document.getElementById(id);
  const status = el('account-status');
  const list = el('vault-list');
  const localSummary = el('local-summary');
  const signedOut = el('signed-out-actions');
  const signedIn = el('signed-in-actions');
  const esc = value => String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `vf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

  function userData(user){ return Object.assign({}, user?.user_metadata || {}, user?.data || {}); }
  function vault(user){
    let value = userData(user)[VAULT_KEY] || [];
    if(typeof value === 'string'){ try{ value=JSON.parse(value); }catch(_){ value=[]; } }
    return Array.isArray(value) ? value : [];
  }
  function currentState(){ try{ return JSON.parse(localStorage.getItem(CHARACTER_KEY)||'null'); }catch(_){ return null; } }
  function currentInventory(){ try{ return JSON.parse(localStorage.getItem(INVENTORY_KEY)||'null'); }catch(_){ return null; } }
  function metadata(state){
    return { name:state?.name || 'Unnamed VeilFarer', path:state?.path || '', classId:state?.cls || '', subclass:state?.subclass || '', ancestryId:state?.ancestry || '', level:1 };
  }
  function setStatus(text,type=''){
    status.textContent=text; status.className='vf-status'+(type?` ${type}`:'');
  }
  function renderLocal(){
    const state=currentState();
    if(!state){ localSummary.innerHTML='<p>No canonical character is saved in this browser. Create one on the homepage first.</p>'; return; }
    const meta=metadata(state);
    localSummary.innerHTML=`<h3>${esc(meta.name)}</h3><p>${esc([meta.path,meta.classId,meta.subclass].filter(Boolean).join(' · ') || 'Incomplete character')}</p><p class="vf-muted">Creator draft available locally. ${Object.keys(currentInventory()?.entries||{}).length} inventory records linked.</p>`;
  }
  function renderUser(user){
    activeUser=user||null;
    const logged=!!activeUser;
    signedOut.classList.toggle('vf-hidden',logged);
    signedIn.classList.toggle('vf-hidden',!logged);
    if(logged){
      el('account-email').textContent=activeUser.email||activeUser.id;
      const roles=activeUser.app_metadata?.roles||[];
      el('account-role').textContent=roles.length?roles.join(', '):'member';
      setStatus('Signed in. The canonical character vault is available.','ok');
      renderVault();
    }else{
      el('account-email').textContent='Guest'; el('account-role').textContent='—';
      setStatus('Not signed in. Local creator data and JSON exports remain available.');
      list.innerHTML='<div class="vf-empty">Sign in to list account-backed characters.</div>';
    }
  }
  function renderVault(){
    const records=vault(activeUser).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
    if(!records.length){ list.innerHTML='<div class="vf-empty">No canonical characters saved to this account.</div>'; return; }
    list.innerHTML=records.map(record=>`<article class="vf-character-row" data-id="${esc(record.id)}"><div><h3>${esc(record.name||'Unnamed VeilFarer')}</h3><p>${esc([record.path,record.classId,record.subclass].filter(Boolean).join(' · ')||'Incomplete character')} · Level ${Number(record.level||1)}</p><p>Updated ${esc(record.updatedAt?new Date(record.updatedAt).toLocaleString():'—')}</p></div><div class="vf-actions"><button class="vf-button primary" data-action="load">Load</button><button class="vf-button" data-action="export">Export</button><button class="vf-button danger" data-action="delete">Delete</button></div></article>`).join('');
  }
  async function updateVault(records){
    if(!activeUser || typeof activeUser.update!=='function') throw new Error('Netlify Identity profile updates are unavailable.');
    const data=userData(activeUser); data[VAULT_KEY]=records;
    const updated=await activeUser.update({data});
    activeUser=updated||ID.currentUser()||activeUser;
    renderVault();
  }
  async function saveCurrent(asCopy){
    const state=currentState();
    if(!state) throw new Error('No local canonical character exists to save.');
    let records=vault(activeUser); const linked=asCopy?'':localStorage.getItem(LINK_KEY);
    const id=linked&&records.some(r=>r.id===linked)?linked:uid();
    const existing=records.find(r=>r.id===id); const now=new Date().toISOString();
    const record=Object.assign({},existing||{},metadata(state),{id,schema:'veilfarers.character.vault/1',rulesRelease:'11.1-RC3',state,inventory:currentInventory(),createdAt:existing?.createdAt||now,updatedAt:now});
    records=records.filter(r=>r.id!==id); records.unshift(record);
    await updateVault(records); localStorage.setItem(LINK_KEY,id);
    setStatus(`Saved ${record.name} to Netlify Identity.`, 'ok');
  }
  function loadRecord(record){
    if(!record?.state) throw new Error('This vault record has no canonical character state.');
    localStorage.setItem(CHARACTER_KEY,JSON.stringify(record.state));
    if(record.inventory) localStorage.setItem(INVENTORY_KEY,JSON.stringify(record.inventory));
    localStorage.setItem(LINK_KEY,record.id);
    location.href='/charsheet.html';
  }
  function exportRecord(record){
    const blob=new Blob([JSON.stringify(record,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url;a.download=`${(record.name||'veilfarers-character').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-vault.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  async function deleteRecord(record){
    if(!confirm(`Delete ${record.name||'this character'} from the account vault?`))return;
    await updateVault(vault(activeUser).filter(r=>r.id!==record.id));
    if(localStorage.getItem(LINK_KEY)===record.id)localStorage.removeItem(LINK_KEY);
    setStatus('Vault record deleted.','ok');
  }

  el('login-button').addEventListener('click',()=>ID?.open('login'));
  el('signup-button').addEventListener('click',()=>ID?.open('signup'));
  el('logout-button').addEventListener('click',()=>ID?.logout());
  el('save-current').addEventListener('click',()=>saveCurrent(false).catch(err=>setStatus(err.message,'bad')));
  el('save-copy').addEventListener('click',()=>saveCurrent(true).catch(err=>setStatus(err.message,'bad')));
  el('open-creator').addEventListener('click',()=>location.href='/');
  list.addEventListener('click',e=>{
    const row=e.target.closest('[data-id]'),button=e.target.closest('[data-action]'); if(!row||!button)return;
    const record=vault(activeUser).find(r=>r.id===row.dataset.id); if(!record)return;
    try{ if(button.dataset.action==='load')loadRecord(record); if(button.dataset.action==='export')exportRecord(record); if(button.dataset.action==='delete')deleteRecord(record).catch(err=>setStatus(err.message,'bad')); }catch(err){setStatus(err.message,'bad');}
  });
  renderLocal();
  if(!ID){ setStatus('Netlify Identity widget did not load. This page must be served from the Netlify deployment.','bad'); return; }
  ID.on('init',renderUser); ID.on('login',user=>{renderUser(user);ID.close();}); ID.on('logout',()=>renderUser(null)); ID.on('error',err=>setStatus(`Netlify Identity: ${err.message||err}`,'bad')); ID.init();
})();
