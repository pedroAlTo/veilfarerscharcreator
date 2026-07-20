# VeilFarers Portal v59.60 — 3D Dice Netlify Loading Hotfix

## Problem

The Player Tool's 3D dice renderer failed to initialize on Netlify. The bundled
`world.onscreen.min.js` and `world.none.min.js` modules import `./Dice.min.js`,
while the release package only included `dice.min.js`.

Netlify deploys on Linux, where filenames are case-sensitive. The missing exact-case
module produced a 404 and aborted the ES-module dependency graph before `window.VFDice3D`
could become available.

## Fix

- Added `assets/3d-dice/Dice.min.js` as a byte-identical compatibility alias of the
  existing `assets/3d-dice/dice.min.js` vendor module.
- Preserved the existing lowercase file because it remains a direct dependency elsewhere.
- Did not change roll generation, Duality resolution, themes, HUD behavior, physics,
  result values, Firebase, Netlify Identity, Firestore Rules or any canonical rules.
- Bumped the portal package and changelog to v59.60.

## Deploy Preview acceptance

1. Open Player Tool and perform a 3D Duality roll.
2. Verify `assets/3d-dice/Dice.min.js` loads with HTTP 200.
3. Verify Hope/Fear dice settle once and match the application's generated values.
4. Verify Damage rolls and Plain/Tech/Crystal themes load.
5. Confirm the console contains no dynamic-import, module MIME, or Dice.min.js 404 errors.
6. Confirm the 2D fallback remains available when 3D is disabled.

## Risk

Low. This is an additive filename compatibility fix. The alias is byte-identical to the
existing vendor module and does not modify executable behavior.
