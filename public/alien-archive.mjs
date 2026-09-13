import {setupBookIllustrations} from './book-illustrations.mjs?v=20260912-2';

export function selectArchiveRecord(archive, id) {
 const panels=[...archive.querySelectorAll('[data-record-panel]')];
 if(!panels.some(panel=>panel.dataset.recordPanel===id))return false;
 for(const panel of panels)panel.hidden=panel.dataset.recordPanel!==id;
 for(const link of archive.querySelectorAll('[data-record-link]')){
  const active=link.dataset.recordLink===id;
  link.setAttribute('aria-selected',String(active));link.tabIndex=active?0:-1;
 }
 return true;
}

function setupArchive(archive){
 const links=[...archive.querySelectorAll('[data-record-link]')];
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const stream=archive.querySelector('[data-record-stream]');
 const status=archive.querySelector('[data-record-status]');
 let visible=false,timer=0,reading=0,accesses=1;
 archive.classList.add('is-online');
 archive.querySelector('.xa-record-list').setAttribute('role','tablist');
 archive.querySelector('.xa-record-list').setAttribute('aria-orientation','vertical');
 links.forEach(link=>link.setAttribute('role','tab'));
 archive.querySelectorAll('[data-record-panel]').forEach(panel=>{panel.setAttribute('role','tabpanel');panel.tabIndex=0;});
 const fromHash=location.hash.replace('#record-','');
 selectArchiveRecord(archive,links.some(a=>a.dataset.recordLink===fromHash)?fromHash:links[0].dataset.recordLink);
 function updateStatus(){
  const selected=archive.querySelector('[data-record-panel]:not([hidden])');
  status.textContent=`READ / ${selected.dataset.recordCode} / ${String(accesses).padStart(3,'0')}`;
 }
 updateStatus();
 function choose(id){
  if(!selectArchiveRecord(archive,id))return;
  clearTimeout(reading);archive.classList.remove('is-reading');
  if(!motion.matches){void archive.offsetWidth;archive.classList.add('is-reading');reading=setTimeout(()=>archive.classList.remove('is-reading'),650);}
  accesses++;updateStatus();
  try{history.replaceState(history.state,'',`#record-${id}`);}catch{}
 }
 links.forEach((link,index)=>{
  link.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();choose(link.dataset.recordLink);});
  link.addEventListener('keydown',event=>{
   let next;
   if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%links.length;
   if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index-1+links.length)%links.length;
   if(event.key==='Home')next=0;if(event.key==='End')next=links.length-1;
   if(event.key===' '){event.preventDefault();choose(link.dataset.recordLink);return;}
   if(next===undefined)return;event.preventDefault();links[next].focus({preventScroll:true});choose(links[next].dataset.recordLink);
  });
 });
 function sync(){
  clearInterval(timer);timer=0;archive.classList.toggle('is-paused',!visible||document.hidden||motion.matches);
  if(!visible||document.hidden||motion.matches)return;
  timer=setInterval(()=>{stream.textContent=Array.from({length:4},()=>Math.floor(Math.random()*65536).toString(16).padStart(4,'0').toUpperCase()).join(' / ');},140);
 }
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(archive);
 motion.addEventListener('change',()=>{clearTimeout(reading);archive.classList.remove('is-reading');sync();});
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>{clearInterval(timer);clearTimeout(reading);});
 window.addEventListener('pageshow',sync);
 window.addEventListener('hashchange',()=>{const id=location.hash.replace('#record-','');if(selectArchiveRecord(archive,id)){archive.classList.remove('is-reading');accesses++;updateStatus();}});
}

function setupFieldTable(table){
 const entries=[...table.querySelectorAll('[data-field-entry]')];
 const button=table.querySelector('button');let previous=0;
 table.classList.add('is-ready');entries.forEach((entry,i)=>entry.hidden=i!==0);
 button.hidden=false;
 button.addEventListener('click',()=>{
  const next=(previous+1+Math.floor(Math.random()*(entries.length-1)))%entries.length;
  entries.forEach((entry,i)=>entry.hidden=i!==next);previous=next;
 });
}

if(typeof document!=='undefined'){
 setupBookIllustrations();
 document.querySelectorAll('[data-confidential-archive]').forEach(setupArchive);
 document.querySelectorAll('[data-field-table]').forEach(setupFieldTable);
}
