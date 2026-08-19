# Content Maintenance Guide

This portfolio is a static HTML site. Preserve the static-hosting model unless a migration is explicitly approved.

## Main launch pages

- `index.html` is the recruiter-focused homepage.
- `projects.html` is the project index and should list all active demos, concepts, and portfolio systems.
- `articles.html` is the article library and should link to every published article.
- `infradispatch/` is the current InfraDispatch demo.
- `infrasky.html` is the current InfraSky prototype.

## Content registries

- `data/projects.json` is the source-of-truth checklist for project metadata.
- `data/articles.json` is the source-of-truth checklist for article metadata.

These JSON files are not required by the current static pages at runtime. They exist so future additions can be tracked consistently before editing the HTML index pages.

## Adding a new article

1. Add the article HTML file at the site root or in an approved folder.
2. Preserve the article body exactly when importing existing writing.
3. Add a card/link to `articles.html` in the right category section.
4. Add metadata to `data/articles.json`.
5. Add the URL to `sitemap.xml`.
6. Run the local QA commands in `docs/qa-checklist.md`.

## Adding a new project

1. Add the project page or project folder.
2. Use the standard project method:
   - Problem
   - Solution
   - Use case
   - My role
   - Status
   - Demo/static boundary
3. Add the project to the Projects dropdown when it becomes a primary project.
4. Add a card to `projects.html`.
5. Add metadata to `data/projects.json`.
6. Add the URL to `sitemap.xml`.
7. Run the local QA commands in `docs/qa-checklist.md`.

## Design guardrails

- Keep the navy, gold, and white identity.
- Keep the tone professional and recruiter-focused.
- Use clear sections, calm spacing, readable cards, and visible demo boundaries.
- Do not claim production SaaS functionality unless backend/API functionality exists.
- Do not expose secrets or API keys in frontend files.
