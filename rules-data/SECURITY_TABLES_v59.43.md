# VeilFarers Tables — Password and Privacy Position v59.43

## What v59.43 protects

- Table passwords are not stored as plaintext.
- New passwords use PBKDF2-SHA256, a random 16-byte salt and 150,000 iterations.
- OPEN and CLOSED tables are clearly distinguished.
- Creating an OPEN table in Player Tool requires an explicit confirmation.
- Adding or changing a password requires an already established connection to that table.
- Legacy SHA-256 tables remain compatible and are upgraded when their password changes.

## What v59.43 does not protect

The current Firebase session documents are still under a public collection. The browser performs password verification. Consequently, the password is a practical access gate but not a server-enforced authorization boundary.

Do not store confidential personal, legal, financial or medical information in a table session.

## Required production hardening

1. Require authenticated users instead of anonymous-only identity for private tables.
2. Store membership/role records outside publicly readable session documents.
3. Apply Firestore Security Rules so only members can read a closed table.
4. Restrict Keeper-only writes through role-aware rules.
5. Enable Firebase App Check.
6. Consider server-side password verification or invitation tokens so the verifier is not exposed to unauthorized readers.

## Directory control

Discovery is enabled by default for the requested OPEN/CLOSED workflow.

Disable it with:

```text
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
```

Exact-name joins may still be possible depending on Firestore rules and the client configuration.
