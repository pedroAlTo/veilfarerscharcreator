# VeilFarers Portal v59.80 — GitHub deploy summary

## What changed

- Replaced shared WIP invitation tokens with Netlify Identity invitations.
- Added explicit `player`, `keeper` and `admin` authorization.
- Restricted administrative actions to the `admin` role plus `VF_ADMIN_EMAIL`.
- Added an administrator screen for invitations, role changes and confirmed deletion.
- Added self-service account deletion and automated linked-data cleanup.
- Updated Keeper's Companion to 11.4.
- Published Hearts in the Void 1.0 as a standalone adventure.
- Updated Rust & Steel and Alien Species to 11.33.
- Retained the valid Corebook 11.35 because the newly supplied file was truncated.

## Recommended branch

Create `release/v59.80-private-access`, deploy it as a Netlify Deploy Preview,
and merge only after the role and deletion matrix in `VALIDATION_v59.80.txt`
passes.

This ZIP is a complete package. Extract it at the repository root; do not layer
it over production manually.

## Netlify configuration

1. Set Identity Registration to Invite only.
2. Assign `admin` only to the owner Identity user.
3. Set the Functions-only `VF_ADMIN_EMAIL` value to that same email.
4. Leave players and Keepers as Identity users, not Netlify team collaborators.
5. Invite and assign `player`, `keeper`, or both from `/admin.html`.

## Rollback

Keep the previous production deploy available in Netlify. If acceptance fails,
do not merge the branch; restore the earlier production deploy and inspect the
Function logs. Do not re-enable the retired WIP-token gate.
