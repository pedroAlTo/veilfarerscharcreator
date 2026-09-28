import {droneSprites} from './drone-sprites.mjs?v=20260927-5';
import {renderShared,setupShared,positionDroneScan} from './drone-shared.mjs?v=20260928-2';
import {renderSignal,setupSignal} from './drone-signal-scene.mjs?v=20260927-5';

const es=document.documentElement.lang==='es';
const words=es?{
 pause:'PAUSAR ANIMACIONES',play:'ACTIVAR ANIMACIONES',ready:'LISTO PARA DESPLEGAR',pilot:'CONTROL DE VUELO',scan:'RECONOCIMIENTO',cargo:'TRANSPORTE',stealth:'INFILTRACIÓN',waiting:'4 PERSONAS ESPERANDO',one:'1 PERSONA JUGANDO',patrol:'PATRULLA',detected:'DRON DESCUBIERTO',fire:'DISPARO',offline:'DRON NEUTRALIZADO',jammed:'SEÑAL BLOQUEADA',linked:'CONEXIÓN AUTORIZADA',relay:'REPETIDOR ACTIVO',together:'UNA MISIÓN COMPARTIDA',copied:'Enlace del artículo copiado.',link:'Enlace del artículo:',
 signal:{jammed:'El dron llega al perímetro, pero la interferencia corta el control. Hace falta preparar otra vía de entrada.',codes:'Los códigos de acceso identifican el dron como una unidad autorizada. Puede atravesar las áreas protegidas.',frequency:'El grupo encuentra una frecuencia de comunicación permitida y mantiene el enlace durante el recorrido.',relay:'Los repetidores preparados por el grupo mantienen la conexión al atravesar las áreas protegidas.'},
 crew:{scoundrel:['SCOUNDREL // INFILTRACIÓN','El Scoundrel oculta el dron para entrar con sigilo.'],pilot:['PILOTO // NAVEGACIÓN','El Piloto toma el control: más velocidad, giros cerrados y navegación ágil.'],engineer:['INGENIERO // ACCESO','El Ingeniero usa su spotlight para hackear el acceso y abrir la puerta.'],diplomat:['DIPLOMÁTICO // COMUNICACIÓN','El Diplomático interviene la radio del guardia e imita a la central. El guardia responde, abandona su puesto y la puerta se abre.']}
}:{
 pause:'PAUSE ANIMATIONS',play:'PLAY ANIMATIONS',ready:'READY TO DEPLOY',pilot:'FLIGHT CONTROL',scan:'RECONNAISSANCE',cargo:'LOGISTICS',stealth:'INFILTRATION',waiting:'4 PEOPLE WAITING',one:'1 PERSON PLAYING',patrol:'PATROL',detected:'DRONE DISCOVERED',fire:'SHOT FIRED',offline:'DRONE NEUTRALIZED',jammed:'SIGNAL BLOCKED',linked:'AUTHORIZED CONNECTION',relay:'REPEATER ACTIVE',together:'ONE SHARED MISSION',copied:'Article link copied.',link:'Article link:',
 signal:{jammed:'The drone reaches the perimeter, but interference cuts off control. The crew needs to prepare another way in.',codes:'Access codes identify the drone as an authorized unit. It can fly through the protected areas.',frequency:'The group finds an approved communications frequency and keeps the link alive along the route.',relay:'Repeaters placed by the group maintain the connection through the protected areas.'},
 crew:{scoundrel:['SCOUNDREL // INFILTRATION','The Scoundrel conceals the drone for a stealthy approach.'],pilot:['PILOT // NAVIGATION','The Pilot takes control: faster flight, tighter turns and agile navigation.'],engineer:['ENGINEER // ACCESS','The Engineer uses their spotlight to hack the access and open the door.'],diplomat:['DIPLOMAT // COMMUNICATION','The Diplomat hijacks the guard’s radio and imitates station control. The guard replies, leaves his post, and the door opens.']}
};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motion.matches,userChoice=false,frameId=0,last=0;
const states=[...document.querySelectorAll('[data-drone-scene]')].map(el=>({el,type:el.dataset.droneScene,visible:false,time:0,mode:'jammed',role:'scoundrel',actors:Object.fromEntries([...el.querySelectorAll('[data-actor]')].map(a=>[a.dataset.actor,a])),images:[...el.querySelectorAll('[data-track]')],hud:el.querySelector('[data-scene-state]')}));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const set=(s,name,x,y,{flip=false,rotate=0,opacity=1}={})=>{
 const el=s.actors[name];if(!el)return;
 el.style.left=`${x}%`;el.style.top=`${y}%`;el.style.transform=`translate(-50%,-50%) rotate(${rotate}deg) scaleX(${flip?-1:1})`;el.style.opacity=opacity;
};
const say=(s,value)=>{if(s.hud&&s.hud.textContent!==value)s.hud.textContent=value;};
function sprite(image,name,n){
 const track=droneSprites[name];if(!track)return;
 const index=Math.max(0,Math.floor(n))%track.frames.length;
 const src=track.frames[index];if(image.getAttribute('src')!==src)image.setAttribute('src',src);
 if(track.sheet)image.parentElement.style.setProperty('--cx',String(track.crop[1]+index*64));
}
function render(s,time){
 const t=time/1000,bob=Math.sin(t*2.5)*2;
 s.images.forEach(img=>{if(s.type==='shared'&&img.dataset.track!=='scout')return;if(!['door','guard'].includes(img.dataset.track)&&!(s.type==='fragility'&&img.dataset.track==='scout'))sprite(img,img.dataset.track,time/170);});
 if(s.type==='hero'||s.type==='origin'){
  set(s,'scout',53+Math.sin(t*.65)*10,43+bob,{flip:true});set(s,'pod',76+Math.sin(t*.5)*6,68-bob);
  set(s,'pilot',20,77);say(s,words.pilot);
 }else if(s.type==='infiltration'){
  const p=(t%8)/8;
  const x=p<.55?15+p/.55*57:72;
  const y=p<.55?78:78-(p-.55)/.45*36;
  set(s,'spider',x,y,{flip:true,rotate:p<.55?0:-90});say(s,words.stealth);
 }else if(s.type==='recon'){
  const x=50+Math.sin(t*.7)*24;
  set(s,'scout',x,42+bob,{flip:Math.cos(t*.7)<0});
  positionDroneScan(s,x,42+bob,Math.cos(t*.7)<0);
  say(s,words.scan);
 }else if(s.type==='hauler'){
  const x=50+Math.sin(t*.55)*25;const y=40+bob;
  set(s,'pod',x,y,{flip:Math.cos(t*.55)<0});set(s,'crate',x,y+24);say(s,words.cargo);
 }else if(s.type==='problem'){
  set(s,'scout',21+Math.sin(t)*6,36+bob,{flip:true});say(s,words.one);
 }else if(s.type==='fragility'){
  const p=t%8.5;
  const shotAt=3.5,hitAt=3.66;
  const x=p<3?88-p/3*25:63;
  const w=s.el.clientWidth,h=s.el.clientHeight,heroW=Math.min(64,w*.14),heroH=heroW*28/21,gunW=heroW*.85,gunH=gunW*7/15;
  const floor=h-34,shotY=floor-heroH*.36,gunX=w*.17+heroW*.42+gunW*.25,muzzleX=gunX+gunW*.5;
  s.actors.pilot.style.width=heroW+'px';s.actors.gun.style.width=gunW+'px';s.actors.scout.style.width=Math.min(60,w*.14)+'px';
  const beamY=shotY/h*100;
  const dying=p>=hitAt;
  const deathFrame=Math.min(23,Math.floor(Math.max(0,p-hitAt)*11));
  // Keep the expanding death artwork and final debris above the floor.
  const scale=Math.min(60,w*.14)/31;
  const lift=dying?Math.max(0,shotY+(droneSprites.down.bottoms[deathFrame]-18)*scale-floor):0;
  set(s,'scout',x,beamY-lift/h*100,{flip:true,opacity:1});
  const drone=s.actors.scout?.querySelector('img');
  if(drone)sprite(drone,dying?'down':'scout',dying?deathFrame:time/170);
  set(s,'pilot',17,(floor-heroH/2)/h*100);set(s,'gun',gunX/w*100,(shotY+gunH*.25)/h*100);
  set(s,'muzzle',muzzleX/w*100,beamY,{opacity:p>=shotAt&&p<hitAt+.08?1:0});
  set(s,'beam',muzzleX/w*100+clamp((p-shotAt)/(hitAt-shotAt),0,1)*(63-muzzleX/w*100),beamY,{opacity:p>=shotAt&&p<hitAt?1:0});
  set(s,'impact',63,beamY,{opacity:p>=hitAt&&p<hitAt+.25?1:0});
  const focus=s.el.querySelector('.drone-focus');if(focus){focus.style.left=`${x}%`;focus.style.top='56%';focus.style.opacity=p>2.6&&p<shotAt?1:0;}
  say(s,p<2.6?words.patrol:p<shotAt?words.detected:p<hitAt+.3?words.fire:words.offline);
 }else if(s.type==='signal'){
  renderSignal(s,time);
 }else if(s.type==='shared'){
  renderShared(s,time,{set,sprite,say,words,paused,downBottoms:droneSprites.down.bottoms});
 }else if(s.type==='conclusion'){
  set(s,'pod',51+Math.sin(t*.6)*8,37+bob);say(s,words.together);
 }
}
function isRunning(){return !paused&&!document.hidden&&states.some(s=>s.visible);}
function tick(now){
 frameId=0;if(!isRunning()){last=0;return;}
 const dt=last?Math.min(60,now-last):0;last=now;
 for(const s of states){if(s.visible){s.time+=dt;render(s,s.time);}}
 frameId=requestAnimationFrame(tick);
}
function schedule(){if(isRunning()&&!frameId)frameId=requestAnimationFrame(tick);else if(!isRunning()){cancelAnimationFrame(frameId);frameId=0;last=0;}}
const toggle=document.querySelector('[data-drone-motion]');
function motionButton(){if(toggle){toggle.hidden=false;toggle.textContent=paused?words.play:words.pause;toggle.setAttribute('aria-pressed',String(!paused));}}
toggle?.addEventListener('click',()=>{userChoice=true;paused=!paused;motionButton();for(const s of states)if(['shared','signal'].includes(s.type))render(s,s.time);schedule();});
motion.addEventListener('change',()=>{if(!userChoice){paused=motion.matches;motionButton();for(const s of states)if(['shared','signal'].includes(s.type))render(s,s.time);schedule();}});
document.addEventListener('visibilitychange',schedule);
const warmed=new Set();
function warm(s){
 const names=new Set(s.images.map(img=>img.dataset.track));if(s.type==='fragility'||s.type==='shared')names.add('down');if(s.type==='shared')for(const n of ['guardRun','scoundrelRun','pilotRun','engineerRun','diplomatRun'])names.add(n);
 for(const name of names)for(const src of droneSprites[name]?.frames||[]){if(!warmed.has(src)){warmed.add(src);const image=new Image();image.src=src;}}
}
window.addEventListener('resize',()=>{for(const s of states)render(s,s.time||2000);});
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const s=states.find(s=>s.el===entry.target);if(s){s.visible=entry.isIntersecting;if(s.visible)warm(s);}}schedule();},{threshold:.03});
for(const s of states){
 render(s,s.type==='fragility'?3100:2000);observer.observe(s.el);
 const figure=s.el.closest('figure');
 if(s.type==='signal')setupSignal(s,figure,{isPaused:()=>paused,rerender:()=>render(s,s.time)});
 if(s.type==='shared')setupShared(s,figure,{isPaused:()=>paused,rerender:()=>render(s,s.time)});
 figure.querySelectorAll('[data-drone-controls]').forEach(el=>el.hidden=false);
}
motionButton();
document.querySelectorAll('[data-article-language]').forEach(a=>a.addEventListener('click',()=>{const target=new URL(a.href);target.hash=location.hash;a.href=target.href;}));
document.querySelector('[data-share-article]')?.addEventListener('click',async()=>{
 const out=document.querySelector('[data-share-status]'),url=new URL(location.pathname,location.origin).href;
 try{await navigator.clipboard.writeText(url);out.textContent=words.copied;}catch{out.textContent=`${words.link} ${url}`;}
});
