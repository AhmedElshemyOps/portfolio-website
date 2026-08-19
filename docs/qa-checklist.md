# QA Checklist

Run from the repository root.

## Local server

```bash
python3 -m http.server 8080
```

Open:

- `http://localhost:8080/`
- `http://localhost:8080/projects.html`
- `http://localhost:8080/articles.html`
- `http://localhost:8080/infradispatch/`
- `http://localhost:8080/infrasky.html`

## Manual checks

- Header navigation works on desktop and mobile.
- Projects dropdown shows the current primary projects.
- Mobile menu opens and closes.
- Footer links work.
- CV download links resolve.
- Contact links use the correct email, WhatsApp, and LinkedIn URLs.
- Article library links to every article.
- Individual article pages load with images and styling.
- InfraDispatch and InfraSky load without console errors.
- No horizontal scrolling on mobile.

## Static checks

- Run an internal link scan after adding or moving pages.
- Confirm `sitemap.xml` includes new launch pages.
- Confirm page titles and meta descriptions are present on new pages.

## Build note

The launch site is static HTML/CSS/JS and has no required production build step. If a future framework migration is approved, document the build command here before launch.
