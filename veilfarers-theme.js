(function(){
  'use strict';
  const KEY='veilfarers.ui.theme.v1';
  const THEME='blue';
  function apply(){
    document.documentElement.dataset.vfTheme=THEME;
    if(document.body)document.body.dataset.vfTheme=THEME;
    try{localStorage.setItem(KEY,THEME);}catch(_){}
    document.querySelectorAll('.vf-theme-trigger,.vf-theme-panel').forEach(node=>node.remove());
    window.dispatchEvent(new CustomEvent('veilfarers:theme-change',{detail:{theme:THEME,locked:true}}));
  }
  apply();
  function init(){
    apply();
    const page=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'');
    document.body.classList.add('vf-themed-page','vf-page-'+page,'vf-theme-locked-blue');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.VeilFarersTheme=Object.freeze({get:()=>THEME,set:()=>apply(),locked:true});
})();
