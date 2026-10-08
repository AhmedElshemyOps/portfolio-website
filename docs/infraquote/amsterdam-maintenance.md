# Amsterdam catalogue and quotation workflow

Amsterdam uses native EUR supplier costs; Abu Dhabi keeps AED sample costs and its existing display conversions. Choose your city in Request. Drafts are stored separately by city in this browser. Templates explicitly reset current costs; saved versions and downloadable backups preserve earlier work.

## Public catalogue

`live-demos/assets/js/infraquote-amsterdam.js` contains 25 attractions and route records. 15 attractions have official public admission references reviewed on 8 October 2026. Remaining attraction prices are null, not free. Source review is not a booking, negotiated net agreement or live feed. Durations and inter-stop travel are editable planning estimates.

For each product: verify official ticket product and booking fees, exact age bands, opening exceptions, entry slots, group/guide policy, accessibility, cancellation/amendment terms and source URL. Record a new checked date only after reviewing the source. Unknown categories remain null. Public references older than 30 days prevent approval until refreshed. The operator can explicitly recheck the official product, age bands and prices and record today’s review on a stop; this does not confirm entry availability. Previously saved drafts are never silently repriced: Apply latest reference rates explicitly loads new catalogue values and clears availability/condition checks. Saved-version PDFs retain their captured document.

ARTIS entries use published counter prices rather than treating online “from” prices as guaranteed date prices. A’DAM LOOKOUT does not include swing/VR costs; under-four prices remain unknown. Rembrandt House youth and off-peak products need eligibility/date review. City passes do not automatically remove ticket costs: verify the exact pass and product, then enter the confirmed cost. Anne Frank exterior walks never include museum admission.

## Supplier costs and tax

Transport, guide, overtime, meals, parking, airport services and other paid extras need operator-entered EUR costs. Supplier book entries carry currency and validity dates. A different-currency rate cannot be applied. Use the exact generated item name to replace an existing allowance, rather than adding a duplicate. Keep negotiated net rates out of public GitHub data; local backups may contain private business data.

Amsterdam starts with tax treatment pending. Obtain the operator’s accountant-approved treatment. Standard exclusive/inclusive modes use 21% only when explicitly selected; no-VAT/outside-scope is explicit. Margin-scheme mode estimates VAT within the eligible travel margin and omits a separate VAT line in the client PDF, displaying “bijzondere regeling reisbureaus”. It models a single wholly eligible package, not mixed-service tax allocation or accounting compliance. Do not use margin mode for mixed/partly eligible services without a reviewed separate costing treatment.

## Operations and approval

Included tickets need prices, matching ages where bands apply, date-specific availability, entry time where required, reviewed terms and supplier cost confirmation. Date changes clear the relevant confirmation. Centre guided walks over 15 participants are blocked; above four need exemption confirmation. Review the permitted route and timing. Vehicle plans need capacity, legal stops/access and any required heavy-coach exemption. No automatic group splitting, bookings or access certification is provided.

Approved handovers carry country context into InfraDispatch. Netherlands handovers populate the Dutch planner without supplier costs, selling margin or client contact details. Confirm real transport capacity, staffing, routes and timing independently.

## Review cycle

Review fixed references monthly, date-variable/seasonal products more often, and every selected product before releasing a real quotation. Follow official changes; do not scrape booking systems aggressively or claim automatic live availability. Contacting suppliers is a separate user-authorized action. Maintain public rates in GitHub; company rates stay browser-local until an optional private backend is configured.

## First pilot

Test the four Amsterdam templates: highlights/cruise, museums/culture, family discovery, and private/corporate. Use fictional test enquiries first. Collect real supplier quotes and validate actual dates before commercial release. No paid hosting or API is required for the public browser workflow.

## Additional public references — 8 October 2026

Added Van Gogh, Hortus, Dutch Resistance Museum, Jewish Museum/Portuguese Synagogue duoticket, Eye exhibition and Foam standard admission. Prices and age bands link to official visitor or ticket pages in the catalogue. Discount-card eligibility is not assumed. The Jewish duoticket is distinct from the four-venue combiticket; Eye film tickets are separate products. Hortus uses the explicit Dutch age policy (through age four free), rather than the less precise English wording.

