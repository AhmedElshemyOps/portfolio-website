# Shared article ending

The article finish replaces competing recommendation systems on all 130 pages under `articles/`. Three series landing pages outside that directory keep their landing-page navigation.

## Editorial order

1. Existing four-point practical checklist and one approved next action, retained from `content/editorial/article-endings.json`.
2. At most three useful cards: relevant interactive tools, resources and demos first.
3. One native disclosure for additional reading. Each destination appears once across the practical ending and shared finish.
4. One library return link, existing learning-path completion control, concise subject link and glossary.
5. Preserved professional verification reminders, feedback, sharing and privacy controls.

`content/editorial/article-followups.json` preserves the unique approved links and completion metadata from the retired components. It is build input, not a browser payload. Registry relations and current series order remain dynamic, so new publications and series additions receive the shared finish automatically. Future editorial changes should update these structured sources, then run `python3 scripts/render_shared.py`.

`render_reader_enhancements.py` invokes `render_article_finish.py` through the existing shared rendering and article publishing pipeline. `link_article_library.py` and `render_series_banners.py` avoid recreating retired panels. Repeated rendering is tested. Historical fragment IDs remain as zero-height targets; original teaching prose, tables, copyable prompts, visuals, canonical URLs and structured data remain protected by the existing preservation tests.

The implementation uses semantic HTML, native disclosures and scoped CSS. It adds no JavaScript or dependency. Existing reader scripts continue to own feedback, sharing, saved progress and consent-aware analytics. Phone, tablet, desktop, dark reading, reduced motion and print receive explicit treatments.

## Five further improvements identified

These are recommendations for a separate change, not additional alterations in this branch.

1. **Simplify article openings.** The MICE article displays reading duration in the heading metadata, scenario panel and an additional reading-time card. Use one compact metadata row and one short purpose statement before the article.
2. **Make diagrams consistent.** Some families use a large horizontally scrolling diagram with several explanatory caption lines while others use the newer viewer controls. Standardize their viewer, readable caption and mobile zoom behavior while preserving the original diagrams.
3. **Reduce the newsletter interruption.** The working article newsletter currently occupies a full-width dark band after the feedback area. Offer a smaller optional signup panel at this point and retain the full version on the newsletter page.
4. **Unify site terminology.** Navigation and older article families mix Knowledge Hub, Knowledge Library and Insights. Use “Knowledge Hub” consistently for the same destination and reserve distinct terms for genuinely different content types.
5. **Retire superseded CSS in stages.** Article styles retain earlier black/red, rounded-card and footer treatments alongside the current navy/gold overrides. Remove selectors for retired components, then consolidate shared tokens with visual regression checks to reduce stylesheet weight and future conflicts.

## Validation

- 22/22 release check groups passed, including 112 Python tests and all JavaScript checks.
- All 178 HTML pages have valid local routes/fragments and no duplicate IDs.
- Article navigation: 180 pages and 4,297 contents links pass.
- All 174 article tables and 338 teaching figures remain present; prompt and source preservation tests pass.
- Visual checks: 320px, 390px, 768px and 1440px widths; no horizontal overflow in the reviewed endings. Dark reading, feedback, copy URL and expandable reading controls were checked in the browser.
- Desktop/mobile screenshots and the full validation log are supplied with the chat preview.
