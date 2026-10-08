# Shared website maintenance

Public page paths and article bodies are preserved. Pages are published as
static HTML, so navigation and contact links remain available without JavaScript.

## Editing shared components

- `templates/header.html` and `templates/footer.html`: supporting-page components.
- `templates/home-header.html` and `templates/home-footer.html`: homepage components.
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
