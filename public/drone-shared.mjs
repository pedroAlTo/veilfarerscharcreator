import {createNeuralPuzzle,chooseNeuralRole,advanceNeuralPuzzle,NEURAL_PUZZLE_ROLES as roles} from './drone-neural-puzzle.mjs?v=20260928-1';
import {NEURAL_COPY} from './drone-neural-copy.mjs?v=20260928-1';
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const mix=(a,b,t)=>a+(b-a)*clamp(t);

// Paired headlights bob one pixel with the four idle frames; source crop (22,3,31,30).
export function positionDroneScan(s,x,y,flip=false,opacity=.7) {
 const scan=s.el.querySelector('.drone-scan'),drone=s.actors.scout;if(!scan||!drone)return;
 const w=s.el.clientWidth,h=s.el.clientHeight,dw=drone.offsetWidth,dh=dw*30/31;
 const frame=Number(drone.querySelector('img')?.getAttribute('src')?.match(/Idle_(\d+)\.png/)?.[1]||1)-1;
 const lampY=[23,24,23,22][frame%4],lampOffset=(22/31-.5)*dw*(flip?-1:1);
 const left=x/100*w+lampOffset,top=y/100*h+((lampY-3)/30-.5)*dh;
 scan.style.left=`${left}px`;scan.style.top=`${top}px`;scan.style.height=`${Math.max(0,h-34-top)}px`;scan.style.width=`${Math.min(110,w*.27)}px`;scan.style.opacity=opacity;
}

export function neuralSceneFrame(p,time) {
 const a=p.pending||p.lastAction,t=(a?.elapsed||0)/1000,kind=a?.kind;
 const f={x:p.step===0?17:p.step===1?39:81,opacity:p.cameraMethod==='stealth'?.16:1,flip:false,door:p.step===5?7:0,guardX:75,guardVisible:p.step<4,guardWalking:false,guardFlip:true,hack:p.step===3?'radio-linked':null,alert:false,speech:null,cameraOff:p.cameraMethod==='hack',gates:[0,0,0]};
 if(p.pending){
  if(kind==='camera-stealth'||kind==='camera-hack'){
   f.x=mix(17,39,(t-1.2)/1.3);
   if(kind==='camera-stealth')f.opacity=mix(1,.16,t/.55);
   else{f.hack=t<1.55?'camera':null;f.cameraOff=t>=1.3;}
  }
  if(kind==='wrong-camera'){f.x=17+Math.sin(Math.PI*clamp(t/1.9))*10;f.flip=t>.95&&t<1.9;}
  if(kind==='wrong-timing'){f.x=39+Math.sin(Math.PI*clamp(t/2))*2;f.flip=t>1&&t<2;}
  if(kind==='shutters')f.x=mix(39,81,(t-.4)/3.2);
  if(kind==='radio-hack')f.hack='radio';
  if(kind==='door-hack'){f.hack=t<1.6?'door':null;f.door=Math.floor(clamp((t-1.25)/.8)*7);}
  if(kind==='dismiss'){
   f.speech=t>=.7&&t<6.5?'order':t>=6.5&&t<9?'answer':t>=9?'departure':null;
   f.guardWalking=t>=9;f.guardFlip=t<9;f.guardX=mix(75,112,(t-9)/5.5);
  }
  if(kind==='door-guard'||kind==='door-first'){
   f.hack=t<1.4?'door':null;
   f.door=t<4.4?Math.floor(clamp((t-.8)/.8)*7):Math.floor((1-clamp((t-4.4)/.65))*7);
   f.alert=t>=1.6&&t<3.3;f.speech=t>=1.6&&t<3.3?'alarm':t>=6.6?'wind':null;
   if(t>=3.3&&t<4.4){f.guardX=mix(75,84,(t-3.3)/1.1);f.guardWalking=true;f.guardFlip=false;}
   else if(t>=4.4&&t<5.1){f.guardX=84;f.guardFlip=false;}
   else if(t>=5.1&&t<6.6){f.guardX=mix(84,75,(t-5.1)/1.5);f.guardWalking=true;f.guardFlip=true;}
   else if(t>=1.6&&t<3.3)f.guardFlip=false;
  }
 }
 if(!p.pending&&['door-guard','door-first'].includes(kind))f.speech='wind';
 f.gates=[46,59,72].map((x,i)=>{
  // The pilot's burst crosses each shutter only inside its open interval.
  if(p.pending?.kind==='shutters')return clamp((14-Math.abs(f.x-x))/5);
  const phase=(time/1000+i*.7)%3.6;return phase<1.0?1:phase<1.4?1-(phase-1)/.4:phase<3.1?0:(phase-3.1)/.5;
 });
 return f;
}

