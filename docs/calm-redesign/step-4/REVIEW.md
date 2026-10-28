# Step 4 — review the real pages and video coverage

The live website is unchanged. This is the review stage before applying the design to every page family.

## Open the local previews

- Homepage: http://127.0.0.1:4184/
- Experience/profile: http://127.0.0.1:4184/profile/index.html
- InfraQuote project: http://127.0.0.1:4184/projects/infraquote/index.html
- Representative article: http://127.0.0.1:4184/articles/hotel-operations-manager-ai-toolkit/index.html
- Complete video library: http://127.0.0.1:4184/learn/videos/index.html
- New verification/validation placement: http://127.0.0.1:4184/articles/standard-test-procedures-tourism-operations/index.html#video-VMAXcTM4zsE
- New communication placement: http://127.0.0.1:4184/articles/sop-exception-escalation-management/index.html#video-RkXz9VNLdEc

## What changed in this preview

Warm ivory, restrained navy/gold, Lora headings, IBM Plex Sans body text, smaller editorial headings, quieter cards and comfortable spacing. The profile puts experience before qualifications and uses the confirmed Den Haag location and October 2026 Masarra end date. Department/function labels support the tourism operations, product support and MICE/event coordination direction without inventing job titles.

The representative article uses a text-led opening instead of the decorative banner artwork. Original article words, order, headings, links and prompt templates remain intact. The article reading column reaches 720px on desktop and scales to mobile. Reading preferences, search, mobile navigation and prompt tools remain available.

The footer is retained exactly. No contact conversation section or subscription form is introduced. Existing CV downloads remain the old published documents; new CV typesetting/replacement is still a separate reviewed deliverable.

## All public videos accounted for

Verified channel: https://www.youtube.com/@ahmedqualityops-official

33 public uploads: 6 full-length videos and 27 Shorts, checked 28 October 2026. Three are new since the original audit. This refresh used public pages without spending additional vidIQ credits.

| Placement | Count | Reason |
|---|---:|---|
| Relevant article paragraphs | 17 | Original 15 placements retained, two new closely matched Shorts added |
| Companion video library | 15 | No distinct existing paragraph match, or overlaps a more specific article player |
| Direct YouTube link | 1 | YouTube disables embedding for the guest-ready apartment-release video |

All 33 have direct watch links. There are 32 unique privacy-enhanced players, with descriptive titles, lazy loading, fullscreen support and no autoplay. Shorts retain a vertical aspect ratio. Library players use native keyboard-operable disclosures to keep the page calm and avoid a wall of loaded videos. The library links article-supported lessons directly to the relevant player without embedding them twice.

The CSV records every upload, its exact destination, availability and placement rationale. Library-only entries are explicitly identifiable; they are not reported as paragraph matches. Descriptions and article context were reviewed; full transcripts were not available for a complete transcript audit. Public player metadata is evidence of current embed permission, not a guarantee of future availability or measured channel growth.

## Validation

- 178 original routes, 130 articles, 9,900 anchors and 437 protected downloads pass baseline comparisons. Only the two recorded additional video figures are removed for the original-word comparison; actual generated preview pages are checked, and the immutable baseline is retained.
- All 179 preview pages pass local link/fragment validation with no duplicate IDs.
- Original shared rendering and navigation checks pass.
- Nine preservation tests and two original video-contract tests pass.
- All 17 article players pass exact paragraph-anchor checks. Across the articles and library, every embeddable upload has exactly one player, and the disabled upload has none.
- Twenty responsive checks cover 320, 390, 768 and 1440px. No page-level horizontal scrolling; one H1 and one footer per page. Wide article tables keep their existing labelled local scrolling.
- Homepage footer computed styles/dimensions match the original at desktop width.
- Mobile menu, search (71 hotel results), reading size (18px to 19.8px), high contrast, dark reading, prompt customization, copying and reset checked. A library player loaded its actual YouTube thumbnail after keyboard expansion.
- Screenshots cover desktop/mobile versions of all five preview pages. This is browser inspection, not a claim of complete assistive-technology or real-device certification. Full-site accessibility/performance verification remains Step 6.

## Rebuild locally

From the repository root, choose an empty output directory outside the repository:

```sh
python3 scripts/build_redesign_video_preview.py --output ../calm-video-preview
python3 scripts/build_calm_page_preview.py --output ../calm-video-preview
```

Run the existing static preview server with the generated directory as its working directory. The builders reject source directories and unrelated nonempty output directories. HTML is copied; unchanged dependencies are linked for local read-only use. The generated directory is not a standalone release bundle and must not be deployed.

For Step 5, move approved components into the shared production rendering architecture, register the new library route and coverage, preserve the narrowly recorded video additions, then run full release checks. Do not deploy the generated preview directory.
