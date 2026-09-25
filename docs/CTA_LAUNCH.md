# Homepage notice order

The Admin CTA schedule controls which notices are live and their order. Bundled defaults are:

1. An Important Pricing Update
2. Behind the Veil update
3. Books 12.06
4. New! First Crossing Lite 1.1
5. Rust & Steel repair notice
6. Beta tester invitation
7. Nine Signals — Coming soon

The pricing notice ends on 7 October 2026 at 21:59:59 UTC by default. Its Downloads countdown uses the same schedule. Admin can pause, restart it for a new 15-day window, clear the deadline, or schedule another CTA for a future date. The protected `POST /api/cta-config` stores changes in Firestore; the public `GET` and bundled `public/data/cta-schedule.json` fallback keep the homepage readable when the service is unavailable. Changes take effect when visitors reload the page.

The original survey markup is preserved, inert, inside `#vf-mini-survey-template` in `public/index.html`. The existing survey module, campaign configuration and voting service remain unchanged. No survey requests are made by the coming-soon notice.

To launch on the user's request, set the confirmed opening date in `public/mini-campaign.mjs` and change `VF_MINI_SURVEY_ENABLED` to `true` in `public/notice-config.js`. The original form then replaces the placeholder before carousel initialization; `edition-notices.mjs` loads the existing survey controller. Verify the server's campaign date agrees before publishing. Keep the notice in the final default position.

The First Crossing CTA displays three bound books using the illustrated session, Table Kit and Color Maps covers. Maya leads the composition at the front. Bindings are HTML/CSS; the original typographic PDF cover remains available as an asset. The two decorative d12 dice use the same DiceBox engine, assets and Hope/Fear materials as the Player Tool, without loading or changing the private tool. The dice stay hidden until the 3D canvas is initialized; there are no 2D placeholder dice. Reduced motion or renderer failure leaves the decorative dice absent. A rendered page of the actual character sheet and a worn, textured SVG pencil under matching dim light sit behind the books, which are centered in the art frame.

The first live, eligible notice is automatic for a new visitor; by default this is the pricing update. Session minimization and permanent dismissal are respected independently for each notice. The new notices reuse the original gold corner-cut minimize and dismiss icons.

The pencil rests at a shallow angle across the lower sheet, clear of the books; the entire eraser and ferrule remain visible.

Both book notices use one overhead perspective with thin, dim bindings and restrained contact shadows. Covers and page edges share the same rotation.
