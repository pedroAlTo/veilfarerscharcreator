(function(){
  'use strict';
  const nav=document.createElement('nav');
  nav.className='vf-portal-nav';
  nav.setAttribute('aria-label','VeilFarers portal');
  nav.innerHTML=`<a class="brand" href="/">VEILFARERS</a><a href="/" data-root="creator">Character Creator</a><a href="/#cards" data-root="cards">Card Library</a><a href="/charsheet.html">Charsheet & Level Up</a><a href="/player-tool.html">Player Tool</a><a href="/keeper-tool.html">Keeper Tool</a><a href="/armory.html">Weapon & Armory</a><a href="/items.html">Item Inventory</a><a href="/downloads.html">Downloads</a><a href="/feedback.html">Feedback</a><span class="spacer"></span><a href="/login.html">Log-in</a><a href="/admin.html">Admin</a>`;
  document.body.prepend(nav);
  const path=location.pathname.replace(/\/$/,'/')||'/';
  nav.querySelectorAll('a').forEach(a=>{
    const href=new URL(a.href,location.origin);
    if(href.pathname===path && !a.dataset.root) a.classList.add('active');
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
})();
