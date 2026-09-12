import {setupBookIllustrations} from './book-illustrations.mjs?v=20260912-1';
setupBookIllustrations();
const picker=document.querySelector('[data-faction-picker]');
if(picker){
  const tabs=[...picker.querySelectorAll('a')];
  const panels=tabs.map(tab=>document.getElementById(tab.hash.slice(1)));
  picker.setAttribute('role','tablist');picker.setAttribute('aria-label','Choose a faction by its crest');
  tabs.forEach((tab,i)=>{tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);panels[i].tabIndex=0;});
  function select(index,focus=false){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',event=>{if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();select(index);});
    tab.addEventListener('keydown',event=>{
      const next=event.key==='ArrowRight'||event.key==='ArrowDown'?(index+1)%tabs.length:event.key==='ArrowLeft'||event.key==='ArrowUp'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key===' '?index:null;
      if(next!==null){event.preventDefault();select(next,true);}
    });
  });
  function fromHash(){const index=tabs.findIndex(tab=>tab.hash===location.hash);if(index>=0)select(index);}
  select(0);fromHash();window.addEventListener('hashchange',fromHash);
}
