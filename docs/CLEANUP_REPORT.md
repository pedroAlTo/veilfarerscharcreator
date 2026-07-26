# v59.81 package cleanup — what changed and why

Input: `deploy-6a6308e6f518f00008476641.zip`, 1350 files, 253 MB.
Output: 548 files, 116 MB. No application logic was modified.

## 1. Nested duplicate copies removed (417 files)

`netlify/` contained a full stale copy of the site alongside `functions/`,
including a second `netlify/netlify/functions/` with seven older function files.
`rules-data/` contained another full copy of the site, frozen around v59.63.

Both were removed. `netlify/` now holds only `functions/` (15 files) and
`public/rules-data/` now holds only the canonical rules database:
`manifest.json`, `core/`, `rust-and-steel/`, `alien-species/`, `aliases.json`,
`feature-aliases.json`, `features-registry.json`, `migration-map.json`,
`rules.json`, `search-index.json`, `downloads.json`.

Nothing referenced by the application was in the removed copies. `npm run verify`
now fails the build if a nested copy reappears.

## 2. Publish directory narrowed

`netlify.toml` had `publish = "."`, so the entire repository was served. Anyone
could fetch `/portal_handover_v59.81.md`, `/security_identity_access_v59.80.md`,
the thirty-nine historical `firestore_*.rules` files, the working `.docx`
handovers and the QA screenshots.

The deployable site now lives in `public/` and `netlify.toml` sets
`publish = "public"`. Internal material moved to `docs/` (current, 23 files) and
`docs/history/` (superseded, 219 files), neither of which is published.
`player-tool.jsx` moved to `source/`, since production loads the precompiled
`public/player-tool.bundle.js`.

`SECRETS_SCAN_OMIT_PATHS` was rewritten for the new paths — `public/legal.html`,
`public/login.html`, `public/portal.js`, `docs/` — and the corresponding
assertion in `tests/identity-role-security.test.mts` was updated to match.

## 3. Adventure source text placed behind the Keeper role

`/adventures/hearts-in-the-void/` holds the full text of the adventure and is
read by the Keeper Tool, but no redirect rule protected it, so the whole
adventure was readable by direct URL while the tool itself was gated.

`netlify.toml` now applies the same `keeper`/`admin` condition to `/adventures/*`
that already guarded `/keeper-tool.html`. **Verify this in a deploy preview**:
the Keeper Tool fetches these files with a same-origin request that should carry
the Identity cookie, but that path has not been exercised yet.

Internal audit and handover notes that were sitting inside `adventures/` moved to
`docs/adventures/`.

## 4. Filename casing restored (37 entries)

Every one of the 1350 filenames in the zip was lowercase, while the application
code refers to mixed-case paths. On Netlify, URLs are case-sensitive, so every
one of these would have returned 404:

- six book PDFs referenced by `download/downloads.json`
- `Hearts_in_the_Void_COMPLETE_Corebook_11_35_KC_11_33.md`
- the `CURRENT/` directory and its eleven chapter files, loaded by
  `hearts-in-the-void-template.js`
- eighteen 3D dice theme directories under `assets/3d-dice/assets/themes/`,
  restored from the `systemName` field inside each `theme.config.json`

The names were restored to exactly what the code asks for, so no code changed.

**This is almost certainly an artefact of how the zip was produced rather than a
defect in your branch** — a project whose source writes
`Hearts_in_the_Void_COMPLETE_...` would not plausibly have every file lowercased
on disk. Run `npm run verify` against the real branch to confirm. If it reports
nothing, your branch was already correct and these renames were a no-op.

## 5. Version drift resolved

`start_here.txt` announced v59.80 and told the reader to run
`VALIDATION_v59.80.txt`, while `_headers`, `netlify.toml`, `package.json` and
`data/deploy-version.json` all said v59.81. The two `start_here` files were
superseded by `docs/START_HERE.md`, written against v59.81, and the verifier now
compares the four release markers on every run.

## 6. Added

- `scripts/verify-deploy.mjs` — checks nested duplicates, internal documents
  inside `public/`, unresolved and case-mismatched asset references, release
  drift and credential-shaped strings. Exits non-zero on any error.
- `npm test` (14/14 passing), `npm run verify`, `npm run check`.

## Not changed

No application file was edited. The Firestore rules, the fifteen serverless
functions, the CSP and security headers, and the Identity role model are exactly
as they were. The security review of those was already sound: default-deny
Firestore rules, `getUser` plus `verifyRequestOrigin` on every mutating function,
and `requirePortalAdmin` requiring both the `admin` role and a match against
`VF_ADMIN_EMAIL`.

## Still open before publication

Cleaning the package did not resolve anything on the launch checklist.
`docs/legal_launch_checklist_v59.80.md` still treats public interactive
publication as a blocker pending DPCGL confirmation, and every deploy-preview
line in `docs/validation_v59.81.txt` is still PENDING.
