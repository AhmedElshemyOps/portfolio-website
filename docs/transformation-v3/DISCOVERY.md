# Phase 00 discovery · 10 November 2026

## Published baseline

`master` at `753c3a0cc6e2235201e939b840973911725dc00c`. [Successful GitHub Pages deployment](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42690327050) and [independent failed release validation on the same SHA](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42690328221). All 211 checked public endpoints returned HTTP 200 after retries and matched the published Git blobs byte for byte. These cover all 178 sitemap URLs, all 206 exact tracked HTML paths (including /index.html as well as /), sitemap.xml, robots.txt, ads.txt and the public CV PDF. The two field guides omitted from the registry are already in that sitemap. The full Git tree was untruncated and contained 1,436 files, including 206 tracked HTML files. See inventories for distinctions between repository paths and sitemap URLs.

## Architecture

Static HTML, shared templates and generated CSS on GitHub Pages under the custom domain. Python and Node scripts render shared components, synchronize catalogues, build search feeds and validate links, video placements, release integrity and article preservation. The core site has no required backend. InfraQuote documents an optional Supabase backend. A service worker adds offline/update behavior and needs regression coverage. Recommend retaining this architecture and introducing a single authoring path through the existing registry and template tools.

## Published experience

Homepage, Knowledge Hub and Tour Guide Quality Index reviewed visually on desktop. Homepage has clear CV access, career paths and all four demos. The live GA4 consent prompt occupies the lower part of the initial viewport. Knowledge search sits below the introductory learning routes. The representative article exposes reading tools, glossary and contents. Compare discoverability of navigation and sharing on mobile before redesigning. Desktop screenshots were captured during inspection. Mobile baseline screenshots and full browser interaction testing remain open.

## Content, discovery and media

132 HTML files under articles/. The registry has 133 entries: 128 articles and five series indexes, including three registered destinations outside articles/. Heijunka and Yamazumi exist, are indexed in the sitemap, and are absent from the registry. Preserve their content and article-specific social assets while reconciling discovery. All 132 article HTML files inspected have one H1 and detected description, canonical, OG image and JSON-LD. All detected img tags have alt attributes, which says nothing about alt text quality. The repo has 666 tracked SVG/AVIF/JPG/PNG/WebP/JPEG assets. The 1,143,468-byte homepage monogram is an optimization candidate if runtime requests confirm it is in a critical path. Measure actual mobile and desktop waterfalls before prioritizing.
 
YouTube registry: 35 records, with dated inventory evidence from 28 October and 30 recorded article matches. A source scan found 34 distinct literal YouTube embed IDs across 23 HTML files. These populations serve different purposes. Audit placement, availability and current channel coverage separately. Existing search, learning paths, filters, saved articles, video lesson directory and content feeds are available to reuse.

## Portfolio and security

The CV link resolves. The public and managerial PDFs in the repo are identical blobs. Review their content and date with the owner before claiming a new managerial CV. The four project entry points exist and their public HTML is preserved at this baseline. Functional and export tests are separate work. Sampled homepage response lacks visible CSP and several other commonly reviewed response headers. Evaluate host-level controls and script/frame policy before drawing sitewide conclusions. Review third-party dependencies, service worker caches, consent boundaries and optional cloud permissions in their designated phases.
