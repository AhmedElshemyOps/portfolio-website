# Analytics Setup

## Current Status

Analytics is prepared but inactive by default. No fake GA4 ID is shipped in the central configuration.

Configuration file:

```js
assets/js/site-config.js
```

Default:

```js
window.AHMED_SITE_CONFIG = {
  siteUrl: "https://ahmedqualityops.com",
  gaMeasurementId: "",
  googleSearchConsoleVerification: "",
  analyticsDebug: false
};
```

## How to Enable GA4

1. Create or open the correct Google Analytics 4 property.
2. Copy the Measurement ID. It should look like `G-XXXXXXXXXX`.
3. Open `assets/js/site-config.js`.
4. Paste the ID into `gaMeasurementId`.
5. Deploy the file.
6. Open the live website and confirm the pageview in GA4 Realtime.

## Events Prepared

The central analytics script tracks these interactions when a valid GA4 ID exists:

- `email_click`
- `phone_click`
- `whatsapp_click`
- `linkedin_click`
- `file_download`
- `article_click`
- `project_click`
- `outbound_click`

Each event includes available link URL, link text and page path.

## Privacy Note

Until a real GA4 ID is added, the script does not inject Google Analytics and does not send analytics data.
