(function(){
  'use strict';
  const body=document.body;
  const sheet=document.getElementById('sheet');
  const flip=document.getElementById('flipBtn');
  const pathField=()=>document.querySelector('[data-f="chosen_path"]');
  function syncPath(){
    const chosen=String(pathField()?.value||'').trim().toLowerCase();
    const path=chosen==='awakened'||chosen==='sleeping'?chosen:(sheet?.classList.contains('flipped')?'awakened':'sleeping');
    body.dataset.vfSheetPath=path;
  }
  function titleForControl(el){
    if(!el||el.type==='password')return;
    const value=String(el.value||'').trim();
    if(value)el.title=value;
    else if(el.hasAttribute('title')&&el.dataset.vfAutoTitle==='1')el.removeAttribute('title');
    el.dataset.vfAutoTitle='1';
  }
  function syncTitles(root=document){
    root.querySelectorAll('.paper input,.paper select,.paper textarea').forEach(titleForControl);
  }
  document.addEventListener('input',e=>{if(e.target?.matches('.paper input,.paper select,.paper textarea'))titleForControl(e.target)});
  document.addEventListener('change',e=>{
    if(e.target?.matches('.paper input,.paper select,.paper textarea'))titleForControl(e.target);
    if(e.target?.matches('[data-f="chosen_path"]'))syncPath();
  });
  flip?.addEventListener('click',()=>requestAnimationFrame(syncPath));
  if(sheet&&window.MutationObserver)new MutationObserver(syncPath).observe(sheet,{attributes:true,attributeFilter:['class']});
  window.addEventListener('veilfarers:theme-change',()=>body.classList.add('vf-sheet-theme-ready'));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{syncPath();syncTitles();},{once:true});
  else{syncPath();syncTitles();}
})();
