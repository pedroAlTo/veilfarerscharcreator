import { stationWindows } from './station-windows.mjs?v=20260912-3';
export function lampLevel(age, seed, reduced=false) {
 if(reduced) return 1;
 const t=age-(seed%7)*.065;
 if(t<0) return 0;
 if(t<.35) return .65*t/.35;
 if(t<.65) return .08;
 if(t<1.05) return .82*(t-.65)/.4;
 if(t<1.35) return .15;
 if(t<1.7) return .15+.8*(t-1.35)/.35;
 const pulse=.88+.09*Math.sin(t*1.25+seed*2.4);
 const phase=(t+seed*3.73)%(17+seed%13);
 return pulse*(phase<.32 ? .15+.85*Math.abs(phase-.16)/.16 : 1);
}
export function fadingLevel(initial,elapsed) {
 const t=Math.max(0,Math.min(1,elapsed/1.1));
 return initial*(1-t*t*(3-2*t));
}
export function setupStationLights(element) {
 const svg=element.querySelector('[data-station-lights]');
 if(!svg) return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const sectors=Object.fromEntries(Object.entries(stationWindows).map(([sector,windows])=>{
  const lamps=[];
  for(const points of windows) {
   const dot=document.createElementNS('http://www.w3.org/2000/svg','polygon');
   dot.setAttribute('points',points);dot.setAttribute('data-window-sector',sector);
   dot.setAttribute('class','hv-station-lamp');dot.style.opacity='0';
   svg.append(dot);lamps.push({dot,level:0,from:0,seed:lamps.length});
  }
  return [sector,{lamps,start:0,active:false}];
 }));
 let selected='',frame=0,visible=false,time=0,previous=0;
 function paint() {
  for(const state of Object.values(sectors)) for(const lamp of state.lamps) {
   lamp.level=motion.matches?Number(state.active):state.active?lampLevel(time-state.start,lamp.seed):fadingLevel(lamp.from,time-state.start);
   lamp.dot.style.opacity=lamp.level.toFixed(3);
  }
 }
 function tick(now) {
  frame=0;if(!visible||document.hidden||motion.matches)return;
  if(previous)time+=Math.min((now-previous)/1000,.1);
  previous=now;paint();frame=requestAnimationFrame(tick);
 }
 function sync() {
  cancelAnimationFrame(frame);frame=0;previous=0;paint();
  if(visible&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick);
 }
 element.addEventListener('vf:station-sector',event=>{
  const sector=event.detail;if(!sectors[sector]||sector===selected)return;
  paint();selected=sector;
  for(const [id,state] of Object.entries(sectors)) {
   state.active=id===sector;state.start=time;
   for(const lamp of state.lamps)lamp.from=lamp.level;
  }
  sync();
 });
 if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(element);
 else {visible=true;sync();}
 motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));window.addEventListener('pageshow',sync);
}
