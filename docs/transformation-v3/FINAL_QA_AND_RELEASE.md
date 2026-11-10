# Field Atlas final QA and release preparation

## Release blocker resolution

**Recommendation: BLOCKED at final manual sign-off.** The code and preservation checks are green. Close the remaining Lighthouse and manual accessibility checks in a supported browser before approving a live release. The protected revision is `753c3a0cc6e2235201e939b840973911725dc00c`. The starting development revision was `28ea5f72a2ae8f8bf48cc39f5adb17948b8f38f9`. This section supersedes the earlier run retained below.

| Check | Final evidence |
| --- | --- |
| Frozen release suite | Node 22.23.4, Python 3.12.14, pnpm 9.15.9. Offline frozen install passed. `pnpm run check:health` passed **31/31 groups**, including **205 Python tests with zero failures or errors**, 21 Node groups, shared bundles, publishing, link and SEO checks. |
| Historical and redesign failures | Closed all 31 previous failures. The earlier inventory records 18 historical IDs and 13 pre-Atlas snapshot conflicts. Historical fixture assertions still replay their original references. Two standalone guides use exact authored fixtures. Three supplemental video figures are reconciled against both sides of `e68a59f31de2245a6a08c206e9102e6484ee2ab4`. The production contract independently guards current bodies, links, anchors and metadata. |
| Renderer and discovery | Shared rendering reports zero drift and 18 synchronized historical article copies. Existing iframe markup with parameters now stays in place. Global search now finds published Heijunka and Yamazumi by their canonical page metadata. Neither has been assigned an unapproved category. |
| Protected content and SEO | 196 routes, 135 article/series paths, 18 aliases, 9,460 anchors, 2,356 social tags, 22 unchanged social-image files, 178 unchanged sitemap URLs and 376 unchanged JSON-LD nodes. Original article bodies, links, heading IDs, video placement and canonicals match production. Alias bytes differ only by the verified reader asset cache key. Intentional text, heading, anchor, link, canonical and social-image URL mutations were rejected. |
| Browser navigation | All four journey links reached their expected anchors by keyboard. Global search found both Lean guides and Escape returned focus. Garden search for SOP found 63 matching items. The reader copied the article URL and restored keyboard-selected text size after reload. Employer, CV and project links were inspected. Existing category, series and consent behaviors passed their automated tests. |
| Accessibility | axe found zero violations on nine representative routes at 390 and 1,250 CSS px. All 36 combinations at 320, 390, 768 and 1,250 CSS px had one main heading and no document overflow. Narrow contrast fixes covered InfraDispatch, InfraSky and InfraCluster. Both reader text-size names include the visible button label. Standalone assistive-technology and browser zoom/reduced-motion sign-off remains open. |
| Performance | Mobile and desktop Lighthouse both failed to start Chromium because the environment rejected the process singleton socket and crashpad ptrace. The local 390 px iframe sample observed DOM/load of 67/83 ms home, 42/81 ms Garden and 85/100 ms reader, with CLS 0.000 in those observations. LCP was unavailable in the sample. These are lab observations. |
| Integrations | Preview-host and consent tests passed. AdSense remains inactive. Live YouTube playback, maps/weather providers, GA4 account ingestion, Search Console indexing and search visibility were outside the verified scope. |

### Project checks

| Project | Functional fixture | Actual browser delivery and reload |
| --- | --- | --- |
| InfraQuote | 4 adults and 1 child, AED 4,000.50. JSON and worksheet CSV contents checked. | Native JSON download completed. Saved draft fields restored after reload. |
| InfraDispatch | 3 pickups, 7 passengers, 1 child seat, 65 minutes. JSON and HTML contents checked. | Native HTML download completed. Operator profile restored after reload. Print-ready browser manifest opened and contained all three stops. |
| InfraSky | 16 passengers, future-date estimate, 80/100 SELL. JSON handover checked. | Native JSON download completed. Saved plan remained after reload. |
| InfraCluster | 6 groups, 56 passengers, 4 clusters, AED 3,569. CSV and handover JSON checked. | Native CSV download completed. Browser-local persistence is not claimed for this demo. |

All four projects passed the 390 px layout fixture. The print-ready manifest was inspected in the browser. OS print/save-to-PDF for the project print actions remains unverified.

