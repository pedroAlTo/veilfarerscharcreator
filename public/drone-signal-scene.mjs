import {evaluateDroneSignal, DRONE_SIGNAL_LABELS, DRONE_RANGES} from './drone-signal.mjs';
import {droneSprites} from './drone-sprites.mjs';

const modeNotes={
 en:{jammed:'An active jammer worsens signal by one step. With no preparation, the drone freezes when the link is Lost.',open:'An open route removes the jammer from this example. Distance alone still makes Very Far Unstable and Beyond Very Far Lost.',channel:'The crew has found a channel allowed through this protection. Distance still matters: an approved channel is not a range extender.',relay:'The drone routes through a surviving Relay Node. It improves signal by one step; it does not automatically bypass a sealed vault or Faraday cage.'},
 es:{jammed:'Un inhibidor activo empeora la señal un paso. Sin preparación, el dron se detiene cuando pierde la conexión.',open:'La ruta abierta elimina el inhibidor de este ejemplo. La distancia por sí sola vuelve Inestable la señal en Muy lejos y la pierde más allá.',channel:'El grupo ha encontrado un canal permitido a través de esta protección. La distancia sigue contando: un canal permitido no amplía el alcance.',relay:'El dron se comunica a través de un repetidor operativo. Mejora la señal un paso; no atraviesa automáticamente una cámara sellada o una jaula de Faraday.'},
};
const position=(actor,x,y,flip=false)=>{if(actor){actor.style.left=`${x}%`;actor.style.top=`${y}%`;actor.style.transform=`translate(-50%,-50%) scaleX(${flip?-1:1})`;}};
const text=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};
const getModel=(mode,index)=>evaluateDroneSignal({range:DRONE_RANGES[index],obstruction:index>=3&&mode!=='open'?'jamming':'none',protectionCountered:mode==='channel',relay:mode==='relay'});

export function setupSignal(s,figure,context={}) {
 const panel=figure.querySelector('[data-signal-panel]');
 if(!panel)return;
 const language=panel.dataset.language==='es'?'es':'en';
 s.signalUI={language,panel,isPaused:context.isPaused||(()=>false),replay:panel.querySelector('[data-signal-replay]'),replayLabel:panel.querySelector('[data-signal-replay-label]'),range:panel.querySelector('[data-signal-range]'),state:panel.querySelector('[data-signal-state-text]'),rangeText:panel.querySelector('[data-signal-range-text]'),effect:panel.querySelector('[data-signal-effect]'),readout:panel.querySelector('[data-signal-readout]'),explanation:panel.querySelector('[data-signal-explanation]'),freeze:s.el.querySelector('[data-signal-freeze]'),link:s.el.querySelector('[data-signal-command-link]')};
 s.signalPreparation='jammed';
 s.signalManual=null;
 const refresh=()=>{if(context.rerender)context.rerender();else renderSignal(s,s.time||0);};
 panel.querySelector('[data-drone-controls]')?.removeAttribute('hidden');
 s.signalUI.range.addEventListener('input',event=>{
  s.signalManual=Number(event.target.value);
  refresh();
 });
 panel.querySelectorAll('[data-signal-preparation]').forEach(button=>button.addEventListener('click',()=>{
  s.signalPreparation=button.dataset.signalPreparation;
  s.el.dataset.signalPreparation=s.signalPreparation;
  panel.querySelectorAll('[data-signal-preparation]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  text(s.signalUI.explanation,modeNotes[language][s.signalPreparation]);
  if(s.signalManual===null)s.time=0;
  refresh();
 }));
 panel.querySelector('[data-signal-replay]').addEventListener('click',()=>{
  s.signalManual=null;s.time=0;refresh();
 });
 renderSignal(s,s.time||0);
}

export function renderSignal(s,time) {
 const ui=s.signalUI;
 const labels=DRONE_SIGNAL_LABELS[ui?.language||(document.documentElement.lang==='es'?'es':'en')];
 const mode=s.signalPreparation||'jammed';
 const stopBand=mode==='jammed'?4:5;
 const flightDuration=stopBand*1800,loopDuration=flightDuration+3400;
 const cycle=time%loopDuration;
 const progress=s.signalManual??Math.min(stopBand,cycle/1800);
 const index=Math.min(5,Math.floor(progress+1e-7));
 const model=getModel(mode,index);
 const x=12+progress*15.2;
 const y=54+(model.state==='lost'?0:Math.sin(time/440)*1.2);
 position(s.actors.scout,x,y,false);
 position(s.actors['signal-relay'],47,77);
 if(s.actors['signal-relay'])s.actors['signal-relay'].style.opacity=mode==='relay'?'1':'0';
 const img=s.actors.scout?.querySelector('img');
 if(img){const frames=droneSprites.scout.frames,src=frames[model.state==='lost'?0:Math.floor(time/170)%frames.length];if(img.getAttribute('src')!==src)img.setAttribute('src',src);}
 s.el.dataset.signalQuality=model.state;
 s.el.dataset.signalPreparation=mode;
 if(s.hud)text(s.hud,`${labels.range[DRONE_RANGES[index]].toUpperCase()} // ${labels.state[model.state].toUpperCase()}`);
 const zone=s.el.querySelector('[data-signal-zone-name]'),kind=s.el.querySelector('[data-signal-zone-kind]');
 const es=labels===DRONE_SIGNAL_LABELS.es;
 text(zone,mode==='open'?(es?'RUTA ABIERTA':'OPEN ROUTE'):(es?'ÁREA PROTEGIDA':'PROTECTED AREA'));
 text(kind,mode==='open'?(es?'SIN INHIBIDOR':'NO JAMMER'):mode==='channel'?(es?'CANAL PERMITIDO':'ALLOWED CHANNEL'):(es?'INHIBIDOR ACTIVO':'ACTIVE JAMMER'));
 if(!ui)return;
 ui.readout.dataset.quality=model.state;
 const paused=ui.isPaused();
 ui.replay.disabled=paused;
 text(ui.replayLabel,paused?(es?'Vuelo en pausa':'Flight paused'):(es?'Repetir vuelo':'Replay flight'));
 ui.replay.title=paused?(es?'Activa las animaciones o utiliza el control de alcance.':'Enable animations or use the range control.'):'';
 text(ui.state,labels.state[model.state]);
 text(ui.rangeText,labels.range[DRONE_RANGES[index]]);
 text(ui.effect,labels.effect[model.state]);
 if(document.activeElement!==ui.range)ui.range.value=String(index);
 ui.range.setAttribute('aria-valuetext',`${labels.range[DRONE_RANGES[index]]}: ${labels.state[model.state]}`);
 ui.freeze.hidden=model.state!=='lost';
 ui.freeze.style.left=`${Math.min(76,x)}%`;
 ui.link.style.width=`${Math.max(0,x-10)}%`;
}
