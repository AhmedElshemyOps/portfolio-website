# Phase 02 — Architecture and Implementation Plan

**Status:** Planning complete for review. No Phase 2 implementation, merge, or deployment is authorized by this document.  
**Repository baseline:** `master` at `a645e15464687965dadf686cf043d12c4efe633a` as inspected in this task.  
**Phase 1 review commit:** `2a3b693bb00b0bfbbcd0b420b0c06c090d636800`.  
**Design direction:** Ahmed Quality Ops Knowledge Garden, following the approved Maggie Appleton-inspired direction in Master Transformation Plan V3.0.

## Executive summary

Keep the existing static-site architecture and article paths. Build on the current Knowledge Hub, Field Atlas, controlled taxonomy, article registry, and generated-page scripts. The next implementation should make the experience easier to explore while protecting article text, images, canonical URLs, series paths, projects, analytics consent, and existing SEO signals.

Phase 1 is an unpublished review branch. The mapping is still labeled pending content approval, and its full release workflow failed. This plan does not treat the Phase 1 implementation as released or validated. Diagnose and resolve that failure before any future release decision.

## Proposed architecture

- **Source of truth:** `content/article-registry.json` for article metadata and relationships; `content/knowledge-taxonomy.json` for primary categories and controlled tags; `content/field-atlas.json` for goal journeys and verified graph edges.
- **Static generation:** keep `scripts/knowledge_taxonomy.py` and `scripts/build_field_atlas.py` responsible for reproducible Knowledge Hub, reader, and Atlas markup. Generated HTML must be rebuilt from source data, never edited independently.
- **Reader templates:** preserve existing article-body markup and add navigation, related-content, sharing, and accessibility features in template-owned areas only.
- **Search:** progressively enhance current client-side filtering. Search title, summary, category, subcategory, controlled tags, and series labels; preserve keyboard operation, no-JavaScript fallback navigation, query-string filters, and reset behavior.
- **Knowledge graph:** represent only verified paths and evidence-backed links. Generate reciprocal backlinks where applicable; expose an equivalent ordered HTML list for every visual map.
- **Release:** run the full existing `pnpm run check:health` suite and the relevant focused checks. Review generated HTML and diffs against the pinned protected baseline before any release.

## Four professional-goal journeys

1. **I Manage a DMC** — start with tourism operations; sequence quotation and costing, itinerary development, supplier governance, airport and hotel handovers, MICE movement, service recovery, CAPA, and operational KPIs. Link InfraQuote and InfraDispatch only where the documented use case matches.
2. **I Work in Hospitality** — start with guest-experience quality; continue through guest journey, SOP architecture, complaint analysis, escalation, hotel KPIs, responsible AI/privacy, and the HOTEL prompting framework.
3. **I Want to Learn Lean Six Sigma** — progress from Lean and waste identification to Kaizen/5S, ECRS, process mapping, SOPs, DMAIC, workload leveling, Yamazumi, quality measures, and Hoshin Kanri. Do not imply accredited certification.
4. **I Am Evaluating This Professional for a Role** — provide a sourced path through professional introduction, verified career history, responsibilities, qualifications, four projects, relevant writing, CV, and contact information. Do not infer titles, results, or credentials.

For every journey, identify its intended reader, objective, entry point, ordered lessons, relevant series/projects, and next action. Exclude unregistered articles until they are formally added and validated.

## Knowledge graph specification

- **Nodes:** registered articles, series indexes, learning-path landing pages, four project pages, and verified videos.
- **Relationships:** `part_of_series`, `next_lesson`, `related_to`, `supports_goal`, `demonstrates_project`, and `companion_video`. Each edge records its evidence/source and must resolve to an existing safe local URL or verified video.
- **Validation:** unique node IDs and URLs; no dangling targets; no self-links or duplicate edges; valid series order; stable URL/canonical; link target exists; video embed matches its article; relation labels are human-readable.
- **Backlinks:** show reciprocal “Explore next”/“Related reading” only when useful and avoid duplicate links already in the article.
- **Search integration:** index title, summary, topic/category, series, journey membership, and content format; filter query state is shareable and resettable.
- **Accessibility:** every SVG/map has a concise accessible name plus a complete HTML destination list; visible focus, keyboard access, semantic headings, reduced-motion support, sufficient contrast, and understandable link text.

## File-by-file change plan

