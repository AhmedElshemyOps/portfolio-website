# Project summaries and reader routes

Ahmed selected improvements 2 and 3: scan-friendly project pages and three clear reader starting points. This branch implements those choices without a new visual system, article edits, route migrations, extra dependencies or new public pages.

## Project openings
All four existing case studies now open with Problem, My contribution, Outputs, and Evidence and scope. The problem and contribution copy comes from the existing case studies; the evidence link opens the existing demo. A visible scope statement identifies the demonstration and avoids implying production results. The output link points to the existing preview, with a new additive anchor. The repeated contribution paragraph was removed from the visible preview; the full research, original output images, Netherlands evidence, demos and deeper project methods remain available.

Update content/projects.json for the four-fact copy and existing destination links. scripts/render_project_summaries.py is the shared renderer. No article wording or existing anchor is replaced.

## Reader routes
content/reader-starts.json defines exactly three choices:
- Tourism Operations uses the existing seven-article operations path.
- MICE & Events uses the existing five-article MICE path.
- Tourism Product Support opens the existing twelve-article Amsterdam product-discovery case.

The homepage presents compact links instead of eight competing topic chips. The Knowledge Hub presents three cards, with the full topic and series browser in one native disclosure. The full article search, filters, categories, article cards, video entry and URLs remain available. The Learning Paths overview uses the same three cards and retains commercial quotation, AI and quality/SOP specialist paths below. Every original learning path still exists, with its original progress key and article sequence. The collection metadata lists six destinations accurately.

scripts/render_reader_starts.py derives article counts from the original path/registry data. scripts/knowledge_taxonomy.py updates editorial-series content in place, retaining its parent disclosure. assets/css/portfolio-discovery.css reuses the calm palette and typography and loads only on the seven affected pages. No additional JavaScript is required. The prepared offline-cache version changes only when this release is later published.

## Review and validation
Use the local preview on port 4185. Review the InfraQuote opening, Knowledge Hub, Learning Paths overview and homepage Knowledge Library section on desktop and mobile. The full renderer remains idempotent. Existing content preservation, local-link, cleanup, application and navigation checks remain mandatory; five focused regression tests cover the new summaries, routes, specialist destinations, disclosure/search structure and rendering stability. Screenshots and current results are in the chat output report.

This is a feature-branch review. Earlier publication approval applied to the CV release. Do not merge or deploy this enhancement branch until Ahmed approves its concrete preview.
