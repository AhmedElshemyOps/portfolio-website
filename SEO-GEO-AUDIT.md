# SEO and GEO Launch Audit

Date: 2026-07-01  
Site: Ahmed Mahmoud Portfolio / Ahmed Quality Ops  
Primary domain assumed: `https://ahmedqualityops.com`

## Executive Summary

The site is ready to move toward launch as a static HTML portfolio with four clear project pillars: InfraDispatch, InfraCluster, InfraSky and InfraQuote. The strongest SEO opportunity is not rewriting the article content, but clarifying the information architecture around one canonical Insights Library, one Projects hub and factual schema that helps search engines and AI answer engines understand Ahmed Mahmoud as the entity behind the work.

## Implemented Fixes

- Rebuilt `robots.txt` with a clean crawl policy and sitemap location.
- Rebuilt `sitemap.xml` around canonical launch URLs and removed stale priority emphasis on legacy paths.
- Updated `llms.txt` and `llms.md` for AI answer engines and retrieval tools.
- Added `site.webmanifest` with production favicon assets.
- Added safe centralized analytics files:
  - `assets/js/site-config.js`
  - `assets/js/analytics.js`
- Removed direct hard-coded GA4 snippets from launch HTML files.
- Added Search Console placeholder meta tag to `index.html`.
- Added schema to key pages:
  - Home: `Person`, `WebSite`, `ProfessionalService`
  - Projects: `CollectionPage`
  - Articles: `CollectionPage`
  - InfraDispatch / InfraQuote / InfraSky: `SoftwareApplication`
  - Experience: `ProfilePage`
- Added `404.html`, `privacy.html` and `cookie-policy.html`.

## Canonical Architecture

- `/` is the homepage and recruiter-facing entry point.
- `/projects.html` is the project hub.
- `/articles.html` is the single canonical writing library.
- `/experience/` is the professional background page.
- `/infradispatch/`, `/infrasky.html` and `/infraquote.html` are the main project experiences.

Legacy folders and backup folders should not be uploaded as production content.

## Content Preservation

Article body content was not rewritten, shortened, expanded or repositioned during this SEO/GEO pass. Changes were limited to metadata, discovery files, analytics wiring, schema, utility pages and documentation.

## Remaining Manual Steps

- Replace `ADD_GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN` in `index.html` only after Google Search Console provides the real token.
- Add the real GA4 measurement ID in `assets/js/site-config.js` only after Ahmed creates or confirms the correct GA4 property.
- Submit `https://ahmedqualityops.com/sitemap.xml` in Google Search Console after deployment.
- Do not upload backup folders such as `preview_*`, `Ahmed-Mahmoud-Portfolio-Full-Audit*` or `sky-align-muse-enhanced-build` as canonical website content.

## Static vs Real Functionality

- Real: static HTML pages, article library, project demos, local JavaScript interactions, static forms/tools where implemented, internal navigation, schema, sitemap and analytics event hooks.
- Static/demo: InfraDispatch, InfraSky and InfraQuote are frontend/static planning tools unless a backend/API is explicitly connected later.
- Not real yet: server-side accounts, database persistence, CRM, payment, live dispatch API, live quotation storage or production routing API.

## 30-Day SEO Action Plan

1. Week 1: Deploy clean launch package, verify Search Console, submit sitemap, confirm GA4 real-time pageview.
2. Week 1: Test top pages in PageSpeed Insights and Rich Results Test.
3. Week 2: Add internal links from each article to one related project and two related articles where naturally relevant.
4. Week 2: Create a short recruiter-facing PDF case-study download for InfraDispatch.
5. Week 3: Publish one new article that connects InfraDispatch, InfraSky or InfraQuote to a real operations problem.
6. Week 3: Review Search Console queries and improve page titles only where impressions appear.
7. Week 4: Add server redirects from old legacy URLs if the hosting platform supports `.htaccess` or redirect rules.
8. Week 4: Review GA4 events for project clicks, article clicks, CV downloads, LinkedIn clicks and email clicks.
