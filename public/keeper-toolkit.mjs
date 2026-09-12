import {setupBookIllustrations} from './book-illustrations.mjs?v=20260912-1';
const dialog=setupBookIllustrations();
const clock=document.querySelector('[data-keeper-clock]');
if(clock){
  const display=clock.querySelector('.bc-clock-display');
  const slider=clock.querySelector('input');
  const segments=[...clock.querySelectorAll('.bc-clock-segment')];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,automatic=!motion.matches,elapsed=0,last=0,frame=0;
  function paint(value){
    const filled=Math.max(0,Math.min(6,Math.floor(value)));
    display.dataset.clockValue=String(filled);
    display.setAttribute('aria-label',`Reactor Meltdown example: ${filled} of 6 segments filled.`);
    segments.forEach((segment,i)=>segment.classList.toggle('is-filled',i<filled));
    const color=filled===6?'#f4493d':filled>=4?'#ee9c53':filled?'#d9b979':'#91b5c5';
    display.style.setProperty('--clock-color',color);
    display.style.setProperty('--clock-glow',String(Math.max(0,(filled-3)/3)));
    clock.querySelector('[data-clock-count]').textContent=`${filled} / 6`;
    clock.querySelector('[data-clock-state]').textContent=filled===6?'Reactor meltdown':filled>=4?'Critical pressure':filled?'Pressure rising':'Reactor contained';
    slider.value=String(filled);slider.setAttribute('aria-valuetext',`${filled} of 6 segments. ${filled===6?'Reactor meltdown.':'Reactor meltdown clock.'}`);
  }
  function tick(time){
    if(last)elapsed+=Math.min(100,time-last);last=time;
    paint(Math.max(0,Math.floor((elapsed-500)/1150)));
    if(elapsed<7700)frame=requestAnimationFrame(tick);else{frame=0;automatic=false;}
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(automatic&&visible&&!document.hidden&&!motion.matches&&!dialog?.open)frame=requestAnimationFrame(tick);}
  function stop(){automatic=false;sync();}
  slider.addEventListener('pointerdown',stop);slider.addEventListener('keydown',stop);
  slider.addEventListener('input',()=>{stop();paint(Number(slider.value));});
  clock.querySelector('button').addEventListener('click',()=>{if(motion.matches)return;elapsed=0;automatic=true;paint(0);sync();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.3}).observe(display);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',()=>{if(motion.matches)stop();else sync();});
  if(dialog)new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
  paint(0);document.body.classList.add('has-keeper-clock');
}
