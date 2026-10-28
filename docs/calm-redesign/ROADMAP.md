# Calm tourism portfolio redesign — working roadmap

**Current position: Step 1 complete. Step 2 is next and has not started.**

Last updated: 28 October 2026 (Europe/Amsterdam).
Working branch: `feature/calm-tourism-redesign`.
Published baseline: `3f5507fb6be29482eacd1cec29fb473f3ff8b9ef`.
Restore tag: `calm-redesign-baseline-2026-10-28`.

## Agreed direction
Travel & Tourism Operations is the primary professional identity. Tourism product teams and MICE/event coordination are related career directions. Quality improvement and AI support this story. Future CV/profile content must reflect actual evidence; professional work, educational examples, demonstrations and proposed results must remain clearly distinguished.

Keep the footer Ahmed likes: its structure, content, logo, colors, typography and links. Use its calm navy/ivory/gold identity to guide the redesign. Keep the existing domain and exact article/project routes, working heading anchors, article wording and order, citations, prompt sources, videos and downloads. No article deletion, slug migration, domain move or cosmetic evidence-date changes. Existing functionality must remain available.

## Steps and completion gates

| Step | Status | Deliverable | Complete when |
|---|---|---|---|
| 1. Record and protect | COMPLETE | Published recovery archive, route/anchor/content/download inventory, footer references and preservation checker | Baseline matches the published commit, backup validates, checker passes and deliberate-change tests prove protection |
| 2. Professional story and CV | NOT STARTED — NEXT | Evidence-based experience map, agreed positioning, homepage introduction and CV alignment plan | Ahmed reviews the factual content and target-role positioning; any CV replacement is explicitly recorded |
| 3. Calm shared design system | NOT STARTED | Typography, color, spacing, navigation, component and accessibility rules derived from the retained footer | One coherent system is documented; no competing new visual systems |
| 4. Four-page preview | NOT STARTED | Homepage, profile/experience, one project and one representative article on a preview branch | Ahmed reviews desktop/mobile previews and approves the direction before broad rollout |
| 5. Site-wide application | NOT STARTED | Approved design applied to all page families through shared code | Every route remains, article preservation checks pass, footer is retained and page-family coverage is recorded |
| 6. Full verification | NOT STARTED | Content/URL comparisons, functional, accessibility, responsive and performance checks with issue list | Required tests pass; material limitations and unresolved issues are visible |
| 7. Review and publication | NOT STARTED | Final preview, approved release, live verification, rollback reference and maintenance notes | Ahmed explicitly approves production release; deployment and live checks pass |

## Step 1 evidence
- 178 public HTML pages, including 130 article pages.
- 9,900 existing anchors recorded.
- 437 linked local resources/downloads recorded with byte hashes.
- 9 project/demo pages and 6 lab/tool pages identified; remaining 33 pages include profile, collections, series and utilities.
- Exact article token sequence, punctuation and link destinations recorded. Formatting/markup may change without silently changing words.
- Canonical targets, internal links (including query strings/fragments), heading text/IDs, directory aliases, file hashes and per-page footer hashes captured.
- Footer template, stylesheet and domain configuration protected separately. Desktop/tablet/mobile visual references saved; tall tablet/mobile footers have additional lower-section captures.
- Published tracked source archived outside the Git repository. All 618 distinct protected page/resource/footer files in that archive match the baseline.
- Initial preservation check passed; nine regression tests verify current coverage, style-only changes, and rejection of changed words, removed anchors, altered footer markup and missing routes.
- No live pages, design or CV content changed in Step 1. No deployment performed.

## Rules for future work
1. Read this roadmap at the start of each redesign session. Update the current step, decision log, issues and next action before stopping.
2. Keep the baseline immutable. Do not recapture it from redesigned pages to make a failing comparison pass.
3. Run `npm run check:redesign` after each proposed batch. A failure blocks rollout until corrected or a narrowly scoped, explicitly approved change is recorded. CV/download replacements are intentional editorial changes requiring review, not silent hash updates.
4. Keep the full release checks in addition to the new preservation check; this checker does not replace link validation, application tests, visual inspection or accessibility testing.
5. Preview work remains separate from production. The earlier deployment approvals applied to the earlier completed releases; Step 7 requires approval for this redesign.

## Decision log
- 28 October: chosen career focus is travel/tourism, with tourism product teams and MICE/event coordination as related directions.
- 28 October: retain the existing professional footer; do not replace it with a new component.
- 28 October: freeze the latest published sources-redesign release as the baseline; use an isolated redesign branch.
- 28 October: Step 1 is protection and planning only. Do not begin writing a new CV or implementing a new visual design yet.

## Open issues and next action
No Step 1 preservation failures remain. External source claims have not been newly fact-checked by this inventory. Runtime behavior and real-device accessibility will be assessed in Step 6; the archive and hashes are not a substitute for those checks.

**Next action: Step 2 — inspect the existing CVs and profile, reconcile factual experience/qualifications, and prepare the professional positioning for Ahmed's review.**
