# VeilFarers Portal v59.25 — Quantum Dice Acquisition HUD

## PR title

`Replace current deploy with VeilFarers Portal v59.25`

## Suggested branch

`release/portal-v59.25-quantum-dice-hud`

## Base

Built directly from the complete v59.24 Netlify/local deployment.

## Objective

Replace the simple settled-die highlight with a more expressive sci-fi object-acquisition interface while preserving the existing physical dice and roll results. Weapon damage dice should enter the initial attack throw together with Hope and Fear instead of opening a separate damage roll after every attack.

## Changes

- Added a CSS/JavaScript HUD that projects every physical die into screen space and follows it during the roll.
- Added golden rotating arcs, calibration marks, scan sweeps, crosshairs, role labels, and rapidly changing fictional telemetry around the dice.
- Added a camera-aperture capture animation after the dice settle.
- The higher Duality die receives `OUTCOME VECTOR LOCKED` and the existing renderer-backed white mesh cue after the aperture scan.
- The lower Duality branch transitions to gray with `PROBABILITY BRANCH REJECTED`; this is a presentation state only and does not discard the die mechanically.
- Critical Duality locks both Hope and Fear dice.
- Discarded damage dice run a staged shutdown: `DEACTIVATING DAMAGE VECTOR` → `QUANTUM PROBABILITY FAILED`, then the original settled mesh receives the existing dark renderer treatment.
- Added a compact tactical-solution panel with the Duality outcome and kept/discarded damage values.
- Weapon damage dice now join the initial Hope/Fear attack throw.
- Critical-only extra damage dice are appended only after a critical is known; this prevents unused speculative dice on ordinary attacks.
- Brutal rerolls remain separate only when the rule actually requires a reroll.
- Added reduced-motion and mobile density fallbacks.

## Dice lifecycle guarantee

Visual targeting never calls `remove()` or `reroll()` and never replaces a settled die. The normal attack has one initial physical `roll()` containing Hope, Fear, optional Advantage/Disadvantage, and base damage dice. `add()` is used only for mechanically required critical-only damage dice or Brutal replacement dice.

## Production safety

Unchanged from v59.24:

- `netlify.toml`
- Netlify Firebase configuration function
- Netlify Identity and role handling
- Firebase/Firestore session behavior
- local test server and production safeguards
- downloadable books and PDFs
- canonical weapon/rules datasets

## Files intentionally changed

- `player-tool.html`
- `assets/3d-dice/vf-dice3d.js`
- `assets/3d-dice/vf-dice3d.css`
- `data/changelog.json`
- `START_HERE.txt`
- `THIRD_PARTY_NOTICES.md`
- v59.25 release documentation

## Manual Deploy Preview checks

1. Make a normal weapon attack: Hope, Fear, and base damage dice should enter the same physical throw.
2. Confirm every HUD reticle follows its own die while rolling.
3. Confirm the winning Duality die receives the aperture scan, white lock, and outcome label without another throw.
4. Confirm the losing Duality reticle powers down to gray without darkening the physical die as a mechanical discard.
5. Roll Massive damage: only the actual lower damage die should receive the shutdown and renderer darkening.
6. Roll a critical: only the additional critical damage dice should be appended after the initial dice settle.
7. Test Plain, Tech, and Crystal themes in Box and Overlay modes on desktop and mobile.
8. Verify Options and Roll History remain closable on a smartphone.

## Validation limitation

The build environment validates syntax, files, production hashes, lifecycle paths, local serving, and archive contents. Its Chromium instance cannot initialize WebGL, so final reticle alignment, aperture timing, and GPU mesh glow/dimming require confirmation in a Netlify Deploy Preview on representative desktop and mobile hardware.
