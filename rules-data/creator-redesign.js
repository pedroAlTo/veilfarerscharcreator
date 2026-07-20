(function(){
  function syncTopRail(){
    const active=document.querySelector('.step-nav-item.active');
    const current=active&&active.dataset.step;
    document.querySelectorAll('.creator-top-step').forEach(btn=>{
      const step=btn.dataset.step;
      btn.classList.toggle('active',step===current);
      const n=Number(step),c=Number(current);
      btn.classList.toggle('done',Number.isFinite(n)&&Number.isFinite(c)&&n<c);
      btn.setAttribute('aria-current',step===current?'step':'false');
    });
    const label=active&&active.querySelector('.step-label');
    const live=document.getElementById('creator-current-section');
    if(live&&label)live.textContent=label.textContent;
  }
  function init(){
    document.querySelectorAll('.creator-top-step').forEach(btn=>btn.addEventListener('click',()=>{
      const step=Number(btn.dataset.step);
      if(Number.isFinite(step)&&typeof window.goStep==='function')window.goStep(step);
    }));
    const nav=document.getElementById('step-nav');
    if(nav)new MutationObserver(syncTopRail).observe(nav,{attributes:true,subtree:true,attributeFilter:['class']});
    syncTopRail();
    const syncRoute=()=>{
      const creator=document.getElementById('creator-view');
      const level=document.getElementById('library-view');
      const cards=document.getElementById('card-library-view');
      document.body.dataset.creatorRoute=(cards&&getComputedStyle(cards).display!=='none')?'cards':((level&&getComputedStyle(level).display!=='none')?'level-up':'creator');
    };
    syncRoute();
    [document.getElementById('creator-view'),document.getElementById('library-view'),document.getElementById('card-library-view')].filter(Boolean).forEach(node=>new MutationObserver(syncRoute).observe(node,{attributes:true,attributeFilter:['style','class']}));
    if(typeof window.VeilFarersSetCreatorRoute==='function'){
      const original=window.VeilFarersSetCreatorRoute;
      window.VeilFarersSetCreatorRoute=function(route,updateHistory){
        document.body.dataset.creatorRoute=route==='level-up'?'level-up':(route==='cards'?'cards':'creator');
        const result=original(route,updateHistory);setTimeout(syncTopRail,0);return result;
      };
    }
    document.getElementById('mode-bar')?.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      document.body.dataset.creatorRoute=b.dataset.mode==='library'?'level-up':'creator';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
