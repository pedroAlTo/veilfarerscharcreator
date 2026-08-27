# Portal privacy hardening - DPCGL private-play scope

This drop reconfigures the portal so the digital tools are hidden from public
users and public navigation, while the books, feedback and legal notice remain
public. It matches the commitment already sent to Darrington Press: tools remain
solely for the personal campaign, access is granted manually, there is no public
registration or "request access", and enforcement happens server-side rather
than only in the UI.

Files in this drop, and where they belong:

    netlify.toml                (replaces the existing file at repo root)
    public/portal.js            (replaces the existing nav bootstrap)
    public/index.html           (replaces the existing homepage)
    public/robots.txt           (new)

## What is private now

Behind role `friend` (or `admin`), enforced by Netlify redirect rules:

    /creator, /creator.html
    /charsheet, /charsheet.html
    /armory, /armory.html
    /items, /items.html
    /encyclopedia, /encyclopedia.html
    /player-tool, /player-tool.html   (already gated; kept)
    /keeper-tool, /keeper-tool.html   (already gated; kept)
    /admin, /admin.html               (already gated; kept)
    /adventures/*                     (already gated; kept)
    /reference-data/*                 (new; the encyclopedia's JSON dataset)

A signed-out visitor who types any of these URLs directly gets redirected to
`/login.html`. `/reference-data/*` returns 404 without the role instead of
redirecting, so scrapers cannot fingerprint it.

Every private page also carries `X-Robots-Tag: noindex, nofollow, noarchive`
and `Cache-Control: private, no-store`. `robots.txt` disallows all private
routes for compliant crawlers.

## What stays public

    /                       (homepage)
    /downloads.html         (the books)
    /download/*             (the PDFs themselves)
    /feedback.html          (public feedback form)
    /legal.html             (DPCGL notice and credits)
    /login.html             (sign-in surface)

The homepage was rewritten so it no longer announces the private tools. The
hero, the tools grid and the final call-to-action now point to Books \u0026
Downloads, Feedback and License.

## What still needs your hand in Netlify

**Two things you have to do in the Netlify dashboard**, because they are
Identity settings and not repository files:

1. **Identity -\u003e Registration -\u003e Invite only.** This is the switch that
   prevents anyone from signing up on their own. Without this, the redirects
   still hold, but someone could create an account with no role, land on
   `/login.html`, and see it as a "public registration" surface.

2. **Identity -\u003e Users -\u003e assign the `friend` role manually** to each person at
   your table. Only accounts you invite get the role, and the role is the only
   thing that opens the private pages.

## How the nav behaves

`portal.js` marks the private links with `data-vf-private=\"1\"` and hides them
by default. It listens for `netlifyIdentity` and only reveals them when the
current user has the `friend` or `admin` role. Signed-out and role-less users
never see the tools in the top bar.

## What this drop does *not* touch

- Books, sources, pipeline: none of the editorial work changes.
- Firebase/Function-level role checks that already exist in
  `_role-access.mts`, `_tool-access.mts`, etc. remain in place. The redirect
  rules above are the outer perimeter; the server-side checks are the inner
  one, as your Darrington letter describes.
- Player Tool, Keeper Tool and Admin were already role-gated; they were left
  alone except for the added `noindex` header.

## Verification, once deployed

- Public visitor: goes to `/`, sees only Downloads / Feedback / License. Nav
  shows Home, Downloads, Feedback, Log-in.
- `curl -I https://<site>/creator.html` returns 302 to `/login.html`.
- `curl -I https://<site>/reference-data/encyclopedia-quick.json` returns 404.
- Search a private route in a fresh incognito window: nothing indexes.
- Sign in as a `friend` account: the tool links appear in the nav.

## When Darrington replies

If they confirm the private-play interpretation, no further changes needed;
this is already the private mode you described to them. If they push back or
ask for more, we adjust from this baseline.
