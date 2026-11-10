# Test and evidence report

- Live baseline: 211 verified HTTP 200 responses matched Git blob bytes. See public verification TSV.
- Source audit: 206 HTML responses fetched from the exact pinned Git revision and checked against Git blob IDs.
- Soft Clay comparison: 202 changed HTML files scanned for canonical, descriptions, robots, OG/X metadata, HTML IDs and literal YouTube embed IDs. Details in the [diagnosis](RELEASE_CHECK_DIAGNOSIS.md).
- Browser desktop visual samples: homepage, Knowledge Hub, and Tour Guide Quality Index.
- Prototype static generation: all 24 concept/screen combinations generated one H1 and both scripts passed parse checks. Browser-based interaction and viewport QA remain open.
- Production and draft GitHub checks failed. Review workflow logs in the diagnosis. No workflow rerun was requested.
- Open: mobile production screenshots, field performance, keyboard and assistive technology, all project scenarios, live video playback, Lighthouse, production consent network behavior, account dashboards and rollback rehearsal.
