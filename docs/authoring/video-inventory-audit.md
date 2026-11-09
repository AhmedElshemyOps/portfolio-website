# One-time YouTube-to-article coverage audit

Audit date: 9 November 2026. This is a one-time audit and review branch; it does not publish changes to the live site.

## Counts

- Article files in the repository: 132.
- Article URLs in the sitemap after this update: 132. The Yamazumi article was added because the file existed but its URL was absent.
- Saved channel inventory: 33 public video records (27 Shorts, 6 long-form), last fully checked 28 October 2026.
- Supplemental video IDs found in public article markup: 2 (Yamazumi and Lean Management Fixes Tour Waste). Their titles and placements are recorded, but visibility and current YouTube player status remain unknown because the watch pages could not be retrieved.
- Article match records: 30, including the two valid Yamazumi placements.
- Available inventory videos matched to article pages: 27.
- Available inventory videos kept in the video library without an article match: 5 individual Six Sigma belt-role Shorts.
- Inventory video recorded as unavailable on 28 October: 1, retained as a direct YouTube link.
- Article iframe placements after the approved additions: 30 occurrences across 29 unique video IDs. The Yamazumi lesson appears in two relevant articles.
- Duplicate players within a single article: 0.

## Placement decisions

The article match manifest records the video ID, article path, section, exact paragraph anchor, rationale and evidence. Existing embedded placements were preserved and registered. Three previously library-only videos received article placements: the Takt Time cruise-dispatch example in the MICE movement-cell section, the Hoshin Kanri lesson in the strategy-to-capability section, and the belt-role overview beside the Lean Six Sigma project-role questions.

The five individual belt-level videos remain in the library because the site has no dedicated article explaining each belt level. The unavailable apartment-readiness Short remains direct-link-only.

## Data quality and verification limits

The channel inventory is still based on its 28 October full review. This update adds the two site-discovered videos as supplemental records with unknown YouTube availability and privacy status; it does not claim a fresh full-channel scrape. Existing iframe markup and article placements were checked in the repository. Player loading, playback, mobile rendering and current YouTube permissions were not verified in this environment.

The online checker uses public YouTube player metadata and no paid API or vidIQ credits. An unknown response remains inconclusive. Do not change a video's availability or privacy status from article markup alone. Recheck unknown records through the online checker before relying on their playback.

## Maintenance

Run `pnpm check:videos` for the offline inventory, placement, duplicate and direct-link checks. The existing manual and weekly online check uses `python3 scripts/check_article_videos.py --online --report /tmp/article-video-status.json`. It checks the recorded inventory; it does not discover new channel uploads.

The checker permits a video to appear in more than one genuinely relevant article, but rejects repeat players within the same article. Article-matched videos remain in the video library as links to their contextual page; unmatched available videos retain one library player. Keep article wording and existing URLs unchanged when adding placements.
