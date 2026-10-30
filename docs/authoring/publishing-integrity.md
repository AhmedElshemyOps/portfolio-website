# Publishing integrity and source ownership

This is a maintenance workflow, not a migration. Preserve existing article words,
URLs, anchor IDs, original dates and approved shared design. A build does not
publish, request indexing or grant a search-engine ranking.

## Sources of truth

| Edit here | Owns | Generated consumers / action |
| --- | --- | --- |
| Existing canonical article HTML | Approved teaching text, sections and original dates | Shared rendering preserves the teaching body; do not run historical migrations as routine builds |
| Finished Markdown outside the public repository | New articles created by the managed publisher | `publish_article.py` creates the canonical HTML and registers the article |
| `content/article-registry.json` | Public article metadata, permanent URLs and classifications | Catalogue refresh updates discovery, article statistics, content index and Knowledge Hub |
| `content/knowledge-taxonomy.json` | Approved categories, subcategories and tags | Used by the publisher, validator and library renderer |
| `content/series-banners.json` | Approved series, artwork, numbering and reading order | Publisher updates affected series navigation; new series need explicit editorial/design review |
| `templates/` and original `assets/css/`, `assets/js/` files | Shared presentation and behavior | Shared renderer produces page markup and content-hashed CSS; never hand-edit generated bundles |
| `content/article-video-matches.json` | Reviewed contextual video placements | Shared video renderer; audit relevance before adding matches |
| `maintenance/seo/active-legacy-articles.json` | Explicit historical compatibility destinations | Shared rendering synchronizes byte-identical copies; never guess replacements |

Three series overviews intentionally use `/series/` routes. Do not derive an
existing destination from its registry ID. Optional overview statistics and dates
may be absent; the validator does not invent them.

## Ordered workflow

1. Start from the current production revision on a feature branch. Keep drafts
   outside the public website. Record which text or metadata changes are intended.
2. Run `pnpm run check:content` before editing for a read-only baseline. This checks
   metadata types, dates, duplicate references, bounded public page paths, file
   existence, exact canonical correspondence and the existing taxonomy/series rules.
3. For a new article, follow [the authoring guide](README.md): preview first, then
   use the managed publisher for the approved finished text. `--publish` writes
   locally; it does not deploy. Existing unmanaged articles remain protected.
4. For metadata-only edits, edit the registry and run
   `python3 scripts/sync_catalogue.py`. It validates before writing consumers and
   refreshes shared rendering. For shared style/template changes only, run
   `python3 scripts/render_shared.py`. Both reuse the current renderer rather than
   replaying old editorial transformation scripts.
5. If published article dates or content intentionally changed outside the managed
   publisher, run `python3 scripts/build_search_feeds.py` and inspect sitemap/feed
   differences. Preserve real publication dates; cosmetic releases do not justify
   newer article dates. Historical copies stay outside the canonical sitemap.
6. Run `pnpm run check:health`, review the complete diff, and inspect affected pages
   at mobile and desktop widths with keyboard access. Existing preservation tests
   remain release gates. Never regenerate a preservation baseline merely to pass.
7. Open a pull request. Both push and pull-request **Full release checks** must
   succeed before an authorized merge. Verify the Pages deployment separately;
   local generation and passing tests alone do not mean the website is live.

## Errors and recovery

The preflight is read-only and fails with the record and field needing review.
It does not rewrite dates, repair links by guessing, change article text, add
redirects or renumber series. Catalogue refresh uses this same validator before
writing. The managed publisher retains its existing rollback transaction when
publication fails. Other standalone build commands are not a database transaction:
review their diff and restore only your own generated changes if needed.

`check:health` runs this preflight first, then the existing publishing tests,
render-drift, historical-copy, cleanup, navigation and link checks. The check
supplements those gates; it does not verify external availability, factual
accuracy, visual accessibility or search-engine indexing.
