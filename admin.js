(function(){
  'use strict';
  const identity=window.netlifyIdentity;
  const status=document.getElementById('admin-status');
  const content=document.getElementById('admin-content');
  const userStatus=document.getElementById('identity-admin-status');
  const userList=document.getElementById('identity-user-list');
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const selectedInviteRoles=new Set();
  let activeIdentityUser=null;
  let users=[];
  let busy=false;

  function setStatus(msg,type=''){status.textContent=msg;status.className='vf-status'+(type?` ${type}`:'');}
  function setUserStatus(msg,type=''){userStatus.textContent=msg;userStatus.className='vf-status'+(type?` ${type}`:'');}
  function dateText(value){try{return value?new Date(value).toLocaleString():'—';}catch(_){return '—';}}
  async function authHeaders(){
    const user=identity?.currentUser?.();
    if(!user)throw Error('Administrator sign-in required.');
    return {'content-type':'application/json',authorization:`Bearer ${await user.jwt(true)}`};
  }
  async function userApi(body){
    const response=await fetch('/api/admin-users',{method:'POST',credentials:'same-origin',cache:'no-store',headers:await authHeaders(),body:JSON.stringify(body)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||'Administrator request failed.');
    return data;
  }
  async function loadRelease(){
    const [log,manifest,firebaseCheck]=await Promise.all([
      fetch('/data/changelog.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('/rules-data/manifest.json',{cache:'no-store'}).then(r=>r.json()),
      fetch('/api/firebase-config',{cache:'no-store'}).then(async r=>({ok:r.ok,body:r.ok?await r.json():null,status:r.status})).catch(()=>({ok:false,status:'offline'}))
    ]);
    document.getElementById('admin-release').textContent=manifest.release||manifest.version;
    document.getElementById('admin-portal-version').textContent=log.currentVersion||'—';
    const required=['apiKey','authDomain','projectId','appId'];
    const present=required.filter(k=>firebaseCheck.body?.[k]).length;
    document.getElementById('firebase-health').textContent=firebaseCheck.ok?`Configuration endpoint healthy · ${present}/${required.length} required fields present`:`Configuration endpoint unavailable (${firebaseCheck.status})`;
    document.getElementById('changelog').innerHTML=(log.entries||[]).map(entry=>`<article class="vf-sheet-block"><h3>${esc(entry.version)} · ${esc(entry.date)}</h3><ul>${(entry.changes||[]).map(c=>`<li>${esc(c)}</li>`).join('')}</ul></article>`).join('');
  }
  function roleButton(user,role){
    const active=user.roles.includes(role);
    return `<button class="vf-button vf-role-toggle ${active?'primary':''}" type="button" data-user-role="${role}" aria-pressed="${active}">${role==='player'?'Player Tool':'Keeper Tool'}</button>`;
  }
  function renderUsers(){
    if(!users.length){userList.innerHTML='<div class="vf-empty">No Identity users found.</div>';return;}
    userList.innerHTML=users.map(user=>{
      const admin=user.roles.includes('admin');
      const current=user.id===activeIdentityUser?.id;
      return `<article class="vf-sheet-block" data-user-id="${esc(user.id)}" data-user-email="${esc(user.email)}">
        <div class="vf-section-heading"><div><div class="vf-eyebrow">${admin?'Administrator':user.confirmedAt?'Active Identity account':'Invitation pending'}</div><h3>${esc(user.email)}</h3></div><span class="vf-badge">${esc(user.roles.join(', ')||'member')}</span></div>
        <p class="vf-muted">Created ${esc(dateText(user.createdAt))} · Last sign-in ${esc(dateText(user.lastSignInAt))}</p>
        ${admin?'<p>Administrator roles are managed only in Netlify.</p>':`<div class="vf-actions">${roleButton(user,'player')}${roleButton(user,'keeper')}<button class="vf-button primary" type="button" data-action="save-roles">Save access</button><button class="vf-button danger" type="button" data-action="begin-delete">Delete account and cloud data</button></div><div class="vf-actions vf-hidden" data-delete-confirm style="margin-top:10px"><input class="vf-input" data-confirm-email placeholder="Type the exact email"><button class="vf-button danger" type="button" data-action="confirm-delete">Confirm permanent deletion</button><button class="vf-button" type="button" data-action="cancel-delete">Cancel</button></div>`}
        ${current?'<p class="vf-muted">Current signed-in account.</p>':''}
      </article>`;
    }).join('');
  }
  async function loadUsers(){
    setUserStatus('Loading protected-tool access…');
    const data=await userApi({action:'list'});
    users=data.users||[];
    renderUsers();
    setUserStatus(`${users.length} Identity account${users.length===1?'':'s'} loaded.`,'ok');
  }
  function setInviteRole(role,button){
    if(selectedInviteRoles.has(role))selectedInviteRoles.delete(role);else selectedInviteRoles.add(role);
    const active=selectedInviteRoles.has(role);button.classList.toggle('primary',active);button.setAttribute('aria-pressed',String(active));
  }
  document.querySelectorAll('[data-invite-role]').forEach(button=>button.addEventListener('click',()=>setInviteRole(button.dataset.inviteRole,button)));
  document.getElementById('identity-invite-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    const email=document.getElementById('identity-invite-email').value.trim();
    busy=true;document.getElementById('identity-invite-submit').disabled=true;setUserStatus(`Inviting ${email}…`);
    try{
      await userApi({action:'invite',email,roles:[...selectedInviteRoles]});
      document.getElementById('identity-invite-email').value='';
      selectedInviteRoles.clear();
      document.querySelectorAll('[data-invite-role]').forEach(button=>{button.classList.remove('primary');button.setAttribute('aria-pressed','false')});
      await loadUsers();setUserStatus(`Invitation sent to ${email}.`,'ok');
    }catch(error){setUserStatus(error.message||String(error),'bad')}
    finally{busy=false;document.getElementById('identity-invite-submit').disabled=false}
  });
  userList.addEventListener('click',async event=>{
    const card=event.target.closest('[data-user-id]'),button=event.target.closest('button');if(!card||!button||busy)return;
    const user=users.find(item=>item.id===card.dataset.userId);if(!user)return;
    const role=button.dataset.userRole;
    if(role){
      if(user.roles.includes(role))user.roles=user.roles.filter(item=>item!==role);else user.roles.push(role);
      renderUsers();return;
    }
    const action=button.dataset.action;
    if(action==='begin-delete'){card.querySelector('[data-delete-confirm]').classList.remove('vf-hidden');card.querySelector('[data-confirm-email]').focus();return}
    if(action==='cancel-delete'){card.querySelector('[data-delete-confirm]').classList.add('vf-hidden');card.querySelector('[data-confirm-email]').value='';return}
    busy=true;setUserStatus('Applying administrator action…');
    try{
      if(action==='save-roles'){
        await userApi({action:'updateRoles',userId:user.id,roles:user.roles.filter(role=>role==='player'||role==='keeper')});
        await loadUsers();setUserStatus(`Access updated for ${user.email}. The user must refresh their session.`,'ok');
      }
      if(action==='confirm-delete'){
        const confirmEmail=card.querySelector('[data-confirm-email]').value.trim();
        await userApi({action:'deleteUser',userId:user.id,confirmEmail});
        await loadUsers();setUserStatus(`${user.email} and associated cloud data were deleted.`,'ok');
      }
    }catch(error){setUserStatus(error.message||String(error),'bad')}
    finally{busy=false}
  });
  async function load(){
    await Promise.all([loadRelease(),loadUsers()]);
  }
  if(window.VF_IS_LOCAL_TEST===true){
    setStatus('Local test mode · administrator API mutations remain disabled outside Netlify.','ok');
    content.hidden=false;loadRelease().catch(err=>setStatus(err.message,'bad'));
    userList.innerHTML='<div class="vf-empty">Deploy Preview required to test Identity invitations and role changes.</div>';
    return;
  }
  if(!identity){setStatus('Netlify Identity is unavailable.','bad');return;}
  identity.on('init',user=>{
    activeIdentityUser=user;
    const roles=user?.app_metadata?.roles||[];
    if(!user){setStatus('Sign in with an administrator account.','bad');identity.open('login');return;}
    if(!roles.includes('admin')){setStatus('Access denied: this account does not have the admin role.','bad');return;}
    setStatus('Administrator identity detected. Verifying server authorization…');
    content.hidden=false;
    load().then(()=>setStatus('Administrator access granted.','ok')).catch(err=>{content.hidden=true;setStatus(err.message,'bad')});
  });
  identity.on('login',()=>location.reload());identity.init();
})();