| Area | Likely files | Planned responsibility |
|---|---|---|
| Metadata and taxonomy | `content/article-registry.json`, `content/knowledge-taxonomy.json` | Reviewed topic assignments, aliases, journey membership; no article prose |
| Journeys and graph | `content/field-atlas.json` | Audited goal pathways and evidence-backed graph edges |
| Static generation | `scripts/knowledge_taxonomy.py`, `scripts/build_field_atlas.py`, relevant render scripts | Generate hub, reader connections, journey panels, filters and backlinks |
| Templates | `knowledge/index.html`, shared page/article templates, four project pages | Apply shared layout and reader/portfolio components |
| Styles and behavior | existing shared CSS, `assets/css/knowledge-taxonomy.css`, existing search/filter JS | Responsive layout, accessible interaction, performance |
| Tests | `tests/test_knowledge_taxonomy.py`, `tests/test_field_atlas.py`, `tests/test_library_search.cjs`, release health scripts | Contract tests, generated-output drift, preservation and regressions |
| Governance docs | `docs/transformation-v3/` | Decision record, status, risks, approvals, release evidence |

Before editing, inspect the current branch tree and existing generators to confirm exact file paths. Do not create duplicate components or leave obsolete styles/scripts behind.

## Implementation batches

1. **Shared design foundations:** tokens, typography, spacing, color/contrast, responsive containers, focus states, motion settings.
2. **Homepage and managerial identity:** professional introduction hierarchy, evidence-backed portfolio modules, accessible project navigation.
3. **Knowledge Garden and goal journeys:** taxonomy crosswalk approval, journey navigation, map alternatives, search/filter refinements.
4. **Article reader and publishing workflow:** reader controls, reading progress, related links, share metadata, repeatable authoring/generation.
5. **Projects and employer portfolio:** consistent project summaries, evidence boundaries, working demo links, CV/contact routes.
6. **SEO, GEO, analytics, AdSense readiness and final QA:** structured data, internal links, social cards, consent compatibility, measurement validation, image optimization and release report.

Each batch must be separately reviewable and pass focused tests before proceeding to the next.

## Acceptance criteria

- All existing article and series URLs, canonical URLs, article body wording, images, social cards, four projects, and CV route remain intact.
- Generated output is reproducible; generator check mode reports no drift.
- Every public navigation/filter option resolves to results; counts equal the registered records under the documented counting rule.
- Search and filters work with keyboard, assistive technology semantics, narrow mobile widths, and URL query state.
- Every graph edge resolves; every visual map has an equivalent text list.
- No broken internal links, missing assets, duplicate IDs, invalid structured data, console errors, or unintended tracking changes.
- Images have appropriate dimensions/format and meaningful alternative text; layout shifts and payload are measured against the current baseline.
- Release checks pass, and content-preservation comparison shows no article wording or path changes.

## Risks and rollback

- **Unreviewed topic mappings:** keep crosswalk labels pending until Ahmed approves; do not publish those assignments as final editorial taxonomy.
- **Generated-page drift:** regenerate from source and require generator check mode; revert the batch commit if source and output diverge.
- **SEO/path regression:** compare canonical, metadata, redirects, and internal links to baseline before release.
- **Accessibility/performance regressions:** test mobile, keyboard, zoom, contrast, and reduced motion for each UI batch; record metrics against baseline.
- **Analytics/consent regression:** keep tracking code unchanged unless explicitly scoped and verify consent behavior in a controlled test.
- **Release-check failure:** inspect Actions job output, fix the specific failing assertion, rerun the full health workflow, and block release while red.
- **Rollback:** retain one commit per implementation batch; revert the affected batch and rebuild generated artifacts from the last passing source commit.

## Phase 1 inspection record and open gates

- Branch diff: seven files; one commit ahead of master, no divergence from master.
- The registry has 133 records (128 articles and 5 series indexes); article URL order matches the source registry.
- Ten proposed field topics are present; maximum controlled tags per record remains five. Two proposed candidates (Heijunka and Yamazumi) are absent from the registry and excluded from active public topics.
- The full release workflow `Validate website release` failed at `pnpm run check:health` (run 45208981208). Install/setup steps passed. The job log endpoint did not return decoded diagnostics in this inspection, so the failing assertion remains unknown.
- No pull request was merged, no production deployment was made, and no live-site visual QA was performed. The current review branch is not a release candidate until the failing check is diagnosed and passes.
- Phase 1 crosswalk mappings remain pending content approval; this plan does not claim they are approved.

## Phase status

**Phase 1:** code prepared on review branch; check failure and content-mapping approval remain open.  
**Phase 2:** planning deliverables drafted here; no implementation started.  
**Next gate:** inspect the failed health-check job diagnostics, approve/revise the topic crosswalk, then obtain explicit approval before starting implementation batches.
