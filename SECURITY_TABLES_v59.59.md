# VeilFarers Portal v59.59 — Security Notes

## Security delta

v59.59 is a client-side presentation and Character Creator interaction release. It introduces no new server endpoint, Firestore collection, authentication role, credential, table permission or cross-user data path.

The new theme preference is stored locally under:

```text
veilfarers.ui.theme.v1
```

The value is restricted to `blue` or `stone`. It contains no account, character, table or gameplay data.

## Class gate

The Class gate is an interaction-integrity control, not an authorization boundary. It now rejects invalid pre-Path state in four places: state normalization, DOM rendering, capture-phase events and autosave. This prevents invalid Creator records from being produced through ordinary UI, restored drafts or stale local state.

## Preserved security architecture

- Netlify Identity remains the portal authentication provider.
- Firebase custom-token bridging and server-side Firebase Admin credentials are unchanged.
- `FIREBASE_SERVICE_ACCOUNT_JSON` remains server-only and must never be committed or exposed to browser code.
- Character Vault, table ownership, invitations, passwords and Keeper/Player scoping are unchanged.
- Firestore Rules are byte-for-byte carried forward from v59.58.
- No Content Security Policy relaxation was added.

## Deployment note

No Firestore Rules deployment is required for v59.59. Deploy Preview should be used to verify presentation and Creator behavior before merging.
