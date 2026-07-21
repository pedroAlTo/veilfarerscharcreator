# VeilFarers Portal v59.74 — Immediate 3D interruption and live Creator particle tuning

## Summary

v59.74 corrects the actual input-layer defect that prevented a click from interrupting the 3D dice animation and replaces the fixed card-particle treatment with temporary, live controls for exact particle count and visual density.

This release is based on v59.73. It preserves VeilFarers Blue as the only exposed theme, the current Creator/Level Up card system, Human **The Tool**, the compact Player Tool direction, authentication recovery, table APIs, editorial PDFs and protected renderer assets.

## 3D dice interruption

### Root cause

The full-screen `.vf-dice3d-stage` remained `pointer-events: none` while visible. The stage-level click handler therefore could not receive clicks that landed outside the small interactive result/close elements.

### Fix

- A visible 3D stage now owns the viewport with `pointer-events: auto` and `touch-action: none`.
- Dismissal is captured on **`pointerdown` in the capture phase**, rather than waiting for `pointerup`.
- The stage stops propagation before the DiceBox canvas/result layer can consume the input.
- The close button uses the same safe path without causing a second stage dismissal.

### Result contract

- **Clicked before a readable 3D result exists:**
  - stops the active physics simulation;
  - resolves the wrapper cancellation immediately with `user-fallback-2d`;
  - releases the roll queue;
  - Player Tool rolls the same prepared groups through its standard 2D generator;
  - quantities, die sizes, roles, themes and Duality/generic mode are retained;
  - the persistent 3D preference is unchanged.
- **Clicked after a readable result exists:**
  - closes the stage;
  - preserves the actual 3D result;
  - does not reroll in 2D.

The 14-second renderer fuse remains only for genuine renderer failures.

## Character Creator particle tuner

The earlier fixed pseudo-particle set has been retired. The Creator now exposes a temporary tuning panel with two independent controls:

- **Particles:** exact generated particle count, `0–48`.
- **Density:** visual concentration/intensity, `40–180%`.

Additional behavior:

- default count is **19**, the closest whole-number representation of 20% more than the previous 16-particle field;
- default density is **100%**, preserving the baseline movement/spread rather than moving particles 20% higher;
- changes update the selected/flipped card immediately;
- values persist locally under dedicated Creator keys;
- Reset returns to 19 particles and 100% density;
- particle DOM exists only on the active/flipped card and is removed when the card returns to neutral;
- deterministic placement keeps a card visually stable while values are adjusted.

The tuner is intentionally temporary. Its final values should be locked after visual acceptance and the controls can then be removed.

## Preserved systems

- White Stone remains disabled; VeilFarers Blue is the only selectable theme.
- v59.73 equal-card parity, card selection/flip behavior, Level Up reward sequence, Human **The Tool** and Charsheet HP-state work.
- v59.70 Netlify Identity refresh/auth-expiry handling and polling stop.
- v59.65 explicit renderer cancellation lifecycle.
- v59.64 Massive digital damage behavior and Keeper Notes.
- Current Keeper/Player table API, Firebase, Vault and character contracts.
- Five editorial PDFs, unchanged byte-for-byte.
- 86 protected DiceBox/Babylon/Ammo/theme assets, unchanged byte-for-byte.

## Validation completed

- 86 JSON files parsed.
- 35 JavaScript files pass `node --check`.
- 11 root HTML files inspected; 10 inline scripts pass syntax validation.
- 11 CSS files pass balanced-brace validation.
- No duplicate IDs in root HTML outside script/template content.
- Controlled Chromium test of the exact v59.74 dice wrapper with deterministic renderer stubs:
  - visible stage computed `pointer-events: auto`;
  - pending two-die roll interrupted on `pointerdown`;
  - cancellation reason `user-fallback-2d`;
  - pending DiceBox resolver released and `clear()` invoked;
  - completed result `[5]` preserved on dismissal.
- Controlled Chromium test of the exact Creator particle functions:
  - fresh state defaults to 19 particles / 100%;
  - live adjustment to 31 particles / 145% produced exactly 31 nodes and density `1.45`;
  - values persisted to the dedicated keys;
  - particle field was removed when the card returned to neutral.
- Protected renderer assets match v59.73 byte-for-byte.
- Five editorial PDFs match v59.73 byte-for-byte.

## Deploy Preview acceptance

1. Hard-refresh Player Tool and start a 3D Duality roll.
2. Click/tap anywhere immediately after launch; verify the 3D dice disappear and the same roll appears in 2D.
3. Repeat with a generic pool and an attack with appended damage.
4. Let a roll settle, then click anywhere; verify the displayed result is retained and only the overlay closes.
5. Start another roll and confirm the saved 3D preference is unchanged.
6. In Creator, select cards in Ancestry, Community, Class, Affiliation and Equipment and tune both sliders across their ranges.
7. Report the preferred **particle count** and **density percentage** separately.
8. Verify inactive cards do not retain particle fields and mobile performance remains stable.
9. Re-test Keeper ↔ Player communication with valid and expired Netlify Identity sessions.

No live Netlify/Firebase/real-DiceBox acceptance claim is made by the static and controlled isolated-browser checks.

## Archive integrity

- 464 files packaged as 464 root-relative ZIP entries.
- No outer wrapper directory.
- Full ZIP CRC test passed.
- No test-only fixture HTML or dependency directory is included.
