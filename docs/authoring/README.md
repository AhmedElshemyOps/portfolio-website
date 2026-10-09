# Publish your finished articles

Copy `finished-article.md` outside the website folder and paste your finished text into it. Fill in the title, summary, topic and real publication/update dates. The slug is the permanent address: choose it once and keep it unchanged.

The shared template supplies the website header and footer, navy/warm-white/gold design, mobile layout, section navigation, reading controls, publication dates and search metadata. Publication updates the Knowledge Library, filters, search catalogue, homepage article browser, sitemap and Atom feed together. It does not draft or rewrite your article.

Supported text formatting: paragraphs, `##`/`###`/`####` headings, **bold**, inline code, fenced code blocks, numbered or bullet lists, and Markdown links. HTML is escaped. Tables and images need a separate editorial review; this first template deliberately refuses unsupported table/image syntax.

Preview without publishing:

```
python3 scripts/publish_article.py /path/to/finished.md --preview /tmp/article-preview.html
```

Preview needs the website assets served from the same origin. For a full local review, publish into a disposable copy of the repository and serve that copy; do not place drafts in the live website directory.

Publish to the local website source:

```
python3 scripts/publish_article.py /path/to/finished.md --publish
```

Review links, facts, mobile layout and keyboard access before committing and pushing the verified GitHub Pages release. This command does not deploy by itself. You can also send Ahmed's website assistant the finished text, title, summary and topic and request publication.

Existing articles are protected. Only articles created by this workflow can be updated, using `--replace`; preserve their original publication date and slug. Keep the source Markdown outside the public repository. No example article is published with this feature.

## Approved series banners

Every new public article requires `series_id` (an existing key in `content/series-banners.json`) and `series_number` (the next consecutive number). The sample uses Amsterdam article 13; check the current manifest before choosing a number. Unknown/private series, duplicates, gaps and renumbering an existing article are rejected before files are changed. The publisher applies the approved artwork, exact title, article number, sharing image and previous/next reading links. It updates the affected series totals and links in the same rollback-protected publication operation. Preview validates metadata without adding the draft to any public registry. No RAG series is registered for public publication.

Responsive artwork is generated once per approved design with `scripts/build_banner_sizes.py` (Pillow required). It preserves the approved composition at 240, 640 and 960 pixels wide; the original 1774-pixel artwork remains available. Shared rendering adds `srcset`, accurate display sizes and intrinsic dimensions. Do not publish private preview output into the website directory.
