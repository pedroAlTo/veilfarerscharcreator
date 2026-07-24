# Netlify secret-scanning correction — v59.80

Netlify blocked the deploy because the Firebase Web SDK configuration is
intentionally available to the browser through `/api/firebase-config`.

`netlify.toml` now excludes only these public Firebase application identifiers
from environment-value scanning:

- `FIREBASE_API_KEY`
- `FIREBASE_APP_ID`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_MEASUREMENT_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`

The scanner remains enabled. No paths are excluded. Sensitive variables such as
`FIREBASE_SERVICE_ACCOUNT_JSON` and `VF_ADMIN_EMAIL` remain scanned and must
never be committed or returned to the browser.

Before redeploying, verify in Netlify that every listed `FIREBASE_*` variable
contains its corresponding Firebase Web App value. None of them should contain
the public contact email. The browser API key must remain restricted in Google
Cloud/Firebase to the intended APIs and production/preview origins.
