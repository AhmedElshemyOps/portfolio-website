# Calm tourism portfolio redesign — working roadmap

**Current position: Steps 4–5 implemented; Step 6 local verification complete. Step 7 awaits explicit production approval.**

Last updated: 28 October 2026 (Europe/Amsterdam).
Working branch: `feature/calm-tourism-redesign`.
Published baseline: `3f5507fb6be29482eacd1cec29fb473f3ff8b9ef`.
Restore tag: `calm-redesign-baseline-2026-10-28`.

## Agreed direction
Travel & Tourism Operations is the primary professional identity. Tourism product teams and MICE/event coordination are related career directions. Quality improvement and AI support this story. Future CV/profile content must reflect actual evidence; professional work, educational examples, demonstrations and proposed results must remain clearly distinguished.

Keep the footer Ahmed likes: its design, logo, colors and typography. The latest explicit contact exception moves WhatsApp into Connect and removes the visible phone and duplicate About contact link. Use its calm navy/ivory/gold identity to guide the redesign. Keep the existing domain and exact article/project routes, working heading anchors, article wording and order, citations, prompt sources, videos and downloads. No article deletion, slug migration, domain move or cosmetic evidence-date changes. Existing functionality must remain available.

## Steps and completion gates

| Step | Status | Deliverable | Complete when |
|---|---|---|---|
| 1. Record and protect | COMPLETE | Published recovery archive, route/anchor/content/download inventory, footer references and preservation checker | Baseline matches the published commit, backup validates, checker passes and deliberate-change tests prove protection |
| 2. Professional story and CV | COMPLETE — CONTENT DIRECTION | Evidence-based experience map, agreed positioning, homepage introduction and CV alignment plan | Ahmed reviews the factual content and target-role positioning; any CV replacement is explicitly recorded |
| 3. Calm shared design system | COMPLETE — SPECIMEN PREPARED | Typography, color, spacing, navigation, component and accessibility rules derived from the retained footer | One coherent system is documented; no competing new visual systems |
| 4. Four-page preview | APPROVED FOR ROLLOUT | Homepage, profile/experience, one project and one representative article on a preview branch | Ahmed reviews desktop/mobile previews and approves the direction before broad rollout |
| 5. Site-wide application | IMPLEMENTED | Approved design applied to all page families through shared code | Every route remains, article preservation checks pass, footer is retained and page-family coverage is recorded |
| 6. Full verification | LOCAL CHECKS COMPLETE | Content/URL comparisons, functional, accessibility, responsive and performance checks with issue list | Required tests pass; material limitations and unresolved issues are visible |
| 7. Review and publication | AWAITING PUBLICATION APPROVAL | Final preview, approved release, live verification, rollback reference and maintenance notes | Ahmed explicitly approves production release; deployment and live checks pass |

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

## Current review and next action
The full local preview is on port 4185. Review the feature branch and draft pull request before authorizing production. Original PDF/DOCX CV downloads remain unchanged; a newly typeset CV is a separate reviewed deliverable. External source claims, real-device assistive technology and field performance have not been independently certified.

Step 4 builders and reports below are historical at commit 942e8c5; do not rerun those isolated preview builders against the current inventory. Use the normal shared renderer and site preview for the current release.

