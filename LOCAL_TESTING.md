# VeilFarers local testing

The production deployment remains Netlify-first. The local server only emulates the existing `/api/firebase-config` endpoint and marks the browser as a local test session. It does not change the Netlify Function or embed Firebase values in the site.

## Requirements

- Node.js 18 or newer.
- Internet access for the externally hosted React, Firebase, Netlify Identity, Babel and Tailwind browser libraries.
- A Firebase Web configuration if you want to connect Player Tool and Keeper Tool to shared tables.

## Quick start on Windows

1. Copy `local/.env.local.example` to `local/.env.local`.
2. Set `FIREBASE_API_KEY` in `local/.env.local`. Keep the file private.
3. Double-click `local/START_LOCAL_WINDOWS.bat`.
4. Open `http://localhost:8888`.

To test from a phone on the same network, run `local/START_LOCAL_LAN_WINDOWS.bat` and open the printed LAN address on the phone.

## macOS or Linux

```bash
cp local/.env.local.example local/.env.local
# Edit local/.env.local
sh local/start-local.sh
```

For another device on the same local network:

```bash
sh local/start-local-lan.sh
```

## What works locally

- Character Creator, Card Library and local character storage.
- Character Sheet, PDF generation and JSON import/export.
- Player Tool and Keeper Tool.
- Shared Firebase tables when `local/.env.local` is configured.
- 2D/3D dice, sounds, callouts, history and Time Travel.
- Armory, items, downloads and feedback preview behavior.
- Admin diagnostics in a clearly marked local-only bypass.

## Intentional local limitations

- Netlify Identity login, roles and the online character vault remain online-only.
- Netlify Forms submissions are simulated locally and are only stored by the deployed Netlify site.
- The local server is for development and testing, not public hosting.

## Production safety

- Netlify still serves Firebase configuration exclusively through `netlify/functions/firebase-config.mts`.
- `window.VF_LOCAL_TEST` is `false` in the published static file. Only the local server overrides that route with `true`.
- Keeper/Admin role bypasses run only when the bundled local server explicitly sets local test mode.
- `local/.env.local` is ignored by Git and should never be committed.
