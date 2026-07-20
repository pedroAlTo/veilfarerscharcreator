# Replace current deploy with VeilFarers Portal v59.17

## Summary

This branch replaces Portal v59.16 with a focused production hotfix for two regressions in Player Tool:

1. Connecting to a Firebase table failed with `normalizeSessionKey is not defined`.
2. The bundled official 3D dice renderer could not load its assets or return readable dice values reliably.

No book, PDF, canon-rule, weapon-catalogue, or Character Creator content has changed in this release.

## Fixes

### Firebase table connection

- Restored the missing `normalizeSessionKey` helper that was present in v59.15 but lost during the v59.16 merge.
- The helper is defined before every connection, history-clear, shared-roll, and autosave call.
- Empty or whitespace-only table names normalize to `Table`.
- Existing recursive Firestore undefined-value sanitization remains unchanged.

### Official 3D dice integration

- Corrected Dice Box asset resolution by deriving an absolute asset URL from `import.meta.url`.
- Updated initialization to the Dice Box v1.1 config-object API.
- Uses the stable onscreen renderer (`offscreen: false`) for broader browser compatibility.
- Added a short readiness wait so selecting 3D and rolling immediately does not silently fall back before the module finishes loading.
- Hardened result parsing for both:
  - flat arrays of individual die results;
  - grouped roll-result objects.
- Added a diagnostic `VFDice3D.status()` method for Deploy Preview troubleshooting.

### Dice themes

- Corrected custom theme configuration to use the official color-material texture structure.
- Confirmed render output:
  - Hope: yellow with black numerals.
  - Fear: purple with black numerals.
  - Damage: red with white numerals.
  - Neutral/Resolve: cyan-blue with white numerals.
- Existing low-intensity technological normal and specular textures are retained.
- DisplayResults remains enabled for totals, modifiers, roles, kept dice, dropped dice, and rerolls.

## Retained functionality

- Railgun Player Tool-only `d8+3 physical · Massive` playtest override.
- Weapon Trait modifiers.
- Reliable, Accurate, Heavy, Massive, Brutal, and Paired resolution.
- Kept and dropped dice presentation in history and callouts.
- Six simultaneous per-character callouts.
- Callout scaling from 50% to 150%.
- Local Time Travel snapshots.
- Dice sound, volume, and mute controls.
- Netlify Identity, Firebase anonymous authentication, and Firestore session architecture.
- Corebook 11.1 RC3.1, companion PDFs, and fillable character sheet without byte changes.

## Validation

Automated validation result:

```text
Passed: 94
Failed: 0
```

Validation includes:

- all JSON files;
- JavaScript module syntax;
- `normalizeSessionKey` definition and ordering;
- Firestore undefined-value safeguards;
- Dice Box v1.1 initialization;
- real Chromium WebGL2 rendering through software WebGL;
- Hope/Fear role and color rendering;
- Damage color rendering;
- DisplayResults integration;
- theme schema structure;
- unchanged PDFs and canonical weapon JSON;
- Firebase credential scan.

## Netlify configuration

No configuration changes are required. Confirm that production still has:

- Netlify Identity enabled;
- Firebase environment variables configured;
- `/api/firebase-config` deployed;
- Firebase anonymous authentication enabled;
- Firestore rules allowing the intended table workflow.

## Post-deployment checklist

- [ ] Connect Player Tool to a new table.
- [ ] Connect to an existing table containing characters and roll history.
- [ ] Confirm Player Tool autosave succeeds after editing a character.
- [ ] Select 3D mode and roll Hope/Fear Duality dice.
- [ ] Confirm Hope is yellow with black numerals.
- [ ] Confirm Fear is purple with black numerals.
- [ ] Roll weapon damage and confirm red dice with white numerals.
- [ ] Roll Railgun/Massive and confirm the lower die is displayed as `DROP` in DisplayResults, callout, and history.
- [ ] Test 2D fallback with WebGL disabled.
- [ ] Test the same Firebase table in two separate browsers.

## PR metadata

**Suggested branch**

```text
release/portal-v59.17-table-and-3d-hotfix
```

**PR title**

```text
Replace current deploy with VeilFarers Portal v59.17
```
