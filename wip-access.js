(function(){
  'use strict';
  if(window.VF_IS_LOCAL_TEST===true)return;
  const tool=document.documentElement.dataset.vfWipTool;
  if(!tool)return;
  document.documentElement.classList.add('vf-wip-locked');
  const style=document.createElement('style');
  style.textContent='.vf-wip-locked body>*:not(#vf-wip-gate){visibility:hidden!important}.vf-wip-locked #vf-wip-gate{visibility:visible!important}.vf-wip-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#07111d;color:#e8edf4;font-family:Inter,system-ui,sans-serif;padding:20px}.vf-wip-card{width:min(480px,100%);padding:28px;border:1px solid #85651f;border-radius:14px;background:#0c1a29;box-shadow:0 24px 80px #000}.vf-wip-card h1{margin:0 0 8px;color:#f0cd72}.vf-wip-card p{color:#bdc8d5;line-height:1.55}.vf-wip-card button{width:100%;margin-top:12px;padding:12px;border-radius:8px;border:0;background:#d8ad4f;color:#111;font-weight:800;cursor:pointer}.vf-wip-card a{color:#f0cd72}.vf-wip-error{min-height:1.4em;color:#ff9b9b}';
  document.head.appendChild(style);
  function gate(){
    let node=document.getElementById('vf-wip-gate');
    if(node)return node;
    node=document.createElement('div');node.id='vf-wip-gate';node.className='vf-wip-gate';
    node.innerHTML=`<main class="vf-wip-card"><div>VEILFARERS · RESTRICTED WORK IN PROGRESS</div><h1>${tool==='keeper'?'Keeper':'Player'} Tool</h1><p>This tool is available only to the selected private playtest group. Sign in with the Netlify Identity account approved by the administrator.</p><button id="vf-wip-login" type="button">Sign in</button><p id="vf-wip-error" class="vf-wip-error" role="alert"></p><p><a href="/legal.html#privacy">Privacy</a> · <a href="/">Return home</a></p></main>`;
    document.body.appendChild(node);return node;
  }
  async function headers(){
    const user=window.netlifyIdentity?.currentUser?.();
    if(!user)return null;
    const token=await user.jwt();
    return {'content-type':'application/json',authorization:`Bearer ${token}`};
  }
  async function check(){
    const auth=await headers();
    if(!auth)throw Error('Sign in with an approved account.');
    const response=await fetch('/api/tool-access',{method:'POST',credentials:'same-origin',cache:'no-store',headers:auth,body:JSON.stringify({tool})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||'Access denied.');
    return data;
  }
  function unlock(){
    document.documentElement.classList.remove('vf-wip-locked');
    document.getElementById('vf-wip-gate')?.remove();
    window.dispatchEvent(new CustomEvent('veilfarers:wip-unlocked',{detail:{tool}}));
  }
  async function refresh(){
    const node=gate(),error=node.querySelector('#vf-wip-error');
    error.textContent='';
    try{await check();unlock()}catch(reason){error.textContent=reason.message||String(reason)}
  }
  function start(){
    const node=gate(),identity=window.netlifyIdentity;
    node.querySelector('#vf-wip-login').onclick=()=>identity?.open?.('login');
    if(!identity){node.querySelector('#vf-wip-error').textContent='Netlify Identity is unavailable.';return}
    identity.on('init',refresh);
    identity.on('login',()=>{identity.close();refresh()});
    identity.on('logout',()=>location.reload());
    identity.init();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
