# VeilFarers Portal v59.49 — Identity, Vault and Table Security

## Security boundary

Netlify Identity is the general account authority. Firebase provides persistence and real-time table state. Firebase Admin credentials exist only in Netlify Functions through `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Authenticated request transport

The browser waits for the current Netlify Identity session and sends its JWT in the `Authorization` header to protected Functions. Functions use `@netlify/identity` `getUser()` to verify the caller.

A missing or invalid session returns 401. The service-account JSON, Firebase Admin access token and table password verifier must never be returned to the browser.

## Character Vault

Character Vault CRUD is server-mediated in v59.49:

```text
POST /api/character-vault
  action: list | get | upsert
```

The server:

- requires a verified Netlify user;
- forces `ownerId` and `ownerEmail` from that verified user;
- validates `VF-######` IDs;
- rejects access to records owned by another user;
- normalizes schema, status and timestamps;
- performs Firestore access with Firebase Admin credentials.

This eliminates reliance on browser Firestore permissions for Vault operations. Local records remain available when the cloud endpoint is unavailable.

## Firebase custom token

`/api/firebase-auth-token` creates a Firebase custom token whose UID equals the Netlify user ID. It is used for real-time table sessions, where Firestore Rules compare `request.auth.uid` against `memberIds`.

## Table model

```text
artifacts/default-app-id/public/data/sessions/{tableId}
artifacts/default-app-id/public/data/tableDirectory/{tableId}
artifacts/default-app-id/public/data/tableInvites/{sha256(token)}
artifacts/default-app-id/public/data/tableSecrets/{tableId}
```

- safe directory metadata is visible only to authenticated users;
- the creator is owner and first member;
- invitation passkeys are stored only as SHA-256 hashes;
- protected joins require invitation plus password;
- PBKDF2 password verifiers remain server-only;
- owners may revoke invites, remove members and change/remove passwords.

## CSP

The portal allows the current Netlify Identity widget frame from:

```text
https://identity.netlify.com
https://app.netlify.com
```

Firebase scripts load from `www.gstatic.com`. `connect-src` allows that origin for source-map diagnostics. This does not expose credentials or permit arbitrary framing.

## Firestore Rules

Rules remain project-wide. Character Vault can now be tested without changing Rules because it uses a server function. Real-time table security still requires active membership Rules and denial testing.

Do not describe table data as securely membership-enforced until all of these pass under the deployed Rules:

- non-member read denied;
- removed member read/write denied after token/session refresh;
- member cannot edit owner/member/password metadata directly;
- invite and secret collections deny direct browser access;
- owner/member table operations continue through `/api/table-api`.

## Remaining hardening

- App Check;
- dedicated rate limiting for invitation/password attempts;
- ownership transfer policy;
- permanent-delete/recovery policy for Vault records;
- audit logging for owner/member administrative actions.