Heineken admission now blocks guests below 18, including accompanied minors, and requires all guest ages. Hortus blocks its published 1 January/25 December closures. These checks also cover client-paid admission. Heineken pricing remains pending: reviewing its age policy does not establish a current ticket price. Saved quotations keep their existing cost inputs; use the explicit public-reference refresh action to apply newly published bands.

## Date-dependent product review — 8 October 2026

Eight products retain blank automatic fares: Stedelijk, Moco, H’ART, Blue Boat, LOVERS, Stromma, THIS IS HOLLAND and Heineken. Seven have reviewed public product information; Stedelijk’s official page presents a browser verification challenge, so its pricing and policies remain pending. A product-information review date is separate from a verified admission-rate review date.

| Product | Official source | Reason an exact dated fare is still required |
| --- | --- | --- |
| Stedelijk | https://www.stedelijk.nl/en/visit | Official page could not be verified; confirm directly. |
| Moco | https://www.mocomuseum.com/amsterdam/tickets/ and https://tickets.mocomuseum.com/nl/tickets | Promotions/product types differ. The landing page says children up to four free; the Dutch booking portal says ages 0–6 free. Confirm the chosen product age categories. |
| H’ART | https://www.hartmuseum.nl/plan-je-bezoek/ | Current exhibition supplement is included in the displayed adult EUR 29.50 reference. Confirm the actual exhibition and visit date; closed 27 April. |
| Blue Boat | https://www.blueboat.nl/en/canal-cruise-amsterdam/canal-tour-amsterdam/ | Current promotion and tax-exclusive listings are not an all-in date-specific fare. Confirm checkout total and required charges. |
| LOVERS | https://www.lovers.nl/amsterdam-city-canal-cruises/1-h-amsterdam-day-canal-cruise/ | Exact departure fare pending; this classic product uses child ages 4–13 and its own eight-hour cancellation/reschedule window. |
| Stromma | https://www.stromma.com/en-nl/amsterdam/customer-service/faq/ | Seasonal/product-dependent from prices; confirm departure, category, fees and selected ticket conditions. |
| THIS IS HOLLAND | https://tickets.thisisholland.com/?lang=en and https://www.thisisholland.com/en/terms-and-conditions/ | Regular/advance/family fares differ; flight minimum age four, with height, accompaniment and safety requirements. |
| Heineken | https://www.heinekenexperience.com/en/discover-our-tours/heineken-tour and https://www.heinekenexperience.com/en/rescheduling-and-refund | Standard tour/offer/Rooftop/VIP/combinations differ. Strict 18+ admission; selected tour rebooking/refund terms require review. |

For included variable-price admission, enter the fare and a concise product/source or supplier reference, then explicitly confirm the service-date price and compulsory fees. Availability and conditions remain separate checks. Changing guests, ages, date, rate inputs or evidence clears the fare acknowledgement. Applying catalogue references clears it too. Client-paid admission skips this included-fare check but still requires conditions and age/access review. Keep evidence free of guest names, payment details or private credentials.

Validation used fictional enquiries, never real supplier bookings: highlights/cruise EUR 220 net / EUR 300 total; museums EUR 277 / EUR 380; family (two adults, children aged 10 and three) EUR 364.50 / EUR 500; corporate EUR 213 / EUR 295. These are test figures with a synthetic EUR 180 guide allowance, a synthetic EUR 20 cruise allowance, a 22% margin target and the margin-scheme test configuration; they are not recommended commercial prices or proof that this tax scheme applies to an operator. Browser checks covered all four templates, cleared fare acknowledgements after rate/date edits, and saved an approved corporate test snapshot after cost attestation. PDF inspection confirmed two readable pages, no internal guide cost, correct total and tax wording, and short sections kept together. New fields fit a 320px viewport and keyboard Tab reaches fare confirmation.
