# B. Phase 02 architecture blueprint

## Design and information architecture

Use the existing GitHub Pages static HTML site with Python 3.12 and Node.js 22, and the repository's current authoring and validation tools. Extend the current templates and source-of-truth metadata. Use the Field Atlas pilot to specify design tokens, editorial typography, original SVG diagrams and lightweight navigation. Preserve exact public routes and canonical ownership. Keep the authoritative V3.0 ten-category names and series in [Section H](MASTER_PLAN.md#h-article-taxonomy-and-series), and produce an article-level crosswalk at the applicable approval step. Preserve the current five-category registry until that crosswalk and migration are approved. Model journeys as ordered references with independent labels and entry points on the current Knowledge Hub.

Primary navigation would connect homepage, Knowledge Garden, projects and For Employers. Proposed For Employers entry uses the existing recruiter summary and links to the profile and CV. Keep the employer route visible above decorative content. Review exact naming and placement at Gate 2. Use source CV, profile, career-route and evidence-ledger records to distinguish job title, responsibilities, published methods, prototypes and proven outcomes. The case study shell may change under the approved plan. Project inputs, calculations, export behavior, browser-local state, and existing demo URLs are separately protected.

## Source and render boundaries

| Concern | Authoritative source | Proposed consumer behavior |
| --- | --- | --- |
| Published article body and anchors | Canonical existing HTML | Preserve original article-body byte spans and independently verify wording, structure, anchor IDs and link targets. Where markup does not have a safe boundary, report and block that route pending review. |
| Article title, dates, classification, series | Article registry, taxonomy and series manifests | Existing catalogue owns generated library and search consumers. Review assignments before migrating, retain series numbering and current routes. |
| Reviewed SEO and social | Discovery metadata, social preview map and approved existing head/assets | Preserve canonicals, approved metadata and custom cards. Head-only changes require a reviewed diff. |
| Relationships and journeys | Proposed reviewed sidecar records referencing registry IDs or stable source keys | Generate read-only article navigation, backlinks, journey steps, graph subset and search facets outside protected bodies. |
| Profile, CV and projects | Current profile, career-route, project and evidence-ledger sources plus approved public CV | Render relevant evidence and direct links. No unsupported managerial titles or outcomes. |
| Video | YouTube inventory and reviewed article matches | Keep existing IDs, anchors and placement contract. Proposed matches are queued for owner approval. |

Existing documentation defines catalogue refresh ownership and publication ordering. Use [publishing integrity](../authoring/publishing-integrity.md) and [search release integrity](../authoring/search-release-integrity.md) as the current process baseline. Routine generation should avoid historical editorial mutation scripts. Share design primitives with existing header/footer and CSS bundle tooling. Render basic categories, journeys and related links in HTML. Enhance map exploration and filtering with lightweight JS and avoid graph libraries or a required service backend. Generate a small index with summaries, canonical routes and controlled tags, split by section if measurements justify it.

## Future article flow

1. Prepare finished text outside the public repository. Choose a stable slug, real dates, one approved category/subcategory, controlled tags and existing approved series/number. Add evidenced related nodes, accessibility-reviewed media, reviewed SEO description and sharing artwork. The current publisher requires a registered series and next consecutive number. Any new series or optional-series policy is a separate editorial decision.
2. Run the existing managed preview in a disposable checkout. The planned shared reader adds breadcrumbs, series labels, contents, progress, responsive media/tables, share actions and attribution. Relationship-derived navigation appears outside the teaching body. Apply the same renderer to an unpublished representative fixture. Keep draft pages and metadata out of public search, sitemap and feeds.
3. Validate publication metadata and paths, confirm exact author text and anchors, review relationship evidence and preview social cards. Verify mobile and keyboard navigation, no unexpected third-party requests, and appropriate ad eligibility. Optional video placement requires an approved existing inventory ID or separate approval and a relevant accessible placement.
4. After editorial approval, run the managed publisher locally to create the canonical HTML and registry entry. Refresh derived catalogues, graph/backlinks, search, affected series counts, sitemap and Atom feed as one reviewable transaction. Produce Article/BreadcrumbList metadata from verified values and match the sharing target to the canonical. Fail closed and roll back affected outputs on validation errors.
5. Run preservation and release checks, inspect the full diff, obtain applicable release authorization and verify the live deployment separately. Article updates follow managed publisher restrictions. Keep historical aliases and their existing synchronization rules.

## Scope retained for later phases

SEO/GEO: preserve canonical ownership, verified authorship, accurate structured data, crawlability, topic/series discovery, internal links and organic discovery evidence. No ranking or citation guarantees. Measurement: design a consent-aware event contract for map, journey, search, project, CV, contact and share actions without raw queries or personal identifiers. GSC technical verification and account-side observations are separate. Ads: plan eligible educational slots with reserved geometry and accessibility checks, employer/CV/project areas excluded by default. No activation authorized. ITIL 4: decision log, risk register, ownership, batch change controls, release/rollback evidence and continual improvement. All V3.0 phases and gates apply in order.
