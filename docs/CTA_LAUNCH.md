# Homepage notice order

1. Books 12.06
2. New! First Crossing Lite 1.1
3. Rust & Steel repair notice
4. Beta tester invitation
5. Nine Signals — Coming soon

The original survey markup is preserved, inert, inside `#vf-mini-survey-template` in `public/index.html`. The existing survey module, campaign configuration and voting service remain unchanged. No survey requests are made by the coming-soon notice.

To launch on the user's request, set the confirmed opening date in `public/mini-campaign.mjs` and change `VF_MINI_SURVEY_ENABLED` to `true` in `public/notice-config.js`. The original form then replaces the placeholder before carousel initialization; `edition-notices.mjs` loads the existing survey controller. Verify the server's campaign date agrees before publishing. Keep the notice in position 5.

The First Crossing cover is rendered from page 1 of the supplied 1.1 PDF. Its binding is HTML/CSS. The two decorative d12 dice use the same DiceBox engine, assets and Hope/Fear materials as the Player Tool, without loading or changing the private tool. Reduced motion or renderer failure displays a static fallback.

Books 12.06 is the first automatic notice for a new visitor. Session minimization and permanent dismissal are respected independently for each notice. The new notices reuse the original gold corner-cut minimize and dismiss icons.
