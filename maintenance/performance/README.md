# Mobile reading — 30 October 2026

The shared table controls are styled by `assets/css/article-tables.css`, attached and bundled by `render_shared.py` only when a page contains tables and the table-control script. The older article stylesheet is not a dependency of the current editorial templates. Keep runtime dialog styles in this component: the dialog is created outside the article body.

`article-tables.js` creates one viewer on the first request and reuses it. The original table remains the CSV source. The viewer has a keyboard-focusable scroll region, a separate fixed header/control area, 44px controls, native Escape dismissal and focus return. Cloned ID references are namespaced so the original table remains valid. Captions and cell text are preserved.

The regular Lora font had a `.woff2` name and WOFF2 CSS descriptor but contained a 132,188-byte TrueType file. It was losslessly re-encoded to genuine WOFF2 (46,852 bytes) at the same asset URL. All 888 glyph outlines, 778 character mappings, advances and layout tables were compared before/after. No subsetting or font substitution was performed. `lora-compression.json` records the encoding verification and tool versions. FontTools/Brotli were isolated conversion tools; no runtime or repository dependency was added.

The approved footer, existing article words, anchor hrefs, IDs, canonical URLs, publishing dates and downloads are unchanged. Render shared pages, synchronize historical copies and prune only unreferenced content-hashed bundles using the existing scripts. Run `check:health` before release. Screenshots and browser checks are separate evidence from automated accessibility scores; neither establishes complete accessibility compliance or real-user performance.