### Preview, deployment and rollback

1. From the development checkout, run `pnpm run dev -- --host 127.0.0.1 --port 4173`. Open the homepage, `/knowledge/index.html#field-atlas`, a protected article, the recruiter summary, and the project case studies. Use the supplied screenshots to compare the protected and candidate homepages.
2. Before release approval, run desktop and mobile Lighthouse in an environment that can launch Chrome. Complete browser zoom, reduced-motion, screen-reader and print/PDF spot checks. Record findings against the pinned development revision.
3. After explicit release approval, verify the serving SHA, freeze the known-good protected revision and rehearse the revert or hosting rollback path. Confirm sitemap, redirects, consent and cache state. Publish only the approved candidate through the authorized release process.
4. Smoke-test the homepage, Garden, protected article and alias, all four demos, sitemap, consent and ad-loader state. If a protected route, article, image, demo or consent behavior regresses, restore the recorded good revision. Verify the serving SHA, service worker, cache and smoke routes, and retain the incident evidence.

## Historical QA record

**Recommendation: BLOCKED.** This review covers the development branch only. Production reference `753c3a0cc6e2235201e939b840973911725dc00c`. QA started from development commit `c9f3989cc8724951c4fb5f06c4031e3ac641f088`. Existing planning and protected-master evidence was reused. The Master Transformation Plan V3.0 phase and approval boundaries apply.

## Repairs

- Stabilized the Atlas stylesheet order and kept the reader backlink slot outside the protected article body in its intended position after rendering. Related-reading detection now ignores supplemental Atlas links so they cannot displace original content.
- Moved the four project panels after the actual top-level case introduction, where the shared renderer retains them. Verified all seven updated shared-render routes.
- Refreshed the Garden’s generated video badges and video-format filters from the existing video match manifest.
- Fixed the four homepage demo links so each accessible name starts with its visible “Try demo” text and still identifies the project.
- Removed an unused homepage WebP preload. It avoids requesting a 16,850-byte asset on a cold load. The profile retains its portrait. The Atlas SVG and CSS remain 2,632 and 4,035 bytes, respectively.

## Preservation, SEO and GEO

| Check | Result |
| --- | --- |
| Route and article identity | Compared 196 distinct published routes, including 135 article/series paths and 18 legacy aliases. Compared original article body bytes, iframe markup, original anchor element attributes, and 9,460 protected article anchors. Legacy aliases remained byte-identical. |
| Canonicals and social | Canonical attributes and 2,356 Open Graph/Twitter tags match protected master on all audited routes. Compared the original bytes of 22 referenced local social-image files. |
| Sitemaps and structured data | All 178 sitemap URLs are present in the byte-identical sitemap. Compared 376 parsed structured-data nodes against protected master, with zero JSON-LD parse errors in the audited set. Robots, feed, analytics source, ads configuration and project application files are unchanged. |
| Discoverability | Source-only checks verified canonical routing, sitemap, legacy redirects, registry, map evidence and journey targets. Search Console indexing, ranking, crawler uptake and generative-search citations require account or post-release observation. |
| Links | Site link check covered 203 pages with zero missing references, fragments or duplicate IDs. Navigation checked 206 HTML pages and 4,400 TOC links. The checks have distinct inventories. |

The stronger direct Git preservation check is independent of the older historical contract. No preservation assertion or recorded historical revision was changed.

## Browser, accessibility and performance

- Chrome tested home, Garden, article, employer summary, InfraQuote case study and four live demos at 320, 390, 768 and 1,250 CSS px. All 36 page/width checks found one main heading and no document-level horizontal overflow.
- The mobile menu opened with Enter, closed with Escape and returned focus to the trigger. Article contents opened and closed from the keyboard. The sample article exposed its backlinks and sharing controls.
- Garden search returned nine results for `quotation`, showed the empty state for a nonsense query, and recovered the 133-item inventory when cleared. Keyboard category filtering returned 12 Product Strategy & Development results. The AI for Hotel Apartments editorial-series selection returned 27 results. The generated Atlas validation resolved 53 approved destinations across four journeys and verified the five-stop map and article relationships.
- axe ran at 390 and 1,250 CSS px on nine routes. The homepage initially flagged a serious visible-label mismatch on four demo links. A focused retest passed with zero violations at both widths. Garden, employer summary, sample case study and InfraQuote demo reported zero violations in the sample.
- Local 390 px iframe lab values were 74/94 ms DOM/load for the repaired homepage, 41/78 ms for Garden and 86/105 ms for the sample reader. Observed CLS was 0.000 in the sample. These are isolated navigation observations with the accessibility runner, without an LCP result. They cannot establish real-user performance, Lighthouse scores, INP, or field Core Web Vitals.
- Before-and-after desktop and mobile homepage captures were taken from protected-master and candidate HTML in the isolated preview. The preview also includes a viewport selector, Garden, reader, case study, publisher specimen and project fixtures.

