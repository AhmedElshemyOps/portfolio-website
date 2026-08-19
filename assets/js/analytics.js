(function () {
  "use strict";

  var config = window.AHMED_SITE_CONFIG || {};
  var measurementId = (config.gaMeasurementId || "").trim();
  var hasValidGaId = /^G-[A-Z0-9]+$/i.test(measurementId);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function sendEvent(name, params) {
    if (!hasValidGaId || typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  }

  function injectGtag() {
    if (!hasValidGaId || document.querySelector('script[data-ahmed-gtag="true"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    script.dataset.ahmedGtag = "true";
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  function classifyLink(anchor) {
    var href = anchor.getAttribute("href") || "";
    var label = (anchor.textContent || anchor.getAttribute("aria-label") || "").trim().slice(0, 120);
    var absoluteUrl;

    try {
      absoluteUrl = new URL(href, window.location.href);
    } catch (error) {
      return null;
    }

    var path = absoluteUrl.pathname.toLowerCase();
    var host = absoluteUrl.hostname.toLowerCase();
    var base = {
      link_url: absoluteUrl.href,
      link_text: label,
      page_path: window.location.pathname
    };

    if (href.indexOf("mailto:") === 0) return ["email_click", base];
    if (href.indexOf("tel:") === 0) return ["phone_click", base];
    if (/wa\.me|whatsapp/.test(host + path)) return ["whatsapp_click", base];
    if (/linkedin\.com/.test(host)) return ["linkedin_click", base];
    if (path.endsWith(".pdf") || anchor.hasAttribute("download")) return ["file_download", base];
    if (/article-|articles\.html|insights-city-tour/.test(path)) return ["article_click", base];
    if (/projects\.html|infradispatch|infrasky|infraquote|pickup-planner|pickup-dropoff-planner/.test(path)) {
      return ["project_click", base];
    }
    if (absoluteUrl.origin !== window.location.origin && !href.startsWith("#")) return ["outbound_click", base];
    return null;
  }

  function bindLinkTracking() {
    document.addEventListener("click", function (event) {
      var anchor = event.target.closest && event.target.closest("a[href]");
      if (!anchor) return;
      var tracked = classifyLink(anchor);
      if (!tracked) return;
      sendEvent(tracked[0], tracked[1]);
    });
  }

  injectGtag();
  bindLinkTracking();

  window.AhmedAnalytics = {
    enabled: hasValidGaId,
    event: sendEvent
  };
}());
