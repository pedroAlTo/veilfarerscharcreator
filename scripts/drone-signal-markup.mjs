import {DRONE_SIGNAL_LABELS, DRONE_SIGNAL_SOURCE, DRONE_RANGES} from '../public/drone-signal.mjs';

const copy = {
 en: {
  controls:'Explore the signal', distance:'Distance from operator', prep:'Prepare the connection',
  modes:['Unprepared','Open route','Allowed channel','Relay Node'],
  operator:'OPERATOR', protected:'PROTECTED AREA', jammer:'ACTIVE JAMMER', open:'OPEN ROUTE',
  state:'SIGNAL', range:'RANGE', replay:'Replay flight',
  instructions:'Drag the range control to explore a position, or replay the flight. Range bands are narrative distances, not a measurement in metres.',
  caption:'Direct RF is Stable nearby. At Far, the protected area’s active jammer makes it Unstable. At Very Far, distance and jamming combine: the link is Lost and the drone follows its Freeze protocol.',
  source:'Corebook 12.06 · pp. 137–140',
  notes:{jammed:'An active jammer worsens signal by one step. With no preparation, the drone freezes when the link is Lost.',open:'An open route removes the jammer from this example. Distance alone still makes Very Far Unstable and Beyond Very Far Lost.',channel:'The crew has found a channel allowed through this protection. Distance still matters: an approved channel is not a range extender.',relay:'The drone routes through a surviving Relay Node. It improves signal by one step; it does not automatically bypass a sealed vault or Faraday cage.'},
 },
 es: {
  controls:'Explora la señal', distance:'Distancia del operador', prep:'Prepara la conexión',
  modes:['Sin preparar','Ruta abierta','Canal permitido','Repetidor'],
  operator:'OPERADOR', protected:'ÁREA PROTEGIDA', jammer:'INHIBIDOR ACTIVO', open:'RUTA ABIERTA',
  state:'SEÑAL', range:'ALCANCE', replay:'Repetir vuelo',
  instructions:'Mueve el control de alcance para explorar una posición o repite el vuelo. Las bandas son distancias narrativas, no una medida en metros.',
  caption:'El enlace RF directo es Estable de cerca. En Lejos, el inhibidor del área protegida lo vuelve Inestable. En Muy lejos se combinan distancia e interferencia: la señal se pierde y el dron sigue su protocolo de Detenerse.',
  source:'Corebook 12.06 · págs. 137–140',
  notes:{jammed:'Un inhibidor activo empeora la señal un paso. Sin preparación, el dron se detiene cuando pierde la conexión.',open:'La ruta abierta elimina el inhibidor de este ejemplo. La distancia por sí sola vuelve Inestable la señal en Muy lejos y la pierde más allá.',channel:'El grupo ha encontrado un canal permitido a través de esta protección. La distancia sigue contando: un canal permitido no amplía el alcance.',relay:'El dron se comunica a través de un repetidor operativo. Mejora la señal un paso; no atraviesa automáticamente una cámara sellada o una jaula de Faraday.'},
 },
};

export function signalMarkup(lang, actor) {
 const language=lang==='es'?'es':'en', u=copy[language], labels=DRONE_SIGNAL_LABELS[language];
 const body=`<div class="signal-protected"><span data-signal-zone-name>${u.protected}</span><b data-signal-zone-kind>${u.jammer}</b></div><div class="signal-perimeter"></div><div class="signal-flight-path"></div><div class="signal-command-link" data-signal-command-link></div><span class="signal-operator-pulse"></span>${actor('operator','pilot',10,78,'is-hero')}${actor('scout','scout',12,54,'signal-scout')}${actor('signal-relay','terminal',47,77,'is-prop signal-relay','opacity:0;')}<span class="signal-operator-label">${u.operator}</span><span class="signal-freeze-tag" data-signal-freeze hidden>${language==='es'?'PROTOCOLO: DETENERSE':'PROTOCOL: FREEZE'}</span>`;
 const controls=`<div class="signal-panel" data-signal-panel data-language="${language}"><div class="signal-readout" data-signal-readout data-quality="stable"><div class="signal-reading"><span class="signal-mini-label">${u.state}</span><div><span class="signal-meter" aria-hidden="true"><i></i><i></i></span><strong data-signal-state-text>${labels.state.stable}</strong></div></div><div class="signal-reading"><span class="signal-mini-label">${u.range}</span><strong data-signal-range-text>${labels.range.close}</strong></div></div><p class="signal-effect" data-signal-effect>${labels.effect.stable}</p><div class="signal-interactions" data-drone-controls hidden><label class="signal-distance"><span>${u.distance}</span><input type="range" min="0" max="5" step="1" value="2" aria-valuetext="${labels.range.close}" data-signal-range></label><div class="signal-range-ends" aria-hidden="true"><span>${labels.range.melee}</span><span>${labels.range.beyond}</span></div><span class="signal-mini-label">${u.prep}</span><div class="signal-choices" role="group" aria-label="${u.prep}">${['jammed','open','channel','relay'].map((mode,i)=>`<button type="button" data-signal-preparation="${mode}" aria-pressed="${i===0}">${u.modes[i]}</button>`).join('')}</div><button type="button" class="signal-replay" data-signal-replay><span data-signal-replay-label>${u.replay}</span> <span aria-hidden="true">↻</span></button><p class="signal-instructions">${u.instructions}</p></div><p class="signal-explanation" data-signal-explanation>${u.notes.jammed}</p><a class="signal-source" href="${DRONE_SIGNAL_SOURCE.url}" target="_blank" rel="noopener">${u.source} ↗</a></div>`;
 return {body,controls,caption:u.caption,state:labels.state.stable.toUpperCase(),attrs:'data-signal-preparation="jammed"'};
}

export {copy as signalCopy};
