# VeilFarers Portal v59.27 — Public Launch Security Plan

**Date:** 17 July 2026  
**Status:** deploy-preview candidate; public static access can be tested, but private campaign data is **not yet production-secure**.  
**Scope:** Netlify, Netlify Identity, Firebase Authentication/Firestore, browser runtime, third-party dependencies and operational controls.

## 1. Executive security position

v59.27 materially improves the portal's public-facing baseline, but it must not be described as fully secured for private campaign data yet.

The release now protects Keeper and Admin routes at Netlify's CDN edge, hides Admin navigation from ordinary users, disables public table discovery by default, removes secrets-scanner suppression, returns Firebase configuration with `no-store`, and adds a baseline Content Security Policy and related browser security headers.

These controls reduce exposure. They do **not** replace Firestore Security Rules or authenticated table membership. The existing table password/hash is processed by browser-side code and should be treated as a convenience gate, not as authoritative access control. A determined client must not be trusted merely because the normal UI asks for the password.

## 2. Security controls implemented in v59.27

### 2.1 Netlify edge authorization

The following routes now have role-based redirects in `netlify.toml`:

- `/keeper-tool` and `/keeper-tool.html`: requires `keeper` or `admin`.
- `/admin` and `/admin.html`: requires `admin`.
- Users without the relevant role are redirected to `/login.html`.

The browser-side role checks remain as UX fallbacks, but production authorization for these pages no longer depends only on JavaScript.

### 2.2 Admin navigation visibility

`portal.js` hides the Admin entry by default and exposes it only to users whose Netlify Identity role list contains `admin`. The local test server may expose it under the explicit local-test flag; this exception is not active in production.

### 2.3 Private-by-default table discovery

A new environment flag controls whether Player and Keeper tools may enumerate table/session documents:

```text
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
```

The default is `false`. When disabled:

- Player Tool does not query the public table directory.
- Keeper Tool does not list all available sessions.
- Users must enter an exact table name/identifier.

This prevents casual enumeration but does not protect a known or guessed table ID. Firestore Rules must provide the real boundary.

### 2.4 Runtime configuration handling

`/api/firebase-config` now:

- returns `Cache-Control: no-store`;
- returns JSON-specific hardening headers;
- fails with HTTP 503 when `FIREBASE_API_KEY` is missing;
- exposes `publicTableDirectory` as an explicit Boolean;
- documents in code that Firebase web configuration identifies the app and is not an authorization credential.

The Firebase browser API key may be present in client-delivered configuration by design. It must still be restricted to the required Firebase APIs and approved production referrers to reduce abuse and quota theft.

### 2.5 Browser security headers

The Netlify deployment now defines:

- `Content-Security-Policy`;
- `Strict-Transport-Security`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `Cross-Origin-Opener-Policy`;
- no-cache HTML responses and immutable bundled assets.

The current CSP is transitional. It still permits `unsafe-inline` and `unsafe-eval` because the Player/Keeper tools currently compile JSX in the browser and load some libraries from approved CDNs. This is better than having no CSP, but it is not the final target.

### 2.6 Secret hygiene

- No Firebase API key is embedded in repository code.
- No high-confidence credentials were found by the release scan.
- `SECRETS_SCAN_OMIT_KEYS` was removed from `netlify.toml`.
- Missing configuration fails closed for optional cloud sync.
- Local `.env.local` remains excluded and must never be committed.

## 3. Mandatory controls before private campaign data is called production-ready

### Priority 0 — Firestore authorization model

Create and deploy Firestore Security Rules that enforce access independently of the UI. Rules must cover every collection and subcollection used by Player and Keeper tools.

Minimum requirements:

1. Deny all access by default.
2. Require an authenticated Firebase user for cloud campaign data.
3. Permit reads/writes only when the authenticated UID is an explicit member of the table.
4. Permit Keeper-only mutations through a verified Keeper membership/role, not a value supplied by the client.
5. Validate allowed fields, types, document size and numeric/string bounds.
6. Prevent users from assigning themselves elevated membership or overwriting owner fields.
7. Separate public metadata, if any, from private campaign state.
8. Test Rules in the Firebase Emulator Suite with allowed and denied cases.

Firestore queries must be designed to match the Rules. Rules do not act as post-query filters; a query that could return unauthorized documents must fail.

### Priority 0 — Replace browser-side table password authorization

The present table password/hash must not remain the security boundary. Recommended architecture:

1. A user signs in through the chosen identity flow.
2. A server-side join endpoint validates an invitation code or table secret.
3. The server records membership against the authenticated UID or issues a narrowly scoped custom claim/token.
4. Firestore Rules authorize access from that server-established membership.
5. The browser never decides that a user is authorized merely because a hash comparison succeeded locally.

Alternative: use explicit invitation links backed by one-time, expiring server-generated tokens and persist membership after redemption.

### Priority 0 — Authentication unification

