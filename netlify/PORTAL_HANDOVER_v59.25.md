# VeilFarers Portal v59.25 — Technical Handover

## Scope

Player Tool dice presentation and weapon-attack roll sequencing. Books, canonical rules, weapon datasets, Netlify production configuration, Firebase, Identity, and local-testing architecture remain unchanged.

## Architecture

### Screen-space acquisition HUD

`assets/3d-dice/vf-dice3d.js` calls the existing read-only `getDiceScreenPositions()` projection API once per animation frame while dice are moving. Each returned screen coordinate is associated with a persistent HTML HUD component in `vf-dice3d.css`.

The HUD consists of:

- SVG concentric rings and circular `textPath` telemetry;
- rotating calibration marks and orbital indicators;
- CSS scan sweeps and crosshairs;
- role and acquisition-state labels;
- an eight-blade CSS camera-aperture animation;
- mobile and reduced-motion fallbacks.

The layer has `pointer-events: none` and is independent from the WebGL physics canvas.

### Tracking states

1. `is-gathering`: live reticle follows the moving die and telemetry updates approximately every 84 ms.
2. `is-settled`: movement tracking stops and the readout changes to `SCAN COMPLETE`.
3. `is-locking`: aperture closes and flashes around the selected die.
4. `is-winner` / `is-critical`: outcome reticle remains active and the original mesh receives the existing white renderer visual.
5. `is-rejected`: lower Duality reticle desaturates with `PROBABILITY BRANCH REJECTED`; no mechanical discard is applied.
6. `is-discarding` / `is-discarded`: damage reticle powers down, displays `QUANTUM PROBABILITY FAILED`, and the existing renderer cue darkens only the original discarded mesh.

### Physical dice lifecycle

The wrapper exposes two explicit operations:

- `VFDice3D.roll(groups, options)`: clears the previous scene and performs the initial physical throw.
- `VFDice3D.add(groups, options)`: appends new dice to the current scene without replacing existing dice.

The acquisition/selection pipeline itself never calls `add`, `remove`, or `reroll`. `add` is invoked only by Player Tool rules processing when additional physical dice are genuinely required:

- extra damage dice produced by a confirmed critical;
- Brutal replacement dice after a rolled value of 1.

### Attack and damage sequencing

`player-tool.html` now creates a `weaponDamagePlan` before a weapon attack. The initial Dice Box notation contains:

- Hope d12;
- Fear d12;
- optional Advantage/Disadvantage d6;
- normal weapon damage dice;
- the single extra Massive die, when applicable.

After Duality resolves:

- ordinary damage is calculated from the already-rolled damage dice;
- a critical appends only the additional base dice needed by the existing doubled-dice implementation;
- Massive discards the lowest logical damage die;
- Brutal appends only actual reroll replacements;
- callouts/history keep the final logical values, while the 3D HUD retains a physical-die-aligned cue list.

This avoids the previous duplicate ordinary damage throw and avoids rolling unused critical dice on every attack.

### Tactical solution panel

The 3D stage now includes `#vf-dice3d-analysis`, which displays:

- final Duality outcome;
- Hope and Fear values;
- kept/discarded damage values;
- final damage total;
- decorative telemetry status.

The ordinary DisplayResults equation remains focused on Duality so attack and damage totals are not incorrectly combined.

## Production and local behavior

The runtime selection is unchanged:

- Netlify production continues to use the unchanged Function-based Firebase configuration and Identity flow.
- Local testing continues to use the isolated local server and private `.env.local` file.
- No API key or production bypass is embedded in the deploy.

## Diagnostics

In the browser console:

```js
VFDice3D.status()
```

The result includes:

- `ready`
- `style`
- `critical`
- `tracking`
- `rendererVisuals`
- `error`

`tracking` reports the number of active physical-die HUD components. `rendererVisuals` reports which settled meshes accepted winner/critical/discard presentation states.

## Manual verification priorities

- Reticle-to-die alignment during fast movement and after resize/orientation changes.
- Mobile frame rate with four or more physical dice.
- Aperture timing relative to Dice Box settlement.
- Massive discard targeting when equal low values occur.
- Critical attacks, where additional dice are deliberately appended.
- Brutal + Massive interaction, including the original rolled 1 powering down and its replacement retaining the logical keep/drop state.
