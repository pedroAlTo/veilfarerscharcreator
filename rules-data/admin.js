(function(){
  'use strict';
  const identity=window.netlifyIdentity, status=document.getElementById('admin-status'), content=document.getElementById('admin-content');
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  function setStatus(msg,type=''){status.textContent=msg;status.className='vf-status'+(type?` ${type}`:'');}
  async function load(){
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
  if(window.VF_IS_LOCAL_TEST===true){
    setStatus('Local test mode · Netlify Identity role checks are bypassed only by the bundled local server.','ok');
    content.hidden=false;
    load().catch(err=>setStatus(err.message,'bad'));
    return;
  }
  if(!identity){setStatus('Netlify Identity is unavailable.','bad');return;}
  identity.on('init',user=>{
    const roles=user?.app_metadata?.roles||[];
    if(!user){setStatus('Sign in with an administrator account.','bad');identity.open('login');return;}
    if(!roles.includes('admin')){setStatus('Access denied: this account does not have the admin role.','bad');return;}
    setStatus('Administrator access granted.','ok');content.hidden=false;load().catch(err=>setStatus(err.message,'bad'));
  });
  identity.on('login',()=>location.reload());identity.init();
})();