Netlify Identity currently protects portal roles while Firebase Anonymous Auth is used by live table features. Before private launch, select and document one authoritative identity/membership flow or build a verified bridge between them.

Do not assume a Netlify `admin`/`keeper` role automatically exists inside Firebase Rules. The two systems need a trusted mapping.

### Priority 1 — Firebase App Check

Configure Firebase App Check for the web app using reCAPTCHA Enterprise or another supported provider:

1. register production and preview domains;
2. deploy in monitoring mode;
3. inspect legitimate/invalid traffic;
4. enforce App Check for Firestore after validation;
5. maintain debug tokens only for controlled development environments.

App Check limits unauthorized clients and abuse. It does not replace Authentication or Rules.

### Priority 1 — API restrictions, quotas and alerts

For the browser API key and Firebase project:

- restrict the key to required Firebase APIs;
- restrict accepted HTTP referrers to production and approved preview domains;
- remove obsolete referrers;
- set project quotas and budget alerts;
- monitor authentication, Firestore reads/writes and rejected Rules/App Check requests;
- rotate any credential that was previously committed or publicly exposed.

### Priority 1 — Bundle dependencies and tighten CSP

The final production target should remove browser compilation and unnecessary third-party runtime loading:

- bundle React, Tailwind output, Babel-transformed JSX and dice dependencies at build time;
- self-host pinned production assets where practical;
- remove `unsafe-eval`;
- replace `unsafe-inline` with hashes/nonces or external files;
- add Subresource Integrity only where external static assets must remain;
- reduce `script-src`, `connect-src`, `frame-src` and `style-src` to the smallest verified set.

### Priority 1 — Rate limiting and abuse controls

Add server-side controls to any join, invitation, feedback, export, import or privileged mutation endpoint:

- per-IP and per-account rate limits;
- lockouts/backoff for repeated failed table joins;
- bounded payload sizes;
- strict content types;
- server-generated IDs where appropriate;
- structured audit logs for privileged actions.

### Priority 2 — Privacy and operations

Before collecting public-user data, define:

- data retention and deletion policy;
- account deletion process;
- campaign ownership and export expectations;
- minimal personal data collected;
- incident response contacts and credential rotation procedure;
- backup/restore tests;
- staging and production Firebase separation;
- dependency update and vulnerability review cadence.

## 4. Public-launch readiness matrix

| Surface | v59.27 position | Required action |
|---|---|---|
| Welcome page and static information | Deploy-preview ready | Manual responsive/accessibility QA |
| Character Creator using local data | Deploy-preview ready | Manual flow QA; dependency hardening remains |
| Digital sheet local storage/export | Deploy-preview ready | Manual multi-breakpoint and print/PDF QA |
| Downloads | No content changed | Confirm public files and version labels |
| Player Tool local/offline use | Deploy-preview ready | Manual dice/settings regression QA |
| Keeper/Admin page access | Edge role gate added | Verify Netlify role assignments and redirect behavior in preview |
| Table directory | Private by default | Keep `FIREBASE_PUBLIC_TABLE_DIRECTORY=false` |
| Cloud campaign confidentiality | **Not ready** | Rules, authenticated membership and App Check |
| Client-side table password | **Not a security boundary** | Replace with server-established membership |
| CSP/supply chain | Transitional | Bundle dependencies and remove unsafe directives |

## 5. Required production environment

```text
FIREBASE_API_KEY=<rotated and restricted browser key>
FIREBASE_AUTH_DOMAIN=<project auth domain>
FIREBASE_PROJECT_ID=<project id>
FIREBASE_STORAGE_BUCKET=<project storage bucket>
FIREBASE_MESSAGING_SENDER_ID=<sender id>
FIREBASE_APP_ID=<web app id>
FIREBASE_MEASUREMENT_ID=<optional analytics id>
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
```

Never place privileged service-account keys, Admin SDK credentials or signing secrets in browser-delivered configuration.

## 6. Deploy Preview security checks

1. Open `/keeper-tool.html` signed out and confirm redirect to Login.
2. Sign in as a normal user and confirm Keeper/Admin remain blocked.
3. Assign `keeper`, refresh identity, and confirm Keeper loads but Admin remains blocked.
4. Assign `admin` and confirm both protected areas load.
5. Confirm Admin navigation is absent for ordinary users.
6. Confirm Player and Keeper do not enumerate tables with the directory flag unset/false.
7. Confirm the exact-table flow still behaves as expected.
8. Inspect response headers on HTML, assets and `/api/firebase-config`.
9. Confirm cloud sync reports a clear error when Firebase configuration is missing.
10. Run Firestore Rules tests before enabling private cloud data.

## 7. Security acceptance criterion

The portal may be described as publicly accessible after Deploy Preview QA for its static/local features. It may be described as secure for private campaign data only after:

- Firestore Rules enforce authenticated table membership;
- browser-side password checking is no longer the authorization decision;
- Identity/Firebase membership mapping is trusted and tested;
- App Check is monitored and enforced;
- abuse limits and operational monitoring are active.
