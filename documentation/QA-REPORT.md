# QA Report

**Overall status:** PASS  
**Final recheck completed:** 2026-07-10

## Content checks

- Series hub: 1 complete landing page with 10 article cards.
- Complete Playbook articles: 10.
- Prompt cards: 100.
- Copy Prompt controls: 100.
- Article visible-word range: approximately 4,143–4,360 words using the final parser count, excluding markup.
- Original Playbook SVG visuals: 11.
- Social-preview PNG images: 11, each 1200 × 630.

## Full-site static checks

- HTML files checked: 53.
- Local HTML/CSS asset references checked: 2,252.
- Missing local files: 0.
- Missing internal anchors: 0.
- Duplicate HTML IDs: 0.
- Invalid JSON-LD blocks: 0.
- External `target="_blank"` links missing `noopener noreferrer`: 0.
- Invalid sitemap XML: 0.
- Invalid article-index JSON: 0.
- Missing Playbook sitemap entries: 0.
- Homepage and article-page Playbook integration failures: 0.

## JavaScript and functionality

- JavaScript files syntax-checked: 19.
- Playbook Copy Prompt targets matched: 100 of 100.
- Mobile menu opened successfully.
- `aria-expanded` changed correctly when the menu opened and closed.
- Escape-key menu closing worked and returned focus to the menu button.
- Copy controls returned copied-success or manual-copy fallback feedback.
- Reading progress and table-of-contents highlighting loaded without page errors.

## Browser rendering checks

Headless Chromium rendering was performed with the Playbook CSS, JavaScript and local images embedded into the test pages because the execution environment blocks browser navigation by managed policy.

- All 11 new pages rendered at 1440 × 1000.
- All new pages contained exactly one H1.
- Each article contained 10 prompt cards and 10 copy controls.
- Desktop horizontal overflow: none.
- Mobile article rendered at 390 × 844.
- Mobile horizontal overflow: none.
- Console errors during the rendering test: 0.
- JavaScript page errors during the rendering test: 0.

## Legacy-site repairs verified

- Repaired outdated links to `index.html#projects`.
- Repaired outdated links to `index.html#contact`.
- Repaired outdated links to `articles.html#operation-quality`.
- Corrected malformed JSON-LD on `article-tourism-operations-roles-real-difference.html`.
- Replaced the Cloudflare-dependent CV email link with a standard `mailto:` link.
- Added complete external-link security attributes.
- Added a non-JavaScript fallback URL for the InfraDispatch Google Maps control.

## Hosting note

The website remains static and requires no build process. Upload the contents of the final ZIP to the hosting document root while preserving the folder structure. After deployment, verify server-specific redirects, MIME types, analytics and any hosted form delivery.

## July 2026 — Refinement QA

- Tour Guide Quality Index Field Story modules found: 10
- Field Story takeaway sections found: 10
- Main Insights AI Playbook article cards found: 10
- Legacy Insights AI Playbook article cards found: 10
- New enhancement stylesheets found and linked: 2
- Desktop isolated visual rendering: passed
- Mobile isolated visual rendering: passed
- Horizontal overflow in tested desktop/mobile components: none
- Local file and anchor validation across all HTML pages: passed
- Duplicate HTML IDs: none
- JavaScript syntax validation: passed
