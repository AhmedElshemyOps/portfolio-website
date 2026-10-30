# Maintaining the public video inventory

Run `pnpm check:videos` for a read-only offline check. Every release runs this in the full health checks. It verifies the recorded public inventory, approved article paragraph anchors, unique article/library players and direct YouTube links. Private, unknown or disabled inventory records cannot silently become article embeds. Historical article compatibility copies remain excluded from player uniqueness counting.

The existing scheduled workflow and manual workflow dispatch run `python3 scripts/check_article_videos.py --online --report /tmp/article-video-status.json`. Online checks now cover **every recorded public video**, including library-only and direct-link-only lessons, rather than only article placements. This does not search for new channel uploads. Update the inventory separately after reviewing the current public Videos and Shorts lists.

The report distinguishes:

- `embeddingRegression`: a previously available embed is now definitively unavailable. Exit1 requires review.
- `embeddingRecovery`: a previously disabled/unknown player is now available. Report only; review before changing published inventory.
- `unknown`: public metadata was blocked or inconclusive. Exit2 requires review, without claiming deletion or automatically removing the video.
- Known unavailable, direct-link-only lessons: intentional, provided their direct link remains in the library. These alone do not fail the check.

Exit1 also covers local mapping/coverage errors. Offline checks use no network or credits. Online checks use public YouTube metadata and no paid API, make no account changes, and do not update inventory review dates, article text or player permissions. Availability is a dated observation, not a guarantee of future playback or proof of accurate captions.

Review the saved Actions artifact on a failure. Do not delete articles or remove video links to silence unknown responses. Keep existing article words, URLs and section anchors unchanged; place videos only where the paragraph genuinely supports the lesson. Watch pages require independently verified publication facts and reviewed supporting content. Do not invent upload dates or publish an unverified transcript.
