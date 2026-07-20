(function(){
  'use strict';
  function nativeInteractive(node){return /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(node.tagName);}
  function makeKeyboardInteractive(node,role){
    if(!node||nativeInteractive(node))return;
    if(!node.hasAttribute('role'))node.setAttribute('role',role||'button');
    if(!node.hasAttribute('tabindex'))node.tabIndex=0;
    if(node.dataset.vfKeyboardBound)return;
    node.dataset.vfKeyboardBound='true';
    node.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();node.click();}
    });
  }
  function ensureMain(){
    const route=document.body&&document.body.dataset.creatorRoute;
    const selectors=route==='level-up'?['#library-view','main','[role="main"]','#app','.vf-shell','.app']:route==='cards'?['#card-library-view','main','[role="main"]','#app','.vf-shell','.app']:['main','[role="main"]','#creator-view','#app','.vf-shell','.app'];
    const main=selectors.map(selector=>document.querySelector(selector)).find(Boolean);
    if(!main)return null;
    if(!main.id)main.id='vf-main-content';
    if(!main.hasAttribute('role')&&!/^(MAIN)$/.test(main.tagName))main.setAttribute('role','main');
    if(!document.querySelector('.vf-skip-link')){
      const skip=document.createElement('a');
      skip.className='vf-skip-link';skip.href='#'+main.id;skip.textContent='Skip to main content';
      skip.addEventListener('click',()=>{main.setAttribute('tabindex','-1');setTimeout(()=>main.focus({preventScroll:true}),0);});
      document.body.prepend(skip);
    }
    return main;
  }
  function upgrade(){
    ensureMain();
    document.querySelectorAll('.lib-tabs,.mode-bar,.vf-tabs').forEach(node=>{if(!node.hasAttribute('role'))node.setAttribute('role','tablist');});
    document.querySelectorAll('.step-nav-item,.creator-top-step,.lib-tab').forEach(node=>makeKeyboardInteractive(node,node.classList.contains('lib-tab')?'tab':'button'));
    document.querySelectorAll('.vl-card[data-pick],.power-card[data-power],.power-card[data-weapon],.power-card[data-armor]').forEach(node=>{
      const unavailable=node.classList.contains('disabled')||node.classList.contains('locked');
      makeKeyboardInteractive(node,'button');
      node.setAttribute('aria-pressed',String(node.classList.contains('selected')));
      node.setAttribute('aria-disabled',String(unavailable));
      if(unavailable)node.tabIndex=-1;
    });
    document.querySelectorAll('[data-filter-name]').forEach(root=>{
      const label=root.querySelector(':scope>label');const toggle=root.querySelector('[data-filter-toggle]');const value=root.querySelector('[data-filter-label]');
      if(toggle&&label)toggle.setAttribute('aria-label',label.textContent.trim()+': '+(value?value.textContent.trim():toggle.textContent.trim()));
    });
    const resume=document.querySelector('.resume-banner');if(resume){resume.setAttribute('role','region');resume.setAttribute('aria-label','Saved character draft');}
    document.querySelectorAll('.validation-msg,.vf-error,.levelup-error').forEach(node=>{node.setAttribute('role','alert');node.setAttribute('aria-live','assertive');});
    document.querySelectorAll('.save-status,.vf-status,.levelup-success,.vf-results-head').forEach(node=>{if(!node.hasAttribute('aria-live'))node.setAttribute('aria-live','polite');});
    document.querySelectorAll('[data-filter-menu][role="listbox"] .vf-filter-option').forEach(node=>{node.setAttribute('role','option');node.setAttribute('aria-selected',String(node.classList.contains('active')));});
    document.querySelectorAll('.lib-tab,.vf-tab').forEach(node=>node.setAttribute('aria-selected',String(node.classList.contains('active'))));
    document.querySelectorAll('.step-nav-item,.creator-top-step').forEach(node=>{if(node.classList.contains('active'))node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});
  }
  function init(){
    upgrade();
    document.addEventListener('click',()=>setTimeout(upgrade,0),true);
    const observer=new MutationObserver(()=>upgrade());
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),12000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
