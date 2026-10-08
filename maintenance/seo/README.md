# SEO maintenance — 8 October 2026

Baseline release: 47aaa1df95fca4d17461c8fcf92a33fa93afcdcb. Recovery tag: seo-baseline-2026-10-08.

The safe release preserves every current article route, canonical, article body, citation link and indexing directive. It repairs existing metadata, article data, navigation, feed XML, sitemap coverage, older topic filters and image delivery. Raw performance observations are diagnostic events, not validated Core Web Vitals.

Legacy recovery is prepared in legacy-url-recovery-map.json. Do not run restore_legacy_article_urls.py against this repository until the owner explicitly approves public-route restoration. Public template exclusion/indexing policy likewise needs approval. No mass redirects or deletions are authorised.

Run audit_seo.py for a read-only HTTP inventory, build_search_feeds.py for deterministic XML, render_shared.py --check for shared-component drift, and the SEO regression tests before publishing. The private A–J report, page plan, scorecard, external-link evidence and dashboard are kept in the workspace outputs/seo-geo-audit directory, outside the published repository.

Second batch: 12 reviewed hotel scenario controls, three official reference replacements and two CollectionPage schemas. The exact body fragments and preserved original publication dates are recorded in editorial-batch-manifest.json. The owner explicitly chose to leave legacy restoration pending on 8 October 2026. Four editorial regression tests check unchanged routes/indexing/canonicals, prompt/publication-date preservation, collection links and illustrative property controls.

Third batch: 133 registered article/series pages have one visible Home/Knowledge/title breadcrumb and matching schema. Seven original 1200×630 sharing covers and seven missing method/project connections are added. The library manifest records the exact replacement of three older breadcrumb components; all other teaching bodies, prompts and dates are preserved against 70c38c0. Four library regression tests verify these boundaries and deterministic regeneration.

Remaining: deferred legacy recovery; public-template policy; broader claim-level editorial review; actual Search Console/Bing/GA4/CrUX access and recorded AI citation samples. No rankings or traffic metrics were inferred.

Evidence corrections on 8 October 2026 are recorded as exact reviewed fragments in `evidence-batch-manifest.json`. After regenerating article content, run `python3 scripts/apply_evidence_corrections.py`, then `python3 scripts/render_shared.py` and `python3 scripts/build_search_feeds.py`. The correction script stops on source drift instead of silently rewriting unrelated teaching text. Review any drift before proceeding. The synchronous navigation script follows the masthead so the mobile menu settles before the following main content is parsed; removing this placement can reintroduce the measured article layout shift.
