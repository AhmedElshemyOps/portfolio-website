# Video and reader maintenance

The shared footer lives in `templates/footer.html`. Update it once and run `python3 scripts/render_shared.py`; do not edit each page footer. The YouTube links use the verified public channel `https://www.youtube.com/@ahmedqualityops-official`.

`content/article-video-matches.json` records each video's article, heading, exact preceding paragraph, rationale and placement review date. Update `reviewedOn` only after a real editorial check. It describes placement review, not video fact verification. Keep each video in one location unless a future editorial decision explicitly changes that rule. Add only public, embeddable videos with a strong section match.

The Knowledge Hub derives its format metadata from the registry and its video badges from this manifest. The homepage uses the same manifest. Run `python3 scripts/sync_catalogue.py` after relevant changes. Guides, AI toolkits, video-supported articles and series overviews can be filtered; working demos have a separate link because they are not articles in the registry. Existing search, sorting and filter state use the URL and session storage.

`render_reader_enhancements.py` keeps one primary article action visible and gathers secondary related-reading, subject and learning panels into a native disclosure. Original links, IDs, article teaching text, series navigation, feedback and newsletter signup remain available. Updated dates come from the registry and are not silently changed to today's date. Example labels appear only where the article already identifies illustrative examples.

Run `python3 scripts/check_article_videos.py` for local anchor and mapping checks. Run `python3 scripts/check_article_videos.py --online --report /tmp/article-video-status.json` for current public YouTube embedding availability. Exit 0 means checks passed; 1 means missing/stale placements or unavailable videos; 2 means online availability could not be established. A bot challenge or sign-in requirement is unknown, not evidence that a video was deleted. Review the saved report before changing a placement.

The proposed `check-article-videos.yml` GitHub Actions workflow runs weekly on Mondays at 07:20 UTC and supports manual runs. It stores a report artifact and does not edit files, publish, deploy, or change channel settings. It will become active only after the separately approved changes reach the repository's default branch. Network checks may need a manual follow-up when YouTube limits hosted runners.

Before approving publication, run the relevant tests, shared-render check, local link validation, navigation validation and browser checks. Live-site behavior remains unchanged until publication is separately approved.

Video layout (`videoFormat`) and placement review dates live in the manifest. `render_article_videos.py` replays only the approved paragraph-level placements; the offline checker rejects missing or altered anchors.
