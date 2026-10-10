# Verification results — local changes only

## Executed and passed

| Check | Result |
|---|---|
| Frozen baseline at `26bf6ee9baa2c417e1f113fbec164ca8da793283` | 21/21 health groups passed in a separate extracted snapshot. |
| Final complete health suite | **21/21 groups passed**, including **87 Python tests** and existing JavaScript interaction/product/backend checks. See `health-checks.log`. |
| Public local links | 178 public HTML pages; **zero missing destinations, broken fragments or duplicate IDs**. |
| Article navigation | 180 HTML files including templates; **4,297 TOC links**, no missing local destinations. |
| Shared renderer / bundled styles | **Zero drift** after generation. |
| Taxonomy | Five categories, 21 populated subcategories, controlled tags, valid files/references and unique consecutive numbered series. Invalid category/tag/URL cases rejected in tests. |
| Series | Amsterdam 12 numbered articles; AI for Hotel Apartments 26. Artwork reuse does not create false series membership. |
| Registry reconciliation | 133 unique records, 128 article records, five index records; 130 article-directory files and three series-directory files; no missing or unregistered pages. |
| URL preservation | Before/after registry URL lists and 130 article-file paths identical; all 133 canonicals identical. |
| Body preservation | Original teaching bodies byte-for-byte equal to baseline, with existing regression checks preserving prompts, dates and historical approved revisions. |
| Search / filters | Existing word matching, accent normalization, saved selection, legacy filters, empty-state recovery, pagination and focus checks pass; added category/subcategory/tag/editorial-series intersection tests pass. |
| Financial arithmetic | **54/54** selected independent calculations passed. This does not certify every numerical sentence. |
| SEO inventory | All 133 registry pages have one H1, meta description, original canonical and sitemap inclusion. Structured JSON parses. No H1/registry discrepancy remains. |
| Scope review | 43 HTML pages outside Knowledge/articles/series changed only the shared discovery JavaScript fingerprint. No unexpected content changes in those pages. |
| Patch whitespace | `git diff --check` passed. |

## Browser verification

`browser-checks.json` records **148 viewport/page checks**:

- All 133 registered article and series pages at 390px width: no horizontal document overflow; exactly one shared footer, one H1 and one new subject-context panel.
- Knowledge Hub at 320px, 768px and 1440px: five category cards, one footer, no horizontal overflow.
- Six representative articles/overviews at both 768px and 1440px: no horizontal overflow; expected shared structure present.

Additional observed interactions:

- Category Operations & Process Engineering + Asset Reliability & Maintenance returns eight matching items.
- Amsterdam series returns 13 items: its overview and 12 installments, in numerical order.
- Unknown search produces an empty state; reset restores the library.
- Show more increases the visible batch to 24 and focuses the first newly revealed link.
- Tab from Subcategory reaches Topic tag. Search jump focuses the actual search input.
- Legacy `?pillar=MICE%20%26%20Event%20Operations` returns its six original items.
- Landscape 844×390 shows no horizontal document overflow.
- No browser error-level logs observed during the final library inspection.

Screenshots: `knowledge-hub-desktop.png` and `knowledge-hub-mobile.png`. These are visual evidence from the local implementation, not production screenshots. The all-page browser loop checks rendered DOM geometry/structure; it is not a claim of manual pixel-by-pixel review of every article section.

## Failures found and resolved

- Changing visible tags initially changed the expected historical related-reading selection. Legacy tags/titles now preserve those embedded modules; body-preservation tests pass.
- The reduced catalogue-refresh fixture lacked article files and assets required by validation. It now includes those dependencies and tests the five generated categories.
- Six standalone guides initially inherited series membership from artwork. Membership now follows manifest kind and installment evidence; the Amsterdam filter correctly contains 13 items, not 14.
- New filter status labels and the fixture's metadata fields were updated to test the intended behavior, while retaining prior query/keyboard assertions.
- An apparent Amsterdam price discrepancy was investigated and resolved by reading the documented ex-VAT commission basis. No content correction was made.
- The first baseline run overlapped local metadata edits; it is not used as baseline evidence. The separate frozen snapshot passed all groups.

Final automated failures: **none**.

## Limits and pending checks

- No physical iOS/Android hardware, screen reader, native browser zoom, external structured-data validator, Lighthouse score or field performance measurement was performed in this pass.
- Browser widths test responsiveness; they are not a full WCAG certification or proof that every possible device state is flawless.
- External factual verification is selective and documented in `fact-check-report.md`. The full screened queue remains available for source-by-source editorial review. A KEEP recommendation is not a factual certification.
- No authenticated analytics, Search Console or Bing data was accessed.
- No remote push, merge, deployment or production infrastructure change was performed. Private drafts remain outside the public registry and sitemap.
