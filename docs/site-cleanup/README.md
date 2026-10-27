# Whole-site cleanup and inspection — 27 October 2026

## Scope and result

Every one of the 178 public HTML pages was inspected by the source/asset audit and browser layout checks. All 130 article pages use one permanent shared article finish. The three series landing pages outside `/articles/` retain their landing-page navigation and share the same site frame. Tools, demos and profile pages retain their appropriate layouts.

Removed subscription forms and promotional sections from articles, the Knowledge Hub, resources and learning pages; removed the footer destination, client signup script, provider URL/endpoint configuration and obsolete privacy copy. The two historical signup URLs have no forms or subscription content: they redirect to the Knowledge Hub, with a shared-frame fallback and noindex metadata. The shared renderer prevents the retired UI from returning on future renders or publications.

## Files and styles

The file inventory covers tracked and new repository files, excluding ignored dependencies and Git internals. All public HTML pages, their local asset references and 36 source stylesheets reached through the current page/import graph were checked.

Removed 49 confirmed unreferenced or retired files, approximately 4.09 MiB:

- 41 unused generated CSS bundles.
- Four obsolete compiled application entry bundles.
- Two unused compatibility stylesheet wrappers.
- The retired newsletter script and unused contact-copy script.

Pruned retired subscription, article follow-up, growth, sequence, former footer and superseded recommendation selectors in seven source stylesheets. Mixed selectors retain their active branches. Dependent application/page CSS bundles were regenerated. Working interactive scripts, original teaching imagery, fonts, downloads, research datasets and provenance records remain intact.

## Browser inspection

356 browser checks covered every public page at 1440px and 390px widths. Each result records the actual viewport, page width, heading/footer counts, loaded styles, article-finish presence, subscription-form count and broken loaded images. No horizontal page overflow, missing shared footer, subscription forms or broken loaded images were found. The retired routes redirect successfully to the Knowledge Hub. Detailed desktop/mobile visual checks also covered the article-to-footer transition.

These are desktop browser viewport checks, not physical-device tests or a claim of complete accessibility certification.

## Links

All local pages, assets, CSS imports/URLs and fragments pass validation. The external audit checked 217 distinct public destinations:

| Result | Count |
|---|---:|
| Successful response | 131 |
| Access-restricted or otherwise unverified HTTP response | 80 |
| Could not verify because of connection/timeout errors | 6 |
| Confirmed 404 or 410 after a second request | 0 |

Restricted and unverified destinations were retained; they are not evidence of dead links. No replacement destination was invented. External availability can change after the audit.

## Maintenance

- `python3 scripts/render_shared.py` regenerates the shared frame and keeps subscription UI retired.
- `python3 scripts/prune_generated_styles.py` deletes only unreferenced generated CSS bundles.
- `python3 scripts/check_site_cleanup.py` checks whole-site coverage and dependencies without changes.
- `node scripts/check_health.mjs` includes the full site cleanup audit alongside existing rendering, navigation, content-preservation and interaction checks.

Service-worker version `v38-article-cleanup` invalidates the previous release cache. Saved quotation drafts and learning state remain untouched. Changes are prepared on the review branch, not deployed to production.

## Completed release validation

All 23 check groups passed, including 117 Python tests, every JavaScript test, prompt-source preservation, generated styles, the full cleanup audit, local links and article navigation. There are no duplicate IDs or missing local destinations. All 174 tables and 338 teaching figures remain present. Existing feed summaries and canonical date-provenance metadata were refreshed from the maintained records; article publication dates were not rewritten.
