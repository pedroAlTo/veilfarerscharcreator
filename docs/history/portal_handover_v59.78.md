# VeilFarers Portal v59.78 — handover

Date: 2026-07-23  
Baseline: v59.77  
Release package: `VeilFarers_Portal_v59.78.zip`

## Active release

Use v59.78 as the only active portal baseline. It preserves every v59.77 change—3D/2D dice lifecycle, synchronized roll audio, mobile Shake to Roll, Level Up popups and particles, card reverses, reward glow, inventory illustration and transfers—and adds the current *Hearts in the Void* integration, trimmed roll audio and explicit inventory targeting.

Do not rebuild from v59.77 or from the old Keeper Tool adventure object.

## Canonical editorial baseline

- Player rules: `VeilFarers Corebook 11.35`.
- Keeper/adversary rules: `VeilFarers Keeper's Companion 11.33`.
- Equipment supplement: `VeilFarers Rust & Steel 11.33`.
- Adventure source: `Hearts_in_the_Void_Working_Package_2026-07-22.zip`, Library version 12.
- Complete adventure copy: `adventures/hearts-in-the-void/Hearts_in_the_Void_COMPLETE_Corebook_11_35_KC_11_33.md`.
- Active source blocks: `adventures/hearts-in-the-void/CURRENT/` (17 Markdown files).

The system and editorial identity are **VeilFarers**. Do not revive Voidlight terminology or old mechanics.

## Hearts in the Void integration

`hearts-in-the-void-template.js` is now the maintained runtime source for the Keeper Tool template. It loads before `app.js`; if it is absent, Keeper Tool fails explicitly instead of silently falling back to obsolete adventure data.

The template provides:

- 11 playable stages covering the eight numbered scenes plus Veil Transit, Bonds & Shadows and the Choice to Wake.
- Ten Level 1 Sleeping pregenerated characters using the Corebook 11.35 quick reference.
- Correct Sleeping resources: 2 Effort of 6, a two-segment Effort Track and 2d4 Resolve.
- Ten major NPC profiles expressed as intentions, needs and leverage. They deliberately have no invented combat statistics.
- Current Weaver Queen phases using the Keeper's Companion 11.33 Rust-King Tier 1 phased chassis:
  - Phase One: 10 HP, Evasion 8, Armor 3.
  - Phase Two: 8 HP, Evasion 12, Armor 0.
- Correct clocks:
  - Korren's Desperation 4.
  - Hunger 4.
  - Core Overload 6.
  - Structural Failure 6.
  - Weaver Convergence 4.
  - Escape Route 3.
- A direct link from every interactive scene to its complete Markdown chapter.
- A Full adventure link in the campaign selector.

### Adventure guardrails that must remain

- Everyone Can Die, but nobody dies because the module demands a dramatic beat.
- Nothing Happens on Autopilot. Betrayal, attack, escape, confession, sacrifice and ship fusion remain conditional intentions.
- The NPCs Need the Crew; they do not resolve the plot while players watch.
- Korren is never presented as “the traitor.” His betrayal can be prevented, delayed or transformed.
- “I Need an Idea!” is a terminal backup used only when resolved consequences eliminate every conventional route. It never advances an unrelated clock or erases a cost.
- Scene 8's standoff has no persuasion roll. Dice return only for violence or another uncertain action outside that decision.
- “The Ship That Learns” remains an optional, recommended campaign ending. The Keeper chooses whether to enable the seed and the crew can prevent the sliver from reaching a ship.
- Zara's ship is conditional and never granted automatically.
- Awakening is an individual choice; remaining Sleeping is complete and valid.

The obsolete embedded template was removed from active source. Both campaign loading and initial runtime state resolve through `VF_HEARTS_IN_THE_VOID_TEMPLATE`, so stale values cannot reappear through a fallback path.

Both Keeper Tool export paths now include `scenes`, so chapter-linked scene edits survive save and reload.

