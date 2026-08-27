# Stellar Encyclopedia - portal integration (phase 1)

Drop these files into the repository, keeping the same paths.

    public/encyclopedia.html                            (new)
    public/portal.js                                    (replaces existing: adds the nav link)
    public/reference-data/encyclopedia-quick.json       (new, 1.3 MB)
    public/reference-data/encyclopedia-archive.json     (new, 5.3 MB, loaded on demand)

Nothing else changes. No build step, no netlify.toml edit, no new dependency.

## What was done

**Renamed and reframed.** The page is the *Stellar Encyclopedia*. Its own
`VF / VEILFARERS / Rules Reference` masthead was removed, because the portal nav
already provides the brand; the PLAYER / KEEPER / EDITORIAL audience toggle was
preserved and moved into the page head strip.

**Rethemed to the portal.** The reference carried its own dark-only palette
(Inter, #e6c66d gold). Every hardcoded colour in its stylesheet (84 hex values
and the white surface tints) was converted to semantic variables that resolve
from the portal tokens (`--vf-bg`, `--vf-panel`, `--vf-gold`, `--vf-line`, ...).
The result follows the site-wide theme switch: it renders dark in **Blue** and
light in **Stone**, where before it would have stayed black inside a light
portal. Headings now use Cinzel, matching the rest of the site. Fourteen
extra rules restore contrast in Stone for surfaces originally designed dark
(dice boxes, overlays, the "do not confuse" and example panels).

**Wired to the portal runtime.** The page now loads `portal.css`,
`veilfarers-theme.js/css`, the accessibility layer, `shared-data.js`,
`release-version.js` and `portal.js`, exactly like the other pages. The kicker
carries `data-vf-release`, so the canon version shown ("rules canon 12.04")
comes from `downloads.json` and no longer needs editing by hand at release time.

**Data moved to `/reference-data/`** with stable names, so future updates
replace the JSON without touching the page.

## Verified

- Loads inside the portal shell with the nav present and the
  **Stellar Encyclopedia** tab highlighted on its own route.
- 1,342 defined concepts, 38 essential, 217 rule cards, 30 Try It tools.
- Deep links work: `/encyclopedia.html?term=corebook-advantage`.
- Full archive still lazy-loads, so first paint is unaffected.
- Theme bridge audited: no hardcoded colours left in the component CSS, and
  every variable is defined in both Blue and Stone.

## Notes

- The Content-Security-Policy already allows this page as-is; no change needed.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` are kept. This is why the
  upcoming floating term panel (phase 2) will be native HTML fed by a light JSON
  rather than an iframe of this page.
