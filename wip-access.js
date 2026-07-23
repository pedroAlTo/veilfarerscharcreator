(function(){
  'use strict';
  if(window.VF_IS_LOCAL_TEST===true)return;
  const tool=document.documentElement.dataset.vfWipTool;
  if(!tool)return;
  document.documentElement.classList.add('vf-wip-locked');
  const style=document.createElement('style');
  style.textContent='.vf-wip-locked body>*:not(#vf-wip-gate){visibility:hidden!important}.vf-wip-locked #vf-wip-gate{visibility:visible!important}.vf-wip-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#07111d;color:#e8edf4;font-family:Inter,system-ui,sans-serif;padding:20px}.vf-wip-card{width:min(480px,100%);padding:28px;border:1px solid #85651f;border-radius:14px;background:#0c1a29;box-shadow:0 24px 80px #000}.vf-wip-card h1{margin:0 0 8px;color:#f0cd72}.vf-wip-card p{color:#bdc8d5;line-height:1.55}.vf-wip-card input,.vf-wip-card button{width:100%;margin-top:12px;padding:12px;border-radius:8px}.vf-wip-card input{border:1px solid #506172;background:#07111d;color:#fff}.vf-wip-card button{border:0;background:#d8ad4f;color:#111;font-weight:800;cursor:pointer}.vf-wip-card a{color:#f0cd72}.vf-wip-error{min-height:1.4em;color:#ff9b9b}';
  document.head.appendChild(style);
  function gate(){
    let node=document.getElementById('vf-wip-gate');
    if(node)return node;
    node=document.createElement('div');node.id='vf-wip-gate';node.className='vf-wip-gate';
    node.innerHTML=`<main class="vf-wip-card"><div>VEILFARERS · WORK IN PROGRESS</div><h1>${tool==='keeper'?'Keeper':'Player'} Tool protected access</h1><p>Closed private testing only. Sign in with the account that received the invitation, then enter its individual token. Access is temporary, revocable and traceable to that account.</p><input id="vf-wip-token" type="password" autocomplete="one-time-code" aria-label="Invitation token" placeholder="Invitation token"><button id="vf-wip-submit" type="button">Unlock ${tool} tool</button><button id="vf-wip-login" type="button">Sign in</button><p id="vf-wip-error" class="vf-wip-error" role="alert"></p><p><a href="/legal.html#privacy">Privacy</a> · <a href="/">Return home</a></p></main>`;
    document.body.appendChild(node);return node;
  }
  async function headers(){
    const user=window.netlifyIdentity?.currentUser?.();
    if(!user)return null;
    const token=await user.jwt();
    return {'content-type':'application/json',authorization:`Bearer ${token}`};
  }
  async function request(action,token){
    const auth=await headers();
    if(!auth)throw Error('Sign in with the invited account first.');
    const response=await fetch('/api/wip-access',{method:'POST',credentials:'same-origin',cache:'no-store',headers:auth,body:JSON.stringify({action,tool,token})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||'Access denied.');
    return data;
  }
  function unlock(){document.documentElement.classList.remove('vf-wip-locked');document.getElementById('vf-wip-gate')?.remove();window.dispatchEvent(new CustomEvent('veilfarers:wip-unlocked',{detail:{tool}}))}
  async function check(){try{await request('check');unlock();}catch{gate()}}
  function bind(){
    const node=gate(),error=node.querySelector('#vf-wip-error'),submit=node.querySelector('#vf-wip-submit'),login=node.querySelector('#vf-wip-login');
    login.onclick=()=>window.netlifyIdentity?.open?.('login');
    submit.onclick=async()=>{error.textContent='';submit.disabled=true;try{await request('redeem',node.querySelector('#vf-wip-token').value);unlock();location.reload()}catch(reason){error.textContent=reason.message||String(reason)}finally{submit.disabled=false}};
  }
  function start(){
    bind();
    const identity=window.netlifyIdentity;
    if(!identity){document.getElementById('vf-wip-error').textContent='Netlify Identity is unavailable.';return}
    identity.on('init',()=>check());identity.on('login',()=>{identity.close();check()});identity.init();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