Section exports now use `veilfarers_*` type identifiers and filenames. Import still accepts historical `voidlight_*` files only as a backward-compatibility migration path.

## Keeper Tool resource correction

- Sleeping character cards show Effort, Resolve and the two-segment Effort Track.
- Dashboard cards show Effort rather than Hope for Sleeping characters.
- Hope-dominant Duality results advance the acting Sleeping character's Effort Track.
- Completing the track grants 1 Effort.
- On a Sleeping critical, the tool clears 1 Stress and prompts the Keeper/player to choose +1 Effort or Resolve rather than making that choice automatically.
- These rules follow Corebook 11.35, Chapters 7 and 9, as summarized in the included pregen quick reference.

## Dice audio

- `assets/dados_1.mp3` was shortened from about 4.075 seconds to about 2.691 seconds.
- Approximately 1.38 seconds of near-silence at the beginning was removed.
- Only a codec-safe opening pad of roughly 0.026 seconds remains.
- The asset keeps the same filename, while the Player Tool requests it as `dados_1.mp3?v=59.78` so an immutable browser/CDN cache cannot replay the older file. All v59.77 cancellation, restart, fallback and mobile behavior remains intact.

## Inventory active character

Both `items.html` and `armory.html` now show a high-contrast Active character panel above the inventory illustration.

The panel displays:

- Active character name.
- Active Character Vault ID.
- A clear statement that every transfer button targets that character.

Transfer safety changes:

- Player Tool, Charsheet and Both buttons are disabled when no active character is selected.
- Player Tool transfer no longer falls back silently to the first character in local storage.
- If the active ID is not present in Player Tool, the user is told to open or import that exact character.
- If Charsheet contains a different character ID, transfer stops and names both IDs rather than writing into the wrong sheet.
- The panel updates on active-character, character-update and relevant storage events.

Storage contracts remain:

- Active character: `veilfarers.character.currentId.v1`.
- Player Tool characters: `veilfarers-player-tool-characters`.
- Charsheet fields: `veilfarers_sheet_fields_v2_40`.
- Shared inventory: `veilfarers.inventory.v1`.

## Principal files changed

- `hearts-in-the-void-template.js` — new canonical Keeper Tool adventure template.
- `app.js` — current template routing, source chapter links, narrative NPC presentation and Sleeping resource behavior.
- `keeper-tool.html` — loads the maintained template before `app.js`.
- `adventures/hearts-in-the-void/` — complete adventure, 17 active blocks, audit and adventure handover.
- `assets/dados_1.mp3` — leading silence removed.
- `items.html`, `armory.html`, `catalog-page.js`, `module.css` — explicit active-character target and transfer safety.
- `styles.css` — campaign source and narrative profile styling.
- release metadata, changelog, headers and deployment documents.

## Deployment and acceptance

Deploy the contents of `VeilFarers_Portal_v59.78.zip` directly at the site root.

Live acceptance still required:

1. Load Hearts in the Void from Keeper Tool and inspect all 11 scene cards.
2. Open several Full chapter links and the Full adventure link.
3. Run a Duality roll with a pinned Sleeping pregen and confirm Effort Track behavior.
4. Confirm the die sound begins immediately and still stops when a roll animation is interrupted.
5. Select two different active characters in turn and confirm the Inventory target panel changes.
6. Attempt transfer with no active character and with a mismatched Charsheet; both must stop safely.
7. Re-test authenticated Keeper ↔ Player synchronization and mobile Shake to Roll in Deploy Preview.

## Instruction for the next chat

Use `VeilFarers_Portal_v59.78.zip`, `PORTAL_HANDOVER_v59.78.md`, `GITHUB_DEPLOY_SUMMARY_v59.78.md` and `VALIDATION_v59.78.txt` as the active portal set. For every subsequent portal modification, increment the release, update this handover and include a GitHub-ready deploy summary.
