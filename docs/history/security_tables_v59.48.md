# VeilFarers Account, Vault and Table Security — v59.48

## Security model

v59.48 uses one general Netlify Identity account across Character Vault, Player Tool table membership and Keeper Tool. Firebase remains the storage and real-time layer. A Firebase custom token uses the same UID as the Netlify account so Firestore Rules can compare `request.auth.uid` directly with character ownership and table membership.

## Keeper access

- Keeper Tool now requires a logged-in general account.
- A typed Netlify Identity event function adds the `member` role on signup and login while preserving any existing `keeper` or `admin` role.
- Netlify role-conditioned redirects permit `member`, `keeper` and `admin` to `/keeper-tool.html`.
- Signed-out requests fall through to `/login.html`.
- The browser Identity gate is retained for clear UX and local diagnostics, but it is not treated as the authorization boundary.
- `/admin.html` remains restricted to the `admin` role.

Existing users must log out and sign in again, or refresh their token, before a newly assigned role appears in their JWT.

## Character Vault

Canonical character documents remain:

```text
characters/{characterId}
```

Relevant ownership fields:

```text
characterId
ownerId
ownerEmail
status
completedAt
characterData.creatorState
characterData.sheetPayload
characterData.playerRuntime
advancementHistory
updatedAt
```

Rules/behavior:

- the server allocates `VF-######` and writes the authenticated owner;
- normal Vault lists are queried by `ownerId`;
- local selectors also filter against the current owner to avoid exposing stale records left by a different account on the same browser;
- only completed, active characters appear in normal Vault selectors;
- Trash is a soft state; restore returns the record to active;
- Player Tool updates by permanent Character ID and does not create a second identity for the same character;
- Level Up updates build data but preserves current Player runtime resources and Conditions.

`PENDING-*` remains an offline/deferred identifier and is not a permanent public character identity.

## Tables retained from v59.47

```text
artifacts/default-app-id/public/data/sessions/{tableId}
artifacts/default-app-id/public/data/tableDirectory/{tableId}
artifacts/default-app-id/public/data/tableInvites/{sha256(token)}
artifacts/default-app-id/public/data/tableSecrets/{tableId}
```

- authenticated users may list only safe directory metadata;
- the logged-in creator is table owner and first member;
- owner controls invitations, membership and password state;
- invitations are links/passkeys whose raw value is returned once and only a SHA-256 hash is stored;
- an email-bound invitation can be redeemed only by that account;
- protected tables require both valid membership/invitation and the password for a new join;
- password verifiers use PBKDF2-SHA256 and live in server-only `tableSecrets`;
- password changes do not silently remove existing members.

## Firestore Rules boundary

`firestore_v59.48.rules` retains the v59.47 ownership/membership model:

- character reads/writes restricted to owner;
- session reads/writes restricted to members;
- ownership, membership and password metadata immutable from untrusted clients;
- authenticated safe-directory reads;
- no direct invite/secret reads;
- counters server-only.

Firestore Rules apply to the whole Firebase project. A Deploy Preview sharing production Firebase cannot have branch-only Rules. Before the coordinated cutover, use a newly named disposable table and do not claim that membership is fully Rules-enforced.

## Mobile motion and browser permissions

The `Permissions-Policy` allows accelerometer and gyroscope only from the same origin. Shake to Roll is opt-in, asks for platform permission where required, is disabled outside an active roller, and cannot replace the visible roll button. Sensor data is processed locally and is not persisted or transmitted by the feature.

## Connection-error disclosure

Player Tool connection failures are intentionally displayed above every visual layer. Messages should contain operational errors/codes but must never include service-account JSON, private keys, raw table password verifiers or invitation hashes.

## Remaining hardening

- App Check enforcement.
- Dedicated rate limiting/abuse controls for allocation, invitations and table actions.
- Ownership transfer and secure account-deletion cleanup.
- Permanent-delete retention policy and recovery window.
- Firestore Rules emulator/live denial suite.
- Removal of runtime Babel/Tailwind and tighter CSP after bundling.

## Production acceptance

Do not describe Vault or tables as production-secure until:

1. v59.48 is deployed;
2. the authenticated Firestore Rules are active;
3. two-account ownership and membership denial tests pass;
4. existing users have refreshed their Identity role token;
5. no credential appears in browser source, network payloads, ZIP or repository.
