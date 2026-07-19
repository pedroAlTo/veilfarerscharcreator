# VeilFarers v59.53 - Identity, Vault Import and Table Access Security

## Identity authority

Netlify Identity remains the account authority. Protected Functions verify the current bearer token with `@netlify/identity`. Firebase Admin uses `FIREBASE_SERVICE_ACCOUNT_JSON` only on the server.

## Character Vault

- `/api/character-vault` forces `ownerId`, owner email, timestamps and accepted status fields.
- Users can list, read, upsert and select only their own characters.
- Vault import does not trust the JSON owner or permanent ID blindly; Creator normalizes it and the registry/server path applies current ownership.
- A missing permanent ID is allocated only for an authenticated user.
- Offline imports remain local/deferred and cannot impersonate cloud ownership.
- Re-importing a permanent ID updates that owned record; it cannot overwrite another user's record.

## Table directory and membership

Safe table directory metadata is authenticated. A table creator is owner and first member. A non-member needs a valid invitation; protected tables also require the current password. Password verifiers and invitation token hashes remain server-only.

## Keeper `readSession`

`readSession` is an authenticated owner/member action. It returns a limited projection:

```text
name
characters
fearTokens
spotlight
keeperNotes
sessionName
current-table handouts
public current-table rollHistory
updatedAt / lastActive
```

It does not expose table secrets, invitation documents, password verifiers or unrelated sessions. Handouts and rolls are filtered to the requested/current table; hidden Keeper rolls are never written.

## Keeper writes

- `patchSession` accepts only whitelisted live-state keys.
- `sendHandout` is owner-only and validates one-player/all-current-table targeting.
- `broadcastRoll` writes public rolls only to the authorized table.
- Keeper-only rolls stay in local browser state.
- Invitation, password and member administration remains owner-only.

## Firestore Rules boundary

Rules are project-wide. v59.53 Keeper reads use Firebase Admin and therefore are not blocked by preview browser Rules after server membership verification. Player real-time Firestore listeners still require the deployed membership Rules. Do not describe the entire table system as security-accepted until owner/member denial tests pass under the active production Rules.

## Deployment controls

- `FIREBASE_SERVICE_ACCOUNT_JSON` must have Functions scope and must never be placed in static files.
- Use disposable preview tables until the coordinated Rules cutover.
- Back up current Rules before any project-wide deployment.
- App Check and dedicated abuse-rate limiting remain launch-hardening work.
