# VeilFarers Portal v59.7 - Navigation and Character Sheet cohesion

## Purpose

v59.7 reduces duplicate interface layers and establishes the portal navigation injected by `portal.js` as the only site-level navigation. It also restores the fillable physical character sheet to Downloads and simplifies the digital Character Sheet toolbar without deleting potentially reusable functionality.

## Character Sheet changes

### Removed visible duplicate navigation

The hardcoded top strip containing direct `Player Tool` and `Keeper Companion` links was removed from `charsheet.html`. The Character Sheet now relies exclusively on the canonical portal navigation.

### Simplified visible toolbar

The following controls remain visible:

- Guided Fill
- Random Character
- Reset
- Fit Width / Fit Height / Zoom
- JSON Load / Save
- Visual PDF: Both Sides / Current Side
- Sheet PDF: Editable / Print PDF
- Sleeping / Awakened path switch
- Sync Draft

The following controls are retained in the DOM but hidden with `hidden` and `data-vf-reserved-control` attributes:

- Embedded Creator button
- Setup / Play Mode section
- Downloads and Feedback section
- Character Sheet Account and Online Vault section

This allows later reactivation without restoring obsolete visible duplication.

### Creator synchronization terminology

`sheet-bridge.js` now labels the Character Creator import action as `Sync Draft`, clarifying that it synchronizes data rather than opening a second creator interface.

The first Guided Fill step now points to Character Creator in the canonical portal navigation and instructs the user to return to the sheet and use Sync Draft.

## Downloads changes

The existing file `/download/veilfarers_charsheet_fillable.pdf` is now listed in both download manifests:

- `/download/downloads.json`
- `/rules-data/downloads.json`

The PDF was inspected and contains:

- 2 pages
- 186 fillable form fields
- 193 annotations
- Embedded fonts

The Downloads renderer now supports item-specific descriptions and download button labels.

## Cohesion layer

### `portal.css`

- Stronger shared navigation surface and shadow.
- Consistent minimum navigation control height.
- More coherent active-state treatment.

### `module.css`

- Shared section rhythm and header separation.
- Consistent focus and transition behavior for fields and actions.
- Unified page top spacing.

### `charsheet.html`

- Character Sheet toolbar uses the same dark/gold surface system.
- Reduced number of visible toolbar groups.
- Consistent panel borders and spacing.
- Removed obsolete top spacer associated with the secondary navigation.

## Infrastructure preserved

- Netlify hosting and Functions.
- Netlify Identity accounts, roles and vault.
- Firebase anonymous authentication and Firestore real-time sessions.
- Runtime Firebase configuration through `/api/firebase-config`.
- No Firebase credentials embedded in the deployment.

## Files changed

- `charsheet.html`
- `sheet-bridge.js`
- `portal.css`
- `module.css`
- `downloads.html`
- `downloads.js`
- `download/downloads.json`
- `rules-data/downloads.json`
- `feedback.html`
- `data/changelog.json`
- `START_HERE.txt`

## Deployment verification

On the Netlify Deploy Preview, verify:

1. Character Sheet shows only one site navigation.
2. Hidden/reserved toolbar controls do not occupy space.
3. Sync Draft imports a current Creator character.
4. Existing JSON and PDF export functions remain operational.
5. The fillable Character Sheet downloads correctly and remains editable.
6. Canonical login status works from the portal navigation.
7. Player Tool and Keeper Tool real-time roll broadcasts remain unaffected.
8. Desktop, tablet and mobile toolbar wrapping remains coherent.
