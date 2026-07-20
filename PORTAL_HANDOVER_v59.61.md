# VeilFarers Portal v59.61 — Technical Handover

## Release objective

Restore the Ammo WebAssembly physics runtime used by the bundled 3D dice renderer on the Netlify production origin.

## Incident sequence

### v59.59 failure

The 3D module graph referenced `assets/3d-dice/Dice.min.js`, but only `dice.min.js` existed. Netlify/Linux treated those as different paths and returned 404.

### v59.60 correction

A byte-identical `Dice.min.js` compatibility alias was added. This allowed Babylon and the renderer module graph to progress far enough to reveal the second production blocker.

### Remaining failure

The Netlify response CSP defined `script-src` without a WebAssembly execution source. Browser logs showed both streaming and ArrayBuffer instantiation rejected by CSP:

```text
WebAssembly.instantiateStreaming(): compiling or instantiating WebAssembly violates CSP
WebAssembly.instantiate(): compiling or instantiating WebAssembly violates CSP
```

Ammo then emitted its generic missing-file message, although the URL and asset were correct. Because the physics runtime never existed, worker code subsequently attempted to access undefined Ammo bindings and produced `setValue` errors. Player Tool eventually timed out and switched to its standard roller.

## Root cause

`netlify.toml` used this script policy:

```text
script-src 'self' 'unsafe-inline' blob: https://cdn.jsdelivr.net https://www.gstatic.com https://identity.netlify.com
```

A CSP containing `script-src` blocks WebAssembly compilation unless WebAssembly execution is explicitly permitted.

## Applied correction

The policy now uses:

```text
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net https://www.gstatic.com https://identity.netlify.com
```

`'wasm-unsafe-eval'` was chosen instead of `'unsafe-eval'` because it permits WebAssembly compilation/instantiation without enabling general JavaScript `eval()` or `Function()` execution.

## Files modified

- `netlify.toml`: added `'wasm-unsafe-eval'` to `script-src`.
- `package.json`: version `59.61.0`.
- `package-lock.json`: root package version `59.61.0`.
- `data/changelog.json`: current version and v59.61 entry.
- Release documentation for v59.61.

## Preservation guarantees

Unchanged:

- Ammo binary contents and path;
- `Dice.min.js` and `dice.min.js` vendor modules;
- `vf-dice3d.js`, world modules and Player Tool renderer logic;
- generated roll values;
- Duality resolution and no-reroll behavior;
- damage dice and modifiers;
- Plain, Tech and Crystal visual themes;
- Hope, Fear, winner, discarded and critical cues;
- Firebase configuration and Netlify Functions;
- Identity roles and table authorization;
- Firestore Rules and stored data;
- canonical rules and editorial content.

## Expected request chain after deployment

1. Player Tool loads `vf-dice3d.js` and the selected world renderer.
2. Exact-case `Dice.min.js` resolves with HTTP 200.
3. The worker requests `/assets/3d-dice/assets/ammo/ammo.wasm.wasm`.
4. The browser reads `'wasm-unsafe-eval'` from the HTML response CSP.
5. Ammo WebAssembly compiles and instantiates.
6. Physics bindings including `setValue` become available.
7. The renderer resolves readiness before the Player Tool timeout.
8. Physical dice appear; application-generated numeric values remain authoritative.

## Live deployment checks

### Confirm the active header

Inspect the **document response**, not only `netlify.toml`, and confirm the received Content-Security-Policy includes `'wasm-unsafe-eval'` under `script-src`.

If it does not appear, the likely causes are:

- an older deploy remains published;
- another Netlify header definition overrides this one;
- a proxy or custom domain adds a second CSP;
- the tested tab has not reloaded the newly deployed document.

Multiple CSP headers are cumulative. A second stricter CSP without `'wasm-unsafe-eval'` can still block WASM even when the Netlify policy is correct.

### Confirm resource delivery

- `Dice.min.js`: HTTP 200 and JavaScript MIME type.
- `ammo.wasm.wasm`: HTTP 200 and preferably `application/wasm`.
- No CSP block in the Network or Console panels.

### Confirm renderer behavior

- 3D canvas initializes.
- Standard and Duality dice settle.
- Physics collisions occur.
- Themes render.
- No Ammo missing-file, `setValue` or initialization-timeout errors remain.

## Security note

This release does not add general `'unsafe-eval'`. Do not replace `'wasm-unsafe-eval'` with `'unsafe-eval'` unless a separate audited dependency genuinely requires JavaScript string evaluation.

## Rollback

Redeploy v59.60. No data rollback is needed. The portal remains operational through the existing standard dice fallback, but 3D physics will again be blocked by CSP.

## Next recommended hardening

The portal still uses `'unsafe-inline'` because of existing inline scripts. A future security-focused release can migrate inline application code to external files or nonce/hash-authorized scripts. That is outside this hotfix and should not be combined with the dice restoration.
