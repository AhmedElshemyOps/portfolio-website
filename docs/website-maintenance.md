# Shared project listings and InfraQuote styling

Edit `content/projects.json` to change project order, descriptions, status or destinations. The homepage and Projects index use the same ordered records. Do not change case-study or demo paths unless a route change is explicitly approved.

Edit the existing CSS source files listed in `content/infraquote-styles.json`, then run `python3 scripts/render_shared.py`. This renders project listings and rebuilds `assets/css/infraquote-bundle.css`, preserving the source cascade and expanding duplicate imports once. The generated bundle must not be edited directly. Shared site chrome stays separate.

Run `python3 scripts/render_shared.py --check` before publishing. Run link validation and the quotation regression suite after relevant changes. Existing legacy styles remain for other consumers; InfraQuote no longer downloads the unused GitHub showcase styles or its redundant local configuration.

The service worker update notice does not automatically reload or delete local drafts. Visitors may refresh when convenient. Already-open pages running the older script need one normal reload before the new notice can apply to future updates.
