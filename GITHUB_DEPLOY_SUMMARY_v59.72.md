# VeilFarers Portal v59.72 — Sheet geometry and card interaction correction

## Summary

v59.72 corrects the Charsheet and Creator interaction regressions reported after v59.71 and restores the simple Player Tool resource language requested for the release candidate.

This release does **not** change canonical rules, character storage contracts, table API payloads, Firebase paths, editorial PDFs or 3D-dice renderer assets.

## Charsheet

- Rebuilt the masthead stat rail as four non-overlapping cells: **Level, Evasion, Armor and Proficiency**.
- Moved Armor Slot shields beside Evasion and removed the duplicate Armor track from the Active Armor block.
- Restored stable, non-deformed token geometry:
  - HP: compact shield/hex silhouettes;
  - Stress: true circles;
  - Hope: visible six-sided tokens;
  - Effort: clean diamonds without a permanent center divider;
  - Resolve: exact square tokens rotated into diamonds;
  - Armor: simple shield silhouettes.
- Preserved half-Effort tracking mechanically. A half point uses a quiet half-fill rather than a dividing line.
- Raised threshold, Trait and masthead-number contrast.

## Character Creator

- Replaced the mirrored whole-card transform with a real two-face card rotor.
- Selecting Ancestry, Community, Class or Affiliation:
  - lifts the card slightly;
  - adds a restrained gold glow;
  - leaves the illustration and text correctly oriented.
- Pressing `[+]`:
  - lifts the card further;
  - rotates the inner card face smoothly;
  - shows an image-free blue reverse with the complete text.
- Pressing `[−]` or clicking outside:
  - rotates back to the illustrated front;
  - removes the raised state;
  - returns the card to neutral.
- Only one full-information card can be open at a time.
- Recommendation treatments remain more explicit in Traits and Equipment.

## Player and Keeper Tool resources

- Player Armor/Shields use the original simple cyan shield silhouette.
- Player Fear uses aggressive red triangles.
- Removed the ornamental Fear strip border/background and token bevels.
- Keeper Fear controls use the same red language without a purple ornamental bezel.
- Existing semantic state attributes and accessible labels remain intact.

## Preserved work

- v59.71 schematic class-feature summaries.
- Human `Inheritance of the Builders` selection in Equipment.
- White Stone remains disabled; VeilFarers Blue is the only active theme.
- v59.70 Identity refresh/auth-expiry handling and polling stop.
- v59.65 3D-dice cancellation lifecycle.
- Massive digital damage behavior.
- Keeper Notes and table handouts.
- Approved editorial PDFs from the 11.35 package.

## Validation

- 161 automated/static checks passed.
- All first-party JavaScript and inline scripts pass syntax validation.
- All JSON parses.
- Root HTML files contain no duplicate IDs.
- `player-tool.bundle.js` is deterministic from `player-tool.jsx` using TypeScript JSX transpilation, React classic output, ES2020 and no module wrapper.
- 3D-dice protected assets are byte-identical to v59.71.
- Editorial PDFs are byte-identical to v59.71.
- Controlled Chromium rendering verified the real Charsheet masthead, Health/Stress and Sleeping Engine geometry.
- A controlled interaction fixture verifies normally oriented front/back card faces and simple Shield/Fear silhouettes.

## Deploy-preview acceptance

1. Open a Sleeping and Awakened Charsheet and inspect Level/Evasion/Armor/Proficiency at desktop and mobile widths.
2. Mark/unmark HP, Stress, Hope, Effort, Resolve and Armor slots.
3. Confirm half Effort still cycles correctly without a permanent divider.
4. Select cards in Ancestry, Community, Class and Affiliation; click `[+]`, `[−]` and outside.
5. Confirm reverse text is not mirrored and the front image returns.
6. Verify Player Tool Armor/Shields and red Fear states.
7. Verify Keeper Fear controls.
8. Re-test Netlify Identity table connection and interrupted 3D rolls in the deployed environment.
