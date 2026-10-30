# Career portfolio routes

The owner approved the three professional routes and deployment on 30 October 2026. `content/career-routes.json` selects company contribution indices from `content/professional-profile.json`, reviewed project slugs from `content/projects.json`, existing reading destinations and verified IATA qualifications. Department labels remain department labels; they are not new official job titles. Do not rewrite career facts in a second content source.

`scripts/render_career_routes.py` generates the three additive `/careers/.../index.html` pages and the homepage's `career-routes` section. It runs inside the existing shared renderer. Pages reuse the shared header/footer, fonts, palette and existing search and consent-controlled analytics. There is no additional browser JavaScript, subscription form or contact pitch.

Edit the manifest/template/scoped CSS, then run shared rendering, `build_search_feeds.py`, and the full health checks. New sitemap entries omit modification dates until there is an actual maintained page date; original article publication dates are preserved. Related articles and the existing CV remain at their exact URLs and are not rewritten.

The existing preservation baseline is unchanged. The strict measurement-page contract subtracts only the exact generated homepage section before comparing every pre-existing word, link, ID and canonical. A missing, duplicate or altered section fails instead of being silently ignored. Other pages receive no exception. Regression tests also verify confirmed profile facts, demonstration boundaries, sitemap inclusion, idempotence and rejection of changed original homepage text.
