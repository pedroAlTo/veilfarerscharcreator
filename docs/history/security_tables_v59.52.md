# VeilFarers v59.52 — Identity, Vault Selection and Table Communication Security

## Identity authority

Netlify Identity remains the general account authority. Firebase custom authentication uses the same Netlify UID for real-time table membership. Firebase Admin credentials remain available only to Netlify Functions through `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Character Vault

Character records remain at:

```text
characters/{characterId}
```

The account's one active selection is separate metadata:

```text
characterVaultProfiles/{netlifyUid}
```

The profile contains only:

- `ownerId`;
- `activeCharacterId`;
- `updatedAt`.

`/api/character-vault` verifies the Identity caller and enforces:

- only the caller's characters are listed/read/updated;
- `setActive` accepts only an owned, non-trashed `VF-######` record;
- another user's character cannot be selected or overwritten;
- the first completed record becomes active when no selection exists;
- trashing the selected record chooses a remaining owned record or clears selection.

The browser key `veilfarers.character.currentId.v1` is an offline mirror, not an authorization credential.

## Table membership and ownership

Tables remain under:

```text
artifacts/default-app-id/public/data/sessions/{tableId}
```

- creator is owner and first member;
- owner controls password, members, invitations and Keeper notes;
- a new non-member needs an invitation;
- a protected table additionally requires its password;
- existing membership is the durable read/write boundary;
- password verifiers remain server-only in `tableSecrets`;
- invitation documents remain keyed by token hash.

## Targeted Keeper notes

`sendHandout` and `deleteHandout` are owner-only.

Every sent note is normalized server-side with:

- the verified current `tableId`;
- `senderUid` from the authenticated caller;
- `target: all` or one validated target;
- `targets: all` or a one-element array;
- server send time.

One-player targets must match a non-drone player represented in that same table by:

1. authenticated `memberUid`/legacy `ownerUid`; or
2. compatibility `characterId`, `id` or `syncId` for older session records.

Unknown targets are rejected. A client cannot forge a note into another table by supplying its own `tableId` because the function uses the verified request table path.

Player Tool opens a note only when:

- its `tableId` matches the connected table; and
- its target is `all` or matches the signed-in member UID/active character identity.

## Keeper rolls

### Keeper Only

- stored only in the Keeper browser;
- not sent to `/api/table-api`;
- not written to Firestore;
- filtered by current table in the local Keeper history;
- intentionally unavailable on another Keeper device.

### Broadcast

- caller must already be a table member;
- server forces `visibility: public`, current `tableId`, authenticated `senderUid` and normalized timestamp/ID;
- appended only to that session's roll history;
- Player Tool filters out non-public roll entries.

## Rules boundary

The included Firestore Rules retain authenticated directory, character ownership, session membership and server-only invite/secret boundaries. The new Vault profile is server-only under the deny-by-default catch-all.

Rules are project-wide. Branch code can be tested through server Functions and disposable test tables, but a different Rules file cannot be isolated from production when both deployments share one Firebase project.

## Remaining hardening

- Firebase App Check is not enforced yet.
- Dedicated API rate limiting is not implemented.
- Table character arrays still rely on member-authorized shared-state writes; a future schema can separate per-member presence from campaign state.
- Ownership transfer is not implemented.