## Four-project verification

| Project | Browser fixture result |
| --- | --- |
| InfraQuote | Four adults and one child, AED 4,000.50, next step advanced, draft persisted in browser storage, JSON and worksheet CSV payloads verified. |
| InfraDispatch | Three pickups, seven passengers, one child seat, 65-minute estimate, JSON and HTML manifest payloads, browser-local profile. |
| InfraSky | Al Ain/Jebel Hafeet, 16 passengers, future-date estimate at 80/100 SELL, JSON handover, saved plan and tab selection. |
| InfraCluster | Six groups, 56 passengers, four clusters, AED 3,569 estimate, six CSV rows, InfraDispatch JSON handover and step navigation. |

All four displayed at 390 px without page-level overflow. Fixtures inspect generated payloads and immediate local storage. They use sample inputs and do not certify third-party services, desktop downloads, printing or long-term storage.

## Publishing, analytics and ads

- Four publication regression tests and two shell parity/inactive-slot tests passed. A fresh disposable specimen rendered two distinct IDs for repeated headings and an inactive ad slot. The specimen was excluded from the real registry, sitemap and feed.
- GA4 source tests verified no loader or events for denied consent or preview hosts, exactly one page view for consent granted in the production-host simulation, and removal of private query values from event data. Browser QA used preview hosts. Live account collection and consent transmission were outside this review.
- AdSense readiness tests verified publisher metadata, `ads.txt` and the absence of the ad loader. Ad serving and new tracking remain inactive.

## Release suite and retained assertions

Node 22.23.4, Python 3.12.14 and pnpm 9.15.9, frozen lockfile. **29/31 check groups passed.** Ran 202 tests in 249.629s. FAILED (failures=31).
The candidate cleared 7 previously failing IDs and introduced 0 new IDs against the preceding development run. 18 remaining IDs also occurred on protected master. The other 13 are pre-Atlas whole-page snapshot assertions. The full suite began before the last one-line preload removal. The affected homepage and seven-route rendering checks were rerun after that removal.

The failing groups remain Article and website tests and Shared templates and bundles. Targeted content, search, links, navigation, Atlas build, publisher, template, 18 alias, direct preservation, GA4 and AdSense tests exited zero. The historical-reference preservation command exited one.

<details><summary>Open test IDs from the full run</summary>

