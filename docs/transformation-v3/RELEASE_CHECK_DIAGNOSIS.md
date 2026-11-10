# Soft Clay release-check diagnosis · 10 November 2026

## Revisions and observed result

| Role | Branch and commit | Evidence |
| --- | --- | --- |
| Published baseline | master · `753c3a0cc6e2235201e939b840973911725dc00c` | [Successful Pages deployment](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42690327050) |
| Separate draft | codex/soft-clay-refresh-2026-11-10 · `6dc5d694b9d8f47e8f7870d517bfc78847cde463` | [Draft PR #36](https://github.com/AhmedElshemyOps/portfolio-website/pull/36) · [release job](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42808085230/job/129802299301) |

The draft is three commits ahead and zero behind the published revision. Tree comparison found 25 additions, 24 removals and 228 modifications. Added or removed paths are generated CSS bundles except for one added historical test-baseline helper. The 202 changed HTML files include all 132 HTML files under articles/, the four project demo entry points and all four project case studies. Shared Soft Clay styling, generated CSS, video anchors, table/diagram markup, registry and discovery outputs, sitemap/feed and validation scripts/tests changed. Four demo application scripts and their source data were not changed in this delta.

## Exact failing command

The PR workflow's checkout, tool setup and dependency installation succeeded. The release step ran `pnpm run check:health`. Its Python unittest discovery ran 197 tests and returned 15 assertion failures, zero errors, then pnpm exited 1. Search and content preflights ran before the failing suite, with the content preflight logging 135 registered destinations.

1. **Field-guide ingestion and markup contracts.** The previous registry fixture had 133 entries. The draft has 135 after adding the two existing Heijunka and Yamazumi destinations. Fixed registry count, route-set, curated-opening coverage and homepage carousel checks failed. Heijunka also failed the heading-number rule (a heading starts with “1. ”) and practical-example renderer idempotence.
2. **Protected snapshots.** Homepage preservation and measurement contract tests reported visible-text hash mismatches for the homepage, Knowledge Hub, video library, Abu Dhabi MICE Movement Control Room, Hotel Lean Six Sigma AI Toolkit and Tourism Operational Excellence Management System. The redesign preservation guard separately reported protected article wording/order/punctuation, title/intro/glossary/evidence wording and link order/destinations for those three article pages, and an approved video review note for the hotel article.
3. **Sitemap preservation.** The sitemap exception test failed. The strict preservation guard reported a changed protected sitemap file. The two trees' sitemaps list the same 178 destinations, so the failure does not demonstrate a removed URL.
4. **Pre-existing baseline failures.** The separate [published revision validation job](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42690328221/job/129408066664) ran 197 Python tests and reported 32 failures and six errors. The errors include historical `git show <sha>:articles/heijunka-tourism-operations/index.html` lookups that cannot resolve the path at those commits. Some protected snapshot failures already appear on master. Treat these as an existing triage backlog and reproduce against the current pinned reference before classifying individual draft changes.

## Impact by surface

- Production still serves the verified master revision. The draft did not deploy.
- No HTML path was added or deleted. Across 202 modified HTML files the source scan found no changed canonical target, removed HTML ID, or added/removed literal YouTube embed ID. Sitemap URL membership is identical. These scans do not test interactions or validate every link order.
- Existing article preservation remains unproven because the strict checks failed. Separate UI/presentation text from protected article content using exact side-by-side source and semantic comparisons. Keep the V3.0 wording rule intact.
- Both custom 1200 × 630 PNG social images are replaced in draft OG/X tags by the same 1774 × 887 WebP series cover. Preserve the live article-specific images in a redesign. Robots, ads.txt, domain and primary site configuration files were unchanged in the draft tree.
- Four demo shells changed. There is no project functionality pass based on the tree or the failed workflow.

## Reuse boundary

- Suitable for reuse now as **reference**: shared color, spacing, focus and responsive style ideas, along with the concepts of scrollable tables, descriptive captions and stable video wrappers.
- Reapply selectively from source only after design selection. Reuse markup only where original captions, headings, targets, literal content and project interactions pass comparison. A caption or cue inside the protected body requires preservation review. Keep both custom social cards.
- Hold generated page bundles, all-article rewrites, catalogue/feed regeneration and broad test changes until their deltas have individual evidence. In particular, the draft helper's case-folded ordered-subsequence check allows inserted words and is insufficient as the sole V3.0 exact-wording guard. Preserve the immutable published baseline.
