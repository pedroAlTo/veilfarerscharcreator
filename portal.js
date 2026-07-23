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
      <a href="/" data-page="home">Home</a>
      <a href="/creator.html" data-creator-mode="creator">Character Creator</a>
      <a href="/creator.html#cards" data-creator-mode="cards">Card Library</a>
      <a href="/creator.html#level-up" data-creator-mode="level-up">Level Up</a>
      <a href="/charsheet.html">Charsheet & PDF</a>
      <a href="/player-tool.html">Player Tool</a>
      <a href="/keeper-tool.html">Keeper Tool</a>
      <a href="/armory.html">Weapon & Armory</a>
      <a href="/items.html">Item Inventory</a>
      <a href="/downloads.html">Downloads</a>
      <a href="/feedback.html">Feedback</a>
      <span class="spacer"></span>
      <div id="vf-nav-character-id" class="vf-nav-character-id" hidden>
        <button id="vf-nav-character-trigger" class="vf-nav-character-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="vf-nav-character-menu">
          <span class="vf-nav-character-kicker">Character</span>
          <strong class="vf-nav-character-name"></strong>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
        </button>
      </div>
      <a id="vf-nav-account" class="vf-nav-account" href="/login.html"><span class="vf-account-dot" aria-hidden="true"></span><span class="vf-account-label">Log-in</span></a>
      <a id="vf-nav-admin" href="/admin.html" hidden>Admin</a>
    </div>
    <div id="vf-nav-character-menu" class="vf-nav-character-menu" role="listbox" aria-label="Select active character" hidden></div>
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
    if(a.dataset.page==='home' && path==='/') a.classList.add('active');
    else if(a.dataset.creatorMode && path==='/creator.html' && a.dataset.creatorMode===(location.hash==='#cards'?'cards':(location.hash==='#level-up'?'level-up':'creator'))) a.classList.add('active');
    else if(!a.classList.contains('brand') && !a.dataset.page && !a.dataset.creatorMode && hrefPath===path) a.classList.add('active');
  });

  function syncCreatorMode(){
    if(path!=='/creator.html')return;
    const route=location.hash==='#cards'?'cards':(location.hash==='#level-up'?'level-up':'creator');
    if(typeof window.VeilFarersSetCreatorRoute==='function') window.VeilFarersSetCreatorRoute(route,false);
    nav.querySelectorAll('[data-creator-mode]').forEach(a=>a.classList.toggle('active',a.dataset.creatorMode===route));
  }
  window.addEventListener('hashchange',syncCreatorMode);
  setTimeout(syncCreatorMode,0);

  function setPortalHeight(){
    document.documentElement.style.setProperty('--vf-portal-height',Math.ceil(nav.getBoundingClientRect().height||48)+'px');
    updateScroller();
  }
  setPortalHeight();
  window.addEventListener('resize',setPortalHeight,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(updateScroller).observe(track);
  setTimeout(updateScroller,50);

  const CHARACTER_REGISTRY_KEY='veilfarers.characters.registry.v1';
  const CURRENT_CHARACTER_KEY='veilfarers.character.currentId.v1';
  const PLAYER_CHARACTERS_KEY='veilfarers-player-tool-characters';
  const characterBadge=nav.querySelector('#vf-nav-character-id');
  const characterTrigger=nav.querySelector('#vf-nav-character-trigger');
  const characterBadgeValue=characterBadge&&characterBadge.querySelector('.vf-nav-character-name');
  const characterMenu=nav.querySelector('#vf-nav-character-menu');
  // Keep the floating picker outside the sticky navigation's clipping and
  // backdrop-filter containing block. It remains linked through aria-controls.
  document.body.appendChild(characterMenu);
  const normalizeCharacterId=value=>String(value||'').trim().toUpperCase();
  const parseStored=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch(_){return fallback;}};
  function currentCharacterId(){
    try{return normalizeCharacterId(localStorage.getItem(CURRENT_CHARACTER_KEY));}catch(_){return '';}
  }

  function characterSummary(record){
    const creator=record&&record.characterData&&record.characterData.creatorState||{};
    const fields=record&&record.characterData&&record.characterData.sheetPayload&&record.characterData.sheetPayload.fields||{};
    const player=record&&record.characterData&&record.characterData.playerCharacter||record&&record.playerCharacter||{};
    return {
      characterId:normalizeCharacterId(record&&record.characterId||player.characterId||player.id),
      name:String(creator.name||fields.name||player.name||record&&record.name||'Unnamed VeilFarer').trim()||'Unnamed VeilFarer',
      level:Number(creator.level||fields.level||player.level||record&&record.level||1)||1,
      path:String(creator.path||fields.chosen_path||fields.path||player.path||record&&record.path||'').trim(),
      className:String(creator.className||creator.cls||fields.class||player.class||record&&record.className||'').trim()
    };
  }

  function availableCharacters(){
    const byId=new Map();
    const registry=window.VeilFarersCharacterRegistry;
    let records=[];
    try{
      if(registry&&typeof registry.listForCurrentUser==='function')records=registry.listForCurrentUser({includeUnowned:true});
      else records=Object.values(parseStored(CHARACTER_REGISTRY_KEY,{}));
    }catch(_){records=Object.values(parseStored(CHARACTER_REGISTRY_KEY,{}));}
    records.filter(record=>record&&record.status!=='trashed').forEach(record=>{
      const item=characterSummary(record);
      if(item.characterId)byId.set(item.characterId,item);
    });
    const playerCharacters=parseStored(PLAYER_CHARACTERS_KEY,[]);
    if(Array.isArray(playerCharacters)){
      playerCharacters.filter(item=>item&&item.entityType!=='drone').forEach(player=>{
        const item=characterSummary({characterId:player.characterId||player.id,playerCharacter:player});
        if(item.characterId&&!byId.has(item.characterId))byId.set(item.characterId,item);
      });
    }
    return [...byId.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'})||a.characterId.localeCompare(b.characterId));
  }

  function closeCharacterMenu(returnFocus=false){
    if(!characterMenu||characterMenu.hidden)return;
    characterMenu.hidden=true;
    characterBadge&&characterBadge.classList.remove('is-open');
    characterTrigger&&characterTrigger.setAttribute('aria-expanded','false');
    if(returnFocus)characterTrigger&&characterTrigger.focus();
  }

  function positionCharacterMenu(){
    if(!characterMenu||!characterTrigger||characterMenu.hidden)return;
    const rect=characterTrigger.getBoundingClientRect();
    const width=Math.min(320,Math.max(236,window.innerWidth-16));
    const left=Math.max(8,Math.min(rect.right-width,window.innerWidth-width-8));
    characterMenu.style.width=`${width}px`;
    characterMenu.style.left=`${left}px`;
    characterMenu.style.top=`${Math.min(window.innerHeight-characterMenu.offsetHeight-8,rect.bottom+8)}px`;
  }

  function selectCharacter(id){
    id=normalizeCharacterId(id);
    if(!id)return;
    const registry=window.VeilFarersCharacterRegistry;
    const registered=registry&&typeof registry.get==='function'&&registry.get(id);
    if(registered&&typeof registry.setActive==='function')registry.setActive(id,{strict:false}).catch(error=>console.warn('Active character cloud sync deferred:',error));
    else if(registry&&typeof registry.setCurrentId==='function')registry.setCurrentId(id);
    else{
      localStorage.setItem(CURRENT_CHARACTER_KEY,id);
      window.dispatchEvent(new CustomEvent('veilfarers:active-character-changed',{detail:{characterId:id}}));
    }
    renderCharacterPicker(id);
    closeCharacterMenu(true);
  }

  function renderCharacterMenu(records,id){
    if(!characterMenu)return;
    characterMenu.replaceChildren();
    if(!records.length){
      const empty=document.createElement('div');
      empty.className='vf-nav-character-empty';
      empty.textContent='No selectable characters are available yet.';
      characterMenu.appendChild(empty);
      return;
    }
    records.forEach(record=>{
      const option=document.createElement('button');
      const selected=record.characterId===id;
      option.type='button';
      option.className=`vf-nav-character-option${selected?' is-selected':''}`;
      option.setAttribute('role','option');
      option.setAttribute('aria-selected',selected?'true':'false');
      option.dataset.characterId=record.characterId;
      const name=document.createElement('strong');
      name.textContent=record.name;
      const details=document.createElement('small');
      details.textContent=[record.characterId,`Level ${record.level}`,record.className||record.path].filter(Boolean).join(' · ');
      option.append(name,details);
      option.addEventListener('click',()=>selectCharacter(record.characterId));
      characterMenu.appendChild(option);
    });
  }

  function renderCharacterPicker(id=currentCharacterId()){
    id=normalizeCharacterId(id);
    if(!characterBadge)return;
    const records=availableCharacters();
    const current=records.find(record=>record.characterId===id);
    characterBadge.hidden=!id&&!records.length;
    if(characterBadgeValue)characterBadgeValue.textContent=current?current.name:(id?'Unnamed VeilFarer':'Choose character');
    characterTrigger.title=current?`Active character: ${current.name} (${current.characterId}). Click to change.`:'Choose the active character';
    characterTrigger.setAttribute('aria-label',current?`Active character: ${current.name}. Select another character.`:'Select active character');
    renderCharacterMenu(records,id);
    if(!characterMenu.hidden)requestAnimationFrame(positionCharacterMenu);
    setTimeout(updateScroller,0);
  }
  window.VeilFarersPortalRenderCharacterPicker=renderCharacterPicker;
  renderCharacterPicker();
  characterTrigger.addEventListener('click',()=>{
    const opening=characterMenu.hidden;
    if(!opening){closeCharacterMenu();return;}
    renderCharacterPicker();
    characterMenu.hidden=false;
    characterBadge.classList.add('is-open');
    characterTrigger.setAttribute('aria-expanded','true');
    requestAnimationFrame(positionCharacterMenu);
  });
  window.addEventListener('veilfarers:character-updated',()=>renderCharacterPicker());
  window.addEventListener('veilfarers:active-character-changed',event=>renderCharacterPicker(event.detail&&event.detail.characterId||currentCharacterId()));
  window.addEventListener('veilfarers:vault-refreshed',()=>renderCharacterPicker());
  window.addEventListener('storage',event=>{
    if([CURRENT_CHARACTER_KEY,CHARACTER_REGISTRY_KEY,PLAYER_CHARACTERS_KEY].includes(event.key))renderCharacterPicker(event.key===CURRENT_CHARACTER_KEY?event.newValue||'':currentCharacterId());
  });
  window.addEventListener('resize',positionCharacterMenu,{passive:true});
  window.addEventListener('scroll',positionCharacterMenu,{passive:true,capture:true});
  document.addEventListener('pointerdown',event=>{
    if(characterMenu.hidden||characterBadge.contains(event.target)||characterMenu.contains(event.target))return;
    closeCharacterMenu();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!characterMenu.hidden){event.preventDefault();closeCharacterMenu(true);}
    if(event.key==='ArrowDown'&&document.activeElement===characterTrigger){
      event.preventDefault();
      if(characterMenu.hidden)characterTrigger.click();
      requestAnimationFrame(()=>characterMenu.querySelector('[aria-selected="true"]')?.focus()||characterMenu.querySelector('.vf-nav-character-option')?.focus());
    }
  });

  const account=nav.querySelector('#vf-nav-account');
  const accountLabel=account.querySelector('.vf-account-label');
  const adminLink=nav.querySelector('#vf-nav-admin');
  function rolesOf(user){ return user&&user.app_metadata&&Array.isArray(user.app_metadata.roles)?user.app_metadata.roles:[]; }
  function renderAccount(user){
    const signedIn=!!user;
    account.classList.toggle('is-authenticated',signedIn);
    account.classList.toggle('is-guest',!signedIn);
    accountLabel.textContent=signedIn?'Logged in':'Log-in';
    account.title=signedIn?(user.email||'Signed in with Netlify Identity'):'Log in with Netlify Identity';
    if(adminLink) adminLink.hidden=!rolesOf(user).includes('admin');
  }
  function refreshSelectableCharacters(){
    const registry=window.VeilFarersCharacterRegistry;
    if(!registry||typeof registry.refreshVault!=='function')return;
    registry.refreshVault().then(()=>renderCharacterPicker()).catch(error=>console.warn('Character picker Vault refresh deferred:',error.message||error));
  }
  if(window.VF_IS_LOCAL_TEST===true){
    account.classList.add('is-authenticated','vf-local-test');
    account.classList.remove('is-guest');
    accountLabel.textContent='Local test';
    account.title='Local test server · Netlify Identity remains online-only';
    account.href='#';
    if(adminLink) adminLink.hidden=false;
    account.addEventListener('click',event=>event.preventDefault());
  }else{
    renderAccount(null);
  }

  function bindIdentity(identity, shouldInit){
    if(!identity)return;
    const renderIdentity=user=>{renderAccount(user);if(user)refreshSelectableCharacters();};
    try{ renderIdentity(identity.currentUser&&identity.currentUser()); }catch(_){ }
    identity.on('init',renderIdentity);
    identity.on('login',renderIdentity);
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
