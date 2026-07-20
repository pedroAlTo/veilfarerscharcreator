# Replace current deploy with VeilFarers Portal v59.16

## Summary

This branch rebuilds the portal from the exact **v59.15 Firestore-safe deployment**, restores the Player Tool features that were lost in the previous merge, replaces the experimental 3D renderer with the official **@3d-dice** stack, and publishes the corrected **Corebook 11.1 RC3.1** layout package.

The canonical rules release remains **11.1 RC3**. RC3.1 is a Corebook layout/navigation revision, not a rules-data revision.

## Player Tool

### Weapon attacks

- Restored the weapon Trait modifier in attack totals and modifier breakdowns.
- Retained operational handling for:
  - Reliable: +1 attack.
  - Accurate: range-dependent attack bonus.
  - Heavy: Disadvantage when its requirement is not met.
  - Massive: roll one additional damage die and discard the lowest.
  - Brutal: reroll damage results of 1 once.
  - Paired: apply the active paired-loadout bonus.
- Massive/Railgun results retain structured `KEEP` and `DROP` states in local history and Firebase callouts.
- The discarded die is greyed and struck through; the retained die remains highlighted.
- Railgun remains a Player Tool playtest case at `d8+3 physical · Massive`. No book or canonical weapon-data change was made by this branch.

### 3D dice

- Replaced the previous renderer with bundled `@3d-dice/dice-box` 1.1.4.
- Added the `DisplayResults` addon from `@3d-dice/dice-ui` 0.5.2.
- Added VeilFarers themes:
  - Hope: yellow body, black numerals.
  - Fear: purple body, black numerals.
  - Damage: red body, white numerals.
  - Neutral/Resolve: cyan-steel body, white numerals.
- Added subtle circuit-style normal and specular maps without reducing numeral contrast.
- 3D rolls use the physical result returned by Dice Box as the actual roll value.
- DisplayResults shows totals, modifiers, kept dice and dropped dice.
- All renderer assets are bundled locally; no CDN is required for the 3D module.
- Added visible attribution and complete MIT notices.

### Retained v59.14/v59.15 functionality

- Recursive Firestore undefined-value sanitization.
- `ignoreUndefinedProperties` Firestore configuration.
- Normalized table names and awaited initial table write.
- Time Travel snapshots in Roll History.
- Up to six simultaneous callout windows, one per character/player.
- Callout scaling from 50% to 150%.
- Local dice-roll sound.
- Custom volume and mute controls.
- Multi-weapon arsenal and active-weapon selection.
- Collapsible feature, Sleeper Action and Resolve Move panels.

## Corebook 11.1 RC3.1

- Rebuilt the Corebook from the RC3 editable source.
- Reduced meaningful body and table typography by exactly one point.
- Restored the alternating editorial background system:
  - Player/general background on normal chapters.
  - Awakened background on pages 47-68.
  - Sleeping background on pages 69-91.
- Recalculated the Contents page numbers after typography reflow.
- Rebuilt the PDF navigation tree from 797 `VFANCHOR` entries.
- Final result: 234 Letter-size pages.
- Preserved searchable text.
- Updated Downloads to the RC3.1 Corebook filename and byte size.
- Keeper's Companion, Rust & Steel, Alien Species and the fillable character sheet are unchanged.

## Source deliverables

The release includes separate deliverables for:

- Corebook RC3.1 PDF.
- Editable DOCX.
- Complete source Markdown.
- Chapter-by-chapter source Markdown ZIP.
- Full source package with background masters and the approved Soldier/Vanguard review draft.

## Infrastructure

- Netlify hosting and Functions remain unchanged.
- Netlify Identity remains responsible for accounts and roles.
- Firebase Authentication and Firestore remain responsible for real-time sessions.
- Firebase config continues to load from `/api/firebase-config`.
- No Firebase key is embedded in the repository.

## Validation

Automated validation result:

```text
Passed: 103
Failed: 0
```

Validated areas include JSON integrity, local asset dependencies, Player Tool TSX syntax, 3D module syntax, v59.15 Firestore safeguards, Trait/weapon-feature markers, six callouts, Time Travel, sound controls, theme colours and numeral textures, unchanged canonical weapon files, PDF page count, 797 bookmarks, recalculated Contents entries, font-size reduction, complete PDF render coverage, unchanged companion PDFs and secret scanning.

## Deploy Preview checklist

- [ ] Connect two browsers to the same Firebase table.
- [ ] Confirm v59.15 Firestore undefined-value protection with a legacy/custom character.
- [ ] Roll a Trait-based Reliable weapon and confirm both modifiers.
- [ ] Roll Railgun/Massive and confirm the lower damage die is marked `DROP` in 3D results, callout and history.
- [ ] Confirm Hope, Fear and Damage dice use the specified colours and numeral contrast.
- [ ] Confirm the DisplayResults total matches the callout and history.
- [ ] Test 2D/3D switching and 3D fallback.
- [ ] Test sound, mute and volume controls.
- [ ] Produce simultaneous callouts from six different characters.
- [ ] Restore a previous character state through Time Travel.
- [ ] Open the Corebook Contents links and PDF bookmark tree.
- [ ] Inspect Player, Awakened and Sleeping background transitions.
- [ ] Confirm all Downloads links.

## Suggested branch

```text
release/portal-v59.16-official-3d-dice-corebook-rc3.1
```
