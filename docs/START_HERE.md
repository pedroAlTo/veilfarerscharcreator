# VeilFarers Portal v59.81 — start here

This is a complete GitHub/Netlify deployment package, restructured so that
internal documentation is no longer served to the public web. It replaces the
mixed `start_here.txt` (v59.80) / `start_here_v59.81.txt` pair, which disagreed
about the current release.

## Repository layout

```
public/            <- the only directory Netlify publishes
netlify/functions/ <- serverless functions (nothing else lives here)
docs/              <- handovers, validations, security and legal notes; NOT published
docs/history/      <- superseded versions of the same documents
source/            <- player-tool.jsx, precompiled into public/player-tool.bundle.js
scripts/           <- verify-deploy.mjs and operational scripts
tests/             <- Node test suite (14 tests)
netlify.toml       <- publish = "public"
firestore.rules    <- deploy to Firebase separately
```

Everything the browser can reach is under `public/`. If a file should not be
readable by a stranger with the URL, it does not belong there.

## Before merging

```bash
npm install
npm run check      # verify-deploy.mjs + the 14 tests
```

`npm run verify` fails the build on nested duplicate copies, internal documents
inside `public/`, broken or case-mismatched asset references, release-version
drift and credential-shaped strings. Run it on every branch before merging.

## Deployment

1. Create a branch from the currently deployed portal.
2. Replace the branch contents with this package, preserving repository history
   and the Netlify site link.
3. In Netlify Identity, set Registration to **Invite only**.
4. Give only the owner account the `admin` Identity role.
5. Set the Functions-only environment variable `VF_ADMIN_EMAIL` to that owner
   account's normalized email address.
6. Confirm every `FIREBASE_*` variable holds its Firebase Web App value, and that
   the browser API key is restricted in Google Cloud to the intended APIs and to
   the production and preview origins.
7. Deploy the branch as a Deploy Preview.
8. Work through `docs/validation_v59.81.txt`. Every line is currently PENDING.
9. Merge and deploy production only after the preview passes.

## Access roles

- `member` — account only; no Player or Keeper Tool access
- `player` — Player Tool
- `keeper` — Keeper Tool and the `/adventures/*` source text
- `admin` — administration and both tools

Invite players and Keepers from `/admin.html`. Do not make them Netlify team
collaborators.

## What is still open

- `docs/validation_v59.81.txt` — every deploy-preview line is PENDING.
- `docs/legal_launch_checklist_v59.80.md` treats public interactive publication
  as a launch blocker until qualified counsel or Darrington Press confirms that
  the portal and Creator format is permitted under the DPCGL. Nothing in this
  package resolves that. Keep the portal Invite only until it is resolved.
- `public/download/` is not behind a role condition. Any of the eleven PDFs can
  be fetched by direct URL by anyone who knows the filename. That is fine if the
  books are meant to be freely downloadable, and must be changed if they are not.
- The v59.81 privacy panel has not yet been exercised in a deploy preview.

## Current books

- Corebook 11.35 (retained valid portal copy; the newer upload was truncated)
- Keeper's Companion 11.4
- Hearts in the Void 1.0, standalone adventure
- Rust & Steel 11.33
- Alien Species 11.33
