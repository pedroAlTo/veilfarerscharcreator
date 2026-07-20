# VeilFarers Portal v59.50 — Deploy / PR Summary

## Objective

Close the authenticated Player/Keeper reload loops and make one permanent Character ID behave as one Player Tool record, without changing the protected v59.25 dice renderer or the approved v59.49 account/Vault architecture.

## Changes

### Player Tool authenticated startup

- Removed `location.reload()` from `character-sync-adapter.js` registry subscriptions.
- Vault and cross-tab character updates now rewrite the Player Tool local record and emit `veilfarers:player-record-updated`.
- The mounted React application listens for that event and updates state in place.
- Login/cloud refresh therefore no longer restarts the full Player Tool loading shell.

### Character deduplication and ID migration

- Player records are matched by normalized permanent `characterId`.
- Exact duplicate IDs collapse to one record, retaining the newest local runtime values.
- A `PENDING-*` record is migrated to its allocated `VF-######` identity in place.
- The registry emits `previousCharacterId` during allocation so the adapter can remove the pending owner and its pending drone records without guessing.
- Existing HP, Stress, Hope/Effort, Resolve, Armor, Conditions and other runtime state are retained while the canonical build is refreshed.

### Character ID presentation

- Removed the fixed bottom-corner Character ID callout.
- Added the selected Character ID to the shared portal navigation on every page.
- The navigation chip follows the same current-ID storage and cross-tab update events.

### Keeper Tool initialization

- Removed registry-driven reloads from Keeper Tool.
- Firebase initialization is now serialized through one shared promise.
- Firestore settings use `merge: true`, preventing repeated settings/host-override warnings.
- Table listing begins only after the authenticated Keeper user event is available.

### Deploy Preview console noise

- No application dependency was added for Segment or Bugsnag.
- `cdn.segment.com` and `sessions.bugsnag.com` `ERR_BLOCKED_BY_CLIENT` messages shown under `cdp/?deployID=...`, `_app.tsx` or Next.js frames belong to the Netlify Deploy Preview interface and browser privacy blocking, not to VeilFarers code.
- The portal CSP was not relaxed to accommodate third-party Netlify analytics.

## Security / data impact

- No new environment variables.
- No change to table ownership, membership, invitation or password authorization.
- No change to Character Vault server ownership enforcement.
- No direct browser Character Vault CRUD was reintroduced.
- No change to Firestore collection paths or project-wide Rules.

## Protected behavior

- `assets/3d-dice` contains 87 files and matches v59.49 byte-for-byte.
- The v59.25 dice result calculation and renderer remain frozen.
- Shake to Roll continues to invoke the existing roll entry point only.

## Automated validation

- All portal JSON parsed.
- First-party JavaScript passed `node --check`.
- All inline HTML scripts, including Player Tool JSX, parsed with the TypeScript JSX parser.
- All Netlify `.mts` functions parsed.
- Pending → final Character ID migration fixture passed.
- Exact duplicate Character ID fixture passed.
- Player helper deduplication fixtures passed.
- No registry reload call remains.
- Public npm registry lockfile check passed.
- Protected dice hashes match v59.49.
- ZIP root and security scan passed.

## Manual QA required

1. Sign in, open Player Tool and confirm the loading shell appears only once.
2. Refresh the Vault and confirm Player Tool updates without a page reload.
3. Open the same Vault character repeatedly and confirm one Player tab remains.
4. Complete a `PENDING-*` character and confirm it becomes one `VF-######` Player record with runtime tracks preserved.
5. Confirm the Character ID appears in navigation and no corner callout remains.
6. Open Keeper Tool while signed in and confirm one initialization/table-list cycle and no host-override warning.
7. Test real table connect, reconnect and listener teardown.
8. Ignore Netlify CDP Segment/Bugsnag blocked-client noise unless a VeilFarers-owned script or API also fails.

## Deployment notes

- Deploy as the complete v59.50 artifact; do not copy only the changed files over an unknown branch state.
- Hard-refresh after Netlify publishes.
- Keep Firestore Rules deployment separate from this code-only hotfix; project-wide Rules still require a coordinated table-security cutover.
