# VeilFarers Portal v59.51 — Deploy / PR Summary

## Objective

Close the live Deploy Preview defects around invitations, Keeper table synchronization, historical passwords, legacy character import, Player Tool Proficiency/deduplication/log behavior and equipment discovery while preserving the v59.25 protected dice renderer.

## Scope

### Table invitations

- Latest raw passkey/link remains visible on the owner device until replaced or deleted.
- Invitation list now includes active, revoked, expired and exhausted records.
- Owner can inspect/edit label, optional email binding, expiry and maximum uses.
- Owner can revoke/reactivate or use a two-step permanent delete.
- Firestore still stores only the invitation-token SHA-256 hash; older raw passkeys are intentionally unrecoverable.

### Keeper → table live state

- Added authenticated server actions for whitelisted live session patches, roll broadcast/history reset and handout replacement.
- Keeper HP/resource/Fear/Spotlight/drone changes, notes and session name use the shared session document.
- Keeper roll, damage and ability broadcasts write through `/api/table-api`.
- Firebase initialization remains singleton; no Firestore host/settings override is applied.

### Historical passwords

- New records use PBKDF2-SHA256, 150,000 iterations and decoded random salt bytes.
- Verification supports browser-created PBKDF2 records, the temporary v59.47-v59.50 server salt-text format, legacy prefixed/raw SHA-256 and the oldest plain migration field.
- Successful legacy admission replaces old material with a server-only current verifier.

### Player Tool

- Proficiency is visible and multiplies weapon damage dice before critical multiplication.
- Attack accuracy remains Trait + explicit feature bonuses; Proficiency is not added to the attack total.
- Weapon cards show base damage and the Proficiency-scaled expression.
- Vault open, Charsheet transfer and JSON import use the same add-or-update/deduplication path.
- Legacy no-ID records may match an already identified exact build before allocating a second ID.
- Player Log uses a body portal with reliable Close and authenticated Reset.
- Empty optional sections no longer render a stray numeric `0`.

### Character Vault and imports

- Concurrent refreshes are coalesced, retried once and fall back to usable local completed records.
- Creator, Level Up and Player Tool accept legacy Creator, Charsheet and Player Tool JSON.
- Imported characters receive/preserve a permanent `VF-######` ID, enter Character Vault and synchronize when online.

### Catalogue filters

- Replaced catalogue native selects with custom VeilFarers dropdowns.
- Added dynamic filters for source, Tech Tier, category, mechanical property, ownership and cost.
- Added sorting by name, Tier, cost and owned quantity across weapons, armor, gear and augments.

## Canon / rules impact

- No new game mechanic is introduced.
- Proficiency behavior follows the current Core advancement rule: it scales weapon damage dice.
- Automatically inferred catalogue categories are navigation metadata only.
- No dice asset or protected renderer behavior was changed.

## Server API additions

`/api/table-api` member actions:

```text
patchSession
broadcastRoll
clearRollHistory
setHandouts
```

Owner invitation actions:

```text
createInvite
updateInvite
deleteInvite
```

## Environment and database

No new environment-variable names. `FIREBASE_SERVICE_ACCOUNT_JSON` remains server-only.

`firestore.rules` is unchanged from the authenticated ownership/membership baseline. Rules remain project-wide; coordinate any production Rules deployment with the table-security cutover.

## Automated validation

- `npm ci` passes using public npm URLs.
- Portal JSON, JavaScript, inline HTML scripts, Player JSX and seven Netlify Functions parse.
- Fresh and historical PBKDF2 password fixtures pass.
- Proficiency, critical and Massive damage-plan fixtures pass.
- Permanent-ID and legacy no-ID dedupe fixtures pass.
- Catalogue filter fixtures pass.
- Internal-registry and credential scans pass.
- Protected 3D dice assets match v59.50 byte-for-byte.

## Manual Deploy Preview QA

- Create/edit/revoke/reactivate/delete invitations and verify latest passkey persistence.
- Join with a second account using invitation + protected-table password.
- Test at least one historical password table.
- Verify Keeper changes, notes, handouts and rolls arrive in Player Tool.
- Import old JSON through Creator, Level Up and Player Tool.
- Reopen/import the same character repeatedly and verify one Player record.
- Verify Proficiency damage, Player Log Close/Reset and absence of the stray `0`.
- Exercise all equipment filters on desktop/mobile.

## Rollback

Preserve v59.50. Code rollback is possible, but rolling back after a legacy password has migrated leaves the safer server-side verifier in place. Do not restore permissive historical Rules merely to reproduce the old client model.
