# Approved series-banner inspection — 9 October 2026

Applied the eight approved public series designs to all 130 article-directory pages and three series indexes. This includes 121 numbered chapters, six standalone field guides and six overview pages. Standalone guides and overviews are labelled honestly, without invented chapter numbers.

Each banner uses the page's original H1 as selectable HTML text, the reviewed series number and the same self-hosted Lora typeface. Approved artwork is encoded as WebP without resizing or cropping. Social previews use the matching approved series master.

## Verification

- All 133 pages checked at 1440px and 390px: 266 checks, no missing images, duplicate H1s, clipped banner text or horizontal page overflow.
- All eight public series additionally checked at 768px: no banner overflow.
- Representative screenshots visually reviewed for every approved public design. Fixed artwork stacking and Amsterdam index layout conflicts found during this review.
- Exact article headings, original article bodies, existing anchors and canonical URLs preserved (static-checks.json).
- Continuous chapter numbering checked for all eight numbered series.
- Website health suite: 20/20 groups passed, including 76 Python tests, JavaScript checks, prompt integrity, shared-rendering consistency and local links.
- Internal-link audit: 178 public HTML pages, no missing targets/fragments or duplicate IDs. Navigation audit: 182 HTML pages and 4,297 table-of-contents links passed.
- Print CSS retains black title text and removes decorative artwork. Full print and assistive-technology testing was not repeated in this banner-only update.

The ten RAG articles received their approved design in the separate local private package. They remain excluded from the repository and deployment. No private draft was published.

This review covers presentation, title/number matching, content preservation and technical checks. It is not a new factual review of every article claim.

## Maintenance

`content/series-banners.json` stores approved designs, exact headings and reviewed chapter order. The shared renderer applies `scripts/render_series_banners.py` automatically for registered pages. When adding a new article, register its URL/title/design/number in this manifest, update that series' totals, then run the shared renderer and health checks. New content is not silently assigned a guessed series or number.
