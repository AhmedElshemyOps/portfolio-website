# Knowledge taxonomy design

One primary category answers the central learning objective. Industry, destination and method tags support cross-disciplinary discovery without duplicate article URLs. Editorial series are independent of categories.

## Category structure

### Product Strategy & Development — 11 articles

Research customer needs, validate concepts and evaluate product economics.

- Market Intelligence & Research: 5
- Product Discovery & Validation: 2
- Product Design & Requirements: 2
- Product Economics & Lifecycle: 2

### Operations & Process Engineering — 48 articles

Design dependable processes, practical procedures and measurable improvement.

- Process Architecture & BPM: 11
- SOPs & Work Instructions: 13
- Quality & Continuous Improvement: 10
- Performance & Operational Control: 6
- Asset Reliability & Maintenance: 8

### AI Prompt Engineering & Toolkits — 35 articles

Use structured prompts with trusted inputs, review and human authority.

- Prompt Engineering Frameworks: 3
- Hotel & Serviced Apartment AI Toolkits: 24
- Tourism & DMC AI Toolkits: 8

### Hospitality & Tourism Operations — 22 articles

Coordinate guest journeys, destination delivery and commercial service promises.

- Hotel & Serviced Apartment Operations: 2
- DMC & Destination Operations: 3
- MICE & Event Operations: 5
- Tour Pricing, Sales & Quotations: 7
- Guest Experience & Service Delivery: 5

### Governance, Risk & Assurance — 12 articles

Control decisions, documentation, supplier relationships and operational risk.

- Responsible AI & Human Oversight: 2
- Risk & Compliance: 2
- Documentation & Audit Assurance: 4
- Supplier & Decision Governance: 4

## Classification rules

- Identify the reader decision, method and practical output from the body. The mapping CSV records an article-specific evidence excerpt.
- Prompt-based assistance belongs under AI Prompt Engineering & Toolkits. Responsible-AI governance articles belong under Governance even when they include prompts.
- An Amsterdam research collection can include risk controls or operating calendars outside Product Strategy while retaining all 12 installments.
- A reusable methodology belongs in Operations & Process Engineering; a destination/service application can belong in Hospitality & Tourism Operations.
- Use 0–5 tags from the controlled vocabulary. No headings-as-tags, duplicate primary categories or separate thin AI Engineering category.
- The proposed AI-Assisted Operational Workflows subcategory is consolidated into the two domain toolkit subcategories; no empty folder has been created.
- Series artwork is not membership evidence. Six independent field guides reuse approved artwork but have null series identifiers and no installment number.
- The historical registry distinguishes 128 articles and five series indexes. Two article-typed overview guides remain article-typed for compatibility; seriesKind identifies their overview role without breaking existing feeds.

## Compatibility and publishing

- article-registry.json is the source of truth. knowledge-taxonomy.json defines allowed vocabulary, not a second article listing.
- Existing category, pillar and series fields remain for old consumers. primaryCategory, subcategory, tags, seriesId, seriesTitle, seriesPosition, seriesKind, summary, status and relatedArticles are explicit fields.
- legacyTags and legacyTitle preserve existing search vocabulary and historic embedded reading paths. They are not exposed as the new visible topic tags.
- Old ?pillar=, ?topic= and ?series= links still work. New filters use query parameters on the existing Knowledge Hub URL; canonical addresses remain unchanged.
- Future finished-text publication requires primaryCategory, subcategory and relatedArticles, controlled tags, and the existing approved series metadata. Invalid metadata blocks the transaction.
- sync_catalogue.py now rebuilds derived data from the registry; it no longer reruns historical article-body migrations.
- Reading times are estimates at 220 words/minute, derived from parsed body blocks excluding navigation and shared interface modules. They are labelled as estimates rather than measured reading sessions.
