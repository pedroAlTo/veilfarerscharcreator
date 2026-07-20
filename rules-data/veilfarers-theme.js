(function(){
  'use strict';
  const KEY='veilfarers.ui.theme.v1';
  const THEMES=new Set(['blue','stone']);
  function read(){try{const v=(localStorage.getItem(KEY)||'').toLowerCase();return THEMES.has(v)?v:'blue';}catch(_){return 'blue';}}
  function apply(theme,persist){
    theme=THEMES.has(theme)?theme:'blue';
    document.documentElement.dataset.vfTheme=theme;
    if(document.body)document.body.dataset.vfTheme=theme;
    if(persist!==false){try{localStorage.setItem(KEY,theme);}catch(_){}}
    document.querySelectorAll('[data-vf-theme-option]').forEach(btn=>{
      const active=btn.dataset.vfThemeOption===theme;
      btn.classList.toggle('active',active);btn.setAttribute('aria-checked',active?'true':'false');
    });
    const trigger=document.querySelector('.vf-theme-trigger');
    if(trigger){trigger.dataset.theme=theme;trigger.title=theme==='stone'?'Theme: White Stone':'Theme: VeilFarers Blue';}
    window.dispatchEvent(new CustomEvent('veilfarers:theme-change',{detail:{theme}}));
  }
  apply(read(),false);
  function close(){const p=document.querySelector('.vf-theme-panel'),t=document.querySelector('.vf-theme-trigger');if(p)p.hidden=true;if(t)t.setAttribute('aria-expanded','false');}
  function mount(){
    if(document.querySelector('.vf-theme-trigger'))return true;
    const track=document.querySelector('.vf-portal-nav-track');if(!track)return false;
    const trigger=document.createElement('button');
    trigger.type='button';trigger.className='vf-theme-trigger';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML='<span aria-hidden="true">✦</span><span class="vf-theme-label">Theme</span>';
    const account=track.querySelector('#vf-nav-account');track.insertBefore(trigger,account||null);
    const panel=document.createElement('section');panel.className='vf-theme-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Interface theme');
    panel.innerHTML='<div class="vf-theme-head"><div><small>Appearance</small><strong>Portal theme</strong></div><button type="button" class="vf-theme-close" aria-label="Close">×</button></div><div class="vf-theme-options" role="radiogroup"><button type="button" role="radio" data-vf-theme-option="blue"><i class="vf-theme-swatch blue" aria-hidden="true"></i><span><strong>VeilFarers Blue</strong><small>Deep stellar blue, dark panels and gold metal.</small></span></button><button type="button" role="radio" data-vf-theme-option="stone"><i class="vf-theme-swatch stone" aria-hidden="true"></i><span><strong>White Stone</strong><small>Light mineral texture, charcoal type and restrained gold.</small></span></button></div>';
    document.body.appendChild(panel);
    trigger.addEventListener('click',e=>{e.stopPropagation();const open=panel.hidden;panel.hidden=!open;trigger.setAttribute('aria-expanded',open?'true':'false');if(open){const r=trigger.getBoundingClientRect();panel.style.top=Math.ceil(r.bottom+9)+'px';panel.style.right=Math.max(10,Math.ceil(innerWidth-r.right))+'px';panel.querySelector('[data-vf-theme-option].active,[data-vf-theme-option]')?.focus({preventScroll:true});}});
    panel.querySelector('.vf-theme-close').addEventListener('click',close);
    panel.addEventListener('click',e=>{const b=e.target.closest('[data-vf-theme-option]');if(!b)return;apply(b.dataset.vfThemeOption,true);close();});
    document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});window.addEventListener('resize',close,{passive:true});
    apply(read(),false);return true;
  }
  function init(){
    document.body.dataset.vfTheme=document.documentElement.dataset.vfTheme||read();
    const page=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'');document.body.classList.add('vf-themed-page','vf-page-'+page);
    if(mount())return;const obs=new MutationObserver(()=>{if(mount())obs.disconnect();});obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>obs.disconnect(),5000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.VeilFarersTheme={get:()=>document.documentElement.dataset.vfTheme||'blue',set:t=>apply(t,true)};
})();
