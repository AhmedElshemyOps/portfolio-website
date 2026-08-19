# InfraQuote Maintenance Guide

InfraQuote is a static frontend MVP. It uses editable demo data and browser local storage. Real supplier rates, official ticket policies, finance policy, approval workflow, and backend persistence must be added before production use.

## Main files

- `infraquote.html` - application route and workflow layout.
- `assets/css/infraquote.css` - scoped InfraQuote styles.
- `assets/js/infraquote-data.js` - editable seed data, attraction catalogue, vehicles, guide rates, and default terms.
- `assets/js/infraquote-calculations.js` - pricing, margin, VAT, break-even, vehicle recommendation, and readiness logic.
- `assets/js/infraquote-app.js` - UI state, local storage, rendering, exports, and workflow behavior.

## Add a new attraction

Edit `assets/js/infraquote-data.js` under `cities.abuDhabi.attractions`.

Required fields:

- `id`
- `name`
- `type`
- `defaultDuration`
- `ticketRequired`
- `verification`
- `adult`
- `child`
- `infant`
- `note`

Use `Pending verification` when prices or access rules are not confirmed. Do not present sample prices as official live rates.

## Add a new vehicle

Edit `assets/js/infraquote-data.js` under `vehicles`.

Required fields:

- `id`
- `name`
- `maxGuests`
- `comfortGuests`
- `luggage`
- `baseCost`
- `includedHours`
- `overtimeRate`
- `driverIncluded`
- `notes`

Vehicle recommendation uses `comfortGuests` when the service is VIP or luggage is required.

## Add a new guide language

Edit `assets/js/infraquote-data.js` under `guideRates`.

Required fields:

- `language`
- `halfDay`
- `fullDay`
- `premium`

Use `0` for unknown rates and keep the line pending verification.

## Add a new city

Add a new object under `cities` in `assets/js/infraquote-data.js`.

Recommended fields:

- `code`
- `name`
- `sampleNotice`
- `attractions`

Then update the app UI if city selection becomes public. The current MVP starts with Abu Dhabi only.

## Add a new quotation template

Default wording lives in `defaultTerms` inside `assets/js/infraquote-data.js`.

Client quotation rendering lives in `clientText()` and `renderClientQuote()` inside `assets/js/infraquote-app.js`.

Keep internal worksheet details separate from client quotation output.
