# VeilFarers Portal v59.79 — GitHub deploy summary

Release date: 2026-07-23  
Base: v59.78

## Summary

- Enforces the correct password on every connection to a closed table, including owners and existing members.
- Removes obsolete client-side password caches and keeps verification in the authenticated server function.
- Preserves and migrates historical PBKDF2, SHA-256 and oldest plain-password table records.
- Disconnects an existing Player/Keeper table before a new authorization attempt, preventing a rejected password from looking successful.
- Adds owner-only permanent table deletion with exact-name entry and a second confirmation.
- Cascades deletion through the session, directory record, server password, invitations and handouts.
- Supports deletion of historical tables after a successful authenticated owner claim.
- Preserves the complete v59.78 Hearts in the Void, audio, Inventory, Level Up and dice baseline.

## Deploy authority

- Package version: `59.79.0`
- Release header: `X-VeilFarers-Release: v59.79`
- CSP profile: `wasm-3d-dice-v2`
- Required script source: `'wasm-unsafe-eval'`
- Deploy the ZIP contents directly at the site root.

## Security review points

1. `tablePasswordGate(...)` runs for every closed-table `join`, outside the new-member/legacy-claim condition.
2. Empty and incorrect passwords return 403 for owner and member reconnections.
3. A closed marker without a usable verifier returns 409 rather than silently opening.
4. `deleteTable` appears after the owner guard and requires the exact table name.
5. Deletion removes the session, directory, secret, invitations and handouts.
6. Player and Keeper clear their active connection when deletion succeeds.

## Deploy Preview checklist

1. Verify `/data/deploy-version.json` and headers report v59.79.
2. Test empty/wrong/correct password as owner on a disposable closed table.
3. Repeat as an existing invited member.
4. Verify rejected attempts leave no active live listener/poll.
5. Delete a current disposable table and verify full cleanup.
6. Claim and delete a disposable legacy-format table.
7. Re-test authenticated Keeper ↔ Player sync and the preserved v59.78 release features.

No VeilFarers gameplay rules or editorial sources change in v59.79. Live Netlify Identity/Firebase denial and deletion tests remain required.
