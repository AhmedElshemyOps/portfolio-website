# Performance Optimization Notes

## Implemented

- Analytics is lazy-injected only when a valid GA4 ID exists.
- No hard-coded GA4 snippets remain in launch pages.
- Static hosting compatibility is preserved.
- Existing CSS/JS files remain local and cacheable.
- `site.webmanifest` and favicon assets are configured.

## Recommended Hosting Headers

If the hosting platform allows headers, use:

```text
Cache-Control: public, max-age=31536000, immutable
```

for versioned assets, images, CSS and JS.

Use shorter cache for HTML:

```text
Cache-Control: public, max-age=3600
```

## Image Recommendations

- Keep profile and project images under 200 KB where possible.
- Use WebP versions for future uploads when the hosting workflow supports it.
- Keep meaningful `alt` text for portfolio images.

## Security and Privacy Readiness

Recommended headers if the host supports them:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Content Security Policy should be tested carefully before enforcement because the site uses multiple local scripts and optional Google Analytics.

## Lighthouse Targets

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

Run Lighthouse after the final domain deploy because local `file://` testing does not reflect production network behavior.
