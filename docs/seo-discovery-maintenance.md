# Tourism discovery metadata and audit maintenance

Reviewed 30 October 2026. Keep existing article words, titles, URLs, anchors,
canonicals, dates and the approved footer unchanged.

## One owner for search descriptions

`content/discovery-metadata.json` holds ten reviewed search/sharing descriptions.
These are distinct from the visible article summaries in the registry and the
learning-path introductions. Shared rendering applies the descriptions after
page-specific rendering so an older project or collection renderer cannot
silently overwrite the reviewed head metadata. Existing social description tags
and the primary page's JSON-LD description are kept consistent. Linked article
names, schemas, publication dates and visible summaries are preserved.

Edit descriptions only after reviewing the actual page and dated search evidence.
Do not add keyword lists, unverified commercial claims, invented credentials or
claims of measured product results. The 80–180 character range is this batch's
editorial guardrail, not a Google specification or a guaranteed snippet length.

`pnpm run check:content` validates the reviewed manifest's bounded paths and text.
Then run shared rendering and the full health checks. Tests reject changed visible
text, navigation, canonical routes and invalid schemas. Historical copies continue
to synchronize from their canonical article; never edit a recovered copy directly.

## Structured data and audit boundaries

The MICE series overview had five ItemList URLs resolving to nonexistent homepage
fragments. The renderer repairs only fragment links whose section ID and visible
jump already exist on the current collection page. It leaves valid homepage,
external and unknown links unchanged; no route or visible anchor is rewritten.

The video library uses microdata on its existing collection, nonempty lesson
groups, titles and destination links. It describes visible lesson lists without
creating extra elements or claiming that every library card is a video watch
page. It does not manufacture VideoObject upload dates, ratings or viewing counts.

The SEO audit reuses shared rendering's public-page boundary, excluding internal
previews and exact plain ownership proof assets. It also excludes test fixtures.
Known canonical compatibility copies are reported separately from true duplicate
metadata. Inspect aliases rather than deleting them to improve an audit score.
Missing candidate paths and query variants remain review observations, not proof
of broken live canonical pages. HTTP availability is separate from indexing.

## Evidence-led review cycle

Keep account exports outside the public repository. Record property, account,
export date, date range, filters and whether a report is aggregate coverage,
individual URL inspection or performance data. Query rows may not reconcile to
chart totals; do not turn absent rows into zero demand or claim query-to-page
relationships without the corresponding filtered report.

Compare the same periods after sufficient recrawl time. Evaluate clicks,
impressions and relevant landing pages alongside consent-dependent production
analytics. Generative-search impressions are not unique readers, verified leads
or a citation count across all AI services. Keep Google and Bing results separate.
The search engines choose crawl timing, inclusion, titles and snippets.

References: [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)
and [Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).
