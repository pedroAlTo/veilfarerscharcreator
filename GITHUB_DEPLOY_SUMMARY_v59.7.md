# PR title

Replace current deploy with VeilFarers Portal v59.7

## Suggested branch

`release/portal-v59.7-navigation-cohesion`

## Summary

This branch replaces the current VeilFarers deployment with **Portal v59.7**.

The release removes duplicate site navigation from the digital Character Sheet, simplifies the sheet toolbar, restores the fillable physical Character Sheet to Downloads, and applies a more coherent shared visual system across portal sections.

## Main changes

### One canonical navigation

- `portal.js` is now the only site-level navigation layer.
- Removed the obsolete Character Sheet header containing separate Player Tool and Keeper Companion links.
- Player Tool and Keeper Tool continue to use the same canonical portal navigation.
- Functional character/session controls inside Player Tool remain unchanged.

### Simplified digital Character Sheet

Visible controls are now limited to sheet-specific actions:

- Guided Fill
- Random Character
- Reset
- View and zoom
- JSON load and save
- Visual PDF export
- Editable and print-ready physical PDF export
- Sleeping / Awakened path switch
- Sync Draft

The following controls remain implemented but are hidden for possible future use:

- Embedded Creator button
- Setup / Play Mode
- Sheet-local Downloads and Feedback buttons
- Sheet-local Account and Online Vault controls

Authentication remains available from the canonical portal navigation.

### Clearer Creator integration

- Renamed `Creator Draft` to `Sync Draft`.
- Sync Draft imports the current canonical RC2 Character Creator draft into the complete digital Character Sheet.
- Guided Fill now directs new users to Character Creator through the main portal navigation.

### Fillable Character Sheet restored to Downloads

Downloads now includes:

- VeilFarers Corebook 11.1 RC2
- Keeper's Companion 11.1 RC2
- Rust & Steel 11.1 RC2
- Alien Species 11.1 RC2
- VeilFarers Fillable Character Sheet

The retained physical Character Sheet PDF has:

- 2 editable pages
- 186 fillable form fields
- 193 annotations

### Cross-module visual cohesion

- Unified navigation surface, border, active state and spacing.
- More consistent page headers, panels, fields and action transitions.
- Character Sheet toolbar aligned with the portal dark/gold visual system.
- Reduced toolbar density and clearer task grouping.
- Removed obsolete layout space created by the secondary navigation.

### Existing functionality retained

This release preserves:

- Canonical 11.1 RC2 shared rules data.
- Character Creator and integrated Card Library.
- Complete multi-face Character Sheet.
- Visual, editable and print-ready PDF exports.
- Player/Keeper real-time Firebase sessions.
- Roll callouts and detailed damage history.
- Netlify Identity login, roles and character vault.
- Direct feedback and structured playtest questionnaires.

## Infrastructure

- **Netlify** for hosting and Functions.
- **Netlify Identity** for accounts, roles and character vault access.
- **Firebase Authentication and Firestore** for anonymous real-time table sessions.
- Firebase configuration loaded at runtime through `/api/firebase-config`.
- Firebase environment values remain stored in Netlify.
- No Firebase credentials are committed to the repository.

## Validation performed

- JSON integrity checks.
- JavaScript syntax checks for external and non-Babel inline scripts.
- HTML title and local dependency checks.
- Canonical navigation checks across all portal modules.
- Character Sheet hidden/reserved control checks.
- Sync Draft integration check.
- Fillable PDF file, page and form-field inspection.
- Roll broadcast and damage-history regression checks.
- Changelog and build-version checks.
- Embedded Firebase credential scan.

Validation result:

```text
Passed: 148
Failed: 0
```

## Post-deployment checklist

- [ ] Confirm Character Sheet displays the canonical portal navigation only once.
- [ ] Confirm Creator, Mode, Downloads/Feedback and Account groups are not visible in the sheet toolbar.
- [ ] Confirm Sync Draft imports the current Creator character.
- [ ] Confirm Guided Fill, Random Character and Reset still work.
- [ ] Confirm JSON load/save still works.
- [ ] Confirm Both Sides and Current Side visual PDF exports work.
- [ ] Confirm Editable and Print PDF exports work.
- [ ] Confirm the fillable physical Character Sheet appears in Downloads.
- [ ] Confirm the downloaded physical sheet remains editable.
- [ ] Confirm Netlify Identity status appears in the canonical navigation.
- [ ] Confirm Player Tool and Keeper Tool use the same navigation.
- [ ] Confirm Firebase roll callouts and damage history remain operational.
- [ ] Test Character Sheet toolbar wrapping on desktop, tablet and mobile.

## Known pending work

- Complete the canonical Level Up engine.
- Continue consolidating character persistence around one shared schema.
- Replace remaining transitional Character Sheet compatibility data with direct canonical data consumption.
- Complete end-to-end production browser testing on Netlify.
