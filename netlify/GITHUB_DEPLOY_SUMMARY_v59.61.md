# VeilFarers Portal v59.61 — 3D Dice WebAssembly CSP Hotfix

## Summary

This release fixes the remaining production failure preventing the Player Tool's 3D dice physics engine from initializing on Netlify.

v59.60 corrected the case-sensitive `Dice.min.js` module path. After that module loaded correctly, the browser exposed the next blocking issue: the site's Content Security Policy did not permit WebAssembly compilation or instantiation.

The Ammo physics module was present and requested from the correct path, but the browser rejected both `WebAssembly.instantiateStreaming()` and the ArrayBuffer fallback before the physics worker could initialize.

## Root cause

The deployed CSP contained:

```text
script-src 'self' 'unsafe-inline' blob: https://cdn.jsdelivr.net https://www.gstatic.com https://identity.netlify.com
```

The bundled Ammo physics engine requires WebAssembly execution. When a page defines `script-src`, WebAssembly compilation is blocked unless the policy includes either the broad `'unsafe-eval'` permission or the narrower `'wasm-unsafe-eval'` permission.

The browser therefore produced:

```text
WebAssembly.instantiateStreaming(): ... violates Content Security Policy
WebAssembly.instantiate(): ... violates Content Security Policy
```

The subsequent `Ammo file ... not found` message was a downstream initialization message, not an actual missing-file condition.

## Fix

Updated `netlify.toml` so the portal CSP now includes:

```text
'wasm-unsafe-eval'
```

inside `script-src`.

The resulting directive is:

```text
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net https://www.gstatic.com https://identity.netlify.com
```

This permits WebAssembly compilation and instantiation while keeping general JavaScript `eval()` and `Function()` execution blocked. The broader `'unsafe-eval'` permission was deliberately not added.

## Included previous hotfix

v59.61 retains the v59.60 exact-case module compatibility file:

```text
assets/3d-dice/Dice.min.js
```

This means both known Netlify blockers are corrected:

1. Case-sensitive ES-module resolution.
2. WebAssembly execution under CSP.

## Files changed

- `netlify.toml`
- `package.json`
- `package-lock.json`
- `data/changelog.json`
- `START_HERE_v59.61.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.61.md`
- `PORTAL_HANDOVER_v59.61.md`
- `VALIDATION_v59.61.txt`

## Explicitly unchanged

- Dice result generation and randomization.
- Duality Hope/Fear comparison.
- Advantage, disadvantage and damage roll rules.
- Dice physics configuration and visual themes.
- Winner, discarded-die and critical visual effects.
- Player Tool and Keeper Tool game mechanics.
- Firebase, Firestore, Netlify Identity and table data contracts.
- Firestore Rules.
- Canonical VeilFarers rules and editorial data.
- The Ammo WASM binary and bundled 3D-dice vendor modules.

## Deployment

1. Replace the repository contents with `VeilFarers_Portal_v59.61_3D_Dice_WASM_CSP_Hotfix.zip`.
2. Commit and push to a test branch.
3. Let Netlify create a Deploy Preview.
4. Verify the deploy uses the repository `netlify.toml` headers.
5. Open Player Tool from the Deploy Preview.
6. Perform a hard refresh before testing.

No Firebase migration, Firestore Rules deployment or environment-variable change is required.

## Deploy Preview acceptance

### Response headers

Open DevTools → Network → the Player Tool HTML document and confirm its response CSP contains:

```text
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:
```

A CSP shown only in the HTML source is insufficient; it must be present in the actual response headers.

### WASM and physics

Confirm:

- `/assets/3d-dice/assets/ammo/ammo.wasm.wasm` returns HTTP 200.
- Its response is not blocked by CSP.
- `WebAssembly.instantiateStreaming()` no longer reports a CSP violation.
- The ArrayBuffer fallback no longer reports a CSP violation.
- No `Ammo file ... not found` message appears.
- No worker `setValue` errors appear after initialization.
- Babylon.js initializes and the dice physics simulation becomes ready.

### Player Tool dice

Test:

- Standard 3D roll.
- Duality roll.
- Damage roll.
- Plain, Tech and Crystal presentations.
- Winner highlighting.
- Lower-die power-down behavior.
- Critical matching result cue.
- Numerical fallback when 3D is manually disabled.

## Risk assessment

**Risk level: Low to moderate.**

The change expands script execution permission only for WebAssembly. It does not enable general JavaScript string evaluation. The permission applies portal-wide because the current CSP is portal-wide, but the executable WASM remains constrained by the existing script, worker, connection and same-origin restrictions.

## Rollback

Redeploy v59.60 or v59.59.

No database or Firebase rollback is required. Rolling back will restore the CSP block and prevent the 3D physics engine from initializing on browsers that enforce WebAssembly CSP.
