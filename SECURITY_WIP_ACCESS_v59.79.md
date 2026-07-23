# VeilFarers v59.79 — WIP access setup

The Player Tool and Keeper Tool are protected by two layers:

1. Netlify Identity must authenticate the user.
2. The user must redeem an individual invitation token bound to that account email.

The browser never contains a shared password or the invitation registry. The server stores only SHA-256 token hashes. Successful redemption creates a signed `HttpOnly`, `Secure`, `SameSite=Strict` cookie for no more than seven days. Table API requests verify the account, signature, expiry and current invitation record. Setting `revoked: true` invalidates an existing grant on its next protected API request.

## Required Netlify variables

- `VF_WIP_ACCESS_SECRET`: a random secret of at least 32 characters. Generate it outside the repository, for example with `openssl rand -base64 48`.
- `VF_WIP_INVITES_JSON`: a JSON array of invitation records.

Never commit either value.

## Generate one invitation

```bash
node scripts/create-wip-invite.mjs invited@example.com player,keeper 14
```

The command prints:

- `token`: send this once to the invited person through a separate channel;
- `record`: append this object to `VF_WIP_INVITES_JSON`.

Use `player` or `keeper` instead of `player,keeper` for narrower access. The final number is the validity in days, capped by the generator at 90; the issued browser grant is always capped at seven days.

Example environment value:

```json
[
  {
    "hash": "SHA256_FROM_GENERATOR",
    "email": "invited@example.com",
    "tools": ["player", "keeper"],
    "expiresAt": "2026-08-06T12:00:00.000Z",
    "revoked": false
  }
]
```

## Revoke

Change that record to `"revoked": true` or remove it from `VF_WIP_INVITES_JSON`, then publish the environment change. Do not reuse tokens.

## Production acceptance

- Test a correct token with its matching account.
- Test the same token with a different account.
- Test an incorrect, empty, expired and revoked token.
- Confirm `/api/table-api` returns `403 WIP_ACCESS_REQUIRED` without a valid grant.
- Confirm tool HTML is not cached and the WIP screen appears before the application.
- Review Netlify logs for `[wip-access]` redemption events.

The invitation gate reduces exposure during development. It does not replace dependency updates, Firestore rules, authorization checks, rate limiting, logging, backups or security monitoring.
