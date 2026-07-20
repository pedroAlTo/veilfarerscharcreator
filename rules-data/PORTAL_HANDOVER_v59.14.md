# VeilFarers Portal v59.14 — Technical Handover

## Release identity

- Portal: `v59.14`
- Canonical rules release: `11.1-RC3` — unchanged
- Scope: Player Tool testing iteration
- Suggested branch: `release/portal-v59.14-player-rolls-time-travel-3d`
- Production replacement: v59.13

## Modified files

- `player-tool.html`
- `assets/nc93322.mp3` — silent compatibility file for the optional renderer
- `data/changelog.json`
- `feedback.html`
- `START_HERE.txt`
- `THIRD_PARTY_NOTICES.md`
- release documentation and validation report

## Explicitly unchanged

- Every PDF under `/download`
- `/data/weapons.json`
- `/rules-data/core/weapons.json`
- Corebook and Player Core source content
- Character Creator canonical weapon data
- Keeper Tool behavior

## Weapon resolution

### Trait normalization

`hydratePlayerWeapon()` now splits a combined legacy Trait string even when the imported object already supplies a range. For example:

```text
Strength · Far → trait: Strength; range: Far
```

`weaponAttackProfile()` resolves the modifier by searching the six canonical Trait keys inside the normalized Trait string rather than requiring an exact object-key match.

### Feature pipeline

The attack profile continues to derive behavior from weapon features. This release revalidates and exposes:

- Reliable
- Accurate
- Heavy
- Massive
- Brutal
- Paired

Massive produces structured `damageDiceResults` entries with `kept` or `discarded` status. `DamageDiceDisplay` is used by local history and every callout card.

### Railgun override

The temporary override lives in:

```js
const PLAYER_TOOL_WEAPON_OVERRIDES = {
  'vf.core.weapon.railgun': {
    damage: 'd8+3 phys.',
    features: ['Massive'],
    feature: 'Massive'
  }
};
```

This is intentionally not part of the canonical datasets.

## Callout architecture

The old `broadcastRoll + recentBroadcasts` model was replaced by `activeCallouts`.

- Identity: `actorId`, then `characterId`, then normalized `playerName`.
- One visible latest event per actor.
- Maximum: six actors.
- Duration: 12 seconds per actor.
- Input sources:
  - immediate local `logRoll()` registration;
  - fresh events discovered in Firestore `rollHistory`;
  - `lastRoll` backward-compatible listener path.
- Duplicate suppression: bounded `seenCalloutIdsRef` set keyed by `broadcastId` or legacy event signature.

The local scale setting is clamped to `0.5–1.5` and applied to the callout grid with bottom-right transform origin.

## Time travel architecture

Storage key:

```text
veilfarers_player_time_travel_v1
```

Each local `logRoll()` stores a deep copy of the active character before the action. Records are keyed by the roll `broadcastId` and pruned to 40 snapshots.

Firestore receives only the roll record. Snapshot data is never attached to `lastRoll` or `rollHistory`.

Restoration:

1. User selects `Time travel` in Roll History.
2. A custom VeilFarers confirmation dialog identifies the selected action.
3. The character with the stored ID is replaced with the normalized snapshot.
4. If the character is no longer open, the snapshot is added as a new tab.
5. Connected tables receive the restored character through the existing debounced character sync.

## Dice sound

The new sound is synthesized with Web Audio oscillators and filters. It has no third-party audio dependency.

Settings:

- `veilfarers_dice_sound`: `1` or `0`
- `veilfarers_dice_volume`: decimal `0–1`

The optional 3D library contains a non-configurable audio path. `assets/nc93322.mp3` is intentionally silent so only the VeilFarers Web Audio layer is audible and controllable.

## Optional 3D dice

Settings key:

```text
veilfarers_dice_mode = 2d | 3d
```

The renderer is dynamically loaded in this order:

1. jsDelivr pinned reference `617f212`
2. jsDelivr `main` fallback

Files:

- `libs/three.min.js`
- `libs/cannon.min.js`
- `libs/teal.js`
- `dice.js`

VeilFarers resolves the roll first and passes those exact values through the renderer's `before_roll` callback. The 3D layer is presentation only and cannot change game results.

Fallback conditions:

- CDN unavailable
- unsupported die size
- more than 20 dice
- renderer error or timeout

All fallbacks complete the original 2D roll.

License and attribution are available in Settings, the 3D overlay, and `THIRD_PARTY_NOTICES.md`.

## New localStorage keys

```text
veilfarers_callout_scale
veilfarers_dice_sound
veilfarers_dice_volume
veilfarers_dice_mode
veilfarers_player_time_travel_v1
```

## Firestore

No schema migration is required.

New events add optional:

```text
actorId
characterId
damageDiceResults
```

Legacy events without these fields remain readable.

## Operational verification required on Netlify

1. Two-browser Railgun KEEP/DROP synchronization.
2. Reliable and Trait modifier totals.
3. Six-character callout layout at multiple viewport sizes.
4. Local time travel while disconnected and connected.
5. Sound control after browser autoplay policies.
6. 3D CDN loading, desired-result matching, skip, timeout, and offline fallback.
7. Firebase rapid-roll behavior from several devices.

## Rollback

Deploy v59.13. No database rollback or localStorage migration is required. New local settings and snapshots can remain unused safely.
