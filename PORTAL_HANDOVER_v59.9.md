# VeilFarers Portal v59.9 — Technical Handover

## Release purpose

v59.9 converts Player Tool weapon and character-feature presentation into an operational rules interface using the normalized 11.1 RC2 data layer.

It replaces v59.8.

## Primary files changed

### `player-tool.html`

Added:

- Persistent `weaponArsenal` character field.
- Multi-weapon equipment state.
- Active weapon selection.
- Weapon Loadout modal.
- Search across the canonical weapon catalogue.
- Custom weapon creation.
- Canonical feature resolution through `features-registry.json`.
- Compact operational feature cards.
- Feature action/resource execution.
- Weapon attack and damage breakdowns.
- Weapon-effect instructions in callouts and history.
- Active Massive Evasion modifier.

### `shared-data.js`

Added the `featureRegistry` collection:

```js
featureRegistry: ['features-registry.json']
```

### `canonical-runtime.js`

Loads and exposes `featureRegistry` through `VF_CANONICAL_DATA`.

### `veilfarers-import.js`

Both legacy and current Creator imports now provide:

```js
weaponInventory
weaponArsenal
activeWeaponId
```

Existing weapons are hydrated against canonical IDs where possible.

### `data/changelog.json`

Current version updated to `v59.9` and release entry added.

### `feedback.html`

Visible portal build reference updated to `v59.9`.

## Character weapon schema

Player Tool character records now use:

```js
{
  weapons: [],          // currently equipped hydrated weapon objects
  weaponInventory: [],  // stable IDs retained for backward compatibility
  weaponArsenal: [],    // persistent hydrated arsenal objects
  activeWeaponId: ''    // stable ID/name of the active equipped weapon
}
```

`normChar()` migrates old records at runtime by combining:

1. Existing `weapons`.
2. Existing `weaponArsenal`.
3. Canonical entries resolved from `weaponInventory` IDs.

The result is deduplicated by canonical ID, local ID or name.

## Canonical weapon-feature processing

Feature resolution follows this order:

1. Match `featureRefs[].id` against `features-registry.json`.
2. Match normalized display name against the registry.
3. Fall back to `core/features.json`.
4. Fall back to the feature display text.

Each resolved feature can expose:

- Name.
- Timing.
- Trigger.
- Cost.
- Resistance.
- Parameters.
- Canonical effect text.

## Implemented mechanics

### Attack modifiers

- Reliable: `+1`.
- Accurate: `+1` for Far/Very Far weapons.
- Heavy: changes Normal to Disadvantage, or cancels Advantage to Normal, when Strength ≤ 0.

### Damage modifiers

- Massive: rolls one extra normal damage die and discards the lowest.
- Brutal: rerolls each 1 once.
- Paired: applies the highest valid listed Paired bonus when two Paired weapons are equipped.
- Sleeping Honed Edge remains included.
- Critical attacks still double normal damage dice.

### Evasion

When the active weapon has Massive:

```text
Effective Evasion = Base Evasion − 1
```

The base Evasion field remains editable and the effective value is displayed as a modifier badge.

## Roll event payload

Weapon Duality events may include:

```js
{
  weaponName,
  weaponTrait,
  weaponRange,
  weaponFeatures,
  weaponEffects,
  attackBreakdown,
  damageBase,
  damageDice,
  damageRolledDice,
  damageRolls,
  damageKeptRolls,
  damageDiscardedIndices,
  damageRerolls,
  damageRules,
  damageModifier,
  damageModifierBreakdown,
  damage,
  crit
}
```

Existing Firestore fields remain unchanged:

```text
lastRoll
rollHistory
lastRollUpdatedAt
```

No Firestore migration is required.

## Operational feature cards

`compactFeature()` converts long Creator text into:

- A detected feature title.
- Up to five concise bullets.
- Full original text behind Details.
- Parsed executable actions.

`parseFeatureRolls()` recognizes:

- Agility, Strength, Finesse, Instinct, Presence or Knowledge Rolls.
- Optional Spellcast and Reaction wording.
- `DC N` values.
- Explicit Duality Roll wording.
- Named Hope/Fear die rolls.
- Explicit standard polyhedral die rolls.
- Choice Reaction Rolls such as Agility or Strength, exposed as separate action buttons.

`parseFeatureCost()` recognizes numeric costs in:

- Hope.
- Effort.
- Resolve.
- Stress.

Stress is marked; the other resources are spent.

The subsequent Duality outcome still generates Hope/Effort or Fear through the normal Player Tool flow.

## Compatibility

- Legacy v2.41 field-based character JSON is supported.
- Current Creator draft JSON is supported.
- Older Player Tool arrays without `weaponArsenal` are migrated at render time.
- Existing Firestore session documents remain compatible.
- Older roll-history entries remain readable without new structured fields.

## Security

- Firebase configuration still comes from `/api/firebase-config`.
- No environment values are embedded in the deployment.
- Netlify Identity remains independent from anonymous Firebase table authentication.
- Keeper/Admin roles are unchanged.

## Automated validation

See `VALIDATION_v59.9.txt`.

Result:

```text
Passed: 112
Failed: 0
```

The validation environment could not navigate Chromium to localhost or file URLs because of organization policy. JSX was therefore transpiled statically and canonical combat mechanics were executed in an isolated JavaScript VM. Live interaction remains a Deploy Preview requirement.

## Required live tests

1. Import both a current Creator draft and a legacy character JSON.
2. Add, equip, unequip and activate several weapons.
3. Reload and verify persistence.
4. Broadcast Railgun, Reliable and Knockdown attacks across multiple browsers.
5. Confirm discarded/rerolled dice render correctly in callouts and history.
6. Test feature buttons with Hope, Effort, Resolve and Stress costs.
7. Verify effective Evasion changes when Massive becomes active/inactive.
8. Test responsive Loadout and feature cards.
9. Regression-test Netlify Identity, Firebase, Feedback and downloads.
