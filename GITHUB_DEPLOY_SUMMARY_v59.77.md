# VeilFarers Portal v59.77 — GitHub deploy summary

Release date: 2026-07-22  
Base: v59.76

## Summary

- Added synchronized roll audio from `assets/dados_1.mp3`, including cancellation cleanup.
- Fixed mobile Shake to Roll using stale 2D settings after the user selected 3D.
- Reworked Level Up Trait and Domain Power selection into focused popups.
- Added detailed Level Up card reverses, bright next values, concurrent selected-card particles and a post-reward page-frame pulse.
- Aligned reverse `[−]` controls with front `[+]` controls.
- Added a color inventory illustration and inventory transfer to Player Tool, Charsheet or both.

## Deploy authority

- Package version: `59.77.0`
- Release header: `X-VeilFarers-Release: v59.77`
- CSP profile: `wasm-3d-dice-v2`
- Required script source: `'wasm-unsafe-eval'`
- Deploy the contents of the ZIP root directly.

## Checks completed

- JavaScript syntax: 35/35 passed.
- Inline HTML scripts: 10 parsed.
- JSON: 86 parsed.
- Root HTML release markers: 11/11.
- CSS brace balance: passed.
- Player Tool source/bundle parity: passed.
- Local HTTP asset smoke: passed.

## Deploy Preview checklist

1. Verify `/data/deploy-version.json` and response headers both report v59.77.
2. Test 2D/3D roll audio and interrupt a pending 3D roll.
3. Test mobile sensor permission and Shake to Roll with 3D selected.
4. Transfer a mixed inventory to Player Tool, Charsheet and Both.
5. Complete one Level Up with two simultaneous one-slot selections.
6. Re-test authenticated Keeper ↔ Player synchronization.

Physical-device motion/audio and live Netlify/Firebase behavior remain deploy-preview acceptance items.
