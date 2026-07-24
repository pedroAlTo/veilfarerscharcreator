# VeilFarers v59.55 — Keeper Note Storage and Recipient Isolation

## Security boundary

Keeper notes are authenticated table resources. The server derives the table ID, sender UID, timestamp and recipient validation from the authenticated request and current table document.

## Recipient isolation

- `target: all` is returned to every authenticated member of the current table.
- A private target must match a connected table player identifier.
- On `readSession`, the server returns a private note only to the table owner or to the authenticated user whose UID/owned character matches the note target.
- Client-side filtering remains defense-in-depth, not the primary privacy boundary.

## Storage change

New notes are stored as documents under:

```text
artifacts/default-app-id/public/data/sessions/{tableId}/handouts/{noteId}
```

This prevents concurrent sends from overwriting a shared `handouts` array and keeps note growth out of the main session document. Legacy `session.handouts` records remain readable and removable during migration.

## Firestore-safe tables

Firestore rejects arrays that directly contain arrays. Pasted tables are therefore stored as:

```json
{
  "headers": ["Name", "Status"],
  "rows": [
    { "cells": ["Gate", "Locked"] },
    { "cells": ["Dock", "Open"] }
  ]
}
```

The server converts this back into the existing Player Tool `rows: string[][]` representation in API responses.

## Diagnostics

Every table API call carries a non-secret request reference. Function errors log that reference with action, table ID and status; the browser receives only the safe reference and generic error message.

## Rules deployment

No new client Firestore permission is required for this hotfix because handout writes and reads are server-mediated with Firebase Admin. The included Rules file remains the coordinated baseline and should not be deployed merely to test v59.55.
