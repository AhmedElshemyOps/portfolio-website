# Calm redesign: maintenance and review

Current preview: http://127.0.0.1:4185/ . This is a feature-branch review, not a production release.

## Sources of truth
- Shared visual system: assets/css/calm-design.css. App canvases retain their dedicated interaction styles.
- Shared footer: templates/footer.html; its original footer stylesheet is retained. WhatsApp belongs in Connect and the visible number is omitted.
- Professional facts: content/professional-profile.json. Existing downloadable CVs are unchanged.
- Public channel inventory: content/youtube-videos.json. Article placements: content/article-video-matches.json. Library: templates/video-library.html.in and scripts/render_video_library.py.
- Original preservation baseline is immutable. docs/calm-redesign/approved-additions.json and approved-footer-change.json record exact, reviewed exceptions; never regenerate the baseline to hide changed content.

## Updating videos monthly
The active thread automation reviews the public channel on the first day of each month at 10:00 Europe/Amsterdam. It prepares changes only when useful and does not use paid credits or publish. Check newly public uploads, descriptions/captions where available and current embed permission. Match a specific existing paragraph, keep article wording intact and record the rationale. Keep one player per upload across articles and library. Place unmatched suitable lessons in the library; use a direct link if embedding is disabled. Do not force every upload into article prose. Public/private inventory guards and dynamically derived counts support future additions.

After a reviewed change, run the catalogue synchronizer and shared renderer, then prune only unreferenced generated styles. Do not hand-edit generated HTML or hashed bundles.

```sh
python3 scripts/sync_catalogue.py
python3 scripts/render_shared.py
python3 scripts/prune_generated_styles.py
python3 scripts/render_shared.py --check
npm run check:redesign
python3 scripts/validate_site_links.py
python3 maintenance/validate-navigation.py
python3 scripts/check_article_videos.py
python3 -m unittest discover -s tests
```

The pruner removes unreferenced content-hashed CSS only; authored CSS, linked resources and downloads must be retained. The full release health checker also includes JavaScript/application checks. Inspect representative desktop, tablet and mobile pages and any newly affected component; check player orientation, heading contrast, keyboard controls, links and paragraph context.

## Release gate
The local release passed 25 check groups, original-content preservation, all-page local links and mobile structure checks. Final targeted rollout tests pass seven tests, including public-only monthly inventory updates. Existing CV downloads remain unchanged. Public descriptions are not a full transcript audit; YouTube controls availability. Real-device assistive technology and field performance remain outside this local validation.

Create a reviewed feature-branch PR. Merge and production deployment require Ahmed's explicit approval. GitHub Pages currently serves master at the repository root; pushing this feature branch does not deploy it. Keep the restoration tag calm-redesign-baseline-2026-10-28. Never publish the historical isolated work/calm-video-preview directory.
