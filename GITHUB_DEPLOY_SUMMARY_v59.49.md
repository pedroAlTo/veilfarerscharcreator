# VeilFarers Portal v59.49 — Deploy / PR Summary

## Objective

Hotfix the real Deploy Preview regressions found after v59.48 without changing approved product behavior or the protected v59.25 dice result/renderer implementation.

## Fixed

### Netlify Identity and CSP

- Added `https://app.netlify.com` to `frame-src` so the current Netlify Identity widget can open its login frame.
- Added `https://www.gstatic.com` to `connect-src` for Firebase source-map diagnostics.
- Added an Identity initialization wait before authenticated cloud calls.
- Sends the current Netlify Identity JWT as `Authorization: Bearer …` to authenticated Functions.

Affected endpoints:

- `/api/firebase-auth-token`
- `/api/allocate-character-id`
- `/api/character-vault`
- `/api/table-api`

### Character Vault permissions

- Added `netlify/functions/character-vault.mts`.
- Character Vault no longer performs browser-side Firestore reads/writes.
- `list`, `get` and `upsert` are executed with Firebase Admin credentials after Netlify Identity verification.
- The server forces the authenticated account as `ownerId`/`ownerEmail` and refuses writes to another user's record.
- Local/offline fallback remains unchanged.
- This removes `Missing or insufficient permissions` during branch testing before the project-wide Firestore Rules cutover.

### 3D dice loader

- Added a 20-second initialization timeout.
- Fixed the preload/first-roll overlap that could leave the modal open after initialization completed.
- `Use 2D dice` and `Close` are available while loading.
- `Retry` appears after failure.
- Existing mathematical roll resolution and `assets/3d-dice` remain unchanged.

### Player Tool connection alert

- Alert is now fully opaque using an explicit background value.
- It is positioned immediately below the shared portal navigation.
- Navigation stays visually above the alert; the alert remains above Player Tool content.

### Netlify dependency installation

- Regenerated all `package-lock.json` resolved URLs against `https://registry.npmjs.org/`.
- Added repository `.npmrc` with the public registry.
- Removes the inaccessible `packages.applied-caas-gateway1.internal.api.openai.org` URL that caused Netlify `ETIMEDOUT` failures.

## Retained from v59.48

- account-owned Character Vault and permanent `VF-######` identity;
- automatic save on completed character creation;
- guided Corebook RC3.2 Level Up and advancement history;
- Charsheet/Player Tool synchronization with runtime preservation;
- Power Vault;
- Shake to Roll;
- authenticated Keeper Tool and shared navigation;
- table ownership, invitations and server-side password records;
- equipment Mods, drone synchronization and compact live-play summaries;
- VeilFarers branding.

## Environment

No new environment-variable names:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
FIREBASE_SERVICE_ACCOUNT_JSON
```

## Preview QA

1. Hard-refresh the Deploy Preview.
2. Open Log-in and confirm there is no CSP `frame-src` error.
3. Sign in with an existing account and a newly created account.
4. Create/complete a disposable character and confirm Vault cloud sync.
5. Refresh in a second browser/session and confirm the same account sees the record.
6. Confirm another account cannot see it.
7. Connect to a disposable table and verify `/api/firebase-auth-token` no longer returns repeated 401 responses.
8. Test normal 3D initialization, timeout, `Close`, `Use 2D dice` and `Retry`.
9. Confirm connection errors are opaque and start below navigation.

## Firestore Rules boundary

Character Vault now uses a server API and can be previewed before the Rules cutover. Real-time table documents still require the authenticated membership Rules for secure production use. Rules remain project-wide; do not deploy them casually from a branch sharing production Firebase.

## Rollback

Redeploy the complete v59.48 package. If authenticated Firestore Rules have already been deployed, treat Rules rollback separately; reverting code alone does not restore the old table authorization model.