export const NEURAL_AWARD_HOLD_MS=17000;
const epilogueLineDurations=[3400,2700,2800,2600,2500,2700,3200,2600];
const dialogueEnd=NEURAL_AWARD_HOLD_MS+epilogueLineDurations.reduce((sum,n)=>sum+n,0);
export function neuralEpilogueFrame(elapsedMs){
 const t=Math.max(0,elapsedMs);
 if(t<NEURAL_AWARD_HOLD_MS)return {phase:'award',lineIndex:-1,door:7,shots:[]};
 if(t<dialogueEnd){
  let offset=t-NEURAL_AWARD_HOLD_MS,lineIndex=0;
  while(offset>=epilogueLineDurations[lineIndex])offset-=epilogueLineDurations[lineIndex++];
  return {phase:'dialogue',lineIndex,door:7,shots:[]};
 }
 const volleyT=t-dialogueEnd;
 if(volleyT<1950){
  const shots=[0,350,700,160,560,950].map((delay,i)=>{
   const missile=i<3,duration=missile?620:280;
   return {kind:missile?'missile':'laser',progress:clamp((volleyT-delay)/duration),active:volleyT>=delay&&volleyT<delay+duration,index:i};
  });
  return {phase:'volley',lineIndex:-1,door:7,shots};
 }
 const crashT=volleyT-1950;
 if(crashT<3900)return {phase:'crash',lineIndex:-1,door:7,shots:[],crashProgress:clamp(crashT/1600),broken:crashT>=1600,deathFrame:Math.min(23,Math.floor(Math.max(0,crashT-1600)/1000*11))};
 const closeT=crashT-3900;
 if(closeT<1200)return {phase:'closing',lineIndex:-1,door:Math.round(7*(1-clamp(closeT/950))),shots:[]};
 if(closeT<4400)return {phase:'curse',lineIndex:-1,door:0,shots:[]};
 return {phase:'complete',lineIndex:-1,door:0,shots:[]};
}

export function setupShared(s,figure,context){
 s.puzzle=createNeuralPuzzle();s.sharedLastTime=s.time;s.exitStarted=null;s.exitFinished=false;
 s.sharedUI={figure,context,u:NEURAL_COPY[document.documentElement.lang==='es'?'es':'en'],buttons:[...figure.querySelectorAll('[data-crew]')],thought:figure.querySelector('[data-neural-thought]'),selector:figure.querySelector('[data-neural-selector]'),status:figure.querySelector('[data-neural-status]'),transcript:figure.querySelector('[data-radio-transcript]'),epilogue:figure.querySelector('[data-epilogue-transcript]')};
 for(const button of s.sharedUI.buttons)button.addEventListener('click',()=>{
  const next=chooseNeuralRole(s.puzzle,button.dataset.crew);if(next===s.puzzle)return;
  s.puzzle=next;s.role=next.role;if(next.pending?.kind==='dismiss')s.departureLine=Math.floor(Math.random()*3);s.sharedLastTime=s.time;
  if(context.isPaused()&&s.puzzle.pending)s.puzzle=advanceNeuralPuzzle(s.puzzle,s.puzzle.pending.duration);
  context.rerender();
 });
 figure.querySelector('[data-neural-reset]').addEventListener('click',()=>{
  s.puzzle=createNeuralPuzzle();s.role=null;s.exitStarted=null;s.exitFinished=false;s.sharedLastTime=s.time;s.radioHeard=false;s.departureLine=0;s.sharedUI.transcript.querySelector('details').open=false;s.sharedUI.epilogue.querySelector('details').open=false;context.rerender();
 });
 context.rerender();
}

