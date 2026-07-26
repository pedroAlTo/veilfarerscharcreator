# VeilFarers Portal v59.63 — Deploy-Authoritative CSP and 3D Dice Preflight

## Summary

This release fixes the remaining production failure of the Player Tool 3D dice engine.

The v59.62 package already contained `'wasm-unsafe-eval'` in `netlify.toml`, but the browser console proved that the deployed HTML response still used the older `script-src` policy without that source expression. Therefore Ammo WebAssembly was blocked before the physics engine could initialize. The later “Ammo file not found”, `setValue` and timeout errors were consequences of that CSP rejection.

## Root cause

The effective HTTP response header—not the repository file—remained:

```text
script-src 'self' 'unsafe-inline' blob: https://cdn.jsdelivr.net https://www.gstatic.com https://identity.netlify.com
```

Because a CSP with `script-src` blocks WebAssembly compilation unless explicitly permitted, both streaming and ArrayBuffer instantiation failed.

The previous fix existed only in `netlify.toml`. The active Netlify deployment was not applying that configuration, was publishing a different directory/deploy, or had another CSP source.

## Changes

- Added a root publish-directory `_headers` file containing the complete security policy.
- Added `'wasm-unsafe-eval'` to `script-src` in both `_headers` and `netlify.toml`.
- Kept general JavaScript `'unsafe-eval'` blocked.
- Added `X-VeilFarers-Release: v59.63` and `X-VeilFarers-CSP-Profile: wasm-3d-dice-v2` response markers.
- Added `data/deploy-version.json` so the active static release can be verified independently of browser cache.
- Added `application/wasm` response metadata for the Ammo path.
- Added a minimal WebAssembly preflight before DiceBox initialization.
- Added the explicit `VF_WASM_CSP_BLOCKED` diagnostic instead of waiting for Ammo and renderer timeouts.
- Added a console release marker from `vf-dice3d.js`.
- Added release metadata to every root HTML entry point.

## Preserved fixes

- v59.60: exact-case `assets/3d-dice/Dice.min.js` compatibility module.
- v59.61: narrow WebAssembly CSP permission.
- v59.62: Keeper Tool startup decoupled from Character Vault and safe Firebase Admin diagnostics.

## Explicitly unchanged

- Dice random results and game-rule resolution.
- Duality, Hope, Fear, critical and damage calculations.
- Babylon renderer, DiceBox library and Ammo binary.
- Dice themes, textures, physics parameters and visual outcome choreography.
- Firebase/Firestore data contracts and canonical rules datasets.

## Deployment

1. Deploy the contents of `VeilFarers_Portal_v59.63_Deploy_CSP_3D_Dice_Hotfix.zip` from its root.
2. Confirm Netlify’s deployed-file explorer contains `_headers`, `netlify.toml`, `player-tool.html`, `data/deploy-version.json` and the `assets` directory at the publish root.
3. Trigger a new production deploy.
4. Open `/data/deploy-version.json`; it must report `v59.63`.
5. Hard-refresh `/player-tool.html`.

## Acceptance tests

### Effective headers

The `player-tool.html` response must contain:

```text
X-VeilFarers-Release: v59.63
X-VeilFarers-CSP-Profile: wasm-3d-dice-v2
```

Its CSP `script-src` must include:

```text
'wasm-unsafe-eval'
```

If the response still contains the old policy, this package is not the active publish root or another CSP layer is enforcing an additional policy.

### WASM

- `/assets/3d-dice/assets/ammo/ammo.wasm.wasm` returns 200.
- Its response identifies `application/wasm`.
- No `WebAssembly.instantiateStreaming` CSP violation appears.
- No ArrayBuffer instantiation CSP violation appears.

### Renderer

- Console prints `[VeilFarers v59.63] 3D dice loader active`.
- A standard 3D roll initializes without timeout.
- Duality renders Hope and Fear dice.
- Damage dice render with the configured theme.
- No `VF_WASM_CSP_BLOCKED`, “Ammo file not found”, `setValue`, or renderer timeout cascade appears.

### Keeper preservation

- Keeper Tool opens without a startup `/api/character-vault` call.
- Local Keeper campaigns remain available if cloud services are unavailable.
- Cloud endpoints retain v59.62 safe Firebase Admin diagnostics.

## Risk assessment

**Risk level: Low to moderate.**

The functional change is limited to deployment headers and an early capability check. The broader JavaScript `'unsafe-eval'` permission is not enabled. The Ammo binary and renderer libraries are unchanged.

## Rollback

Redeploy v59.62. No database migration or Firestore rollback is required. Rolling back also restores the deployment-path ambiguity that allowed the old CSP to remain active.