- test_all_articles_follow_the_hierarchy (test_article_headings.HeadingTests.test_all_articles_follow_the_hierarchy)
- test_all_articles_have_top_glossary_and_original_sources (test_premium_toolkit_integration.ToolkitIntegrationTests.test_all_articles_have_top_glossary_and_original_sources)
- test_all_editorial_pages_have_curated_openings (test_article_value.PracticalValueTests.test_all_editorial_pages_have_curated_openings)
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/abu-dhabi-mice-operations-series/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/article-abu-dhabi-mice-movement-control-room/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/article-destination-experience-journey-map/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/hotel-lean-six-sigma-ai-toolkit/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/integrated-sop-creation-model/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/itil-4-tourism-operations/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/lean-thinking-tourism-operations/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='articles/tourism-operational-excellence-management-system/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='knowledge/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='learn/videos/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='projects/infracluster/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='projects/infradispatch/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='projects/infraquote/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='projects/infrasky/index.html')
- test_all_existing_words_links_anchors_and_canonicals_unchanged (test_measurement_page_contract.PageContractTests.test_all_existing_words_links_anchors_and_canonicals_unchanged) (page='resources/recruiter-summary/index.html')
- test_all_rendered_examples_have_five_stages_and_valid_provenance (test_article_examples.PracticalExampleTests.test_all_rendered_examples_have_five_stages_and_valid_provenance)
- test_baseline_covers_the_whole_published_site (test_redesign_preservation.RedesignPreservationTests.test_baseline_covers_the_whole_published_site)
- test_caption_and_scroll_coverage (test_article_visuals.ArticleVisualTests.test_caption_and_scroll_coverage)
- test_complete_coverage_exact_titles_and_reading_order (test_series_banners.SeriesBannerTests.test_complete_coverage_exact_titles_and_reading_order)
- test_every_outline_has_valid_unique_targets (test_article_toc.ContentsTests.test_every_outline_has_valid_unique_targets)
- test_every_public_video_has_one_destination_and_no_repeated_player (test_calm_rollout.CalmRolloutTests.test_every_public_video_has_one_destination_and_no_repeated_player)
- test_homepage_preservation_baseline_is_unchanged (test_career_routes.CareerRoutes.test_homepage_preservation_baseline_is_unchanged)
- test_matches_are_unique_accessible_and_anchored (test_article_videos.ArticleVideos.test_matches_are_unique_accessible_and_anchored)
- test_original_articles_routes_and_bodies_preserved (test_seo_batch.SeoBatchTests.test_original_articles_routes_and_bodies_preserved)
- test_original_teaching_bodies_prompts_and_dates_untouched (test_library_navigation.LibraryNavigationTests.test_original_teaching_bodies_prompts_and_dates_untouched)
- test_routes_canonicals_and_original_content_preserved (test_knowledge_taxonomy.KnowledgeTaxonomyTests.test_routes_canonicals_and_original_content_preserved)
- test_visible_breadcrumbs_match_schema_and_canonical (test_library_navigation.LibraryNavigationTests.test_visible_breadcrumbs_match_schema_and_canonical)

</details>

## Remaining risks and release impact

| Severity | Issue | Release impact |
| --- | --- | --- |
| High | Red historical assertions and shared renderer. Some legacy checks compare whole pre-Atlas pages or derive older article bodies, layouts and video rules. The old-reference preservation check still reports six text/link mismatches on three articles. | Block. Resolve exact historical comparison scope and renderer drift without changing protected published article content. |
| High | axe reports serious contrast in InfraDispatch and InfraSky planning eyebrows and an InfraCluster step label at both sampled widths. The protected reader sample has two visible-label/name mismatches for desktop font-size controls. | Block accessibility sign-off. The protected demo and reader assets retain their original bytes. Scope and validate presentation-only fixes under the preservation rules. |
| Medium | Screen-reader coverage, zoom and interactive assistive-technology coverage are incomplete. Lighthouse and full field performance evidence are open. | Complete before release approval. Treat localhost metrics and automated axe sampling as partial coverage. |
| Medium | Only sample fixture exports and browser storage were checked. Live map/weather services, actual disk downloads and printing require separate smoke checks. | Include in sign-off, especially if external dependencies or operational exports are release criteria. |
| Informational | Taxonomy review, ranking/citation evidence, AdSense activation and live account validation are separate decisions. | Keep unapproved category mappings, ad serving and new tracking inactive. |

## Deployment and rollback checklist

1. Resolve the high-severity findings. Pin the candidate SHA and keep protected-master comparison reports. On a clean checkout with full history, run the frozen install, `pnpm run check:health`, `pnpm run check:redesign`, Atlas generation check and direct Git preservation tests.
2. Confirm the preview matches the candidate SHA. Complete the accessibility, download/print and performance checks. Record the release decision and receive explicit approval before any production branch or hosting change.
3. Prepare a verified copy of the last known-good site from the protected SHA. Record the serving revision, hosting settings, service-worker behavior and expected canonical sitemap. Keep a pre-change smoke-test record. Use a prepared revert commit or the hosting provider’s approved rollback path.
4. After an authorized release, smoke-test homepage, Garden, one protected article and its legacy alias, all four project entry points, sitemap, robots and consent handling. Confirm protected image and metadata evidence and that ads and new tracking remain inactive.
5. If a protected route/body/image differs, a demo flow breaks, consent regresses or critical accessibility fails, restore the recorded good revision by revert or the approved hosting rollback. Confirm the serving SHA and service-worker/cache state. Recheck the same smoke paths and preserve the incident evidence.

No release operation was performed in this review.
