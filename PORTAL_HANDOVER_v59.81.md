# VeilFarers Portal v59.81 — privacy and storage handover

Release date: 2026-07-24  
Base: complete v59.80 private-access package plus the Netlify secret-scan correction.

## Implemented

- Global bilingual **Privacy & device data** control in the legal footer.
- Live count and approximate size of first-party local and session storage.
- Explicit inventory for local game data, preferences, Netlify Identity,
  Firebase authentication persistence and disabled optional tracking.
- Custom two-step confirmation; no native browser dialog.
- Local cleanup signs out and clears this origin's local storage, session
  storage, Cache Storage, IndexedDB databases and service-worker registrations.
- Local cleanup does not delete cloud data. Account & Character Vault remains
  the separate confirmed path for account and cloud-data deletion.
- Article 13 information is organized by purpose, data, legal basis and
  retention, with processors, transfer safeguards, rights and UODO.
- Google Forms links display a privacy warning before the user leaves the site.

## Consent position

No analytics, advertising or behavioural tracking is active. There is no
accept-all banner. Storage used for authentication, requested game functions
and preferences explicitly selected by the user is treated as essential or
user-requested. Do not activate an optional script, embed or tracker without a
prior-consent mechanism and an equally accessible reject path.

## Manual legal and operational blockers

- Confirm the Netlify and Google Cloud data-processing terms for the actual
  owner accounts and retain copies or acceptance records.
- Add the VeilFarers Article 13 notice inside every Google Form before public
  use; the portal can warn before opening a form but cannot edit Google Forms.
- Define and execute actual retention for feedback and provider logs.
- Maintain a processing record, legitimate-interest assessment for security,
  rights-request workflow and breach-response log.
- Keep Player Tool and Keeper Tool Invite only. Obtain qualified advice before
  presenting public interactive functionality as DPCGL-compliant or as a VTT.

This implementation improves transparency and user control. It is not a legal
certification and does not remove the need for Polish/EU legal review.
