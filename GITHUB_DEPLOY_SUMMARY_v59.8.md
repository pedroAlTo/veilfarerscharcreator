# PR title

**Replace current deploy with VeilFarers Portal v59.8**

## Suggested branch

`release/portal-v59.8-guided-creator-flow`

## Summary

This branch replaces the current VeilFarers deployment with **Portal v59.8**.

The release restores the missing Player Tool background assets and improves the Character Creator flow so progression controls and required dependent choices remain visible without forcing users to scroll through the page.

The canonical rules version remains **VeilFarers 11.1 RC2 draft 6**.

## Main changes

### Player Tool backgrounds

- Restored the two background files referenced by Player Tool:
  - `assets/bg-spacestation.webp`
  - `assets/bg-panels.webp`
- Preserved the existing Settings control and local background preference.
- No Player Tool state migration is required.

### Fixed Character Creator navigation

- Added a persistent VeilFarers Back/Next dock fixed to the lower-right corner.
- The dock remains available across all nine creation steps.
- Next is disabled until the active step is complete.
- Step-specific labels and completion hints update automatically.
- Hidden the old duplicated per-section navigation controls from the active workflow.

### Dependent choices in the current viewport

- Selecting **Ailuran** opens its two Sub-Strain choices in a custom in-app overlay.
- Clicking outside the overlay cancels Ailuran selection.
- Selecting a Sub-Strain confirms the ancestry and enables Next.
- Selecting a class opens its subclass options in the same type of overlay.
- Clicking outside the subclass overlay clears the class and subclass selection.
- The legacy inline Sub-Strain and subclass mounts remain available for compatibility but no longer create a scroll-dependent workflow.

### Trait assignment redesign

The canonical fixed array remains `+2, +1, +1, +0, +0, -1`.

The new assignment board supports:

- Value-first assignment.
- Trait-first assignment.
- Direct swapping between assigned traits.
- Drag-and-drop assignment.
- Assignment progress.
- Clear-all action.
- Existing Spellcast Trait highlighting.

### Three starting Experiences

- Increased starting Experiences from two to three.
- Added the third Experience to:
  - Creator state.
  - Local draft persistence.
  - JSON save and load.
  - Older-draft migration.
  - Step validation.
  - Generated Creator character sheet.
- Older two-Experience drafts load safely and receive an empty third slot.

## Infrastructure

The deployment architecture is unchanged:

- **Netlify** for hosting and Functions.
- **Netlify Identity** for accounts, roles, and character vault access.
- **Firebase Authentication and Firestore** for real-time Player/Keeper sessions.
- Firebase configuration loaded at runtime from `/api/firebase-config`.
- No credentials are committed to the repository.

## Validation

Automated result:

```text
Passed: 100
Failed: 0
```

Validation covers:

- JSON and JavaScript syntax.
- Local asset and dependency resolution.
- Presence and integrity of both Player Tool backgrounds.
- Fixed creator dock structure.
- Ailuran and subclass overlay behavior.
- Backdrop cancellation behavior.
- Trait assignment and swapping.
- Three-Experience validation and persistence structure.
- Build/changelog references.
- Embedded credential scans.
- Headless Chromium interaction tests.

## Post-deployment checklist

- [ ] Select both Player Tool backgrounds in Settings.
- [ ] Confirm the selected background persists after reload.
- [ ] Select Ailuran and verify its two Sub-Strain options open immediately.
- [ ] Cancel the Ailuran overlay by clicking outside it.
- [ ] Complete an Ailuran Sub-Strain and confirm Next activates.
- [ ] Select Awakened or Sleeping, choose a class, and confirm subclass options open without scrolling.
- [ ] Test value-first and trait-first assignment.
- [ ] Swap two assigned trait values.
- [ ] Enter, save, reload, and display three Experiences.
- [ ] Verify the generated character sheet contains all three Experiences.
- [ ] Regression-test Netlify Identity and role access.
- [ ] Regression-test Firebase Player/Keeper synchronization and roll callouts.
- [ ] Regression-test feedback forms and PDF exports.

## Known pending work

- Complete the canonical Level Up progression engine.
- Continue consolidating the character schema across Creator, Character Sheet, Player Tool, and inventories.
- Continue replacing remaining legacy browser-native dialogs in older tools with VeilFarers UI components.
- Complete end-to-end testing on the production Netlify environment.
