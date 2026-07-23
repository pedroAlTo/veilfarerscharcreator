# VeilFarers Portal v59.80 — handover

Release date: 2026-07-24  
Package: `VeilFarers_Portal_v59.80.zip`

## Active baseline

Use v59.80 as the only active portal baseline. It is a complete package built
from v59.79 plus the Character Picker and creator/legal/security patches.

## Private access

Protected access is deny-by-default:

| Identity role | Player Tool | Keeper Tool | Administration |
|---|---:|---:|---:|
| `member` | No | No | No |
| `player` | Yes | No | No |
| `keeper` | No | Yes | No |
| `admin` | Yes | Yes | Yes |

Administrative server actions also require the signed-in email to match
`VF_ADMIN_EMAIL`. The portal never grants `admin`. Configure Netlify Identity
as Invite only and invite the private group from `/admin.html`.

Netlify redirects protect the HTML routes. `/api/tool-access`,
`/api/table-api` and `/api/firebase-auth-token` repeat authorization on the
server. Protected responses use `no-store`.

## Deletion workflow

Non-administrator users can delete their account in Account & Character Vault.
The portal administrator can delete another non-administrator account after
exact-email confirmation. The server purges Character Vault data, table
memberships, linked characters and invitations before deleting the Identity
user. Owned tables transfer to a remaining member; empty owned tables and their
linked data are deleted.

## Editorial deliverables

- Corebook 11.35
- Keeper's Companion 11.4
- Hearts in the Void 1.0 as a standalone adventure
- Rust & Steel 11.33
- Alien Species 11.33
- 11.35-compatible fillable character sheet

The supplied Corebook file was exactly 8 MiB and lacked a valid PDF trailer and
xref. It was not published. The existing valid Corebook 11.35 portal artifact
was retained.

The Keeper Tool still includes a runtime template for Hearts in the Void, but
the downloadable editorial product is independent from Keeper's Companion.

## Required deployment settings

- Netlify Identity Registration: Invite only
- Owner Identity role: `admin`
- Functions-only environment variable: `VF_ADMIN_EMAIL`
- Existing Firebase service configuration remains required

## Continuation

Continue from v59.80. Preserve explicit role authorization, the second
administrator-email factor, server-side API checks and ownership-safe deletion.
Treat `member` as account-only. Do not restore shared WIP tokens or give all
members access to both tools. Keep Hearts in the Void as a standalone
downloadable deliverable.