## Step 4 progress
- Prepared isolated homepage, profile, InfraQuote case study and hotel operations article previews, retaining their original route paths on local port 4184.
- Used the reviewed tourism-first positioning and confirmed October 2026 Masarra end date. Career experience appears before qualifications. Existing downloadable CV files remain unchanged and still need a separately reviewed replacement.
- Simplified the representative article opening to calm editorial typography. Its exact wording, heading anchors, source links, prompt content and working reading/prompt controls are retained.
- Added a homepage entry to the video library. No newsletter, subscription form or removed conversation section was reintroduced.
- All 178 original routes, 130 original article texts, 9,900 original anchors and 437 protected downloads pass comparison. Two specifically recorded supplemental video figures are excluded from the old-word comparison; the baseline is not regenerated.
- All 179 preview pages pass local links, fragments and duplicate-ID checks. Twenty responsive checks cover five pages at 320, 390, 768 and 1440px. No page-level horizontal overflow; one H1 and one footer on each preview.
- Footer markup and stylesheet remain unchanged. Computed styles and dimensions of the homepage footer match the original preview at desktop width.
- Mobile navigation, global search, glossary/reading disclosures, text size, dark reading, high contrast, prompt customization, copy and reset were checked. Native library disclosures show responsive YouTube players.
- Reproducible preview builders and review sources are in `docs/calm-redesign/step-4/` and `scripts/build_*preview.py`. Screenshots, coverage CSV and check reports are saved outside Git in the workspace outputs.

## Video coverage decision — 28 October 2026
Ahmed requested full channel coverage as part of the redesign. The verified channel is `UCFBNASTT6ys5DsbWLFddPUA`, public handle `@ahmedqualityops-official`.

- Current public Videos and Shorts lists contain 33 uploads: six full-length videos and 27 Shorts. Neither upload list had a continuation; a separate channel-description continuation is unrelated to uploads. Three Shorts were added since the earlier 30-video inventory.
- Public player metadata currently permits embedding 32 videos. `hYP7dJ8XM9I` (guest-ready apartment release) disables embedding, so it receives a direct watch link.
- Retain the 15 existing paragraph-level players. Add the verification/validation Short after the guest/partner interface test paragraph and the Ho-Ren-So Short after the guest-update paragraph in exception communication.
- The remaining 15 lessons have no sufficiently distinct matching existing paragraph or overlap more specific players. They receive one player each in the companion video library, rather than altering article prose or adding irrelevant/repeated players. Every upload has a direct YouTube link; contextual entries link directly to their article player.
- Coverage in the preview: 17 article players, 15 library players, one direct-only video. There are 32 unique players and no duplicates across articles and the library.
- Evidence is public descriptions, original article text and fresh public embedding permissions; this is not a full transcript audit. No additional vidIQ credits were spent. YouTube availability remains externally controlled.
- These additions are explicitly recorded in `supplemental-video-matches.json` and `video-placement-review.csv`. They are preview-only until the redesign reaches the approved rollout/publication stages.

## Step 5–6 release record — 28 October 2026
- Ahmed authorized broad rollout and additional paragraph-matched supplementary videos.
- All 179 public pages use the shared calm design, including 130 articles and four interactive app frames. Original 178 routes, 130 article word sequences, 9,900 anchors and 437 resources pass preservation checks.
- The immutable baseline remains unchanged. Eight exact supplemental video figures/review-note updates, the exact requested footer contact change and one added sitemap URL are narrowly recorded exceptions.
- Current coverage supersedes Step 4: 33 public uploads, 23 article players, nine library players and one direct-only upload with embedding disabled. The 32 players are unique. Placement evidence uses public descriptions and exact article paragraphs, not a complete transcript audit.
- Footer design and stylesheet are retained. About has story, credentials and experience; Connect includes WhatsApp without visible phone digits.
- All 179 pages were checked at mobile width. Local links/fragments/duplicate IDs are clean. The release suite passed 25 check groups (139 Python tests and 19 JavaScript groups); a subsequent monthly inventory regression increased the Python suite by one and the seven targeted rollout tests pass.
- Follow-up visual checks corrected heading contrast on dark prompt panels and pale action panels. Browser checks cover navigation, search, reading controls, glossary and prompt interactions. No Lighthouse/field-performance or screen-reader certification is claimed.
- A monthly thread review is active on the first day of each month at 10:00 Europe/Amsterdam. It requires relevant paragraph matches, no additional paid credits and no automatic merge/deployment; unchanged reviews stay quiet.
- Production master and GitHub Pages remain unchanged. Next action is review and explicit production approval.
