# VeilFarers v59.80 - Identity roles and private-tool access

Player Tool and Keeper Tool use deny-by-default Netlify Identity roles.

## Roles

- `member`: normal account; no protected-tool access.
- `player`: Player Tool.
- `keeper`: Keeper Tool.
- `admin`: Administration, Player Tool and Keeper Tool.

The `admin` role cannot be granted through the VeilFarers portal. Assign it
manually in Netlify to the project owner account. Set the Functions-only
environment variable `VF_ADMIN_EMAIL` to that same normalized email address.
Administrative functions require both the role and the configured email.

Do not add players or Keepers as Netlify team collaborators. They are Identity
users only. Set Identity registration to `Invite only`.

## Invitation flow

1. Sign in to `/admin.html` with the configured administrator account.
2. Enter an email.
3. Select Player Tool, Keeper Tool, or both.
4. Send the Netlify Identity invitation.
5. The user accepts the email invitation and signs in.

Role changes take effect after the user's Identity session refreshes. Ask the
user to sign out and sign back in when testing a changed role.

## Enforcement layers

- Netlify role redirects protect both HTML routes.
- `wip-access.js` provides the user-facing locked screen.
- `/api/tool-access` rechecks the role server-side.
- `/api/table-api` and `/api/firebase-auth-token` reject accounts without a
  protected-tool role.
- Tool pages and APIs use no-store caching.

## Account and data deletion

Users can delete their own non-administrator account from Account & Character
Vault by entering their exact email and `DELETE MY DATA`.

The administrator can delete another non-administrator Identity account from
the portal after typing its exact email. Before the Identity account is
removed, the server:

- deletes Character Vault records and profile state;
- removes table memberships and user-linked table characters;
- deletes invitations created for or by the user;
- transfers an owned shared table to another member when one exists;
- deletes an empty owned table, including its handouts, secrets, directory
  entry and invitations.

The Netlify Identity `userDeleted` lifecycle handler repeats the purge
idempotently when deletion is initiated directly from Netlify.

## Deploy Preview acceptance

- Confirm `VF_ADMIN_EMAIL` is Functions-only and matches the administrator.
- Confirm a `member` receives 403 from protected APIs.
- Confirm `player` can open Player Tool but not Keeper Tool.
- Confirm `keeper` can open Keeper Tool but not Player Tool.
- Confirm `admin` can open all three protected areas.
- Confirm the portal cannot assign or delete an `admin`.
- Confirm a deleted member disappears from sessions and the Character Vault.
- Confirm an owned shared table transfers instead of deleting other users'
  data.
- Review Netlify logs for `admin-users`, `privacy-delete`, and Identity purge
  failures.
