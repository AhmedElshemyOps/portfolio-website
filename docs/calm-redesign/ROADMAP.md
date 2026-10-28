# Calm tourism portfolio redesign — working roadmap

**Current position: Steps 1–3 complete for baseline, content direction and design-system preparation. Step 4 (four real page previews) is next.**

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
| 2. Professional story and CV | COMPLETE — CONTENT DIRECTION | Evidence-based experience map, agreed positioning, homepage introduction and CV alignment plan | Ahmed reviews the factual content and target-role positioning; any CV replacement is explicitly recorded |
| 3. Calm shared design system | COMPLETE — SPECIMEN PREPARED | Typography, color, spacing, navigation, component and accessibility rules derived from the retained footer | One coherent system is documented; no competing new visual systems |
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
- 28 October: Step 1 was protection and planning only; no production CV or visual design changes were made.
- 28 October: Ahmed instructed Step 2 and confirmed the Masarra role/end date, Den Haag location and sponsorship statement. CV/profile review drafts are now prepared; existing public files remain unchanged.
- 28 October: Ahmed confirmed unchanged language levels and requested department/function-based presentation to support his transition away from guiding. This replaces the earlier proposed guiding-led experience card.
- 28 October: Ahmed instructed moving to Step 3. The calm shared design-system specimen is prepared; Step 4 is the next reviewable implementation stage.

## Step 2 progress
- Existing PDF and DOCX CV versions, profile, professional-profile data, evidence ledger, selected project pages and key credential documents reviewed.
- Recorded user-confirmed Masarra end date (October 2026), licensed French/English tour-guide role in the operations team with cross-functional support, Den Haag location and no-sponsorship work authorisation.
- Prepared the career evidence map, proposed profile data, homepage/profile copy, and tourism-first CV text draft in `docs/calm-redesign/step-2/`. These are review drafts, not public CV replacements.
- Presentation and language decisions confirmed: department/function labels rather than repeated guiding titles; existing language levels unchanged. Remaining review is the revised copy and any corrections to older dates/operating volumes.
- No article, footer, live page, original public CV or download was changed. Step 1 baseline remains immutable.

## Step 3 progress
- Prepared one scoped navy/ivory/gold design system using existing Lora and IBM Plex Sans fonts.
- Created a local specimen for typography, palette, spacing, navigation, actions, experience/project cards, reading, disclosures and references.
- Reused the published footer markup and stylesheet unchanged, outside the new style scope.
- Verified four viewport widths, 48px controls, readable contrast, native disclosures and unchanged protected content.
- This is design-system preparation, not the four-page preview or a live redesign.

## Open issues and next action
Ahmed instructed proceeding to Step 3 after the department/function and language decisions. Step 2 content direction is accepted for the preview work; a newly typeset CV has not been approved or issued. Historical dates/volumes remain supplied career claims, not independently audited results.

No Step 1 preservation failures remain. External source claims have not been newly fact-checked by this inventory. Runtime behavior and real-device accessibility will be assessed in Step 6; the archive and hashes are not a substitute for those checks.

**Next action: Step 4 — prepare the homepage, profile/experience, one project and one article as real responsive previews for Ahmed’s review. Do not roll out site-wide or deploy yet.**
