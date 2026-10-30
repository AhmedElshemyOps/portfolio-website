# Sitewide search release integrity

Run `pnpm check:search` before release. The full health check runs it automatically.

This read-only check covers every public HTML page using the shared renderer's inventory. Canonical search pages must have their exact self canonical, one nonempty title, description and H1, valid existing structured-data JSON, crawler access, and exactly one sitemap entry. It rejects accidental noindex, unknown canonicals and foreign, duplicate or excluded sitemap entries. It does not rewrite articles or sitemap dates.

The existing `maintenance/seo/active-legacy-articles.json` defines historical compatibility copies. Only these declared aliases may point to another page. `maintenance/seo/search-utilities.json` defines the six intentionally excluded utilities; these must retain noindex. Both exception lists must refer to existing public files. Review additions as an explicit publishing decision, rather than adding an exception to silence a failing check.

New canonical pages require a sitemap entry; removal requires updating the sitemap and reviewing existing links. Keep existing shared URLs and article wording intact. The canonical page count is calculated dynamically, so growth does not require changing a hardcoded count.

Passing confirms repository consistency, not search-engine indexing or rich-result eligibility. URL Inspection, crawl dates and search performance remain separate account observations. HTTP headers and production availability also require deployment checks.
