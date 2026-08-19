# Ahmed Mahmoud Portfolio Website

Static portfolio website for Ahmed Mahmoud, built with HTML, CSS, JavaScript, local data files, and static assets. The site is designed for simple upload to a domain root or `public_html` folder.

## Final Folder Structure

- `index.html` - home page.
- `about.html`, `about/` - professional profile pages.
- `experience.html`, `experience/` - experience pages.
- `projects.html` - project index.
- `infradispatch/` - InfraDispatch project and planner page.
- `infracluster.html` - InfraCluster project page.
- `infrasky.html` - InfraSky project page.
- `infraquote.html` - InfraQuote project page.
- `articles.html`, `insights.html`, `article-*.html` - insights library and article pages.
- `assets/` - primary images, icons, CSS, JavaScript, documents, Open Graph assets, and article visuals.
- `assets/css/` - current project-level stylesheets.
- `assets/js/` - current project-level JavaScript.
- `css/` - legacy/supporting stylesheets still referenced by existing pages.
- `js/` - legacy/supporting JavaScript still referenced by existing pages.
- `data/` - static JSON and CSV datasets used by project pages and planners.
- `downloads/` - downloadable CV/profile files.
- `docs/` - internal maintenance notes not required for normal hosting.

## Main Style Files

- `assets/css/design-vnext.css` - main visual polish layer, shared design tokens, article cards, project-page alignment, responsive cleanup, and current website-wide overrides.
- `assets/css/style.css` - legacy base stylesheet used by several article and project pages.
- `assets/css/responsive.css` - responsive support for pages that reference it.
- `styles.css` and `styles-v38.css` - older global styles still referenced by existing pages.
- `css/*.css` - supporting legacy article, quotation, premium, and polish styles that are still referenced by current HTML pages.

## Main Script Files

- `assets/js/main.js` - shared navigation utilities, article-page cleanup, and shared project-page behavior.
- `script.js` - legacy global script used by older pages and InfraDispatch planner paths.
- `assets/js/planner-*.js` - InfraDispatch planner logic.
- `assets/js/infracluster-app.js` - InfraCluster page logic.
- `assets/js/infrasky-*.js` - InfraSky planner data and logic.
- `assets/js/infraquote-*.js` - InfraQuote calculation and UI logic.
- `assets/js/site-config.js` and `assets/js/analytics.js` - site configuration and analytics loader.

## Main Page Ownership

- Home and recruiter sections: `index.html`, `assets/css/design-vnext.css`, `styles.css`, `script.js`.
- Project pages: `infradispatch/index.html`, `infracluster.html`, `infrasky.html`, `infraquote.html`, `assets/css/design-vnext.css`, and each related `assets/js/*` project file.
- Article pages: `article-*.html`, `articles.html`, `insights.html`, `assets/css/design-vnext.css`, `assets/css/style.css`, and the supporting `css/` article stylesheets.
- Static data: `data/articles.json`, `data/projects.json`, `data/locations.json`, and tourism/location CSV or JSON files.

## Assets

- General images are stored in `assets/`.
- Article visuals are stored in `assets/articles/`.
- Icons and favicons are stored in `assets/icons/` and selected root `assets/` files.
- Documents are stored in `assets/documents/` and `downloads/`.
- Open Graph images are stored in `assets/og/` and `assets/og-v14/`.

## Local Preview

From the project folder:

```bash
python3 -m http.server 8086
```

Open:

- `http://localhost:8086/index.html`
- `http://localhost:8086/projects.html`
- `http://localhost:8086/articles.html`
- `http://localhost:8086/infradispatch/`
- `http://localhost:8086/infracluster.html`
- `http://localhost:8086/infrasky.html`
- `http://localhost:8086/infraquote.html`

## Deployment

Upload the final ZIP contents to the domain root or `public_html`. Keep the folder structure exactly as included in the ZIP.

Do not upload old archive folders, previous ZIP exports, local `.git` files, or unused development notes unless they are intentionally needed.

## QA Checklist

Before publishing:

- Open the home page, project pages, article index, and several article pages.
- Confirm navigation links open correctly.
- Confirm images, CSS, and JavaScript load without missing-file errors.
- Confirm article pages show reading-time cards and no listening/audio controls.
- Confirm project pages remain static-hosting ready.
- Confirm mobile navigation, article tables, cards, and project tools remain usable on small screens.
