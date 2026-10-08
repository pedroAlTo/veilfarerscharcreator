# Homepage notice order

The Admin CTA schedule controls which notices are live and their order. Bundled defaults are:

1. An Important Pricing Update
2. Behind the Veil update
3. Books 12.06
4. New! First Crossing Lite 1.1
5. Rust & Steel repair notice
6. Beta tester invitation
7. Nine Signals — Coming soon

The pricing notice ends on 7 October 2026 at 21:59:59 UTC by default. Its Downloads banner/countdown uses the same schedule. Start now enables an item and clears its date window; Pause disables it while retaining its dates. Dates in Admin are entered in the browser's displayed time zone and stored in UTC.

Open /admin.html and sign in with a Netlify Identity account whose app_metadata.roles contains admin. Content publishing is verified by GET /api/content-admin and no longer depends on the separate owner-email check for account management. User invitations, role changes and account deletion still require that owner check. Refresh the Identity session after assigning its role.

POST /api/cta-config stores CTA and article settings in the existing Firestore document portalConfig/ctaSchedule, upgrading v1 notice settings without resetting them. No new environment variables are required. Saves validate the date window and use a version timestamp plus Firestore precondition to reject stale edits with HTTP 409. Reload saved settings before retrying a conflicting edit.

Public pages share content-schedule.js: they evaluate start/end boundaries against server time and refresh saved settings every 30 seconds and when a tab becomes visible. Changes do not require a new deploy. Paused/expired CTA dialogs close automatically. The bundled public/data/cta-schedule.json is a read-only fallback only on localhost; a production service failure hides controlled content rather than resurrecting the bundled defaults.

The Behind the Veil section of Admin controls Overkill, Drones and Space Combat (English and Spanish together), including their order in the journal. A Netlify Function gates every article HTML and extensionless URL on the server, so inactive articles return 404 even without JavaScript. A storage outage returns 503; responses are never cached. Every article HTML variant is bundled through functions.behind-veil-article.included_files in netlify.toml and covered by a deployment-configuration regression test.

A Python static preview cannot run Netlify Functions or save schedules. Admin explains this and displays only read-only bundled settings there; use Netlify Dev or the deployed site for real administration. The scheduling feature must be deployed once before it is available on the live site.

The original survey markup is preserved, inert, inside `#vf-mini-survey-template` in `public/index.html`. The existing survey module, campaign configuration and voting service remain unchanged. No survey requests are made by the coming-soon notice.

To launch on the user's request, set the confirmed opening date in `public/mini-campaign.mjs` and change `VF_MINI_SURVEY_ENABLED` to `true` in `public/notice-config.js`. The original form then replaces the placeholder before carousel initialization; `edition-notices.mjs` loads the existing survey controller. Verify the server's campaign date agrees before publishing. Keep the notice in the final default position.

The First Crossing CTA displays three bound books using the illustrated session, Table Kit and Color Maps covers. Maya leads the composition at the front. Bindings are HTML/CSS; the original typographic PDF cover remains available as an asset. The two decorative d12 dice use the same DiceBox engine, assets and Hope/Fear materials as the Player Tool, without loading or changing the private tool. The dice stay hidden until the 3D canvas is initialized; there are no 2D placeholder dice. Reduced motion or renderer failure leaves the decorative dice absent. A rendered page of the actual character sheet and a worn, textured SVG pencil under matching dim light sit behind the books, which are centered in the art frame.

The first live, eligible notice is automatic for a new visitor; by default this is the pricing update. Session minimization and permanent dismissal are respected independently for each notice. The new notices reuse the original gold corner-cut minimize and dismiss icons.

The pencil rests at a shallow angle across the lower sheet, clear of the books; the entire eraser and ferrule remain visible.

Both book notices use one overhead perspective with thin, dim bindings and restrained contact shadows. Covers and page edges share the same rotation.

## Pricing artwork · 26 September 2026

The pricing notice now illustrates the satirical increase with the Corebook, Keeper's Companion and Rust & Steel covers, rising €/$ symbols, and upward arrows. `public/cta-pricing-art.css` scopes the illustration to the pricing modal; animations run only while that dialog is open and become static under reduced-motion preferences. The existing price comparison, schedule and dismissal behavior are preserved.
