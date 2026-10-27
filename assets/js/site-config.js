window.AHMED_SITE_CONFIG = {
  siteUrl: "https://ahmedqualityops.com",
  // GA4 loads only after the visitor grants analytics consent.
  gaMeasurementId: "G-45YNREM1LT",
  analyticsAllowedHosts: ["ahmedqualityops.com"],
  // Ownership verification is live; ad serving stays off until site approval.
  adsensePublisherId: "ca-pub-5767638342262338",
  adsenseEnabled: false,
  googleAdsId: "",
  googleAdsConversionLabel: "",
  googleBusinessProfileUrl: "",
  googleSearchConsoleVerification: "Ii-YhK_VMy_iIZ9r_ifJZiXbk2NtNniOnJTZgCNkAl4",
  analyticsDebug: false
};

(function registerOfflineReading() {
  "use strict";
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  if (["localhost", "127.0.0.1"].includes(location.hostname)) return;
  let hadController = Boolean(navigator.serviceWorker.controller);
  let notice;
  function showUpdate() {
    if (notice) return;
    notice = document.createElement("aside");
    notice.className = "site-update-notice";
    notice.setAttribute("aria-label", "Website update");
    notice.innerHTML = '<p role="status">A newer website version is ready. Saved quotation drafts stay on this device.</p><button type="button" data-update-refresh>Refresh now</button><button type="button" data-update-dismiss aria-label="Dismiss update notice">Later</button>';
    notice.querySelector("[data-update-refresh]").addEventListener("click", function () { location.reload(); });
    notice.querySelector("[data-update-dismiss]").addEventListener("click", function () { notice.remove(); });
    document.body.appendChild(notice);
  }
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (hadController) showUpdate();
    hadController = true;
  });
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then(function (registration) {
      registration.update().catch(function () { /* Existing offline reading remains available. */ });
    }).catch(function () { /* Online browsing remains available. */ });
  }, { once: true });
}());
