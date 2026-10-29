# Measurement and indexing foundation

Production reporting uses property 538087578, stream 14892642073 (Ahmed Website), measurement G-45YNREM1LT and hostname exactly ahmedqualityops.com. The property/stream mapping was observed in connected GA4 data, not inferred from a display name. Property 550019353 returned no rows in the selected period; its purpose is unresolved, and it has not been removed.

## Historical reconciliation

For 1–28 October 2026 the exact production hostname returned 120 sessions and 580 page views. Keep localhost (1,172 views) and the hosted preview (32 views) outside production reporting. Daily rows last show non-production traffic on 10 October. No non-production rows were returned for 11–28 October; this is not a promise that all future data is uncontaminated. Preserve historical records. Reports are consent-dependent; sessions are not unique readers and event counts are not verified outcomes.

`build_measurement_baseline.py` consumes read-only stream, daily and event exports, checks the exact stream/property/hostname match, exports a separated baseline and prepares the URL register. It never edits GA4 settings, submits URLs or infers search indexing from a working page or a page view.

## Event ownership and interpretation

| Event | Owner / interpretation |
|---|---|
| page_view | General tracker, one explicit send after granted consent; gtag automatic page view disabled in the site config call. GA4 enhanced measurement/admin settings still require account-level review. |
| article_opened | Reader component on initial article setup, only when consent allows. A visitor accepting consent later may not produce this event on that page. Not a unique-reader metric. |
| article_scroll_depth / article_read_75 | General tracker, once per threshold per page. Scroll proxies, not proof the article was read or understood. |
| ai_prompt_copy | Dedicated toolkit sends after successful copy. General tracker must not count the same managed control again. Legacy unmanaged controls retain their historical click fallback. |
| article_back_to_top | Dedicated reader owns managed controls; generic fallback only without that reader script. |
| file_download | All eligible PDF/download links, not CV-only. Check GA4 enhanced file-download collection for overlap before interpreting totals. |
| project_click / project_demo_open | Project destination or explicitly labelled demo click; not proof a demo was used successfully. |
| email_click / whatsapp_click / linkedin_click | Contact-link clicks, not confirmed messages, leads or job applications. |
| search_performed / knowledge_filter | Existing discovery interaction; avoid summing with enhanced view_search_results as if both were searches by different people. |
| performance_observations | Raw observer diagnostics, not validated field Core Web Vitals. Historical web_vitals should not be used as current field proof. |

No duplicate tracking library was added. The focused fix gives managed prompt-copy and reader back-to-top events one owner. Query-string redaction, explicit safe UTM labels, granted consent and production-host restrictions stay in place. Existing article/backlink URLs must never be rewritten to add campaign parameters; labels apply only to newly prepared optional distribution links.

## Indexing register

The current register has 179 public pages, with 173 intended search targets and six intentional noindex utility routes. Technical availability and sitemap membership do not establish Google or Bing index status. Leave account fields not_verified until actual account evidence is available. Record engine-selected canonical, last crawl, reason, evidence and date for each investigated URL; a successful sitemap submission is a discovery signal, not indexing proof.

The standalone Google HTML proof and BingSiteAuth.xml are ownership assets, not article pages. Keep their exact downloaded contents and retain them after verification. Exact Google proof files are excluded from shared-page rendering only when both their root filename and contents match the expected format. No DNS, redirects or existing verification tokens are replaced.

## Preservation contract

preservation-contract.json records visible text, every anchor href, all IDs and canonicals for all 179 existing public pages before this work. A regression test checks all four invariants. Changes to script cache revisions do not change any published article URL or navigation link. Any later approved content change must be reviewed explicitly before updating this contract; never regenerate it silently to make a failure pass.
