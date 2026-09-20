# Search discovery — 20 September 2026

VeilFarers is positioned as a **free space opera tabletop role-playing expansion compatible with Daggerheart**. The homepage is the primary answer to “Daggerheart in space”, “Daggerheart sci-fi” and “space opera TTRPG”. It explains the setting, the additional rules and where a group can begin. Compatibility is an independent community claim, not official affiliation.

## Page roles

- Homepage: an introduction to playing Daggerheart in space; crew and campaign scope; free PDFs; First Crossing and its required Table Kit.
- Corebook: space opera rules, character options, starship combat and factions.
- Hearts in the Void: the starter adventure and the continuing adventure.
- Downloads: free PDFs and the current editorial version.
- Equipment, Keeper and Alien Species pages: specific campaign resources, with individual descriptions rather than repeated generic keywords.
- Behind the Veil: original design explanations attributed to the author. Overkill answers a concrete question about science-fiction damage and includes a playable example.

Titles, descriptions, sharing metadata and structured descriptions agree. New content is ordinary visible HTML and works without JavaScript. Existing canonical URLs stay on `https://veilfarers.com/`; the sitemap lists those URLs, with modification dates updated only for pages changed in this release. No fabricated ratings, keyword lists, hidden search copy or duplicate keyword landing pages are added. The questions are editorial content, not a promise of Google FAQ rich results.

## Publication and measurement

The domain homepage currently responds with HTTP 200 without an indexing prohibition. Netlify deploy previews return `X-Robots-Tag: noindex`, as intended. **Preview publication alone does not publish these changes to the indexed domain.** Check the production deployment after the branch is released.

The owner confirmed that veilfarers.com is verified in Google Search Console. The browser connection was unavailable during this change; no Search Console action or submission is claimed.

After production publication:

1. In the verified domain property, submit `https://veilfarers.com/sitemap.xml` in Sitemaps, or check its existing status and last read if it is already submitted.
2. Inspect `https://veilfarers.com/`, `https://veilfarers.com/books/corebook.html` and `https://veilfarers.com/behind-the-veil/overkill.html`. Check live availability and Google's selected canonical. Request indexing for the updated homepage and article as needed.
3. In Performance, filter queries with `(?i)(daggerheart|space opera|sci[- ]?fi|veilfarers)` and compare 28-day periods. Watch impressions and relevant queries first, then clicks and click-through rate. No search-volume or ranking claims were inferred from keyword choice.
4. On the author's itch.io listing, link to the canonical homepage. When sharing a design article, use its production URL. Suggested listing text: “VeilFarers — a free space opera expansion compatible with Daggerheart. Start with First Crossing or explore the rules and the thinking behind them.” Nothing was posted to itch.io or external communities by this change.

Continue the author's design journal with specific, source-backed articles when their explanations are ready. Preserve the author's voice. Measure results over several weeks rather than treating metadata changes as an immediate ranking guarantee.

References: [Google Search Essentials](https://developers.google.com/search/docs/essentials), [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start).
