# VeilFarers Portal v59.62 — Keeper Tool Startup and Firebase Admin Diagnostics

## Summary

This release fixes an unnecessary Character Vault dependency in Keeper Tool and makes Firebase Admin configuration failures explicit and actionable.

Keeper Tool previously loaded the global Character Registry and Character Sync Adapter even though its campaign interface does not require Character Vault. When `/api/character-vault` returned `500`, the Keeper page generated repeated startup failures before the user connected to a table. The same server-side Firebase Admin configuration is also required by table APIs, but Vault failure must not prevent the Keeper campaign interface from opening.

v59.62 removes that coupling and replaces generic Firebase Admin `500` responses with safe `503` diagnostics.

## Root cause

Two independent issues were present:

1. **Unnecessary Keeper startup dependency**
   - `keeper-tool.html` loaded `/character-registry.js` and `/character-sync-adapter.js`.
   - Character Registry automatically attempted to retrieve the active Character Vault record.
   - This produced duplicate `/api/character-vault` failures during Keeper startup and after Identity initialization.
   - Keeper Tool does not need Character Vault to open, create/load a local campaign or import the current local Charsheet payload.

2. **Server-side Firebase Admin configuration failure**
   - `/api/character-vault`, `/api/table-api`, `/api/firebase-auth-token` and permanent Character ID allocation depend on the Functions-only `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable.
   - If the variable is absent, malformed, incomplete, belongs to the wrong project or contains an unusable private key, the previous code returned a generic `500` with little diagnostic value.

The browser Firebase API key is not a replacement for the server-side service account.

## Changes

### Keeper Tool isolation

- Removed `/character-registry.js` from `keeper-tool.html`.
- Removed `/character-sync-adapter.js` from `keeper-tool.html`.
- Keeper Tool no longer calls `/api/character-vault` merely by opening the page.
- Keeper campaign creation, JSON import/export, local Charsheet transfer and local campaign management remain available independently of Character Vault.
- Portal navigation still displays the locally selected Character ID through `portal.js`; no Keeper functionality depended on the removed adapters.

### Firebase Admin diagnostics

- Added structured configuration errors with HTTP `503` instead of generic `500` for unavailable server configuration.
- Added safe diagnostic codes:
  - `FIREBASE_ADMIN_NOT_CONFIGURED`
  - `FIREBASE_ADMIN_INVALID_JSON`
  - `FIREBASE_ADMIN_INCOMPLETE`
  - `FIREBASE_ADMIN_PRIVATE_KEY_INVALID`
  - `FIREBASE_ADMIN_TOKEN_EXCHANGE_FAILED`
  - `FIREBASE_ADMIN_TOKEN_MISSING`
  - `FIREBASE_PROJECT_ID_MISSING`
- Accepts a normal service-account JSON object or a JSON-encoded string copied into Netlify.
- Converts literal `\n` sequences in `private_key` into real line breaks before signing.
- Validates `project_id`, `client_email` and `private_key` before attempting Google authentication.
- Logs detailed diagnostics only in Netlify Function logs; secrets are not returned to the browser.
- `/api/character-vault`, `/api/table-api`, `/api/firebase-auth-token` and `/api/allocate-character-id` now return safe, actionable configuration messages and diagnostic codes.
- Table and Vault responses include request references where applicable.

### Preserved 3D dice fixes

- Retains the v59.60 case-sensitive `Dice.min.js` compatibility file.
- Retains the v59.61 CSP permission `'wasm-unsafe-eval'` required by Ammo WebAssembly.
- No dice logic, outcomes, physics settings or themes were changed.

## Required Netlify configuration

For Character Vault, permanent IDs, Firebase custom authentication and cloud tables, configure this environment variable in Netlify:

```text
FIREBASE_SERVICE_ACCOUNT_JSON
```

The value must be the complete JSON object downloaded for the Firebase/Google Cloud service account used by the same Firebase project as `FIREBASE_PROJECT_ID`.

Security requirements:

- Scope it to Netlify Functions/server runtime.
- Do not expose it through `/api/firebase-config`.
- Do not commit it to GitHub or include it in the deploy ZIP.
- Enable it for Production and any Deploy Preview/Branch contexts that need cloud testing.
- Trigger a new deploy after changing the environment variable.

## Files changed

- `keeper-tool.html`
- `netlify/functions/_firebase-admin.mts`
- `netlify/functions/character-vault.mts`
- `netlify/functions/table-api.mts`
- `netlify/functions/firebase-auth-token.mts`
- `netlify/functions/allocate-character-id.mts`
- `package.json`
- `package-lock.json`
- `data/changelog.json`

## Files added

- `GITHUB_DEPLOY_SUMMARY_v59.62.md`
- `PORTAL_HANDOVER_v59.62.md`
- `START_HERE_v59.62.txt`
- `VALIDATION_v59.62.txt`

## Explicitly unchanged

- Keeper campaign data structure and campaign templates.
- Local Keeper save/load/export behavior.
- Table ownership, invitation, password, note and roll authorization rules.
- Character Vault ownership model.
- Firebase collections and document paths.
- Firestore Rules.
- Canonical VeilFarers rules datasets.
- Player Tool runtime and Character Creator workflows.
- v59.60/v59.61 3D dice corrections.
- Bundled PDFs and downloads manifest.

## Deployment

1. Deploy the complete contents of `VeilFarers_Portal_v59.62_Keeper_Firebase_Admin_Hotfix.zip`.
2. Confirm Netlify detects and bundles all `.mts` Functions.
3. Confirm `FIREBASE_SERVICE_ACCOUNT_JSON` exists in the deployment context.
4. Trigger a fresh deploy after adding or changing the variable.
5. Sign out and sign back in to refresh Identity state.
6. Hard-refresh Keeper Tool.

No Firestore Rules deployment or data migration is required.

## Acceptance tests

### Keeper startup

- Sign in and open `/keeper-tool.html`.
- Confirm the Identity gate closes normally.
- Confirm the campaign selection screen appears.
- Confirm Network shows no `/api/character-vault` request caused by Keeper page startup.
- Create a blank campaign without connecting to a cloud table.
- Import/export a local Keeper campaign JSON.
- Transfer an available local Charsheet payload into Keeper Tool.

### Firebase configuration

With valid server credentials:

- `POST /api/character-vault` with `action: list` returns `200`.
- `POST /api/table-api` with `action: list` returns `200`.
- `/api/firebase-auth-token` returns `200` while signed in.
- Keeper can list, create/join and poll a disposable table.

With credentials intentionally absent in a non-production test context:

- Functions return `503`, not a generic `500`.
- Response includes `FIREBASE_ADMIN_NOT_CONFIGURED`.
- No service-account content appears in the response.
- Keeper campaign UI remains usable locally.

### Regression

- Test Player Tool 3D dice and confirm Ammo WASM initializes.
- Confirm `Dice.min.js` and `ammo.wasm.wasm` return `200`.
- Confirm the effective CSP contains `'wasm-unsafe-eval'`.
- Complete Creator → Vault → Charsheet on a deploy with valid server credentials.
- Regress Keeper table notes, rolls, invitations and password behavior.

## Risk assessment

**Risk level: Low to medium.**

The Keeper HTML change is a low-risk dependency removal. Firebase Admin parsing and diagnostics affect several server endpoints but do not change their successful authorization or storage behavior. Live Netlify verification remains required because the original `500` depends on deployment environment configuration.

## Rollback

Redeploy v59.61.

No database or Firestore rollback is required. Rolling back restores the unnecessary Keeper-to-Vault startup calls and generic Firebase Admin `500` responses.
