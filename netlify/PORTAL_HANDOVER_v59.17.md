# VeilFarers Portal v59.17 — Technical Handover

## Scope

v59.17 is a Player Tool hotfix built directly from v59.16. It does not alter books, PDFs, canonical rule datasets, or the Railgun playtest override.

## Fixed regression: table connection

`player-tool.html` referenced `normalizeSessionKey(sessionId)` from five Firebase paths, but the helper definition was absent from v59.16.

The restored helper is:

```js
const normalizeSessionKey = (value) => String(value || '').trim() || 'Table';
```

It is defined before all uses and covers:

- connection document paths;
- roll-history clearing;
- `writeSessionField` operations;
- listener setup;
- character autosave.

The existing `vfSanitizeFirestore`, `vfFindUndefinedPaths`, SDK `ignoreUndefinedProperties`, and Keeper Tool guards remain intact.

## Fixed regression: 3D dice

### Asset path

Dice Box constructs theme URLs from `origin + assetPath`. v59.16 supplied a relative `./assets/...` path, which was not safe when concatenated with the page origin.

v59.17 derives a complete URL from the module location:

```js
const ASSET_PATH = new URL('./assets/', import.meta.url).href;
```

Dice Box receives:

```js
{
  container: '#vf-dice3d-box',
  assetPath: ASSET_PATH,
  origin: '',
  offscreen: false
}
```

This also supports Netlify Deploy Preview URLs and future nesting without hardcoding the production domain.

### Result format

The v1.1 bundled engine returns flat individual die-result arrays in the tested roll path. The previous adapter only read grouped objects containing `.rolls`.

`flattenResults` now accepts:

- flat die arrays;
- nested arrays;
- grouped arrays under `.rolls`;
- grouped object maps under `.rolls`;
- individual die objects.

Values can be read from `value`, `result`, or `roll`, and roles are mapped back to the submitted group via `groupId`.

### Module readiness

Player Tool now waits up to 2.5 seconds for the ESM module before treating 3D as unavailable. This prevents an immediate roll after selecting 3D from silently using 2D while the bundle is still loading.

### Rendering mode

`offscreen: false` is deliberate. It uses the standard onscreen Babylon canvas and avoids OffscreenCanvas/worker compatibility differences. The physics and WebGL rendering remain fully 3D.

## Theme correction

Color themes use Dice Box's documented color-material texture object:

```json
"diffuseTexture": {
  "light": "...",
  "dark": "..."
}
```

Both values point to the same numeral atlas where a fixed numeral color is required:

- `vfHope`: `diffuse-dark.png` for black numerals.
- `vfFear`: `diffuse-dark.png` for black numerals.
- `vfDamage`: `diffuse-light.png` for white numerals.
- `vfNeutral`: `diffuse-light.png` for white numerals.

The technological `tech-normal.png` and `tech-specular.jpg` maps remain intentionally subtle.

## Diagnostics

The module exposes:

```js
window.VFDice3D.status()
```

Example result:

```json
{
  "ready": true,
  "assetPath": "https://deploy-preview.example/assets/3d-dice/assets/",
  "error": null
}
```

Use this in browser DevTools when diagnosing a Deploy Preview.

## Files changed from v59.16

- `player-tool.html`
- `assets/3d-dice/vf-dice3d.js`
- `assets/3d-dice/assets/themes/vfHope/theme.config.json`
- `assets/3d-dice/assets/themes/vfFear/theme.config.json`
- `assets/3d-dice/assets/themes/vfDamage/theme.config.json`
- `assets/3d-dice/assets/themes/vfNeutral/theme.config.json`
- `data/changelog.json`
- `feedback.html`
- `START_HERE.txt`
- release documentation and validation report

## Unchanged assets

Byte equality against v59.16 was confirmed for:

- Corebook 11.1 RC3.1 PDF;
- Keeper's Companion PDF;
- Rust & Steel PDF;
- Alien Species PDF;
- fillable character-sheet PDF;
- `data/weapons.json`;
- `rules-data/core/weapons.json`.

## Deploy Preview checks

1. Open Player Tool and connect to a table.
2. Run `VFDice3D.status()` in the console.
3. Select 3D and roll Duality dice.
4. Confirm a Babylon canvas is visible and both result values match DisplayResults and the application roll.
5. Roll damage and Railgun/Massive.
6. Confirm Firebase callouts in a second browser.
7. Disable WebGL and verify the controlled 2D fallback.
