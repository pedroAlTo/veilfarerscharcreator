# Third-Party Notices

## @3d-dice/dice-box 1.1.4

- Project: https://github.com/3d-dice/dice-box
- Documentation: https://fantasticdice.games/
- Author: Frank Ali / 3Ddice contributors
- License: MIT

VeilFarers bundles the browser distribution and required static assets locally. The custom Hope, Fear, Damage and neutral themes reuse the project's default CC0 dice mesh and numeral textures with original VeilFarers material maps and colours.

## @3d-dice/dice-ui — DisplayResults 0.5.2

- Project: https://github.com/3d-dice/dice-ui
- Documentation: https://fantasticdice.games/docs/addons/displayResults
- Copyright: 2021 3Ddice
- License: MIT

The bundled `display-results.js` is an adapted browser-native version of the DisplayResults addon. It removes build-system-only SVG and CSS imports, retains dropped/rerolled die states, and adds VeilFarers labels and modifiers.

## MIT License

Copyright (c) 2021 3Ddice

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## VeilFarers Custom Dice Materials

The Tech and Biolum Hope, Fear, Damage, neutral, and discarded material maps are original VeilFarers project assets. They are not third-party library assets. The Biolum family uses custom golden, violet, crimson, and switched-off gray crystal treatments designed to preserve numeral legibility.

## VeilFarers Dice Box Compatibility Extension — v59.24

The locally bundled Dice Box browser distribution contains a narrowly scoped compatibility extension named `setDiceVisuals`. It exposes settled onscreen Babylon mesh presentation controls for outline, overlay, visibility, and per-instance colour. It does not alter dice physics, randomisation, result resolution, or the upstream roll/add/remove lifecycle. The extension is distributed under the same MIT terms as the bundled Dice Box code.



## React and ReactDOM 18.3.1

- Project: https://react.dev/
- Copyright: Meta Platforms, Inc. and affiliates
- License: MIT

VeilFarers bundles the production browser builds locally in `assets/vendor/` so Player Tool does not depend on an external React CDN. The original license headers remain in the distributed files.

## Tailwind CSS and Babel build tools

Tailwind CSS and Babel are used only during the release build to generate `assets/player-tool-tailwind.css` and `player-tool.bundle.js`. Their browser runtimes are not loaded in production. Both projects are MIT licensed.

## Netlify Identity and Functions

- `@netlify/identity` 1.2.0 — MIT — https://github.com/netlify/primitives
- `@netlify/functions` 5.3.0 — MIT — https://github.com/netlify/primitives

VeilFarers uses these packages for authenticated server access and typed Identity lifecycle event handlers. They do not ship browser-visible service credentials.

## Daggerheart System Reference Document 1.0 and community logo

This product includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. There are no previous modifications by others.

Darrington Press™ and the Darrington Press authorized work logo are trademarks of Critical Role, LLC and used with permission.

VeilFarers modifies and expands that material with original science-fiction rules, setting material and digital tools. The unmodified Daggerheart-compatible community logo in `assets/legal/daggerheart-compatible-community-logo.png` comes from the official Darrington Press Community Content Logos package at https://darringtonpress.com/license/.
