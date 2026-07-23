# VeilFarers Portal — cumulative handover v59.79 Creator, legal and security patch

Date: 23 July 2026  
Base: `VeilFarers_Portal_v59.79.zip`, then `Character_Picker_PATCH`, then `Character_Picker_MENU_FIX`  
Delivery: patch-only; do not replace with an older full portal.

## Binding project decisions

- Product/system name: VeilFarers.
- Current publisher/controller: Pedro Almagro Torrecillas, individual established in Poland.
- Public legal/privacy contact: `pedro.alm.to@gmail.com`.
- Do not publish DNI/NIF.
- Current service: free/non-commercial; minimum age 16; legal information in English and Spanish.
- Patreon/donations are not active and require a legal/tax/consumer update before activation.
- Every future modification must include an updated cumulative handover and deployment summary.

## Preserved v59.79 behavior

- The portal-wide active-character picker remains next to Log-in.
- Its dropdown remains appended outside the navigation clipping context.
- Existing table ownership, passwords, invitations, Character Vault, Keeper notes, roll visibility, 3D dice cancellation/audio and inventory transfer behavior must not regress.

## Creator changes

- Side steps are semantic buttons.
- Top and side rails can open any numbered step regardless of completion.
- Back opens the previous step.
- Wizard Next still validates before advancing.
- Completion marks reflect actual readiness, not numerical position.
- `isStepReady(3)` is now a pure check and does not mutate class/path state.
- `I need an idea!` creates six narrative prompts from current ancestry, community, path, class, subclass and strongest assigned Trait.
- Choosing a prompt fills only the first empty Experience.
- Community art order is explicit:
  1. Core World
  2. Trade Hub
  3. Frontier Colony
  4. Void Station
  5. Free Fleet
  6. AgriSynth
  7. The Displaced Enclave

## Legal and Daggerheart

- `legal.html` contains bilingual legal notice, privacy information, storage/cookies, terms, Daggerheart attribution and accessibility statement.
- Controller is established in Poland; UODO is identified as the supervisory authority.
- No optional analytics/advertising/tracking is represented as active.
- Google Fonts network requests were removed.
- Official asset: `assets/legal/daggerheart-compatible-community-logo.png`.
- Asset source: official Darrington Press Community Content Logos package.
- Exact required DPCGL attribution is included in `legal.html` and `THIRD_PARTY_NOTICES.md`.
- Do not modify, recolour, crop or combine the official community logo.
- Recheck current DPCGL/VTT restrictions before public VTT positioning or monetisation.

## WIP access security

- Player and Keeper Tool require Netlify Identity plus an individual invitation token.
- Tokens are bound to one email and a `player`, `keeper`, or combined scope.
- Only SHA-256 hashes are stored in `VF_WIP_INVITES_JSON`.
- Grants use a signed `HttpOnly`, `Secure`, `SameSite=Strict` cookie capped at seven days.
- The table API rechecks signature, account, scope, invitation record, expiry and revocation.
- Redemption events log user ID, email, tool and expiry.
- Local test mode remains available and isolated from the production Identity flow.
- Required secret variables and generation/revocation procedure are in `SECURITY_WIP_ACCESS_v59.79.md`.

## Security limitations and next actions

- The frontend gate is UX; server/API authorization is the security boundary.
- Static tool source can still be downloaded by an authenticated member because Netlify role redirects protect navigation, not intellectual-property secrecy.
- Live acceptance is mandatory for Identity headers, Set-Cookie behavior, Netlify environment variables, Firebase rules and table API.
- Consider Netlify rate limiting for the WIP redemption endpoint after confirming the account plan and supported configuration.
- Continue dependency/security review; the WIP gate is not a substitute for secure code.

## Files introduced or changed

See `GITHUB_DEPLOY_SUMMARY_v59.79_CREATOR_LEGAL_SECURITY_PATCH.md` and the patch ZIP. It contains only update files, not the full portal.

## Immediate continuation prompt

Continue from `PORTAL_HANDOVER_v59.79_CREATOR_LEGAL_SECURITY_PATCH.md`. Treat the v59.79 base plus both character-picker patches plus this patch as authoritative. Preserve the character picker dropdown fix, unrestricted Creator step navigation, contextual Experience prompts, explicit Community image mapping, bilingual Poland-based legal layer, official unmodified Daggerheart community logo/attribution, and server-validated WIP invitation gate. For every modification, deliver only changed deployment files together with a complete updated handover, GitHub summary, validation report and SHA-256.
