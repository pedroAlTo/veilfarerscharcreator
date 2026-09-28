/** Drone signal: Corebook 12.06, pp. 137–140.
 * Range bands and signal states are discrete. This is not a radio-strength percentage.
 * `relay` means the drone is actually routed through a surviving Relay Node.
 * `protectionCountered` means this specific obstruction has been bypassed in the fiction.
 * Shielded compartments require the Keeper to declare Unstable or Lost before deployment.
 */
export const DRONE_SIGNAL_SOURCE = Object.freeze({
  book: 'VeilFarers Corebook', version: '12.06', pages: [137, 138, 140],
  url: '/download/VeilFarers_Corebook_12.06.pdf#page=137',
});

export const DRONE_RANGES = Object.freeze(['melee', 'very-close', 'close', 'far', 'very-far', 'beyond']);
export const DRONE_SIGNAL_STATES = Object.freeze(['stable', 'unstable', 'lost']);
export const DRONE_SIGNAL_LABELS = Object.freeze({
  en: {
    range: {melee: 'Melee', 'very-close': 'Very Close', close: 'Close', far: 'Far', 'very-far': 'Very Far', beyond: 'Beyond Very Far'},
    state: {stable: 'Stable', unstable: 'Unstable', lost: 'Lost'},
    effect: {
      stable: 'The drone works normally.',
      unstable: 'Simple commands work normally. Complex commands roll with Disadvantage.',
      lost: 'The drone follows its loaded protocol. Without one, it freezes until signal returns.',
    },
    reason: {open: 'Open route', distance: 'Distance', structure: 'Dense structure', jamming: 'Active jamming', shielded: 'Shielded compartment', vault: 'Signal-blocking protection', countered: 'Protection bypassed', relay: 'Surviving Relay Node', extended: 'Extended Link', mesh: 'Local Mesh · drone logged', clear: 'Declared clear route'},
  },
  es: {
    range: {melee: 'Cuerpo a cuerpo', 'very-close': 'Muy cerca', close: 'Cerca', far: 'Lejos', 'very-far': 'Muy lejos', beyond: 'Más allá de Muy lejos'},
    state: {stable: 'Estable', unstable: 'Inestable', lost: 'Perdida'},
    effect: {
      stable: 'El dron funciona con normalidad.',
      unstable: 'Las órdenes simples funcionan con normalidad. Las complejas se tiran con Desventaja.',
      lost: 'El dron sigue su protocolo cargado. Si no tiene ninguno, se detiene hasta recuperar la señal.',
    },
    reason: {open: 'Ruta despejada', distance: 'Distancia', structure: 'Estructura densa', jamming: 'Interferencia activa', shielded: 'Compartimento blindado', vault: 'Protección que bloquea la señal', countered: 'Protección superada', relay: 'Repetidor operativo', extended: 'Enlace ampliado', mesh: 'Red local · dron registrado', clear: 'Ruta abierta declarada'},
  },
});

export function evaluateDroneSignal({
  range = 'close', mode = 'direct', obstruction = 'none',
  relay = false, extendedLink = false, clearRoute = false,
  protectionCountered = false, shieldedState = 'unstable',
} = {}) {
  if (!DRONE_RANGES.includes(range)) throw new RangeError(`Unknown drone range: ${range}`);
  if (!['direct', 'mesh'].includes(mode)) throw new RangeError(`Unknown link mode: ${mode}`);
  if (!['none', 'structure', 'jamming', 'shielded', 'vault'].includes(obstruction)) throw new RangeError(`Unknown obstruction: ${obstruction}`);
  if (!['unstable', 'lost'].includes(shieldedState)) throw new RangeError(`Unknown shielded state: ${shieldedState}`);

  const reasons = [];
  const mesh = mode === 'mesh' && range !== 'beyond';
  let severity = mesh ? 0 : range === 'beyond' ? 2 : range === 'very-far' ? 1 : 0;
  if (mesh) reasons.push('mesh');
  else reasons.push(severity ? 'distance' : 'open');
  if (clearRoute && range === 'very-far') {
    severity = 0;
    reasons.push('clear');
  }
  const obstacle = protectionCountered ? 'none' : obstruction;
  if (obstacle === 'structure') {
    severity = Math.max(severity, 1);
    reasons.push('structure');
  }
  // Extended Link improves distance or ordinary structure only, before protection applies.
  if (extendedLink && severity > 0) {
    severity -= 1;
    reasons.push('extended');
  }
  if (obstacle === 'jamming') {
    severity = Math.min(2, severity + 1);
    reasons.push('jamming');
  }
  if (obstacle === 'shielded') {
    severity = Math.max(severity, DRONE_SIGNAL_STATES.indexOf(shieldedState));
    reasons.push('shielded');
  }
  if (obstacle === 'vault') {
    severity = 2;
    reasons.push('vault');
  }
  if (protectionCountered && obstruction !== 'none') reasons.push('countered');
  const hardLost = obstacle === 'vault' || (obstacle === 'shielded' && shieldedState === 'lost');
  if (relay && !hardLost) {
    severity = Math.max(0, severity - 1);
    reasons.push('relay');
  }
  return {
    state: DRONE_SIGNAL_STATES[severity],
    bars: 2 - severity,
    maxBars: 2,
    range,
    mode,
    reason: reasons.at(-1),
    reasons,
    logged: mode === 'mesh',
    complexDisadvantage: severity === 1,
    followsProtocol: severity === 2,
  };
}
