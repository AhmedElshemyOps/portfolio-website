# SEO maintenance — 8 October 2026

Baseline release: 47aaa1df95fca4d17461c8fcf92a33fa93afcdcb. Recovery tag: seo-baseline-2026-10-08.

The safe release preserves every current article route, canonical, article body, citation link and indexing directive. It repairs existing metadata, article data, navigation, feed XML, sitemap coverage, older topic filters and image delivery. Raw performance observations are diagnostic events, not validated Core Web Vitals.

Legacy recovery is prepared in legacy-url-recovery-map.json. Do not run restore_legacy_article_urls.py against this repository until the owner explicitly approves public-route restoration. Public template exclusion/indexing policy likewise needs approval. No mass redirects or deletions are authorised.

Run audit_seo.py for a read-only HTTP inventory, build_search_feeds.py for deterministic XML, render_shared.py --check for shared-component drift, and the SEO regression tests before publishing. The private A–J report, page plan, scorecard, external-link evidence and dashboard are kept in the workspace outputs/seo-geo-audit directory, outside the published repository.

Remaining: legacy recovery approval; public-template policy; contextual hotel example review; three external 404 references; breadcrumb/collection schema review; dedicated social images; actual Search Console/Bing/GA4/CrUX access and recorded AI citation samples. No rankings or traffic metrics were inferred.