export function renderShared(s,time,{set,sprite,say,paused=false,downBottoms}) {
 const ui=s.sharedUI;if(!ui)return;
 const dt=Math.max(0,time-s.sharedLastTime);s.sharedLastTime=time;
 s.puzzle=advanceNeuralPuzzle(s.puzzle,dt);
 const p=s.puzzle,f=neuralSceneFrame(p,time),a=p.pending||p.lastAction,u=ui.u;
 const w=s.el.clientWidth,h=s.el.clientHeight,floor=h-34,ductY=114,ductH=76;
 s.el.dataset.puzzleStage=p.stage;s.el.dataset.puzzleBusy=String(Boolean(p.pending));s.el.dataset.cameraMethod=p.cameraMethod||'';
 const actor=(name,x,y,opts={})=>set(s,name,x,y/h*100,opts);
 if(p.stage==='done'&&s.exitStarted===null){
  s.exitStarted=time;
  s.el.scrollIntoView({block:'start',behavior:paused?'auto':'smooth'});
 }
 if(p.stage==='done'&&(paused||(time-s.exitStarted)>=3500))s.exitFinished=true;
 const exitT=p.stage==='done'?(s.exitFinished?5:(time-s.exitStarted)/1000):-1;
 const ep=p.stage==='done'?neuralEpilogueFrame(time-s.exitStarted):null;
 s.el.dataset.epilogue=ep?.phase||'';
 const hatchOpen=exitT<0?0:clamp(exitT/.45)*(1-clamp((exitT-1.3)/.4));
 s.el.querySelector('.neural-floor-grille').style.transform='rotate('+(-78*hatchOpen)+'deg)';
 s.el.querySelector('[data-neural-floor-vent]').dataset.open=String(hatchOpen>.05);
 const doorFlightY=floor-Math.min(150,w*.29)*48/64*.55;
 let droneX=exitT<0?f.x:mix(81,86,(exitT-2.1)/1.1);
 let droneY=exitT<0?ductY:mix(ductY,doorFlightY,(exitT-.45)/1.45);
 let droneOpacity=exitT<0?f.opacity:exitT>=3.2?0:mix(f.opacity,1,exitT/.35);
 const droneW=Math.min(36,w*.084);
 if(ep?.phase==='crash'){
  droneX=mix(86,43,ep.crashProgress);
  droneY=floor-droneW*.5-Math.sin(Math.PI*ep.crashProgress)*Math.min(125,h*.29);
  if(ep.broken){const scale=droneW/31;droneY-=Math.max(0,droneY+(downBottoms[ep.deathFrame]-18)*scale-floor);}
  droneOpacity=1;
 }else if(ep&&['closing','curse','complete'].includes(ep.phase)){
  droneX=43;droneY=floor-droneW*.5;
  const scale=droneW/31;droneY-=Math.max(0,droneY+(downBottoms[23]-18)*scale-floor);
  droneOpacity=1;
 }
 s.actors.scout.style.width=droneW+'px';actor('scout',droneX,droneY,{opacity:droneOpacity,flip:ep?.phase==='crash'||ep?.phase==='closing'||ep?.phase==='curse'||ep?.phase==='complete',rotate:ep?.phase==='crash'&&!ep.broken?ep.crashProgress*720:0});
 if(ep?.phase==='crash'&&ep.broken)sprite(s.actors.scout.querySelector('img'),'down',ep.deathFrame);
 else if(ep&&['closing','curse','complete'].includes(ep.phase))sprite(s.actors.scout.querySelector('img'),'down',23);
 else sprite(s.actors.scout.querySelector('img'),'scout',time/170);
 const award=s.el.querySelector('[data-neural-award]');award.hidden=ep?.phase!=='award';
 const wreck=s.el.querySelector('[data-neural-wreck]');wreck.hidden=!(ep?.phase==='crash'&&ep.broken&&ep.deathFrame<13);wreck.style.left=droneX+'%';wreck.style.top=(floor-droneW*.55)+'px';
 for(const img of s.el.querySelectorAll('[data-neural-shot]')){
  const shot=ep?.shots[Number(img.dataset.neuralShot)];img.hidden=!shot?.active;
  if(shot?.active){img.style.left=mix(84,-6,shot.progress)+'%';img.style.top=(floor-54+(shot.index%2?18:-9))+'px';img.dataset.kind=shot.kind;}
 }
 [46,59,72].forEach((x,i)=>{const el=s.actors['shutter'+(i+1)];el.style.width=ductH*16/58+'px';actor('shutter'+(i+1),x,ductY);sprite(el.querySelector('img'),'shutter',Math.round(2+f.gates[i]*4));});
 const camera=s.el.querySelector('[data-neural-camera]'),cone=s.el.querySelector('[data-neural-camera-zone]');
 camera.dataset.off=String(f.cameraOff);cone.style.opacity=f.cameraOff?'0':'.55';
 const coverW=Math.min(142,w*.36),coverH=coverW*.5,crewW=Math.min(30,w*.071),crewH=crewW*28/20;
 s.actors.cover.style.width=coverW+'px';actor('cover',20,floor-coverH/2);

 roles.forEach((name,i)=>{
  const startX=20+(i-1.5)*crewW*.88/w*100,run=exitT-(3-i)*.28,progress=clamp(run/2.65),x=mix(startX,86,progress);
  const restingY=floor-coverH+crewH*.14,runningY=floor-crewH/2;
  const y=run>=0?mix(restingY,runningY,run/.2):restingY;
  s.actors[name].style.width=crewW+'px';actor(name,x,y,{opacity:progress===1?0:1});
  sprite(s.actors[name].querySelector('img'),run>=0?name+'Run':name,time/(run>=0?90:170));
 });
 const doorW=Math.min(150,w*.29),doorH=doorW*48/64;s.actors.door.style.width=doorW+'px';actor('door',86,floor-doorH/2);sprite(s.actors.door.querySelector('img'),'door',ep?ep.door:f.door);
 const guardW=Math.min(42,w*.105),guardH=guardW*29/19,guardY=floor-guardH/2;
 s.actors.guard.style.width=guardW+'px';actor('guard',f.guardX,guardY,{flip:f.guardFlip,opacity:f.guardVisible?1:0});
 sprite(s.actors.guard.querySelector('img'),f.guardWalking?'guardRun':'guard',time/(f.guardWalking?100:170));
 const gunW=guardW*.8,gunH=gunW*7/15,dir=f.guardFlip?-1:1;
 s.actors.guardGun.style.width=gunW+'px';actor('guardGun',f.guardX+dir*(guardW*.22+gunW*.2)/w*100,floor-guardH*.37+gunH*.25,{flip:f.guardFlip,opacity:f.guardVisible?1:0});
 const panel=s.el.querySelector('[data-neural-panel]');panel.style.left='89%';panel.style.top=(floor-guardH*.68)+'px';panel.dataset.open=String((ep?ep.door:f.door)===7);
 const alert=s.el.querySelector('[data-neural-alert]');alert.hidden=!f.alert;alert.style.left=f.guardX+'%';alert.style.top=(floor-guardH-25)+'px';
 const hack=s.el.querySelector('[data-neural-hack]');hack.hidden=!f.hack;
 if(f.hack){
  const targets={camera:[w*.32,84],radio:[w*f.guardX/100,floor-guardH*.82],'radio-linked':[w*f.guardX/100,floor-guardH*.82],door:[w*.89,floor-guardH*.6]},[bx,by]=targets[f.hack],ax=w*f.x/100,ay=ductY;
  hack.style.left=ax+'px';hack.style.top=ay+'px';hack.style.width=Math.hypot(bx-ax,by-ay)+'px';hack.style.transform=`rotate(${Math.atan2(by-ay,bx-ax)}rad)`;hack.style.opacity=.55+Math.sin(time/75)*.35;hack.dataset.target=f.hack;
 }
 const channel=s.el.querySelector('[data-neural-channel]'),connecting=p.pending?.kind==='radio-hack',connected=p.step>=3;
 channel.hidden=p.stage==='done'||(!connecting&&!connected);channel.dataset.state=connected?'connected':'connecting';channel.querySelector('[data-neural-channel-text]').textContent=connected?u.connected:u.connecting;
 const speechText=f.speech==='departure'?u.departures[s.departureLine||0]:u[f.speech];
 const departure=ui.transcript.querySelector('[data-departure-transcript]');departure.hidden=f.speech!=='departure'&&p.lastAction?.kind!=='dismiss';departure.textContent=u.guard+': '+u.departures[s.departureLine||0];
 const dialog=s.el.querySelector('[data-neural-dialogue]');
 const epLine=ep?.phase==='dialogue'?u.lines[ep.lineIndex]:null;
 const epCurse=ep?.phase==='curse';
 dialog.hidden=!f.speech&&!epLine&&!epCurse;
 if(epLine||epCurse){
  const speaker=epCurse?'all':epLine[0],line=epCurse?u.curse:epLine[1];
  dialog.style.bottom=(h-floor+guardH+19)+'px';
  const bubble=dialog.querySelector('.drone-bubble');bubble.style.setProperty('--bubble-tail','88%');
  dialog.querySelector('[data-neural-speaker]').textContent=speaker==='enemy'?u.enemy:speaker==='all'?u.all:u.crew[roles.indexOf(speaker)];
  dialog.querySelector('[data-neural-speech]').textContent='“'+line+'”';
  dialog.dataset.voice=speaker==='enemy'?'enemy':speaker==='all'?'all':'crew';
 }else if(f.speech){
  dialog.style.bottom=(h-floor+guardH+17+(f.alert?30:0))+'px';
  const bubble=dialog.querySelector('.drone-bubble');bubble.style.setProperty('--bubble-tail',`${clamp((w*f.guardX/100-dialog.offsetLeft)/dialog.offsetWidth*100,8,92)}%`);
  dialog.querySelector('[data-neural-speaker]').textContent=f.speech==='order'?u.radio:u.guard;
  dialog.querySelector('[data-neural-speech]').textContent='“'+speechText+'”';
  dialog.dataset.voice=f.speech==='order'?'radio':'guard';
  if(f.speech==='order')s.radioHeard=true;
 }
 if(p.lastAction?.kind==='dismiss'&&!s.radioHeard){s.radioHeard=true;if(paused)ui.transcript.querySelector('details').open=true;}
 const hint=u.thoughts[a?.kind];ui.thought.hidden=!hint;
 if(hint){
  if(ui.thought.textContent!==hint)ui.thought.textContent=hint;
  const button=ui.buttons.find(b=>b.dataset.crew===p.role),br=button.getBoundingClientRect(),sr=ui.selector.getBoundingClientRect();
  const anchor=br.left+br.width/2-sr.left,bw=Math.min(350,sr.width-24),left=clamp(anchor-bw/2,12,sr.width-bw-12);
  ui.thought.style.width=bw+'px';ui.thought.style.left=left+'px';ui.thought.style.setProperty('--thought-tail',(anchor-left)+'px');
 }
 for(const button of ui.buttons){button.setAttribute('aria-pressed',String(button.dataset.crew===p.role));button.setAttribute('aria-disabled',String(Boolean(p.pending)));}
 const status=epCurse?u.curse:epLine?epLine[1]:ep?.phase==='award'?u.award:ep?.phase==='crash'?u.ambush:f.speech?speechText:hint||(exitT>=3.5?u.done:p.pending?u.busy:u.results[p.lastAction?.kind]||u.ready);
 if(ui.status.textContent!==status)ui.status.textContent=status;
 ui.transcript.hidden=!s.radioHeard;
 ui.epilogue.hidden=p.stage!=='done';
 say(s,p.role?u.crew[roles.indexOf(p.role)].toUpperCase():u.hub);
}
