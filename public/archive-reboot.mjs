// Local, fictional terminal sequence. No navigation, credentials or requests.
const NORMAL=[2800,850,450,3400,3400,750];
const REDUCED=[1500,250,150,1900,2200,350];
const STAGES=['warning','shutdown','off','bios','login','restore'];
export function rebootFrame(elapsed,reduced=false){
 const durations=reduced?REDUCED:NORMAL;
 let offset=0;
 for(let i=0;i<durations.length;i++){
  if(elapsed<offset+durations[i])return {stage:STAGES[i],progress:Math.max(0,(elapsed-offset)/durations[i])};
  offset+=durations[i];
 }
 return {stage:'ready',progress:1};
}

export function setupArchiveReboot(archive,{restore=()=>{}}={}){
 const pager=archive.querySelector('[data-archive-pager]');
 const overlay=archive.querySelector('[data-archive-reboot]');
 if(!pager||!overlay)return;
 const screen=archive.querySelector('.xa-record-screen');
 const sidebar=archive.querySelector('.xa-record-sidebar');
 const records=[...archive.querySelectorAll('[data-record-panel]')];
 const views=[...overlay.querySelectorAll('[data-reboot-view]')];
 const announcement=archive.querySelector('[data-reboot-announcement]');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const biosLines=[...overlay.querySelectorAll('[data-bios-line]')];
 const user=overlay.querySelector('[data-login-user]');
 const password=overlay.querySelector('[data-login-password]');
 const loginStatus=overlay.querySelector('[data-login-state]');
 const meter=overlay.querySelector('[data-login-meter]');
 let busy=false,visible=false,frame=0,last=0,elapsed=0,reduced=false,stage='ready',origin=null,selected=null;
 const messages={warning:'ITRUSIVE ACCES DETECTED! Proceding to shut dow.',shutdown:'Shutting down the archive.',off:'Display offline.',bios:'Kurogane Technologies. Loading system BIOS.',login:'Signing in as DVoss with a masked password.',restore:'Access granted. Restoring the archive.'};
 archive.dataset.archiveState='ready';pager.hidden=false;

 function pause(){cancelAnimationFrame(frame);frame=0;last=0;}
 function finish(){
  if(!busy)return;
  const returnFocus=overlay.contains(document.activeElement);
  busy=false;pause();stage='ready';archive.dataset.archiveState='ready';archive.classList.remove('is-rebooting');
  overlay.hidden=true;sidebar.inert=false;records.forEach(record=>record.inert=false);
  views.forEach(view=>view.hidden=true);user.textContent='';password.textContent='';
  restore(selected);announcement.textContent='DVoss signed in. Archive restored.';
  archive.dispatchEvent(new Event('archive-reboot-state'));
  if(returnFocus&&origin?.isConnected)origin.focus({preventScroll:true});
 }
 function paint(){
  const current=rebootFrame(elapsed,reduced);
  if(current.stage==='ready'){finish();return;}
  if(stage!==current.stage){
   stage=current.stage;archive.dataset.archiveState=stage;
   views.forEach(view=>view.hidden=view.dataset.rebootView!==stage);
   announcement.textContent=messages[stage];
  }
  if(stage==='bios')biosLines.forEach((line,i)=>line.classList.toggle('is-loaded',i<Math.ceil(current.progress*(biosLines.length+1))));
  if(stage==='login'){
   user.textContent='DVoss'.slice(0,Math.floor(current.progress/.25*5));
   const dots=Math.max(0,Math.min(10,Math.floor((current.progress-.28)/.4*10)));
   password.textContent='•'.repeat(dots);
   loginStatus.textContent=current.progress<.7?'ESTABLISHING SESSION':current.progress<.9?'AUTHENTICATING':'ACCESS GRANTED';
   meter.style.setProperty('--login-progress',`${Math.max(0,Math.min(100,(current.progress-.68)/.24*100))}%`);
  }
 }
 function tick(now){
  frame=0;if(!busy||!visible||document.hidden){last=0;return;}
  if(last)elapsed+=Math.min(100,Math.max(0,now-last));last=now;paint();
  if(busy)frame=requestAnimationFrame(tick);
 }
 function resume(){pause();if(busy&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 function start(event){
  if(busy)return;
  origin=event.currentTarget;selected=records.find(record=>!record.hidden)?.dataset.recordPanel;
  busy=true;elapsed=0;reduced=motion.matches;stage='ready';
  archive.classList.remove('is-reading');archive.classList.add('is-rebooting');
  overlay.hidden=false;sidebar.inert=true;records.forEach(record=>record.inert=true);
  biosLines.forEach(line=>line.classList.remove('is-loaded'));user.textContent='';password.textContent='';
  paint();overlay.focus({preventScroll:true});
  screen.scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'});
  archive.dispatchEvent(new Event('archive-reboot-state'));resume();
 }
 pager.querySelectorAll('button').forEach(button=>button.addEventListener('click',start));
 overlay.querySelector('[data-reboot-skip]').addEventListener('click',finish);
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();finish();}});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();}).observe(screen);
 document.addEventListener('visibilitychange',resume);
 window.addEventListener('pagehide',pause);
 window.addEventListener('pageshow',resume);
}
