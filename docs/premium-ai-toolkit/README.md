# Premium AI Prompt Toolkit and top glossary

## Architecture and scope
The website is `portfolio-website`: static HTML, Python shared rendering, content-hashed CSS bundles and dependency-free browser JavaScript. The separately named `tourism-ai-operations-playbook` repository supplies educational source material; it is not the website rendering project. The existing Lora/IBM Plex typography, shared navigation, article structure, reader theme, consent-gated analytics, structured data and routes are retained.

All 130 article glossaries now appear after the introductory header/evidence note and before the article body. Existing 107 glossaries retain their definitions. The 23 previously missing glossaries reuse definitions already present in the site for abbreviations actually used in those articles. They remain collapsed, keyboard-accessible details panels.

385 existing AI prompts in 47 articles receive the reusable `PremiumAIPromptToolkit` enhancement in their existing teaching sections. Eight previously unenhanced copy-ready templates in Amsterdam discovery articles 03–05 are included. Quotation examples and other non-prompt preformatted content are excluded. Original pre/code source blocks remain byte-for-byte intact; prompts are not moved to article endings or duplicated in a separate database.

## Data and rendering
- `content/editorial/ai-prompt-toolkits.json`: stable prompt ID, article/section IDs, title, description, category, version, source SHA256, placement rationale and up to three exact, unique variable placeholders. Source text remains in the article. 356 prompts support optional customization; repeated or ambiguous placeholders are not exposed as controls.
- `content/editorial/article-glossary-additions.json`: provenance for the 23 added glossaries.
- `scripts/render_premium_ai_toolkit.py`: matches approved source digests, adds semantic toolkit UI and fails if the approved source changes unexpectedly.
- `scripts/render_article_glossaries.py`: moves existing glossary HTML or adds reviewed definitions before article text.
- `scripts/render_reader_enhancements.py`: integrates both into the permanent shared rendering pipeline.
- `assets/js/article-prompts.js`: reusable exported core plus guarded DOM mount; replaces legacy copy handling.
- `assets/css/premium-ai-toolkit.css` and `article-glossary.css`: scoped responsive presentation; no added dependencies.
- `scripts/simplify_article_toc.py`: omits toolkit helper headings from the article outline.
- `scripts/validate_prompt_content.py`: validates original pre/code targets and dedicated wrappers for the eight preserved sources.
- `scripts/sync_hotel_prompts.py`: excludes generated interface labels from source reading-time calculation.
- `sw.js`: new cache version for the changed shared behavior.
- Rendered article HTML and generated bundles are committed outputs of this pipeline.

## Interaction and accessibility
The complete prompt remains readable without JavaScript. Scripted buttons activate only when initialization succeeds. Copy preserves full plain text and line breaks; the Clipboard API has a tested legacy fallback and reports failures accurately. Optional customization is off by default, validates required inputs when enabled, and changes only declared unique placeholders in a single pass. Controls use explicit labels, native select/textarea elements, focus states, 44px-or-larger touch targets, reduced-motion and forced-colors rules. Preview content uses textContent and an accessible region; short status feedback uses a polite live region. Reset restores the original and clears inputs.

Share uses native Web Share where available, otherwise copies the stable original article/prompt anchor. Cancellation is not counted as success. Shared URLs contain neither customization values nor query strings. A recipient receives the original template in its educational context.

Open in ChatGPT copies the resolved prompt and opens `https://chatgpt.com/`; the reader pastes it. No automatic insertion or sending is claimed. A direct safe link remains available if a popup is blocked. Current official web documentation was checked: https://learn.chatgpt.com/docs/web . No documented reliable cross-browser prompt-prefill contract was established, so undocumented URL parameters are not used. No API key, external AI SDK, API endpoint or paid service is introduced.

## Privacy and analytics
Reader inputs stay in page memory. They are not written to storage, URLs, telemetry or a server. Native sharing receives only the title and original public deep link. The existing consent-controlled `AhmedAnalytics.event` adapter receives only allowlisted static prompt/category/article/version identifiers and interaction types.

Events: `ai_prompt_view` after 35% visibility for 750ms once per mounted card; `ai_prompt_copy` after successful copying; `ai_prompt_share` after native completion or successful fallback link copy; `ai_prompt_chatgpt_open` after a launch attempt following successful copying; `ai_prompt_customize` after input changes; `ai_prompt_reset` after reset. View deduplication, cancelled sharing and busy-action guards are tested. No prompt text, entered values, clipboard contents or personal fields enter events.

## Maintenance
For a new prompt, write/review the actual source in the relevant article section first. Add a manifest row pointing to its stable target ID and SHA256 of decoded, trimmed preformatted text. Keep IDs stable; increment version and update the digest deliberately after an editorial source change. Choose only exact placeholders occurring once, maximum three meaningful controls. Never use generic repeated placeholders. Match title/description and placement reason to the surrounding section. The renderer refuses a missing digest instead of guessing another source. Run shared rendering, prune obsolete generated styles, then the health checks. The integration tests verify all 130 glossaries and the 385-source inventory. Adjust explicit inventory totals only with reviewed content additions.

No production merge or deployment is part of this change. See the accompanying delivery report for actual validation outcomes and browser screenshots. Native share UI, real mobile devices and assistive-technology sessions still require human device testing; automated and browser-emulated checks cannot certify those environments.

## Verified results (2026-10-27)
`PORTFOLIO_PYTHON=<bundled Python> node scripts/check_health.mjs`: **25/25 groups passed**, including 120 Python tests, 19 JavaScript test groups, pinned prompt comparison, shared-render consistency, whole-site cleanup coverage, local links/fragments and article navigation. The link audit found no missing references, broken local destinations or duplicate IDs across 178 public pages. Navigation validation covered 180 HTML files and 4,286 TOC links. Browser checks covered all 130 articles at 390px and all 47 toolkit articles at 1440px, with representative 320px and 768px layouts. No horizontal overflow or toolkit initialization failure was found. External destinations retain the prior audit limitations; this change does not claim a fresh successful response from every external service.
