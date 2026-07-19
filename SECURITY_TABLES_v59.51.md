# VeilFarers v59.51 — Identity, Character Vault and Table Security

## Identity boundary

Netlify Identity authenticates the general user. `/api/firebase-auth-token` bridges the verified Netlify user ID to Firebase custom authentication. Character `ownerId` and table `memberIds` therefore use one UID namespace.

## Character Vault

Character Vault CRUD uses `/api/character-vault` with Firebase Admin credentials. The function derives ownership from the authenticated caller and does not trust a browser-supplied owner ID. Local records remain an offline/deferred cache and portable JSON remains a backup/import format.

## Table directory

Authenticated users may receive only safe table metadata: name, open/locked state, member count, owner display name and update time. Session content, password material and invitation documents are not part of the directory response.

## Membership and live state

- Table creator is owner and first member.
- Existing membership is the durable authorization boundary.
- New non-members need a valid invitation; protected tables additionally require the current password.
- `/api/table-api` live actions require owner or member status.
- Client changes are restricted to explicit session fields: characters, Fear, Spotlight, Keeper notes and session name.
- Handout and roll-history operations are dedicated actions rather than arbitrary document writes.

## Invitation security

- Raw tokens are generated with cryptographic random bytes.
- Firestore stores only `sha256(rawToken)` as the invitation document ID.
- Raw token is returned once to the owner and v59.51 keeps only the latest token in table-scoped local storage on that owner device.
- Older raw tokens cannot be recovered server-side.
- Invitations support expiry, maximum use count, optional email binding, revoke/reactivate and deletion.
- Editing metadata does not rotate the token; creating a replacement does.
- Deletion uses an in-app two-step confirmation rather than a browser-native dialog.

## Password security and migration

Current passwords use PBKDF2-SHA256 with 150,000 iterations and a random 16-byte salt. The verifier is stored only in `tableSecrets/{tableId}`. The member-readable session contains only `SERVER_MANAGED` as a non-secret lock marker.

v59.51 recognizes historical records solely to migrate them after a successful admission:

1. browser PBKDF2 using decoded Base64 salt bytes;
2. v59.47-v59.50 server PBKDF2 using the Base64 text itself as salt;
3. SHA-256 of `veilfarers:<password>`;
4. SHA-256 of the raw password;
5. oldest plain password field.

After migration, legacy client fields are cleared. Existing members are not forced to re-enter the password; the password remains an additional admission gate, not the ongoing authorization credential.

## Firestore deployment boundary

Firestore Rules are project-wide. A branch Deploy Preview sharing production Firebase cannot safely test a different Rules version in isolation. Test with disposable tables, preserve current production Rules and deploy membership Rules only as a coordinated code + Rules cutover followed by denial tests.

## Remaining hardening

- Firebase App Check.
- Dedicated abuse/rate limiting for invitation and password attempts.
- Ownership transfer workflows.
- Automated invitation email delivery.
- Formal permanent-deletion/recovery policy.
