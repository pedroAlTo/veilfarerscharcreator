# Replace current deploy with VeilFarers Portal v59.9

## Summary

This branch replaces the current VeilFarers deployment with **Portal v59.9**.

The release turns Player Tool into an operational combat sheet rather than a passive character display. Characters can maintain a persistent weapon arsenal, equip and switch several weapons, resolve canonical weapon features automatically, and use compact ancestry, class, community and path features directly from the sheet.

The canonical rules source remains **VeilFarers 11.1 RC2 draft 6**.

## Main changes

### Multi-weapon loadout

- Added a persistent weapon arsenal to every Player Tool character.
- Added a dedicated **Weapon Loadout** panel.
- Players may equip multiple weapons simultaneously.
- One equipped weapon can be marked as the active weapon.
- Clicking an equipped weapon on the sheet changes the active weapon.
- The loadout panel can search all **211 canonical RC2 weapons** by:
  - Name
  - Trait
  - Range
  - Damage
  - Feature
  - Weapon family
- Custom weapons can be created through the same in-app panel.
- Equipped and arsenal weapons persist in local Player Tool saves and JSON exports.
- Legacy and RC2 Character Creator imports automatically convert equipped weapons into arsenal entries.

### Weapon traits and attack resolution

Player Tool now derives each attack from the active weapon and character traits.

Implemented canonical mechanics include:

- **Reliable:** +1 on attacks with the weapon.
- **Accurate:** +1 on attacks made at Far or Very Far range.
- **Heavy:** Disadvantage when the wielder has Strength 0 or lower.
- **Massive:** roll one additional normal damage die and discard the lowest result.
- **Massive:** apply the canonical −1 Evasion while that weapon is active.
- **Brutal:** reroll each damage die showing 1 once and keep the new result.
- **Paired:** add the listed Paired damage bonus when two Paired weapons are equipped.

The attack control shows:

- Weapon trait and current trait modifier.
- Range.
- Damage expression.
- Applied attack bonuses.
- Canonical feature chips.
- Full effect descriptions for the active weapon.

### Special weapon effects

Canonical feature definitions are now loaded from:

```text
/rules-data/features-registry.json
```

Effects that are not fully automated are displayed as operational instructions. This includes:

- Trigger or timing.
- Resistance trait.
- Feature DC requirement.
- Result of a failed resistance roll.

For example, Knockdown displays the required Agility or Strength Reaction Roll against the weapon’s Feature DC and indicates that failure causes Prone.

### Damage roll detail

Weapon attacks now retain and broadcast:

- Original damage expression.
- Effective damage expression.
- Every die rolled.
- Dice kept.
- Dice discarded by Massive.
- Dice rerolled by Brutal.
- Weapon modifier.
- Honed Edge modifier.
- Paired modifier.
- Final damage total.
- Critical status.
- Canonical weapon effects.

This information appears in both:

- The table-wide real-time roll callout.
- Player Tool Roll History.

### Operational character features

The previous long text block has been replaced by compact cards for:

- Ancestry Gift.
- Class Feature.
- Community Feature.
- Hope or Effort Feature.

Each card provides:

- A short title.
- Schematic effect bullets.
- Optional full details.
- Action buttons when an explicit trait roll, Spellcast Roll or Duality Roll is present.
- Parsed DC values.
- Parsed Hope, Effort, Resolve or Stress costs.

Using a feature action updates the resource track and then resolves the normal roll outcome, including Hope/Effort generation and Fear generation.

### Character compatibility

- Existing v2.41 character JSON remains supported.
- Ancestry, class and community features remain preserved.
- Imported characters receive three Experience slots.
- Existing equipped weapons are migrated into the persistent arsenal.
- Current Character Creator drafts use the same arsenal structure.

### Canonical data layer

The shared canonical runtime now also loads the feature registry.

Current data includes:

- 147 powers.
- 211 weapons.
- 42 armor entries.
- 116 items.
- 80 augmentations.
- 128 normalized feature definitions.

## Infrastructure

The deployment architecture remains unchanged:

- **Netlify** for hosting and Functions.
- **Netlify Identity** for login, roles and character vault access.
- **Firebase Authentication and Firestore** for anonymous real-time Player/Keeper sessions.
- Firebase configuration delivered at runtime through `/api/firebase-config`.
- Firebase values stored only in Netlify environment variables.
- No Firebase API keys committed to the repository.

## Required Netlify configuration

Before promoting this branch to production, confirm:

- Netlify Identity is enabled.
- Administrator users have the `admin` role.
- Keeper users have the `keeper` or `admin` role.
- Firebase environment variables are configured.
- `/api/firebase-config` deploys successfully.
- Firebase anonymous authentication is enabled.
- Firestore rules support the intended table-session workflow.
- Netlify Forms detects the Feedback form.

## Validation performed

- JSON integrity checks.
- JavaScript syntax checks.
- Player Tool TSX/JSX transpilation with TypeScript 5.8.
- Local asset and dependency checks.
- Canonical weapon and feature-registry counts.
- Isolated execution of canonical attack mechanics.
- Railgun Massive regression test.
- Reliable attack modifier regression test.
- Knockdown Reaction Roll / Feature DC regression test.
- Feature roll and Effort-cost parsing.
- Legacy character import and weapon-arsenal migration.
- Changelog and build-version consistency.
- Hardcoded Firebase credential scans.

Validation result:

```text
Passed: 112
Failed: 0
```

## Post-deployment checklist

- [ ] Import an existing character JSON and confirm all equipped weapons appear in Loadout.
- [ ] Equip more than two weapons and switch the active weapon.
- [ ] Reload Player Tool and verify arsenal, equipped weapons and active weapon persist.
- [ ] Attack with Railgun and confirm two d8 are rolled and the lowest is discarded.
- [ ] Confirm an active Massive weapon reduces displayed effective Evasion by 1.
- [ ] Attack with Slug Pistol or another Reliable weapon and confirm the +1 attack breakdown.
- [ ] Attack with a Knockdown weapon and verify the Reaction Roll / Feature DC instruction.
- [ ] Confirm weapon dice, modifiers and effects appear in Roll History.
- [ ] Connect two Player Tools and one Keeper Tool to the same Firebase table.
- [ ] Confirm the full weapon result appears in every real-time callout.
- [ ] Execute an available ancestry, class, community or path action button.
- [ ] Confirm its resource cost and subsequent Hope/Effort/Fear result.
- [ ] Test the Loadout panel and feature cards on mobile.
- [ ] Regression-test Identity, Feedback, Downloads and PDF generation.

## Known pending work

- Extend automatic handling to additional conditional equipment interactions where the character’s armor or other gear changes a weapon feature.
- Define an explicit canonical state model for limited-use weapon charges and once-per-scene effects.
- Complete the canonical Level Up progression engine.
- Finish the unified character schema across Creator, Character Sheet, Player Tool and inventories.
- Complete full end-to-end production browser testing.
