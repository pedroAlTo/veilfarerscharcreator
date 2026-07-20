        window.VFLoading && window.VFLoading.advance(88, 'Assembling player interface…', 'Mounting tabs, rollers, options and session panels…');
        window.VeilFarersCanonical.ready.then(function(VF_CANON){
          window.VFLoading && window.VFLoading.advance(96, 'Finalizing player systems…', 'Canonical data is ready. Rendering the Player Tool now…');
        const { useState, useEffect, useLayoutEffect, useRef } = React;
        const { User, Shield, Activity, Zap, Heart, Database, AlertCircle, Sparkles, Skull, Star, Plus, X, Cloud, CloudLightning, Link, Wifi, Dices, CreditCard, Save, Upload, Download, Crown, ScrollText, Pin, Minus, Move, Settings } = Icons;

        /* Dice geometry: each die is drawn as the silhouette of its real-world shape so a
           roll visibly "looks like" that die. d4 triangle, d6 square, d8 trapezoid,
           d10 rhombus, d12 pentagon, d20 twenty-sided (near-circle). */
        const regularPolygon = (n, rotDeg, cx, cy, r) => {
          const pts = [];
          for (let i = 0; i < n; i++) {
            const a = (rotDeg + i * 360 / n) * Math.PI / 180;
            pts.push([+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)]);
          }
          return pts;
        };
        // returns { pts: outline, ty: text baseline, lines: [facet polylines] } for a 40x42 viewBox
        const dieShape = (sides) => {
          const s = parseInt(sides) || 20;
          let pts, ty = 25, lines = [];
          switch (s) {
            case 4:  pts = [[20,4],[37,34],[3,34]];                    ty = 29; break;   // triangle (point up)
            case 6:  pts = [[6,6],[34,6],[34,34],[6,34]];              ty = 24; break;   // square
            case 8:  // octahedron: diamond with an equator + top ridge (VTT d8 icon)
              pts = [[20,3],[34,21],[20,39],[6,21]]; ty = 32;
              lines = ['6,21 34,21', '20,3 20,21']; break;
            case 10: pts = [[20,3],[35,21],[20,39],[5,21]];            ty = 25; break;   // rhombus / diamond
            case 12: pts = regularPolygon(5, -90, 20, 22, 18);         ty = 26; break;   // pentagon (point up)
            case 20: // icosahedron: hexagon with a central triangle facet (VTT d20 icon)
              pts = [[20,3],[35.6,12],[35.6,30],[20,39],[4.4,30],[4.4,12]]; ty = 27;
              lines = ['20,3 4.4,30 35.6,30 20,3']; break;
            default: pts = regularPolygon(Math.min(s, 12), -90, 20, 21, 18); ty = 25;
          }
          return { pts: pts.map(p => p.join(',')).join(' '), ty, lines };
        };

        /* One die: shape by `sides`, colour by `variant`, tumbles + scrambles faces while
           `rolling`, then settles on `value`. */
        const ShapedDie = ({ sides, value, rolling, variant, size, critical, winner }) => {
          const [face, setFace] = useState(value);
          useEffect(() => {
            if (!rolling) { setFace(value); return; }
            const id = setInterval(() => setFace(1 + Math.floor(Math.random() * (parseInt(sides) || 20))), 70);
            return () => { clearInterval(id); setFace(value); };
          }, [rolling, value, sides]);
          const sh = dieShape(sides);
          const fillId = variant === 'hope' ? 'dieHope' : variant === 'fear' ? 'dieFear'
                       : variant === 'damage' ? 'dieDamage' : variant === 'discarded' ? 'dieDiscarded'
                       : variant === 'max' ? 'dieMax' : variant === 'crit' ? 'dieCrit' : 'dieNeutral';
          const stroke = variant === 'hope' ? '#facc15' : variant === 'fear' ? '#a855f7'
                       : variant === 'damage' ? '#ef4444' : variant === 'discarded' ? '#94a3b8'
                       : variant === 'max' ? '#fde047' : variant === 'crit' ? '#f87171' : '#64748b';
          const txt = (variant === 'hope') ? '#111827' : (variant === 'fear') ? '#ffffff'
                       : (variant === 'damage') ? '#ffffff' : (variant === 'discarded') ? '#f1f5f9'
                       : (variant === 'max') ? '#3a2c00' : (variant === 'crit') ? '#3a0a0a' : '#e2e8f0';
          const px = size || 34;
          return (
            <span className={`vf-die3 ${rolling ? 'rolling' : ''} ${critical ? 'is-critical' : ''} ${winner ? 'is-winner' : ''}`} style={{ width: px, height: px }}>
              <svg viewBox="0 0 40 42" width={px} height={px}>
                <polygon points={sh.pts} fill={`url(#${fillId})`} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
                {(sh.lines || []).map((ln, i) => (
                  <polyline key={i} points={ln} fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.55" strokeLinejoin="round" strokeLinecap="round" />
                ))}
                <text x="20" y={sh.ty} textAnchor="middle" fontWeight="900" fontSize="15" fill={txt} style={{ fontFamily: 'inherit' }}>{face}</text>
              </svg>
            </span>
          );
        };

        const normalizeDamageDiceResults = (results, rolls, discardedIndices, rerolls) => {
          if (Array.isArray(results) && results.length) {
            return results.map((die, index) => ({
              index: Number.isFinite(Number(die.index)) ? Number(die.index) : index,
              value: Number(die.value),
              status: die.status === 'discarded' ? 'discarded' : 'kept',
              rerolledFrom: die.rerolledFrom == null ? null : Number(die.rerolledFrom)
            }));
          }
          const dropped = new Set(Array.isArray(discardedIndices) ? discardedIndices.map(Number) : []);
          const rerollMap = new Map((Array.isArray(rerolls) ? rerolls : []).map(item => [Number(item.index), item]));
          return (Array.isArray(rolls) ? rolls : []).map((value, index) => {
            const reroll = rerollMap.get(index);
            return { index, value: Number(value), status: dropped.has(index) ? 'discarded' : 'kept', rerolledFrom: reroll ? Number(reroll.from) : null };
          });
        };

        const DamageDiceDisplay = ({ results, rolls, discardedIndices, rerolls, sides, rolling, compact, revealDiscard = true }) => {
          const dice = normalizeDamageDiceResults(results, rolls, discardedIndices, rerolls);
          if (!dice.length) return null;
          const hasDiscarded = dice.some(die => die.status === 'discarded');
          const keptValues = dice.filter(die => die.status !== 'discarded').map(die => die.value);
          const discardedValues = dice.filter(die => die.status === 'discarded').map(die => die.value);
          return (
            <div className="flex flex-col items-center" aria-label={hasDiscarded ? `Kept ${keptValues.join(', ')}; discarded ${discardedValues.join(', ')}` : `Damage dice ${keptValues.join(', ')}`}>
              <div className="vf-damage-dice">
                {dice.map((die, index) => {
                  const discarded = die.status === 'discarded' && revealDiscard && !rolling;
                  return (
                    <div key={`${die.index}-${index}`} data-die-status={discarded ? 'discarded' : 'kept'} className={`vf-damage-die ${discarded ? 'is-discarded' : 'is-kept'}`}>
                      <div className="vf-damage-die-face">
                        <ShapedDie sides={sides || 6} value={die.value} rolling={rolling} variant={discarded ? 'discarded' : 'damage'} size={compact ? 26 : 34} />
                      </div>
                      {hasDiscarded && revealDiscard && !rolling && <span className="vf-damage-die-state">{discarded ? 'Drop' : 'Keep'}</span>}
                      {die.rerolledFrom != null && <span className="vf-damage-die-reroll">{die.rerolledFrom}→{die.value}</span>}
                    </div>
                  );
                })}
              </div>
              {hasDiscarded && revealDiscard && !rolling && <div className="vf-damage-summary">Keep {keptValues.join(' + ')} · discard {discardedValues.join(', ')}</div>}
            </div>
          );
        };

        const AnimatedCalloutCard = ({ callout, onClose }) => {
          const hasAnimatedDice = callout && callout.type !== 'note';
          const [rolling, setRolling] = useState(hasAnimatedDice);
          const [revealDiscard, setRevealDiscard] = useState(false);
          useEffect(() => {
            if (!hasAnimatedDice) { setRolling(false); setRevealDiscard(true); return; }
            setRolling(true); setRevealDiscard(false);
            const settleTimer = setTimeout(() => setRolling(false), 760);
            const discardTimer = setTimeout(() => setRevealDiscard(true), 1180);
            return () => { clearTimeout(settleTimer); clearTimeout(discardTimer); };
          }, [callout && callout.broadcastId, callout && callout.timestamp, hasAnimatedDice]);
          const standardSides = callout.die || parseInt((String(callout.dice || '').match(/d(\d+)/) || [])[1]) || 6;
          const damageSides = parseInt((String(callout.damageRolledDice || callout.damageDice || '').match(/d(\d+)/) || [])[1]) || 6;
          return (
            <div className="vf-callout-card" data-kind={callout.type || 'duality'}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-wide text-cyan-300 truncate">{callout.playerName || 'Player'}</div><div className="text-[9px] text-slate-400 truncate">{callout.label || 'Roll'}</div></div>
                <button onClick={onClose} className="text-slate-600 hover:text-white shrink-0" aria-label="Close callout"><X className="w-3 h-3" /></button>
              </div>
              {callout.resourceCost && callout.resourceCost.amount > 0 && <div className="mt-1 text-[8px] font-black uppercase text-amber-300">Spent {callout.resourceCost.amount} {callout.resourceCost.resource}</div>}
              {callout.type === 'duality' ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="vf-callout-dice gap-1"><ShapedDie sides={12} value={callout.hope} rolling={rolling} variant="hope" size={29} critical={!!callout.crit} winner={!rolling && /WITH HOPE/i.test(callout.outcome || "")} /><ShapedDie sides={12} value={callout.fear} rolling={rolling} variant="fear" size={29} critical={!!callout.crit} winner={!rolling && /WITH FEAR/i.test(callout.outcome || "")} /></div>
                    <div className={`text-right vf-callout-result ${rolling ? 'is-rolling' : ''}`}><div className="text-2xl font-black text-white leading-none">{callout.total}</div><div className={`text-[8px] font-black ${callout.outcomeColor || ''}`}>{callout.outcome}</div></div>
                  </div>
                  {callout.attackBreakdown && callout.attackBreakdown.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{callout.attackBreakdown.map((part,index) => <span key={index} className="px-1.5 py-0.5 rounded border border-slate-700 bg-black text-[8px] text-slate-300">{part.label} {part.value >= 0 ? '+' : ''}{part.value}</span>)}</div>}
                  {callout.damage != null && <div className="mt-2 rounded border border-red-900/60 bg-red-950/20 p-2 flex items-center justify-between gap-2"><div><div className="text-[8px] font-black uppercase text-red-300">Damage · {callout.damageBase || callout.damageDice}</div><DamageDiceDisplay results={callout.damageDiceResults} rolls={callout.damageRolls} discardedIndices={callout.damageDiscardedIndices} rerolls={callout.damageRerolls} sides={damageSides} compact={true} rolling={rolling} revealDiscard={revealDiscard} /><div className="text-[8px] text-slate-500 font-mono">{callout.damageDetail}</div></div><div className={`text-2xl font-black text-red-400 vf-callout-result ${rolling ? 'is-rolling' : ''}`}>{callout.damage}</div></div>}
                  {(callout.damageRules || []).map((rule,index) => <div key={index} className="mt-1 text-[8px] text-yellow-300">{rule}</div>)}
                  {callout.weaponEffects && callout.weaponEffects.length > 0 && <div className="mt-2 border-t border-slate-800 pt-1">{callout.weaponEffects.map((effect,index) => <div key={index} className="text-[8px] text-slate-400"><b className="text-slate-200">{effect.name}:</b> {effect.effect}</div>)}</div>}
                </div>
              ) : callout.type === 'note' ? (
                <div className="mt-2 text-[10px] text-slate-200 whitespace-pre-wrap">{callout.label}</div>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-2"><div><div className="vf-callout-dice flex-wrap gap-1">{(callout.rolls || []).map((value,index) => <ShapedDie key={index} sides={standardSides} value={value} rolling={rolling} variant={callout.type === 'damage' ? 'damage' : (value === 1 ? 'crit' : 'neutral')} size={27} />)}</div><div className="text-[8px] text-slate-500">{callout.count ? `${callout.count}d${callout.die}` : callout.dice}{callout.modifier ? ` ${callout.modifier > 0 ? '+' : ''}${callout.modifier}` : ''}</div></div><div className={`text-2xl font-black vf-callout-result ${rolling ? 'is-rolling' : ''} ${callout.type === 'damage' ? 'text-red-400' : 'text-white'}`}>{callout.total}</div></div>
              )}
              <div className="vf-callout-timer"><span></span></div>
            </div>
          );
        };
        /* v59.72: restore the compact v59.56 stepper without browser-native controls. */
        const NumField = ({ value, onChange, className, min, max, onClick, style, placeholder }) => {
          const full = /w-full/.test(className || '');
          const currentNumber = () => { const n = parseFloat(value); return Number.isFinite(n) ? n : 0; };
          const clampNumber = (next) => {
            if (min !== undefined && min !== null && next < Number(min)) return Number(min);
            if (max !== undefined && max !== null && next > Number(max)) return Number(max);
            return next;
          };
          const bump = (delta, event) => {
            event.preventDefault(); event.stopPropagation();
            onChange({ target: { value: String(clampNumber(currentNumber() + delta)) } });
          };
          return (
            <span className={`vf-num ${full ? 'vf-num-full' : ''}`}>
              <input type="number" inputMode="numeric" value={value} onChange={onChange} min={min} max={max} placeholder={placeholder} style={style}
                onClick={(e) => { e.stopPropagation(); if (onClick) onClick(e); }} className={className} />
              <span className="vf-num-btns" aria-hidden="true">
                <button type="button" tabIndex={-1} onMouseDown={(e) => bump(1, e)} aria-label="Increase">▲</button>
                <button type="button" tabIndex={-1} onMouseDown={(e) => bump(-1, e)} aria-label="Decrease">▼</button>
              </span>
            </span>
          );
        };

        /* Draggable handout popup (like the roller). Renders a structured note:
           title + subtitle headers, plain-text body, optional pasted table, with scroll.
           Handles its own auto-destruct countdown when the note has an expiry. */
        const NoteTable = ({ table }) => {
          if (!table || !Array.isArray(table.rows) || !table.rows.length) return null;
          const hdr = Array.isArray(table.headers) && table.headers.length ? table.headers : null;
          return (
            <table className="w-full text-[11px] border-collapse mt-2">
              {hdr && (<thead><tr>{hdr.map((h, i) => (<th key={i} className="text-left font-bold text-cyan-300 border-b border-slate-600 px-2 py-1 bg-slate-800/60">{h}</th>))}</tr></thead>)}
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 ? 'bg-slate-800/20' : ''}>
                    {row.map((cell, ci) => (<td key={ci} className="text-slate-200 border-b border-slate-800 px-2 py-1 align-top">{cell}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        };
        const NoteWindow = ({ open, pos, onDrag, onClose, onToggleMin, onSave, canSave }) => {
          const note = open.note || {};
          const [remaining, setRemaining] = useState(null);
          useEffect(() => {
            if (!note.expires || note.expires <= 0) { setRemaining(null); return; }
            let alive = true;
            const tick = () => {
              if (!alive) return;
              const rem = Math.max(0, (open.openedAt || Date.now()) + note.expires - Date.now());
              setRemaining(Math.ceil(rem / 1000));
              if (rem <= 0) { alive = false; onClose(); }
            };
            tick(); const iv = setInterval(tick, 500);
            return () => { alive = false; clearInterval(iv); };
          }, [note.id]);
          return (
            <div style={{ left: (pos && pos.x) || 60, top: (pos && pos.y) || 90 }} className="vf-note-win fixed z-40 bg-slate-900 border border-amber-700/60 rounded-xl w-full max-w-sm shadow-2xl window-shadow flex flex-col overflow-hidden">
              <div onMouseDown={(e) => onDrag(e, note.id)} onTouchStart={(e) => onDrag(e, note.id)} className="bg-gradient-to-r from-amber-950/60 to-slate-800/80 p-2.5 cursor-move flex justify-between items-center select-none border-b border-amber-800/40 touch-none">
                <h2 className="text-xs font-bold text-amber-200 flex items-center gap-2 pointer-events-none truncate"><ScrollText className="w-4 h-4 shrink-0" /> {note.title || 'Note'}</h2>
                <div className="flex items-center gap-1 shrink-0">
                  {remaining !== null && (<span className="text-[10px] font-mono font-bold text-red-300 bg-red-950/60 border border-red-800/50 rounded px-1.5 py-0.5 mr-1" title="Self-destructs">⏱ {remaining}s</span>)}
                  {canSave && (<button onClick={onSave} title="Save to inventory" className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-amber-300"><Save className="w-3 h-3" /></button>)}
                  <button onClick={onToggleMin} title="Minimize" className="p-1 rounded hover:bg-slate-700 text-slate-400"><Minus className="w-3 h-3" /></button>
                  <button onClick={onClose} title="Close" className="p-1 rounded hover:bg-red-900/50 text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              </div>
              {!open.min && (
                <div className="p-4 bg-slate-900 max-h-[62vh] overflow-y-auto">
                  {note.title && <h1 className="text-lg font-black text-white leading-tight">{note.title}</h1>}
                  {note.subtitle && <h2 className="text-sm font-bold text-amber-300/90 uppercase tracking-wide mb-2">{note.subtitle}</h2>}
                  {note.body && <p className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap">{note.body}</p>}
                  <NoteTable table={note.table} />
                  {note.volatile && <div className="mt-3 text-[10px] text-red-400/80 uppercase font-bold tracking-wide flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Volatile — cannot be saved</div>}
                </div>
              )}
            </div>
          );
        };

        // DATA: CARTAS DE DOMINIO
        const DOMAIN_CARDS = VF_CANON.domainCards || {};

        const FEATURE_REGISTRY = VF_CANON.featureRegistry || [];
        const CORE_FEATURES = VF_CANON.features || [];
        const WEAPON_CATALOG = VF_CANON.weapons || [];
        const ARMOR_CATALOG = VF_CANON.armor || [];
        const AUGMENT_CATALOG = VF_CANON.augments || [];
        const GEAR_CATALOG = VF_CANON.gear || [];
        const DRONE_GRADE_CATALOG = VF_CANON.droneGrades || [];
        const DRONE_MODULE_CATALOG = VF_CANON.droneModules || [];
        const RESOLVE_MOVE_LIBRARY = VF_CANON.resolveMoves || [];
        // Player Tool playtest overrides. These do not alter the books or canonical rules JSON.
        const PLAYER_TOOL_WEAPON_OVERRIDES = {
          'vf.core.weapon.railgun': { damage: 'd8+3 phys.', features: ['Massive'], feature: 'Massive' }
        };
        // Official local @3d-dice renderer is exposed as window.VFDice3D.
        const normalizeRuleName = (value) => String(value || '').toLowerCase().replace(/[+()]|\d+/g, ' ').replace(/[^a-z]+/g, ' ').trim();
        const weaponKey = (weapon) => String((weapon && (weapon.canonicalId || weapon.id || weapon.name)) || '').trim();
        const findCanonicalWeapon = (weapon) => {
          const key = weaponKey(weapon);
          const name = String((weapon && weapon.name) || '').trim().toLowerCase();
          return WEAPON_CATALOG.find(item => item.id === key || (name && String(item.name || '').trim().toLowerCase() === name)) || null;
        };
        const featureList = (value) => {
          if (Array.isArray(value)) return value.filter(Boolean).map(String);
          return String(value || '').split(/[,;]+/).map(x => x.trim()).filter(Boolean);
        };
        const hydratePlayerWeapon = (weapon) => {
          weapon = weapon || {};
          const canonical = findCanonicalWeapon(weapon);
          const source = canonical || weapon;
          let trait = String(weapon.trait || source.trait || '').trim();
          let range = String(weapon.range || source.range || '').trim();
          if (trait.indexOf('·') !== -1) {
            const parts = trait.split('·').map(x => x.trim()).filter(Boolean);
            trait = parts.shift() || '';
            if (!range) range = parts.join(' · ');
          }
          const overrideKey = String((canonical && canonical.id) || weapon.canonicalId || weapon.id || '').trim();
          const override = PLAYER_TOOL_WEAPON_OVERRIDES[overrideKey] || ((String(weapon.name || source.name || '').trim().toLowerCase() === 'railgun') ? PLAYER_TOOL_WEAPON_OVERRIDES['vf.core.weapon.railgun'] : null);
          const featureSource = override && override.features ? override.features : ((weapon.features && weapon.features.length) ? weapon.features : (weapon.feature || source.features || source.feature));
          const features = featureList(featureSource);
          return {
            ...weapon,
            id: (canonical && canonical.id) || weapon.id || weapon.canonicalId || '',
            canonicalId: (canonical && canonical.id) || weapon.canonicalId || weapon.id || '',
            name: weapon.name || source.name || '',
            trait: trait || source.trait || '',
            range: range || source.range || '',
            baseDamage: weapon.baseDamage || (override && override.damage) || source.damage || weapon.damage || '',
            damage: window.VFEquipmentMods ? window.VFEquipmentMods.addDamageBonus(weapon.baseDamage || (override && override.damage) || source.damage || weapon.damage || '', window.VFEquipmentMods.damageBonus(weapon.installedMods)) : ((override && override.damage) || weapon.damage || source.damage || ''),
            installedMods: window.VFEquipmentMods ? window.VFEquipmentMods.normalize(weapon.installedMods,'weapon') : (Array.isArray(weapon.installedMods)?weapon.installedMods:[]),
            features: features.length ? features : featureList(source.features),
            feature: (features.length ? features : featureList(source.features)).join(', '),
            featureRefs: (canonical && canonical.featureRefs) || weapon.featureRefs || [],
            tier: (canonical && canonical.tier) || weapon.tier || null,
            pack: (canonical && canonical.pack) || weapon.pack || '',
            burden: canonical && canonical.burden != null ? canonical.burden : (weapon.burden == null ? null : weapon.burden),
            weaponFamily: (canonical && canonical.weaponFamily) || weapon.weaponFamily || '',
            proficiencyDie: (canonical && canonical.proficiencyDie) || weapon.proficiencyDie || ''
          };
        };
        const findFeatureRule = (display, ref) => {
          const id = ref && ref.id;
          if (id) {
            const byId = FEATURE_REGISTRY.find(rule => rule.id === id && (!rule.appliesTo || rule.appliesTo.indexOf('weapon') !== -1));
            if (byId) return byId;
          }
          const wanted = normalizeRuleName(display || (ref && ref.display));
          const registry = FEATURE_REGISTRY.find(rule => (!rule.appliesTo || rule.appliesTo.indexOf('weapon') !== -1) && normalizeRuleName(rule.name) === wanted);
          if (registry) return registry;
          const simple = CORE_FEATURES.find(rule => normalizeRuleName(rule.name) === wanted);
          return simple ? { ...simple, effect: simple.definition, timing: 'Passive', cost: { type: 'none' } } : null;
        };
        const weaponFeatureEntries = (weapon) => {
          const hydrated = hydratePlayerWeapon(weapon);
          const displays = featureList(hydrated.features);
          const refs = Array.isArray(hydrated.featureRefs) ? hydrated.featureRefs : [];
          return displays.map((display, index) => {
            const wanted = normalizeRuleName(display);
            const ref = refs.find(item => normalizeRuleName(item.display) === wanted || (item.id && normalizeRuleName(item.id.split('.').pop()) === wanted)) || refs[index] || null;
            return { display, ref, rule: findFeatureRule(display, ref), parameters: (ref && ref.parameters) || {} };
          });
        };
        const conciseEffect = (entry) => {
          if (!entry) return '';
          const rule = entry.rule || {};
          let effect = String(rule.effect || rule.definition || '').trim();
          if (rule.resistance) {
            const resistance = [rule.resistance.trait, rule.resistance.dc].filter(Boolean).join(' vs ');
            if (resistance && effect.toLowerCase().indexOf(resistance.toLowerCase()) === -1) effect = resistance + '. ' + effect;
          }
          return effect || entry.display;
        };
        const weaponFeatureMatches = (entry, expected) => {
          const actual = normalizeRuleName(entry && entry.display);
          const wanted = normalizeRuleName(expected);
          return actual === wanted || actual.startsWith(wanted + ' ') || actual.startsWith(wanted + ':') || actual.startsWith(wanted + '(');
        };
        const weaponAttackProfile = (weapon, character, equipped) => {
          const hydrated = hydratePlayerWeapon(weapon);
          const entries = weaponFeatureEntries(hydrated);
          let attackBonus = 0;
          const attackBonuses = [];
          const range = String(hydrated.range || '').toLowerCase();
          entries.forEach(entry => {
            const name = normalizeRuleName(entry.display);
            if (weaponFeatureMatches(entry, 'reliable')) { attackBonus += 1; attackBonuses.push('Reliable +1'); }
            if (weaponFeatureMatches(entry, 'accurate') && (range.indexOf('far') !== -1)) { attackBonus += 1; attackBonuses.push('Accurate +1'); }
          });
          const wornArmor = character && (character.armor || ((character.armorArsenal || []).find(item => armorKey(item) === character.activeArmorId)));
          const wornArmorProfile = armorProfile(wornArmor);
          if (wornArmorProfile.attackBonus && entries.some(entry => weaponFeatureMatches(entry, 'automatic'))) {
            attackBonus += wornArmorProfile.attackBonus;
            attackBonuses.push('Armor Assault +1');
          }
          const heavy = entries.some(entry => weaponFeatureMatches(entry, 'heavy'));
          const massive = entries.some(entry => weaponFeatureMatches(entry, 'massive'));
          const brutal = entries.some(entry => weaponFeatureMatches(entry, 'brutal'));
          const pairedEntries = entries.filter(entry => weaponFeatureMatches(entry, 'paired'));
          const allEquipped = (equipped || []).map(hydratePlayerWeapon).filter(w => w.name);
          const pairedWeapons = allEquipped.filter(w => weaponFeatureEntries(w).some(entry => weaponFeatureMatches(entry, 'paired')));
          let pairedBonus = 0;
          if (pairedEntries.length && pairedWeapons.length >= 2) {
            pairedWeapons.forEach(w => weaponFeatureEntries(w).forEach(entry => {
              if (!weaponFeatureMatches(entry, 'paired')) return;
              const fromParam = Number(entry.parameters && entry.parameters.bonus);
              const fromText = Number((String(entry.display).match(/\+(\d+)/) || [])[1]);
              pairedBonus = Math.max(pairedBonus, Number.isFinite(fromParam) ? fromParam : (Number.isFinite(fromText) ? fromText : 0));
            }));
          }
          return {
            weapon: hydrated,
            entries,
            traitMod: (() => {
              const wanted = String(hydrated.trait || '').toLowerCase();
              const key = ['agility','strength','finesse','instinct','presence','knowledge'].find(item => wanted.indexOf(item) !== -1);
              return key ? (Number(character && character.stats && character.stats[key]) || 0) : 0;
            })(),
            attackBonus,
            attackBonuses,
            proficiency: Math.max(1, Math.min(6, Number(character && character.proficiency) || 1)),
            heavyDisadvantage: heavy && (Number(character && character.stats && character.stats.strength) || 0) <= 0,
            massive,
            brutal,
            pairedBonus,
            evasionModifier: massive ? -1 : 0,
            effects: entries.map(entry => ({ name: entry.display, timing: entry.rule && entry.rule.timing || '', effect: conciseEffect(entry), resistance: entry.rule && entry.rule.resistance || null }))
          };
        };

        const displayScalar = (value, fallback = '') => {
          if (value == null || value === '') return fallback;
          if (typeof value === 'string' || typeof value === 'number') return String(value);
          if (Array.isArray(value)) return value.map(item => displayScalar(item, '')).filter(Boolean).join(', ');
          if (typeof value === 'object') return String(value.name || value.display || value.label || value.code || value.rank || fallback || '');
          return String(value);
        };
        const itemTierLabel = (item) => displayScalar(item && item.tier, displayScalar(item && item.raw && item.raw.tier, ''));
        const itemCostLabel = (item) => {
          if (window.VeilFarersData && typeof window.VeilFarersData.costLabel === 'function') return window.VeilFarersData.costLabel(item);
          const value = item && item.cost && item.cost.credits;
          return value == null || value === '' ? '—' : `${value} Cr`;
        };
        const slugify = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const baseItemKey = (item, prefix) => String((item && (item.canonicalId || item.id || item.name || `${prefix}-${slugify(item && item.name)}`)) || '').trim();
        const sanitizeCustomEntry = (entry, kind, fields) => {
          entry = entry || {};
          const out = { custom: true, type: kind, canonicalId: entry.canonicalId || '', id: entry.id || `${kind}:custom:${slugify(entry.name || kind)}` };
          fields.forEach(field => { if (entry[field] != null) out[field] = entry[field]; });
          if (!out.name) out.name = kind.charAt(0).toUpperCase() + kind.slice(1);
          return out;
        };
        const armorKey = (armor) => baseItemKey(armor, 'armor');
        const augmentKey = (augment) => baseItemKey(augment, 'augment');
        const gearKey = (gear) => baseItemKey(gear, 'gear');
        const findCanonicalArmor = (armor) => {
          const key = armorKey(armor);
          const name = String((armor && armor.name) || '').trim().toLowerCase();
          return ARMOR_CATALOG.find(item => item.id === key || (name && String(item.name || '').trim().toLowerCase() === name)) || null;
        };
        const hydrateArmor = (armor) => {
          armor = armor || {};
          const canonical = findCanonicalArmor(armor);
          const source = canonical || armor;
          return {
            ...source,
            ...armor,
            canonicalId: (canonical && canonical.id) || armor.canonicalId || armor.id || '',
            id: (canonical && canonical.id) || armor.id || armor.canonicalId || '',
            name: armor.name || source.name || '',
            features: Array.isArray(source.features) ? source.features : featureList(source.features),
            thresholds: source.thresholds || armor.thresholds || { major: armor.major || 0, severe: armor.severe || 0 },
            installedMods: window.VFEquipmentMods ? window.VFEquipmentMods.normalize(armor.installedMods,'armor') : (Array.isArray(armor.installedMods)?armor.installedMods:[]),
            armorSlots: source.armorSlots != null ? source.armorSlots : (armor.armorSlots != null ? armor.armorSlots : ''),
            weightClass: source.weightClass || armor.weightClass || '',
            tier: source.tier || armor.tier || '',
            cost: source.cost || armor.cost || null,
            custom: !!armor.custom && !canonical
          };
        };
        const armorThresholdsWithMods = (armor) => {
          const item = hydrateArmor(armor);
          const base = parseThresholdPair(item.thresholds || {});
          const bonus = window.VFEquipmentMods ? window.VFEquipmentMods.thresholdBonus(item.installedMods) : 0;
          return { major:Math.max(0,Number(base.major||0)+bonus), severe:Math.max(0,Number(base.severe||0)+bonus) };
        };
        const armorSummary = (armor) => {
          const item = hydrateArmor(armor);
          const thresholds = armorThresholdsWithMods(item);
          const featureText = featureList(item.features).join(', ');
          return {
            item,
            title: item.name,
            tier: itemTierLabel(item),
            cost: itemCostLabel(item),
            detail: `Thresholds ${thresholds.major || '—'} / ${thresholds.severe || '—'}${item.armorSlots ? ` · Slots ${item.armorSlots}` : ''}${item.weightClass ? ` · ${item.weightClass}` : ''}`,
            features: featureText
          };
        };
        const findCanonicalAugment = (augment) => {
          const key = augmentKey(augment);
          const name = String((augment && augment.name) || '').trim().toLowerCase();
          return AUGMENT_CATALOG.find(item => item.id === key || (name && String(item.name || '').trim().toLowerCase() === name)) || null;
        };
        const hydrateAugment = (augment) => {
          augment = augment || {};
          const canonical = findCanonicalAugment(augment);
          const source = canonical || augment;
          return {
            ...source,
            ...augment,
            canonicalId: (canonical && canonical.id) || augment.canonicalId || augment.id || '',
            id: (canonical && canonical.id) || augment.id || augment.canonicalId || '',
            name: augment.name || source.name || '',
            tier: source.tier || augment.tier || '',
            benefit: augment.benefit || source.benefit || '',
            drawback: augment.drawback || source.drawback || '',
            activationStress: augment.activationStress != null ? augment.activationStress : (source.activationStress != null ? source.activationStress : ''),
            cost: source.cost || augment.cost || null,
            custom: !!augment.custom && !canonical
          };
        };
        const augmentSummary = (augment) => {
          const item = hydrateAugment(augment);
          return {
            item,
            title: item.name,
            tier: itemTierLabel(item),
            cost: itemCostLabel(item),
            detail: item.benefit || 'No benefit recorded.',
            meta: `${item.activationStress ? `Stress ${item.activationStress}` : 'Passive'}${item.drawback ? ` · ${item.drawback}` : ''}`
          };
        };
        const findCanonicalGear = (gear) => {
          const key = gearKey(gear);
          const name = String((gear && gear.name) || '').trim().toLowerCase();
          return GEAR_CATALOG.find(item => item.id === key || (name && String(item.name || '').trim().toLowerCase() === name)) || null;
        };
        const hydrateGear = (gear) => {
          gear = gear || {};
          const canonical = findCanonicalGear(gear);
          const source = canonical || gear;
          return {
            ...source,
            ...gear,
            canonicalId: (canonical && canonical.id) || gear.canonicalId || gear.id || '',
            id: (canonical && canonical.id) || gear.id || gear.canonicalId || '',
            name: gear.name || source.name || '',
            tier: source.tier || gear.tier || '',
            use: gear.use || source.use || '',
            cost: source.cost || gear.cost || null,
            custom: !!gear.custom && !canonical
          };
        };
        const gearSummary = (gear) => {
          const item = hydrateGear(gear);
          return {
            item,
            title: item.name,
            tier: itemTierLabel(item),
            cost: itemCostLabel(item),
            detail: item.use || 'General equipment item.'
          };
        };

        const droneGradeKey = (grade) => baseItemKey(grade, 'drone-grade');
        const droneModuleKey = (module) => baseItemKey(module, 'drone-module');
        const findDroneGrade = (value) => {
          const key = typeof value === 'string' ? value : droneGradeKey(value);
          const name = String((value && value.name) || value || '').trim().toLowerCase();
          return DRONE_GRADE_CATALOG.find(item => item.id === key || item.slug === key || String(item.name || '').trim().toLowerCase() === name) || DRONE_GRADE_CATALOG.find(item => item.slug === 'common-drone' || normalizeRuleName(item.name) === 'common drone') || DRONE_GRADE_CATALOG[0] || null;
        };
        const findDroneModule = (value) => {
          const key = typeof value === 'string' ? value : droneModuleKey(value);
          const name = String((value && value.name) || value || '').trim().toLowerCase();
          return DRONE_MODULE_CATALOG.find(item => item.id === key || item.slug === key || String(item.name || '').trim().toLowerCase() === name) || null;
        };
        const parseThresholdPair = (raw) => {
          if (raw && typeof raw === 'object') return { major:Number(raw.major)||0, severe:Number(raw.severe)||0 };
          const parts = String(raw || '').split('/').map(part => Number(String(part).replace(/[^0-9-]/g,'')) || 0);
          return { major:parts[0] || 0, severe:parts[1] > 0 ? parts[1] : 0 };
        };
        const droneGradeStats = (gradeValue) => {
          const grade = findDroneGrade(gradeValue);
          const stats = (grade && grade.statistics) || {};
          const thresholds = parseThresholdPair(stats.thresholds || stats.thr);
          return {
            grade,
            profileType:(grade && grade.profileType) || ((grade && grade.pack) === 'core' ? 'grade' : 'frame'),
            tierLabel:(grade && grade.tier && (grade.tier.raw || grade.tier.name)) || '',
            hp:Number(stats.hp)||1,
            evasion:Number(stats.evasion != null ? stats.evasion : stats.eva)||10,
            thresholds,
            armor:Number(stats.armorSlots != null ? stats.armorSlots : stats.armor)||0,
            moduleSlots:Number(stats.moduleSlots != null ? stats.moduleSlots : (stats.modules != null ? stats.modules : stats.slots))||0,
            availability:String(stats.availability || stats.access || ''),
            moduleAccessRank:Number((grade && grade.moduleAccessRank) || 1)
          };
        };
        const droneModuleAccessRank = (gradeValue) => droneGradeStats(gradeValue).moduleAccessRank;
        const droneModuleMinimumRank = (module) => {
          const item = findDroneModule(module) || module || {};
          return Math.max(1, Number(item.minimumAccessRank || (item.tier && item.tier.rank) || 1));
        };
        const droneModuleAccessLabel = (module) => {
          const item = findDroneModule(module) || module || {};
          return item.accessLabel || (item.tier && item.tier.name) || (item.pack === 'rust-and-steel' ? 'Rust & Steel upgrade' : 'Common');
        };
        const droneModuleSlots = (module) => Math.max(0, Number((findDroneModule(module) || module || {}).slots) || 0);
        const droneModuleAllowed = (module, gradeValue) => droneModuleMinimumRank(module) <= droneModuleAccessRank(gradeValue);
        const droneModuleConflicts = (module, installed, gradeValue) => {
          const item = findDroneModule(module) || module || {};
          const accessRank = droneModuleAccessRank(gradeValue);
          const installedItems = (installed || []).map(value => findDroneModule(value) || value || {}).filter(Boolean);
          const installedNames = new Set(installedItems.map(value => String(value.name || '')));
          const req = item.requirements || {};
          if (Array.isArray(req.incompatible) && req.incompatible.length && !(req.incompatibleUnlessAccessRank && accessRank >= Number(req.incompatibleUnlessAccessRank))) {
            const conflict = req.incompatible.find(name => installedNames.has(name));
            if (conflict) return `${item.name} cannot stack with ${conflict} on this drone profile.`;
          }
          for (const existing of installedItems) {
            const existingReq = existing.requirements || {};
            if (!Array.isArray(existingReq.incompatible) || !existingReq.incompatible.includes(item.name)) continue;
            if (existingReq.incompatibleUnlessAccessRank && accessRank >= Number(existingReq.incompatibleUnlessAccessRank)) continue;
            return `${item.name} cannot stack with ${existing.name} on this drone profile.`;
          }
          return null;
        };
        const droneModuleModifierLabels = (module) => {
          const item = findDroneModule(module) || module || {};
          const mods = item.statModifiers || {};
          const out = [];
          if (Number(mods.hp)) out.push(`${Number(mods.hp)>0?'+':''}${mods.hp} HP`);
          if (Number(mods.evasion)) out.push(`${Number(mods.evasion)>0?'+':''}${mods.evasion} Evasion`);
          if (Number(mods.thresholdMajor)) out.push(`+${mods.thresholdMajor} Major`);
          if (Number(mods.thresholdSevere)) out.push(`+${mods.thresholdSevere} Severe`);
          if (Number(mods.armorSlots)) out.push(`+${mods.armorSlots} Shield`);
          if (Number(mods.temporaryEvasion)) out.push(`+${mods.temporaryEvasion} Evasion for one attack`);
          if (mods.conditionalEvasion) out.push(`${Number(mods.conditionalEvasion.value)>0?'+':''}${mods.conditionalEvasion.value} Evasion · ${mods.conditionalEvasion.label}`);
          if (Array.isArray(mods.conditionalEvasionOptions)) mods.conditionalEvasionOptions.forEach(entry => out.push(`${Number(entry.value)>0?'+':''}${entry.value} Evasion · ${entry.label}`));
          return out;
        };
        const droneDerivedProfile = (gradeValue, moduleValues, contextValue) => {
          const base = droneGradeStats(gradeValue);
          const context = contextValue || {};
          const modules = (moduleValues || []).map(value => findDroneModule(value) || value).filter(Boolean);
          const installedModuleNames = new Set(modules.map(module => String(module.name || '')));
          let hp = base.hp;
          let evasion = base.evasion;
          let major = base.thresholds.major;
          let severe = base.thresholds.severe;
          let armorSlots = base.armor;
          const applied = [];
          const conditional = [];
          modules.forEach(module => {
            const mods = module.statModifiers || {};
            if (Number(mods.hp)) { hp += Number(mods.hp); applied.push(`${module.name}: ${Number(mods.hp) > 0 ? '+' : ''}${mods.hp} HP`); }
            if (Number(mods.evasion)) { evasion += Number(mods.evasion); applied.push(`${module.name}: ${Number(mods.evasion) > 0 ? '+' : ''}${mods.evasion} Evasion`); }
            if (Number(mods.thresholdMajor)) { major += Number(mods.thresholdMajor); applied.push(`${module.name}: +${mods.thresholdMajor} Major`); }
            if (Number(mods.thresholdSevere)) { severe = severe > 0 ? severe + Number(mods.thresholdSevere) : severe; applied.push(`${module.name}: +${mods.thresholdSevere} Severe`); }
            if (Number(mods.armorSlots)) { armorSlots += Number(mods.armorSlots); applied.push(`${module.name}: +${mods.armorSlots} Shield / Armor Slot`); }
            if (mods.conditionalEvasion) {
              const entry = mods.conditionalEvasion;
              const blockedBy = Array.isArray(entry.blockedByModules) ? entry.blockedByModules.find(name => installedModuleNames.has(name)) : null;
              const available = !blockedBy;
              const active = available && !!context[entry.key];
              if (active) evasion += Number(entry.value) || 0;
              conditional.push({ ...entry, moduleName:module.name, active, available, unavailableReason:blockedBy ? `Blocked by ${blockedBy}` : '' });
            }
            if (Array.isArray(mods.conditionalEvasionOptions)) mods.conditionalEvasionOptions.forEach(entry => {
              const blockedBy = Array.isArray(entry.blockedByModules) ? entry.blockedByModules.find(name => installedModuleNames.has(name)) : null;
              const available = !blockedBy;
              const active = available && !!context[entry.key];
              if (active) evasion += Number(entry.value) || 0;
              conditional.push({ ...entry, moduleName:module.name, active, available, unavailableReason:blockedBy ? `Blocked by ${blockedBy}` : '' });
            });
          });
          const temporaryEvasion = Math.max(0, Number(context.temporaryEvasion) || 0);
          if (temporaryEvasion) evasion += temporaryEvasion;
          return {
            ...base,
            hp:Math.max(1,hp), evasion, baseEvasion:base.evasion,
            thresholds:{ major:Math.max(0,major), severe:Math.max(0,severe) },
            armorSlots:Math.max(0,armorSlots), moduleSlots:base.moduleSlots,
            applied, conditional, temporaryEvasion, modules
          };
        };
        const SIGNAL_STATES = [
          { id:'stable', label:'Stable', summary:'Real-time command. The drone works normally.' },
          { id:'unstable', label:'Unstable', summary:'Simple commands work; complex tasks may take Disadvantage, a higher DC, Stress, or become impossible.' },
          { id:'lost', label:'Lost', summary:'No useful command link. The drone follows its loaded protocol, returns, freezes, or becomes dead weight.' }
        ];
        const LINK_MODES = ['Local Mesh','Direct RF Link','Private Relay Chain'];
        const DRONE_RANGES = ['Melee','Very Close','Close','Far','Very Far','Beyond Very Far'];
        const defaultSignalForRange = (range) => {
          const value = String(range || '').toLowerCase();
          if (value.indexOf('beyond') !== -1) return 'lost';
          if (value.indexOf('very far') !== -1) return 'unstable';
          return 'stable';
        };
        const armorFeatureRule = (display) => {
          const wanted = normalizeRuleName(display);
          return FEATURE_REGISTRY.find(rule => (!rule.appliesTo || rule.appliesTo.indexOf('armor') !== -1) && normalizeRuleName(rule.name) === wanted) || null;
        };
        const armorProfile = (armor) => {
          const item = armor ? hydrateArmor(armor) : null;
          if (!item) return { item:null, evasionModifier:0, attackBonus:0, traitModifiers:[], entries:[] };
          const entries = featureList(item.features).map(display => ({ display, rule:armorFeatureRule(display) }));
          const names = entries.map(entry => normalizeRuleName(entry.display));
          const has = name => names.some(value => value === normalizeRuleName(name) || value.startsWith(normalizeRuleName(name) + ' '));
          let evasionModifier = 0;
          if (has('flexible')) evasionModifier += 1;
          if (has('heavy') && !has('powered')) evasionModifier -= 1;
          if (has('very heavy')) evasionModifier -= 2;
          if (has('massive')) evasionModifier -= 2;
          const traitModifiers = [];
          if (has('servo assisted')) traitModifiers.push({ trait:'Strength', amount:1, context:'physical exertion and carrying capacity' });
          if (has('low profile')) traitModifiers.push({ trait:'Finesse', amount:1, context:'avoid visual detection' });
          if (has('silent')) traitModifiers.push({ trait:'Finesse', amount:2, context:'avoid detection by sound' });
          if (has('tactical')) traitModifiers.push({ trait:'Instinct', amount:1, context:'perception and Spotlight contests' });
          if (has('intimidating')) traitModifiers.push({ trait:'Presence', amount:1, context:'threaten, coerce, or frighten' });
          return { item, evasionModifier, attackBonus:has('assault') ? 1 : 0, traitModifiers, entries };
        };
        const augmentActivationCost = (augment, character) => {
          const item = hydrateAugment(augment);
          const stress = Number(item.activationStress);
          if (Number.isFinite(stress) && stress > 0) return { resource:'stress', amount:stress, mode:'mark' };
          const source = [item.benefit, item.drawback, item.use, item.raw && item.raw.use].filter(Boolean).join(' ');
          const parsed = parseFeatureCost(source);
          if (!parsed) return null;
          if (parsed.resource === 'hope' && character && character.path === 'sleeping') return { ...parsed, resource:'effort', alternativeFor:'hope' };
          return parsed;
        };

        const ensureThreeExperiences = (list) => {
          const out = (Array.isArray(list) ? list : []).map(exp => ({ description: String((exp && exp.description) || ''), bonus: Number(exp && exp.bonus) || 2 }));
          while (out.length < 3) out.push({ description: '', bonus: 2 });
          return out;
        };
        const parseFeatureCost = (text) => {
          const source = String(text || '');
          const match = source.match(/(?:spend|mark|cost\s*:?|\()\s*(\d+)\s*(hope|effort|resolve|stress)\b/i);
          if (!match) return null;
          return { amount: Number(match[1]) || 0, resource: match[2].toLowerCase(), mode: match[2].toLowerCase() === 'stress' ? 'mark' : 'spend' };
        };
        const parseFeatureRolls = (text, fallbackTitle) => {
          const source = String(text || '');
          const actions = [];
          const cost = parseFeatureCost(source);
          const choice = source.match(/\b(Agility|Strength|Finesse|Instinct|Presence|Knowledge)\s+or\s+(Agility|Strength|Finesse|Instinct|Presence|Knowledge)(?:\s+Spellcast)?\s+(?:Reaction\s+)?Roll\s*(?:\(DC\s*(\d+)\))?/i);
          if (choice) {
            [choice[1], choice[2]].forEach(trait => actions.push({ type: 'roll', label: fallbackTitle || 'Feature roll', trait: trait.toLowerCase(), dc: choice[3] ? Number(choice[3]) : null, cost }));
          }
          const explicit = /\b(Agility|Strength|Finesse|Instinct|Presence|Knowledge)(?:\s+Spellcast)?\s+(?:Reaction\s+)?Roll\s*(?:\(DC\s*(\d+)\))?/ig;
          let match;
          while (!actions.length && (match = explicit.exec(source)) && actions.length < 2) {
            actions.push({ type: 'roll', label: fallbackTitle || 'Feature roll', trait: match[1].toLowerCase(), dc: match[2] ? Number(match[2]) : null, cost });
          }
          if (!actions.length && /(?:roll your duality dice|duality roll|roll the duality dice)/i.test(source)) actions.push({ type: 'roll', label: fallbackTitle || 'Feature roll', trait: '', dc: null, cost });
          const namedDie = source.match(/\broll\s+(?:(?:the|a|one|your)\s+)?(Fear|Hope)\s+die\b/i);
          if (!actions.length && namedDie) actions.push({ type: 'die', label: fallbackTitle || 'Feature die', die: 12, dieName: namedDie[1], cost });
          const explicitDie = source.match(/\broll\s+(?:(?:the|a|one|your)\s+)?(?:a\s+)?d(4|6|8|10|12|20)\b/i);
          if (!actions.length && explicitDie) actions.push({ type: 'die', label: fallbackTitle || 'Feature die', die: Number(explicitDie[1]), dieName: `d${explicitDie[1]}`, cost });
          if (!actions.length && cost) actions.push({ type: 'use', label: fallbackTitle || 'Use feature', cost });
          return actions;
        };
        const FEATURE_UI_OVERRIDES_RAW = Object.freeze({
          'the power of suggestion':'3 Hope · Choose 1: ally’s next Presence/Knowledge/Finesse roll has Advantage; ally’s next attack or Finesse roll to sneak/hide has Advantage; or gain 1 relevant secret Clue from the Keeper.',
          'cultural lens':'Passive · Advantage on Social tests. Start each session with 2 Favor (max 4). Gain 1 Favor on successful Persuasion/Deception and each Long Rest. Spend Favor through class/contact effects; 5 Favor: +1 Reputation with one faction. Known culture protocol: no roll; unknown culture: Knowledge to read norms.',
          'the prepared mind':'2 Effort · Choose 1: Cite the File—gain 1 true, useful prepared fact; Anticipated Move—Reaction before the next NPC social/political action, with Advantage; Quiet Word—one NPC treats a private statement as credible. Influence: Success scene; Hope persists; Critical spreads; Fear turns against you.',
          'standing reputation':'Passive · Start each session with 2 Favor (max 4, plus background/subclass increases). Gain 1 Favor on successful Persuasion/Deception and each Long Rest. Spend through subclass/contact/institutional effects; 5 Favor: +1 Reputation. Known culture protocol: no roll; unknown culture: Knowledge to read norms.',
          'scrap genius':'3 Hope · Create one plausible temporary device from available materials. It works for the scene, then becomes unusable. Keeper determines plausibility.',
          'technical intuition':'Passive · Advantage on repair and diagnosis. 1/session, when a system fails: mark 1 Stress to make a perfect fix until your next Long Rest.',
          'brute-force diagnostic':'2 Effort · Choose 1: Find the Failure—after 1 minute, learn the exact fault and concealed sabotage; Never Rated for This—machine performs 1 tier higher for the scene, then breaks; Field Manual—the next 4 related rolls by you or instructed allies have Advantage.',
          'logged tools':'Passive · Maintain a list of 3 salvaged/prepared components. Declare one on hand when needed. Keeper may require a downtime restock between missions.',
          'pathfinder’s insight':'3 Hope · On a Travel or Scan the Area roll during a Void Crawl: roll 1 Fear die and 2 Hope dice; choose which Hope die to keep, then resolve normally.',
          "pathfinder's insight":'3 Hope · On a Travel or Scan the Area roll during a Void Crawl: roll 1 Fear die and 2 Hope dice; choose which Hope die to keep, then resolve normally.',
          'foremost survivor':'Passive · Advantage on Survival tests. 1/session: spend 1 Stress for immunity to one environmental hazard for the scene. 1/Exploration Turn: spend 1 Stress to prevent 1 segment on Supplies Running Low or Attention Drawn.',
          'methodical reconnaissance':'2 Effort · Choose 1: Margin Note—declare one recorded physical feature; Trail—learn who passed, number, direction and approximate time; Charted Route—declare a real, useful route. Keeper may add an appropriate complication.',
          'the logbook':'1/session · At a previously logged location, recall one specific recorded detail. It is accurate as of the entry date.',
          'reality unfold':'3 Hope · Gain Advantage on all rolls until you roll with Fear. When the effect ends, mark 1d4 Stress.',
          'psychic resonance & veil alignment':'Psychic Resonance: 1/round on a Mystic feature, reroll one die; if the new result is lower, mark 1 Stress. Veil Alignment: choose Lux or Void; equip only that alignment. Switch at Levels 2, 5 or 8; previous-alignment cards become dormant.',
          'the reading':'2 Effort · Study a person, place, object, active Power or Veil phenomenon with instruments/notes. Ask 1 question about exposure, signature, history, instability, likely behavior or procedure. Keeper answers truthfully to the limit of current evidence.',
          'uncanny archive':'Passive · No Loadout or Vault. At creation, unlock Level 1 in 2 different Domains. Access unlocked-path Powers through Uncanny Power and its access roll. Unlock new paths with Study Projects during Long Rests; higher-level study requires breadth at the previous level.',
          'veil surge':'3 Hope · Gain Advantage on all piloting tests and ignore one instance of Severe ship damage until your next Rest.',
          'stellar instinct':'Passive · Advantage on piloting/navigation. 1/session: reroll one failed Void-related test. When spending Hope on Finesse (Pilot/Navigate), add +1d8.',
          'stick time':'2 Effort · Choose 1: Hands on the Stick—ignore 1 environmental penalty on the next piloting maneuver, or change Failure with Fear to Failure; The Read—after 1 minute studying a vessel, learn its likely action next round; Veteran’s Burst—Advantage on the next maneuver and clear 1 Hull Stress.',
          "the ship knows you":'After flying the same primary vessel for one full mission arc, gain Practiced Pair: Advantage on practiced maneuvers with that ship. Maintain the practiced-maneuver list; add entries during mission downtime.',
          'eureka moment':'3 Hope · Automatically succeed on one research or analysis test. Keeper also reveals one hidden connection between the research and the wider campaign.',
          'pattern weaver':'Passive · Advantage on Knowledge analysis. 1/session: mark 1 Stress; Keeper reveals one hidden truth or key vulnerability relevant to the scene. During Long Rests, advance research projects with Knowledge rolls against project complexity.',
          'applied science':'2 Effort · Choose 1: Countdown—define remaining time and what changes it; Improvised Reaction—create one immediate scene-length chemical effect from local materials; Lost Source—produce a partial, complicating source on a topic believed lost.',
          'the open question':'Campaign project · Each Long Rest, roll Knowledge (DC 15): Success gains 1 new piece of information; Critical gains a substantive lead. Completion grants a permanent campaign advancement agreed with the Keeper.',
          'vanishing act':'3 Hope · Become undetectable by visual, audio, thermal, network and psionic tracking for 1 minute.',
          'shadow operative':'Passive · Advantage on Stealth; reroll one failed Evasion roll. Attack with Advantage: +1d6 Sneak Attack damage (+2d6 Tier 2; +3d6 Tier 3).',
          'hands that know':'2 Effort · Choose 1: Cased the Joint—learn one concrete weakness and gain Advantage on the job roll; False Face—use an established alternate identity for the scene; Backup Plan—1/scene, produce a contingency item, ally or information that resolves the immediate problem.',
          'the quiet network':'Sneak Attack: attack with Advantage deals +1d6 damage (+2d6 Tier 2; +3d6 Tier 3). Network: 1/session, declare a contact in the current city/station/region; Keeper defines what they will and will not do.',
          'combat surge':'After a successful attack · 2 Hope: deal +1d6 damage.',
          'combat focus':'Focus die d4, starts at 1. While Focused, choose applicable effects: reroll 1 weapon damage die per attack; add Focus die to damage or attack; or give one ally Advantage/+2 Evasion and pass them the Spotlight.',
          'the held line':'After a successful attack · 1 Effort: deal +1d6 damage.',
          'the drill':'Session start · Prepare 4 Drills. You know all 4 Common Drills and unlock 1 subclass Drill at Foundation, Specialization and Mastery. Action/Reaction Drills: 1/scene; Passive Drills remain active while prepared.',
          'path to nirvana':'3 Hope · Enter Nirvana for rounds equal to Proficiency. Choose Agility, Instinct or Strength: Advantage with that trait. Immune to Stunned and Dazed. First Melee attack in the state deals +2d6 Void damage.',
          'unbroken focus':'Without Heavy/Very Heavy armor: +1 Evasion. Unarmed and Lightweight Melee attacks gain the Energy tag and deal Void damage. 1/turn: spend 1 Stress to ignore Evasion penalties for 1 round.',
          'the refused path':'2 Effort · Enter Disciplined State for Proficiency + Presence rounds. Choose Agility, Instinct or Strength: Advantage with it and add its modifier to Melee/unarmed damage. Immune to Stunned/Dazed. First Melee hit: +2d6 branch damage. Later Melee attacks in a round have Disadvantage while 2+ enemies are in Melee.',
          'trained body':'Choose Strength or Agility for unarmed strikes. Damage: d6; d8 at Level 5; d10 at Level 8.',
          'the refusal':'1/scene · 1 Effort: impose Disadvantage on a Domain/Veil attack or Spellcast Roll, or grant Advantage on an allowed Reaction Roll.',
          'sleeping vanguard features':'Passive · Trained Body: choose Strength or Agility for unarmed strikes; d6 physical damage, d8 at Level 5, d10 at Level 8. Unbroken Focus: +1 Evasion without Heavy/Very Heavy armor; 1/scene spend 1 Effort to prevent Stress without an Action. The Refusal: 1/scene spend 1 Effort to impose Disadvantage on a Domain/Veil attack or Spellcast Roll, or grant Advantage on an allowed Reaction Roll.'
        });
        const FEATURE_UI_OVERRIDES = Object.freeze(Object.fromEntries(Object.entries(FEATURE_UI_OVERRIDES_RAW).map(([key,value]) => [normalizeRuleName(key), value])));
        const normalizeFeatureTitle = (value) => normalizeRuleName(String(value || '').replace(/\([^)]*(?:hope|effort|stress|resolve)[^)]*\)/ig, '').replace(/^(?:class|hope|effort|ancestry|community) feature\s*/i, '').trim());
        const featureDisplayText = (text, fallbackTitle) => {
          const source = String(text || '').replace(/\r/g, '').trim();
          if (!source) return '';
          const directKey = normalizeFeatureTitle(fallbackTitle);
          if (FEATURE_UI_OVERRIDES[directKey]) return FEATURE_UI_OVERRIDES[directKey];
          const chunks = source.split(/\n{2,}/).filter(Boolean);
          const replaced = chunks.map(chunk => {
            const titleMatch = chunk.match(/^([^:\n—]{2,90})(?::|\s+—\s+)/);
            const rawTitle = titleMatch ? titleMatch[1].trim() : '';
            const key = normalizeFeatureTitle(rawTitle || chunk.split(/[.:\n]/)[0]);
            if (FEATURE_UI_OVERRIDES[key]) return FEATURE_UI_OVERRIDES[key];
            return chunk
              .replace(/^>.*$/gm, '')
              .replace(/Where the Awakened[^.]*\./gi, '')
              .replace(/Where the Sleeping[^.]*\./gi, '')
              .replace(/The Sleeping [A-Za-z]+(?:'|’)s signature[^.]*\./gi, '')
              .replace(/The [A-Za-z]+ uses (?:Hope|Effort)[^.]*\./gi, '')
              .replace(/This is the smallest[^.]*\./gi, '')
              .replace(/not saved for capstone moments\.?/gi, '')
              .replace(/Discipline is small, and constant\.?/gi, '')
              .replace(/\s{2,}/g, ' ').trim();
          }).filter(Boolean).join('\n\n');
          return replaced;
        };
        const compactFeature = (text, fallbackTitle) => {
          const rawOriginal = String(text || '').replace(/\r/g, '').trim();
          const rawSource = featureDisplayText(rawOriginal, fallbackTitle);
          const source = window.VFCompactRules ? window.VFCompactRules.compactBundle(rawSource, fallbackTitle) : rawSource;
          if (!source) return { title: fallbackTitle, bullets: [], full: '', actions: [] };
          const firstLine = source.split('\n').find(Boolean) || source;
          let title = fallbackTitle;
          const titleMatch = firstLine.match(/^([^:—]{2,70})(?::|\s+—\s+)/);
          if (titleMatch) title = titleMatch[1].trim();
          let normalized = source.replace(/\s+-\s+/g, '\n').replace(/([.!?])\s+(?=[A-Z])/g, '$1\n');
          const rawLines = normalized.split(/\n+/).map(line => line.trim()).filter(Boolean);
          const bullets = [];
          rawLines.forEach(line => {
            let cleaned = line.replace(/^[-•]\s*/, '').trim();
            if (titleMatch && cleaned.indexOf(titleMatch[0]) === 0) cleaned = cleaned.slice(titleMatch[0].length).trim();
            if (!cleaned || normalizeRuleName(cleaned) === normalizeRuleName(title)) return;
            if (cleaned.length > 180) {
              const clauses = cleaned.split(/;\s+|\.\s+/).filter(Boolean);
              clauses.forEach(clause => { if (bullets.length < 5) bullets.push(clause.trim().replace(/[.]$/, '') + '.'); });
            } else if (bullets.length < 5) bullets.push(cleaned);
          });
          if (!bullets.length) bullets.push(source.length > 220 ? source.slice(0, 217).trim() + '…' : source);
          return { title, bullets: bullets.slice(0, 5), full: source, actions: parseFeatureRolls(rawSource, title) };
        };
        const compactLine = (value, limit) => {
          const text = String(value || '').replace(/\s+/g, ' ').trim();
          const max = limit || 150;
          if (text.length <= max) return text;
          const cut = text.slice(0, max - 1);
          const boundary = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
          return (boundary > 60 ? cut.slice(0, boundary) : cut).trim() + '…';
        };
        const resolveMovesForCharacter = (character) => {
          const classKey = normalizeRuleName(character && character.class);
          const subclassKey = normalizeRuleName(character && character.subclass);
          if (!classKey) return [];
          return RESOLVE_MOVE_LIBRARY.filter(move => {
            if (normalizeRuleName(move.class) !== classKey) return false;
            if (!move.subclass) return true;
            const wanted = normalizeRuleName(move.subclass);
            return subclassKey === wanted || subclassKey.indexOf(wanted) !== -1 || wanted.indexOf(subclassKey) !== -1;
          }).sort((a, b) => {
            if (!!a.subclass !== !!b.subclass) return a.subclass ? 1 : -1;
            return String(a.name || '').localeCompare(String(b.name || ''));
          });
        };
        const resolveMoveMinimum = (move) => {
          const match = String((move && move.cost) || '').match(/(\d+)/);
          return match ? Math.max(1, Number(match[1])) : 1;
        };


        // Stable per-character id. Spotlight is keyed by this id (never by name) so that
        // multiple unnamed players can still be selected/highlighted individually.
        const normalizeSessionKey = (value) => String(value || '').trim() || 'Table';
        const mkCharId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const ensureIds = (arr) => (Array.isArray(arr) ? arr : []).map(c => (c && c.id) ? c : { ...(c || {}), id: mkCharId() });

        const EMPTY_CHARACTER = {
          entityType: 'character',
          name: '', playerName: '', heritage: '', background: '', class: '', subclass: '', level: 1, proficiency: 1, pronouns: '',
          stats: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
          hp: { current: 6, max: 6 }, thresholds: { severe: 8, major: 4 },
          stress: { current: 0, max: 6 }, hope: { current: 2, max: 5 }, effort: { current: 2, max: 6 }, resolve: { current: 2, max: 2 }, path: 'awakened',
          experiences: [{ description: '', bonus: 2 }, { description: '', bonus: 2 }, { description: '', bonus: 2 }],
          evasion: 10, shields: 0, wealth: 1, credits: 0,
          playerNotes: '', savedNotes: [],
          inventory: Array(8).fill(''),
          augments: [],
          augmentInventory: [],
          augmentArsenal: [],
          activeAugmentIds: [],
          gearInventory: [],
          gearArsenal: [],
          armorInventory: [],
          armorArsenal: [],
          activeArmorId: '',
          drones: [],
          weapons: [],
          weaponInventory: [],
          weaponArsenal: [],
          activeWeaponId: '',
          domainCards: []
        };

        const EMPTY_DRONE = (() => {
          const defaults = droneGradeStats(DRONE_GRADE_CATALOG.find(item => item.slug === 'common-drone' || normalizeRuleName(item.name) === 'common drone') || DRONE_GRADE_CATALOG[0]);
          return {
            entityType:'drone', name:'', playerName:'', operatorId:'', droneGradeId:defaults.grade ? defaults.grade.id : '',
            hp:{ current:defaults.hp, max:defaults.hp }, thresholds:defaults.thresholds, evasion:defaults.evasion,
            shields:defaults.armor, armorMax:defaults.armor, moduleSlots:defaults.moduleSlots,
            installedModules:[], moduleInventory:[], droneContext:{ temporaryEvasion:0 },
            signalState:'stable', signalRange:'Close', linkMode:'Direct RF Link', loadedProtocol:'Return to the operator or nearest safe point.',
            playerNotes:'', savedNotes:[], inventory:Array(6).fill(''), weapons:[], weaponInventory:[], weaponArsenal:[], activeWeaponId:''
          };
        })();

        const PLAYER_STORAGE_KEY = 'veilfarers-player-tool-characters';
        const normalizeCharacterId = value => String(value || '').trim().toUpperCase();
        const isPendingCharacterId = value => normalizeCharacterId(value).startsWith('PENDING-');
        const playerCharacterFingerprint = item => [item && item.name,item && item.playerName,item && item.class,item && item.subclass,item && item.heritage,item && item.background].map(value => String(value || '').trim().toLowerCase()).join('|');
        const samePlayerCharacter = (left,right) => {
          if (!left || !right || left.entityType === 'drone' || right.entityType === 'drone') return false;
          const a = normalizeCharacterId(left.characterId || left.id), b = normalizeCharacterId(right.characterId || right.id);
          if (a && b && a === b) return true;
          const fpA = playerCharacterFingerprint(left), fpB = playerCharacterFingerprint(right);
          return !!fpA.replace(/\|/g,'') && fpA === fpB && (!a || !b || isPendingCharacterId(a) || isPendingCharacterId(b));
        };
        const mergePlayerCharacterRuntime = (existing,incoming) => {
          const merged = { ...(existing || {}), ...(incoming || {}) };
          ['hp','stress','hope','effort','resolve'].forEach(key => { if (existing && existing[key] && incoming && incoming[key]) merged[key] = { ...incoming[key], current:existing[key].current }; });
          ['shields','armorMarked','conditions','savedNotes','signalState'].forEach(key => { if (existing && existing[key] != null) merged[key] = existing[key]; });
          return merged;
        };
        const dedupePlayerCharacters = input => {
          const out = [];
          (Array.isArray(input) ? input : []).forEach(item => {
            if (!item) return;
            if (item.entityType === 'drone') {
              const index = out.findIndex(candidate => candidate && candidate.entityType === 'drone' && normalizeCharacterId(candidate.id || candidate.characterId) === normalizeCharacterId(item.id || item.characterId));
              if (index >= 0) out[index] = { ...out[index], ...item }; else out.push(item);
              return;
            }
            const index = out.findIndex(candidate => samePlayerCharacter(candidate,item));
            if (index >= 0) {
              const current = out[index];
              out[index] = mergePlayerCharacterRuntime(current,item);
            } else out.push(item);
          });
          return out;
        };
        const CHARACTER_TRANSFER_KEY = 'veilfarers.character.transfer.v1';
        const LATEST_SHEET_KEY = 'veilfarers.sheet.latestPayload.v1';
        const localSheetPayload = () => {
          try {
            const queued = JSON.parse(localStorage.getItem(CHARACTER_TRANSFER_KEY) || 'null');
            if (queued && queued.payload && queued.payload.fields) return queued.payload;
          } catch (e) {}
          try {
            const latest = JSON.parse(localStorage.getItem(LATEST_SHEET_KEY) || 'null');
            if (latest && latest.fields) return latest;
          } catch (e) {}
          try {
            const fields = JSON.parse(localStorage.getItem('veilfarers_sheet_fields_v2_40') || localStorage.getItem('veilfarers_sheet_fields_v2_41') || 'null');
            if (!fields) return null;
            const tracks = JSON.parse(localStorage.getItem('veilfarers_sheet_tracks_v2_40') || localStorage.getItem('veilfarers_sheet_tracks_v2_41') || '{}');
            return { app:'Veilfarers Character Sheet', version:'2.80-RC3.2', fields, tracks };
          } catch (e) { return null; }
        };
        const loadInitialCharacters = () => {
          try {
            const saved = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || 'null');
            if (Array.isArray(saved) && saved.length) return ensureIds(dedupePlayerCharacters(saved));
          } catch (e) {}
          try {
            const draft = JSON.parse(localStorage.getItem('veilfarers-character') || 'null');
            const mapped = window.veilfarersImportCreatorState && window.veilfarersImportCreatorState(draft, VF_CANON);
            if (mapped) return ensureIds([{ ...mapped, id: mapped.id || mkCharId() }]);
          } catch (e) {}
          return ensureIds([JSON.parse(JSON.stringify(EMPTY_CHARACTER))]);
        };
        
        // ENV
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        /* SVG lantern with spotlight state machine.
           on=false: unlit, pointing up. on=true: lens lights, rotates smoothly to the name,
           the beam emits from the lens focus, sways subtly with dust motes. `flicker` is
           driven by the parent so the background glow can flicker in perfect sync. */
        const Lantern = ({ on, flicker, onClick, title }) => {
          return (
            <span className={`vf-lantern ${on ? 'on' : ''} ${flicker ? 'flicker' : ''}`} onClick={onClick} title={title || 'Take spotlight'}>
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <g className="vf-lantern-rot">
                  <g className="vf-beam-group">
                    {/* warm cone emitting straight from the lens focus, widening + fading */}
                    <g className="vf-beam">
                      <path d="M12 8.5 L1 -13 L23 -13 Z" fill="url(#vfBeamGrad)" opacity="0.5" />
                      <path d="M12 8.5 L7 -12 L17 -12 Z" fill="url(#vfBeamGrad)" />
                    </g>
                    {/* dust motes drifting in the beam */}
                    <g className="vf-dust" fill="#fefce8">
                      <circle cx="11" cy="0" r="0.55" />
                      <circle cx="13.6" cy="-4.5" r="0.45" />
                      <circle cx="12" cy="3.5" r="0.4" />
                    </g>
                    {/* warm halo + bright white hot-spot right at the lens (the focus) */}
                    <circle className="vf-lens-glow vf-glow-halo" cx="12" cy="8.5" r="3.6" fill="url(#vfHaloGrad)" />
                    <ellipse className="vf-lens-glow vf-hotspot" cx="12" cy="8" rx="2.3" ry="1.4" fill="#fffdf0" />
                  </g>
                  {/* lantern body (handheld torch) */}
                  <g className="vf-body" stroke="#94a3b8" strokeWidth="1.4" strokeLinejoin="round">
                    <path d="M9 9 L15 9 L13.6 13.5 L13.6 20.5 L10.4 20.5 L10.4 13.5 Z" fill="#334155" />
                    <line x1="10.4" y1="16" x2="13.6" y2="16" stroke="#64748b" strokeWidth="0.9" />
                  </g>
                  {/* lens: dark when off, bright when on */}
                  <rect className="vf-lens-off" x="9.6" y="8.4" width="4.8" height="1.6" rx="0.5" fill="#1e293b" stroke="#475569" strokeWidth="0.6" />
                  <rect className="vf-lens-glow vf-lens-lit" x="9.6" y="8.4" width="4.8" height="1.6" rx="0.5" fill="#fef08a" stroke="#fde047" strokeWidth="0.6" />
                </g>
              </svg>
            </span>
          );
        };

        const CharacterSheet = () => {
          const [characters, setCharacters] = useState(loadInitialCharacters);
          const [activeTab, setActiveTab] = useState(0);
          useEffect(() => { try { localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(dedupePlayerCharacters(characters))); } catch (e) {} }, [characters]);
          useEffect(() => {
            const refreshFromRegistry = () => {
              try {
                const stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || '[]');
                const next = ensureIds(dedupePlayerCharacters(stored));
                if (!next.length) return;
                setCharacters(next);
                setActiveTab(current => Math.max(0, Math.min(current, next.length - 1)));
              } catch (error) { console.warn('Player Tool registry refresh failed:', error); }
            };
            window.addEventListener('veilfarers:player-record-updated', refreshFromRegistry);
            return () => window.removeEventListener('veilfarers:player-record-updated', refreshFromRegistry);
          }, []);
          
          // Estados UI
          const [showRoller, setShowRoller] = useState(false);
          const [showDiceTray, setShowDiceTray] = useState(false);
          const [showCardManager, setShowCardManager] = useState(false);
          const [showWeaponManager, setShowWeaponManager] = useState(false);
          const [showArmorManager, setShowArmorManager] = useState(false);
          const [showAugmentManager, setShowAugmentManager] = useState(false);
          const [showGearManager, setShowGearManager] = useState(false);
          const [showDroneModuleManager, setShowDroneModuleManager] = useState(false);
          const [weaponSearch, setWeaponSearch] = useState('');
          const [weaponManagerView, setWeaponManagerView] = useState('arsenal');
          const [armorSearch, setArmorSearch] = useState('');
          const [armorManagerView, setArmorManagerView] = useState('inventory');
          const [augmentSearch, setAugmentSearch] = useState('');
          const [augmentManagerView, setAugmentManagerView] = useState('inventory');
          const [gearSearch, setGearSearch] = useState('');
          const [gearManagerView, setGearManagerView] = useState('inventory');
          const [droneModuleSearch, setDroneModuleSearch] = useState('');
          const [showCustomWeaponForm, setShowCustomWeaponForm] = useState(false);
          const [customWeaponDraft, setCustomWeaponDraft] = useState({ name:'', trait:'', range:'', damage:'', feature:'' });
          const [showHistory, setShowHistory] = useState(false);
          const [showAddMenu, setShowAddMenu] = useState(false);
          const [showVault, setShowVault] = useState(false);
          const [vaultRecords, setVaultRecords] = useState([]);
          const [vaultLoading, setVaultLoading] = useState(false);
          const [vaultError, setVaultError] = useState('');
          useEffect(() => { if (!showHistory) return; const closeHistory = (event) => { if (event.key === 'Escape') setShowHistory(false); }; window.addEventListener('keydown', closeHistory); return () => window.removeEventListener('keydown', closeHistory); }, [showHistory]); 
          useEffect(() => {
            if (!showAddMenu) return;
            const closeMenu = (event) => {
              if (event.key === 'Escape') { setShowAddMenu(false); return; }
              if (event.type === 'mousedown' && !event.target.closest('[data-add-entity-menu]')) setShowAddMenu(false);
            };
            window.addEventListener('keydown', closeMenu);
            window.addEventListener('mousedown', closeMenu);
            return () => { window.removeEventListener('keydown', closeMenu); window.removeEventListener('mousedown', closeMenu); };
          }, [showAddMenu]);
          const [selectedDomain, setSelectedDomain] = useState("Tech");
          const [expandedPanels, setExpandedPanels] = useState({});
          const panelExpanded = (id) => !!expandedPanels[id];
          const togglePanel = (id) => setExpandedPanels(current => ({ ...current, [id]: !current[id] }));
          
          // Window Management
          const [pinned, setPinned] = useState({ player: false, gm: false });
          const [minimized, setMinimized] = useState({ player: false, gm: false });
          const [positions, setPositions] = useState({ player: {x: 20, y: 100}, gm: {x: 50, y: 150} });
          const [isDragging, setIsDragging] = useState(null); // 'player' or 'gm' or null
          const dragOffset = useRef({ x: 0, y: 0 });

          // Estados Roller Player
          const [rollResult, setRollResult] = useState(null);
          const [rollModifier, setRollModifier] = useState(""); 
          const [rollLabel, setRollLabel] = useState("Custom Roll");
          const SPECTRUM_KEY='veilfarers.spectrumOfFate.global.v1';
          const [useSpectrum, setUseSpectrum] = useState(() => { try { return localStorage.getItem(SPECTRUM_KEY) !== '0'; } catch (_) { return true; } });
          useEffect(() => { try { localStorage.setItem(SPECTRUM_KEY,useSpectrum?'1':'0'); } catch (_) {} }, [useSpectrum]);
          useEffect(() => { const sync=e=>{if(e.key===SPECTRUM_KEY)setUseSpectrum(e.newValue!=='0');};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync); }, []);
          const [playerRollType, setPlayerRollType] = useState('normal'); 
          const [fear, setFear] = useState(0); 
          const [playerRollerMode, setPlayerRollerMode] = useState('duality'); 

          // Estados Generic Dice Tray
          const [genDieType, setGenDieType] = useState(20);
          const [genCount, setGenCount] = useState(1);
          const [genModifier, setGenModifier] = useState(""); 
          // Limits: max 99 dice per roll, modifiers capped at ±20.
          const clampCount = (v) => { const n = parseInt(v); return String(isNaN(n) ? 1 : Math.max(1, Math.min(99, n))); };
          const clampMod = (v) => { if (v === '' || v === '-') return v; const n = parseInt(v); if (isNaN(n)) return ''; return String(Math.max(-20, Math.min(20, n))); };
          const [genResult, setGenResult] = useState(null);
          const [genBroadcast, setGenBroadcast] = useState(false);

          // Estados Firebase
          const [showConfig, setShowConfig] = useState(false);
          // Settings (gear) — currently just the app background; extensible for more later.
          const [showSettings, setShowSettings] = useState(false);
          useEffect(() => {
            if (!showSettings) return;
            const previousOverflow = document.body.style.overflow;
            const previousOverscroll = document.body.style.overscrollBehavior;
            document.body.style.overflow = 'hidden';
            document.body.style.overscrollBehavior = 'none';
            const closeSettings = (event) => { if (event.key === 'Escape') setShowSettings(false); };
            window.addEventListener('keydown', closeSettings);
            return () => {
              document.body.style.overflow = previousOverflow;
              document.body.style.overscrollBehavior = previousOverscroll;
              window.removeEventListener('keydown', closeSettings);
            };
          }, [showSettings]);
          const [bgChoice, setBgChoice] = useState(() => { try { return localStorage.getItem('veilfarers_bg') || 'none'; } catch (e) { return 'none'; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_bg', bgChoice); } catch (e) {} }, [bgChoice]);
          const BACKGROUNDS = {
            none:         { label: 'None',          img: null },
            spacestation: { label: 'Space station', img: 'assets/bg-spacestation.webp' },
            panels:       { label: 'Panels',        img: 'assets/bg-panels.webp' },
          };
          // Spotlight colour (personal, per device — does NOT sync to the table).
          const SPOT_THEMES = {
            golden: { label: 'Golden',            rgb: '253,224,71',  halo: '254,249,195', lens: '254,240,138', text: '#3a2c00', swatch: '#fde047' },
            blue:   { label: 'Cold blue',         rgb: '56,189,248',  halo: '186,230,253', lens: '125,211,252', text: '#04283a', swatch: '#38bdf8' },
            red:    { label: 'Bloody red',        rgb: '239,68,68',   halo: '254,202,202', lens: '248,113,113', text: '#fff5f5', swatch: '#ef4444' },
            white:  { label: 'Simple white',      rgb: '241,245,249', halo: '255,255,255', lens: '226,232,240', text: '#1e293b', swatch: '#f1f5f9' },
            green:  { label: 'Radioactive green', rgb: '132,204,22',  halo: '217,249,157', lens: '190,242,100', text: '#152a02', swatch: '#84cc16' },
          };
          const [spotColor, setSpotColor] = useState(() => { try { var v = localStorage.getItem('veilfarers_spot_color'); return SPOT_THEMES[v] ? v : 'golden'; } catch (e) { return 'golden'; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_spot_color', spotColor); } catch (e) {} }, [spotColor]);
          // Spotlight flicker settings (per device): on/off + base wait in seconds.
          const [flickerEnabled, setFlickerEnabled] = useState(() => { try { return localStorage.getItem('veilfarers_flicker_on') !== '0'; } catch (e) { return true; } });
          const [flickerWait, setFlickerWait] = useState(() => { try { var v = parseInt(localStorage.getItem('veilfarers_flicker_wait')); return (v >= 2 && v <= 30) ? v : 6; } catch (e) { return 6; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_flicker_on', flickerEnabled ? '1' : '0'); } catch (e) {} }, [flickerEnabled]);
          useEffect(() => { try { localStorage.setItem('veilfarers_flicker_wait', String(flickerWait)); } catch (e) {} }, [flickerWait]);
          // SESSION ID POR DEFECTO ACTUALIZADO A 'Table'
          const [sessionId, setSessionId] = useState('Table');
          const [availableTables, setAvailableTables] = useState([]);
          const [tablesLoading, setTablesLoading] = useState(false);
          const [tableDirectoryEnabled, setTableDirectoryEnabled] = useState(null);
          const inviteDefaults = window.VFTableAccess ? window.VFTableAccess.inviteFromUrl() : {table:'',invite:''};
          const [tablePass, setTablePass] = useState('');
          const [invitePasskey, setInvitePasskey] = useState(inviteDefaults.invite || '');
          useEffect(()=>{ if(inviteDefaults.table) setSessionId(inviteDefaults.table); },[]);
          const [connectedTableLocked, setConnectedTableLocked] = useState(false);
          const [newTablePass, setNewTablePass] = useState('');
          const [confirmTablePass, setConfirmTablePass] = useState('');
          const [passwordChanging, setPasswordChanging] = useState(false);
          const [isConnected, setIsConnected] = useState(false);
          const [fbServices, setFbServices] = useState(null);
          const [isSyncing, setIsSyncing] = useState(false);
          const [statusMsg, setStatusMsg] = useState('');
          const [errorMsg, setErrorMsg] = useState('');
          const unsubscribeRef = useRef(null); // Store listener unsubscription
          
          // Real-time callouts: keep one current window per player; the grid grows with the table.
          const [activeCallouts, setActiveCallouts] = useState([]);
          const calloutTimersRef = useRef(new Map());
          const seenCalloutIdsRef = useRef(new Set());
          const [calloutScale, setCalloutScale] = useState(() => { try { const value = Number(localStorage.getItem('veilfarers_callout_scale')); return value >= 0.5 && value <= 1.5 ? value : 1; } catch (e) { return 1; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_callout_scale', String(calloutScale)); } catch (e) {} }, [calloutScale]);
          const [diceSoundEnabled, setDiceSoundEnabled] = useState(() => { try { return localStorage.getItem('veilfarers_dice_sound') !== '0'; } catch (e) { return true; } });
          const [diceVolume, setDiceVolume] = useState(() => { try { const value = Number(localStorage.getItem('veilfarers_dice_volume')); return value >= 0 && value <= 1 ? value : 0.55; } catch (e) { return 0.55; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_dice_sound', diceSoundEnabled ? '1' : '0'); } catch (e) {} }, [diceSoundEnabled]);
          useEffect(() => { try { localStorage.setItem('veilfarers_dice_volume', String(diceVolume)); } catch (e) {} }, [diceVolume]);
          const audioContextRef = useRef(null);
          const [diceMode, setDiceMode] = useState(() => { try { return localStorage.getItem('veilfarers_dice_mode') === '3d' ? '3d' : '2d'; } catch (e) { return '2d'; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_dice_mode', diceMode); } catch (e) {} }, [diceMode]);
          const [dice3DStyle, setDice3DStyle] = useState(() => { try { return localStorage.getItem('veilfarers_dice_3d_style') === 'overlay' ? 'overlay' : 'box'; } catch (e) { return 'box'; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_dice_3d_style', dice3DStyle); } catch (e) {} try { window.VFDice3D && window.VFDice3D.setStyle && window.VFDice3D.setStyle(dice3DStyle); } catch (e) {} }, [dice3DStyle]);
          const [diceTrackingEnabled, setDiceTrackingEnabled] = useState(() => { try { return localStorage.getItem('veilfarers_dice_tracking') !== '0'; } catch (e) { return true; } });
          useEffect(() => {
            try { localStorage.setItem('veilfarers_dice_tracking', diceTrackingEnabled ? '1' : '0'); } catch (e) {}
            try { document.documentElement.classList.toggle('vf-disable-dice-lock', !diceTrackingEnabled); } catch (e) {}
            try { window.VFDice3D && window.VFDice3D.setTrackingEnabled && window.VFDice3D.setTrackingEnabled(diceTrackingEnabled); } catch (e) {}
          }, [diceTrackingEnabled]);
          const [diceTextureSet, setDiceTextureSet] = useState(() => { try { const saved=localStorage.getItem('veilfarers_dice_texture_set'); return saved === 'plain' ? 'plain' : (saved === 'crystal' || saved === 'biolum') ? 'crystal' : 'tech'; } catch (e) { return 'tech'; } });
          useEffect(() => { try { localStorage.setItem('veilfarers_dice_texture_set', diceTextureSet); } catch (e) {} }, [diceTextureSet]);
          const [dice3DLoad, setDice3DLoad] = useState({open:false,stage:'Idle',progress:0,error:''});
          const dice3DInitRef = useRef(null);
          const dice3DReadyRef = useRef(false);
          const rollInFlightRef = useRef(null);
          const [shakeToRollEnabled, setShakeToRollEnabled] = useState(() => { try { return localStorage.getItem('veilfarers_shake_to_roll') === '1'; } catch (e) { return false; } });
          const [shakePermission, setShakePermission] = useState('unknown');
          const shakeStateRef = useRef({lastPeak:0,firstPeak:0,cooldownUntil:0});
          useEffect(() => { try { localStorage.setItem('veilfarers_shake_to_roll', shakeToRollEnabled ? '1' : '0'); } catch (e) {} }, [shakeToRollEnabled]);
          const [timeTravelRevision, setTimeTravelRevision] = useState(0);
          // ===== NOTES / HANDOUTS =====
          const [handouts, setHandouts] = useState([]);        // incoming GM handouts (from session)
          const [openNotes, setOpenNotes] = useState([]);      // [{ id, note, min, openedAt }]
          const [showNotesPanel, setShowNotesPanel] = useState(false);
          // In-tool dialogs (replace native confirm/prompt/alert)
          const [dialog, setDialog] = useState(null);
          const showConfirm = (message, onYes, title) => setDialog({ kind: 'confirm', title: title || 'Confirm', message: message, onOk: () => { setDialog(null); if (onYes) onYes(); } });
          const showPrompt = (message, defaultValue, onSubmit, title) => setDialog({ kind: 'prompt', title: title || 'Enter a value', message: message, value: defaultValue || '', onOk: (v) => { setDialog(null); if (onSubmit) onSubmit(v); } });
          const showAlert = (message, title) => setDialog({ kind: 'alert', title: title || 'Notice', message: message, onOk: () => setDialog(null) });
          const playDiceSound = (count) => {
            if (!diceSoundEnabled || diceVolume <= 0) return;
            try {
              const AudioCtx = window.AudioContext || window.webkitAudioContext;
              if (!AudioCtx) return;
              const ctx = audioContextRef.current || new AudioCtx();
              audioContextRef.current = ctx;
              if (ctx.state === 'suspended') ctx.resume();
              const now = ctx.currentTime;
              const hits = Math.max(3, Math.min(12, Number(count) || 3));
              for (let index = 0; index < hits; index++) {
                const at = now + index * 0.028 + Math.random() * 0.018;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                osc.type = index % 2 ? 'triangle' : 'square';
                osc.frequency.setValueAtTime(120 + Math.random() * 340, at);
                filter.type = 'bandpass'; filter.frequency.setValueAtTime(500 + Math.random() * 1500, at); filter.Q.value = 0.7;
                gain.gain.setValueAtTime(0.0001, at);
                gain.gain.exponentialRampToValueAtTime(Math.max(0.001, diceVolume * (0.08 + Math.random() * 0.05)), at + 0.004);
                gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.055 + Math.random() * 0.04);
                osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
                osc.start(at); osc.stop(at + 0.12);
              }
            } catch (error) { console.warn('Dice sound unavailable:', error); }
          };
          const randomDiceValues = (groups) => {
            const values = [];
            (groups || []).forEach(group => {
              const qty = Math.max(1, Number(group.qty) || 1);
              const sides = Math.max(2, Number(group.sides) || 20);
              for (let i=0;i<qty;i++) values.push(Math.floor(Math.random()*sides)+1);
            });
            return values;
          };
          const waitForDice3DModule = async (timeoutMs = 6000) => {
            const started = Date.now();
            while (Date.now() - started < timeoutMs) {
              if (window.VFDice3D && typeof window.VFDice3D.roll === 'function') return window.VFDice3D;
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            throw new Error('The bundled 3D dice module did not finish loading.');
          };
          const promiseWithTimeout = (promise, timeoutMs, message) => new Promise((resolve, reject) => {
            const timer=setTimeout(() => reject(new Error(message)), timeoutMs);
            Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
          });
          const closeDiceLoaderSoon = () => setTimeout(() => setDice3DLoad(current => current.error ? current : {...current,open:false}), 220);
          const ensureDice3DReady = async ({showProgress=true}={}) => {
            if (dice3DInitRef.current) {
              if (dice3DReadyRef.current) return dice3DInitRef.current;
              if (showProgress) {
                setDice3DLoad(current => ({...current,open:true,error:'',stage:current.stage && current.stage !== 'Idle' ? current.stage : 'Finishing 3D initialization…',progress:Math.max(12,current.progress||0)}));
                dice3DInitRef.current.then(closeDiceLoaderSoon).catch(()=>{});
              }
              return dice3DInitRef.current;
            }
            dice3DReadyRef.current=false;
            dice3DInitRef.current = (async () => {
              setDice3DLoad({open:showProgress,stage:'Loading renderer module…',progress:12,error:''});
              const dice3D = await waitForDice3DModule();
              setDice3DLoad(current => ({...current,open:showProgress||current.open,stage:'Preparing 3D scene…',progress:36,error:''}));
              if (typeof dice3D.init === 'function') {
                const progressTimer = setTimeout(() => setDice3DLoad(current => ({...current,open:showProgress||current.open,stage:'Loading physics and dice themes…',progress:68,error:''})), 180);
                try { await promiseWithTimeout(dice3D.init(),20000,'The 3D dice engine took too long to initialize.'); } finally { clearTimeout(progressTimer); }
              }
              dice3DReadyRef.current=true;
              setDice3DLoad(current => ({...current,open:showProgress||current.open,stage:'Ready',progress:100,error:''}));
              if (showProgress) closeDiceLoaderSoon();
              return dice3D;
            })().catch(error => {
              dice3DReadyRef.current=false;
              dice3DInitRef.current = null;
              setDice3DLoad({open:showProgress,stage:'3D dice failed to load',progress:100,error:error.message || String(error)});
              throw error;
            });
            return dice3DInitRef.current;
          };
          useEffect(() => {
            if (diceMode !== '3d') return;
            const idle = window.requestIdleCallback || (callback => setTimeout(callback, 500));
            const cancel = window.cancelIdleCallback || clearTimeout;
            const id = idle(() => ensureDice3DReady({showProgress:false}).catch(() => {}));
            return () => cancel(id);
          }, [diceMode]);
          const applyDiceTextureSet = (groups) => {
            const crystalThemes = { vfHope:'vfBioHope', vfFear:'vfBioFear', vfDamage:'vfBioDamage', vfNeutral:'vfPlainNeutral' };
            const plainThemes = { vfHope:'vfPlainHope', vfFear:'vfPlainFear', vfDamage:'vfPlainDamage', vfNeutral:'vfPlainNeutral' };
            return (groups || []).map(group => {
              const base=group.theme || 'vfNeutral';
              const theme=diceTextureSet === 'plain' ? (plainThemes[base] || base) : diceTextureSet === 'crystal' ? (crystalThemes[base] || base) : base;
              return { ...group, theme };
            });
          };
          const rollVisualDice = async (groups, label, options) => {
            const executeRoll = async () => {
              const themedGroups = applyDiceTextureSet(groups);
              const count = themedGroups.reduce((n,g)=>n+(Number(g.qty)||1),0);
              playDiceSound(count || 2);
              if (diceMode === '3d') {
                try {
                  const dice3D = await ensureDice3DReady({showProgress:true});
                  const method = options && options.append && typeof dice3D.add === 'function' ? 'add' : 'roll';
                  const result = await promiseWithTimeout(
                    dice3D[method](themedGroups, { label: label || 'VeilFarers Roll', deferResults: !!(options && options.deferResults), style: dice3DStyle }),
                    14000,
                    'The 3D dice roll did not finish and was safely released.'
                  );
                  if (result && Array.isArray(result.values) && result.values.length === count) return result.values;
                  throw new Error(`The 3D renderer returned ${result && Array.isArray(result.values) ? result.values.length : 0} readable dice; ${count} were expected.`);
                } catch (error) {
                  console.warn('3D dice unavailable; using the standard roller.', error);
                  setDice3DLoad({open:true,stage:'3D dice unavailable',progress:100,error:error.message || String(error)});
                }
              }
              return randomDiceValues(themedGroups);
            };
            const previous = rollInFlightRef.current;
            const queued = (previous ? Promise.resolve(previous).catch(() => {}) : Promise.resolve()).then(executeRoll);
            rollInFlightRef.current = queued;
            try { return await queued; }
            finally { if (rollInFlightRef.current === queued) rollInFlightRef.current = null; }
          };
          const showResolvedDice = (data) => {
            if (diceMode === '3d' && window.VFDice3D && typeof window.VFDice3D.showResults === 'function') {
              try { window.VFDice3D.showResults({ ...(data || {}), style:dice3DStyle }); } catch (error) { console.warn(error); }
            }
          };
          const seenNotesRef = useRef(null);                   // Set of note ids already auto-opened (per session)
          const connectedAtRef = useRef(0);                    // when this device joined — only auto-open handouts sent after
          const loadSeenNotes = (sid) => { try { seenNotesRef.current = new Set(JSON.parse(localStorage.getItem('veilfarers_seen_notes_' + sid) || '[]')); } catch (e) { seenNotesRef.current = new Set(); } };
          const markSeenNote = (sid, nid) => { if (!seenNotesRef.current) seenNotesRef.current = new Set(); seenNotesRef.current.add(nid); try { localStorage.setItem('veilfarers_seen_notes_' + sid, JSON.stringify(Array.from(seenNotesRef.current))); } catch (e) {} };
          const openNote = (note) => { setShowNotesPanel(false); setOpenNotes(prev => prev.some(o => o.id === note.id) ? prev.map(o => o.id === note.id ? { ...o, min: false } : o) : [...prev, { id: note.id, note: note, min: false, openedAt: Date.now() }]); setPositions(prev => prev[note.id] ? prev : { ...prev, [note.id]: { x: 60 + (Object.keys(prev).length * 18) % 120, y: 90 + (Object.keys(prev).length * 22) % 140 } }); };
          const closeNote = (id) => { setOpenNotes(prev => prev.filter(o => o.id !== id)); };
          const toggleNoteMin = (id) => { setOpenNotes(prev => prev.map(o => o.id === id ? { ...o, min: !o.min } : o)); };
          const saveNoteToInventory = (note) => { showPrompt('Title for this saved note:', note.title || 'Note', (title) => { if (title === null || title === undefined) return; updateCharacter(prev => { const list = Array.isArray(prev.savedNotes) ? prev.savedNotes.slice() : []; if (list.some(s => s.note && s.note.id === note.id)) return prev; list.push({ sid: 'sn' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), title: title || note.title || 'Note', note: note }); return { ...prev, savedNotes: list }; }); }); };
          const removeSavedNote = (sid) => { updateCharacter(prev => ({ ...prev, savedNotes: (prev.savedNotes || []).filter(s => s.sid !== sid) })); };
          // Auto-open each new handout targeted at one of this device's characters, exactly once.
          useEffect(() => {
            if (!handouts || !handouts.length) return;
            if (!seenNotesRef.current) loadSeenNotes(sessionId);
            const registryActive = window.VeilFarersCharacterRegistry && window.VeilFarersCharacterRegistry.currentId ? window.VeilFarersCharacterRegistry.currentId() : '';
            const identityUser = window.netlifyIdentity && window.netlifyIdentity.currentUser ? window.netlifyIdentity.currentUser() : null;
            const myIds = [identityUser && identityUser.id, character && character.memberUid, character && character.id, character && character.characterId, registryActive].filter(Boolean);
            handouts.forEach(n => {
              if (!n || !n.id || seenNotesRef.current.has(n.id)) return;
              if (n.tableId && normalizeSessionKey(n.tableId) !== normalizeSessionKey(sessionId)) return;
              if (n.sentAt && connectedAtRef.current && n.sentAt < connectedAtRef.current - 3000) { seenNotesRef.current.add(n.id); return; } // skip stale handouts from before we joined
              const target=n.target || (Array.isArray(n.targets)?n.targets[0]:n.targets);
              const forMe = target === 'all' || n.targets === 'all' || myIds.indexOf(target) !== -1;
              if (!forMe) return;
              markSeenNote(sessionId, n.id);
              openNote(n);
            });
          }, [handouts, activeTab, sessionId]);
          const [rollerScale, setRollerScale] = useState(1);
          const [rolling, setRolling] = useState(false);
          const [rollHistory, setRollHistory] = useState([]);
          
          const fileInputRef = useRef(null);
          const isRemoteUpdate = useRef(false);
          const lastLocalEditRef = useRef(0);
          const lastFearEditRef = useRef(0);
          const [spotlight, setSpotlight] = useState('');
          // Sporadic flicker for the active spotlight: drives BOTH the lantern and the tab's
          // background wash at once. Interval + on/off are configurable in Settings.
          const [flick, setFlick] = useState(false);
          useEffect(() => {
            if (!spotlight || !flickerEnabled) { setFlick(false); return; }
            let alive = true; let t = null;
            const loop = () => {
              t = setTimeout(() => {
                if (!alive) return;
                setFlick(true);
                setTimeout(() => { if (alive) { setFlick(false); loop(); } }, 1650);
              }, flickerWait * 1000 + Math.random() * 4000); /* base wait + natural 0-4s jitter */
            };
            loop();
            return () => { alive = false; if (t) clearTimeout(t); setFlick(false); };
          }, [spotlight, flickerEnabled, flickerWait]);
          const timeoutRef = useRef(null);
          const lastBroadcastIdRef = useRef(null);
          const listenerPrimedRef = useRef(false);
          
          const normChar = (c) => {
            c = c || {};
            if (c.entityType === 'drone') {
              const gradeId = c.droneGradeId || c.droneGrade || DRONE_GRADE_CATALOG[0];
              const rawModules = (Array.isArray(c.installedModules) ? c.installedModules : []).map(item => { const canonical=findDroneModule(item); return canonical ? {...canonical,...(typeof item==='object'?item:{})} : item; }).filter(item => item && item.name);
              const uniqueModules = Array.from(new Map(rawModules.map(item => [droneModuleKey(item), item])).values());
              const droneContext = c.droneContext && typeof c.droneContext === 'object' ? c.droneContext : { temporaryEvasion:0 };
              const profile = droneDerivedProfile(gradeId, uniqueModules, droneContext);
              const maxHp = profile.hp;
              const currentHp = c.hp && c.hp.current != null ? Number(c.hp.current) : maxHp;
              const armorMax = profile.armorSlots;
              const currentShields = c.shields != null ? Number(c.shields) : armorMax;
              return {
                ...c,
                entityType:'drone',
                droneGradeId:profile.grade ? profile.grade.id : (c.droneGradeId || ''),
                hp:{ current:Math.max(0, Math.min(maxHp, Number.isFinite(currentHp) ? currentHp : maxHp)), max:maxHp },
                thresholds:profile.thresholds,
                evasion:profile.evasion,
                baseEvasion:profile.baseEvasion,
                shields:Math.max(0, Math.min(armorMax, Number.isFinite(currentShields) ? currentShields : armorMax)),
                armorMax,
                moduleSlots:profile.moduleSlots,
                installedModules:uniqueModules,
                moduleInventory:uniqueModules.map(droneModuleKey),
                droneContext,
                signalState:SIGNAL_STATES.some(state => state.id === c.signalState) ? c.signalState : defaultSignalForRange(c.signalRange),
                signalRange:DRONE_RANGES.includes(c.signalRange) ? c.signalRange : 'Close',
                linkMode:LINK_MODES.includes(c.linkMode) ? c.linkMode : 'Direct RF Link',
                loadedProtocol:c.loadedProtocol || 'Return to the operator or nearest safe point.',
                inventory:Array.isArray(c.inventory) && c.inventory.length ? c.inventory : Array(6).fill(''),
                playerNotes:c.playerNotes || '', savedNotes:c.savedNotes || [],
                hope:undefined, effort:undefined, resolve:undefined, stress:undefined,
                augments:undefined, augmentInventory:undefined, augmentArsenal:undefined, activeAugmentIds:undefined
              };
            }
            const weapons = (Array.isArray(c.weapons) ? c.weapons : []).map(hydratePlayerWeapon).filter(w => w.name);
            const storedArsenal = (Array.isArray(c.weaponArsenal) ? c.weaponArsenal : []).map(hydratePlayerWeapon).filter(w => w.name);
            const inventoryIds = Array.from(new Set((Array.isArray(c.weaponInventory) ? c.weaponInventory : []).concat(storedArsenal.map(weaponKey), weapons.map(weaponKey)).filter(Boolean)));
            const canonicalOwned = WEAPON_CATALOG.filter(item => inventoryIds.includes(weaponKey(item))).map(hydratePlayerWeapon);
            const arsenalMap = new Map();
            [...canonicalOwned, ...storedArsenal, ...weapons].forEach(item => { const key = weaponKey(item); if (key) arsenalMap.set(key, hydratePlayerWeapon(item)); });
            const weaponArsenal = Array.from(arsenalMap.values());
            const activeId = c.activeWeaponId && weapons.some(w => weaponKey(w) === c.activeWeaponId) ? c.activeWeaponId : (weapons[0] ? weaponKey(weapons[0]) : '');

            const legacyAugments = (Array.isArray(c.augments) ? c.augments : []).map(item => hydrateAugment(item)).filter(item => item.name);
            const storedAugmentArsenal = (Array.isArray(c.augmentArsenal) ? c.augmentArsenal : []).map(hydrateAugment).filter(item => item.name);
            const augmentInventory = Array.from(new Set((Array.isArray(c.augmentInventory) ? c.augmentInventory : []).concat(storedAugmentArsenal.map(augmentKey), legacyAugments.map(augmentKey)).filter(Boolean)));
            const canonicalAugments = AUGMENT_CATALOG.filter(item => augmentInventory.includes(augmentKey(item))).map(hydrateAugment);
            const augmentMap = new Map();
            [...canonicalAugments, ...storedAugmentArsenal, ...legacyAugments].forEach(item => { const key = augmentKey(item); if (key) augmentMap.set(key, hydrateAugment(item)); });
            const augmentArsenal = Array.from(augmentMap.values());
            const activeAugmentIds = (Array.isArray(c.activeAugmentIds) ? c.activeAugmentIds : []).filter(id => augmentMap.has(id));

            const legacyArmorItems = [];
            if (c.armor && (c.armor.name || c.armor.id || c.armor.canonicalId)) legacyArmorItems.push(hydrateArmor(c.armor));
            if (Array.isArray(c.armors)) c.armors.forEach(item => { const hydrated = hydrateArmor(typeof item === 'string' ? { name:item } : item); if (hydrated.name) legacyArmorItems.push(hydrateArmor(hydrated)); });
            const storedArmorArsenal = (Array.isArray(c.armorArsenal) ? c.armorArsenal : []).map(hydrateArmor).filter(item => item.name);
            const armorInventory = Array.from(new Set((Array.isArray(c.armorInventory) ? c.armorInventory : []).concat(storedArmorArsenal.map(armorKey), legacyArmorItems.map(armorKey)).filter(Boolean)));
            const canonicalArmors = ARMOR_CATALOG.filter(item => armorInventory.includes(armorKey(item))).map(hydrateArmor);
            const armorMap = new Map();
            [...canonicalArmors, ...storedArmorArsenal, ...legacyArmorItems].forEach(item => { const key = armorKey(item); if (key) armorMap.set(key, hydrateArmor(item)); });
            const armorArsenal = Array.from(armorMap.values());
            const activeArmorId = c.activeArmorId && armorMap.has(c.activeArmorId) ? c.activeArmorId : ((legacyArmorItems[0] && armorKey(legacyArmorItems[0])) || '');

            const storedGearArsenal = (Array.isArray(c.gearArsenal) ? c.gearArsenal : []).map(hydrateGear).filter(item => item.name);
            const gearInventory = Array.from(new Set((Array.isArray(c.gearInventory) ? c.gearInventory : []).concat(storedGearArsenal.map(gearKey)).filter(Boolean)));
            const canonicalGear = GEAR_CATALOG.filter(item => gearInventory.includes(gearKey(item))).map(hydrateGear);
            const gearMap = new Map();
            [...canonicalGear, ...storedGearArsenal].forEach(item => { const key = gearKey(item); if (key) gearMap.set(key, hydrateGear(item)); });
            const gearArsenal = Array.from(gearMap.values());

            return {
              ...c,
              stats: c.stats || {agility:0,strength:0,finesse:0,instinct:0,presence:0,knowledge:0},
              proficiency: Math.max(1, Math.min(6, Number(c.proficiency) || 1)),
              hp: c.hp || {current:0,max:6}, stress: c.stress || {current:0,max:6}, hope: c.hope || {current:0,max:6}, effort: c.effort || {current:0,max:6}, resolve: c.resolve || {current:0,max:2}, thresholds: c.thresholds || {major:0,severe:0},
              experiences: ensureThreeExperiences(c.experiences), weapons, weaponInventory: inventoryIds, weaponArsenal, activeWeaponId: activeId,
              inventory: Array.isArray(c.inventory) && c.inventory.length ? c.inventory : Array(8).fill('').map((_,i) => (Array.isArray(c.inventory) ? c.inventory[i] || '' : '')),
              domainCards: c.domainCards || [], powerVault: c.powerVault || [], moves: c.moves || [], subclassRank:c.subclassRank||'Foundation', resolveDie:c.resolveDie||'d4', multiclass:c.multiclass||'', multiclassDetails:c.multiclassDetails||null, advancementHistory:c.advancementHistory||[], augments: augmentArsenal, augmentInventory, augmentArsenal, activeAugmentIds, armorInventory, armorArsenal, activeArmorId, gearInventory, gearArsenal, drones: c.drones || []
            };
          };
          const character = normChar(characters[activeTab] || characters[0] || {});
          const activeCharacterIdentity = character && character.entityType !== 'drone' ? String(character.characterId || character.id || '') : '';
          useEffect(() => {
            if (!/^VF-\d{6,}$/i.test(activeCharacterIdentity)) return;
            const registry=window.VeilFarersCharacterRegistry;
            if(registry&&registry.currentId&&registry.currentId()!==activeCharacterIdentity){
              if(registry.setActive)registry.setActive(activeCharacterIdentity,{strict:false});else registry.setCurrentId(activeCharacterIdentity);
            }
          }, [activeTab, activeCharacterIdentity]);
          const availableResolveMoves = resolveMovesForCharacter(character);

          // --- DRAGGING LOGIC ---
          const getPoint = (e) => (e.touches && e.touches[0]) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
          const startDrag = (e, type) => {
              if (e.target.closest && e.target.closest('button')) return; // Prevent drag if clicking button
              const p = getPoint(e);
              const rect = e.currentTarget.parentElement.getBoundingClientRect(); 
              dragOffset.current = { x: p.x - rect.left, y: p.y - rect.top };
              setIsDragging(type);
          };

          const onDrag = (e) => {
              if (!isDragging) return;
              if (e.cancelable) e.preventDefault();
              const p = getPoint(e);
              setPositions(prev => ({ ...prev, [isDragging]: { x: p.x - dragOffset.current.x, y: p.y - dragOffset.current.y } }));
          };

          const stopDrag = () => {
              setIsDragging(null);
          };

          useEffect(() => {
              if (isDragging) {
                  window.addEventListener('mousemove', onDrag);
                  window.addEventListener('mouseup', stopDrag);
                  window.addEventListener('touchmove', onDrag, { passive: false });
                  window.addEventListener('touchend', stopDrag);
                  window.addEventListener('touchcancel', stopDrag);
              }
              return () => {
                  window.removeEventListener('mousemove', onDrag);
                  window.removeEventListener('mouseup', stopDrag);
                  window.removeEventListener('touchmove', onDrag);
                  window.removeEventListener('touchend', stopDrag);
                  window.removeEventListener('touchcancel', stopDrag);
              };
          }, [isDragging]);

          // Tap/click outside an open note window closes the topmost one (mobile-friendly).
          useEffect(() => {
              if (!openNotes.length) return;
              const handler = (e) => {
                  if (e.target && e.target.closest && (e.target.closest('.vf-note-win') || e.target.closest('.vf-notes-panel') || e.target.closest('[title="Notes"]'))) return;
                  setOpenNotes(prev => prev.slice(0, -1));
              };
              document.addEventListener('pointerdown', handler);
              return () => document.removeEventListener('pointerdown', handler);
          }, [openNotes.length]);

          // Press feedback on every button: brief scale-up + border shine.
          const lastPressRef = useRef({ x: 0, y: 0, t: 0 });
          useEffect(() => {
              const onPress = (e) => {
                  const btn = (e.target && e.target.closest) ? e.target.closest('button') : null;
                  if (!btn) return;
                  const r = btn.getBoundingClientRect();
                  lastPressRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, t: Date.now() };
                  btn.classList.remove('vf-btn-pressed');
                  void btn.offsetWidth; // restart animation
                  btn.classList.add('vf-btn-pressed');
                  setTimeout(() => btn.classList.remove('vf-btn-pressed'), 360);
              };
              document.addEventListener('pointerdown', onPress);
              return () => document.removeEventListener('pointerdown', onPress);
          }, []);

          // Fly a glowing particle from a source element in an arc to a target token, then flash-fill it.
          // Tokens whose value already rose internally but shouldn't turn coloured until the
          // particle lands (deferred fill). Keyed by "hope-2", "fear-3", "shields-1", ...
          const [pending, setPending] = useState({});
          const clearPending = (k) => setPending(p => { if (!p[k]) return p; const np = { ...p }; delete np[k]; return np; });

          const spawnParticle = (fromSel, toSel, color, fromPoint, onArrive) => {
            let arrived = false;
            const done = () => { if (arrived) return; arrived = true; if (onArrive) onArrive(); };
            try {
              const fromEl = fromSel ? document.querySelector(fromSel) : null, toEl = document.querySelector(toSel);
              if (!toEl || typeof toEl.animate !== 'function') { done(); return; }
              const tr = toEl.getBoundingClientRect();
              const ex = tr.left + tr.width / 2, ey = tr.top + tr.height / 2;
              let sx = ex - 120, sy = ey - 40;
              if (fromPoint && fromPoint.x) { sx = fromPoint.x; sy = fromPoint.y; }
              else if (fromEl) { const fr = fromEl.getBoundingClientRect(); sx = fr.left + fr.width / 2; sy = fr.top + fr.height / 2; }
              const p = document.createElement('div');
              p.className = 'vf-particle';
              p.style.background = color;
              p.style.boxShadow = '0 0 9px 3px ' + color;
              document.body.appendChild(p);
              const mx = (sx + ex) / 2 + (Math.random() * 30 - 15), my = Math.min(sy, ey) - 55 - Math.random() * 35;
              const anim = p.animate([
                  { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(0.4)', opacity: 0 },
                  { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)', opacity: 1, offset: 0.12 },
                  { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1.3)', opacity: 1, offset: 0.55 },
                  { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(0.9)', opacity: 0.9 }
              ], { duration: 720, easing: 'cubic-bezier(0.35,0,0.3,1)' });
              anim.onfinish = () => {
                  p.remove();
                  done(); // token turns coloured exactly now
                  const r = toEl.getBoundingClientRect();
                  const flash = document.createElement('div');
                  flash.className = 'vf-token-flash';
                  flash.style.left = r.left + 'px'; flash.style.top = r.top + 'px';
                  flash.style.width = r.width + 'px'; flash.style.height = r.height + 'px';
                  flash.style.color = color; flash.style.background = color;
                  document.body.appendChild(flash);
                  const fa = flash.animate([{ transform: 'scale(1)', opacity: 0.95 }, { transform: 'scale(2.3)', opacity: 0 }], { duration: 460, easing: 'ease-out' });
                  fa.onfinish = () => flash.remove();
              };
              setTimeout(done, 1400); // safety: never leave a token stuck empty
            } catch (e) { done(); }
          };

          // Break (shatter) a token into shards flying outward — for lost shields.
          const shatterAt = (sel, color) => {
            try {
              const el = document.querySelector(sel); if (!el || typeof el.animate !== 'function') return;
              const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
              for (let i = 0; i < 7; i++) {
                const shard = document.createElement('div');
                shard.className = 'vf-shard'; shard.style.background = color; shard.style.boxShadow = '0 0 4px ' + color;
                document.body.appendChild(shard);
                const ang = (Math.PI * 2 * i / 7) + Math.random() * 0.7;
                const dist = 16 + Math.random() * 22;
                const exs = cx + Math.cos(ang) * dist, eys = cy + Math.sin(ang) * dist + 12;
                const sa = shard.animate([
                    { transform: 'translate(' + cx + 'px,' + cy + 'px) scale(1) rotate(0deg)', opacity: 1 },
                    { transform: 'translate(' + exs + 'px,' + eys + 'px) scale(0.25) rotate(' + (Math.random() * 220 - 110) + 'deg)', opacity: 0 }
                ], { duration: 420 + Math.random() * 220, easing: 'cubic-bezier(0.25,0.6,0.6,1)' });
                sa.onfinish = () => shard.remove();
              }
            } catch (e) {}
          };

          // Fill tokens with a travelling particle; the token stays empty (pending) until it lands.
          const fillTokens = (key, fromIdx, toIdx, color) => {
              const lp = lastPressRef.current;
              const fromPoint = (lp && lp.x && (Date.now() - lp.t < 2500)) ? { x: lp.x, y: lp.y } : null;
              const keys = [];
              for (let i = fromIdx; i < toIdx && i < fromIdx + 8; i++) keys.push(key + '-' + i);
              if (keys.length) setPending(p => { const np = { ...p }; keys.forEach(k => np[k] = true); return np; });
              keys.forEach((k, n) => { setTimeout(() => spawnParticle('[data-resicon="' + key + '"]', '[data-token="' + k + '"]', color, fromPoint, () => clearPending(k)), n * 140); });
          };
          const breakTokens = (key, fromIdx, toIdx, color) => {
              for (let i = fromIdx; i < toIdx; i++) { const idx = i; setTimeout(() => shatterAt('[data-token="' + key + '-' + idx + '"]', color), (i - fromIdx) * 90); }
          };
          // Shield repair — inverse of the shatter: energy motes converge to the token, then it
          // flares white with glow and settles into cyan with no glow.
          const gatherToShield = (sel, onArrive) => {
              let arrived = false; const done = () => { if (arrived) return; arrived = true; if (onArrive) onArrive(); };
              try {
                  const el = document.querySelector(sel);
                  if (!el || typeof el.animate !== 'function') { done(); return; }
                  const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                  const N = 8;
                  for (let i = 0; i < N; i++) {
                      const mote = document.createElement('div'); mote.className = 'vf-gather'; document.body.appendChild(mote);
                      const ang = (Math.PI * 2 * i / N) + Math.random() * 0.5;
                      const dist = 20 + Math.random() * 16;
                      const sx = cx + Math.cos(ang) * dist, sy = cy + Math.sin(ang) * dist - 4;
                      const ma = mote.animate([
                          { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(0.5)', opacity: 0 },
                          { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)', opacity: 1, offset: 0.25 },
                          { transform: 'translate(' + cx + 'px,' + cy + 'px) scale(0.5)', opacity: 0.9 }
                      ], { duration: 480 + Math.random() * 120, easing: 'cubic-bezier(0.45,0,0.5,1)' });
                      ma.onfinish = () => mote.remove();
                  }
                  setTimeout(() => {
                      done(); // token becomes cyan now
                      const rr = el.getBoundingClientRect();
                      const flash = document.createElement('div'); flash.className = 'vf-shield-flash';
                      flash.style.left = rr.left + 'px'; flash.style.top = rr.top + 'px'; flash.style.width = rr.width + 'px'; flash.style.height = rr.height + 'px';
                      document.body.appendChild(flash);
                      const fa = flash.animate([
                          { background: '#ffffff', opacity: 0.95, filter: 'drop-shadow(0 0 3px #ffffff)' },
                          { background: '#ffffff', opacity: 1, filter: 'drop-shadow(0 0 13px #ffffff)', offset: 0.3 },
                          { background: '#67e8f9', opacity: 0, filter: 'drop-shadow(0 0 3px #67e8f9)' }
                      ], { duration: 540, easing: 'ease-out' });
                      fa.onfinish = () => flash.remove();
                  }, 520);
                  setTimeout(done, 1400);
              } catch (e) { done(); }
          };
          const repairShields = (fromIdx, toIdx) => {
              const keys = [];
              for (let i = fromIdx; i < toIdx && i < fromIdx + 8; i++) keys.push('shields-' + i);
              if (keys.length) setPending(p => { const np = { ...p }; keys.forEach(k => np[k] = true); return np; });
              keys.forEach((k, n) => { setTimeout(() => gatherToShield('[data-token="' + k + '"]', () => clearPending(k)), n * 130); });
          };

          // Hope / Effort / Shields (per character): fill on gain, shields shatter on loss.
          const prevResRef = useRef({ charId: null, hope: 0, effort: 0, shields: 0 });
          useLayoutEffect(() => {
              const cid = character.id;
              const hope = (character.hope && character.hope.current) || 0;
              const effort = (character.effort && character.effort.current) || 0;
              const shields = character.shields || 0;
              const prev = prevResRef.current;
              if (prev.charId !== cid) { prevResRef.current = { charId: cid, hope, effort, shields }; return; }
              if (hope > prev.hope) fillTokens('hope', prev.hope, hope, '#fbbf24');
              if (effort > prev.effort) fillTokens('effort', prev.effort, effort, '#fbbf24');
              if (shields > prev.shields) repairShields(prev.shields, shields); // repaired: energy converges + white flare
              if (shields < prev.shields) breakTokens('shields', shields, prev.shields, '#67e8f9'); // destroyed: shatter
              prevResRef.current = { charId: cid, hope, effort, shields };
          }, [character.id, character.hope && character.hope.current, character.effort && character.effort.current, character.shields]);

          // Fear gained (table-wide) -> red particle to the newly-filled Fear token.
          const prevFearRef = useRef(0);
          const fearSettledRef = useRef(false);
          useEffect(() => { const t = setTimeout(() => { fearSettledRef.current = true; }, 1800); return () => clearTimeout(t); }, []);
          useLayoutEffect(() => {
              const prev = prevFearRef.current;
              if (fearSettledRef.current && fear > prev) fillTokens('fear', prev, fear, '#ef4444');
              prevFearRef.current = fear;
          }, [fear]);


          // --- LOGICA DUALITY ---
          const GENERAL_EFFORT = [
            {name:"Steady Hands", cost:1, roll:true, text:"+2 before a practiced roll."},
            {name:"Read the Room", cost:1, roll:true, text:"Ask 1 tactical or social question."},
            {name:"Push Through", cost:1, roll:true, text:"Ignore 1 minor penalty on your next action."},
            {name:"The Opening", cost:2, roll:true, text:"Gain Advantage on your next roll."},
            {name:"Try Again", cost:2, roll:true, text:"Reroll one Duality die and use the new result."},
            {name:"Brace", cost:2, roll:false, text:"Reduce the next visible hit by 1 severity band."},
            {name:"Cover the Angle", cost:2, roll:false, text:"An ally in range gains +2 on their next roll this turn."},
            {name:"Second Wind", cost:3, roll:false, text:"Clear 2 Stress outside a rest. (Optional table rule.)"},
            {name:"Seize the Moment", cost:3, roll:false, text:"After a success, add 1 favorable consequence. (Optional table rule.)"}
          ];
          const useSleeperAction = (label, resource, cost, doRoll) => {
            if (doRoll) { rollDuality({label: label, extraMod: 0, spend: {resource: resource, amount: cost}}); }
            else {
              var cu = {...character};
              if (cu[resource]) { cu = {...cu, [resource]: {...cu[resource], current: Math.max(0, ((cu[resource].current)||0) - cost)}}; updateCharacter(cu); }
              logRoll({ type:"note", label: label, outcome:"", outcomeColor:"", total:"", hope:"", fear:"", playerName: (character.name||character.playerName||"Player"), timestamp: Date.now() });
            }
          };
          const useResolveMove = (move) => {
            if (!move) return;
            const available = Number((character.resolve && character.resolve.current) || 0);
            const minimum = resolveMoveMinimum(move);
            if (available < minimum) return;
            const execute = async (count) => {
              const spend = Math.max(minimum, Math.min(available, Number(count) || minimum));
              const rolls = move.rollResolve ? await rollVisualDice([{qty:spend,sides:4,theme:'vfNeutral',role:'Resolve'}], `Resolve Move: ${move.name}`) : [];
              const total = rolls.reduce((sum, value) => sum + value, 0);
              updateCharacter({ ...character, resolve: { ...(character.resolve || { max: 2 }), current: Math.max(0, available - spend) } });
              const common = {
                label: `Resolve Move: ${move.name}`,
                playerName: (character.name || character.playerName || 'Player'),
                timestamp: Date.now(),
                resourceCost: { resource: 'Resolve', amount: spend },
                details: move.text,
                resolveMove: { id: move.id, name: move.name, class: move.class, subclass: move.subclass || '', cost: move.cost }
              };
              if (move.rollResolve) logRoll({ ...common, type: 'generic', die: 4, count: spend, modifier: 0, rolls, total });
              else logRoll({ ...common, type: 'note', label: `${move.name}\n${move.text}` });
            };
            if (move.variableResolve) {
              showPrompt(`How many Resolve Dice do you spend? Available: ${available}.`, String(minimum), (value) => {
                const requested = Number(value);
                if (!Number.isInteger(requested) || requested < minimum || requested > available) {
                  showAlert(`Choose a whole number from ${minimum} to ${available}.`, 'Invalid Resolve spend');
                  return;
                }
                execute(requested);
              }, move.name);
            } else execute(minimum);
          };
          const weaponDamagePlan = (dmgStr, mult, profile) => {
              if (!dmgStr) return null;
              const match = String(dmgStr).match(/(\d*)d(\d+)\s*([+-]\s*\d+)?/i);
              if (!match) return null;
              const baseCount = parseInt(match[1] || '1', 10) || 1;
              const sides = parseInt(match[2], 10);
              const multiplier = Math.max(1, Number(mult) || 1);
              const proficiency = Math.max(1, Math.min(6, Number(profile && profile.proficiency) || 1));
              const normalCount = baseCount * proficiency;
              const keptCount = normalCount * multiplier;
              const massivePoolMultiplier = profile && profile.massive ? 2 : 1;
              return {
                baseCount,
                proficiency,
                normalCount,
                sides,
                keptCount,
                rolledCount: keptCount * massivePoolMultiplier,
                initialRolledCount: normalCount * massivePoolMultiplier,
                staticMod: match[3] ? parseInt(match[3].replace(/\s/g, ''), 10) : 0
              };
          };
          const rollWeaponDamage = async (dmgStr, mult, bonus, profile, preRolled) => {
              if (!dmgStr) return null;
              mult = mult || 1; bonus = bonus || 0; profile = profile || {};
              const plan = weaponDamagePlan(dmgStr, mult, profile);
              if (!plan) return null;
              const { baseCount, proficiency, sides, keptCount, rolledCount, staticMod } = plan;
              let rolls = Array.isArray(preRolled) ? preRolled.slice(0, rolledCount).map(Number) : [];
              if (rolls.length < rolledCount) {
                const missing = rolledCount - rolls.length;
                const additions = await rollVisualDice(
                  [{ qty: missing, sides, theme:'vfDamage', role: mult > 1 ? 'Critical Damage' : 'Damage' }],
                  profile.weapon ? `${profile.weapon.name} · ${mult > 1 ? 'Critical ' : ''}Damage` : 'Damage',
                  { deferResults:true, append: rolls.length > 0 }
                );
                rolls = rolls.concat(additions);
              }
              const physicalInitial = rolls.slice();
              const rerolls = [];
              const replacementPhysical = [];
              if (profile.brutal) {
                const ones = rolls.map((v,i)=>v===1?i:-1).filter(i=>i>=0);
                if (ones.length) {
                  const replacements = await rollVisualDice(
                    [{ qty:ones.length, sides, theme:'vfDamage', role:'Brutal reroll' }],
                    'Brutal reroll',
                    { deferResults:true, append:true }
                  );
                  ones.forEach((idx,j)=>{
                    rerolls.push({index:idx,from:1,to:replacements[j]});
                    replacementPhysical.push({logicalIndex:idx,value:replacements[j]});
                    rolls[idx]=replacements[j];
                  });
                }
              }
              let keptRolls = rolls.slice();
              const discardedIndices=[];
              if (profile.massive && rolls.length > keptCount) {
                const ranked=rolls.map((value,index)=>({value,index})).sort((a,b)=>b.value-a.value||a.index-b.index);
                const keptIndices=new Set(ranked.slice(0,keptCount).map(item=>item.index));
                rolls.forEach((value,index)=>{if(!keptIndices.has(index))discardedIndices.push(index);});
                keptRolls=ranked.slice(0,keptCount).map(item=>item.value);
              }
              const rerollMap=new Map(rerolls.map(item=>[item.index,item]));
              const damageDiceResults=rolls.map((value,index)=>({
                index,value,
                status:discardedIndices.includes(index)?'discarded':'kept',
                rerolledFrom:rerollMap.has(index)?rerollMap.get(index).from:null
              }));
              const cueDiceResults=physicalInitial.map((value,index)=>({
                index,
                value,
                status:rerollMap.has(index)?'discarded':(discardedIndices.includes(index)?'discarded':'kept'),
                role:rerollMap.has(index)?'REROLL':(discardedIndices.includes(index)?'DROP':'KEEP')
              })).concat(replacementPhysical.map((item,offset)=>({
                index:physicalInitial.length+offset,
                value:item.value,
                status:discardedIndices.includes(item.logicalIndex)?'discarded':'kept',
                role:discardedIndices.includes(item.logicalIndex)?'DROP':'KEEP'
              })));
              const paired=Number(profile.pairedBonus)||0;
              const extra=staticMod+bonus+paired;
              const sum=keptRolls.reduce((total,value)=>total+value,0);
              const ruleParts=[];
              if(proficiency>1) ruleParts.push(`Proficiency ${proficiency}: ${baseCount}d${sides} becomes ${baseCount*proficiency}d${sides}`);
              if(profile.massive) ruleParts.push(`Massive: rolled ${rolledCount}d${sides}, kept highest ${keptCount}`);
              if(profile.brutal&&rerolls.length) ruleParts.push(`Brutal: rerolled ${rerolls.length} result${rerolls.length===1?'':'s'} of 1`);
              if(paired) ruleParts.push(`Paired +${paired}`);
              const total=sum+extra;
              return {
                total,
                detail:keptRolls.join('+')+(extra?(extra>0?'+'+extra:extra):''),
                dice:keptCount+'d'+sides,
                rolledDice:rolledCount+'d'+sides,
                rolls,keptRolls,discardedIndices,damageDiceResults,cueDiceResults,rerolls,
                modifier:extra,base:String(dmgStr),rules:ruleParts,
                modifierBreakdown:{weapon:staticMod,honed:bonus,paired},
                proficiency,sides,baseCount
              };
          };
          const traitModForWeapon = (traitStr) => { if (!traitStr) return 0; var tt=String(traitStr).toLowerCase(); var ks=['agility','strength','finesse','instinct','presence','knowledge']; for (var n=0;n<ks.length;n++){ if (tt.indexOf(ks[n])!==-1) return (parseInt(character.stats && character.stats[ks[n]], 10) || 0); } return 0; };
          const rollDuality = async (opts) => {
              const o = (opts && typeof opts === 'object' && !opts.nativeEvent) ? opts : {};
              const profile = o.weapon ? weaponAttackProfile(o.weapon, character, character.weapons) : null;
              const traitBonus = profile ? profile.traitMod : 0;
              const featureAttackBonus = profile ? profile.attackBonus : 0;
              const extraMod = (parseInt(o.extraMod, 10) || 0) + traitBonus + featureAttackBonus;
              const lbl = (typeof o.label === 'string') ? o.label : (profile ? `Attack: ${profile.weapon.name}` : rollLabel);
              let hopeDie = o.hopeDie != null ? Number(o.hopeDie) : null;
              let fearDie = o.fearDie != null ? Number(o.fearDie) : null;
              const hopeWasRolled = hopeDie == null;
              const fearWasRolled = fearDie == null;
              const modVal = Math.max(-20, Math.min(20, parseInt(rollModifier, 10) || 0)) + extraMod;
              let effectiveRollType = o.rollType || playerRollType;
              if (profile && profile.heavyDisadvantage) {
                  effectiveRollType = effectiveRollType === 'advantage' ? 'normal' : 'disadvantage';
              }

              // Weapon damage joins the initial tactical roll. Critical-only extra dice
              // are appended after the Duality result because the multiplier is not known
              // until Hope and Fear settle. This avoids speculative/unused extra dice.
              const weaponDamage = profile ? profile.weapon.damage : o.weaponDamage;
              const initialDamagePlan = weaponDamage ? weaponDamagePlan(weaponDamage, 1, profile || {}) : null;
              const dualGroups=[];
              if (hopeWasRolled) dualGroups.push({qty:1,sides:12,theme:'vfHope',role:'Hope'});
              if (fearWasRolled) dualGroups.push({qty:1,sides:12,theme:'vfFear',role:'Fear'});
              if (effectiveRollType !== 'normal') dualGroups.push({qty:1,sides:6,theme:'vfNeutral',role:effectiveRollType});
              if (initialDamagePlan) dualGroups.push({qty:initialDamagePlan.initialRolledCount,sides:initialDamagePlan.sides,theme:'vfDamage',role:'Damage'});

              const dualValues=dualGroups.length ? await rollVisualDice(dualGroups,lbl,{deferResults:true}) : [];
              let cursor=0;
              const physicalCueRolls=[];
              if(hopeWasRolled) {
                hopeDie=dualValues[cursor++];
                physicalCueRolls.push({value:hopeDie,sides:12,role:'Hope'});
              }
              if(fearWasRolled) {
                fearDie=dualValues[cursor++];
                physicalCueRolls.push({value:fearDie,sides:12,role:'Fear'});
              }
              let extraDie=0;
              if(effectiveRollType!=='normal') {
                extraDie=dualValues[cursor++];
                physicalCueRolls.push({value:extraDie,sides:6,role:effectiveRollType});
              }
              const preRolledDamage = initialDamagePlan
                ? dualValues.slice(cursor, cursor + initialDamagePlan.initialRolledCount)
                : null;
              if (initialDamagePlan) {
                preRolledDamage.forEach(value => physicalCueRolls.push({value,sides:initialDamagePlan.sides,role:'Damage'}));
              }
              const total=hopeDie+fearDie+modVal+(effectiveRollType==='advantage'?extraDie:(effectiveRollType==='disadvantage'?-extraDie:0));

              let outcome = '';
              let outcomeColor = '';
              if (useSpectrum) {
                  if (hopeDie === 1 && fearDie === 1) { outcome = 'CLUMSY CRITICAL'; outcomeColor = 'text-orange-500 animate-pulse'; }
                  else if (hopeDie === 12 && fearDie === 12) { outcome = 'CRITICAL SUCCESS (Legendary)'; outcomeColor = 'text-yellow-300 animate-pulse'; }
                  else if (hopeDie === fearDie) { outcome = 'CRITICAL SUCCESS'; outcomeColor = 'text-yellow-400'; }
                  else if (hopeDie > fearDie) { outcome = 'WITH HOPE'; outcomeColor = 'text-cyan-400'; }
                  else { outcome = 'WITH FEAR'; outcomeColor = 'text-purple-400'; }
              } else {
                  if (hopeDie === fearDie) { outcome = 'CRITICAL SUCCESS'; outcomeColor = 'text-yellow-400'; }
                  else if (hopeDie > fearDie) { outcome = 'WITH HOPE'; outcomeColor = 'text-cyan-400'; }
                  else { outcome = 'WITH FEAR'; outcomeColor = 'text-purple-400'; }
              }

              const isCrit = outcome.indexOf('CRITICAL') !== -1;
              if (diceMode === '3d' && window.VFDice3D && typeof window.VFDice3D.setCritical === 'function') {
                try { window.VFDice3D.setCritical(isCrit); } catch (error) { console.warn(error); }
              }
              let dmgInfo = null;
              if (weaponDamage) {
                  const honed = (character.path === 'sleeping') ? Math.max(0, (parseInt(character.level) || 1) - 1) : 0;
                  dmgInfo = await rollWeaponDamage(weaponDamage, isCrit ? 2 : 1, honed, profile || {}, preRolledDamage);
              }

              const cueRolls=physicalCueRolls.slice(0, physicalCueRolls.length - (preRolledDamage ? preRolledDamage.length : 0));
              if (dmgInfo && Array.isArray(dmgInfo.cueDiceResults)) {
                dmgInfo.cueDiceResults.forEach(die=>cueRolls.push({
                  value:die.value,
                  sides:dmgInfo.sides,
                  role:die.role || (die.status==='discarded'?'DROP':'KEEP'),
                  drop:die.status==='discarded',
                  status:die.status
                }));
              } else if (preRolledDamage) {
                preRolledDamage.forEach(value=>cueRolls.push({value,sides:initialDamagePlan.sides,role:'Damage'}));
              }
              showResolvedDice({
                  label: lbl || 'Duality Roll', outcome, crit:isCrit, value:total,
                  modifier:total-hopeDie-fearDie,
                  hope:hopeDie,fear:fearDie,
                  rolls:[
                    {value:hopeDie,sides:12,role:'Hope'},
                    {value:fearDie,sides:12,role:'Fear'}
                  ],
                  cueRolls,
                  damage:dmgInfo && dmgInfo.total,
                  damageDiceResults:dmgInfo && dmgInfo.damageDiceResults
              });

              let charUpd = { ...character }; let charChanged = false;
              if (o.spend && o.spend.resource) {
                  const resource = o.spend.resource, amount = o.spend.amount || 1;
                  if (charUpd[resource]) {
                      const track = charUpd[resource];
                      const shouldMark = o.spend.mode === 'mark' || resource === 'stress';
                      const current = shouldMark ? Math.min(track.max || 99, (track.current || 0) + amount) : Math.max(0, (track.current || 0) - amount);
                      charUpd = { ...charUpd, [resource]: { ...track, current } }; charChanged = true;
                  }
              }
              if (/FEAR/.test(outcome)) { pushFear((fear || 0) + 1); }
              else if (/HOPE|CRITICAL/.test(outcome)) {
                  if (character.path === 'sleeping') { const effort = charUpd.effort || {current:0,max:6}; charUpd = {...charUpd, effort: {...effort, current: Math.min((effort.max||6), (effort.current||0)+1)}}; charChanged = true; }
                  else { const hope = charUpd.hope || {current:0,max:6}; charUpd = {...charUpd, hope: {...hope, current: Math.min((hope.max||6), (hope.current||0)+1)}}; charChanged = true; }
              }
              if (charChanged) updateCharacter(charUpd);
              const attackBreakdown = profile ? [
                  { label: profile.weapon.trait || 'Trait', value: traitBonus },
                  ...profile.attackBonuses.map(item => ({ label: item.replace(/\s[+-]\d+$/, ''), value: Number((item.match(/([+-]\d+)$/) || [])[1]) || 0 }))
              ] : [];
              const resultObj = {
                  hope: hopeDie, fear: fearDie, extra: extraDie, rollType: effectiveRollType,
                  total, outcome, outcomeColor, modifier: modVal, label: lbl,
                  damage: dmgInfo && dmgInfo.total, damageDetail: dmgInfo && dmgInfo.detail,
                  damageDice: dmgInfo && dmgInfo.dice, damageRolledDice: dmgInfo && dmgInfo.rolledDice,
                  damageRolls: dmgInfo && dmgInfo.rolls, damageKeptRolls: dmgInfo && dmgInfo.keptRolls,
                  damageDiscardedIndices: dmgInfo && dmgInfo.discardedIndices, damageDiceResults: dmgInfo && dmgInfo.damageDiceResults,
                  damageRerolls: dmgInfo && dmgInfo.rerolls,
                  damageRules: dmgInfo && dmgInfo.rules, damageModifier: dmgInfo ? dmgInfo.modifier : 0,
                  damageModifierBreakdown: dmgInfo && dmgInfo.modifierBreakdown, damageBase: dmgInfo && dmgInfo.base, crit: isCrit,
                  weaponName: profile && profile.weapon.name, weaponTrait: profile && profile.weapon.trait,
                  weaponRange: profile && profile.weapon.range, weaponFeatures: profile && profile.entries.map(entry => entry.display),
                  weaponEffects: profile && profile.effects, attackBreakdown,
                  playerName: character.name || character.playerName || 'Unknown',
                  resourceCost: o.spend || null,
                  type: 'duality', timestamp: Date.now()
              };
              setRollResult(resultObj);
              setRollModifier(0);
              logRoll(resultObj);
              setPlayerRollType('normal');
              if (!pinned.player) setTimeout(() => setShowRoller(false), 150);
          };
          const canPayFeatureCost = (cost) => {
              if (!cost || !cost.resource || !cost.amount) return true;
              const track = character[cost.resource];
              if (!track) return true;
              return cost.mode === 'mark' || cost.resource === 'stress' ? (track.current || 0) + cost.amount <= (track.max || 99) : (track.current || 0) >= cost.amount;
          };
          const featurePaymentOptions = (cost) => {
              if (!cost || !cost.resource || !cost.amount) return [null];
              const options = [cost];
              // Canon rule: every Hope-cost ability may instead be paid with the
              // same amount of Effort. Keep both choices visible to the player.
              if (cost.resource === 'hope') options.push({ ...cost, resource: 'effort', alternativeFor: 'hope' });
              return options;
          };
          const executeFeatureAction = async (featureKind, summary, action, selectedCost) => {
              const paymentCost = selectedCost === undefined ? (action && action.cost) : selectedCost;
              if (!action || !canPayFeatureCost(paymentCost)) return;
              const paymentLabel = paymentCost && paymentCost.amount ? ` · ${paymentCost.amount} ${paymentCost.resource}` : '';
              const label = `${featureKind}: ${summary.title}${action.dc ? ` · DC ${action.dc}` : ''}${paymentLabel}`;
              if (action.type === 'roll') {
                  const mod = action.trait ? Number(character.stats && character.stats[action.trait]) || 0 : 0;
                  rollDuality({ label, extraMod: mod, spend: paymentCost || null });
                  return;
              }
              let next = { ...character };
              if (paymentCost && next[paymentCost.resource]) {
                  const track = next[paymentCost.resource];
                  const shouldMark = paymentCost.mode === 'mark' || paymentCost.resource === 'stress';
                  const current = shouldMark ? Math.min(track.max || 99, (track.current || 0) + paymentCost.amount) : Math.max(0, (track.current || 0) - paymentCost.amount);
                  next = { ...next, [paymentCost.resource]: { ...track, current } };
                  updateCharacter(next);
              }
              if (action.type === 'die') {
                  const sides = Number(action.die) || 12;
                  const value = (await rollVisualDice([{qty:1,sides,theme:'vfNeutral',role:action.dieName || `d${sides}`}], label))[0];
                  logRoll({ type:'generic', label, rolls:[value], die:sides, count:1, modifier:0, sum:value, total:value, feature:summary.title, dieName:action.dieName || `d${sides}`, resourceCost:paymentCost || null, playerName: character.name || character.playerName || 'Player', timestamp: Date.now() });
                  return;
              }
              logRoll({ type:'note', label, playerName: character.name || character.playerName || 'Player', timestamp: Date.now(), feature: summary.title, resourceCost: paymentCost || null });
          };

          const openRollerWithStat = (statName, statValue) => {
              setRollLabel(statName.toUpperCase());
              setRollModifier(parseInt(statValue) || 0); 
              setRollResult(null);
              setGenResult(null);
              setPlayerRollType('normal'); 
              setPlayerRollerMode('duality'); 
              setShowRoller(true);
              setMinimized(prev => ({ ...prev, player: false })); // Auto maximize on open
          };

          const openMainRoller = () => {
              setRollLabel("Custom Roll");
              setRollModifier(0);
              setPlayerRollType('normal');
              setRollResult(null);
              setShowRoller(true);
              setMinimized(prev => ({ ...prev, player: false }));
          }

          // --- LOGICA GENERIC ---
          const rollGenericLogic = async (dieType, count, modifier, setResultFn, broadcast) => {
              const c = Math.max(1, Math.min(99, parseInt(count) || 1));
              const sides = parseInt(dieType) || 20;
              const rolls = await rollVisualDice([{qty:c,sides,theme:'vfNeutral',role:'Standard'}], `${c}d${sides}`);
              const sum = rolls.reduce((n,v)=>n+v,0);

              const mod = Math.max(-20, Math.min(20, parseInt(modifier, 10) || 0));
              const total = sum + mod;

              const resultObj = {
                  type: 'generic', rolls: rolls, die: sides, count: c, modifier: mod,
                  total: total, sum: sum, label: "Standard Roll",
                  playerName: character.name || character.playerName || "Unknown",
                  timestamp: Date.now()
              };
              setResultFn(resultObj);
              if (broadcast) logRoll(resultObj);
          };

          const rollGenericGM = () => {
              rollGenericLogic(genDieType, genCount, genModifier, setGenResult, genBroadcast);
              if (!pinned.gm) setTimeout(() => setShowDiceTray(false), 150);
          };
          
          const rollGenericPlayer = () => {
              rollGenericLogic(genDieType, genCount, genModifier, setGenResult, true).catch(error => setErrorMsg('Dice roll failed: ' + (error.message || error)));
              if (!pinned.player) setTimeout(() => setShowRoller(false), 150);
          };
          const setShakeToRoll = async (enabled) => {
              if (!enabled) { setShakeToRollEnabled(false); setShakePermission('disabled'); return; }
              if (typeof window.DeviceMotionEvent === 'undefined') {
                  setShakePermission('unsupported');
                  showAlert('This browser does not expose motion sensors. The normal Roll button remains available.', 'Shake to Roll unavailable');
                  return;
              }
              try {
                  if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
                      const result = await window.DeviceMotionEvent.requestPermission();
                      if (result !== 'granted') throw new Error('Motion permission was not granted.');
                  }
                  setShakePermission('granted'); setShakeToRollEnabled(true);
              } catch (error) {
                  setShakePermission('denied'); setShakeToRollEnabled(false);
                  showAlert(error.message || String(error), 'Shake to Roll permission');
              }
          };
          useEffect(() => {
              if (!shakeToRollEnabled) return;
              const onMotion = (event) => {
                  if (document.visibilityState !== 'visible' || rollInFlightRef.current) return;
                  const vector = event.acceleration && [event.acceleration.x,event.acceleration.y,event.acceleration.z].some(value => Number.isFinite(Number(value))) ? event.acceleration : event.accelerationIncludingGravity;
                  if (!vector) return;
                  const x=Number(vector.x)||0,y=Number(vector.y)||0,z=Number(vector.z)||0;
                  const magnitude=Math.sqrt(x*x+y*y+z*z);
                  const threshold=event.acceleration===vector?13:24;
                  if (magnitude < threshold) return;
                  const now=Date.now();const tracker=shakeStateRef.current;
                  if (now < tracker.cooldownUntil || now-tracker.lastPeak<110) return;
                  tracker.lastPeak=now;
                  if (!tracker.firstPeak || now-tracker.firstPeak>720) { tracker.firstPeak=now; return; }
                  tracker.firstPeak=0;tracker.cooldownUntil=now+1800;
                  try { navigator.vibrate && navigator.vibrate(35); } catch (_) {}
                  setPlayerRollerMode('duality');setMinimized(prev=>({...prev,player:false}));setShowRoller(true);
                  window.setTimeout(()=>Promise.resolve(rollDuality()).catch(error => setErrorMsg('Shake roll failed: '+(error.message||error))),80);
              };
              window.addEventListener('devicemotion',onMotion,{passive:true});
              return () => window.removeEventListener('devicemotion',onMotion);
          }, [shakeToRollEnabled,rollModifier,playerRollType]);

          // --- LOGGING / REAL-TIME CALLOUTS ---
          const makeBroadcastId = () => 'roll-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
          const rollTimeMs = (value) => {
              if (value && typeof value.toMillis === 'function') return value.toMillis();
              if (value && typeof value.seconds === 'number') return value.seconds * 1000;
              const n = Number(value); return Number.isFinite(n) ? n : 0;
          };
          const rollEventKey = (roll) => {
              if (!roll) return '';
              return roll.broadcastId || [rollTimeMs(roll.timestamp), roll.playerName || '', roll.label || '', roll.total == null ? '' : roll.total].join('|');
          };
          const calloutActorKey = (roll) => String((roll && (roll.actorId || roll.characterId || roll.playerName)) || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const registerCallout = (roll) => {
              if (!roll) return;
              const eventId = rollEventKey(roll);
              if (!eventId || seenCalloutIdsRef.current.has(eventId)) return;
              seenCalloutIdsRef.current.add(eventId);
              if (seenCalloutIdsRef.current.size > 240) seenCalloutIdsRef.current = new Set(Array.from(seenCalloutIdsRef.current).slice(-160));
              const actorKey = calloutActorKey(roll);
              setActiveCallouts(prev => [{ ...roll, actorKey }, ...prev.filter(item => item.actorKey !== actorKey)]);
              const prior = calloutTimersRef.current.get(actorKey);
              if (prior) clearTimeout(prior);
              calloutTimersRef.current.set(actorKey, setTimeout(() => {
                setActiveCallouts(prev => prev.filter(item => item.actorKey !== actorKey));
                calloutTimersRef.current.delete(actorKey);
              }, 12000));
          };
          const TIME_TRAVEL_KEY = 'veilfarers_player_time_travel_v1';
          const readTimeTravel = () => { try { return JSON.parse(localStorage.getItem(TIME_TRAVEL_KEY) || '{}') || {}; } catch (e) { return {}; } };
          const saveTimeTravelSnapshot = (eventId, stateBefore, label) => {
              if (!eventId || !stateBefore || !stateBefore.id) return;
              try {
                const all = readTimeTravel();
                all[eventId] = { characterId:stateBefore.id, timestamp:Date.now(), label:label || 'Roll', character:JSON.parse(JSON.stringify(stateBefore)) };
                const entries = Object.entries(all).sort((a,b) => Number(b[1].timestamp) - Number(a[1].timestamp)).slice(0, 40);
                localStorage.setItem(TIME_TRAVEL_KEY, JSON.stringify(Object.fromEntries(entries)));
                setTimeTravelRevision(value => value + 1);
              } catch (error) { console.warn('Unable to save time-travel snapshot:', error); }
          };
          const hasTimeTravelSnapshot = (roll) => !!readTimeTravel()[rollEventKey(roll)];
          const restoreTimeTravelSnapshot = (roll) => {
              const eventId = rollEventKey(roll);
              const snapshot = readTimeTravel()[eventId];
              if (!snapshot || !snapshot.character) { showAlert('This state is no longer available on this device.', 'Time travel unavailable'); return; }
              showConfirm(`Restore ${snapshot.character.name || 'this character'} to the state immediately before “${snapshot.label || roll.label || 'this roll'}”?`, () => {
                const restored = normChar(JSON.parse(JSON.stringify(snapshot.character)));
                setCharacters(prev => {
                  const index = prev.findIndex(item => item && item.id === snapshot.characterId);
                  if (index === -1) { setActiveTab(prev.length); return [...prev, restored]; }
                  const next = prev.slice(); next[index] = restored; setActiveTab(index); return next;
                });
                lastLocalEditRef.current = Date.now();
                showAlert('Character state restored. Cloud sync will publish this restored state if the table is connected.', 'Time travel complete');
              }, 'Restore previous state');
          };
          const logRoll = (rollData) => {
              const enrichedRoll = { ...rollData, timestamp: rollTimeMs(rollData.timestamp) || Date.now(), broadcastId: rollData.broadcastId || makeBroadcastId(), actorId: rollData.actorId || character.id || '', characterId: character.id || '' };
              saveTimeTravelSnapshot(enrichedRoll.broadcastId, character, enrichedRoll.label);
              setRollHistory(prev => [enrichedRoll, ...prev]);
              registerCallout(enrichedRoll);
              if (isConnected && window.VFTableAccess) {
                  window.VFTableAccess.api('broadcastRoll',{tableId:normalizeSessionKey(sessionId),roll:{...enrichedRoll}}).catch(e => {
                      console.error("Error broadcasting roll:", e);
                      setErrorMsg('Roll broadcast failed: ' + (e.message || e));
                  });
              }
          };
          const writeSessionField = (obj) => { if (isConnected && window.VFTableAccess) window.VFTableAccess.api('patchSession',{tableId:normalizeSessionKey(sessionId),changes:obj}).catch(function(e){console.error(e);setErrorMsg('Table update failed: '+(e.message||e));}); };
          const pushFear = (val) => { val = Math.max(0, Math.min(12, val)); lastFearEditRef.current = Date.now(); setFear(val); writeSessionField({ fearTokens: val }); };
          const takeSpotlight = (id) => { const nn = (id && id === spotlight) ? '' : (id || ''); setSpotlight(nn); writeSessionField({ spotlight: nn }); };
          const clearRollHistory = () => {
              setRollHistory([]);
              setActiveCallouts([]);
              calloutTimersRef.current.forEach(timer => clearTimeout(timer));
              calloutTimersRef.current.clear();
              try { localStorage.removeItem(TIME_TRAVEL_KEY); } catch (e) {}
              setTimeTravelRevision(value => value + 1);
              if (isConnected && window.VFTableAccess) window.VFTableAccess.api('clearRollHistory',{tableId:normalizeSessionKey(sessionId)}).catch(e => {console.error(e);setErrorMsg('Roll log reset failed: '+(e.message||e));});
          };

          // --- LOCAL SAVE / LOAD / CARD MANAGERS ---
          const addCard = (card) => { const newCards = [...(character.domainCards || [])]; if (!newCards.find(c => c.id === card.id)) { newCards.push(card); updateCharacter({ ...character, domainCards: newCards, powerVault:(character.powerVault||[]).filter(item => item.id !== card.id) }); } };
          const recallVaultCard = (card) => {
            if ((character.domainCards||[]).length >= 5) { showAlert('The active Loadout is full. Return a card to the Vault first.', 'Loadout full'); return; }
            addCard(card);
          };
          const removeCard = (cardIndex) => { const newCards = [...(character.domainCards || [])]; const removed=newCards.splice(cardIndex, 1)[0]; const vault=[...(character.powerVault||[])]; if(removed && !vault.some(item=>item.id===removed.id))vault.push(removed); updateCharacter({ ...character, domainCards: newCards, powerVault:vault }); };
          const mergePlayerRuntime = (existing, incoming) => {
            if (!existing) return incoming;
            const merged = mergePlayerCharacterRuntime(existing,incoming);
            merged.id = incoming.characterId || existing.id || incoming.id;
            merged.characterId = incoming.characterId || existing.characterId;
            return merged;
          };
          const addOrUpdateMappedCharacter = (mapped, title='Character imported') => {
            if (!mapped) { showAlert('No compatible character record was found.'); return false; }
            const persistentId = mapped.characterId || mapped.id || mkCharId();
            const incoming = { ...mapped, characterId: mapped.characterId || persistentId, id: persistentId, transferSource: mapped.transferSource || 'vault' };
            const existingIndex = characters.findIndex(item => samePlayerCharacter(item,incoming));
            const replaceBlank = existingIndex < 0 && characters.length === 1 && (!characters[0] || !characters[0].name);
            if (existingIndex >= 0) {
              const next = characters.slice();
              next[existingIndex] = mergePlayerRuntime(next[existingIndex], incoming);
              setCharacters(next); setActiveTab(existingIndex);
              showAlert('The saved build was updated without resetting current play tracks.', title);
            } else if (replaceBlank) {
              setCharacters([incoming]); setActiveTab(0); showAlert('The saved character was opened in Player Tool.', title);
            } else {
              setCharacters(dedupePlayerCharacters([...characters, incoming])); setActiveTab(characters.length); showAlert('The saved character was added to Player Tool.', title);
            }
            return true;
          };
          const registerImportedCharacter = async (mapped, sourceData, source='json-import') => {
            if(!mapped || !window.VeilFarersCharacterRegistry) return mapped;
            const existingMatch = !/^VF-\d{6,}$/i.test(String(mapped.characterId || mapped.id || ''))
              ? characters.find(item => item && item.entityType !== 'drone' && playerCharacterFingerprint(item) === playerCharacterFingerprint(mapped) && /^VF-\d{6,}$/i.test(String(item.characterId || item.id || '')))
              : null;
            if(existingMatch){
              const existingId=existingMatch.characterId || existingMatch.id;
              mapped={...mapped,characterId:existingId,id:existingId};
            }
            const registry=window.VeilFarersCharacterRegistry;
            const creatorState=sourceData && !Array.isArray(sourceData) ? (sourceData.creatorState || (sourceData.payload&&sourceData.payload.creatorState) || null) : null;
            const sheetPayload=sourceData && !Array.isArray(sourceData) ? ((sourceData.payload&&sourceData.payload.fields)?sourceData.payload:(sourceData.fields?sourceData:null)) : null;
            const ensured=await registry.ensureId({creatorState:creatorState||undefined,sheetPayload:sheetPayload||undefined,playerCharacter:mapped},{source,completedAt:new Date().toISOString()});
            const finalMapped={...mapped,characterId:ensured.characterId,id:ensured.characterId,transferSource:source};
            const record=registry.saveLocalData(ensured.characterId,{creatorState:creatorState||undefined,sheetPayload:sheetPayload||undefined,playerCharacter:finalMapped},{source,status:'active',completedAt:ensured.completedAt||new Date().toISOString()});
            registry.sync(record,{source}).catch(()=>{});
            return finalMapped;
          };
          const importCreatorDraft = () => {
            try {
              const draft = JSON.parse(localStorage.getItem('veilfarers-character') || 'null');
              const mapped = window.veilfarersImportCreatorState && window.veilfarersImportCreatorState(draft, VF_CANON);
              if (!mapped) { showAlert('No saved Character Creator draft was found on this device.'); return; }
              addOrUpdateMappedCharacter(mapped, 'Creator draft imported');
            } catch (err) { showAlert('The saved Character Creator draft could not be imported.'); }
          };
          const addImportedSheetCharacter = (mapped, title='Charsheet imported') => addOrUpdateMappedCharacter(mapped && { ...mapped, transferSource:'charsheet' }, title);
          const importCharsheet = () => {
            try {
              const payload = localSheetPayload();
              const mapped = payload && window.veilfarersImportSheet && window.veilfarersImportSheet(payload, VF_CANON);
              addImportedSheetCharacter(mapped);
            } catch (err) { showAlert('The Charsheet could not be imported: ' + err.message); }
          };
          const openCurrentLevelUp = () => {
            const id = character && character.characterId;
            const registry = window.VeilFarersCharacterRegistry;
            if (!id || !registry || !registry.get(id)) { showAlert('Open a completed Character Vault record before using Level Up.', 'Level Up unavailable'); return; }
            if(registry.setActive)registry.setActive(id,{strict:false});else registry.setCurrentId(id);
            window.location.href='/creator.html#level-up';
          };
          const openCharacterVault = async () => {
            setShowAddMenu(false); setShowVault(true); setVaultLoading(true); setVaultError('');
            const registry = window.VeilFarersCharacterRegistry;
            if (!registry) { setVaultError('Character Vault registry is not loaded.'); setVaultLoading(false); return; }
            setVaultRecords(registry.listForCurrentUser ? registry.listForCurrentUser({includeUnowned:true,completedOnly:true}) : registry.list());
            try { const records = await registry.refreshVault({force:true}); setVaultRecords(records); }
            catch (error) { setVaultError(error.message || String(error)); setVaultRecords(registry.listForCurrentUser ? registry.listForCurrentUser({includeUnowned:true,completedOnly:true}) : registry.list()); }
            finally { setVaultLoading(false); }
          };
          const openVaultCharacter = async (record) => {
            try {
              const payload = record && record.characterData && record.characterData.sheetPayload;
              let mapped = payload && window.veilfarersImportSheet && window.veilfarersImportSheet(payload, VF_CANON);
              if (!mapped && record && record.characterData && record.characterData.creatorState && window.veilfarersImportCreatorState) mapped = window.veilfarersImportCreatorState(record.characterData.creatorState, VF_CANON);
              if (!mapped && record && record.characterData && record.characterData.playerCharacter) mapped = normChar(record.characterData.playerCharacter);
              if (!mapped) throw new Error('This Vault record has no compatible build payload.');
              mapped = { ...mapped, characterId: record.characterId, id: record.characterId, transferSource:'character-vault' };
              const registry=window.VeilFarersCharacterRegistry;if(registry&&registry.setActive)await registry.setActive(record.characterId,{strict:false});
              if (addOrUpdateMappedCharacter(mapped, 'Character Vault')) setShowVault(false);
            } catch (error) { setVaultError(error.message || String(error)); }
          };
          const saveToFile = () => { const dataStr = JSON.stringify(characters, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `veilfarers_session_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
          const loadFromFile = (event) => {
            const file = event.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const loadedData = JSON.parse(e.target.result);
                const sheetPayload = loadedData && loadedData.payload && loadedData.payload.fields ? loadedData.payload : loadedData;
                if (sheetPayload && sheetPayload.fields && window.veilfarersImportSheet) {
                  const mapped = window.veilfarersImportSheet(sheetPayload, VF_CANON);
                  if (mapped) { const registered=await registerImportedCharacter(mapped,sheetPayload,'json-sheet-import'); addImportedSheetCharacter(registered, 'JSON imported and added to Vault'); event.target.value=''; return; }
                }
                const creatorState = loadedData && loadedData.creatorState ? loadedData.creatorState : loadedData;
                if (creatorState && !Array.isArray(creatorState) && window.veilfarersImportCreatorState) {
                  const mappedState = window.veilfarersImportCreatorState(creatorState, VF_CANON);
                  if (mappedState) {
                    const registered=await registerImportedCharacter(mappedState,loadedData,'json-creator-import');
                    addOrUpdateMappedCharacter(registered, 'JSON imported and added to Vault');
                    event.target.value=''; return;
                  }
                }
                if (Array.isArray(loadedData)) { const imported=[]; for(const item of loadedData){const registered=await registerImportedCharacter(normChar(item),{playerCharacter:item},'json-player-import');imported.push(registered);} const next=dedupePlayerCharacters([...characters,...imported]); setCharacters(next); const firstId=imported[0]&&(imported[0].characterId||imported[0].id); const selected=Math.max(0,next.findIndex(item=>normalizeCharacterId(item.characterId||item.id)===normalizeCharacterId(firstId))); setActiveTab(selected); }
                else { throw new Error('Unsupported character JSON'); }
              } catch (err) { showAlert('Error loading file: ' + err.message); }
            };
            reader.readAsText(file); event.target.value = '';
          };
          const sheetTransferConsumedRef = useRef(false);
          useEffect(() => {
            if (sheetTransferConsumedRef.current) return;
            const params = new URLSearchParams(window.location.search);
            if (params.get('from') !== 'sheet' || params.get('import') !== '1') return;
            sheetTransferConsumedRef.current = true;
            try {
              const queued = JSON.parse(localStorage.getItem(CHARACTER_TRANSFER_KEY) || 'null');
              const payload = queued && queued.target === 'player-tool' ? queued.payload : localSheetPayload();
              const mapped = payload && window.veilfarersImportSheet && window.veilfarersImportSheet(payload, VF_CANON);
              if (mapped) {
                registerImportedCharacter(mapped,payload,'charsheet-transfer').then(function(registered){addOrUpdateMappedCharacter(registered,'Transfer complete');});
              } else showAlert('The queued Charsheet transfer was not compatible.');
              localStorage.removeItem(CHARACTER_TRANSFER_KEY);
            } catch (err) { showAlert('Charsheet transfer failed: ' + err.message); }
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', cleanUrl);
          }, []);

          // --- FIREBASE LOGIC UPDATED ---
          const fetchTables = async () => {
              setTablesLoading(true);
              try {
                  let svc=fbServices;if(!svc){svc=await window.initFirebase();setFbServices(svc);}
                  setTableDirectoryEnabled(true);
                  const tables=await window.VFTableAccess.list();
                  setAvailableTables(tables.map(tb=>({...tb,players:tb.members||0})));
              } catch(e){console.error('fetchTables',e);setStatusMsg('Could not list tables: '+e.message);setAvailableTables([]);}
              setTablesLoading(false);
          };
          // Tables list is always shown: refresh it every time the config modal opens.
          useEffect(() => { if (showConfig) fetchTables(); }, [showConfig]);
          // Table passwords use PBKDF2-SHA256 with a random salt. Legacy SHA-256
          // records remain readable and are replaced the next time the password changes.
          const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
          const base64ToBytes = (value) => Uint8Array.from(atob(String(value || '')), ch => ch.charCodeAt(0));
          const legacyHashPass = async (txt) => {
              const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('veilfarers:' + txt));
              return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
          };
          const derivePasswordHash = async (txt, saltValue, iterations) => {
              const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(txt || '')), 'PBKDF2', false, ['deriveBits']);
              const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt:base64ToBytes(saltValue), iterations:Number(iterations)||150000 }, key, 256);
              return bytesToBase64(new Uint8Array(bits));
          };
          const makePasswordRecord = async (txt) => {
              const salt = crypto.getRandomValues(new Uint8Array(16));
              const record = { algorithm:'PBKDF2-SHA256', iterations:150000, salt:bytesToBase64(salt) };
              record.hash = await derivePasswordHash(txt, record.salt, record.iterations);
              return record;
          };
          const passwordRecordToken = (record) => record ? JSON.stringify({ algorithm:record.algorithm, iterations:record.iterations, salt:record.salt, hash:record.hash }) : '';
          const verifyTablePassword = async (existing, cleanSessionId, suppliedPass) => {
              if (existing && existing.passAuth && existing.passAuth.hash) {
                  const expectedToken = passwordRecordToken(existing.passAuth);
                  const cached = localStorage.getItem('veilfarers_tableauth_' + cleanSessionId);
                  if (!suppliedPass && cached === expectedToken) return true;
                  if (!suppliedPass) return false;
                  const candidate = await derivePasswordHash(suppliedPass, existing.passAuth.salt, existing.passAuth.iterations);
                  const ok = candidate === existing.passAuth.hash;
                  if (ok) localStorage.setItem('veilfarers_tableauth_' + cleanSessionId, expectedToken);
                  return ok;
              }
              if (existing && existing.passHash) {
                  const cached = localStorage.getItem('veilfarers_tablepass_' + cleanSessionId);
                  const candidate = suppliedPass ? await legacyHashPass(suppliedPass) : cached;
                  const ok = candidate === existing.passHash;
                  if (ok) localStorage.setItem('veilfarers_tablepass_' + cleanSessionId, existing.passHash);
                  return ok;
              }
              return true;
          };
          const connectToCloud = async () => {
              setErrorMsg('');
              if(!window.initFirebase||!window.VFTableAccess){setStatusMsg('Cloud table services are not loaded.');return;}
              try{
                  setStatusMsg('Authorizing table…');
                  const services=await window.initFirebase();
                  const cleanSessionId=normalizeSessionKey(sessionId);
                  const access=await window.VFTableAccess.authorize({tableId:cleanSessionId,password:String(tablePass||''),invite:String(invitePasskey||''),createIfMissing:true});
                  setFbServices(services);setIsConnected(true);setConnectedTableLocked(!!access.locked);setShowConfig(false);setStatusMsg('Connected.');
                  startListening(services,cleanSessionId);localStorage.setItem('veilfarers_session_id',cleanSessionId);setSessionId(cleanSessionId);setTablePass('');setInvitePasskey('');
                  window.VFTableAccess.mountAdmin(cleanSessionId,access.role);
                  const cleanUrl=window.location.pathname+window.location.hash;window.history.replaceState({},'',cleanUrl);
              }catch(err){setStatusMsg('Connection failed.');setErrorMsg(err.message);console.error(err);}
          };
          const changeConnectedTablePassword = async () => {
              if(!isConnected){setErrorMsg('Connect to the table first.');return;}
              const password=String(newTablePass||'');if(password&&password.length<4){setErrorMsg('Use at least 4 characters, or use Table Admin to remove the password.');return;}
              if(password!==String(confirmTablePass||'')){setErrorMsg('The new password fields do not match.');return;}
              setPasswordChanging(true);setErrorMsg('');
              try{const out=await window.VFTableAccess.api('setPassword',{tableId:normalizeSessionKey(sessionId),password});setConnectedTableLocked(!!out.locked);setNewTablePass('');setConfirmTablePass('');setStatusMsg('Table password updated.');fetchTables();}
              catch(error){setErrorMsg('Password update failed: '+error.message);}setPasswordChanging(false);
          };
          const disconnectFromCloud = () => {
              if (unsubscribeRef.current) {
                  unsubscribeRef.current(); // Stop listening
                  unsubscribeRef.current = null;
              }
              setFbServices(null);
              setIsConnected(false);
              setConnectedTableLocked(false);
              setNewTablePass(''); setConfirmTablePass('');
              setStatusMsg("Disconnected.");
              setHandouts([]); setOpenNotes([]); seenNotesRef.current = null;
          };

          useEffect(() => {
              const savedSession = localStorage.getItem('veilfarers_session_id');
              if (savedSession) setSessionId(savedSession);
          }, []);

          useEffect(() => {
              const expired = (event) => {
                  if (unsubscribeRef.current) { try { unsubscribeRef.current(); } catch(_) {} unsubscribeRef.current=null; }
                  setFbServices(null);setIsConnected(false);setConnectedTableLocked(false);
                  setStatusMsg('Login expired. Sign in again to reconnect the table.');
                  setErrorMsg((event && event.detail && event.detail.message) || 'Your VeilFarers login expired.');
              };
              window.addEventListener('veilfarers:auth-expired', expired);
              return () => window.removeEventListener('veilfarers:auth-expired', expired);
          }, []);

          useEffect(() => {
              if (!isConnected || !sessionId || !window.VFTableAccess) return;
              let stopped=false, busy=false;
              const pollHandouts=async()=>{
                  if(stopped||busy)return;busy=true;
                  try{
                      const out=await window.VFTableAccess.api('readSession',{tableId:normalizeSessionKey(sessionId)});
                      const notes=out&&out.session&&Array.isArray(out.session.handouts)?out.session.handouts:[];
                      if(!stopped)setHandouts(notes.filter(n=>!n||!n.tableId||normalizeSessionKey(n.tableId)===normalizeSessionKey(sessionId)));
                  }catch(error){
                      if(!stopped && window.VFTableAccess && window.VFTableAccess.isAuthError && window.VFTableAccess.isAuthError(error)){
                          stopped=true;clearInterval(timer);setIsConnected(false);setConnectedTableLocked(false);
                          setStatusMsg('Login expired. Sign in again to reconnect the table.');setErrorMsg(error.message||'Login expired.');
                      }else if(!stopped)console.warn('Keeper Notes polling unavailable:',error.message||error);
                  }finally{busy=false;}
              };
              pollHandouts();
              const timer=setInterval(pollHandouts,1250);
              return()=>{stopped=true;clearInterval(timer);};
          }, [isConnected, sessionId]);

          const startListening = (services, session) => {
              loadSeenNotes(session);
              connectedAtRef.current = Date.now();
              listenerPrimedRef.current = false;
              lastBroadcastIdRef.current = null;
              const { db, doc, onSnapshot } = services;
              // CORRECT PATH: artifacts/{appId}/public/data/sessions/{sessionId}
              const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', session);

              unsubscribeRef.current = onSnapshot(docRef, (docSnap) => {
                  const snapshotExists = typeof docSnap.exists === 'function' ? docSnap.exists() : !!docSnap.exists;
                  if (snapshotExists) {
                      const data = docSnap.data();
                      if (data.characters && (Date.now() - lastLocalEditRef.current > 2500)) {
                          isRemoteUpdate.current = true;
                          setCharacters(ensureIds(data.characters));
                          setTimeout(() => isRemoteUpdate.current = false, 500);
                      }
                      if (typeof data.fearTokens === 'number' && (Date.now() - lastFearEditRef.current > 2500)) { setFear(data.fearTokens); }
                      if (typeof data.spotlight === 'string') { setSpotlight(data.spotlight); }
                      if (Array.isArray(data.handouts) && data.handouts.length) setHandouts(data.handouts.filter(n => !n || !n.tableId || normalizeSessionKey(n.tableId) === normalizeSessionKey(session)));
                      if (data.rollHistory && Array.isArray(data.rollHistory)) {
                          const sortedHistory = data.rollHistory.filter(r => !r || !r.visibility || r.visibility === 'public').sort((a, b) => rollTimeMs(b.timestamp) - rollTimeMs(a.timestamp));
                          setRollHistory(sortedHistory);
                          const freshCutoff = Math.max(connectedAtRef.current - 2000, Date.now() - 12000);
                          sortedHistory.filter(item => rollTimeMs(item.timestamp) >= freshCutoff).slice(0, 12).reverse().forEach(registerCallout);
                      }
                      if (data.lastRoll && (!data.lastRoll.visibility || data.lastRoll.visibility === 'public')) {
                          const incoming = { ...data.lastRoll, timestamp: rollTimeMs(data.lastRoll.timestamp) || Date.now() };
                          const incomingKey = rollEventKey(incoming);
                          const isInitialSnapshot = !listenerPrimedRef.current;
                          const isFreshInitialEvent = incoming.timestamp >= connectedAtRef.current - 2000;
                          const isNewEvent = incomingKey && incomingKey !== lastBroadcastIdRef.current;
                          listenerPrimedRef.current = true;
                          lastBroadcastIdRef.current = incomingKey;
                          if (isNewEvent && (!isInitialSnapshot || isFreshInitialEvent)) {
                              setRolling(true); setTimeout(() => setRolling(false), 750);
                              registerCallout(incoming);
                          }
                      } else {
                          listenerPrimedRef.current = true;
                      }
                  } else {
                      setStatusMsg("New session created.");
                  }
              }, (error) => {
                   console.error("Snapshot error:", error);
                   setErrorMsg(`Permission error: ${error.code || error.message}`);
                   setStatusMsg("Sync error");
              });
          };

          // Auto-save effect
          useEffect(() => {
              if (!isConnected || !fbServices || isRemoteUpdate.current) return;
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setIsSyncing(true);
              timeoutRef.current = setTimeout(async () => {
                  const { db, doc, setDoc } = fbServices;
                  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', normalizeSessionKey(sessionId));
                  try {
                      const identityUser = window.netlifyIdentity && window.netlifyIdentity.currentUser ? window.netlifyIdentity.currentUser() : null;
                      const accountUid = identityUser && identityUser.id ? identityUser.id : '';
                      const ownedCharacters = characters.map(item => item && item.entityType !== 'drone' && accountUid ? { ...item, memberUid: accountUid } : item);
                      const savePayload = { characters: ownedCharacters, lastUpdated: new Date().toISOString() };
                      const undefinedPaths = window.vfFindUndefinedPaths(savePayload);
                      if (undefinedPaths.length) console.warn('Character session contained optional undefined values; normalized before save:', undefinedPaths);
                      await setDoc(docRef, savePayload, { merge: true });
                      setIsSyncing(false);
                  } catch (e) { 
                      console.error(e); 
                      setIsSyncing(false); 
                      setErrorMsg("Save error: " + e.message);
                  }
              }, 1000);
              return () => clearTimeout(timeoutRef.current);
          }, [characters, isConnected, fbServices, sessionId]);

          // --- GESTIÓN LOCAL (Helpers) ---
          const updateCharacter = (updates) => { lastLocalEditRef.current = Date.now(); setCharacters(prev => { const newChars = [...prev]; const currentVal = newChars[activeTab]; const newVal = typeof updates === 'function' ? updates(currentVal) : { ...currentVal, ...updates }; newChars[activeTab] = newVal; return newChars; }); };
          const addNewCharacter = (entityType = 'character') => {
            setShowAddMenu(false);
            const template = entityType === 'drone' ? EMPTY_DRONE : EMPTY_CHARACTER;
            const nextEntity = { ...JSON.parse(JSON.stringify(template)), id: mkCharId(), entityType: entityType === 'drone' ? 'drone' : 'character' };
            setCharacters(prev => { setActiveTab(prev.length); return [...prev, nextEntity]; });
          };
          const deleteCharacter = (e, index) => { e.stopPropagation(); const nm = (characters[index] && characters[index].name) || ('P' + (index + 1)); showConfirm('Close the tab for "' + nm + '"? This character will be removed from this device (cloud/saved copies are not affected).', () => { if (characters.length === 1) { setCharacters([{ ...JSON.parse(JSON.stringify(EMPTY_CHARACTER)), id: mkCharId(), entityType: 'character' }]); return; } const newChars = characters.filter((_, i) => i !== index); setCharacters(newChars); if (activeTab >= index && activeTab > 0) setActiveTab(activeTab - 1); }); };
          const handleStatChange = (stat, value) => updateCharacter(prev => ({ ...prev, stats: { ...prev.stats, [stat]: parseInt(value) || 0 } }));
          const handleExperienceChange = (index, field, value) => { const newExperiences = [...character.experiences]; newExperiences[index][field] = value; updateCharacter({ ...character, experiences: newExperiences }); };
          const addAugmentationRow = () => updateCharacter(prev => ({ ...prev, augments: [...(Array.isArray(prev.augments) ? prev.augments : []), { name:'', tier:'', benefit:'' }] }));
          const updateAugmentationField = (index, field, value) => updateCharacter(prev => {
            const list = Array.isArray(prev.augments) ? prev.augments.slice() : [];
            const current = list[index] || { name:'', tier:'', benefit:'' };
            list[index] = { ...current, [field]: value };
            return { ...prev, augments: list };
          });
          const removeAugmentationRow = (index) => updateCharacter(prev => ({ ...prev, augments: (Array.isArray(prev.augments) ? prev.augments : []).filter((_, i) => i !== index) }));

          const equippedWeapons = (character.weapons || []).map(hydratePlayerWeapon).filter(weapon => weapon.name);
          const equippedKeys = new Set(equippedWeapons.map(weaponKey));
          const arsenalMap = new Map();
          (character.weaponArsenal || []).map(hydratePlayerWeapon).concat(equippedWeapons).forEach(weapon => { const key = weaponKey(weapon); if (key) arsenalMap.set(key, weapon); });
          (character.weaponInventory || []).forEach(key => {
            if (arsenalMap.has(key)) return;
            const canonical = WEAPON_CATALOG.find(item => weaponKey(item) === key);
            if (canonical) arsenalMap.set(key, hydratePlayerWeapon(canonical));
          });
          const arsenalWeapons = Array.from(arsenalMap.values()).sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
          const arsenalKeys = new Set(arsenalWeapons.map(weaponKey));
          const activeWeapon = equippedWeapons.find(weapon => weaponKey(weapon) === character.activeWeaponId) || equippedWeapons[0] || null;
          const activeWeaponProfile = activeWeapon ? weaponAttackProfile(activeWeapon, character, equippedWeapons) : null;
          const setActiveWeapon = (weapon) => updateCharacter({ ...character, activeWeaponId: weaponKey(weapon) });
          const toggleWeaponEquip = (weapon) => {
              const hydrated = hydratePlayerWeapon(weapon);
              const key = weaponKey(hydrated);
              const current = equippedWeapons.slice();
              const exists = current.some(item => weaponKey(item) === key);
              const nextWeapons = exists ? current.filter(item => weaponKey(item) !== key) : current.concat([hydrated]);
              const nextArsenalMap = new Map(arsenalWeapons.map(item => [weaponKey(item), item]));
              nextArsenalMap.set(key, hydrated);
              const nextArsenal = Array.from(nextArsenalMap.values());
              const nextInventory = nextArsenal.map(weaponKey).filter(Boolean);
              const nextActive = exists && character.activeWeaponId === key ? (nextWeapons[0] ? weaponKey(nextWeapons[0]) : '') : (character.activeWeaponId || key);
              updateCharacter({ ...character, weapons: nextWeapons, weaponInventory: nextInventory, weaponArsenal: nextArsenal, activeWeaponId: nextActive });
          };
          const removeWeaponFromArsenal = (weapon) => {
              const key = weaponKey(weapon);
              if (equippedKeys.has(key)) return;
              const nextArsenal = arsenalWeapons.filter(item => weaponKey(item) !== key);
              updateCharacter({ ...character, weaponInventory: nextArsenal.map(weaponKey), weaponArsenal: nextArsenal });
          };
          const addCustomWeapon = () => {
              const name = String(customWeaponDraft.name || '').trim();
              if (!name) return;
              const custom = hydratePlayerWeapon({
                id: 'custom:' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
                name, trait: customWeaponDraft.trait, range: customWeaponDraft.range,
                damage: customWeaponDraft.damage, feature: customWeaponDraft.feature
              });
              const nextArsenal = arsenalWeapons.concat([custom]);
              updateCharacter({
                ...character,
                weapons: equippedWeapons.concat([custom]),
                weaponInventory: nextArsenal.map(weaponKey),
                weaponArsenal: nextArsenal,
                activeWeaponId: character.activeWeaponId || weaponKey(custom)
              });
              setCustomWeaponDraft({ name:'', trait:'', range:'', damage:'', feature:'' });
              setShowCustomWeaponForm(false);
          };
          const normalizedWeaponSearch = String(weaponSearch || '').trim().toLowerCase();
          const weaponManagerPool = weaponManagerView === 'catalog' ? WEAPON_CATALOG.map(hydratePlayerWeapon) : arsenalWeapons;
          const filteredWeaponManagerPool = weaponManagerPool.filter(weapon => {
            if (!normalizedWeaponSearch) return true;
            return [weapon.name, weapon.trait, weapon.range, weapon.damage, featureList(weapon.features).join(' '), weapon.weaponFamily].join(' ').toLowerCase().includes(normalizedWeaponSearch);
          });

          const armorArsenal = (Array.isArray(character.armorArsenal) ? character.armorArsenal : []).map(hydrateArmor).filter(item => item.name).sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
          const armorInventoryKeys = new Set(armorArsenal.map(armorKey));
          const activeArmor = armorArsenal.find(item => armorKey(item) === character.activeArmorId) || null;
          const activeArmorProfile = armorProfile(activeArmor);
          const effectiveEvasion = (Number(character.evasion) || 0) + (activeWeaponProfile ? activeWeaponProfile.evasionModifier : 0) + (activeArmorProfile ? activeArmorProfile.evasionModifier : 0);
          const setActiveArmor = (armor) => {
            const hydrated = hydrateArmor(armor);
            const slots = Math.max(0, Number(hydrated.armorSlots) || 0);
            const thresholds = armorThresholdsWithMods(hydrated);
            updateCharacter({ ...character, activeArmorId: armorKey(hydrated), armor: hydrated, thresholds, armorMax:slots, shields:slots });
          };
          const clearActiveArmor = () => updateCharacter({ ...character, activeArmorId: '', armor: null, armorMax:0, shields:0 });
          const toggleArmorOwned = (armor) => {
            const hydrated = hydrateArmor(armor);
            const key = armorKey(hydrated);
            const exists = armorInventoryKeys.has(key);
            const nextArsenal = exists ? armorArsenal.filter(item => armorKey(item) !== key) : armorArsenal.concat([hydrated]);
            const nextActive = exists && character.activeArmorId === key ? '' : (character.activeArmorId || '');
            const nextArmor = nextActive ? (nextArsenal.find(item => armorKey(item) === nextActive) || null) : null;
            const nextSlots = nextArmor ? Math.max(0, Number(nextArmor.armorSlots) || 0) : 0;
            updateCharacter({ ...character, armorInventory: nextArsenal.map(armorKey), armorArsenal: nextArsenal, activeArmorId: nextActive, armor: nextArmor, armorMax:nextSlots, shields:nextArmor ? Math.min(Number(character.shields)||nextSlots, nextSlots) : 0, thresholds:nextArmor ? armorThresholdsWithMods(nextArmor) : character.thresholds });
          };
          const normalizedArmorSearch = String(armorSearch || '').trim().toLowerCase();
          const armorManagerPool = armorManagerView === 'catalog' ? ARMOR_CATALOG.map(hydrateArmor) : armorArsenal;
          const filteredArmorManagerPool = armorManagerPool.filter(armor => {
            if (!normalizedArmorSearch) return true;
            const summary = armorSummary(armor);
            return [summary.title, summary.tier, summary.cost, summary.detail, summary.features].join(' ').toLowerCase().includes(normalizedArmorSearch);
          });

          const augmentArsenal = (Array.isArray(character.augmentArsenal) ? character.augmentArsenal : []).map(hydrateAugment).filter(item => item.name).sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
          const augmentInventoryKeys = new Set(augmentArsenal.map(augmentKey));
          const activeAugmentIds = Array.isArray(character.activeAugmentIds) ? character.activeAugmentIds : [];
          const activeAugments = augmentArsenal.filter(item => activeAugmentIds.includes(augmentKey(item)));
          const toggleAugmentOwned = (augment) => {
            const hydrated = hydrateAugment(augment);
            const key = augmentKey(hydrated);
            const exists = augmentInventoryKeys.has(key);
            const nextArsenal = exists ? augmentArsenal.filter(item => augmentKey(item) !== key) : augmentArsenal.concat([hydrated]);
            const nextActive = exists ? activeAugmentIds.filter(id => id !== key) : activeAugmentIds;
            updateCharacter({ ...character, augments: nextArsenal, augmentInventory: nextArsenal.map(augmentKey), augmentArsenal: nextArsenal, activeAugmentIds: nextActive });
          };
          const toggleAugmentActive = (augment) => {
            const hydrated = hydrateAugment(augment);
            const key = augmentKey(hydrated);
            if (!augmentInventoryKeys.has(key)) return;
            const isActive = activeAugmentIds.includes(key);
            if (isActive) {
              updateCharacter({ ...character, activeAugmentIds: activeAugmentIds.filter(id => id !== key) });
              logRoll({ type:'note', label:`Augmentation deactivated: ${hydrated.name}`, playerName:character.name || character.playerName || 'Player', timestamp:Date.now() });
              return;
            }
            const cost = augmentActivationCost(hydrated, character);
            if (!canPayFeatureCost(cost)) {
              const label = cost ? `${cost.amount} ${cost.resource}` : 'the required resource';
              showAlert(`You cannot activate ${hydrated.name}: not enough ${label}.`, 'Activation blocked');
              return;
            }
            let next = { ...character, activeAugmentIds:activeAugmentIds.concat([key]) };
            if (cost && next[cost.resource]) {
              const track = next[cost.resource];
              const mark = cost.mode === 'mark' || cost.resource === 'stress';
              next = { ...next, [cost.resource]:{ ...track, current:mark ? Math.min(Number(track.max)||99, (Number(track.current)||0) + cost.amount) : Math.max(0, (Number(track.current)||0) - cost.amount) } };
            }
            updateCharacter(next);
            logRoll({ type:'note', label:`Augmentation activated: ${hydrated.name}${cost ? ` · ${cost.amount} ${cost.resource}` : ''}`, playerName:character.name || character.playerName || 'Player', resourceCost:cost || null, timestamp:Date.now() });
          };
          const normalizedAugmentSearch = String(augmentSearch || '').trim().toLowerCase();
          const augmentManagerPool = augmentManagerView === 'catalog' ? AUGMENT_CATALOG.map(hydrateAugment) : augmentArsenal;
          const filteredAugmentManagerPool = augmentManagerPool.filter(augment => {
            if (!normalizedAugmentSearch) return true;
            const summary = augmentSummary(augment);
            return [summary.title, summary.tier, summary.cost, summary.detail, summary.meta].join(' ').toLowerCase().includes(normalizedAugmentSearch);
          });

          const gearArsenal = (Array.isArray(character.gearArsenal) ? character.gearArsenal : []).map(hydrateGear).filter(item => item.name).sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
          const gearInventoryKeys = new Set(gearArsenal.map(gearKey));
          const toggleGearOwned = (gear) => {
            const hydrated = hydrateGear(gear);
            const key = gearKey(hydrated);
            const exists = gearInventoryKeys.has(key);
            const nextArsenal = exists ? gearArsenal.filter(item => gearKey(item) !== key) : gearArsenal.concat([hydrated]);
            updateCharacter({ ...character, gearInventory: nextArsenal.map(gearKey), gearArsenal: nextArsenal });
          };
          const normalizedGearSearch = String(gearSearch || '').trim().toLowerCase();
          const gearManagerPool = gearManagerView === 'catalog' ? GEAR_CATALOG.map(hydrateGear) : gearArsenal;
          const filteredGearManagerPool = gearManagerPool.filter(gear => {
            if (!normalizedGearSearch) return true;
            const summary = gearSummary(gear);
            return [summary.title, summary.tier, summary.cost, summary.detail].join(' ').toLowerCase().includes(normalizedGearSearch);
          });
          const isDrone = character.entityType === 'drone';
          const installedDroneModules = isDrone ? (Array.isArray(character.installedModules) ? character.installedModules.map(item => { const canonical=findDroneModule(item); return canonical ? {...canonical,...(typeof item==='object'?item:{})} : item; }).filter(item => item && item.name) : []) : [];
          const currentDroneProfile = isDrone ? droneDerivedProfile(character.droneGradeId, installedDroneModules, character.droneContext) : null;
          const currentDroneGrade = currentDroneProfile;
          const coreDroneGrades = DRONE_GRADE_CATALOG.filter(item => item.profileType !== 'frame').slice().sort((a,b) => droneModuleAccessRank(a) - droneModuleAccessRank(b));
          const specializedFrameOrder = ['industrial-hauler','house-sentinel','war-frame','swarm-cell','black-site-chimera'];
          const specializedDroneFrames = DRONE_GRADE_CATALOG.filter(item => item.profileType === 'frame').slice().sort((a,b) => specializedFrameOrder.indexOf(a.slug) - specializedFrameOrder.indexOf(b.slug));
          const installedDroneModuleKeys = new Set(installedDroneModules.map(droneModuleKey));
          const usedDroneModuleSlots = installedDroneModules.reduce((sum, module) => sum + droneModuleSlots(module), 0);
          const availableDroneModuleSlots = Math.max(0, Number((currentDroneProfile && currentDroneProfile.moduleSlots) || character.moduleSlots || 0) - usedDroneModuleSlots);
          const filteredDroneModules = DRONE_MODULE_CATALOG.filter(module => {
            if (!isDrone || !droneModuleAllowed(module, character.droneGradeId)) return false;
            const q = String(droneModuleSearch || '').trim().toLowerCase();
            return !q || [module.name, droneModuleAccessLabel(module), module.category, module.pack, module.use, module.slots].join(' ').toLowerCase().includes(q);
          });
          const droneModuleInstallBlock = (module) => {
            if (installedDroneModuleKeys.has(droneModuleKey(module))) return '';
            if (!droneModuleAllowed(module, character.droneGradeId)) return `Requires ${droneModuleAccessLabel(module)} access.`;
            const conflict = droneModuleConflicts(module, installedDroneModules, character.droneGradeId);
            if (conflict) return conflict;
            const slots = droneModuleSlots(module);
            if (slots > availableDroneModuleSlots) return `Needs ${slots} slots; ${availableDroneModuleSlots} free.`;
            return '';
          };
          const spotlightHolder = characters.find(item => item && item.entityType !== 'drone' && item.id === spotlight) || null;
          const droneOperator = characters.find(item => item && item.entityType !== 'drone' && item.id === character.operatorId) || null;
          const changeDroneGrade = (gradeId) => {
            const base = droneGradeStats(gradeId);
            let remaining = base.moduleSlots;
            const fitted = [];
            installedDroneModules.forEach(module => {
              const slots = droneModuleSlots(module);
              if (!droneModuleAllowed(module, gradeId) || slots > remaining || droneModuleConflicts(module, fitted, gradeId)) return;
              fitted.push(module); remaining -= slots;
            });
            const context = { temporaryEvasion:0 };
            const profile = droneDerivedProfile(gradeId, fitted, context);
            updateCharacter({
              ...character,
              droneGradeId:profile.grade ? profile.grade.id : gradeId,
              hp:{ current:profile.hp, max:profile.hp }, thresholds:profile.thresholds,
              evasion:profile.evasion, baseEvasion:profile.baseEvasion,
              shields:profile.armorSlots, armorMax:profile.armorSlots,
              moduleSlots:profile.moduleSlots, installedModules:fitted, moduleInventory:fitted.map(droneModuleKey), droneContext:context
            });
          };
          const updateDroneFromModules = (nextModules, nextContext, fillAddedShields) => {
            const previous = currentDroneProfile || droneDerivedProfile(character.droneGradeId, installedDroneModules, character.droneContext);
            const profile = droneDerivedProfile(character.droneGradeId, nextModules, nextContext || character.droneContext);
            const oldCurrent = Math.max(0, Number(character.shields) || 0);
            const shieldDelta = profile.armorSlots - previous.armorSlots;
            const nextShields = fillAddedShields && shieldDelta > 0 ? Math.min(profile.armorSlots, oldCurrent + shieldDelta) : Math.min(profile.armorSlots, oldCurrent);
            updateCharacter({
              ...character,
              installedModules:nextModules, moduleInventory:nextModules.map(droneModuleKey),
              droneContext:nextContext || character.droneContext,
              hp:{ current:Math.min(profile.hp, Number(character.hp && character.hp.current) || 0), max:profile.hp },
              thresholds:profile.thresholds, evasion:profile.evasion, baseEvasion:profile.baseEvasion,
              shields:nextShields, armorMax:profile.armorSlots, moduleSlots:profile.moduleSlots
            });
          };
          const toggleDroneModule = (module) => {
            if (!isDrone) return;
            const found = findDroneModule(module); const canonical = found ? {...found,...(typeof module==='object'?module:{})} : module;
            const key = droneModuleKey(canonical);
            const installed = installedDroneModuleKeys.has(key);
            if (installed) {
              const next = installedDroneModules.filter(item => droneModuleKey(item) !== key);
              const nextContext = { ...(character.droneContext || {}), temporaryEvasion:0 };
              updateDroneFromModules(next, nextContext, false);
              return;
            }
            if (!droneModuleAllowed(canonical, character.droneGradeId)) { showAlert(`${canonical.name} requires ${droneModuleAccessLabel(canonical)} access.`, 'Installation blocked'); return; }
            const conflict = droneModuleConflicts(canonical, installedDroneModules, character.droneGradeId);
            if (conflict) { showAlert(conflict, 'Installation blocked'); return; }
            const slots = droneModuleSlots(canonical);
            if (slots > availableDroneModuleSlots) { showAlert(`${canonical.name} needs ${slots} module slot${slots === 1 ? '' : 's'}, but only ${availableDroneModuleSlots} remain.`, 'Not enough module slots'); return; }
            const next = installedDroneModules.concat([canonical]);
            updateDroneFromModules(next, character.droneContext || { temporaryEvasion:0 }, true);
          };
          const setDroneContext = (key, value) => {
            const next = { ...(character.droneContext || {}), [key]:value };
            if (key === 'vectorBleedEva' && value) next.vectorBleedCramped = false;
            if (key === 'vectorBleedCramped' && value) next.vectorBleedEva = false;
            updateDroneFromModules(installedDroneModules, next, false);
          };
          const clearTemporaryDroneEvasion = () => setDroneContext('temporaryEvasion', 0);
          const useDroneModule = (module) => {
            const found = findDroneModule(module); const canonical = found ? {...found,...(typeof module==='object'?module:{})} : module;
            const rawCost = parseFeatureCost(canonical.use || '');
            let cost = rawCost;
            if (cost && cost.resource === 'hope' && droneOperator && droneOperator.path === 'sleeping') cost = { ...cost, resource:'effort', alternativeFor:'hope' };
            if (cost) {
              if (!droneOperator) { showAlert(`Assign an operator before using ${canonical.name}; its ${cost.amount} ${cost.resource} cost belongs to the operator.`, 'Operator required'); return; }
              const track = droneOperator[cost.resource];
              const canPay = track && ((cost.mode === 'mark' || cost.resource === 'stress') ? (Number(track.current)||0) + cost.amount <= (Number(track.max)||99) : (Number(track.current)||0) >= cost.amount);
              if (!canPay) { showAlert(`${droneOperator.name || 'The operator'} cannot pay ${cost.amount} ${cost.resource}.`, 'Module use blocked'); return; }
              setCharacters(prev => prev.map(item => {
                if (!item || item.id !== droneOperator.id) return item;
                const currentTrack = item[cost.resource] || track;
                const mark = cost.mode === 'mark' || cost.resource === 'stress';
                return { ...item, [cost.resource]:{ ...currentTrack, current:mark ? Math.min(Number(currentTrack.max)||99, (Number(currentTrack.current)||0) + cost.amount) : Math.max(0, (Number(currentTrack.current)||0) - cost.amount) } };
              }));
            }
            const temporary = Number(canonical.statModifiers && canonical.statModifiers.temporaryEvasion) || 0;
            if (temporary > 0) {
              const nextContext = { ...(character.droneContext || {}), temporaryEvasion:Math.max(temporary, Number(character.droneContext && character.droneContext.temporaryEvasion) || 0) };
              updateDroneFromModules(installedDroneModules, nextContext, false);
            }
            logRoll({ type:'note', label:`Drone module: ${canonical.name}${cost ? ` · operator ${cost.amount} ${cost.resource}` : ''}${temporary ? ` · +${temporary} Evasion for one attack` : ''}\n${canonical.use || ''}`, playerName:character.name || 'Drone', actorId:character.id, resourceCost:cost || null, timestamp:Date.now() });
          };

          const CLASS_FEATURE_TITLES = Object.freeze({
          diplomat:{awakened:{class:'Cultural Lens',effort:'The Power of Suggestion'},sleeping:{class:'Standing Reputation',effort:'The Prepared Mind'}},
          engineer:{awakened:{class:'Technical Intuition',effort:'Scrap Genius'},sleeping:{class:'Logged Tools',effort:'Brute-Force Diagnostic'}},
          explorer:{awakened:{class:'Foremost Survivor',effort:"Pathfinder's Insight"},sleeping:{class:'The Logbook',effort:'Methodical Reconnaissance'}},
          mystic:{awakened:{class:'Psychic Resonance & Veil Alignment',effort:'Reality Unfold'},sleeping:{class:'Uncanny Archive',effort:'The Reading'}},
          pilot:{awakened:{class:'Stellar Instinct',effort:'Veil Surge'},sleeping:{class:'The Ship Knows You',effort:'Stick Time'}},
          scholar:{awakened:{class:'Pattern Weaver',effort:'Eureka Moment'},sleeping:{class:'The Open Question',effort:'Applied Science'}},
          scoundrel:{awakened:{class:'Shadow Operative',effort:'Vanishing Act'},sleeping:{class:'The Quiet Network',effort:'Hands That Know'}},
          soldier:{awakened:{class:'Combat Focus',effort:'Combat Surge'},sleeping:{class:'The Drill',effort:'The Held Line'}},
          vanguard:{awakened:{class:'Unbroken Focus',effort:'Path to Nirvana'},sleeping:{class:'Sleeping Vanguard Features',effort:'The Refused Path'}}
        });
        const playerFeatureTitle = (kind) => {
          if (kind !== 'class' && kind !== 'effort') return '';
          const classKey = normalizeRuleName(character && character.class);
          const pathKey = normalizeRuleName(character && character.path) === 'sleeping' ? 'sleeping' : 'awakened';
          const classEntry = CLASS_FEATURE_TITLES[classKey] && CLASS_FEATURE_TITLES[classKey][pathKey];
          return classEntry && classEntry[kind] || '';
        };
        const featureAccent = {
            ancestry: { label:'Ancestry Gift', text:'text-amber-300', border:'border-amber-800/50', bg:'bg-amber-950/20' },
            class: { label:'Class Feature', text:'text-emerald-300', border:'border-emerald-800/50', bg:'bg-emerald-950/20' },
            community: { label:'Community Feature', text:'text-cyan-300', border:'border-cyan-800/50', bg:'bg-cyan-950/20' },
            effort: { label: character.path === 'sleeping' ? 'Effort Feature' : 'Hope Feature', text:'text-purple-300', border:'border-purple-800/50', bg:'bg-purple-950/20' }
          };
          const CompactActionPanel = ({ panelId, title, description, icon, accentClass, children }) => {
              const expanded = panelExpanded(panelId);
              return (
                <section className={`rounded-lg border border-slate-800 bg-slate-900/40 min-w-0 overflow-hidden ${expanded ? 'shadow-[0_0_20px_rgba(15,23,42,.35)]' : ''}`}>
                  <button type="button" aria-expanded={expanded} onClick={() => togglePanel(panelId)} className="w-full p-3 flex items-start gap-3 text-left hover:bg-slate-800/35 transition-colors">
                    <span className={`mt-0.5 shrink-0 ${accentClass || 'text-slate-300'}`}>{icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-black uppercase tracking-widest text-slate-100">{title}</span>
                      <span className="block mt-1 text-[10px] leading-snug text-slate-400">{description}</span>
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border grid place-items-center ${expanded ? 'border-slate-500 bg-slate-800 text-white' : 'border-slate-700 bg-slate-950 text-slate-400'}`} aria-hidden="true">
                      {expanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {expanded && <div className="p-3 pt-0 border-t border-slate-800/70">{children}</div>}
                </section>
              );
          };
          const FeatureSummaryCard = ({ kind, text }) => {
              const accent = featureAccent[kind] || featureAccent.class;
              const actualTitle = playerFeatureTitle(kind);
              const canonicalTitle = actualTitle || accent.label;
              const summary = compactFeature(text, canonicalTitle);
              if (actualTitle) summary.title = actualTitle;
              const panelId = `feature-${kind}`;
              const expanded = panelExpanded(panelId);
              return (
                <div className={`rounded-lg border ${accent.border} ${accent.bg} min-w-0 overflow-hidden`}>
                  <button type="button" aria-expanded={expanded} onClick={() => togglePanel(panelId)} className="w-full p-2.5 flex items-start justify-between gap-2 text-left hover:bg-slate-900/30 transition-colors">
                    <span className="min-w-0">
                      <span className={`block text-[9px] font-black uppercase tracking-widest ${accent.text}`}>{accent.label}</span>
                      <span className="block text-[12px] font-bold text-slate-100 mt-0.5 leading-tight">{summary.title}</span>
                      {!expanded && <span className="block mt-1 text-[10px] text-slate-400 leading-snug line-clamp-2">{summary.bullets[0] || compactLine(summary.full, 130)}</span>}
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border grid place-items-center ${expanded ? 'border-slate-500 bg-slate-800 text-white' : 'border-slate-700 bg-slate-950 text-slate-400'}`} aria-hidden="true">
                      {expanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {expanded && (
                    <div className="p-2.5 pt-2 border-t border-slate-800/70">
                      <div className="space-y-1">{summary.bullets.map((bullet,index)=><div key={index} className="text-[10px] text-slate-300 leading-snug"><span className="text-slate-600 mr-1">◆</span>{window.VFCompactRules ? window.VFCompactRules.compactSentence(bullet) : bullet}</div>)}</div>
                      {summary.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-800/70">
                          {summary.actions.flatMap((action, actionIndex) => {
                            const actionLabel = action.type === 'roll' ? `Roll${action.trait ? ' ' + action.trait : ''}${action.dc ? ' · DC ' + action.dc : ''}` : action.type === 'die' ? `Roll ${action.dieName || ('d' + action.die)}` : 'Use';
                            return featurePaymentOptions(action.cost).map((paymentCost, paymentIndex) => {
                              const disabled = !canPayFeatureCost(paymentCost);
                              const costLabel = paymentCost ? `${paymentCost.amount} ${paymentCost.resource}` : '';
                              const isEffortAlternative = paymentCost && paymentCost.alternativeFor === 'hope';
                              return <button key={`${actionIndex}-${paymentIndex}`} disabled={disabled} onClick={() => executeFeatureAction(accent.label, summary, action, paymentCost)} title={isEffortAlternative ? 'Alternative payment: spend Effort instead of Hope' : ''} className={`px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-wide ${isEffortAlternative ? 'text-amber-300 border-amber-800/70 hover:border-amber-500' : `${accent.text} border-slate-700 hover:border-slate-500`} bg-slate-950 disabled:opacity-30 disabled:cursor-not-allowed`}><Zap className="w-3 h-3 inline mr-1" />{actionLabel}{costLabel ? ` · ${costLabel}` : ''}</button>;
                            });
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
          };
          const MOD_API = window.VFEquipmentMods;
          const equipmentHardpoints = (item) => MOD_API ? MOD_API.tierHardpoints(item && item.tier) : 1;
          const replaceWeaponMods = (weapon, nextMods) => {
            const key=weaponKey(weapon); const normalized=MOD_API?MOD_API.normalize(nextMods,'weapon'):nextMods;
            const patch=item=>weaponKey(item)===key?{...item,installedMods:normalized}:item;
            updateCharacter({...character,weapons:(character.weapons||[]).map(patch),weaponArsenal:(character.weaponArsenal||[]).map(patch)});
          };
          const replaceArmorMods = (armor, nextMods) => {
            const key=armorKey(armor); const normalized=MOD_API?MOD_API.normalize(nextMods,'armor'):nextMods;
            const patch=item=>armorKey(item)===key?{...item,installedMods:normalized}:item;
            const nextArsenal=(character.armorArsenal||[]).map(patch); const active=armorKey(character.armor||{})===key?patch(character.armor):character.armor;
            const delta=(MOD_API?MOD_API.thresholdBonus(normalized):0)-(MOD_API?MOD_API.thresholdBonus(armor.installedMods):0);
            updateCharacter({...character,armorArsenal:nextArsenal,armor:active,thresholds:delta?{major:Number(character.thresholds.major||0)+delta,severe:Number(character.thresholds.severe||0)+delta}:character.thresholds});
          };
          const EquipmentModEditor = ({ type, item, onChange }) => {
            if(!MOD_API||!item)return null;
            const catalog=type==='armor'?MOD_API.armorMods:MOD_API.weaponMods,installed=MOD_API.normalize(item.installedMods,type),used=MOD_API.used(installed,type),cap=equipmentHardpoints(item),panelId=`mods-${type}-${baseItemKey(item,type)}`,expanded=panelExpanded(panelId);
            const install=mod=>{if(used+mod.hardpoints<=cap)onChange(installed.concat(mod));};
            const uninstall=mod=>onChange(installed.filter(x=>x.id!==mod.id));
            return <div className="mt-2 pt-2 border-t border-slate-800" onClick={e=>e.stopPropagation()}><button type="button" onClick={()=>togglePanel(panelId)} className="w-full flex items-center justify-between gap-2 text-[9px] font-black uppercase text-cyan-300"><span>Mods · {used}/{cap} Hardpoints</span><span>{expanded?'Close':'Manage'}</span></button>{installed.length>0&&<div className="flex flex-wrap gap-1 mt-1">{installed.map(mod=><span key={mod.id} title={mod.effect} className="px-1.5 py-0.5 rounded border border-cyan-900/60 bg-cyan-950/20 text-[8px] text-cyan-200">{mod.name}</span>)}</div>}{expanded&&<div className="mt-2 space-y-1 max-h-52 overflow-y-auto">{catalog.map(mod=>{const active=installed.some(x=>x.id===mod.id),fits=used+mod.hardpoints<=cap;return <div key={mod.id} className="flex items-start justify-between gap-2 rounded border border-slate-800 bg-black/40 p-2"><div className="min-w-0"><div className="text-[9px] font-bold text-slate-100">{mod.name} · {mod.hardpoints} HP</div><div className="text-[8px] text-slate-400 leading-snug">{mod.effect} · {mod.cost}</div></div><button type="button" disabled={!active&&!fits} onClick={()=>active?uninstall(mod):install(mod)} className={`shrink-0 px-2 py-1 rounded border text-[8px] font-black uppercase ${active?'border-red-800/60 text-red-300':'border-cyan-800/60 text-cyan-300'} disabled:opacity-30`}>{active?'Uninstall':fits?'Install':'No HP'}</button></div>})}</div>}</div>;
          };

          const WeaponCard = ({ weapon }) => {
              const profile = weaponAttackProfile(weapon, character, equippedWeapons);
              const key = weaponKey(profile.weapon);
              const active = key === weaponKey(activeWeapon);
              const traitName = profile.weapon.trait || 'No trait';
              const damagePlan = weaponDamagePlan(profile.weapon.damage, 1, profile);
              const proficiencyDamage = damagePlan ? `${damagePlan.keptCount}d${damagePlan.sides}${damagePlan.staticMod ? (damagePlan.staticMod > 0 ? '+' : '') + damagePlan.staticMod : ''}` : '';
              return (
                <div onClick={() => setActiveWeapon(profile.weapon)} className={`rounded-lg border p-2.5 cursor-pointer transition-all ${active ? 'border-yellow-500/70 bg-yellow-950/20 shadow-[0_0_18px_rgba(234,179,8,0.08)]' : 'border-slate-800 bg-slate-950/45 hover:border-slate-600'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap"><span className="text-xs font-black text-slate-100">{profile.weapon.name}</span>{active && <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/30 text-[8px] font-black text-yellow-300 uppercase">Active</span>}</div>
                      <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                        <span className="px-1.5 py-0.5 rounded border border-cyan-900/60 bg-cyan-950/30 text-cyan-300">{traitName} {profile.traitMod >= 0 ? '+' : ''}{profile.traitMod}</span>
                        {profile.weapon.range && <span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400">{profile.weapon.range}</span>}
                        <span className="px-1.5 py-0.5 rounded border border-red-900/50 bg-red-950/25 text-red-300">{profile.weapon.damage || 'No damage'}</span>
                        {proficiencyDamage && <span title="Proficiency multiplies weapon damage dice." className="px-1.5 py-0.5 rounded border border-fuchsia-900/60 bg-fuchsia-950/20 text-fuchsia-300">P{profile.proficiency} → {proficiencyDamage}</span>}
                        {profile.attackBonus !== 0 && <span className="px-1.5 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-300">Attack +{profile.attackBonus}</span>}
                      </div>
                    </div>
                    <button onClick={(event) => { event.stopPropagation(); rollDuality({ weapon: profile.weapon }); }} className="shrink-0 px-2.5 py-1.5 rounded border border-yellow-500/50 bg-yellow-900/20 text-yellow-300 hover:bg-yellow-800/30 text-[9px] font-black uppercase"><Zap className="w-3 h-3 inline mr-1" />Attack</button>
                  </div>
                  {profile.entries.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{profile.entries.map((entry, index) => <span key={index} title={conciseEffect(entry)} className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-[8px] font-bold text-slate-300 cursor-help">{entry.display}</span>)}</div>}
                  {active && profile.effects.length > 0 && <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">{profile.effects.map((effect, index) => <div key={index} className="text-[9px] leading-snug text-slate-400"><span className="font-bold text-slate-200">{effect.name}:</span> {effect.effect}</div>)}</div>}
                  {active && profile.heavyDisadvantage && <div className="mt-2 text-[9px] font-bold text-red-300">Heavy: attacks use Disadvantage while Strength is 0 or lower.</div>}
                  <EquipmentModEditor type="weapon" item={profile.weapon} onChange={mods=>replaceWeaponMods(profile.weapon,mods)} />
                </div>
              );
          };


          // Helper UI Components
          const ResourceTrack = ({ label, current, max, cap, color, icon: Icon, onChange, tokenKey }) => {
            const total = cap || max;
            const tk = tokenKey || label.toLowerCase();
            return (
              <div className={`vf-resource-row bg-slate-900/90 px-3 py-2 rounded border border-${color}-900/30 flex items-center justify-between shadow-sm h-full`}>
                <div className="flex items-center gap-2 mr-2 shrink-0" data-resicon={tk}>
                  {Icon && <Icon className={`w-3 h-3 text-${color}-500`} />}
                  <div className="flex flex-col leading-none">
                    <label className={`text-[9px] font-bold uppercase text-${color}-400 tracking-wider`}>{label}</label>
                    <span className={`text-[9px] font-mono text-${color}-300 opacity-60`}>{current}/{max}</span>
                  </div>
                </div>
                <div className="vf-resource-track flex gap-1 flex-wrap justify-end">
                  {Array.from({ length: total }).map((_, i) => {
                    const available = i < max;
                    const filled = i < current && !pending[tk + '-' + i];
                    const stateName = !available ? 'unavailable' : (filled ? 'filled' : 'empty');
                    return (
                      <button key={i} type="button" data-token={tk + '-' + i} data-token-kind={tk} data-token-state={stateName}
                        aria-pressed={filled ? 'true' : 'false'} aria-label={`${label} slot ${i + 1} of ${total}: ${stateName}`} disabled={!available}
                        onClick={() => { if (available) onChange(i + 1 === current ? i : i + 1); }} className="vf-resource-token" />
                    );
                  })}
                </div>
              </div>
            );
          };
          const StatBlock = ({ label, statKey, skills, color }) => ( <div className="bg-slate-900/60 border-b border-slate-800/80 last:border-0 p-2 flex items-center gap-3 group hover:bg-slate-800/60 transition-colors cursor-pointer" onClick={() => openRollerWithStat(label, character.stats[statKey])}> <div className={`flex flex-col items-center justify-center min-w-[3rem]`}> <NumField onClick={(e) => e.stopPropagation()} className={`w-8 h-7 bg-slate-950 border border-slate-700 rounded text-center text-white font-bold text-lg leading-none focus:border-${color}-500 focus:outline-none`} value={character.stats[statKey]} onChange={(e) => handleStatChange(statKey, e.target.value)} /> <h3 onClick={(e) => { e.stopPropagation(); openRollerWithStat(label, character.stats[statKey]); }} title="Tap to roll" className={`font-bold text-${color}-500 uppercase text-[11px] sm:text-[9px] mt-1 tracking-tighter cursor-pointer select-none active:opacity-60 px-2 py-1 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-${color}-500/10`}>{label}</h3> </div> <div className="flex flex-wrap gap-1 content-center"> {skills.map(skill => (<span key={skill} className="px-1.5 py-0.5 bg-slate-800/50 text-slate-400 text-[9px] rounded uppercase font-medium border border-transparent hover:border-slate-700 cursor-default">{skill}</span>))} </div> </div> );
          const DomainCard = ({ card, onDelete }) => {
            const amount = parseInt(card.cost) || 0;
            const payments = amount > 0 ? [
              { resource: 'hope', amount },
              { resource: 'effort', amount, alternativeFor: 'hope' }
            ] : [null];
            return (
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-600 rounded-lg p-3 w-full shadow-lg card-glow flex flex-col gap-1 min-h-[120px] hover:border-cyan-500 transition-colors">
                <div className="flex justify-between items-start border-b border-slate-700 pb-1 mb-1">
                  <span className="text-xs font-bold text-cyan-300 truncate pr-4">{card.name}</span>
                  {onDelete && <button onClick={onDelete} className="text-slate-500 hover:text-red-400 absolute top-2 right-2"><X className="w-3 h-3" /></button>}
                </div>
                <div className="flex gap-2 text-[9px] uppercase font-bold text-slate-500">
                  <span className="bg-emerald-900/50 text-emerald-400 px-1 rounded border border-emerald-500/50">Lvl {card.level}</span>
                  <span className="bg-slate-950 px-1 rounded border border-slate-800">Cost: {amount || 0}{amount ? ' Hope / Effort' : ''}</span>
                  <span className="bg-slate-950 px-1 rounded border border-slate-800">{card.type}</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight mt-1 flex-1">{card.text}</p>
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-700/70">
                  {payments.map((payment, index) => {
                    const disabled = !canPayFeatureCost(payment);
                    const label = payment ? `Use ${payment.resource}` : 'Roll';
                    return <button key={index} disabled={disabled} onClick={() => rollDuality({label: 'Power: ' + card.name + (payment ? ` · ${payment.amount} ${payment.resource}` : ''), extraMod: 0, spend: payment})} className={`px-2 py-1 rounded border bg-slate-950 text-[9px] font-black uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed ${payment && payment.resource === 'effort' ? 'text-amber-300 border-amber-800/70 hover:border-amber-500' : 'text-cyan-300 border-cyan-800/70 hover:border-cyan-500'}`}><Zap className="w-3 h-3 inline mr-1" />{label}</button>;
                  })}
                </div>
              </div>
            );
          };

          return (
            <div className="min-h-screen bg-black text-slate-300 font-sans p-2 overflow-x-hidden flex flex-col relative"
              style={(() => {
                const sp = SPOT_THEMES[spotColor] || SPOT_THEMES.golden;
                const st = { '--vf-spot-rgb': sp.rgb, '--vf-spot-halo-rgb': sp.halo, '--vf-spot-lens-rgb': sp.lens, '--vf-spot-text': sp.text };
                const bg = BACKGROUNDS[bgChoice];
                if (bg && bg.img) { st.backgroundColor = '#05080d'; st.backgroundImage = `linear-gradient(rgba(4,8,15,0.42), rgba(4,8,15,0.62)), url(${bg.img})`; st.backgroundSize = 'cover'; st.backgroundPosition = 'center'; st.backgroundRepeat = 'no-repeat'; st.backgroundAttachment = 'fixed'; }
                return st;
              })()}>

              <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true">
                <defs>
                  <linearGradient id="vfBeamGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop className="vf-g-main" offset="0%" stopOpacity="0.75" />
                    <stop className="vf-g-main" offset="100%" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="vfHaloGrad" cx="0.5" cy="0.5" r="0.5">
                    <stop className="vf-g-halo" offset="0%" stopOpacity="0.9" />
                    <stop className="vf-g-main" offset="100%" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="dieHope" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#0e7490" />
                  </linearGradient>
                  <linearGradient id="dieFear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#6b21a8" />
                  </linearGradient>
                  <linearGradient id="dieNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569" /><stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="dieMax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde047" /><stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                  <linearGradient id="dieCrit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                  <linearGradient id="dieDamage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>
                  <linearGradient id="dieDiscarded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* REAL-TIME PLAYER CALLOUTS */}
              {activeCallouts.length > 0 && (
                <div className="vf-callout-grid" style={{ transform:`scale(${calloutScale})` }}>
                  {activeCallouts.map((callout) => (
                    <AnimatedCalloutCard key={rollEventKey(callout)} callout={callout} onClose={() => setActiveCallouts(prev => prev.filter(item => rollEventKey(item) !== rollEventKey(callout)))} />
                  ))}
                </div>
              )}

              {/* MODAL CONFIG */}
              {showConfig && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 border border-cyan-500 rounded-xl p-6 max-w-lg w-full shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                          <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><CloudLightning /> Cloud Config</h2>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Table access</label>
                              {tableDirectoryEnabled === true && <button onClick={fetchTables} className="text-[10px] text-cyan-400 hover:text-white uppercase font-bold">Refresh</button>}
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-3">
                              {tablesLoading && <span className="text-[11px] text-slate-500 italic animate-pulse">Checking table access…</span>}
                              {!tablesLoading && tableDirectoryEnabled === false && <span className="text-[11px] text-slate-500 italic">For privacy, public table discovery is disabled. Enter the exact table name below.</span>}
                              {!tablesLoading && tableDirectoryEnabled === true && availableTables.length === 0 && <span className="text-[11px] text-slate-600 italic">No tables yet — type a name below to create one.</span>}
                              {!tablesLoading && tableDirectoryEnabled === true && availableTables.map(function (tb) { return (<button key={tb.id} onClick={() => setSessionId(tb.id)} className={`px-3 py-1 rounded text-xs font-bold border ${sessionId === tb.id ? 'border-cyan-500 bg-cyan-950 text-cyan-300' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-cyan-500'}`}><span className={tb.locked ? 'text-amber-300' : 'text-emerald-300'}>{tb.locked ? 'CLOSED' : 'OPEN'}</span> · {tb.name} <span className="text-slate-600">({tb.players})</span></button>); })}
                            </div>
                          </div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Join or create a table</label>
                          <input type="text" value={sessionId} onChange={e => setSessionId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-3 text-white font-mono text-xs" placeholder="Table name (e.g. Friday Night)" />
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Table password <span className="text-slate-600 normal-case font-normal">(creates a closed table or unlocks one)</span></label>
                          <input type="password" value={tablePass} onChange={e => setTablePass(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-2 text-white font-mono text-xs" placeholder="Password (also required with an invitation when protected)" />
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Invitation passkey <span className="text-slate-600 normal-case font-normal">(required for new members)</span></label>
                          <input type="text" value={invitePasskey} onChange={e => setInvitePasskey(e.target.value.trim())} className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-2 text-white font-mono text-xs" placeholder="Paste invitation passkey, or open an invitation link" />
                          <div className="rounded border border-cyan-800/50 bg-cyan-950/20 p-2 mb-4 text-[10px] text-cyan-200"><strong>Membership:</strong> the table owner creates invitation links or passkeys. A password does not replace the invitation.</div>

                          {isConnected && (
                            <div className="rounded border border-slate-700 bg-slate-950/60 p-3 mb-4">
                              <div className="flex items-center justify-between gap-2 mb-2"><span className="text-xs font-black uppercase tracking-wide text-white">{connectedTableLocked ? 'Change table password' : 'Add table password'}</span><span className={`text-[9px] font-black uppercase ${connectedTableLocked ? 'text-amber-300' : 'text-emerald-300'}`}>{connectedTableLocked ? 'Closed' : 'Open'}</span></div>
                              <p className="text-[10px] text-slate-500 mb-2">This control is available only after successfully joining the table.</p>
                              <input type="password" value={newTablePass} onChange={e => setNewTablePass(e.target.value)} className="w-full bg-black border border-slate-700 rounded p-2 mb-2 text-white font-mono text-xs" placeholder="New password" />
                              <input type="password" value={confirmTablePass} onChange={e => setConfirmTablePass(e.target.value)} className="w-full bg-black border border-slate-700 rounded p-2 mb-2 text-white font-mono text-xs" placeholder="Confirm new password" />
                              <button disabled={passwordChanging} onClick={changeConnectedTablePassword} className="w-full px-3 py-2 rounded border border-amber-600/50 bg-amber-950/30 text-amber-200 text-[10px] font-black uppercase disabled:opacity-40">{passwordChanging ? 'Updating…' : (connectedTableLocked ? 'Change password' : 'Protect table')}</button>
                            </div>
                          )}
                          
                          <div className="bg-slate-950/50 p-3 rounded border border-green-900/30 mb-4">
                              <p className="text-xs text-green-400 font-bold mb-1">Configuration Status:</p>
                              <p className="text-[10px] text-slate-400">Firebase project configuration is loaded at runtime. Access control must be enforced by Firebase Security Rules and App Check, not by obscuring this configuration.</p>
                          </div>

                          <div className="flex justify-end gap-2">
                              {isConnected && <button onClick={disconnectFromCloud} className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded">Disconnect</button>}
                              <button onClick={() => setShowConfig(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                              <button onClick={() => connectToCloud()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold">Connect</button>
                          </div>
                      </div>
                  </div>
              )}

              {openNotes.map(o => (
                <NoteWindow key={o.id} open={o} pos={positions[o.id]}
                  onDrag={startDrag} onClose={() => closeNote(o.id)} onToggleMin={() => toggleNoteMin(o.id)}
                  onSave={() => saveNoteToInventory(o.note)}
                  canSave={!o.note.volatile && !(o.note.expires > 0)} />
              ))}

              {showNotesPanel && (
                <div style={{ left: positions.notes ? positions.notes.x : 30, top: positions.notes ? positions.notes.y : 120 }} className="vf-notes-panel fixed z-40 bg-slate-900 border border-slate-600 rounded-xl w-full max-w-xs shadow-2xl window-shadow flex flex-col overflow-hidden">
                  <div onMouseDown={(e) => startDrag(e, 'notes')} onTouchStart={(e) => startDrag(e, 'notes')} className="bg-slate-800/80 p-2.5 cursor-move flex justify-between items-center select-none border-b border-slate-700 touch-none">
                    <h2 className="text-xs font-bold text-white flex items-center gap-2 pointer-events-none"><ScrollText className="w-4 h-4 text-amber-400" /> Notes</h2>
                    <button onClick={() => setShowNotesPanel(false)} title="Close" className="p-1 rounded hover:bg-red-900/50 text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="p-3 bg-slate-900 max-h-[70vh] overflow-y-auto">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My notes</label>
                    <textarea value={character.playerNotes || ''} onChange={e => updateCharacter({ playerNotes: e.target.value })} placeholder="Private notes (saved with your character)…" className="w-full h-32 mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-[12px] text-slate-200 resize-y focus:border-cyan-500 focus:outline-none" />
                    <div className="mt-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Saved notes</label>
                      {(!character.savedNotes || !character.savedNotes.length) && <div className="text-[11px] text-slate-600 italic mt-1">Handouts you save appear here.</div>}
                      <div className="mt-1 space-y-1">
                        {(character.savedNotes || []).map(s => (
                          <div key={s.sid} className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2 py-1">
                            <button onClick={() => openNote(s.note)} className="flex-1 text-left text-[12px] text-amber-200 font-bold truncate hover:text-amber-100">{s.title}</button>
                            <button onClick={() => removeSavedNote(s.sid)} title="Remove from inventory" className="text-slate-500 hover:text-red-400 shrink-0"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dialog && (
                <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={() => dialog.kind === 'alert' ? dialog.onOk() : setDialog(null)}>
                  <div className="bg-slate-900 border border-slate-600 rounded-xl p-5 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-bold text-white mb-2">{dialog.title}</h3>
                    <p className="text-[13px] text-slate-300 mb-4 whitespace-pre-wrap">{dialog.message}</p>
                    {dialog.kind === 'prompt' && (
                      <input autoFocus value={dialog.value} onChange={e => setDialog(d => ({ ...d, value: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') dialog.onOk(dialog.value); }} className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-4 text-white text-sm focus:border-cyan-500 focus:outline-none" />
                    )}
                    <div className="flex justify-end gap-2">
                      {dialog.kind !== 'alert' && <button onClick={() => setDialog(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-sm">Cancel</button>}
                      <button onClick={() => dialog.kind === 'prompt' ? dialog.onOk(dialog.value) : dialog.onOk()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-sm">{dialog.kind === 'confirm' ? 'Confirm' : 'OK'}</button>
                    </div>
                  </div>
                </div>
              )}

              {showSettings && (
                  <div
                    className="fixed inset-0 bg-black/90 z-[30000] flex items-start sm:items-center justify-center overflow-hidden sm:p-4"
                    role="presentation"
                    onClick={() => setShowSettings(false)}
                  >
                      <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vf-settings-title"
                        className="relative bg-slate-900 border-0 sm:border border-slate-600 rounded-none sm:rounded-xl w-full max-w-lg h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-2rem)] shadow-[0_0_30px_rgba(148,163,184,0.15)] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                          <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-5 pb-3 border-b border-slate-800 bg-slate-900/98 backdrop-blur">
                            <h2 id="vf-settings-title" className="text-lg sm:text-xl font-bold text-slate-200 flex items-center gap-2"><Settings /> Options</h2>
                            <button
                              type="button"
                              onClick={() => setShowSettings(false)}
                              className="shrink-0 min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-cyan-500 active:bg-slate-800"
                              aria-label="Close options and return to Player Tool"
                              title="Close options"
                            ><X className="w-5 h-5" /></button>
                          </div>

                          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                          <div className="mb-2">
                            <div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-400 mb-3">Appearance</div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Background</label>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.keys(BACKGROUNDS).map(function (key) {
                                const b = BACKGROUNDS[key];
                                const active = bgChoice === key;
                                return (
                                  <button key={key} onClick={() => setBgChoice(key)}
                                    className={`relative rounded-lg overflow-hidden border-2 h-24 flex items-end transition-colors ${active ? 'border-cyan-500' : 'border-slate-700 hover:border-slate-500'}`}
                                    style={b.img ? { backgroundImage: `url(${b.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#020609' }}>
                                    {!b.img && <span className="absolute inset-0 flex items-center justify-center text-slate-600 text-2xl">∅</span>}
                                    <span className="w-full bg-black/70 text-[10px] font-bold uppercase tracking-wide text-center py-1 text-slate-200">{b.label}</span>
                                    {active && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-black text-[10px] font-black">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Applies to this device and is remembered next time.</p>
                          </div>

                          <div className="mb-2 mt-4 pt-4 border-t border-slate-800 space-y-4">
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <div><label className="text-xs font-bold text-slate-500 uppercase block">Callout size</label><span className="text-[10px] text-slate-500">Scales all player callout windows on this device.</span></div>
                                <div className="vf-stepper">
                                  <button onClick={() => setCalloutScale(value => Math.max(0.5, Math.round((value - 0.1) * 10) / 10))} aria-label="Reduce callout size">−</button>
                                  <output>{Math.round(calloutScale * 100)}%</output>
                                  <button onClick={() => setCalloutScale(value => Math.min(1.5, Math.round((value + 0.1) * 10) / 10))} aria-label="Increase callout size">+</button>
                                </div>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                              <div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-400 mb-3">Rules</div>
                              <div className="flex items-center justify-between gap-3">
                                <div><label className="text-xs font-bold text-slate-500 uppercase block">Spectrum of Fate</label><span className="text-[10px] text-slate-500">Enabled by default. This global device setting applies to every Player Tool character and open tab.</span></div>
                                <button role="switch" aria-checked={useSpectrum} onClick={() => setUseSpectrum(value => !value)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${useSpectrum ? 'bg-cyan-600' : 'bg-slate-700'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${useSpectrum ? 'left-[22px]' : 'left-0.5'}`}></span></button>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                              <div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-400 mb-3">Dice</div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div><label className="text-xs font-bold text-slate-500 uppercase block">Dice display</label><span className="text-[10px] text-slate-500">3D loads the bundled official Fantastic Dice renderer only when used.</span></div>
                              <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1">
                                <button onClick={() => setDiceMode('2d')} className={`px-3 py-1.5 rounded text-[10px] font-black ${diceMode === '2d' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>2D</button>
                                <button onClick={() => setDiceMode('3d')} className={`px-3 py-1.5 rounded text-[10px] font-black ${diceMode === '3d' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>3D</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div><label className="text-xs font-bold text-slate-500 uppercase block">Shake to Roll</label><span className="text-[10px] text-slate-500">Optional mobile control. A shake opens the Player Roller and immediately rolls Hope and Fear using the selected 2D/3D display.{shakePermission === 'denied' ? ' Motion permission was denied.' : shakePermission === 'unsupported' ? ' Motion sensors are unavailable.' : ''}</span></div>
                              <button role="switch" aria-checked={shakeToRollEnabled} onClick={() => setShakeToRoll(!shakeToRollEnabled)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${shakeToRollEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${shakeToRollEnabled ? 'left-[22px]' : 'left-0.5'}`}></span></button>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div><label className="text-xs font-bold text-slate-500 uppercase block">3D stage</label><span className="text-[10px] text-slate-500">Box uses a contained arena. Overlay rolls over the interface on a transparent top layer.</span></div>
                              <div className={`flex rounded-lg border border-slate-700 bg-slate-950 p-1 ${diceMode === '3d' ? '' : 'opacity-40 pointer-events-none'}`}>
                                <button onClick={() => setDice3DStyle('box')} className={`px-3 py-1.5 rounded text-[10px] font-black ${dice3DStyle === 'box' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>BOX</button>
                                <button onClick={() => setDice3DStyle('overlay')} className={`px-3 py-1.5 rounded text-[10px] font-black ${dice3DStyle === 'overlay' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>OVERLAY</button>
                              </div>
                            </div>
                            <div className={`flex items-center justify-between gap-3 ${diceMode === '3d' ? '' : 'opacity-40 pointer-events-none'}`}>
                              <div><label className="text-xs font-bold text-slate-500 uppercase block">Dice tracking &amp; lock-in</label><span className="text-[10px] text-slate-500">Show the quantum trackers, aperture lock and settled winner/discard cues.</span></div>
                              <button role="switch" aria-checked={diceTrackingEnabled} onClick={() => setDiceTrackingEnabled(value => !value)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${diceTrackingEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${diceTrackingEnabled ? 'left-[22px]' : 'left-0.5'}`}></span></button>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div><label className="text-xs font-bold text-slate-500 uppercase block">3D texture set</label><span className="text-[10px] text-slate-500">Choose flat colours, technological plates, or bioluminescent crystal materials.</span></div>
                              <div className={`flex rounded-lg border border-slate-700 bg-slate-950 p-1 ${diceMode === '3d' ? '' : 'opacity-40 pointer-events-none'}`}>
                                <button onClick={() => setDiceTextureSet('plain')} className={`px-3 py-1.5 rounded text-[10px] font-black ${diceTextureSet === 'plain' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>PLAIN</button>
                                <button onClick={() => setDiceTextureSet('tech')} className={`px-3 py-1.5 rounded text-[10px] font-black ${diceTextureSet === 'tech' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>TECH</button>
                                <button onClick={() => setDiceTextureSet('crystal')} className={`px-3 py-1.5 rounded text-[10px] font-black ${diceTextureSet === 'crystal' ? 'bg-cyan-700 text-white' : 'text-slate-500'}`}>CRYSTAL</button>
                              </div>
                            </div>
                            <div className="rounded border border-slate-800 bg-slate-950/50 p-3 text-[9px] text-slate-500 leading-relaxed">
                              Optional 3D renderer: <a className="text-cyan-400 hover:text-cyan-200" href="https://github.com/3d-dice/dice-box" target="_blank" rel="noreferrer">@3d-dice/dice-box</a> with the <a className="text-cyan-400 hover:text-cyan-200" href="https://fantasticdice.games/docs/addons/displayResults" target="_blank" rel="noreferrer">DisplayResults</a> addon, used under the MIT License. Hope, Fear and Damage use selectable Plain, Tech, or Crystal VeilFarers themes. The gray-off crystal is used for discarded-result cues. See THIRD_PARTY_NOTICES.md.
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                              <div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-400 mb-3">Audio</div>
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <div><label className="text-xs font-bold text-slate-500 uppercase block">Dice sound</label><span className="text-[10px] text-slate-500">Generated locally; no external audio file.</span></div>
                                <button role="switch" aria-checked={diceSoundEnabled} onClick={() => setDiceSoundEnabled(value => !value)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${diceSoundEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${diceSoundEnabled ? 'left-[22px]' : 'left-0.5'}`}></span></button>
                              </div>
                              <div className={`flex items-center justify-between gap-3 ${diceSoundEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Volume</span>
                                <div className="vf-stepper">
                                  <button onClick={() => setDiceVolume(value => Math.max(0, Math.round((value - 0.1) * 10) / 10))} aria-label="Reduce dice volume">−</button>
                                  <output>{Math.round(diceVolume * 100)}%</output>
                                  <button onClick={() => setDiceVolume(value => Math.min(1, Math.round((value + 0.1) * 10) / 10))} aria-label="Increase dice volume">+</button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-2 mt-4 pt-4 border-t border-slate-800">
                            <div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-400 mb-3">Spotlight</div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Spotlight colour <span className="text-slate-600 normal-case font-normal">(only you see this)</span></label>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(SPOT_THEMES).map(function (key) {
                                const th = SPOT_THEMES[key]; const active = spotColor === key;
                                return (
                                  <button key={key} onClick={() => setSpotColor(key)} title={th.label}
                                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-colors ${active ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <span className="w-7 h-7 rounded-full border border-black/40" style={{ background: `radial-gradient(circle at 35% 30%, ${th.swatch}, rgba(0,0,0,0.4))`, boxShadow: `0 0 8px ${th.swatch}` }}></span>
                                    <span className="text-[8px] font-bold uppercase text-slate-400 leading-tight text-center max-w-[54px]">{th.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mb-2 mt-4 pt-4 border-t border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block">Spotlight flicker</label>
                                <span className="text-[10px] text-slate-500">The lantern's broken-light flicker effect</span>
                              </div>
                              <button role="switch" aria-checked={flickerEnabled} onClick={() => setFlickerEnabled(v => !v)}
                                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${flickerEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${flickerEnabled ? 'left-[22px]' : 'left-0.5'}`}></span>
                              </button>
                            </div>
                            <div className={flickerEnabled ? '' : 'opacity-40 pointer-events-none'}>
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wide">Wait between flickers</span>
                                <span className="font-mono text-cyan-400">~{flickerWait}s</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[9px] text-slate-600">2s frequent</span>
                                <div className="vf-stepper"><button onClick={() => setFlickerWait(value => Math.max(2, value - 1))}>−</button><output>{flickerWait}s</output><button onClick={() => setFlickerWait(value => Math.min(30, value + 1))}>+</button></div>
                                <span className="text-[9px] text-slate-600">30s rare</span>
                              </div>
                            </div>
                          </div>

                          </div>
                          <div className="sm:hidden shrink-0 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] border-t border-slate-800 bg-slate-900/98 backdrop-blur">
                              <button type="button" onClick={() => setShowSettings(false)} aria-label="Back to Player Tool" className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-950 border border-slate-700 text-cyan-300 rounded-md text-[10px] font-black uppercase tracking-wide"><span aria-hidden="true" className="text-base leading-none">←</span> Back</button>
                          </div>
                      </div>
                  </div>
              )}

              {/* CHARACTER VAULT — GLOBAL PORTAL */}
              {showVault && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4" style={{zIndex:2147483600}} role="dialog" aria-modal="true" aria-label="Character Vault">
                  <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-cyan-700/50 bg-slate-950 shadow-2xl flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3">
                      <div><div className="text-[9px] font-black uppercase tracking-[.18em] text-cyan-400">Character Vault</div><h2 className="mt-1 text-lg font-black text-white">Choose a saved character</h2><p className="mt-1 text-[10px] text-slate-500">The permanent VF ID updates an existing Player Tool character instead of creating a duplicate.</p></div>
                      <button onClick={() => setShowVault(false)} className="p-2 rounded border border-slate-700 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {vaultError && <div className="rounded-lg border border-red-700/60 bg-red-950/30 p-3 text-xs text-red-200">{vaultError}</div>}
                      {vaultLoading && <div className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 p-4 text-xs text-cyan-200 animate-pulse">Refreshing cloud Vault…</div>}
                      {!vaultLoading && vaultRecords.length === 0 && <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-xs text-slate-500">No completed characters are available. Finish a character in Character Creator first.</div>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {vaultRecords.map(record => { const registry=window.VeilFarersCharacterRegistry; const item=registry && registry.summary ? registry.summary(record) : {name:'Unnamed Veilfarer',characterId:record.characterId,level:1,path:'',className:''}; const active=registry&&registry.currentId&&registry.currentId()===item.characterId; return <button key={record.characterId} onClick={() => openVaultCharacter(record)} className={`text-left rounded-xl border p-4 transition-colors ${active?'border-cyan-500 bg-cyan-950/25 shadow-[0_0_18px_rgba(34,211,238,.08)]':'border-slate-800 bg-slate-900/55 hover:border-cyan-600 hover:bg-cyan-950/20'}`}><div className="flex items-start justify-between gap-2"><div className="text-sm font-black text-white">{item.name}</div>{active&&<span className="rounded-full border border-cyan-600/60 bg-cyan-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300">Active</span>}</div><div className="mt-1 text-[9px] font-mono uppercase tracking-wide text-cyan-400">{item.characterId}</div><div className="mt-2 text-[10px] text-slate-400">Level {item.level} · {[item.path,item.className,item.subclass].filter(Boolean).join(' · ')}</div><div className="mt-2 text-[8px] uppercase font-black text-slate-600">{item.cloudState || 'local'} · {active?'Open active':'Set active & open'}</div></button>; })}
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-800 flex justify-between gap-2"><button onClick={openCharacterVault} disabled={vaultLoading} className="px-3 py-2 rounded border border-cyan-800 text-[10px] font-black uppercase text-cyan-300 disabled:opacity-40">Refresh</button><button onClick={() => setShowVault(false)} className="px-3 py-2 rounded border border-slate-700 text-[10px] font-black uppercase text-slate-300">Close</button></div>
                  </div>
                </div>, document.body
              )}

              {/* 3D DICE INITIALIZATION — GLOBAL PORTAL */}
              {dice3DLoad.open && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4" style={{zIndex:2147483640}} role="dialog" aria-modal="true" aria-label="Loading 3D dice">
                  <div className="w-full max-w-md rounded-2xl border border-cyan-700/60 bg-slate-950 p-5 shadow-2xl">
                    <div className="text-[9px] font-black uppercase tracking-[.18em] text-cyan-400">3D Dice Engine</div>
                    <h2 className="mt-2 text-lg font-black text-white">{dice3DLoad.error ? 'Renderer unavailable' : 'Preparing the dice'}</h2>
                    <p className={`mt-2 text-xs ${dice3DLoad.error ? 'text-red-200' : 'text-slate-400'}`}>{dice3DLoad.error || dice3DLoad.stage}</p>
                    <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full transition-all duration-300 ${dice3DLoad.error ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width:`${Math.max(4,Math.min(100,dice3DLoad.progress||0))}%`}}></div></div>
                    {!dice3DLoad.error && <p className="mt-2 text-[9px] text-slate-600">The pending roll will begin automatically when the renderer is ready.</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dice3DLoad.error && <button onClick={() => { dice3DReadyRef.current=false; dice3DInitRef.current=null; setDice3DLoad({open:true,stage:'Retrying…',progress:8,error:''}); ensureDice3DReady({showProgress:true}).catch(()=>{}); }} className="px-3 py-2 rounded border border-cyan-700 bg-cyan-950/30 text-[10px] font-black uppercase text-cyan-200">Retry</button>}
                      <button onClick={() => { setDiceMode('2d'); setDice3DLoad({open:false,stage:'Idle',progress:0,error:''}); }} className="px-3 py-2 rounded border border-slate-700 text-[10px] font-black uppercase text-slate-300">Use 2D dice</button>
                      <button onClick={() => setDice3DLoad(current => ({...current,open:false}))} className="ml-auto px-3 py-2 rounded border border-slate-800 text-[10px] font-black uppercase text-slate-400">Close</button>
                    </div>
                  </div>
                </div>, document.body
              )}

              {/* CONNECTION ERRORS — ALWAYS ABOVE NAVIGATION, MODALS AND 3D DICE */}
              {errorMsg && ReactDOM.createPortal(
                  <div role="alert" aria-live="assertive" className="fixed left-1/2 -translate-x-1/2 w-[min(94vw,760px)] border-2 border-red-400 text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3" style={{zIndex:59998,top:'calc(var(--vf-portal-height, 48px) + 10px + env(safe-area-inset-top))',background:'#450a0a',boxShadow:'0 18px 48px rgba(0,0,0,.72)'}}>
                      <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1"><div className="text-[9px] font-black uppercase tracking-[.16em] text-red-300">Connection error</div><div className="mt-1 text-xs font-mono break-words">{errorMsg}</div></div>
                      <button aria-label="Dismiss connection error" onClick={() => setErrorMsg('')} className="shrink-0 p-1 rounded hover:bg-red-900"><X className="w-4 h-4 text-red-200" /></button>
                  </div>, document.body
              )}

              {/* HISTORY PANEL */}
              {showHistory && ReactDOM.createPortal(
                 <div className="fixed inset-0 bg-black/60 z-[60010]" onMouseDown={e => { if(e.target===e.currentTarget)setShowHistory(false); }}>
                 <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="sticky top-0 z-30 p-4 border-b border-slate-800 flex justify-between items-center gap-3 bg-slate-900/98 backdrop-blur">
                       <h2 className="text-sm font-bold text-white flex items-center gap-2 min-w-0"><ScrollText className="w-4 h-4 text-cyan-500 shrink-0" /> <span className="truncate">Roll History</span></h2>
                       <div className="flex items-center gap-2 shrink-0">
                         <button onClick={() => showConfirm('Reset the complete roll log and remove its Time Travel snapshots for this table?', clearRollHistory, 'Reset roll history')} title="Reset roll history" className="px-2.5 py-1.5 rounded border border-red-900/70 bg-red-950/20 text-[9px] text-red-300 hover:border-red-500 uppercase font-black">Reset</button>
                         <button onClick={() => setShowHistory(false)} title="Close roll history" className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 text-[9px] text-slate-200 hover:border-cyan-500 uppercase font-black inline-flex items-center gap-1"><X className="w-3 h-3" />Close</button>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {rollHistory.length === 0 && <div className="text-center text-slate-600 text-xs italic py-4">No rolls recorded yet.</div>}
                        {rollHistory.map((roll, idx) => (
                           <div key={idx} className="bg-slate-900/50 rounded border border-slate-800 p-3 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-slate-300">{roll.playerName}</span>
                                 <span className="text-[10px] text-slate-600">{new Date(roll.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{roll.label}</div>
                              {roll.resourceCost && roll.resourceCost.amount > 0 && <div className="mb-2 inline-flex items-center gap-1 rounded border border-amber-900/60 bg-amber-950/20 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-amber-300"><Zap className="w-3 h-3" />Spent {roll.resourceCost.amount} {roll.resourceCost.resource}</div>}
                              {hasTimeTravelSnapshot(roll) && <button onClick={() => restoreTimeTravelSnapshot(roll)} className="mb-2 ml-1 inline-flex items-center gap-1 rounded border border-cyan-900/70 bg-cyan-950/20 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-cyan-300 hover:border-cyan-500" title="Restore the character state immediately before this log entry">↶ Time travel</button>}
                              
                              {roll.type === 'duality' ? (
                                 <div>
                                   <div className="flex justify-between items-end">
                                      <div className="flex gap-2">
                                         <div className="flex flex-col items-center">
                                            <span className="text-[8px] text-cyan-500 font-bold">HOPE</span>
                                            <span className="text-lg font-bold text-white">{roll.hope}</span>
                                         </div>
                                         <div className="flex flex-col items-center">
                                            <span className="text-[8px] text-purple-500 font-bold">FEAR</span>
                                            <span className="text-lg font-bold text-white">{roll.fear}</span>
                                         </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                         <span className="text-xl font-black text-white">{roll.total}</span>
                                         <span className={`text-[8px] font-bold ${roll.outcomeColor}`}>{roll.outcome}</span>
                                         {(roll.modifier !== 0 || roll.extra) && (
                                             <span className="text-[8px] text-slate-500">
                                                {roll.modifier !== 0 && `Mod ${roll.modifier > 0 ? '+' : ''}${roll.modifier}`}
                                                {roll.extra && ` ${roll.rollType === 'advantage' ? '+' : '-'} ${roll.extra}`}
                                             </span>
                                         )}
                                      </div>
                                   </div>
                                   {roll.damage != null && (
                                     <div className="mt-2 pt-2 border-t border-red-900/50 flex justify-between items-center gap-2">
                                       <div>
                                         <div className="text-[9px] text-red-400 font-bold uppercase">Damage · {roll.damageDice || roll.damageBase || 'weapon'}{roll.damageModifier ? ` ${roll.damageModifier > 0 ? '+' : ''}${roll.damageModifier}` : ''}</div>
                                         <DamageDiceDisplay
                                           results={roll.damageDiceResults}
                                           rolls={roll.damageRolls}
                                           discardedIndices={roll.damageDiscardedIndices}
                                           rerolls={roll.damageRerolls}
                                           sides={parseInt((String(roll.damageRolledDice || roll.damageDice || '').match(/d(\d+)/) || [])[1]) || 6}
                                           compact={true}
                                         />
                                         {roll.damageDetail && <div className="text-[8px] text-slate-500 font-mono mt-1">{roll.damageDetail}{roll.crit ? ' · critical' : ''}</div>}
                                         {(roll.damageRules || []).map((rule, index) => <div key={index} className="text-[8px] text-yellow-300/70 mt-0.5">{rule}</div>)}
                                       </div>
                                       <div className="text-xl font-black text-red-400">{roll.damage}</div>
                                     </div>
                                   )}
                                   {roll.attackBreakdown && roll.attackBreakdown.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{roll.attackBreakdown.map((part, index) => <span key={index} className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-950 text-[8px] text-slate-400">{part.label} {part.value >= 0 ? '+' : ''}{part.value}</span>)}</div>}
                                   {roll.weaponEffects && roll.weaponEffects.length > 0 && (
                                     <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                                       {roll.weaponEffects.map((effect, index) => <div key={index} className="text-[8px] text-slate-400 leading-snug"><span className="font-bold text-slate-200">{effect.name}</span>{effect.timing ? ` · ${effect.timing}` : ''}: {effect.effect}</div>)}
                                     </div>
                                   )}
                                 </div>
                              ) : (
                                 <>
                                 <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <div className={`text-[9px] font-bold uppercase ${roll.type === 'damage' ? 'text-red-400' : 'text-slate-500'}`}>
                                          {roll.type === 'damage' ? (roll.dice || 'Damage') : `${roll.count || 1}d${roll.die || '?'}`}
                                          {roll.modifier ? ` ${roll.modifier > 0 ? '+' : ''}${roll.modifier}` : ''}
                                        </div>
                                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                                           {(roll.rolls || []).map((r, i) => <span key={i} className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-bold ${roll.type === 'damage' ? 'bg-red-950/50 border border-red-900 text-red-300' : (r === roll.die ? 'bg-slate-800 text-yellow-400 border border-yellow-500/50' : 'bg-slate-800 text-slate-400')}`}>{r}</span>)}
                                        </div>
                                        {roll.modifier !== 0 && <span className="text-[8px] text-slate-500">Modifier {roll.modifier > 0 ? '+' : ''}{roll.modifier}</span>}
                                    </div>
                                    <div className={`text-xl font-black ${roll.type === 'damage' ? 'text-red-400' : 'text-white'}`}>{roll.total}</div>
                                 </div>
                                 {roll.details && <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-slate-400 leading-relaxed">{roll.details}</div>}
                                 </>
                              )}
                           </div>
                        ))}
                    </div>
                 </div>
                 </div>, document.body
              )}

              {/* ROLLER 1: PLAYER ROLLER (FLOATING WINDOW) */}
              {showRoller && (
                  <div style={{ left: positions.player.x, top: positions.player.y, transform: `scale(${rollerScale})`, transformOrigin: "top left" }} 
                       className="fixed z-40 bg-slate-900 border border-slate-600 rounded-xl w-full max-w-sm shadow-2xl window-shadow flex flex-col overflow-hidden">
                          
                          {/* HEADER - DRAGGABLE */}
                          <div onMouseDown={(e) => startDrag(e, 'player')} onTouchStart={(e) => startDrag(e, 'player')} className="bg-slate-800/80 p-3 cursor-move flex justify-between items-center select-none border-b border-slate-700 touch-none">
                              <h2 className="text-sm font-bold text-white flex items-center gap-2 pointer-events-none"><Dices className="text-purple-400 w-4 h-4" /> {rollLabel}</h2>
                              <div className="flex items-center gap-1">
                                  <button onClick={() => setDiceMode(value => value === '2d' ? '3d' : '2d')} title="Toggle 2D / 3D dice" className={`px-1.5 py-1 rounded border text-[8px] font-black ${diceMode === '3d' ? 'border-cyan-500 text-cyan-300 bg-cyan-950/40' : 'border-slate-700 text-slate-400'}`}>{diceMode.toUpperCase()}</button>
                                  <button onClick={() => setRollerScale(s => Math.max(0.5, Math.round((s-0.1)*10)/10))} title="Smaller" className="p-1 rounded hover:bg-slate-700 text-slate-400 text-xs font-bold w-5">-</button><button onClick={() => setRollerScale(s => Math.min(1, Math.round((s+0.1)*10)/10))} title="Larger" className="p-1 rounded hover:bg-slate-700 text-slate-400 text-xs font-bold w-5">+</button><button onClick={() => setPinned(p => ({...p, player: !p.player}))} title="Pin Window (Prevents auto-close)" className={`p-1 rounded hover:bg-slate-700 ${pinned.player ? 'text-cyan-400' : 'text-slate-500'}`}><Pin className="w-3 h-3" /></button>
                                  <button onClick={() => setMinimized(p => ({...p, player: !p.player}))} title="Minimize" className="p-1 rounded hover:bg-slate-700 text-slate-400"><Minus className="w-3 h-3" /></button>
                                  <button onClick={() => { if (diceMode === '3d' && window.VFDice3D) window.VFDice3D.hide({reason:'user'}); setShowRoller(false); }} title="Close" className="p-1 rounded hover:bg-red-900/50 text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                              </div>
                          </div>
                          
                          {/* BODY - HIDDEN IF MINIMIZED */}
                          {!minimized.player && (
                              <div className="p-4 bg-slate-900">
                                  {/* TAB SWITCHER */}
                                  <div className="flex bg-slate-950 rounded-lg p-1 mb-4">
                                      <button onClick={() => setPlayerRollerMode('duality')} className={`flex-1 py-1 text-xs font-bold rounded uppercase ${playerRollerMode === 'duality' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Duality (2d12)</button>
                                      <button onClick={() => setPlayerRollerMode('standard')} className={`flex-1 py-1 text-xs font-bold rounded uppercase ${playerRollerMode === 'standard' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Standard Dice</button>
                                  </div>

                                  {playerRollerMode === 'duality' ? (
                                    <>
                                        <div className="flex justify-center gap-2 mb-4">
                                            <button onClick={() => setPlayerRollType('disadvantage')} className={`px-3 py-1 text-xs font-bold rounded border ${playerRollType === 'disadvantage' ? 'bg-red-900 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>DIS</button>
                                            <button onClick={() => setPlayerRollType('normal')} className={`px-3 py-1 text-xs font-bold rounded border ${playerRollType === 'normal' ? 'bg-slate-800 border-slate-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>NORM</button>
                                            <button onClick={() => setPlayerRollType('advantage')} className={`px-3 py-1 text-xs font-bold rounded border ${playerRollType === 'advantage' ? 'bg-green-900 border-green-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>ADV</button>
                                        </div>

                                        <div className="flex justify-center items-center gap-6 mb-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-cyan-400 uppercase mb-1">HOPE</span>
                                                <div className={`w-14 h-14 bg-slate-800 border-2 border-cyan-500 rounded-xl flex items-center justify-center text-2xl font-black text-cyan-100 ${rollResult && rollResult.crit ? 'shadow-[0_0_22px_rgba(250,204,21,.9)] animate-pulse' : ''}`}>
                                                    {rollResult ? rollResult.hope : "?"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-purple-400 uppercase mb-1">FEAR</span>
                                                <div className={`w-14 h-14 bg-slate-800 border-2 border-purple-500 rounded-xl flex items-center justify-center text-2xl font-black text-purple-100 ${rollResult && rollResult.crit ? 'shadow-[0_0_22px_rgba(168,85,247,.95)] animate-pulse' : ''}`}>
                                                    {rollResult ? rollResult.fear : "?"}
                                                </div>
                                            </div>
                                            {rollResult && rollResult.extra ? (
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-bold uppercase mb-1 ${rollResult.rollType === 'advantage' ? 'text-green-400' : 'text-red-400'}`}>{rollResult.rollType === 'advantage' ? 'ADV' : 'DIS'}</span>
                                                <div className={`w-14 h-14 bg-slate-800 border-2 rounded-xl flex items-center justify-center text-2xl font-black ${rollResult.rollType === 'advantage' ? 'border-green-500 text-green-100' : 'border-red-500 text-red-100'}`}>
                                                    {rollResult.rollType === 'advantage' ? '+' : '-'}{rollResult.extra}
                                                </div>
                                            </div>
                                            ) : null}
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex items-center justify-center gap-4 bg-slate-950 p-2 rounded">
                                                <span className="text-xs text-slate-500 font-bold uppercase">Modifier:</span>
                                                <NumField min="-20" max="20" value={rollModifier} onChange={e => setRollModifier(clampMod(e.target.value))} className="w-12 bg-transparent text-center font-bold text-white border-b border-slate-700 outline-none" />
                                            </div>
                                        </div>
                                        {rollResult && rollResult.type === 'duality' && (
                                            <div className="text-center mb-4 bg-slate-950/50 p-2 rounded">
                                                <div className="text-3xl font-black text-white">{rollResult.total}</div>
                                                <div className={`text-xs font-bold ${rollResult.outcomeColor}`}>{rollResult.outcome}</div>
                                                {(rollResult.damage != null) && (<div className="mt-2 px-3 py-1 border-2 border-red-500 rounded-lg bg-red-950/30 inline-block"><span className="text-3xl font-black text-red-400 leading-none">{rollResult.damage}</span> <span className="text-[10px] text-red-300 font-bold uppercase">DMG{rollResult.crit ? " x2" : ""}</span></div>)}
                                            </div>
                                        )}
                                        <button onClick={rollDuality} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg">ROLL</button>
                                    </>
                                  ) : (
                                    <>
                                        {/* STANDARD DICE UI */}
                                        <div className="grid grid-cols-6 gap-1 mb-4">
                                            {[4, 6, 8, 10, 12, 20].map(d => (
                                                <button key={d} onClick={() => setGenDieType(d)} className={`aspect-square flex items-center justify-center font-bold text-xs rounded border transition-all ${genDieType === d ? 'bg-slate-700 text-white border-purple-400' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                                                    d{d}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 items-end mb-4">
                                            <div className="flex-1">
                                                <label className="text-[9px] uppercase font-bold text-slate-500 block">Count</label>
                                                <NumField min="1" max="99" value={genCount} onChange={e => setGenCount(clampCount(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-center font-bold text-white" />
                                            </div>
                                            <div className="flex items-center justify-center pb-2 text-slate-600 font-bold">d{genDieType} +</div>
                                            <div className="flex-1">
                                                <label className="text-[9px] uppercase font-bold text-slate-500 block">Mod</label>
                                                <NumField min="-20" max="20" value={genModifier} onChange={e => setGenModifier(clampMod(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-center font-bold text-white" />
                                            </div>
                                        </div>

                                        <button onClick={rollGenericPlayer} className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg shadow-lg">ROLL</button>
                                    </>
                                  )}
                              </div>
                          )}
                  </div>
              )}
              
              {/* ROLLER 2: GM DICE TRAY (FLOATING WINDOW) */}
              {showDiceTray && (
                   <div style={{ left: positions.gm.x, top: positions.gm.y }}
                        className="fixed z-50 bg-slate-900 border border-yellow-600 rounded-xl w-full max-w-sm shadow-2xl window-shadow flex flex-col overflow-hidden">
                          
                          {/* HEADER */}
                          <div onMouseDown={(e) => startDrag(e, 'gm')} onTouchStart={(e) => startDrag(e, 'gm')} className="bg-slate-800/80 p-3 cursor-move flex justify-between items-center select-none border-b border-yellow-600/30 touch-none">
                              <h2 className="text-sm font-bold text-yellow-500 flex items-center gap-2 pointer-events-none"><Crown className="w-4 h-4" /> GM Tray</h2>
                              <div className="flex items-center gap-1">
                                  <button onClick={() => setPinned(p => ({...p, gm: !p.gm}))} title="Pin Window" className={`p-1 rounded hover:bg-slate-700 ${pinned.gm ? 'text-yellow-400' : 'text-slate-500'}`}><Pin className="w-3 h-3" /></button>
                                  <button onClick={() => setMinimized(p => ({...p, gm: !p.gm}))} title="Minimize" className="p-1 rounded hover:bg-slate-700 text-slate-400"><Minus className="w-3 h-3" /></button>
                                  <button onClick={() => setShowDiceTray(false)} title="Close" className="p-1 rounded hover:bg-red-900/50 text-slate-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                              </div>
                          </div>

                          {!minimized.gm && (
                              <div className="p-4 bg-slate-900">
                                  <div className="grid grid-cols-6 gap-1 mb-6">
                                    {[4, 6, 8, 10, 12, 20].map(d => (
                                        <button key={d} onClick={() => setGenDieType(d)} className={`aspect-square flex items-center justify-center font-bold text-xs rounded border transition-all ${genDieType === d ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                                            d{d}
                                        </button>
                                    ))}
                                  </div>

                                  <div className="flex gap-4 items-end mb-6">
                                      <div className="flex-1">
                                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Count</label>
                                          <NumField min="1" max="99" value={genCount} onChange={e => setGenCount(clampCount(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-center font-bold text-white outline-none focus:border-yellow-500" />
                                      </div>
                                      <div className="flex items-center justify-center pb-2 text-slate-600 font-bold">d{genDieType} +</div>
                                      <div className="flex-1">
                                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Mod</label>
                                          <NumField min="-20" max="20" value={genModifier} onChange={e => setGenModifier(clampMod(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-center font-bold text-white outline-none focus:border-yellow-500" />
                                      </div>
                                  </div>

                                  <div className="flex items-center justify-center gap-3 mb-4">
                                      <span className="text-xs text-slate-400 font-bold select-none">Broadcast to Players</span>
                                      <button role="switch" aria-checked={genBroadcast} onClick={() => setGenBroadcast(value => !value)} className={`relative w-11 h-6 rounded-full transition-colors ${genBroadcast ? 'bg-yellow-600' : 'bg-slate-700'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${genBroadcast ? 'left-[22px]' : 'left-0.5'}`}></span></button>
                                  </div>

                                  <button onClick={rollGenericGM} className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-lg">ROLL</button>
                              </div>
                          )}
                   </div>
              )}

              {/* WEAPON LOADOUT MANAGER */}
              {showWeaponManager && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-3 md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowWeaponManager(false); }}>
                  <div className="bg-slate-900 border border-yellow-700/50 rounded-xl w-[96vw] max-w-6xl h-[88vh] flex flex-col min-w-0 shadow-2xl overflow-hidden">
                    <header className="p-3 md:p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-950">
                      <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2"><Zap className="text-yellow-400" /> Weapon Loadout</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">Keep any number in your arsenal. Equip several and select the active weapon from the sheet.</p>
                      </div>
                      <button onClick={() => setShowWeaponManager(false)} className="self-end sm:self-auto p-2 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-500" aria-label="Close weapon loadout"><X className="w-5 h-5" /></button>
                    </header>
                    <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-2 md:items-center">
                      <div className="flex gap-1 rounded-lg border border-slate-800 bg-black p-1 shrink-0">
                        <button onClick={() => setWeaponManagerView('arsenal')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${weaponManagerView === 'arsenal' ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>Arsenal · {arsenalWeapons.length}</button>
                        <button onClick={() => setWeaponManagerView('catalog')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${weaponManagerView === 'catalog' ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>All Weapons · {WEAPON_CATALOG.length}</button>
                      </div>
                      <input value={weaponSearch} onChange={event => setWeaponSearch(event.target.value)} placeholder="Search name, trait, range or feature…" className="flex-grow min-w-0 bg-black border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 placeholder-slate-600" />
                      <button onClick={() => setShowCustomWeaponForm(value => !value)} className="px-3 py-2 rounded-lg border border-purple-700/60 bg-purple-950/20 text-purple-300 text-[10px] font-black uppercase hover:border-purple-500">{showCustomWeaponForm ? 'Cancel custom' : '+ Custom weapon'}</button>
                    </div>
                    {showCustomWeaponForm && (
                      <div className="p-3 border-b border-purple-900/50 bg-purple-950/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                        {['name','trait','range','damage','feature'].map(field => <input key={field} value={customWeaponDraft[field]} onChange={event => setCustomWeaponDraft({ ...customWeaponDraft, [field]: event.target.value })} placeholder={field === 'feature' ? 'Features, comma separated' : field.charAt(0).toUpperCase() + field.slice(1)} className={`bg-black border border-slate-700 rounded px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500 ${field === 'feature' ? 'sm:col-span-2 lg:col-span-2' : ''}`} />)}
                        <button disabled={!String(customWeaponDraft.name || '').trim()} onClick={addCustomWeapon} className="px-3 py-2 rounded border border-purple-500/50 bg-purple-800/20 text-purple-200 text-[10px] font-black uppercase disabled:opacity-30">Add & equip</button>
                      </div>
                    )}
                    <div className="flex-grow min-h-0 overflow-y-auto p-3 md:p-4 bg-slate-900">
                      {filteredWeaponManagerPool.length ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                          {filteredWeaponManagerPool.map((rawWeapon, index) => {
                            const weapon = hydratePlayerWeapon(rawWeapon);
                            const key = weaponKey(weapon);
                            const equipped = equippedKeys.has(key);
                            const owned = arsenalKeys.has(key);
                            const active = key === weaponKey(activeWeapon);
                            const profile = weaponAttackProfile(weapon, character, equippedWeapons);
                            const damagePlan = weaponDamagePlan(weapon.damage, 1, profile);
                            const proficiencyDamage = damagePlan ? `${damagePlan.keptCount}d${damagePlan.sides}${damagePlan.staticMod ? (damagePlan.staticMod > 0 ? '+' : '') + damagePlan.staticMod : ''}` : '';
                            return (
                              <div key={key || index} className={`rounded-lg border p-3 ${active ? 'border-yellow-500/70 bg-yellow-950/15' : equipped ? 'border-cyan-700/50 bg-cyan-950/10' : 'border-slate-800 bg-slate-950/45'}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-black text-white">{weapon.name}</span>{active && <span className="px-1.5 py-0.5 rounded border border-yellow-500/40 bg-yellow-500/10 text-[8px] text-yellow-300 font-black uppercase">Active</span>}{equipped && !active && <span className="px-1.5 py-0.5 rounded border border-cyan-600/40 bg-cyan-500/10 text-[8px] text-cyan-300 font-black uppercase">Equipped</span>}</div>
                                    <div className="flex flex-wrap gap-1 mt-1.5 text-[9px]"><span className="px-1.5 py-0.5 rounded border border-cyan-900/60 text-cyan-300">{weapon.trait || 'No trait'} {profile.traitMod >= 0 ? '+' : ''}{profile.traitMod}</span>{weapon.range && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{weapon.range}</span>}<span className="px-1.5 py-0.5 rounded border border-red-900/60 text-red-300">{weapon.damage || 'No damage'}</span>{proficiencyDamage && <span title="Proficiency multiplies weapon damage dice." className="px-1.5 py-0.5 rounded border border-fuchsia-900/60 text-fuchsia-300">P{profile.proficiency} → {proficiencyDamage}</span>}{weapon.tier && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-500">{itemTierLabel(weapon)}</span>}</div>
                                    {profile.entries.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{profile.entries.map((entry, i) => <span key={i} title={conciseEffect(entry)} className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-[8px] font-bold text-slate-300 cursor-help">{entry.display}</span>)}</div>}
                                  </div>
                                  <div className="flex flex-col gap-1.5 shrink-0">
                                    <button onClick={() => toggleWeaponEquip(weapon)} className={`px-2.5 py-1.5 rounded border text-[9px] font-black uppercase ${equipped ? 'border-red-800/60 bg-red-950/20 text-red-300' : 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300'}`}>{equipped ? 'Unequip' : 'Equip'}</button>
                                    {equipped && !active && <button onClick={() => setActiveWeapon(weapon)} className="px-2.5 py-1.5 rounded border border-yellow-600/50 bg-yellow-950/20 text-yellow-300 text-[9px] font-black uppercase">Set active</button>}
                                    {owned && !equipped && <button onClick={() => removeWeaponFromArsenal(weapon)} className="px-2.5 py-1 rounded border border-slate-800 text-slate-500 text-[8px] font-bold uppercase hover:text-red-300">Remove</button>}
                                  </div>
                                </div>
                                {profile.effects.length > 0 && <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">{profile.effects.slice(0,3).map((effect, i) => <div key={i} className="text-[9px] text-slate-400 leading-snug"><span className="font-bold text-slate-200">{effect.name}</span>{effect.timing ? ` · ${effect.timing}` : ''}: {effect.effect}</div>)}</div>}
                              </div>
                            );
                          })}
                        </div>
                      ) : <div className="h-full flex items-center justify-center text-sm text-slate-600 italic">No weapons match this view.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* ARMOR LOADOUT MANAGER */}
              {showArmorManager && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-3 md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowArmorManager(false); }}>
                  <div className="bg-slate-900 border border-amber-700/50 rounded-xl w-[96vw] max-w-5xl h-[84vh] flex flex-col min-w-0 shadow-2xl overflow-hidden">
                    <header className="p-3 md:p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-950">
                      <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2"><Shield className="text-amber-400" /> Armor Loadout</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">Add armor from the canon database to the inventory, then mark one suit as active.</p>
                      </div>
                      <button onClick={() => setShowArmorManager(false)} className="self-end sm:self-auto p-2 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-500" aria-label="Close armor loadout"><X className="w-5 h-5" /></button>
                    </header>
                    <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-2 md:items-center">
                      <div className="flex gap-1 rounded-lg border border-slate-800 bg-black p-1 shrink-0">
                        <button onClick={() => setArmorManagerView('inventory')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${armorManagerView === 'inventory' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>Inventory · {armorArsenal.length}</button>
                        <button onClick={() => setArmorManagerView('catalog')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${armorManagerView === 'catalog' ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>All Armor · {ARMOR_CATALOG.length}</button>
                      </div>
                      <input value={armorSearch} onChange={event => setArmorSearch(event.target.value)} placeholder="Search armor by name, thresholds or feature…" className="flex-grow min-w-0 bg-black border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500 placeholder-slate-600" />
                    </div>
                    <div className="flex-grow min-h-0 overflow-y-auto p-3 md:p-4 bg-slate-900">
                      {filteredArmorManagerPool.length ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">{filteredArmorManagerPool.map((rawArmor, index) => { const armor = hydrateArmor(rawArmor); const key = armorKey(armor); const owned = armorInventoryKeys.has(key); const active = key === (character.activeArmorId || ''); const summary = armorSummary(armor); return <div key={key || index} className={`rounded-lg border p-3 ${active ? 'border-amber-500/70 bg-amber-950/15' : owned ? 'border-cyan-700/50 bg-cyan-950/10' : 'border-slate-800 bg-slate-950/45'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-black text-white">{summary.title}</span>{active && <span className="px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-[8px] text-amber-300 font-black uppercase">Active</span>}{owned && !active && <span className="px-1.5 py-0.5 rounded border border-cyan-600/40 bg-cyan-500/10 text-[8px] text-cyan-300 font-black uppercase">In inventory</span>}</div><div className="flex flex-wrap gap-1 mt-1.5 text-[9px]"><span className="px-1.5 py-0.5 rounded border border-red-900/60 text-red-300">{summary.detail}</span>{summary.tier && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{summary.tier}</span>}<span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-500">{summary.cost}</span></div>{summary.features && <div className="mt-2 text-[9px] text-slate-400 leading-snug">{summary.features}</div>}</div><div className="flex flex-col gap-1.5 shrink-0"><button onClick={() => toggleArmorOwned(armor)} className={`px-2.5 py-1.5 rounded border text-[9px] font-black uppercase ${owned ? 'border-red-800/60 bg-red-950/20 text-red-300' : 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300'}`}>{owned ? 'Remove' : 'Add'}</button>{owned && !active && <button onClick={() => setActiveArmor(armor)} className="px-2.5 py-1.5 rounded border border-amber-600/50 bg-amber-950/20 text-amber-300 text-[9px] font-black uppercase">Set active</button>}{active && <button onClick={clearActiveArmor} className="px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 text-[8px] font-bold uppercase hover:text-white">Clear</button>}</div></div></div>; })}</div> : <div className="h-full flex items-center justify-center text-sm text-slate-600 italic">No armor matches this view.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* AUGMENTATION MANAGER */}
              {showAugmentManager && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-3 md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAugmentManager(false); }}>
                  <div className="bg-slate-900 border border-cyan-700/50 rounded-xl w-[96vw] max-w-5xl h-[84vh] flex flex-col min-w-0 shadow-2xl overflow-hidden">
                    <header className="p-3 md:p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-950">
                      <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2"><Activity className="text-cyan-400" /> Augmentation Manager</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">Track installed augmentations and separately mark which ones are active right now.</p>
                      </div>
                      <button onClick={() => setShowAugmentManager(false)} className="self-end sm:self-auto p-2 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-500" aria-label="Close augmentation manager"><X className="w-5 h-5" /></button>
                    </header>
                    <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-2 md:items-center">
                      <div className="flex gap-1 rounded-lg border border-slate-800 bg-black p-1 shrink-0">
                        <button onClick={() => setAugmentManagerView('inventory')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${augmentManagerView === 'inventory' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>Inventory · {augmentArsenal.length}</button>
                        <button onClick={() => setAugmentManagerView('catalog')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${augmentManagerView === 'catalog' ? 'bg-purple-500/15 border border-purple-500/40 text-purple-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>All Augments · {AUGMENT_CATALOG.length}</button>
                      </div>
                      <input value={augmentSearch} onChange={event => setAugmentSearch(event.target.value)} placeholder="Search augmentations by name, benefit or drawback…" className="flex-grow min-w-0 bg-black border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 placeholder-slate-600" />
                    </div>
                    <div className="flex-grow min-h-0 overflow-y-auto p-3 md:p-4 bg-slate-900">
                      {filteredAugmentManagerPool.length ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">{filteredAugmentManagerPool.map((rawAugment, index) => { const augment = hydrateAugment(rawAugment); const key = augmentKey(augment); const owned = augmentInventoryKeys.has(key); const active = activeAugmentIds.includes(key); const summary = augmentSummary(augment); return <div key={key || index} className={`rounded-lg border p-3 ${active ? 'border-cyan-500/70 bg-cyan-950/15' : owned ? 'border-emerald-700/40 bg-emerald-950/10' : 'border-slate-800 bg-slate-950/45'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-black text-white">{summary.title}</span>{active && <span className="px-1.5 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-[8px] text-cyan-300 font-black uppercase">Active</span>}{owned && !active && <span className="px-1.5 py-0.5 rounded border border-emerald-600/40 bg-emerald-500/10 text-[8px] text-emerald-300 font-black uppercase">In inventory</span>}</div><div className="flex flex-wrap gap-1 mt-1.5 text-[9px]"><span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{summary.tier || 'Augment'}</span><span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-500">{summary.cost}</span>{summary.meta && <span className="px-1.5 py-0.5 rounded border border-purple-800/40 text-purple-300">{summary.meta}</span>}</div><div className="mt-2 text-[9px] text-slate-400 leading-snug">{summary.detail}</div></div><div className="flex flex-col gap-1.5 shrink-0"><button onClick={() => toggleAugmentOwned(augment)} className={`px-2.5 py-1.5 rounded border text-[9px] font-black uppercase ${owned ? 'border-red-800/60 bg-red-950/20 text-red-300' : 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300'}`}>{owned ? 'Remove' : 'Add'}</button>{owned && <button onClick={() => toggleAugmentActive(augment)} className={`px-2.5 py-1.5 rounded border text-[9px] font-black uppercase ${active ? 'border-red-800/60 bg-red-950/20 text-red-300' : 'border-cyan-700/60 bg-cyan-950/20 text-cyan-300'}`}>{active ? 'Deactivate' : 'Activate'}</button>}</div></div></div>; })}</div> : <div className="h-full flex items-center justify-center text-sm text-slate-600 italic">No augmentations match this view.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* GEAR MANAGER */}
              {showGearManager && (
                <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-3 md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGearManager(false); }}>
                  <div className="bg-slate-900 border border-emerald-700/50 rounded-xl w-[96vw] max-w-5xl h-[84vh] flex flex-col min-w-0 shadow-2xl overflow-hidden">
                    <header className="p-3 md:p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-950">
                      <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2"><Database className="text-emerald-400" /> Gear Loadout</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">Add or remove equipment from the rules-data database. Use the free-text inventory lines for custom notes and loose objects.</p>
                      </div>
                      <button onClick={() => setShowGearManager(false)} className="self-end sm:self-auto p-2 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-500" aria-label="Close gear manager"><X className="w-5 h-5" /></button>
                    </header>
                    <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-2 md:items-center">
                      <div className="flex gap-1 rounded-lg border border-slate-800 bg-black p-1 shrink-0">
                        <button onClick={() => setGearManagerView('inventory')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${gearManagerView === 'inventory' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>Loadout · {gearArsenal.length}</button>
                        <button onClick={() => setGearManagerView('catalog')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${gearManagerView === 'catalog' ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300' : 'border border-transparent text-slate-500 hover:text-slate-200'}`}>All Gear · {GEAR_CATALOG.length}</button>
                      </div>
                      <input value={gearSearch} onChange={event => setGearSearch(event.target.value)} placeholder="Search gear by name or use…" className="flex-grow min-w-0 bg-black border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 placeholder-slate-600" />
                    </div>
                    <div className="flex-grow min-h-0 overflow-y-auto p-3 md:p-4 bg-slate-900">
                      {filteredGearManagerPool.length ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">{filteredGearManagerPool.map((rawGear, index) => { const gear = hydrateGear(rawGear); const key = gearKey(gear); const owned = gearInventoryKeys.has(key); const summary = gearSummary(gear); return <div key={key || index} className={`rounded-lg border p-3 ${owned ? 'border-emerald-700/50 bg-emerald-950/10' : 'border-slate-800 bg-slate-950/45'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-black text-white">{summary.title}</span>{owned && <span className="px-1.5 py-0.5 rounded border border-emerald-600/40 bg-emerald-500/10 text-[8px] text-emerald-300 font-black uppercase">In loadout</span>}</div><div className="flex flex-wrap gap-1 mt-1.5 text-[9px]">{summary.tier && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{summary.tier}</span>}<span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-500">{summary.cost}</span></div><div className="mt-2 text-[9px] text-slate-400 leading-snug">{summary.detail}</div></div><button onClick={() => toggleGearOwned(gear)} className={`shrink-0 px-2.5 py-1.5 rounded border text-[9px] font-black uppercase ${owned ? 'border-red-800/60 bg-red-950/20 text-red-300' : 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300'}`}>{owned ? 'Remove' : 'Add'}</button></div></div>; })}</div> : <div className="h-full flex items-center justify-center text-sm text-slate-600 italic">No gear matches this view.</div>}
                    </div>
                  </div>
                </div>
              )}


              {/* DRONE MODULE MANAGER */}
              {showDroneModuleManager && isDrone && (
                <div className="fixed inset-0 bg-black/90 z-[75] flex items-center justify-center p-3 md:p-5" onMouseDown={event=>{if(event.target===event.currentTarget)setShowDroneModuleManager(false);}}>
                  <div className="bg-slate-900 border border-emerald-700/50 rounded-xl w-[96vw] max-w-5xl h-[84vh] flex flex-col min-w-0 shadow-2xl overflow-hidden">
                    <header className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-950"><div><h2 className="text-lg font-black text-white flex items-center gap-2"><Settings className="text-emerald-400"/> Drone installation options</h2><p className="text-[10px] text-slate-500 mt-1">Only modules permitted by the current frame are listed. Higher-grade installations remain a separate downtime modification procedure.</p></div><button onClick={()=>setShowDroneModuleManager(false)} className="self-end sm:self-auto p-2 rounded border border-slate-700 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button></header>
                    <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row gap-3 md:items-center"><div className="px-3 py-2 rounded-lg border border-emerald-700/40 bg-emerald-950/25 text-[10px] font-black uppercase text-emerald-300">{usedDroneModuleSlots}/{character.moduleSlots||0} slots · {availableDroneModuleSlots} free</div><input value={droneModuleSearch} onChange={e=>setDroneModuleSearch(e.target.value)} placeholder="Search module name, tier or use…" className="flex-1 bg-black border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"/></div>
                    <div className="flex-grow min-h-0 overflow-y-auto p-4"><div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{filteredDroneModules.map(module=>{const key=droneModuleKey(module);const installed=installedDroneModuleKeys.has(key);const slots=droneModuleSlots(module);const blockReason=droneModuleInstallBlock(module);const canFit=installed||!blockReason;const cost=parseFeatureCost(module.use||'');const modifiers=droneModuleModifierLabels(module);return <div key={key} data-drone-module={module.name} className={`rounded-lg border p-3 ${installed?'border-emerald-600/60 bg-emerald-950/15':blockReason?'border-slate-800 bg-slate-950/25 opacity-75':'border-slate-800 bg-slate-950/45'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-black text-white">{module.name}</span>{installed&&<span className="px-1.5 py-0.5 rounded border border-emerald-600/40 text-[8px] font-black uppercase text-emerald-300">Installed</span>}</div><div className="mt-1.5 flex flex-wrap gap-1 text-[8px]"><span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{droneModuleAccessLabel(module)}</span>{module.category&&<span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{module.category}</span>}<span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{module.pack==='rust-and-steel'?'Rust & Steel':'Core'}</span><span className="px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">{slots} slot{slots===1?'':'s'}</span>{cost&&<span className="px-1.5 py-0.5 rounded border border-amber-800/50 text-amber-300">Operator: {cost.mode==='mark'?'mark':'spend'} {cost.amount} {cost.resource}</span>}</div>{modifiers.length>0&&<div className="mt-2 flex flex-wrap gap-1">{modifiers.map((entry,i)=><span key={i} className="px-1.5 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/15 text-[8px] text-emerald-300">{entry}</span>)}</div>}<div className="mt-2 text-[9px] leading-relaxed text-slate-400">{module.use}</div>{blockReason&&!installed&&<div className="mt-2 text-[8px] font-bold text-red-300">{blockReason}</div>}</div><div className="flex flex-col gap-2 shrink-0"><button disabled={!canFit} onClick={()=>toggleDroneModule(module)} className={`px-2.5 py-1.5 rounded border text-[9px] font-black uppercase disabled:opacity-30 ${installed?'border-red-800/60 bg-red-950/20 text-red-300':'border-emerald-700/60 bg-emerald-950/20 text-emerald-300'}`}>{installed?'Uninstall':'Install'}</button>{installed&&<button onClick={()=>useDroneModule(module)} className="px-2.5 py-1.5 rounded border border-cyan-700/60 bg-cyan-950/20 text-cyan-300 text-[9px] font-black uppercase">Use</button>}</div></div></div>;})}</div>{!filteredDroneModules.length&&<div className="h-full grid place-items-center text-sm text-slate-600 italic">No compatible modules match this search.</div>}</div>
                  </div>
                </div>
              )}

              {/* CARD MANAGER */}
              {showCardManager && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 border border-slate-700 rounded-xl w-[96vw] max-w-6xl h-[88vh] flex flex-col min-w-0 shadow-2xl overflow-hidden">
                          <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                              <h2 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="text-emerald-400" /> Domain Cards</h2>
                              <button onClick={() => setShowCardManager(false)}><X className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                          </header>
                          <div className="flex flex-grow overflow-hidden min-w-0">
                              <div className="w-36 md:w-48 shrink-0 bg-slate-950 border-r border-slate-800 p-2 flex flex-col gap-1 overflow-y-auto">
                                  {Object.keys(DOMAIN_CARDS).map(domain => (
                                      <button key={domain} onClick={() => setSelectedDomain(domain)} 
                                          className={`px-4 py-3 text-left text-sm font-bold rounded transition-colors ${selectedDomain === domain ? 'bg-slate-800 text-white border-l-2 border-emerald-500' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}>
                                          {domain}
                                      </button>
                                  ))}
                              </div>
                              <div className="flex-grow min-w-0 p-3 md:p-6 overflow-y-auto bg-slate-900">
                                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-widest">Available Cards: {selectedDomain}</h3>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {(DOMAIN_CARDS[selectedDomain] || []).map(card => (
                                          <div key={card.id} className="relative group cursor-pointer" onClick={() => addCard(card)}>
                                              <DomainCard card={card} />
                                              <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center border-2 border-emerald-500">
                                                  <span className="bg-black/80 text-emerald-400 font-bold px-3 py-1 rounded-full text-xs">+ ADD</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              <div className="max-w-7xl mx-auto w-full space-y-2 flex-grow">
                {/* TOP BAR */}
                <div className="vf-player-topbar flex flex-col gap-1 pb-1 border-b border-slate-800 mb-1">
                   
                   {/* ROW 1: TABS */}
                   <div className="vf-player-tabs vf-no-browser-scrollbar flex flex-wrap gap-1 w-full mb-1">
                     {characters.map((char, idx) => (
                       <div key={idx} onClick={() => setActiveTab(idx)}
                          className={`group relative px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wide cursor-pointer flex items-center gap-2 select-none transition-colors whitespace-nowrap ${(char.entityType !== 'drone' && char.id && char.id === spotlight) ? 'vf-tab-spot ' : ''}${(char.entityType !== 'drone' && flick && char.id === spotlight) ? 'flicker ' : ''}${activeTab === idx ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500' : 'bg-slate-950 text-slate-500 hover:bg-slate-900 border-t-2 border-transparent'}`}>
                          {char.entityType !== 'drone' && <Lantern on={!!(char.id && char.id === spotlight)} flicker={!!(flick && char.id === spotlight)} onClick={(e) => { e.stopPropagation(); takeSpotlight(char.id); }} />}
                          {char.entityType === 'drone' ? <Settings className="w-3 h-3 text-emerald-400" /> : <User className="w-3 h-3" />} <span className="max-w-[100px] truncate vf-tabname">{char.name || (char.entityType === 'drone' ? `D${idx + 1}` : `P${idx + 1}`)}</span>
                          <button onClick={(e) => deleteCharacter(e, idx)} className={`ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ${characters.length === 1 ? 'hidden' : ''}`}><X className="w-3 h-3" /></button>
                       </div>
                     ))}
                     <div className="relative" data-add-entity-menu>
                       <button onClick={() => setShowAddMenu(v => !v)} className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-green-400 rounded-t-lg transition-colors border-t-2 border-transparent"><Plus className="w-4 h-4" /></button>
                       {showAddMenu && (
                         <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-slate-700 bg-slate-950/95 shadow-2xl overflow-hidden z-30">
                           <button onClick={openCharacterVault} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-cyan-300 hover:bg-slate-900 flex items-center justify-between"><span>From Character Vault</span><span className="text-slate-500">VF ID</span></button>
                           <button onClick={() => addNewCharacter('character')} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-300 border-t border-slate-800 hover:bg-slate-900 flex items-center justify-between"><span>Create manually</span><span className="text-slate-500">Blank</span></button>
                           <button onClick={() => addNewCharacter('drone')} className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-300 border-t border-slate-800 hover:bg-slate-900 flex items-center justify-between"><span>Drone</span><span className="text-slate-500">Ready</span></button>
                         </div>
                       )}
                     </div>
                   </div>
                   
                   {/* ROW 2: TOOLS */}
                   <div className="vf-player-tools vf-no-browser-scrollbar flex flex-wrap gap-2 items-center w-full pb-1 justify-start">
                       <input type="file" ref={fileInputRef} onChange={loadFromFile} className="hidden" accept=".json" />
                       {!isDrone && <button onClick={importCreatorDraft} title="Import the current draft saved by Character Creator" className="flex items-center gap-1 px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 text-[10px] rounded border border-cyan-800 uppercase font-bold transition-colors whitespace-nowrap"><User className="w-3 h-3" /> Creator</button>}
                       {!isDrone && <button onClick={importCharsheet} title="Import the latest filled Charsheet stored in this browser" className="flex items-center gap-1 px-3 py-1 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 text-[10px] rounded border border-amber-800 uppercase font-bold transition-colors whitespace-nowrap"><ScrollText className="w-3 h-3" /> Charsheet</button>}
                       {!isDrone && character.characterId && <button onClick={openCurrentLevelUp} title="Open this permanent VF character in the Level Up workspace" className="flex items-center gap-1 px-3 py-1 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-[10px] rounded border border-purple-800 uppercase font-bold transition-colors whitespace-nowrap"><span aria-hidden="true">↗</span> Level Up</button>}
                       <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-800 uppercase font-bold transition-colors whitespace-nowrap"><Upload className="w-3 h-3" /> Load</button>
                       <button onClick={saveToFile} className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-800 uppercase font-bold transition-colors whitespace-nowrap"><Save className="w-3 h-3" /> Save</button>

                       <div className="h-4 w-px bg-slate-800 mx-1"></div>
                       <button onClick={() => setShowHistory(true)} className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-800 uppercase font-bold transition-colors whitespace-nowrap"><ScrollText className="w-3 h-3" /> Log</button>
                       <button onClick={() => setShowDiceTray(true)} className="flex items-center gap-1 px-3 py-1 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500 text-[10px] rounded border border-yellow-500/30 uppercase font-bold transition-colors whitespace-nowrap"><Crown className="w-3 h-3" /> GM Tray</button>
                       <button onClick={openMainRoller} className="flex items-center gap-1 px-3 py-1 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 text-[10px] rounded border border-purple-500/30 uppercase font-bold transition-colors whitespace-nowrap"><Dices className="w-3 h-3" /> Roller</button>
                       {!isDrone && <button onClick={() => setShowCardManager(true)} className="flex items-center gap-1 px-3 py-1 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 text-[10px] rounded border border-emerald-500/30 uppercase font-bold transition-colors whitespace-nowrap"><CreditCard className="w-3 h-3" /> Cards</button>}
                      
                       {/* CLOUD */}
                      {isConnected ? (
                          <button onClick={() => setShowConfig(true)} className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded text-green-400 text-[10px] font-bold whitespace-nowrap hover:bg-green-900/30"><div className={`w-2 h-2 rounded-full bg-green-500 ${isSyncing ? 'animate-pulse' : 'status-online'}`}></div>{isSyncing ? 'Syncing...' : `On: ${sessionId}`}</button>
                      ) : (
                          <button onClick={() => setShowConfig(true)} className="flex items-center gap-1 px-3 py-1 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 text-[10px] rounded border border-cyan-500/30 uppercase font-bold transition-colors whitespace-nowrap"><Cloud className="w-3 h-3" /> Connect</button>
                      )}

                       {/* NOTES */}
                       <button onClick={() => setShowNotesPanel(v => !v)} title="Notes" className="flex items-center gap-1 px-3 py-1 bg-amber-900/20 hover:bg-amber-900/40 text-amber-300 text-[10px] rounded border border-amber-500/30 uppercase font-bold transition-colors whitespace-nowrap"><ScrollText className="w-3 h-3" /> Notes{(character.savedNotes && character.savedNotes.length) ? ' (' + character.savedNotes.length + ')' : ''}</button>

                       {/* SETTINGS */}
                       <button onClick={() => setShowSettings(true)} title="Settings" className="flex items-center gap-1 px-3 py-1 bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 text-[10px] rounded border border-slate-600/40 uppercase font-bold transition-colors whitespace-nowrap"><Settings className="w-3 h-3" /></button>
                   </div>
                </div>

                {/* SHEET CONTENT */}
                {isDrone ? (
                  <div className="animate-in fade-in duration-300 space-y-3">
                    <header className="bg-slate-900/80 p-4 rounded-xl border border-emerald-800/50 grid grid-cols-1 lg:grid-cols-[1.3fr_.8fr_.8fr] gap-4 items-end">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl border border-emerald-500/50 bg-emerald-950/30 grid place-items-center shrink-0"><Settings className="w-7 h-7 text-emerald-300" /></div>
                        <div className="min-w-0 flex-1"><label className="block text-[9px] uppercase tracking-widest text-emerald-500 font-black">Drone designation</label><input value={character.name || ''} onChange={e => updateCharacter({...character,name:e.target.value})} placeholder="DRONE NAME" className="w-full bg-transparent border-b border-slate-700 text-xl font-black text-white outline-none focus:border-emerald-500" /><div className="mt-1 text-[9px] text-slate-500">Equipment entity · uses its operator's Actions, Traits, Experiences and paid resources.</div></div>
                      </div>
                      <div><label className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Drone profile</label><select data-drone-profile value={character.droneGradeId || ''} onChange={e => changeDroneGrade(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"><optgroup label="Corebook Drone Grades">{coreDroneGrades.map(grade => <option key={grade.id} value={grade.id}>{grade.name} · {droneGradeStats(grade).tierLabel}</option>)}</optgroup>{specializedDroneFrames.length > 0 && <optgroup label="Rust & Steel Specialized Frames">{specializedDroneFrames.map(grade => <option key={grade.id} value={grade.id}>{grade.name} · {droneGradeStats(grade).tierLabel}</option>)}</optgroup>}</select><div className="mt-1 text-[8px] text-slate-600">Grades define the base statistics. Specialized frames use their own printed profile.</div></div>
                      <div><label className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Operator</label><select value={character.operatorId || ''} onChange={e => updateCharacter({...character,operatorId:e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"><option value="">Unassigned</option>{characters.filter(item => item && item.entityType !== 'drone').map(item => <option key={item.id} value={item.id}>{item.name || 'Unnamed character'}</option>)}</select></div>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                      <section className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/45 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div><h2 className="text-xs font-black uppercase tracking-widest text-white">Drone integrity</h2><p className="text-[9px] text-slate-500 mt-1">A new profile starts at full HP and full Shields. Installed upgrades recalculate the displayed statistics.</p></div><div className="text-[9px] text-slate-500 max-w-sm text-right">{currentDroneGrade && currentDroneGrade.availability}</div></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div data-drone-stat="hp" className="rounded-lg border border-red-900/40 bg-red-950/15 p-3"><div className="text-[8px] font-black uppercase tracking-widest text-red-400">HP</div><div className="mt-2 flex items-end gap-2"><NumField min="0" max={(character.hp&&character.hp.max)||1} value={(character.hp&&character.hp.current)||0} onChange={e => updateCharacter({...character,hp:{...(character.hp||{}),current:Math.max(0,Math.min(Number((character.hp&&character.hp.max)||1),Number(e.target.value)||0))}})} className="w-16 bg-transparent text-3xl font-black text-white outline-none"/><span className="pb-1 text-sm text-slate-500">/ {(character.hp&&character.hp.max)||1}</span></div></div>
                          <div data-drone-stat="shields" className="rounded-lg border border-cyan-900/40 bg-cyan-950/15 p-3"><div className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Shields</div><div className="mt-2 flex flex-wrap gap-1">{Array.from({length:Number(character.armorMax||0)}).map((_,i)=><button key={i} data-token={`drone-shields-${i}`} data-token-kind="shields" data-token-state={i < (Number(character.shields)||0) ? 'filled' : 'empty'} aria-pressed={i < (Number(character.shields)||0) ? 'true' : 'false'} aria-label={`Drone shield token ${i + 1}: ${i < (Number(character.shields)||0) ? 'filled' : 'empty'}`} onClick={() => updateCharacter({...character,shields:i+1===(Number(character.shields)||0)?i:i+1})} className={`vf-resource-token vf-token-shield w-5 h-6 rounded-sm border ${i < (Number(character.shields)||0) ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_7px_rgba(34,211,238,.45)]' : 'bg-slate-950 border-slate-700'}`} title={`Shield / Armor Slot ${i+1}`}></button>)}{!Number(character.armorMax||0)&&<span className="text-xs text-slate-600">No Shields</span>}</div><div className="mt-1 text-[8px] text-slate-600">Armor Slots: {Number(character.armorMax||0)}</div></div>
                          <div data-drone-stat="evasion" className="rounded-lg border border-slate-800 bg-slate-950/30 p-3"><div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Evasion</div><div className="mt-2 text-3xl font-black text-white">{character.evasion || 0}</div>{currentDroneProfile && currentDroneProfile.evasion !== currentDroneProfile.baseEvasion && <div className="mt-1 text-[8px] text-emerald-400">Base {currentDroneProfile.baseEvasion} · {currentDroneProfile.evasion-currentDroneProfile.baseEvasion>0?'+':''}{currentDroneProfile.evasion-currentDroneProfile.baseEvasion} applied</div>}</div>
                          <div data-drone-stat="thresholds" className="rounded-lg border border-slate-800 bg-slate-950/30 p-3"><div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Thresholds</div><div className="mt-2 text-lg font-black text-white">{(character.thresholds&&character.thresholds.major)||0} / {(character.thresholds&&character.thresholds.severe)||'—'}</div><div className="mt-1 text-[8px] text-slate-600">Major / Severe</div></div>
                        </div>
                        {(currentDroneProfile && (currentDroneProfile.applied.length || currentDroneProfile.conditional.length || currentDroneProfile.temporaryEvasion)) ? <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/35 p-3 space-y-3">
                          {currentDroneProfile.applied.length > 0 && <div><div className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1.5">Applied permanent changes</div><div className="flex flex-wrap gap-1.5">{currentDroneProfile.applied.map((entry,i)=><span key={i} className="px-2 py-1 rounded border border-emerald-800/50 bg-emerald-950/20 text-[8px] text-emerald-200">{entry}</span>)}</div></div>}
                          {currentDroneProfile.conditional.length > 0 && <div><div className="text-[8px] font-black uppercase tracking-widest text-amber-400 mb-1.5">Situational Evasion modifiers</div><div className="flex flex-wrap gap-1.5">{currentDroneProfile.conditional.map(entry=><button key={`${entry.moduleName}:${entry.key}`} disabled={entry.available===false} title={entry.unavailableReason||entry.label} onClick={()=>setDroneContext(entry.key,!entry.active)} className={`px-2 py-1 rounded border text-[8px] font-bold disabled:opacity-40 disabled:cursor-not-allowed ${entry.active?'border-amber-500 bg-amber-950/40 text-amber-200':'border-slate-700 bg-slate-950 text-slate-500'}`}>{entry.active?'✓ ':''}{entry.moduleName}: {Number(entry.value)>0?'+':''}{entry.value} · {entry.available===false?entry.unavailableReason:entry.label}</button>)}</div></div>}
                          {currentDroneProfile.temporaryEvasion > 0 && <div className="flex items-center justify-between gap-3 rounded border border-cyan-800/40 bg-cyan-950/20 p-2"><div className="text-[9px] text-cyan-200">Temporary defense: +{currentDroneProfile.temporaryEvasion} Evasion against the next applicable attack.</div><button onClick={clearTemporaryDroneEvasion} className="px-2 py-1 rounded border border-cyan-700 text-[8px] font-black uppercase text-cyan-300">Consume / clear</button></div>}
                        </div> : null}
                      </section>

                      <section className="rounded-xl border border-yellow-800/40 bg-yellow-950/10 p-4">
                        <div className="flex items-center gap-2"><Lantern on={!!spotlightHolder} flicker={!!(flick&&spotlightHolder)} title="Current table spotlight"/><div><h2 className="text-xs font-black uppercase tracking-widest text-yellow-300">Table spotlight</h2><div className="text-sm font-bold text-white">{spotlightHolder ? (spotlightHolder.name || 'Unnamed character') : 'None'}</div></div></div>
                        <p className="mt-3 text-[9px] leading-relaxed text-slate-500">The drone never owns Spotlight. Choose which character currently has it.</p>
                        <div className="mt-3 flex flex-wrap gap-2">{characters.filter(item=>item&&item.entityType!=='drone').map(item=><button key={item.id} onClick={()=>takeSpotlight(item.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[9px] font-black uppercase ${item.id===spotlight?'border-yellow-500 bg-yellow-950/50 text-yellow-200':'border-slate-700 bg-slate-950 text-slate-400 hover:border-yellow-700'}`}><Lantern on={item.id===spotlight} flicker={!!(flick&&item.id===spotlight)}/>{item.name||'Character'}</button>)}<button onClick={()=>takeSpotlight('')} className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-950 text-[9px] font-black uppercase text-slate-500">Clear</button></div>
                      </section>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                      <section className="rounded-xl border border-cyan-800/40 bg-cyan-950/10 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xs font-black uppercase tracking-widest text-cyan-300">Signal strength</h2><p className="mt-1 text-[9px] text-slate-500">Manual controls are synchronized with the Keeper Tool.</p></div><span className={`px-2.5 py-1 rounded border text-[9px] font-black uppercase ${character.signalState==='stable'?'border-emerald-600 text-emerald-300':character.signalState==='unstable'?'border-amber-600 text-amber-300':'border-red-700 text-red-300'}`}>{SIGNAL_STATES.find(item=>item.id===character.signalState)?.label||'Stable'}</span></div>
                        <div className="mt-4 grid grid-cols-3 gap-2">{SIGNAL_STATES.map(signal=><button key={signal.id} onClick={()=>updateCharacter({...character,signalState:signal.id})} className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase ${character.signalState===signal.id?(signal.id==='stable'?'border-emerald-500 bg-emerald-950/40 text-emerald-200':signal.id==='unstable'?'border-amber-500 bg-amber-950/40 text-amber-200':'border-red-600 bg-red-950/40 text-red-200'):'border-slate-700 bg-slate-950 text-slate-500'}`}>{signal.label}</button>)}</div>
                        <div className="mt-3 text-[10px] leading-relaxed text-slate-400">{SIGNAL_STATES.find(item=>item.id===character.signalState)?.summary}</div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"><div><label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Range from operator</label><select value={character.signalRange||'Close'} onChange={e=>updateCharacter({...character,signalRange:e.target.value,signalState:defaultSignalForRange(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">{DRONE_RANGES.map(item=><option key={item}>{item}</option>)}</select></div><div><label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Link mode</label><select value={character.linkMode||'Direct RF Link'} onChange={e=>updateCharacter({...character,linkMode:e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">{LINK_MODES.map(item=><option key={item}>{item}</option>)}</select></div></div>
                      </section>

                      <section className="rounded-xl border border-emerald-800/40 bg-emerald-950/10 p-4">
                        <div className="flex items-center justify-between gap-3"><div><h2 className="text-xs font-black uppercase tracking-widest text-emerald-300">Installed modules</h2><p className="mt-1 text-[9px] text-slate-500">{usedDroneModuleSlots}/{character.moduleSlots||0} slots used · {availableDroneModuleSlots} free</p></div><button onClick={()=>setShowDroneModuleManager(true)} className="px-3 py-2 rounded-lg border border-emerald-600/50 bg-emerald-950/40 text-emerald-200 text-[9px] font-black uppercase">Installation options</button></div>
                        <div className="mt-3 space-y-2">{installedDroneModules.length?installedDroneModules.map(module=>{const modifiers=droneModuleModifierLabels(module);return <div key={droneModuleKey(module)} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-black text-white">{module.name}</span><span className="px-1.5 py-0.5 rounded border border-slate-700 text-[8px] text-slate-400">{droneModuleAccessLabel(module)} · {droneModuleSlots(module)} slot{droneModuleSlots(module)===1?'':'s'}</span>{module.category&&<span className="px-1.5 py-0.5 rounded border border-slate-700 text-[8px] text-slate-500">{module.category}</span>}{module.status&&<span className="px-1.5 py-0.5 rounded border border-amber-800/50 text-[8px] text-amber-300">{module.status}</span>}</div>{modifiers.length>0&&<div className="mt-1.5 flex flex-wrap gap-1">{modifiers.map((entry,i)=><span key={i} className="px-1.5 py-0.5 rounded border border-emerald-800/40 bg-emerald-950/15 text-[8px] text-emerald-300">{entry}</span>)}</div>}<div className="mt-1.5 text-[9px] leading-relaxed text-slate-400">{module.use}</div>{module.info&&<div className="mt-1 text-[9px] leading-relaxed text-cyan-300/80">Charsheet modifiers: {module.info}</div>}</div><button onClick={()=>useDroneModule(module)} className="shrink-0 px-2.5 py-1.5 rounded border border-cyan-700/50 bg-cyan-950/30 text-cyan-200 text-[9px] font-black uppercase">Use</button></div></div>}):<button onClick={()=>setShowDroneModuleManager(true)} className="w-full p-4 rounded-lg border border-dashed border-slate-700 text-[10px] text-slate-500">No modules installed.</button>}</div>
                      </section>
                    </div>

                    <section className="rounded-xl border border-slate-800 bg-slate-900/45 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div><label className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Loaded protocol when signal is Lost</label><textarea value={character.loadedProtocol||''} onChange={e=>updateCharacter({...character,loadedProtocol:e.target.value})} className="w-full min-h-[100px] rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 outline-none focus:border-cyan-600" placeholder="Return to operator, hold position, continue task, freeze…"></textarea></div>
                      <div><label className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">Drone notes / cargo</label><textarea value={character.playerNotes||''} onChange={e=>updateCharacter({...character,playerNotes:e.target.value})} className="w-full min-h-[100px] rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 outline-none focus:border-emerald-600" placeholder="Serial, quirks, carried equipment, maintenance…"></textarea></div>
                    </section>
                  </div>
                ) : (
                  <>
                <div className="animate-in fade-in duration-300">
                  <header className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col md:flex-row gap-4 items-center mb-2">
                     <div className="flex items-center gap-4 w-full md:w-auto border-r border-slate-800 pr-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-cyan-500/50 overflow-hidden shrink-0"><User className="w-6 h-6 text-slate-500" /></div>
                        <div className="flex flex-col w-full">
                          <input type="text" className="bg-transparent text-lg font-bold text-white focus:outline-none placeholder-slate-600 w-full" placeholder="CHARACTER NAME" value={character.name} onChange={e => updateCharacter({...character, name: e.target.value})} />
                          <div className="flex gap-2">
                             <input type="text" className="bg-transparent text-xs text-cyan-400 focus:outline-none placeholder-slate-700 w-24" placeholder="HERITAGE" value={character.heritage} onChange={e => updateCharacter({...character, heritage: e.target.value})} />
                             <span className="text-slate-700">|</span>
                             <input type="text" className="bg-transparent text-xs text-slate-400 focus:outline-none placeholder-slate-700 w-24" placeholder="PRONOUNS" value={character.pronouns} onChange={e => updateCharacter({...character, pronouns: e.target.value})} />
                          </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 w-full text-[10px]">
                        <div className="flex flex-col"><label className="text-slate-600 font-bold uppercase">Player Name</label><input type="text" className="bg-transparent border-b border-slate-800 text-amber-400 focus:border-amber-500 outline-none font-bold" value={character.playerName} onChange={e => updateCharacter({...character, playerName: e.target.value})} placeholder="YOUR NAME" /></div>
                        <div className="flex flex-col"><label className="text-slate-600 font-bold uppercase">Class</label><input type="text" className="bg-transparent border-b border-slate-800 text-slate-200 focus:border-cyan-500 outline-none" value={character.class} onChange={e => updateCharacter({...character, class: e.target.value})} /></div>
                        <div className="flex flex-col"><label className="text-slate-600 font-bold uppercase">Level</label><NumField className="bg-transparent border-b border-slate-800 text-cyan-400 font-bold focus:border-cyan-500 outline-none" value={character.level} onChange={e => updateCharacter({...character, level: Math.max(1,parseInt(e.target.value)||1)})} /></div>
                        <div className="flex flex-col"><label className="text-slate-600 font-bold uppercase">Proficiency</label><NumField min="1" max="6" className="bg-transparent border-b border-slate-800 text-red-300 font-bold focus:border-red-500 outline-none" value={character.proficiency||1} onChange={e => updateCharacter({...character, proficiency: Math.max(1,Math.min(6,parseInt(e.target.value)||1))})} /></div>
                        <div className="flex flex-col"><label className="text-slate-600 font-bold uppercase">Background</label><input type="text" className="bg-transparent border-b border-slate-800 text-slate-200 focus:border-cyan-500 outline-none" value={character.background} onChange={e => updateCharacter({...character, background: e.target.value})} /></div>
                     </div>
                  </header>

                  <div className="grid grid-cols-12 gap-2 h-full">
                    {/* COL 1: ATRIBUTOS */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                       <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center gap-2"><Activity className="w-3 h-3 text-cyan-500" /><h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Attributes</h2></div>
                       <div className="flex flex-col divide-y divide-slate-800/50">
                         <StatBlock label="Agility" statKey="agility" skills={['Sprint', 'Leap', 'Maneuver']} color="cyan" />
                         <StatBlock label="Strength" statKey="strength" skills={['Lift', 'Smash', 'Grapple']} color="red" />
                         <StatBlock label="Finesse" statKey="finesse" skills={['Control', 'Hide', 'Tinker']} color="emerald" />
                         <StatBlock label="Instinct" statKey="instinct" skills={['Perceive', 'Sense', 'Navigate']} color="purple" />
                         <StatBlock label="Presence" statKey="presence" skills={['Charm', 'Perform', 'Deceive']} color="amber" />
                         <StatBlock label="Knowledge" statKey="knowledge" skills={['Recall', 'Analyze', 'Comprehend']} color="blue" />
                       </div>
                    </div>

                    {/* COL 2: VITALES */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-5 flex flex-col gap-2">
                       <div className="vf-fear-strip px-1 py-1 mb-2 flex items-center justify-between">
                         <span className="text-[9px] font-bold uppercase text-red-400 tracking-wider flex items-center gap-1 shrink-0" data-resicon="fear"><AlertCircle className="w-3 h-3" /> Fear (table)</span>
                         <div className="flex gap-0.5 flex-wrap justify-end ml-2">
                           {Array.from({length:12}).map(function(_,i){ var filled = i < fear && !pending['fear-'+i]; return (<button key={i} data-token={"fear-"+i} data-token-kind="fear" data-token-state={filled ? 'filled' : 'empty'} aria-pressed={filled ? 'true' : 'false'} aria-label={`Fear token ${i + 1} of 12: ${filled ? 'filled' : 'empty'}`} onClick={() => pushFear(i+1===fear ? i : i+1)} title={"Fear " + (i+1)} style={{clipPath:"polygon(0 0, 100% 0, 50% 100%)"}} className={"vf-resource-token vf-token-fear w-4 h-5 shrink-0 transition-all " + (filled ? "bg-red-600" : "bg-slate-700/40 hover:bg-red-900/50")} />); })}
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-2 h-24">
                         <div className="bg-slate-900/60 rounded border border-slate-800 p-2 relative flex flex-col items-center justify-center"><div className="absolute top-1 left-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">Evasion</div>{((activeWeaponProfile && activeWeaponProfile.evasionModifier) || (activeArmorProfile && activeArmorProfile.evasionModifier)) !== 0 && <div title={[activeWeaponProfile && activeWeaponProfile.evasionModifier ? `${activeWeaponProfile.weapon.name}: ${activeWeaponProfile.evasionModifier > 0 ? '+' : ''}${activeWeaponProfile.evasionModifier}` : '', activeArmorProfile && activeArmorProfile.evasionModifier ? `${activeArmor && activeArmor.name}: ${activeArmorProfile.evasionModifier > 0 ? '+' : ''}${activeArmorProfile.evasionModifier}` : ''].filter(Boolean).join(' · ')} className="absolute top-1 right-2 px-1.5 py-0.5 rounded border border-amber-700/50 bg-amber-950/30 text-[8px] font-black text-amber-300">Effective {effectiveEvasion}</div>}<Shield className="w-12 h-12 text-slate-800 absolute opacity-30" /><NumField className="bg-transparent text-3xl font-black text-white text-center z-10 w-full outline-none" value={character.evasion} onChange={e => updateCharacter({...character, evasion: e.target.value})} /></div>
                         <div className="bg-slate-900/60 rounded border border-cyan-900/30 p-2 relative flex flex-col items-center justify-center"><div className="absolute top-1 left-2 text-[9px] text-cyan-600 font-bold uppercase tracking-wider" data-resicon="shields">Armor</div><Zap className="w-12 h-12 text-cyan-900 absolute opacity-30" /><div className="flex flex-wrap gap-1 justify-center items-center z-10 mt-3 max-w-[160px]">{Array.from({length:Math.max(0, Number(character.armorMax != null ? character.armorMax : (activeArmor && activeArmor.armorSlots)) || 0)}).map(function(_,i){ var filled = i < (character.shields||0) && !pending['shields-'+i]; return (<button key={i} data-token={"shields-"+i} data-token-kind="shields" data-token-state={filled ? 'filled' : 'empty'} aria-pressed={filled ? 'true' : 'false'} aria-label={`Armor token ${i + 1}: ${filled ? 'filled' : 'empty'}`} onClick={() => updateCharacter({...character, shields: (i+1===(character.shields||0) ? i : i+1)})} title={"Armor slot "+(i+1)} style={{clipPath:"polygon(0 0, 100% 0, 100% 58%, 50% 100%, 0 58%)"}} className={"vf-resource-token vf-token-shield w-4 h-5 shrink-0 transition-all "+(filled ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" : "bg-slate-800 hover:bg-cyan-900/60")} />); })}{!(Number(character.armorMax != null ? character.armorMax : (activeArmor && activeArmor.armorSlots)) > 0) && <span className="text-[9px] text-slate-600">No active armor</span>}</div></div>
                       </div>
                       
                       {/* ARMOUR THRESHOLD */}
                       <div className="bg-slate-900/40 rounded border border-slate-800 p-2">
                            <h2 className="text-[9px] font-bold uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                                <Shield className="w-3 h-3 text-slate-600" /> Armour Threshold
                            </h2>
                            <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded border border-slate-800">
                                <div className="flex flex-col items-center flex-1">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Minor</span>
                                     <span className="text-[8px] font-bold text-red-400 uppercase mt-0.5">1 HP</span>
                                </div>
                                <div className="flex items-center justify-center px-2">
                                    <NumField className="bg-slate-900 border border-slate-700 rounded w-12 text-center text-lg font-bold text-white outline-none focus:border-cyan-500" value={character.thresholds.major || 0} onChange={e => updateCharacter({...character, thresholds: {...character.thresholds, major: parseInt(e.target.value)}})} />
                                </div>
                                <div className="flex flex-col items-center flex-1">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Major</span>
                                     <span className="text-[8px] font-bold text-red-500 uppercase mt-0.5">2 HP</span>
                                </div>
                                <div className="flex items-center justify-center px-2">
                                    <NumField className="bg-slate-900 border border-slate-700 rounded w-12 text-center text-lg font-bold text-white outline-none focus:border-cyan-500" value={character.thresholds.severe || 0} onChange={e => updateCharacter({...character, thresholds: {...character.thresholds, severe: parseInt(e.target.value)}})} />
                                </div>
                                <div className="flex flex-col items-center flex-1">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Severe</span>
                                     <span className="text-[8px] font-bold text-red-600 uppercase mt-0.5">3 HP</span>
                                </div>
                            </div>
                       </div>

                       <button onClick={() => updateCharacter({...character, path: (character.path === 'sleeping' ? 'awakened' : 'sleeping')})} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-700 text-amber-400 hover:border-amber-500 mb-1 w-full">Path: {character.path === 'sleeping' ? 'Sleeping' : 'Awakened'} &middot; switch</button>
                       <div className="grid grid-cols-1 gap-1">
                         <ResourceTrack label="Health" current={character.hp.current} max={character.hp.max} cap={12} color="red" icon={Heart} onChange={(v) => updateCharacter({...character, hp: {...character.hp, current: v}})} />
                         <ResourceTrack label="Stress" current={character.stress.current} max={character.stress.max} cap={10} color="pink" icon={AlertCircle} onChange={(v) => updateCharacter({...character, stress: {...character.stress, current: v}})} />
                         {(character.path === 'sleeping') ? (
                           <>
                             <ResourceTrack label="Effort" current={(character.effort||{current:0}).current} max={(character.effort||{max:6}).max} color="amber" icon={Zap} onChange={(v) => updateCharacter({...character, effort: {...(character.effort||{max:6,current:0}), current: v}})} />
                             <ResourceTrack label="Resolve" current={(character.resolve||{current:0}).current} max={(character.resolve||{max:2}).max} cap={6} color="cyan" icon={Shield} onChange={(v) => updateCharacter({...character, resolve: {...(character.resolve||{max:2,current:0}), current: v}})} />
                           </>
                         ) : (
                           <ResourceTrack label="Hope" current={character.hope.current} max={character.hope.max} color="amber" icon={Sparkles} onChange={(v) => updateCharacter({...character, hope: {...character.hope, current: v}})} />
                         )}
                       </div>
                       
                       {/* OPERATIONAL FEATURES / KIT */}
                       {(character.ancestryGift || character.communityGift || character.features || character.classFeature) && (
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                           {character.ancestryGift && <FeatureSummaryCard kind="ancestry" text={character.ancestryGift} />}
                           {character.classFeature && <FeatureSummaryCard kind="class" text={character.classFeature} />}
                           {character.communityGift && <FeatureSummaryCard kind="community" text={character.communityGift} />}
                           {character.features && <FeatureSummaryCard kind="effort" text={character.features} />}
                         </div>
                       )}
                       {(((character.augments && character.augments.length > 0) || (character.drones && character.drones.length > 0))) && (
                         <div className="bg-slate-900/40 rounded border border-slate-800 p-2 text-[9px] text-slate-300 grid grid-cols-1 xl:grid-cols-2 gap-2">
                           {character.augments && character.augments.length > 0 && (<div><span className="text-cyan-400 font-bold uppercase tracking-wider">Augmentations</span>{character.augments.map((a,i)=>(<div key={i} className="text-slate-300 mt-1"><span className="font-bold text-slate-100">{a.name}</span> <span className="text-slate-500">{itemTierLabel(a)}</span><div className="text-slate-400 leading-snug">{a.benefit}</div></div>))}</div>)}
                           {character.drones && character.drones.length > 0 && (<div><span className="text-purple-400 font-bold uppercase tracking-wider">Drones</span>{character.drones.map((d,i)=>(<div key={i} className="text-slate-300 mt-1"><span className="font-bold text-slate-100">{d.name}</span> <span className="text-slate-500">{displayScalar(d.grade)}</span> · HP {d.hp} · Ev {d.evasion}</div>))}</div>)}
                         </div>
                       )}

                       {/* ACTIONS / CARDS (path-aware) */}
                       {(character.path === 'sleeping') ? (
                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 flex-grow items-start">
                         <CompactActionPanel panelId="sleeper-actions" title="Sleeper Actions" description="General Effort techniques available to every Sleeping character. Expand to choose an action." icon={<Zap className="w-4 h-4" />} accentClass="text-amber-400">
                           <div className="space-y-1.5 mt-3">
                             {GENERAL_EFFORT.map((ef, i) => (
                               <div key={i} className="rounded border border-slate-800 bg-slate-950/45 p-2 flex items-start gap-2">
                                 <button disabled={(((character.effort&&character.effort.current)||0) < ef.cost)} onClick={() => useSleeperAction('Effort: ' + ef.name, 'effort', ef.cost, ef.roll)} title={ef.text} className="px-2 py-1 text-[9px] font-black rounded border border-amber-800/60 text-amber-300 hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed shrink-0">{ef.roll ? 'Roll' : 'Use'} · {ef.cost}</button>
                                 <div className="min-w-0"><div className="text-[11px] font-bold text-amber-100">{ef.name}</div><div className="text-[10px] text-slate-400 leading-snug mt-0.5">{ef.text}</div></div>
                               </div>
                             ))}
                           </div>
                         </CompactActionPanel>
                         <CompactActionPanel panelId="resolve-moves" title="Resolve Moves" description={`${character.class || 'Class'}${character.subclass ? ' · ' + character.subclass : ''}. Class and subclass signature moves paid with Resolve.`} icon={<Shield className="w-4 h-4" />} accentClass="text-cyan-400">
                           <div className="space-y-2 mt-3">
                             {availableResolveMoves.length > 0 ? availableResolveMoves.map((move) => {
                               const minimum = resolveMoveMinimum(move);
                               const disabled = Number((character.resolve && character.resolve.current) || 0) < minimum;
                               return (
                                 <div key={move.id} className="rounded border border-cyan-950/80 bg-cyan-950/10 p-2.5">
                                   <div className="flex items-start justify-between gap-2">
                                     <div className="min-w-0">
                                       <div className="flex flex-wrap items-center gap-1.5"><span className="text-[11px] font-black text-cyan-100">{move.name}</span><span className="px-1.5 py-0.5 rounded border border-cyan-900/60 bg-slate-950 text-[8px] font-black uppercase text-cyan-400">{move.subclass || 'Class'}</span></div>
                                       <div className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-500">{move.cost}</div>
                                     </div>
                                     <button disabled={disabled} onClick={() => useResolveMove(move)} className="shrink-0 px-2.5 py-1.5 rounded border border-cyan-700/60 bg-cyan-950/30 text-[9px] font-black uppercase text-cyan-300 hover:border-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed">{move.rollResolve ? 'Roll' : 'Use'}</button>
                                   </div>
                                   <div className="mt-1.5 text-[10px] leading-relaxed text-slate-300">{move.text}</div>
                                 </div>
                               );
                             }) : <div className="rounded border border-dashed border-slate-700 p-3 text-[10px] text-slate-500">No Resolve Moves are available for this class in the loaded rules data.</div>}
                           </div>
                         </CompactActionPanel>
                       </div>
                       ) : (
                       <div className="bg-slate-900/40 rounded border border-slate-800 p-2 flex-grow min-h-[150px]">
                           <div className="flex justify-between items-center mb-2">
                               <h2 className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3 text-emerald-500" /> Active Cards</h2>
                               <button onClick={() => setShowCardManager(true)} className="text-[9px] text-emerald-400 hover:text-white uppercase font-bold">+ Manage</button>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               {character.domainCards && character.domainCards.map((card, idx) => (<DomainCard key={idx} card={card} onDelete={() => removeCard(idx)} />))}
                               {(!character.domainCards || character.domainCards.length === 0) && (<div className="col-span-full text-center py-4 text-xs text-slate-600 italic">No domain cards equipped</div>)}
                           </div>
                           {(character.powerVault||[]).length > 0 && <div className="mt-3 border-t border-slate-800 pt-2"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Power Vault</span><span className="text-[8px] text-slate-600">Owned · not in Loadout</span></div><div className="space-y-1">{character.powerVault.map(card=><div key={card.id||card.name} className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-950/55 p-2"><div className="min-w-0"><div className="truncate text-[10px] font-black text-slate-200">{card.name}</div><div className="text-[8px] uppercase text-slate-600">{card.domain} · L{card.level||1} · {card.costText||'—'}</div></div><button onClick={()=>recallVaultCard(card)} className="shrink-0 rounded border border-cyan-700/60 px-2 py-1 text-[8px] font-black uppercase text-cyan-300 hover:border-cyan-400">Recall</button></div>)}</div></div>}
                       </div>
                       )}
                    </div>

                    {/* COL 3: GEAR */}
                    <div className="col-span-12 md:col-span-12 lg:col-span-4 flex flex-col gap-2">
                       <div className="bg-slate-900/40 rounded border border-slate-800 p-2">
                         <h2 className="text-[9px] font-bold uppercase text-slate-500 mb-2 flex items-center gap-1 tracking-wider"><Star className="w-3 h-3 text-purple-500" /> Experiences</h2>
                         <div className="space-y-1">
                           {(character.experiences || []).map((exp, i) => (
                             <div key={i} className="vf-experience-row">
                               <NumField min={-9} max={9} className="vf-experience-bonus" value={exp.bonus} onChange={(e) => handleExperienceChange(i, 'bonus', parseInt(e.target.value)||0)} />
                               <input type="text" className="vf-experience-name" placeholder="Experience..." value={exp.description} onChange={(e) => handleExperienceChange(i, 'description', e.target.value)} />
                               <button type="button" disabled={character.path !== 'sleeping' && (((character.hope&&character.hope.current)||0) < 1)} onClick={() => rollDuality({label: 'Exp: ' + (exp.description || 'Experience'), extraMod: parseInt(exp.bonus)||0, spend: (character.path === 'sleeping' ? null : {resource: 'hope', amount: 1})})} title="Roll with this experience (awakened spends 1 Hope; free for sleepers)" className="vf-experience-roll disabled:opacity-30 disabled:cursor-not-allowed" aria-label={`Roll ${exp.description || 'experience'} with bonus ${parseInt(exp.bonus)||0}`}><Zap className="w-3 h-3" /></button>
                             </div>
                           ))}
                         </div>
                       </div>
                       <div className="bg-slate-900/40 rounded border border-slate-800 p-2">
                         <div className="flex items-center justify-between gap-2 mb-2">
                           <div><h2 className="text-[9px] font-bold uppercase text-slate-500 flex items-center gap-1 tracking-wider"><Zap className="w-3 h-3 text-yellow-500" /> Weapons</h2><div className="text-[8px] text-slate-600 mt-0.5">{equippedWeapons.length} equipped · {arsenalWeapons.length} in arsenal</div></div>
                           <button onClick={() => setShowWeaponManager(true)} className="px-2.5 py-1 rounded border border-yellow-600/40 bg-yellow-950/20 text-yellow-300 text-[9px] font-black uppercase hover:border-yellow-500">Loadout</button>
                         </div>
                         <div className="space-y-2">
                           {equippedWeapons.map(weapon => <WeaponCard key={weaponKey(weapon)} weapon={weapon} />)}
                           {!equippedWeapons.length && <button onClick={() => setShowWeaponManager(true)} className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-4 text-[10px] text-slate-500 hover:border-yellow-600/60 hover:text-yellow-300">No weapon equipped. Open Loadout to equip one or more weapons.</button>}
                         </div>
                       </div>
                       <div className="bg-slate-900/40 rounded border border-slate-800 p-2 flex-grow">
                         <div className="flex gap-2 mb-2">
                           <div className="flex-1 bg-slate-950 rounded border border-slate-800 px-2 py-1"><label className="text-[8px] text-slate-500 uppercase block font-bold">Wealth</label><NumField className="w-full bg-transparent text-center font-bold text-xs text-blue-400 outline-none" value={character.wealth} onChange={e => updateCharacter({...character, wealth: e.target.value})} /></div>
                           <div className="flex-1 bg-slate-950 rounded border border-slate-800 px-2 py-1"><label className="text-[8px] text-slate-500 uppercase block font-bold">Credits</label><NumField className="w-full bg-transparent text-center font-bold text-xs text-blue-400 outline-none" value={character.credits} onChange={e => updateCharacter({...character, credits: e.target.value})} /></div>
                         </div>
                         <div className="flex items-center justify-between gap-2 mb-1">
                           <h2 className="text-[9px] font-bold uppercase text-slate-500 tracking-wider"><Database className="w-3 h-3 text-blue-500 inline mr-1" /> Notes & Free Text</h2>
                         </div>
                         <div className="grid grid-cols-1 gap-1">
                           {(Array.isArray(character.inventory) ? character.inventory : []).map((item, i) => (
                             <div key={i} className="flex gap-2 items-center h-5">
                               <span className="text-slate-700 text-[9px] font-mono w-3">{i+1}</span>
                               <input type="text" className="flex-grow bg-transparent border-b border-slate-800/50 focus:border-blue-500/50 text-[10px] outline-none text-slate-400" value={item} onChange={(e) => { const newInv = [...(Array.isArray(character.inventory) ? character.inventory : [])]; newInv[i] = e.target.value; updateCharacter({...character, inventory: newInv}); }} />
                             </div>
                           ))}
                         </div>

                         <div className="mt-3 border-t border-slate-800 pt-3 space-y-3">
                           <div>
                             <div className="flex items-center justify-between gap-2 mb-2">
                               <div>
                                 <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Item Loadout</div>
                                 <div className="text-[8px] text-slate-600">Choose gear from the canon database and keep the free text lines for everything else.</div>
                               </div>
                               <button onClick={() => setShowGearManager(true)} className="px-2 py-1 rounded border border-emerald-700/40 bg-emerald-950/20 text-emerald-300 text-[9px] font-black uppercase hover:border-emerald-500">Manage</button>
                             </div>
                             <div className="space-y-2">
                               {gearArsenal.length ? gearArsenal.map((gear, i) => { const summary = gearSummary(gear); return <div key={gearKey(gear) || i} className="rounded border border-slate-800 bg-slate-950/45 p-2"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-[11px] font-black text-slate-100">{summary.title}</span>{summary.tier && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-[8px] text-slate-400">{summary.tier}</span>}</div><div className="mt-1 text-[9px] leading-snug text-slate-400">{summary.detail}</div></div><span className="px-1.5 py-0.5 rounded border border-emerald-800/40 bg-emerald-950/20 text-[8px] font-black uppercase text-emerald-300">In loadout</span></div></div>; }) : <button onClick={() => setShowGearManager(true)} className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-3 text-[10px] text-slate-500 hover:border-emerald-600/60 hover:text-emerald-300">No gear loadout yet. Open Manage to add items from the system database.</button>}
                             </div>
                           </div>

                           <div>
                             <div className="flex items-center justify-between gap-2 mb-2">
                               <div>
                                 <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Armor</div>
                                 <div className="text-[8px] text-slate-600">Track owned suits and mark which one is currently active.</div>
                               </div>
                               <button onClick={() => setShowArmorManager(true)} className="px-2 py-1 rounded border border-amber-700/40 bg-amber-950/20 text-amber-300 text-[9px] font-black uppercase hover:border-amber-500">Loadout</button>
                             </div>
                             {activeArmor ? (() => { const summary = armorSummary(activeArmor); return <div className="rounded-lg border border-amber-800/40 bg-amber-950/10 p-2.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-black text-slate-100">{summary.title}</span><span className="px-1.5 py-0.5 rounded border border-amber-700/40 bg-amber-500/10 text-[8px] font-black uppercase text-amber-300">Active</span>{summary.tier && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-[8px] text-slate-400">{summary.tier}</span>}</div><div className="mt-1 text-[9px] text-slate-400">{summary.detail}</div>{summary.features && <div className="mt-1 text-[9px] text-slate-500">{summary.features}</div>}<EquipmentModEditor type="armor" item={activeArmor} onChange={mods=>replaceArmorMods(activeArmor,mods)} /><div className="mt-2 flex flex-wrap gap-1">{activeArmorProfile.evasionModifier !== 0 && <span className="px-1.5 py-0.5 rounded border border-amber-800/40 text-[8px] text-amber-300">Evasion {activeArmorProfile.evasionModifier > 0 ? '+' : ''}{activeArmorProfile.evasionModifier}</span>}{activeArmorProfile.attackBonus !== 0 && <span className="px-1.5 py-0.5 rounded border border-emerald-800/40 text-[8px] text-emerald-300">Automatic attacks +{activeArmorProfile.attackBonus}</span>}{activeArmorProfile.traitModifiers.map((mod,i)=><span key={i} title={mod.context} className="px-1.5 py-0.5 rounded border border-cyan-900/50 text-[8px] text-cyan-300">{mod.trait} +{mod.amount} · {mod.context}</span>)}</div></div><button onClick={clearActiveArmor} className="shrink-0 px-2 py-1 rounded border border-slate-700 text-[8px] font-black uppercase text-slate-400 hover:text-white">Clear</button></div></div>; })() : <button onClick={() => setShowArmorManager(true)} className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-3 text-[10px] text-slate-500 hover:border-amber-600/60 hover:text-amber-300">No active armor. Open Loadout to assign one from your inventory.</button>}
                             {armorArsenal.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{armorArsenal.filter(item => !activeArmor || armorKey(item) !== armorKey(activeArmor)).slice(0,4).map(item => <span key={armorKey(item)} className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-950 text-[8px] text-slate-400">{item.name}</span>)}{armorArsenal.length > 5 && <span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-950 text-[8px] text-slate-500">+{armorArsenal.length - 4} more</span>}</div>}
                           </div>

                           <div>
                             <div className="flex items-center justify-between gap-2 mb-2">
                               <div>
                                 <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Augmentations</div>
                                 <div className="text-[8px] text-slate-600">Keep owned augmentations in inventory and toggle which ones are currently active.</div>
                               </div>
                               <button onClick={() => setShowAugmentManager(true)} className="px-2 py-1 rounded border border-cyan-700/40 bg-cyan-950/20 text-cyan-300 text-[9px] font-black uppercase hover:border-cyan-500">Manage</button>
                             </div>
                             <div className="space-y-2">
                               {augmentArsenal.length ? augmentArsenal.map((aug, i) => { const summary = augmentSummary(aug); const active = activeAugmentIds.includes(augmentKey(aug)); return <div key={augmentKey(aug) || i} className={`rounded border p-2 ${active ? 'border-cyan-700/50 bg-cyan-950/10' : 'border-slate-800 bg-slate-950/45'}`}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="text-[11px] font-black text-slate-100">{summary.title}</span>{active && <span className="px-1.5 py-0.5 rounded border border-cyan-700/40 bg-cyan-500/10 text-[8px] font-black uppercase text-cyan-300">Active</span>}{summary.tier && <span className="px-1.5 py-0.5 rounded border border-slate-700 text-[8px] text-slate-400">{summary.tier}</span>}</div><div className="mt-1 text-[9px] leading-snug text-slate-400">{summary.detail}</div><div className="mt-1 text-[8px] text-slate-500">{summary.meta}</div></div><button onClick={() => toggleAugmentActive(aug)} title={(() => { const cost=augmentActivationCost(aug, character); return cost ? `${active ? 'Deactivate' : 'Activate'} · ${cost.mode === 'mark' ? 'Mark' : 'Spend'} ${cost.amount} ${cost.resource}` : (active ? 'Deactivate' : 'Activate · Passive'); })()} className={`shrink-0 px-2 py-1 rounded border text-[8px] font-black uppercase ${active ? 'border-red-800/60 bg-red-950/20 text-red-300' : 'border-cyan-700/60 bg-cyan-950/20 text-cyan-300'}`}>{active ? 'Deactivate' : (() => { const cost=augmentActivationCost(aug, character); return cost ? `Activate · ${cost.amount} ${cost.resource}` : 'Activate'; })()}</button></div></div>; }) : <button onClick={() => setShowAugmentManager(true)} className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-3 text-[10px] text-slate-500 hover:border-cyan-600/60 hover:text-cyan-300">No augmentations in inventory yet. Open Manage to add them from the canonical list.</button>}
                             </div>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>
          );
        };

        window.VFLoading && window.VFLoading.complete();
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<CharacterSheet />);
        }).catch(function(error){
          console.error('Canonical rules failed to load:', error);
          document.getElementById('root').innerHTML = '<div style="max-width:720px;margin:80px auto;padding:24px;border:1px solid #7f1d1d;border-radius:12px;background:#1f0a0a;color:#fecaca;font-family:system-ui">Player Tool could not load the canonical RC3 rules data. Check that the <code>/rules-data</code> folder was deployed.</div>';
        });
    