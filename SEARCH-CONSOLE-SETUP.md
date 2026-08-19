# Google Search Console Setup

## Recommended Verification

Use DNS verification when possible. It verifies the full domain and avoids editing HTML for every deployment.

## HTML Meta Verification Option

`index.html` includes this placeholder:

```html
<meta name="google-site-verification" content="ADD_GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN"/>
```

Replace only the placeholder value with the token Google provides. Do not leave multiple verification tags.

## Sitemap Submission

After deployment, submit:

```text
https://ahmedqualityops.com/sitemap.xml
```

## Crawl Files

- `robots.txt` allows all public pages and points to the sitemap.
- `sitemap.xml` lists canonical launch pages, project pages, article pages, privacy/cookie pages and `llms.txt`.
- `llms.txt` and `llms.md` help AI and retrieval systems understand the site structure.

## First Checks After Launch

- URL inspection for `/`, `/projects.html`, `/articles.html`, `/infradispatch/`, `/infrasky.html`, `/infraquote.html`.
- Confirm sitemap status is `Success`.
- Confirm canonical URLs match the intended production domain.
- Check Page indexing after 48-72 hours.
