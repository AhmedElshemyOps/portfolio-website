# Field Manual pilot QA

final result: passed

Scope: desktop pilot visual and article interactions. No production rollout.

Source visual truth: /workspace/scratch/47cb44b52ac2/generated_images/exec-4c668341-8db9-4bff-9412-040fdd2cd112.png (1374×1145px).
Implementation screenshot: docs/design-evidence/article-option3-final.jpg (1348×926px). Browser CSS viewport1363×936; screenshot excludes scrollbar/browser margin. Source proportionally rescaled to screenshot width and cropped to matching visible height; no stretching. Full-view comparison: docs/design-evidence/article-option3-comparison.jpg. State: article start, light theme, contents first group open. Optional resume chip shown from interaction history; absent for first-time readers.

## Comparison history

Initial review: P1 navy header inherited1000px max-width, P2 reading controls and legacy heading padding pushed content down, P2 duplicate footer. Fixed max-width, relocated controls/glossary below reading body, removed legacy heading padding/top borders, removed duplicate footer. Post-fix screenshot and combined comparison show full-width navy band, aligned readable column and right contents rail. No actionable P0/P1/P2 remains in the inspected desktop state.

## Required surfaces

- Typography: existing locally hosted Lora600 and IBM Plex Sans; title44px at desktop, sections32px, body18px/1.75. Title retains intended two-line hierarchy. Exact original text takes precedence over mock-generated prose.
- Layout: 1200px maximum frame, right290px sticky rail,52px gap, navy title band. Prompt block is full-width in reading column. No horizontal overflow at tested viewport.
- Colors: existing navy/paper/gold tokens retained; muted text and gold accents on paper; white title on navy. Solid band follows existing system rather than generated image shading.
- Assets: existing AM brand retained. Decorative article hero omitted; original educational diagrams retained below introductory sections. No new raster assets needed for the selected text-first design.
- Copy: exact title/standfirst retained. All10 sample preformatted prompt texts compared to base and unchanged. Real22 contents destinations replace mock's invented13section outline; all anchors resolve. This is an intentional content-fidelity difference.

## Functional checks

- Opened local browser implementation, inspected screenshot and DOM.
- Expanded contents group07–12; SOP Creation link navigated to#sop-creation.
- Copy action displayed Prompt copied and complete-prompt success message. Browser clipboard bridge returned empty, so end-to-end clipboard bytes could not be independently verified through that bridge; original tested copy implementation retained.
- Python validator passed all377article copy targets.
- All10sample prompt bodies unchanged after HTML decoding.
- No website console errors in checked log; cloud Chrome extension emitted unrelated metadata errors.

## Residual gaps

Actual phone/tablet screenshots and keyboard walkthrough are still required before site-wide rollout. Responsive CSS collapses contents below900px and stacks the reading surface; browser exposes no documented viewport resize control here. Search, bookmark, preferences and newsletter preserve existing scripts but have not had complete end-to-end verification in this pilot.

## Follow-up polish

P3: compare additional long prompt and table states at actual mobile viewports before batching migration. Integrate opt-in contract into original article generator to prevent regeneration overwriting the pilot.
