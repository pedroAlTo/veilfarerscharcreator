# VeilFarers Portal v59.60 — Technical Handover

## Release objective

Restore the bundled @3d-dice renderer on case-sensitive Netlify/Linux deployments.

## Root cause

The ES-module graph contains these exact imports:

- `assets/3d-dice/world.onscreen.min.js` → `./Dice.min.js`
- `assets/3d-dice/world.none.min.js` → `./Dice.min.js`

v59.59 only shipped `assets/3d-dice/dice.min.js`. On Windows this can go unnoticed;
on Netlify/Linux it is a different path and returns 404. Because the dependency fails,
`vf-dice3d.js` cannot finish importing and `window.VFDice3D` is never exposed.

## Applied correction

Added `assets/3d-dice/Dice.min.js`, byte-identical to `dice.min.js`. Both filenames are
retained so every existing exact-case import resolves without editing minified vendor code.

## Preservation guarantees

Unchanged:

- generated roll values and no-reroll behavior;
- Duality Hope/Fear comparison;
- discarded and winner cues;
- Plain, Tech and Crystal themes;
- physics parameters and renderer configuration;
- Player Tool application bundle and JSX;
- Keeper Tool, Firebase, Netlify Functions and Firestore Rules;
- canonical rules and editorial content.

## Validation

- Every relative JavaScript module import under `assets/3d-dice` resolves to an existing file.
- `Dice.min.js` and `dice.min.js` have identical SHA-256 hashes.
- JavaScript syntax validation passes for first-party non-module scripts.
- Package and changelog report v59.60.
- ZIP CRC extraction validation passes.

## Live acceptance

Use a Netlify Deploy Preview and verify the exact-case module request returns 200. Hard-refresh
after deployment because immutable asset caching may preserve the failed module graph in an
already-open tab.
