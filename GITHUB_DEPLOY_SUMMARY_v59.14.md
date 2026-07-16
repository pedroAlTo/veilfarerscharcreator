# Replace current deploy with VeilFarers Portal v59.14

## Suggested branch

`release/portal-v59.14-player-rolls-time-travel-3d`

## Summary

This branch replaces the current VeilFarers deployment with **Portal v59.14**.

The release is a Player Tool testing iteration. It restores operational weapon-feature resolution, fixes attack Trait modifiers, expands table-wide roll callouts, adds local Roll History time travel, introduces configurable dice audio, and provides an optional attributed 3D dice mode.

**The Corebook, other PDFs, canonical RC3 rules datasets, and book text are unchanged in this release.**

## Weapon attack fixes

- Fixed imported weapon Traits such as `Strength · Far` so the attack roller resolves the actual Trait key and adds the current character modifier.
- Added the Trait contribution to the visible attack breakdown in Roll History and callouts.
- Restored automatic weapon-feature handling:
  - `Reliable`: +1 to the attack roll.
  - `Accurate`: +1 at Far or Very Far range.
  - `Heavy`: applies the existing Disadvantage requirement logic.
  - `Massive`: rolls one additional damage die and discards the lowest result.
  - `Brutal`: rerolls damage results of 1 once.
  - `Paired`: applies the equipped paired-weapon bonus.
- Restored `KEEP` / `DROP` damage presentation. The discarded Massive die is muted, desaturated, crossed out, and labelled `DROP`; retained dice are labelled `KEEP`.
- The same structured damage result is displayed in:
  - the local result;
  - Roll History;
  - every remote Player Tool callout connected to the table.

## Railgun testing override

Player Tool temporarily forces Railgun to:

- Damage: `d8+3 physical`
- Feature: `Massive`

This override is isolated in `player-tool.html` under `PLAYER_TOOL_WEAPON_OVERRIDES`.

It does **not** modify:

- Corebook text or PDFs;
- `/data/weapons.json`;
- `/rules-data/core/weapons.json`;
- Character Creator canonical data;
- Armory canonical data.

The override must remain classified as playtest feedback until it is separately approved for canon.

## Multi-player callouts

- Replaced the single global roll toast with separate current callout windows per player.
- Up to **six** player windows can be visible simultaneously.
- A player's newest roll replaces only that player's previous window.
- Callouts consume both `lastRoll` and fresh `rollHistory` events, reducing the chance of losing rapid near-simultaneous rolls.
- New broadcasts include `actorId` and `characterId`, while older roll records continue to fall back to player name.
- Callout size is configurable per device from **50% to 150%**.

## Roll History time travel

- Every local log entry stores a bounded snapshot of the active character immediately before that action.
- Entries with a local snapshot display a **Time travel** control.
- Restoring uses an in-app confirmation dialog and returns that character to the selected pre-action state.
- Snapshots:
  - are stored only in localStorage;
  - are limited to the latest 40 entries;
  - are never written to Firestore;
  - remain discoverable after the cloud history refreshes because they are keyed by `broadcastId`.
- Restoring while connected publishes the restored character through the normal Player Tool character synchronization flow.

## Dice audio

- Added a locally generated dice-rattle effect using Web Audio.
- Added Player Tool Settings for:
  - sound on/off;
  - volume from 0% to 100%.
- No external sound recording is required.
- Settings use VeilFarers controls rather than native browser sliders or checkboxes.

## Optional 3D dice

- Added a `2D / 3D` switch to the Player Roller and Settings.
- 3D mode loads `sarahRosannaBusch/dice` only when requested.
- The animation receives the already-resolved VeilFarers results, so the physical animation and logged outcome remain identical.
- Supports d4, d6, d8, d10, d12, and d20 notation, with a maximum of 20 rendered dice.
- Unsupported rolls, unavailable CDN files, or renderer failures automatically fall back to the standard VeilFarers 2D display without cancelling the roll.
- Added visible attribution and `THIRD_PARTY_NOTICES.md` with the MIT notice.
- The external renderer's bundled audio path is served a silent compatibility asset; VeilFarers' own volume and mute settings remain authoritative.

## New local settings

- `veilfarers_callout_scale`
- `veilfarers_dice_sound`
- `veilfarers_dice_volume`
- `veilfarers_dice_mode`
- `veilfarers_player_time_travel_v1`

No localStorage migration is required.

## Firebase compatibility

Existing session fields remain:

- `characters`
- `fearTokens`
- `spotlight`
- `lastRoll`
- `rollHistory`
- `lastRollUpdatedAt`

New roll events may also include:

- `actorId`
- `characterId`
- structured `damageDiceResults`

Older events remain readable. No Firestore migration is required, and character snapshots are not uploaded.

## Unchanged release content

- Canonical release remains `11.1-RC3`.
- All five PDF files have identical SHA-256 hashes to v59.13.
- No book text or canonical weapon data was modified.
- Netlify Identity, Netlify Forms, Firebase runtime configuration, and Keeper Tool remain structurally unchanged.

## Validation performed

- Parsed all JSON files.
- Parsed Player Tool TSX with the TypeScript parser.
- Verified all PDF hashes against the v59.13 deploy package.
- Deterministically tested:
  - legacy combined Trait parsing;
  - Trait modifier application;
  - Reliable +1;
  - Railgun `d8+3` playtest override;
  - Massive rolling 2 and 7, discarding 2, keeping 7, and producing 10 damage.
- Verified six-player callout cap and per-actor replacement.
- Verified bounded local snapshots and absence of snapshots in Firestore payloads.
- Verified custom sound, callout-size, and 2D/3D controls.
- Verified 3D fallback and visible MIT attribution.
- Scanned for embedded Firebase keys.

Validation result:

```text
Passed: 101
Failed: 0
```

## Deploy Preview checklist

- [ ] Attack with a Strength weapon and confirm the character's Strength modifier appears in the total and breakdown.
- [ ] Attack with a Reliable weapon and confirm `Reliable +1` appears.
- [ ] Attack with Railgun and confirm two d8 are rolled, the lower result is gray/struck through, and only the higher result receives `+3`.
- [ ] Confirm the same KEEP/DROP state appears in a second browser connected to the same table.
- [ ] Connect six different characters and confirm six independent callout windows can remain visible.
- [ ] Confirm a seventh player's roll replaces the oldest visible window rather than exceeding six.
- [ ] Test callout scale at 50%, 100%, and 150%.
- [ ] Spend and generate character resources, then restore a prior Roll History state.
- [ ] Confirm restoration synchronizes normally while connected.
- [ ] Test dice sound mute and volume controls.
- [ ] Test 3D Duality, standard, Resolve, and Railgun rolls.
- [ ] Disable network access after loading the app and confirm 3D mode falls back without cancelling the roll.
- [ ] Verify the attribution link and `THIRD_PARTY_NOTICES.md`.
- [ ] Confirm all Downloads still serve the unchanged RC3 PDFs.

## Known limitations

- Time travel restores the selected character state, not the entire table's historical Fear, Spotlight, or other players' states.
- 3D mode requires access to the external jsDelivr CDN on first use and is intentionally optional.
- The Railgun override is temporary Player Tool playtest behavior and must not be copied into book or canonical data changes without separate approval.
