# VeilFarers Portal v59.79 — handover

Date: 2026-07-23  
Baseline: v59.78  
Release package: `VeilFarers_Portal_v59.79.zip`

## Active release

Use v59.79 as the only active portal baseline. It preserves the complete v59.78 *Hearts in the Void* Keeper Tool integration, trimmed dice audio, explicit Inventory target, Level Up workflow and 2D/3D dice lifecycle. It adds strict table-password reconnection and owner-controlled permanent table deletion.

Do not rebuild from v59.78 after this release.

## Closed-table password correction

### Cause

The v59.78 backend validated a password only when admitting a new member or claiming an ownerless legacy table. Once a Netlify Identity account appeared in `memberIds`, a later `join` skipped password verification. The owner was also exempt because ownership counted as durable authorization.

This made an empty or incorrect password appear to work when reconnecting with an already admitted account.

### v59.79 behavior

Every `join` request for a closed table now passes through the server-owned password gate, regardless of whether the caller is:

- the table owner;
- an existing member;
- a newly invited member;
- the first authenticated claimant of an ownerless legacy table.

An open table still requires no password. A new member still needs an invitation; a password does not replace membership or the invitation.

When Player Tool or Keeper Tool starts a new authorization attempt, it first stops the previous live connection. A rejected password therefore leaves the client disconnected and cannot look like a successful reconnection.

### Password sources and migration

`netlify/functions/_table-security.mts` is the maintained classifier/verifier. It accepts:

- current server-only PBKDF2-SHA256 records in `tableSecrets`;
- historical PBKDF2 records stored on the session;
- historical SHA-256 of `veilfarers:<password>`;
- historical raw-password SHA-256;
- the oldest plain legacy password field.

Every historical format is accepted only with the correct non-empty password and is migrated to the current server-only PBKDF2 record. Empty and incorrect passwords receive HTTP 403.

A table marked closed but missing every usable verifier returns HTTP 409 rather than opening silently. Changing or removing a password clears every historical password field so an old verifier cannot unexpectedly reactivate the lock.

Client-side cached password-verification code was removed from Player and Keeper tools. Password decisions belong to `/api/table-api`.

## Owner-only permanent table deletion

Table Admin now contains a custom Danger zone visible only to the table owner.

Deletion requires:

1. typing the exact table name;
2. pressing **Delete table**;
3. pressing **Confirm permanent deletion** within seven seconds.

The owner-only server action deletes:

- the session document;
- the table-directory document;
- the server password document;
- every invitation belonging to the table;
- stored handout subdocuments.

Player and Keeper tools receive `veilfarers:table-deleted`, stop live synchronization, clear active-table state and remove the saved table ID.

Legacy tables remain supported. An ownerless historical table must first be successfully joined and claimed through its valid open/password path; after that, its authenticated owner receives the same deletion controls. A protected legacy table is never made deletable by bypassing its valid password.

## Authorization boundaries

- Netlify Identity is required for all table API actions.
- The creator/claimed owner is the only account allowed to change passwords, administer invitations/members or delete the table.
- Membership continues to authorize table data reads/writes after a successful UI connection.
- The password is a connection gate, not encryption and not a substitute for membership, Firestore Rules or App Check.
- Deletion is permanent in the application. Back up a production table before using it.

## Main implementation files

- `netlify/functions/_table-security.mts` — current and legacy password gate.
- `netlify/functions/_firebase-admin.mts` — parent-scoped Firestore query used to remove only the deleted table's invitations.
- `netlify/functions/table-api.mts` — unconditional join verification and owner-only cascade deletion.
- `table-access.js` — custom Danger zone, exact-name/double confirmation and deletion event.
- `player-tool.jsx` / `player-tool.bundle.js` — rejected-reconnection reset and deletion handling.
- `keeper-tool.html` — rejected-reconnection reset and deletion handling.
- `tests/table-security.test.mts` — password-format and denial coverage.
- `tests/table-api-contract.test.mjs` — owner guard, cascade and client-reset contract checks.
- `tests/firebase-query-scope.test.mts` — verifies the nested invitation query parent and table filter.

## Release baseline retained

v59.79 does not alter VeilFarers rules or the adventure. It retains:

- Corebook 11.35 / Keeper's Companion 11.33 as the current *Hearts in the Void* baseline;
- 11 linked Keeper stages, ten Level 1 Sleeping pregenerates and current Weaver Queen phases;
- the standoff without a roll;
- “I Need an Idea!” as a terminal backup;
- “The Ship That Learns” as optional/recommended;
- trimmed `dados_1.mp3` requested with the v59.78 audio cache key;
- active-character-safe Inventory transfers;
- the v59.77/v59.78 Level Up and dice changes.

## Deployment acceptance

Use disposable tables in Deploy Preview.

1. Create a closed table, disconnect and retry with empty, wrong and correct passwords as owner.
2. Repeat with an existing invited member.
3. Confirm rejected attempts leave Player/Keeper disconnected.
4. Confirm a correct password reconnects and legacy password formats migrate.
5. Delete a disposable current table and verify it disappears from both table lists.
6. Confirm its invitations and handouts no longer resolve.
7. Claim a disposable old-format table and delete it as owner.
8. Re-test Keeper ↔ Player synchronization, Hearts in the Void, audio interruption and mobile Shake to Roll.

Local tests verify the gate and static action contracts. Final Netlify Identity, Firebase document deletion and denial behavior still require Deploy Preview.

## Instruction for the next chat

Use `VeilFarers_Portal_v59.79.zip`, `PORTAL_HANDOVER_v59.79.md`, `GITHUB_DEPLOY_SUMMARY_v59.79.md` and `VALIDATION_v59.79.txt` as the active portal set. For every subsequent portal modification, increment the release, update this handover and include a GitHub-ready deploy summary.
