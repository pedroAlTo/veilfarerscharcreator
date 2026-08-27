VeilFarers navigation identity fix

Replace only:
  public/portal.js

This fixes private navigation disappearing on pages that load portal.js before the Netlify Identity widget.
It does not modify Netlify, Firebase, downloads, rules data, or any other file.

Expected behavior:
- admin/friend: private navigation appears consistently on every page after Identity resolves.
- player-only: Player Tool can appear.
- keeper-only: Keeper Tool can appear.
- anonymous: private links remain hidden, with no flash before Identity resolves.
