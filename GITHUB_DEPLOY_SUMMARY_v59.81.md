# VeilFarers Portal v59.81 — GitHub deploy summary

## Summary

Adds a global bilingual privacy and device-storage control, structured GDPR
information and an essential-storage inventory. No analytics or tracking is
enabled, so the release deliberately avoids an accept-all cookie banner.

## Main files

- `portal.js`, `portal.css`: global privacy panel and confirmed local cleanup.
- `legal.html`, `legal.js`, `legal.css`: structured privacy/storage information.
- `feedback.html`: external Google Forms privacy notice.
- release metadata, changelog, validation and handover updated to v59.81.

## Deploy sequence

1. Apply this patch to the v59.80 private-access branch.
2. Deploy as a Netlify Deploy Preview.
3. Complete `VALIDATION_v59.81.txt`.
4. Add the Article 13 notice inside every external Google Form.
5. Retain evidence of Netlify/Google processor terms and the operational GDPR
   procedures before considering a public merge.

This is a privacy-control implementation, not a legal certification.
