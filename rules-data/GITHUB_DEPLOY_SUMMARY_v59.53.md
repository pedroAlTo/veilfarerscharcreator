# VeilFarers Portal v59.53 - Deploy / PR Summary

## Objective

Resolve Deploy Preview feedback around Keeper table connectivity, historical character import, catalogue filtering, mobile Shake to Roll and Player Tool production runtime without changing the protected v59.25 dice result/renderer behavior.

## Changes

### Keeper table connection

- Added authenticated `/api/table-api` action `readSession`.
- Keeper Tool now authorizes through `VFTableAccess`, then reads the current session through the server API on a guarded 1250 ms poll.
- Removed the Keeper browser `onSnapshot()` connection dependency that could fail with `permission-denied` when a preview used production Firebase Rules.
- Session writes remain whitelisted server actions (`patchSession`, `broadcastRoll`, targeted handouts, invitation/password/member administration).

### Historical JSON import and Vault

- Added **Import Character** to Account/Character Vault.
- Vault import routes through the canonical Creator compatibility normalizer.
- Registered imports await registry/cloud sync and open the final Creator review step.
- Authenticated legacy imports without an ID receive `VF-######` and become completed Vault records; offline imports remain `PENDING-*` until sync.
- Existing permanent IDs update the matching record rather than creating an unrelated copy.

### Catalogue filters

- Pack/source, Tier, category, property, owned state and cost are now multi-select.
- OR semantics inside each filter group; AND semantics between groups.
- Filter menus stay open while selecting several values.

### Player Tool controls

- Shake to Roll opens/restores the Duality roller and invokes the existing Hope/Fear roll in the selected 2D/3D mode.
- Spectrum of Fate defaults to enabled and is shared across Player Tool characters/tabs on the current browser/device.
- Options are grouped into Appearance, Rules, Dice, Audio and Spotlight.
- Firebase runtime initialization is single-flight to prevent duplicate auth/connect sequences.

### Production build cleanup

- Removed runtime Tailwind CDN and Babel standalone.
- Added compiled `assets/player-tool-tailwind.css` and `player-tool.bundle.js`.
- Vendored React/ReactDOM 18.3.1 locally.
- Removed Player Tool dependency on `unsafe-eval`, unpkg and Tailwind CDN CSP sources.
- Updated third-party notices.

## Protected behavior

- No file under `assets/3d-dice` changed; all 87 files match v59.52 byte-for-byte.
- Hope/Fear resolution, damage integration, critical behavior and existing 3D renderer behavior remain frozen.
- No VeilFarers branding or canon text was changed.

## Dependencies

```text
@netlify/identity 1.1.x
@netlify/functions 5.3.x
React / ReactDOM 18.3.1 (vendored browser production builds)
```

`package.json` and `package-lock.json` are version `59.53.0`. npm resolves exclusively through `https://registry.npmjs.org/`.

## Environment variables

No new variable names:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
FIREBASE_SERVICE_ACCOUNT_JSON
```

## Firestore Rules boundary

`firestore_v59.53.rules` is included as the retained authenticated baseline. Keeper session reads now use Firebase Admin through the authenticated server API, so testing this specific fix does not require deploying different project-wide Rules. Player real-time table listeners still depend on active membership Rules.

## Automated validation

- JSON parse, standalone JavaScript and inline-script syntax checks passed.
- Generated Player Tool bundle passed `node --check`.
- Netlify `.mts` functions compiled with TypeScript/Node types under project compatibility settings.
- Static assertions passed for Keeper server reads, Vault import/final step, multi-select filters, Spectrum default, Shake Duality and single Player bundle.
- `npm ci` completed against the public registry with zero reported vulnerabilities.
- No runtime Tailwind/Babel/internal-registry references remain.
- Exact 3D dice asset hash comparison passed for 87 files.
- ZIP structure and credential/private-key scans passed.
- DOCX handover rendered and all pages were visually inspected.

## Manual QA required

- Open/protected/member Keeper connection in a real Deploy Preview.
- Representative old JSON import from Vault, Creator and Level Up.
- Real iOS/Android Shake to Roll in 2D and 3D.
- Multi-select filtering across every equipment tab.
- Fresh-profile Spectrum default and cross-tab synchronization.
- Console/network confirmation that runtime Tailwind/Babel warnings and duplicate Firebase initialization are gone.
