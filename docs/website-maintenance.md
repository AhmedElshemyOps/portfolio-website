# Shared project listings and InfraQuote styling

Edit `content/projects.json` to change project order, descriptions, status or destinations. The homepage and Projects index use the same ordered records. Do not change case-study or demo paths unless a route change is explicitly approved.

Edit the existing CSS source files listed in `content/infraquote-styles.json`, then run `python3 scripts/render_shared.py`. This renders project listings and rebuilds `assets/css/infraquote-bundle.css`, preserving the source cascade and expanding duplicate imports once. The generated bundle must not be edited directly. Shared site chrome stays separate.

Run `python3 scripts/render_shared.py --check` before publishing. Run link validation and the quotation regression suite after relevant changes. Existing legacy styles remain for other consumers; InfraQuote no longer downloads the unused GitHub showcase styles or its redundant local configuration.

The service worker update notice does not automatically reload or delete local drafts. Visitors may refresh when convenient. Already-open pages running the older script need one normal reload before the new notice can apply to future updates.


## Connected article library

After adding or changing an approved article, run `python3 scripts/link_article_library.py` to refresh its related reading and the matching series return paths. Existing routes and anchors stay unchanged. The block contains up to three links, prioritizing the series guide and topic overlap. Review the suggestions editorially; term overlap is a starting point, not a substitute for review.

Run `python3 -m unittest discover -s tests -p test_article_library_review.py`, `python3 scripts/validate_site_links.py` and `python3 maintenance/validate-navigation.py` before release. The library audit covers incoming and outgoing links for every registered article and series index. Private drafts outside this repository are excluded from all publishing and discovery steps.
