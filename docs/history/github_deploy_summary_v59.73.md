# VeilFarers Portal v59.73 — Card parity, Level Up reward feedback, Human Relic and dice interruption fallback

## Summary

v59.73 consolidates the latest Creator, Charsheet, Level Up and dice-interruption requirements on top of v59.72. It keeps VeilFarers Blue as the only exposed theme and preserves the Player/Keeper authentication repairs, compact v59.56-style Player Tool direction, canonical editorial PDFs and protected 3D renderer assets.

## Character Creator

- Normalized every card within a deck to the same rendered height so Ancestry, Community, Class, Affiliation and Equipment choices preserve visual parity.
- Controlled Chromium validation confirmed all nine Ancestry cards render at exactly **324 px** in the test viewport.
- Strengthened selected-card feedback:
  - smooth lift of the card itself;
  - brighter but restrained gold glow;
  - more defined border;
  - floating light particles travel approximately 20% higher without obscuring content.
- Rebuilt full-information behavior around a real front/back rotor:
  - `[+]` raises the card further and rotates to an image-free blue reverse;
  - reverse text remains correctly oriented and complete;
  - `[−]` or outside click returns to the front and neutral state;
  - only one expanded card can exist at a time.
- Human gifts are presented in two columns.
- Renamed the second Human inheritance branch to **The Tool**.
- Human inheritance choice and exact inherited item remain in Equipment.

## Human — The Tool

The selected TT3 item gains **The Stubborn Relic**:

- loss, theft, confiscation, abandonment and even destruction cannot permanently remove it;
- it returns restored and functional at the next narratively appropriate opportunity;
- return is not immediate and does not bypass the temporary obstacle caused by its absence;
- the bond ends only when the Human willingly sells or trades it for its appropriate market value or greater;
- any other permanent removal is equivalent to permanently removing an Ancestry Gift and requires a major story event agreed by player and Keeper.

The synchronized Human text is present in canonical ancestry data, the Creator’s embedded data and the runtime data loader.

## Charsheet

- Added a distinct **not yet purchased** HP state, using a segmented locked ring rather than the same presentation as available HP.
- Purchased, marked and locked HP are now visually separate in the same way Stress capacity is communicated.
- Existing v59.72 geometry remains: Level/Evasion/Armor/Proficiency separation, Armor shields beside Evasion, visible Hope, clean Effort and true-square Resolve diamonds.

## Level Up

- Applied the Creator card language to Level Up choices:
  - equal-height option cards;
  - selected lift/glow;
  - `[+]` full-text reverse and outside-click close.
- Applying a level now stores the exact pre-application change summary and presents it through a reward sequence:
  - intense radial flash;
  - expanding light rings;
  - particles dispersing from the Build Changes panel;
  - staggered reveal of the exact changes applied.
- Includes a reduced-motion alternative.

## 3D dice interruption

- Clicking anywhere on the 3D stage now works as the primary close/interruption gesture.
- If the renderer has already produced a result, the HUD closes and the existing result is preserved.
- If clicked before a result exists:
  - the active 3D simulation is cancelled safely;
  - the 3D dice are removed;
  - the same groups, quantities and die sizes are rolled automatically through the 2D roller;
  - the 2D window is opened/unminimized;
  - the user’s persistent 3D/2D preference is not changed.
- Duality and appended weapon-damage flows preserve their corresponding 2D mode.

## Preserved systems

- White Stone remains disabled; VeilFarers Blue is the only selectable theme.
- v59.70 Netlify Identity refresh/auth-expiry handling and polling stop.
- v59.65 renderer cancellation lifecycle.
- v59.64 Massive digital damage behavior and Keeper Notes.
- Current Keeper/Player table API contracts, Firebase paths and character storage contracts.
- Five editorial PDFs, unchanged byte-for-byte.
- Protected DiceBox/Babylon/Ammo/theme assets, unchanged byte-for-byte.

## Validation completed

- 86 JSON files parsed.
- 35 JavaScript files pass `node --check`.
- 11 root HTML files inspected; 10 inline scripts pass syntax validation.
- 11 CSS files pass brace-balance validation.
- Human gifts synchronized 4/4 in active data sources.
- Creator controlled test:
  - selection transfer works;
  - previous selection returns neutral;
  - full-text flip opens;
  - outside click closes and clears active state;
  - all nine Ancestry cards are 324 px high.
- Dice controlled lifecycle test:
  - pending click returns `user-fallback-2d` with the same two-die group;
  - completed result `[7, 3]` remains preserved while the HUD closes.
- `player-tool.bundle.js` rebuilt deterministically from `player-tool.jsx`.
- Protected renderer assets and all editorial PDFs match v59.72 byte-for-byte.

## Deploy Preview acceptance

1. Complete Human creation and choose The Tool plus a TT3 item in Equipment.
2. Verify equal-height cards and select/flip/outside-close behavior in every Creator deck on desktop and mobile.
3. Complete a full Level Up, apply it and inspect the reward animation plus exact change list.
4. Inspect purchased, marked and locked HP slots on Sleeping and Awakened sheets.
5. Interrupt Duality, ordinary dice and appended damage while 3D dice are moving; confirm automatic same-parameter 2D fallback.
6. Dismiss a completed 3D result by clicking anywhere; confirm the result is retained.
7. Re-test Keeper ↔ Player communication with valid and expired Netlify Identity sessions.

No live Netlify/Firebase acceptance claim is made by the static and controlled-browser checks.
