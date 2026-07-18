# Character Registry Security — v59.46

A Character ID is public metadata, not a password. Knowing an ID must never grant document access.

`FIREBASE_SERVICE_ACCOUNT_JSON` is server-only and must remain in Netlify environment variables. Firestore character reads/writes must be protected by Authentication and Security Rules based on ownership or explicit table membership.

Anonymous Firebase Authentication identifies a session; it is not sufficient authorization by itself.
