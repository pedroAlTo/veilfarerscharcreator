# VeilFarers Portal v59.8 — Guided Creator Flow and Player Backgrounds

## Purpose

v59.8 fixes the missing Player Tool background assets and restructures the Character Creator so required follow-up choices and progression controls remain inside the current viewport.

This build replaces v59.7. The canonical rules baseline remains **11.1 RC2 draft 6**.

## Files changed

- `index.html`
  - Added the fixed Back/Next creator dock.
  - Added the custom dependent-choice overlay.
  - Moved Ailuran Sub-Strain and class Subclass decisions into that overlay.
  - Redesigned trait assignment.
  - Expanded starting Experiences from two to three.
  - Added migration logic for older two-Experience drafts.
- `assets/bg-spacestation.webp`
- `assets/bg-panels.webp`
  - Restored from the original Player Tool deployment.
- `data/changelog.json`
  - Added v59.8 and updated the current version.
- `feedback.html`
  - Updated the displayed portal build.
- `START_HERE.txt`
  - Updated deployment and validation guidance.

## Character Creator flow

### Fixed progression dock

A single custom dock is fixed to the lower-right corner during steps 1–9. It contains:

- Back.
- Current step and completion hint.
- Next or Generate Character Sheet.

`Next` is disabled until the current step satisfies its canonical requirements. The old per-section navigation rows remain in the source for compatibility but are hidden from the active creator workflow.

### Ailuran selection

Selecting Ailuran opens the two Sub-Strain options in a custom VeilFarers overlay. The ancestry is not considered complete until one is selected.

- Selecting a Sub-Strain confirms Ailuran and unlocks Next.
- Clicking the overlay backdrop or close button cancels Ailuran and returns to ancestry selection.

### Class and subclass selection

The user first selects Awakened or Sleeping. Selecting a class then opens its subclass options in the same viewport-level overlay.

- Selecting a subclass confirms the class choice.
- Cancelling the overlay clears both class and subclass.
- The legacy inline subclass area stays hidden so the user does not need to scroll to find the dependent options.

## Trait assignment

The fixed array remains:

`+2, +1, +1, +0, +0, -1`

The interface now supports:

1. Select a value and then a trait.
2. Select a trait and then a value.
3. Select two assigned traits to swap their values.
4. Drag an available value onto a trait.
5. Clear all assignments.
6. See live completion progress.

The Spellcast Trait remains visually marked.

## Experiences

Starting characters now require **three Experiences**, each at `+2`.

Compatibility behavior:

- New drafts initialize with three empty Experience slots.
- Older two-Experience drafts are padded with a third empty slot on load.
- JSON export includes all three values.
- The generated Creator character sheet displays all three.
- Step 5 cannot continue until all three are completed.

No destructive migration is required.

## Player Tool backgrounds

The Player Tool already referenced:

- `assets/bg-spacestation.webp`
- `assets/bg-panels.webp`

Those files were absent from the consolidated v59.7 package. They are now present at the expected relative paths, so the existing Settings selector and `veilfarers_bg` local preference work without code changes.

## Infrastructure

No infrastructure or schema changes were made to:

- Netlify hosting or Functions.
- Netlify Identity or roles.
- Firebase anonymous authentication.
- Firestore table documents.
- `/api/firebase-config`.

## Validation result

`Passed: 100`  
`Failed: 0`

Validation includes static dependency checks and headless Chromium interaction tests for the new Creator flow.

## Deploy Preview checklist

1. Open Player Tool Settings and select both backgrounds.
2. Select Ailuran, cancel via the backdrop, and then complete a Sub-Strain.
3. Select a path and class and confirm the subclass overlay opens without scrolling.
4. Complete traits using value-first, trait-first, and swap interactions.
5. Enter three Experiences, save JSON, reload, and verify all three.
6. Generate the Creator character sheet and verify all three Experiences appear.
7. Regression-test Netlify Identity, Firebase sessions, roll callouts, feedback forms, and PDF exports.
