# Field Atlas development handover

Development branch `development/knowledge-garden-v3` starts at protected production commit `753c3a0cc6e2235201e939b840973911725dc00c`. Specifications came from `redesign-2026` at `5fc86cae7067983844a5e0a1125ce01027e6a6ff`. The production tree and Soft Clay draft were excluded from development writes. This is a development candidate with a separate release decision.

## Checkpoints

| Phase | Development evidence |
| --- | --- |
| 00–02 | Used the verified production checkout, existing Phase 00 and Gate 3 audit, the approved Field Atlas pilot, and Gate 2 architecture. The original 18 phases and gates are in [Master Plan V3.0](MASTER_PLAN.md). |
| Stabilization | Kept immutable historical refs and scoped history loops to each tree's real article inventory. Preserved existing iframes in render/publish. Rebuilt the missing Lean guide stylesheet from original CSS sources and added the exact two historical sitemap additions to the old-reference comparison. Direct production verification remains a separate test. |
| 03–04 | Extracted the article shell and checked byte and registry parity on fixed drafts. Reused existing canonical sharing controls and custom cards. Managed previews gain Atlas styling and an inert, hidden future ad slot outside the article. |
| 05–06 | Added the professional-first responsive homepage, local Lora/Plex type, bounded original SVG art, focus indicators, reduced-motion handling and responsive reader styling on Atlas connection pages. Existing article art and video embeds stay intact. |
| 07 | Added operating problem, contribution, inspectable output and prototype boundaries to all four case studies. The employer summary and homepage surface CV-backed evidence and contact. |
| 08–09 | Added four journeys, 53 distinct reviewed destinations including the return route, eight evidence-backed relationships and a five-stop link map with equivalent HTML links. Continued to use existing search, series and five active categories. The ten future categories are labelled as planned. The complete five-to-ten crosswalk is carried as planning data only. Existing video inventory is reused. |
| 10 | Preserved original index rules, sitemap, feed, canonical routes, card metadata and structured data. Added readable contextual navigation and existing destination links as the discovery change. |
| 11–14 | Retain change evidence, review boundaries, test data and revertable scopes. Added direct Git-based production preservation tests, graph validation, new shell tests and strict sitemap negatives. This file documents preview and release procedures. |
| 15–17 | Final acceptance, release and post-release measurement remain open. Advertising and additional tracking require their existing approvals. |

## Use the candidate locally

```sh
pnpm install --frozen-lockfile
pnpm run dev
python3 scripts/build_field_atlas.py --check
python3 -m unittest discover -s tests -p test_field_atlas.py
python3 -m unittest discover -s tests -p test_managed_article_shell_parity.py
python3 -m unittest discover -s tests -p test_article_publishing.py
```

Open the homepage, `/knowledge/index.html#field-atlas`, `/articles/integrated-sop-creation-model/index.html`, `/resources/recruiter-summary/index.html`, and the four existing project case-study URLs. The four routes link into ordered reading, series and projects with a return to the Garden. The five active categories are available in the existing search/filter surface. ECRS remains in the [content backlog](PROFESSIONAL_GOAL_JOURNEYS.md#reviewed-content-backlog).

Run the publishing CLI in a disposable full checkout for demonstrations. Use a synthetic draft with an approved series ID and its next consecutive number. Invoke `python3 scripts/publish_article.py <draft.md> --preview <output.html>`. The preview writes generated CSS under its source checkout. The specimen used duplicate section labels, generated two distinct anchors and included the inactive slot. It stayed outside the article registry, sitemap and feed.

## Candidate verification

- Browser fixture at 320, 390, 768 and 1,250 CSS px. Home, Garden, reader, employer summary and one case study had zero page-level horizontal overflow in all 20 checks. Manual desktop and mobile visual checks sampled the homepage and Garden. The article sample exposed the native contents disclosure, contextual links, backlinks and sharing control.
- InfraQuote produced AED 4,000.50 for four adults and one child, worksheet CSV and JSON, and saved a browser-local draft. InfraDispatch returned three pickups, seven passengers, one child seat and a 65-minute estimate, and generated JSON and HTML. InfraSky returned SELL at 80/100 for a future-date estimated fixture and saved/exported the plan. InfraCluster returned six groups, 56 passengers, four clusters and an AED 3,569 estimate, with CSV and dispatch handover JSON. All four rendered at 390 px. These scenarios check generated payloads and immediate storage. Live integrations, disk exports and long-term storage have separate verification.
- Direct preservation compares every article/series route, protected body and iframe bytes, metadata, original link destinations and anchors against Git production. All 18 legacy copies pass the existing identity check. CV files, project demo runtime, backend, redirects, analytics, ads and workflow configuration are unchanged.
- Atlas CSS is about 4 KB uncompressed and the original homepage SVG about 2.6 KB. Atlas introduces no new JavaScript dependency. The map is static and has a link-list alternative. Performance observations here are asset sizes and reflow checks. Collect Lighthouse, field Core Web Vitals and assistive-technology results at final verification.
- Content, search, site links and navigation preflights passed in the development run. The full check remains a release gate. Known families include historic article fixture/body mismatches, legacy renderer drift, custom guide metadata or generated components, older video placement assumptions and historical snapshot checks that also cover intentionally redesigned surfaces. Keep strict assertions and reconcile exact historical differences. The old preservation reference still reports three article token/link pairs tied to the video-audit changes. The current production check remains independent and green.

## Final release verification

1. Start from a clean checkout of the final candidate and fetch full history. Use Node 22, Python 3.12 and pnpm 9.15.9. Confirm the production and planning refs separately.
2. Re-run the direct production checks, legacy identity, content/search/link checks, and full `pnpm run check:health`. Resolve or explicitly adjudicate historical failures and candidate-sensitive checks with exact evidence. Preserve original refs and assertions. Keep user-visible article changes outside stabilization.
3. Repeat all project fixtures including browser PDF/disk export, denied or cleared browser storage, and keyboard interaction. Verify the development candidate matches the approved production outputs.
4. Check 320/390/tablet/desktop, 200% zoom, keyboard traversal, a screen reader, reduced motion, contrast, Lighthouse and real-user performance where data is available. Verify image and embed rendering and the canonical social share targets.
5. Review the exact protected diff, consent behavior, Search Console evidence and rollback rehearsal. Keep the five-to-ten taxonomy inactive until approved. Record an explicit Gate 4 decision before any merge or production action.
