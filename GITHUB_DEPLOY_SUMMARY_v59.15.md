# Replace current deploy with VeilFarers Portal v59.15

## Suggested branch

`release/portal-v59.15-firestore-undefined-save-fix`

## Summary

This branch replaces **VeilFarers Portal v59.14** with **v59.15**. It fixes a critical Player Tool connection/autosave regression where Firestore rejected session documents containing optional fields with JavaScript `undefined` values.

The reported error was:

```text
Function DocumentReference.set() called with invalid data.
Unsupported field value: undefined
```

Legacy character imports and custom equipment can legitimately omit optional properties. The application now normalizes these payloads before every Firestore write instead of allowing one missing property to block the complete session save.

## Main changes

### Player Tool Firestore writes

- Added recursive Firestore payload normalization.
- Undefined object properties are omitted.
- Undefined array positions become `null` so array ordering is preserved.
- Firestore-native values and transforms remain intact, including `FieldValue.arrayUnion`.
- Added browser-console diagnostics listing the paths that were normalized.
- Enabled Firestore `ignoreUndefinedProperties` before database use as an SDK-level guard.

### Character and equipment compatibility

- Normalized missing weapon `burden` values to `null` in the shared Creator importer.
- Applied the same normalization in Player Tool weapon hydration.
- Preserved compatibility with legacy Creator exports, existing local Player Tool data, canonical weapons, and custom weapons.

### Session connection hardening

- Trims table names before building the Firestore document path.
- Prevents visually identical tables such as `Partida` and `Partida ` from being treated as separate documents.
- Awaits the initial table metadata write before showing `Connected`.
- Clears stale `Save error` messages after the next successful autosave.

### Keeper Tool

- Enabled Firestore undefined-property handling during Keeper Tool initialization.
- No Firestore schema migration is required.

## Infrastructure retained

- Netlify hosting and Functions.
- Netlify Identity for portal accounts and roles.
- Firebase anonymous authentication for real-time tables.
- Firestore session path:
  `artifacts/{appId}/public/data/sessions/{sessionId}`.
- Firebase configuration remains loaded from `/api/firebase-config`.
- No Firebase credentials are committed to the repository.

## Validation performed

- Recursive sanitizer unit tests.
- Undefined object-field omission.
- Undefined array-position normalization.
- Firestore transform-sentinel preservation.
- Table-name normalization checks.
- Legacy/custom weapon burden normalization.
- JavaScript syntax checks for non-JSX application files.
- JSON integrity checks.
- Local HTML dependency checks.
- Firebase-key scan.
- ZIP integrity check.

## Deploy Preview checklist

- [ ] Import a legacy Character Creator JSON.
- [ ] Add a custom weapon with optional fields left empty.
- [ ] Join a table with whitespace around its name.
- [ ] Confirm the table connects without the unsupported `undefined` error.
- [ ] Confirm HP, Stress, Experiences, inventory, and arsenal changes autosave.
- [ ] Confirm a second Player Tool receives the character updates.
- [ ] Confirm Keeper Tool sees the same table and characters.
- [ ] Confirm roll broadcasts, damage details, Fear, and Spotlight still sync.
- [ ] Confirm password-protected tables still work.
- [ ] Confirm no Firebase key is present in the repository or generated deploy.

## Known pending work

- Complete the operational four-slot Soldier Drill preparation workflow in Player Tool.
- Continue production testing of the new RC3 rules and PDF set.
- Run the full multi-browser regression suite against the production Firebase project before promotion.
