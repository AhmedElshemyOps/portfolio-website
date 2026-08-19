# Schema Documentation

## Implemented Schema Types

### Home

- `Person`
- `WebSite`
- `ProfessionalService`

Purpose: connect Ahmed Mahmoud, the portfolio domain, Abu Dhabi tourism operations expertise and professional service positioning.

### Projects

- `CollectionPage`
- Nested `SoftwareApplication` references for InfraDispatch, InfraSky and InfraQuote

Purpose: show that the Projects page groups multiple product/work samples.

### Articles

- `CollectionPage`

Purpose: identify the Insights Library as a curated collection of preserved articles.

### Project Pages

- `SoftwareApplication`

Used for:

- InfraDispatch
- InfraSky
- InfraQuote

Purpose: identify each project as a web-based static application/demo while avoiding overclaiming backend production status.

### Experience

- `ProfilePage`
- `Person`

Purpose: connect the background page to Ahmed Mahmoud as the main entity.

## Testing Tools

Use:

- Google Rich Results Test
- Schema.org Validator
- Google Search Console URL Inspection

## Maintenance Rule

If a project later becomes a real production SaaS product, update schema and on-page copy at the same time. Do not change schema alone to imply production status.
