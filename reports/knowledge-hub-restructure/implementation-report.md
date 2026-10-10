# Local implementation report

Status: local review branch `knowledge-hub-restructure`. Baseline: `26bf6ee9baa2c417e1f113fbec164ca8da793283`. No push, merge, deployment, production configuration change or publication was performed.

## What changed

- Added five primary categories and 21 populated subcategories, with controlled tags and explicit series metadata in the existing registry.
- Reconciled all 133 records: 128 historical article records, five series indexes; 130 files under articles and three under series. No missing or unregistered article files.
- Replaced headings-as-visible-tags with controlled labels. Kept legacy tags and titles for compatible old search and embedded reading paths.
- Rebuilt the Knowledge Hub with generated category/subcategory counts, eight numbered editorial collections, practical guides, richer cards and estimated reading time.
- Added category, subcategory, topic-tag and editorial-series filters. Kept existing topic/series/type query support, word matching, sorting, pagination, saved browse state, reset focus and global search.
- Series filtering uses real membership and numerical installment order. Six independent guides sharing banner artwork are not falsely presented as series installments.
- Added an “Explore this subject” panel outside each teaching body, linking to its category/subcategory and relevant companions not already linked elsewhere on that page.
- Enriched existing Article schema with articleSection, keywords, subject and applicable CreativeWorkSeries relationship. Kept the original three-level breadcrumb trail and canonical URLs. Added a proper ItemList beneath the Knowledge Hub CollectionPage.
- Aligned two registry display titles to existing H1s. Historical embedded reading cards retain legacy display titles to preserve article bodies.
- Added metadata validation, URL/body preservation tests, category/filter behavior checks and independent financial recalculations.
- Updated the finished-text authoring template and documentation. The publisher requires explicit classification, controlled tags and valid related URLs; errors roll back the local transaction.
- Replaced the historical catalogue refresh command with a registry-based rebuild, preventing it from rerunning old body migrations or recreating invalid metadata.

## Architecture and scope

`content/article-registry.json` remains the authoritative article metadata source. `content/knowledge-taxonomy.json` defines the allowed vocabulary. `scripts/knowledge_taxonomy.py` validates that model and renders the library and article context. `scripts/article_catalogue.py` generates the existing consumer files. `scripts/apply_library_navigation.py` integrates the context panel and schema with the existing shared renderer.

The existing `category`, `pillar` and `series` fields remain unchanged for old consumers. New fields represent the new information architecture. Series/banner evidence continues to come from the approved banner manifest. No CMS, framework, hosting service or backend was introduced.

Changes to HTML outside Knowledge/articles/series are limited to the fingerprint of the shared discovery JavaScript dependency. The global search interface is preserved; its matching now also recognizes category/subcategory metadata. No project, CV, profile content or product logic was redesigned.

The scoped `knowledge-taxonomy.css` extends the existing navy, warm-white and gold design and participates in the existing content-hashed CSS bundle. Previously published bundles remain available for cached clients. Only unreferenced, untracked bundles generated during this task may be removed.

## Content and editorial boundary

The original teaching bodies, prompts, article addresses, publication dates, sitemap and feed were preserved. No automatic merge, deletion or broad rewrite was performed. Related navigation is additive and outside the article body.

The audit contains exact body excerpts and proposed differentiation actions. KEEP means a useful distinct article is retained; it does not mean all external facts have been independently certified. REVIEW for the Amsterdam commercial model concerns unverified commercial inputs, after its arithmetic was reconciled with the downloadable ex-VAT commission model.

## Reproduce

1. `python3 scripts/sync_catalogue.py` — validate metadata and regenerate consumers.
2. `python3 scripts/audit_knowledge_hub.py` — regenerate inventory, mappings, editorial screening and overlap reports.
3. `python3 scripts/check_article_financial_examples.py` — reproduce the selected numerical checks.
4. `node scripts/check_health.mjs` — all existing regression groups plus the new tests.

Use the existing project runtime. These commands do not push or deploy. Audit reports and local screenshots are review artifacts, not a claim that the public website has changed.

## Decisions for the owner

- Approve or revise category assignments and public-facing category language.
- Approve a separate editorial pass to replace repeated generic prose with article-specific examples; no consolidation is currently justified solely by similarity scores.
- Resolve pending jurisdiction-specific and time-sensitive claims with authoritative sources/qualified owners before commercial reliance.
- Review the local design and tests, then explicitly authorize any later publication.
