# Mobile article review

Scope: 130 editorial pages and 377 prompt copy controls. This report records source and simulated interaction checks, not rendered browser or physical-device testing.

| Area | Findings and repairs | Verification |
| --- | --- | --- |
| Long titles | Added safe wrapping to page/section titles and metadata; retained user zoom. | HTML/CSS audit. Rendered overflow at phone/tablet sizes is pending. |
| Contents | Added Show/Hide labels and 44px summary targets. Mobile deep links expand the relevant subgroup while keeping the overall contents collapsed. | Production initialization tested with simulated media widths 320, 375, 390, 600, 768, 820, 900, 901 and 1024px. Actual touch and focus behaviour is pending. |
| Tables | All 170 tables retain focusable, labelled horizontal-scroll regions. Larger reading text also scales table text. | Structural checks and unchanged data. Actual scrolling, overflow and screen-reader announcements are pending. |
| Prompts | Added missing live feedback and status roles to all 377 controls. Blocked copying focuses the enclosing readable prompt. Copy targets and original text remain intact. | Clipboard success, fallback, missing/empty content and blocked-copy handling tested through DOM simulation. OS clipboard/paste on iOS/Android is pending. |
| Preferences | Added controls to 36 pages and moved all 130 sets above the article. Added accessible font-control labels and 44px touch targets. Fixed invalid saved preferences and dark/high-contrast link colours. Scaled prompt and component text with reader size. | Storage, blocked storage, font limits/reset and theme/contrast toggle persistence tested through production initialization. Actual rendering and cross-page interaction are pending. |
| Endings and links | Maintained article checklists, one next action, method links and prompt guidance. | Existing editorial regression tests. |

## Browser checks still required

At 320×568, 375×812, 390×844, 768×1024, 820×1180 and 1024×768, check a long-title article, a dense table article and a ten-prompt toolkit. Confirm no page-wide horizontal overflow; intentional table and diagram regions should scroll independently. Test contents open/close, subgroup expansion and a direct prompt link. Paste a copied full prompt into another application. Test maximum reading text, dark reading and high contrast together; reload and navigate to another article to check preferences. Test keyboard focus and browser text zoom.

## Infrastructure boundary

The managed Sites preview instructions require the `control-browser` skill before cloud-browser testing and state: “If it is unavailable, do not improvise another browser-control path.” That skill is unavailable in this session. The static site also has no compatible managed development server. No cloud-browser navigation, screenshots, simulated screenshots or real-device claims were made. These limitations do not establish that the rendered mobile experience passes.
