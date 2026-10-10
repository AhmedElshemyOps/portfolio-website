# Factual and financial review — 10 October 2026

## Scope and limits

Every registry page was parsed from its actual body. `claim-review-queue.csv` lists candidate legal, regulatory, safety and numerical passages with the sources already present in that article. It is a screening queue, not a list of confirmed errors: it includes prompts, cautions, hypothetical scenarios and factual claims. `financial-review-queue.csv` separately lists numerical passages needing context. No assertion is marked externally verified solely because an article contains a link.

The selected checks below were completed. All other external assertions remain explicitly pending source-by-source verification. No legal certification, measured business benefit, SEO ranking guarantee or actual property performance is claimed. No substantive article text was rewritten during this restructuring.

## Completed external checks

| Article / family | Claim checked | Source checked | Result and limitation |
|---|---|---|---|
| Amsterdam Product Discovery 09 | City-centre tour size, exemption threshold, operating hours and application | [City of Amsterdam](https://www.amsterdam.nl/en/business/rules-permit-tours/) | Matches the article: maximum 15 participants, exemption above four, 08:00–22:00; fee €212.30 and approximately six weeks processing. Date-dependent: recheck before operating. This is not route-specific permit approval. |
| Amsterdam Product Discovery 09 | Cooling-off rights are conditional for dated services | [RVO / Business.gov.nl](https://business.gov.nl/regulations/cancellation-period-sale/) | Supports avoiding a blanket 14-day entitlement. Exact contract, cancellation policy and online-cancellation implementation still require qualified review. |
| Amsterdam Product Discovery 08 | Public Stripe Netherlands card pricing | [Stripe Netherlands](https://stripe.com/nl/pricing) | The stated standard EEA 1.5% + €0.25, UK 2.5% + €0.25 and international 3.15% + €0.25 prices match the checked page. The model's 2.5% blended assumption is not a measured card mix; FX and other applicable charges need separate treatment. |
| Amsterdam Product Discovery 08 | General VAT rate and limited tour/excursion exemption | [Belastingdienst rates](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_berekenen_aan_uw_klanten/btw_berekenen/btw_tarief/btw_tarief), [exemption](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/tarieven_en_vrijstellingen/vrijstellingen/vrijstelling_voor_lezingen_excursies_en_rondleidingen) | General 21% baseline and conditional exemption supported. The exact tour/bundle/operator tax treatment remains unverified; this is a scenario assumption, not transaction-specific tax advice. |
| Responsible AI guides | NIST AI RMF as risk-management guidance | [NIST](https://www.nist.gov/itl/ai-risk-management-framework) | Framework is voluntary; it is not legal compliance certification. The site now notes an ongoing revision, so future references should specify version. |
| SOP/documentation guides | ISO 10013:2021 scope | [ISO catalogue](https://www.iso.org/standard/75736.html) | Public abstract supports tailored documented-information guidance. Full paid standard and clause-level claims were not independently audited. |
| ITIL 4 for Tourism Operations | Article's note that Version 5 is available | [PeopleCert certifications](https://www.peoplecert.org/browse-certifications/it-service-management/ITIL-1) | Version 5 is listed. Existing article is deliberately about ITIL 4; its URL and approved historical title remain intact. No change to the author's credentials. |

## Independent arithmetic

Run `python3 scripts/check_article_financial_examples.py`. `financial-checks.csv` records **54 calculations**, with the input formula, independently computed result and transcribed published result. All 54 match within the documented rounding tolerance.

Covered examples include:

- AED 2,300 and AED 2,600 quotation net-cost totals; markup versus margin; 20% target-margin selling price AED 3,250.
- Fixed cost per guest and break-even ceilings of nine and ten paying guests; the seven-guest scenario loses AED 420.
- Monthly COPQ AED 2,200; separate Lean Six Sigma COPQ AED 1,765.
- Five-year TCO AED 4,550 versus AED 4,150; savings depend on illustrative assumptions and exclusions.
- HVAC incident cost AED 452.50 and eight incidents AED 3,620.
- Preventive-maintenance compliance, direct workload and conditional avoided parts.
- Landed procurement costs AED 42,500 versus AED 42,000.
- Illustrative re-clean reduction, first-time-right, reorder coverage and workforce workload.
- Revenue, OTA commission, weighted sales pipeline and SOP coordination labor examples.
- Every row of `resources/amsterdam-product-discovery/article08-unit-economics-model.csv`, recomputed from unrounded price, VAT, channel fee, guest count, variable cost, departure cost and overhead assumptions.

### Amsterdam commission-basis investigation

An initial apparent discrepancy was resolved by inspecting `article08-channel-economics.csv`: OTA commission is explicitly **on ex-VAT revenue**, while direct payment fees apply to the VAT-inclusive charge. Applying OTA commission to retail would change the break-even result, but that is not the published scenario. Under the actual model, the seven-guest OTA price threshold is approximately €56.29; “mid-€50s” is consistent. No arithmetic correction to the article is justified.

Commercial evidence remains conditional: guide cost, OTA commission, B2B discount, demand, card mix and supplier terms are not confirmed contracts or observed operating outcomes. The article's REVIEW recommendation concerns these inputs, not an arithmetic failure.

### What was not recalculated as an outcome

Prompts asking a company to calculate ROI, savings or KPIs with placeholders have no real input dataset and therefore no independently verifiable outcome. They remain templates. Financial passages outside the explicit 54-check list remain in the review queue; do not present this as complete numerical certification of every sentence or downloadable research artifact.

## Pending editorial and evidence actions

1. Recheck all time-sensitive attraction rules, prices, airline connectivity, opening times, travel-policy and destination statistics against dated primary sources before commercial use. Existing citations alone do not establish current validity.
2. Keep fictional 60-unit property cases and assumed tour costs clearly separate from the author's actual employment results.
3. Replace “conservative” card-mix assumptions with measured booking/card data before pricing a live Amsterdam product.
4. Verify jurisdiction-specific privacy, insurance, accessibility, safety and consumer terms with qualified owners. US/UK documentation references are methodological examples and do not establish Netherlands or UAE legal requirements.
5. Review the additional screened passages in both CSV queues. Keyword matches often represent guardrails rather than legal assertions; a human should resolve that context before editing.
6. No invented savings, customer outcomes or verified supplier quotes have been added. No private RAG or prompt-injection material has been included.
