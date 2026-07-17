(function(){
  'use strict';
  const nav=document.createElement('nav');
  nav.className='vf-portal-nav';
  nav.setAttribute('aria-label','VeilFarers portal');
  nav.innerHTML=`
    <button class="vf-nav-scroll vf-nav-scroll-prev" type="button" aria-label="Scroll portal navigation left" title="Previous portal links">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <div class="vf-portal-nav-track">
      <a class="brand" href="/">VEILFARERS</a>
      <a href="/" data-root="creator">Character Creator</a>
      <a href="/#cards" data-root="cards">Card Library</a>
      <a href="/charsheet.html">Charsheet & PDF</a>
      <a href="/player-tool.html">Player Tool</a>
      <a href="/keeper-tool.html">Keeper Tool</a>
      <a href="/armory.html">Weapon & Armory</a>
      <a href="/items.html">Item Inventory</a>
      <a href="/downloads.html">Downloads</a>
      <a href="/feedback.html">Feedback</a>
      <span class="spacer"></span>
      <a id="vf-nav-account" class="vf-nav-account" href="/login.html"><span class="vf-account-dot" aria-hidden="true"></span><span class="vf-account-label">Log-in</span></a>
      <a href="/admin.html">Admin</a>
    </div>
    <button class="vf-nav-scroll vf-nav-scroll-next" type="button" aria-label="Scroll portal navigation right" title="More portal links">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>`;
  document.body.prepend(nav);

  const track=nav.querySelector('.vf-portal-nav-track');
  const prev=nav.querySelector('.vf-nav-scroll-prev');
  const next=nav.querySelector('.vf-nav-scroll-next');
  function updateScroller(){
    const overflow=track.scrollWidth>track.clientWidth+2;
    nav.classList.toggle('has-overflow',overflow);
    prev.disabled=!overflow||track.scrollLeft<=2;
    next.disabled=!overflow||track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
  }
  function move(direction){
    const distance=Math.max(220,Math.min(520,track.clientWidth*.7));
    track.scrollBy({left:direction*distance,behavior:'smooth'});
  }
  prev.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  track.addEventListener('scroll',updateScroller,{passive:true});

  function normalPath(value){
    const normalized=(value||'/').replace(/\/+/g,'/');
    return normalized==='/'?'/':normalized.replace(/\/$/,'');
  }
  const path=normalPath(location.pathname);
  nav.querySelectorAll('a').forEach(a=>{
    const href=new URL(a.href,location.origin);
    const hrefPath=normalPath(href.pathname);
    if(hrefPath===path && !a.dataset.root) a.classList.add('active');
    if(path==='/' && a.dataset.root===(location.hash==='#cards'?'cards':'creator')) a.classList.add('active');
  });

  function syncRootMode(){
    if(path!=='/')return;
    const library=location.hash==='#cards';
    const mode=library?'library':'creator';
    const target=document.querySelector(`#mode-bar button[data-mode="${mode}"]`);
    if(target&&!target.classList.contains('active'))target.click();
    nav.querySelectorAll('[data-root]').forEach(a=>a.classList.toggle('active',a.dataset.root===(library?'cards':'creator')));
  }
  window.addEventListener('hashchange',syncRootMode);
  setTimeout(syncRootMode,0);

  function setPortalHeight(){
    document.documentElement.style.setProperty('--vf-portal-height',Math.ceil(nav.getBoundingClientRect().height||48)+'px');
    updateScroller();
  }
  setPortalHeight();
  window.addEventListener('resize',setPortalHeight,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(updateScroller).observe(track);
  setTimeout(updateScroller,50);

  const account=nav.querySelector('#vf-nav-account');
  const accountLabel=account.querySelector('.vf-account-label');
  function renderAccount(user){
    const signedIn=!!user;
    account.classList.toggle('is-authenticated',signedIn);
    account.classList.toggle('is-guest',!signedIn);
    accountLabel.textContent=signedIn?'Logged in':'Log-in';
    account.title=signedIn?(user.email||'Signed in with Netlify Identity'):'Log in with Netlify Identity';
  }
  if(window.VF_IS_LOCAL_TEST===true){
    account.classList.add('is-authenticated','vf-local-test');
    account.classList.remove('is-guest');
    accountLabel.textContent='Local test';
    account.title='Local test server · Netlify Identity remains online-only';
    account.href='#';
    account.addEventListener('click',event=>event.preventDefault());
  }else{
    renderAccount(null);
  }

  function bindIdentity(identity, shouldInit){
    if(!identity)return;
    try{ renderAccount(identity.currentUser&&identity.currentUser()); }catch(_){ }
    identity.on('init',renderAccount);
    identity.on('login',renderAccount);
    identity.on('logout',()=>renderAccount(null));
    if(shouldInit){ try{identity.init();}catch(_){ } }
  }
  if(window.VF_IS_LOCAL_TEST===true){
    // The local server never initializes Netlify Identity. Production behavior is unchanged.
  }else if(window.netlifyIdentity){
    bindIdentity(window.netlifyIdentity,false);
  }else{
    const script=document.createElement('script');
    script.src='https://identity.netlify.com/v1/netlify-identity-widget.js';
    script.async=true;
    script.onload=()=>bindIdentity(window.netlifyIdentity,true);
    document.head.appendChild(script);
  }
})();
