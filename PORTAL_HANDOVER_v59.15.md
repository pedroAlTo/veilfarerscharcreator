# VeilFarers Portal v59.15 — Technical Handover

## Scope

v59.15 is a focused real-time persistence fix. It changes Firestore write hygiene and session-key normalization without changing the table document schema or canonical game rules.

## Root cause

Firestore rejects JavaScript `undefined` anywhere inside a document payload. Player Tool autosaves the complete `characters` array. Optional properties from legacy imports or custom equipment—most visibly an absent weapon `burden` value—could remain `undefined` in React state and invalidate the entire `DocumentReference.set()` call.

## Implementation

### `player-tool.html`

- Added `window.vfFindUndefinedPaths(value)` for diagnostics.
- Added `window.vfSanitizeFirestore(value)` for recursive normalization.
- Configured Firestore with `ignoreUndefinedProperties: true` before reads/writes.
- Wrapped `setDoc`, `updateDoc`, and `arrayUnion` arguments with safe normalization.
- Preserved Firestore-native values and transform sentinels.
- Added `normalizeSessionKey()` and used it for all Player Tool session document paths.
- Awaited the initial session metadata write before marking the connection successful.
- Clear previous autosave errors after a successful write.
- Normalized optional hydrated weapon burden to `null`.

### `veilfarers-import.js`

- Normalized missing imported weapon burden to `null`.

### `keeper-tool.html`

- Enabled `ignoreUndefinedProperties` during Firestore initialization.

## Data behavior

- Undefined object property: omitted.
- Undefined array element: stored as `null`.
- Null: preserved.
- Date: preserved.
- Firestore transforms and native values: preserved.
- Circular plain-object references: normalized to `null` rather than causing recursion failure. Character data is not expected to contain cycles.

## Compatibility

No migration is required. Existing Firestore documents and clients remain compatible. The session collections, fields, roll-history model, and broadcast IDs are unchanged.

## Live verification

A Netlify Deploy Preview must verify:

1. `/api/firebase-config` returns the configured runtime values.
2. Anonymous Firebase authentication succeeds.
3. Firestore rules allow the initial metadata write and merged autosaves.
4. Legacy and custom character payloads save without unsupported-field errors.
5. Multi-client character, roll, Fear, Spotlight, handout, and history synchronization remains intact.
