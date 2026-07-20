# VeilFarers Portal v59.16 — Technical Handover

## Base

This build was created from the exact uploaded package:

`veilfarers_deploy_v59_15_firestore_undefined_fix(2).zip`

The v59.15 Firestore sanitizer, SDK configuration, table-name normalization and initial-write verification are retained. The richer Player Tool from v59.14 was merged forward rather than using the reverted Player Tool contained in an older build.

## Player Tool architecture

### Dice modes

- 2D remains the default fallback.
- 3D uses a local ESM entry point: `assets/3d-dice/vf-dice3d.js`.
- Dice Box assets and web workers are under `assets/3d-dice/`.
- Themes are under `assets/3d-dice/assets/themes/`.
- `window.VFDice3D` exposes `init`, `roll`, `showResults` and `hide`.
- The result returned by Dice Box is passed back to the Player Tool and used as the actual roll value.

### DisplayResults

`assets/3d-dice/display-results.js` is an attributed adaptation of the official DisplayResults addon. It supports:

- totals and flat modifiers;
- labels;
- die roles;
- dropped dice;
- rerolled dice;
- automatic dismissal and manual dismissal.

### Themes

- `vfHope`: `#f4c542`, `diffuse-dark.png` for black numerals.
- `vfFear`: `#8b5cf6`, `diffuse-dark.png` for black numerals.
- `vfDamage`: `#c92a38`, `diffuse-light.png` for white numerals.
- `vfNeutral`: `#168ca8`, `diffuse-light.png` for white numerals.

Every theme uses a low-amplitude circuit normal/specular texture to preserve readability.

### Firestore

Every Firestore write still passes through `vfSanitizeFirestore`. Arrays preserve indexes by replacing undefined positions with `null`; undefined object fields are omitted. Firestore is also initialized with `ignoreUndefinedProperties` when possible.

Table names are trimmed and normalized before being used as document IDs. Connection success is reported only after the initial document write resolves.

### Local-only Time Travel

Time Travel stores character snapshots locally and never writes snapshots to Firestore. Restoring a state changes the active local character; normal autosave then publishes the restored current state when connected.

## Corebook RC3.1

RC3.1 is a layout-only iteration on the approved RC3 content.

Source pipeline:

1. Start with the RC3 DOCX.
2. Reduce meaningful direct-format and style font sizes by one point.
3. Render with LibreOffice.
4. Recalculate Contents page references.
5. Render again.
6. Underlay the Player, Awakened and Sleeping left/right background masters.
7. Rebuild the nested PDF outline from `VFANCHOR` records.
8. Render all 234 pages for visual QA.

Background ranges:

- Awakened: pages 47-68.
- Sleeping: pages 69-91.
- Player/general: all other pages.

The PDF has 797 outline entries and 234 pages.

## Canon boundary

- Rules-data manifest remains `11.1-RC3`.
- No Soldier/Vanguard rules were changed in this iteration.
- No canonical weapon JSON was changed.
- RC3.1 only identifies the Corebook layout candidate.

## Live checks still required

WebGL/Ammo worker execution, GPU rendering, Firebase multi-browser behavior, Identity and Netlify Functions must be checked in a Netlify Deploy Preview. Static integration, syntax, paths, assets and document structure have been validated locally.
