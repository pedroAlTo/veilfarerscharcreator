# Replace current deploy with VeilFarers Portal v59.10

## Summary

This branch replaces the current VeilFarers deployment with **Portal v59.10**.

The release corrects the Player Tool resource model so that every ability with a **Hope cost can alternatively be activated with the same amount of Effort**. The selected resource is deducted correctly and is included in the local history and Firebase table-wide callout.

## Main changes

### Hope or Effort ability payments

- Hope-cost actions now provide two explicit activation options:
  - Spend Hope.
  - Spend the same amount of Effort.
- The rule applies to executable actions generated from:
  - Ancestry Gifts.
  - Class Features.
  - Community Features.
  - Hope Features.
- Each payment button checks its own resource track.
- A player can still use an ability when one resource is insufficient but the alternative resource is available.
- Effort, Resolve, and Stress costs that are not Hope alternatives remain unchanged.

### Domain Cards

- Removed the hardcoded Hope-only whole-card activation.
- Hope-cost Domain Cards now display separate **Use Hope** and **Use Effort** buttons.
- The canonical numeric cost is unchanged.
- Zero-cost cards display a single Roll action.

### Roll history and real-time callouts

- Added the selected payment to the roll event as `resourceCost`.
- Local Roll History displays whether Hope or Effort was spent.
- Firebase callouts display the selected resource to every connected player.
- Existing Firestore session documents and older roll-history entries remain compatible.

## Retained v59.9 functionality

- Persistent multi-weapon arsenal and active-weapon switching.
- Reliable, Accurate, Heavy, Massive, Brutal, and Paired weapon automation.
- Structured damage dice, modifiers, discarded dice, and special-effect notes.
- Compact executable Ancestry, Class, Community, and path-feature cards.
- Canonical VeilFarers 11.1 RC2 data.
- Netlify Identity accounts and role gates.
- Firebase Player/Keeper real-time sessions.
- Unified portal navigation.
- Character Creator, full digital Character Sheet, PDF exports, Downloads, Feedback questionnaires, Armory, and Item Inventory.

## Infrastructure

No infrastructure changes are required.

- **Netlify** hosts the portal and Functions.
- **Netlify Identity** manages accounts, roles, and character vault access.
- **Firebase Authentication and Firestore** manage anonymous real-time sessions.
- Firebase configuration continues to load through `/api/firebase-config`.
- Firebase environment values remain stored in Netlify.
- No Firebase credentials are committed to the repository.

## Validation performed

- JSON integrity checks.
- Player Tool TSX syntax compilation.
- Hope-cost parser behavior using Chrono-Gift as a regression case.
- Hope and Effort payment-option generation.
- Character-feature payment rendering.
- Domain Card Hope/Effort controls.
- Resource deduction wiring.
- Roll-event payment metadata.
- Local history payment indicator.
- Real-time callout payment indicator.
- Canonical dataset counts.
- Local asset dependency checks.
- Embedded Firebase-key scan.

Validation result:

```text
Passed: 25
Failed: 0
```

## Required Deploy Preview checks

- [ ] Import a character with a Hope-cost Ancestry Gift.
- [ ] Confirm both Hope and Effort action buttons appear.
- [ ] Activate the ability with Hope and confirm Hope decreases.
- [ ] Activate the same ability with Effort and confirm Effort decreases.
- [ ] Confirm insufficient-resource buttons disable independently.
- [ ] Repeat the test with a Hope-cost Class Feature.
- [ ] Repeat the test with a Hope-cost Community Feature where available.
- [ ] Activate a Domain Card with Hope.
- [ ] Activate the same Domain Card with Effort.
- [ ] Confirm the chosen resource appears in Roll History.
- [ ] Confirm the chosen resource appears in another connected Player Tool callout.
- [ ] Confirm older Firestore history entries still render.
- [ ] Re-test Player/Keeper synchronization in separate browsers.

## Known pending work

- Complete the canonical Level Up progression engine.
- Continue converting descriptive features into structured executable rules.
- Extend automation to additional weapon and character-feature edge cases.
- Complete end-to-end production testing across Netlify Identity, Firebase, and browser PDF generation.
