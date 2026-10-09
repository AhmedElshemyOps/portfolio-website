# Shared website maintenance

Public page paths and article bodies are preserved. Pages are published as
static HTML, so navigation and contact links remain available without JavaScript.

## Editing shared components

- `templates/header.html` and `templates/footer.html`: supporting-page components.
- The homepage uses the same header/footer templates as every supporting page.
- `assets/css/site-chrome.css`: shared navigation, mobile menu and supporting-page footer.
- `assets/js/site-navigation.js`: menu enhancement and keyboard/focus behaviour.
- `assets/css/design-tokens.css`: supporting-page colours, spacing and type variables.
- `assets/css/fonts.css`: locally hosted font declarations.
- `assets/css/homepage-editorial.css`: the selected homepage layout and its colour overrides.

After editing a template, run `python3 scripts/render_shared.py`. Generated pages
stay committed to the repository; GitHub Pages does not execute the renderer.
Run `python3 scripts/render_shared.py --check` to find template drift without
writing files. `npm run render:shared` and `npm run check` provide shortcuts.

The renderer updates existing shared elements only. It preserves article bodies,
canonical URLs, homepage fragments and demo application controls. Active navigation
links derive from the existing page path. The catalogue synchroniser and contact
updater both use this renderer instead of maintaining separate component copies.

## Contacts

Edit `content/site-contact.json`, then run `python3 scripts/update_site_contact.py`.
The updater applies public email and telephone fields. Availability metadata is
not inserted into pages. It does not rewrite archived compiled bundles.

## Validation

Run these checks before publishing:

```
python3 scripts/render_shared.py --check
python3 scripts/validate_site_links.py
python3 maintenance/validate-navigation.py
python3 -m unittest discover -s tests -p 'test_shared_components.py'
```

The existing GitHub workflow continues to validate prompt content. Shared-component
and link checks are available through the commands above. Browser checks should cover the homepage,
an article, the knowledge filters and a project at desktop, tablet and phone sizes.
Check menu opening, Escape, search focus restoration and footer contact actions.

## Dependency decisions

Removed `home-refinements.css` after checking HTML, CSS imports, JavaScript,
catalogue data and maintenance scripts: no references remained. Removed obsolete
homepage/availability style rules and duplicate font declarations. Retained
`lab-formulas.js`, which is dynamically imported by `lab-tools.js`.

On 9 October 2026, removed `profile-evidence.css` after checking all 178 public
HTML pages, CSS imports, JavaScript, catalogue/build JSON, templates and maintenance
scripts: no reference remained. The active career and credentials styles already
live in `homepage-editorial.css`. This removes an unused second source; it does
not claim a current-page download saving.

The Amsterdam research index contained 13 identical reader stylesheet/script
pairs. Shared rendering now retains the first identical reader asset tag and
removes repeated entries, preserving asset order and page content. Keep one pair
on the Resources, Visuals and Amsterdam index pages; the current Field Manual
article template intentionally does not load the legacy reader-experience assets.

The common demo theme owns the keyboard focus indicator: a dark gold outline
and light halo remain visible on light forms and navy panels. Its focused-state
priority overrides legacy decorative/input shadows, with a system Highlight
outline in forced-colour mode.

`site-navigation.css` and `growth-navigation.css` remain compatibility imports
for previously published pages. Current generated pages use `site-chrome.css`
directly. Old hashed application bundles and their assets remain available for
cached or historical clients; they are not loaded by the current homepage.

Shared asset revision strings and the service-worker cache version were advanced
for this release so returning visitors can receive the refreshed files.

## Professional profile and page design

`content/professional-profile.json` records career, qualification evidence and date reconciliation. Run `python3 scripts/render_profile.py` after editing it, then render shared components. `scripts/build_public_cv.py` consumes the same record; render the DOCX and visually verify both pages before replacing the public PDF. Use the bundled document runtime.

`portfolio-pages.css` supplies the supporting-page layout, and `project-demo-theme.css` supplies the common demo palette. Existing app logic and semantic safety colours remain intact.

The homepage article browser reads its inline JSON list, showing four original article URLs per click. Keep its curated first group and include every registry Article exactly once. Display labels may change; the legacy hotel-topic filter value and existing URLs stay fixed. `discovery.js` recognises both labels.

Navigations and CV documents use network-first service-worker caching with offline fallback; assets use stale-while-revalidate. Increment the cache version when releasing shared assets.

## Repeatable whole-site health check

Install the locked development dependency with `pnpm install --frozen-lockfile --ignore-scripts`, then run `pnpm check:health` (or `node scripts/check_health.mjs`). Node.js and Python 3 are required. `PORTFOLIO_PYTHON` can select a Python executable. The runner executes Python tests, every JavaScript test file, pinned-prompt validation, shared rendering checks, local links and article navigation sequentially. It returns failure if any group fails, including the backend test when its dependency is absent.

`pnpm-lock.yaml` pins the test database package; `node_modules/` is ignored and must not be committed. The Postgres test uses a local embedded database; passing it does not mean a hosted backend has been provisioned or penetration-tested. Browser and real-device checks remain separate from the command. Private editorial drafts belong outside this repository and are not part of publication.

## Second usability release, 9 October 2026

- Shared tokens now control section spacing, card padding, grid gaps and action height in the homepage, supporting pages and demo theme. Source rules consume tokens rather than adding another overriding stylesheet.
- Consolidated superseded mobile banner rules and duplicate InfraQuote sidebar declarations; removed unnecessary priority flags from review colours and mobile spacing. Print/hidden-state/focus priorities remain intentional.
- Rechecked `growth-navigation.css` and `site-navigation.css` across HTML, CSS imports, JavaScript, JSON, scripts and templates: no active consumer. Both tiny wrappers remain intentionally available for historical/cached pages, as documented above. They are compatibility endpoints, not a current-page performance cost.
- Active CSS/JS references receive content revisions during shared rendering. The worker uses network-first revalidation with a five-second offline fallback. Cache limits: 40 pages (14 days), 48 images and 64 assets (30 days), 8 documents (7 days); individual responses over 4 MiB are excluded. Writes are awaited, expired entries pruned and oldest entries evicted. Only this site's old cache namespace is removed. Local quotation drafts are untouched.
- `scripts/article_series.py` validates public series/order before publication. The approved manifest drives banner artwork, labels, numbering and reading paths. Private drafts are excluded.
- Performance/accessibility measurements and their limits are recorded in the local phase-two delivery report. Physical-device and real-user measurements must not be inferred from viewport tests.

## Whole-site frame consistency

The header and footer templates are now shared by all 178 HTML pages, including home, privacy, 404 and maintenance. Retired the two alternate homepage templates. Legacy product footers were replaced by compact product-note asides, preserving product-specific links and fragment targets. Footer palette, font, link size and focus rules are scoped so page themes cannot change them. The archived maintenance report is labelled as historical, not a current health assertion. Wide Operations Lab input tables are bounded and keyboard-scrollable.
