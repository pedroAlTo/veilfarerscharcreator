# Netlify Edge Functions dependency fix

The 11 September 2026 deploy failed while bundling integration-generated Edge Functions in `.netlify/edge-functions`: the bundler could not resolve `@netlify/blobs`. The application repository had not declared this dependency. The log alone does not identify which generated function imports it.

The dependency and lockfile changes prepared by Netlify in commit `3df4bf0` (PR #12) are included here: `@netlify/blobs` is a production dependency at `^11.0.3`, locked to 11.0.3. `.nvmrc` selects Node 24, matching the runtime used for local validation and satisfying the package's Node >=22.12 requirement.

No `external_node_modules` workaround was added. That setting configures Node serverless function bundles; this failure is in Edge Functions. No integration was disabled.

Syncing the GitHub release also exposed stale links in `public/rules-data/downloads.json` after four older PDFs had been removed. This compatibility index now matches the current 12.06/First Crossing catalogue. A regression test checks that the two indexes remain consistent.

Validation:

- Clean dependency installation using `npm ci --ignore-scripts --no-audit --no-fund` on Node 24.19.0.
- `@netlify/blobs` imports successfully and exports `getStore`, without accessing a store.
- The official `@netlify/edge-bundler` 16.0.4 successfully bundled a local fixture importing `@netlify/blobs` by package name. The fixture and bundler installation remain in ignored `tmp/`; no diagnostic endpoint is shipped.
- Deployment asset verifier: zero missing references, errors or warnings.
- Existing 62 Node tests plus the download-index regression test pass.
- Desktop and mobile browser checks pass for the three-book First Crossing CTA, notice controls, dice, station sectors and retained survey.

The local fixture verifies module resolution and Edge bundling. It does not reproduce Netlify's private integration-generated functions or their production configuration; the complete deployment still needs a passing Netlify build.

References: [Edge Functions API](https://docs.netlify.com/build/edge-functions/api/), [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [Node function bundle configuration](https://docs.netlify.com/build/functions/configuration/).
