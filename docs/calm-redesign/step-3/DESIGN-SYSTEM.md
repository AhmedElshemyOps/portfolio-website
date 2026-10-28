# Step 3 — calm shared design system

Prepared 28 October 2026. This is an isolated design-system specimen, not a new live homepage or a site-wide rollout. Step 4 will apply it to four real page previews.

## Design principle
Lead with Travel & Tourism Operations and practical experience. Use clear hierarchy and comfortable reading space. Tourism product support and MICE/event coordination remain related directions; AI and quality methods support the career story. Avoid oversized banners, repeated badges, decorative ribbons, heavy shadows, excessive dark panels, gradients throughout the body, automatic carousels or new animation libraries.

The existing footer is retained exactly, including its markup, stylesheet, brand identity, links and responsive behavior. It is outside the `.calm-system` styling scope. The preview copies the published homepage footer; it does not create a replacement production footer template.

## Foundation
| Purpose | Value | Use |
|---|---|---|
| Navy | `#0c1b25` | Primary action backgrounds, deep emphasis |
| Ink | `#182b34` | Main text and headings |
| Muted | `#52616a` | Secondary descriptions and metadata |
| Ivory | `#fcfaf5` | Main page background |
| Warm surface | `#f3efe7` | Limited explanatory panels and references |
| Gold text | `#795b20` | Readable links and short labels on light surfaces |
| Gold line | `#c79a43` | Decorative rules and accents |
| Gold on dark | `#e8c341` | Retained footer accent; not body text on ivory |
| Decorative line | `#ded5c5` | Quiet section/card borders |
| Control boundary | `#68727a` | Controls that need a stronger visible edge |

Reuse locally hosted **Lora** for headings and **IBM Plex Sans** for reading/UI. No new font service or dependency is introduced. Body text: 17px; article specimen: 19px desktop, 18px narrow mobile with generous line height. H1: fluid 34–52px; H2: 26–34px. Preserve reading controls so readers can choose larger text in real article previews.

Spacing follows 8 / 16 / 24 / 32 / 48 / 64px. Container: 1,120px maximum; reading column: 720px maximum. Mobile gutter: 20px. Main section spacing: 64px desktop, 48px narrower layouts. Standard body-component corners: 4px, with minimal shadow. The retained footer keeps its own existing rounded treatment.

## Reusable component rules
- Header: readable name/identity, clear navigation and a restrained CV action. Proposed labels: Home, Profile & Experience, Projects, Knowledge, CV. Preserve current destinations; labels do not imply new URL paths. Search/contact remain easy to reach.
- Mobile navigation: native accessible disclosure in this specimen. When applying the real header in Step 4, keep existing search/menu behavior and keyboard support; do not remove working functionality to match a static mockup.
- Buttons: 48px minimum height. One primary action per local decision area, a bordered secondary action and simple underlined text links for lower-priority destinations. Visible keyboard focus; no whole-card click traps.
- Experience: employer, location, period and department/function first; readable contribution bullets. Do not invent official management/product titles or repeatedly lead with guiding.
- Projects: problem, contribution, inspectable work and an explicit status. Keep prototypes, research and workplace work distinguished. No invented client adoption, savings or production outcomes.
- Knowledge: restrained titles, useful descriptions and a clear path to the full library. Reduce competition from surrounding panels; do not delete article content to shorten the page.
- Article reading: original wording, punctuation/order, references, complete prompts, media and heading targets remain protected. Keep the top glossary, existing sources panel and working prompt/video interactions; Step 4 reviews how the shared frame fits them.
- References/callouts: quiet warm surfaces, a modest rule, clear links and complete evidence notes. Do not collapse important limitations behind decorative interactions.
- Footer: use the current shared component unchanged. Do not apply `.calm-system` classes or broad new global selectors to it.

## Responsive and accessibility requirements
The specimen shifts grids according to available width; at 850px it uses a native mobile menu and a single-column hero, with cards reducing further on narrow screens. These are component-specific thresholds, not a replacement for every existing application breakpoint.

Use semantic landmarks/headings and a skip link, native links and disclosures, visible focus, readable link contrast and reduced-motion rules. Every action must retain an understandable accessible name. Keep content usable at narrow widths and enlarged text. No new automatic motion is introduced. A forced-colors rule is supplied; real assistive-technology/device testing remains part of Step 6.

## Implementation boundaries
`calm-system.css` is the canonical preview stylesheet; `tokens.json` is a descriptive export of its reviewed foundation values, not a second production theme. `preview.html` is under `docs/` and marked noindex. It loads existing self-hosted fonts and the unchanged footer stylesheet. It is not wired into the live templates or article renderer.

Keep the Step 1 preservation checker alongside existing release tests. Do not regenerate the baseline, replace protected public CV files, alter article source data or change shared routes while implementing this design. A later approved CV replacement must be handled as a deliberate, documented exception, not a baseline reset.

## Validation completed
- Preview checked at 320, 390, 768 and 1440px: no horizontal overflow, one H1, one footer; primary controls measured 48px high; reading measure capped at 720px.
- Mobile menu opened/closed; terms disclosure toggled with Enter.
- Tested contrast ratios: main text 14.04:1; secondary text 6.14:1; gold links on ivory 6.05:1 and warm surface 5.50:1; primary action 16.79:1; footer gold/navy 10.27:1; control edge 4.71:1.
- Copied footer markup matches the current homepage footer exactly. Original footer/template/style files remain unchanged.
- All protected pages, articles, anchors and downloads still pass the Step 1 comparison. No production deployment occurred.

## Next
Step 4: create actual previews for the homepage, profile/experience, one project and one article. Use the reviewed Step 2 content and this single design system; preserve the footer and content/URL contracts. Ahmed reviews those four responsive page previews before the site-wide application in Step 5.
