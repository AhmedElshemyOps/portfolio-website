window.AHMED_SITE_CONFIG = {
  siteUrl: "https://ahmedqualityops.com",
  // GA4 loads only after the visitor grants analytics consent.
  gaMeasurementId: "G-45YNREM1LT",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  googleBusinessProfileUrl: "",
  googleSearchConsoleVerification: "Ii-YhK_VMy_iIZ9r_ifJZiXbk2NtNniOnJTZgCNkAl4",
  // Public Brevo form URL, not an API credential. Native POST works on GitHub Pages.
  newsletterFormUrl: "https://fc829cd5.sibforms.com/serve/MUIFAIzYXqWTSeQT59exjV6IelGSSTvAYfDkj0NCiVb4kxU79dN_MVoYWZpvjJzg4NIWSWaxgWjXfoD-UyL059P9kJOhMaM2jwBbBEX-NHrdXKcW8KabfV_gMUwG45scUABSuUqAeHdCAfXEQD9opdo9qrFbLR_YR_e57Fps7amXLyRdmViaQWeX95zCPXfk8fc6jgt5cBpmFh9imQ==",
  // Optional fallback for deployments that separately configure the Worker.
  newsletterEndpoint: "/api/newsletter/subscribe",
  analyticsDebug: false
};

(function registerOfflineReading() {
  "use strict";
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  if (["localhost", "127.0.0.1"].includes(location.hostname)) return;
  window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () { /* Online browsing remains available. */ }); }, { once: true });
}());
