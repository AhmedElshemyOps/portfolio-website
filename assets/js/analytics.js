(function () {
  "use strict";

  var config = window.AHMED_SITE_CONFIG || {};
  var measurementId = (config.gaMeasurementId || "").trim();
  var hasValidGaId = /^G-[A-Z0-9]+$/i.test(measurementId);
  var googleAdsId = (config.googleAdsId || "").trim();
  var adsConversionLabel = (config.googleAdsConversionLabel || "").trim();
  var hasValidAdsId = /^AW-[0-9]+$/i.test(googleAdsId);
  var consentKey = "ahmed_analytics_consent_v1";
  var consent = "unset";
  try { consent = window.localStorage.getItem(consentKey) || "unset"; } catch (_error) { consent = "unset"; }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });

  function sendEvent(name, params) {
    if (consent !== "granted" || (!hasValidGaId && !hasValidAdsId) || typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  }

  function cleanUrl(value) {
    try { var url = new URL(value, window.location.origin); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : url.protocol; }
    catch (_error) { return ""; }
  }

  function injectGtag() {
    if ((!hasValidGaId && !hasValidAdsId) || document.querySelector('script[data-ahmed-gtag="true"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(hasValidGaId ? measurementId : googleAdsId);
    script.dataset.ahmedGtag = "true";
    document.head.appendChild(script);
    window.gtag("js", new Date());
    if (hasValidGaId) window.gtag("config", measurementId, {
      page_title: document.title,
      page_location: cleanUrl(window.location.href),
      page_referrer: cleanUrl(document.referrer),
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      anonymize_ip: true
    });
    if (hasValidAdsId) window.gtag("config", googleAdsId);
    trackPageView();
  }

  function trackPageView() {
    if (!hasValidGaId || consent !== "granted") return;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: cleanUrl(window.location.href),
      page_referrer: cleanUrl(document.referrer),
      page_path: window.location.pathname
    });
  }

  function trackDiscoverySource() {
    if (!document.referrer) return;
    var referrer = "";
    try { referrer = new URL(document.referrer).hostname.toLowerCase(); } catch (_error) { return; }
    var aiSource = ["chatgpt.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"].find(function (host) { return referrer === host || referrer.endsWith("." + host); });
    if (aiSource) sendEvent("ai_referral", { referral_source: aiSource, landing_page: window.location.pathname });
  }

  function trackWebVitals() {
    if (!("PerformanceObserver" in window)) return;
    var cls = 0;
    try {
      new PerformanceObserver(function (list) { list.getEntries().forEach(function (entry) { if (!entry.hadRecentInput) cls += entry.value; }); }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver(function (list) { var entries = list.getEntries(); var last = entries[entries.length - 1]; if (last) window.__ahmedLcp = last.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(function (list) { var longest = Math.max.apply(null, list.getEntries().map(function (entry) { return entry.duration || 0; })); if (Number.isFinite(longest) && longest > (window.__ahmedInp || 0)) window.__ahmedInp = longest; }).observe({ type: "event", buffered: true, durationThreshold: 40 });
    } catch (_error) { /* unsupported entry types are ignored */ }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "hidden") return;
      sendEvent("web_vitals", { lcp_ms: Math.round(window.__ahmedLcp || 0), cls: Number(cls.toFixed(4)), inp_ms: Math.round(window.__ahmedInp || 0), page_path: window.location.pathname });
    }, { once: true });
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
      link_url: cleanUrl(absoluteUrl.href),
      link_text: /^(mailto:|tel:)/.test(href) ? "Contact" : label,
      page_path: window.location.pathname
    };

    if (href.indexOf("mailto:") === 0) return ["email_click", base];
    if (href.indexOf("tel:") === 0) return ["phone_click", base];
    if (/wa\.me|whatsapp/.test(host + path)) return ["whatsapp_click", base];
    if (/linkedin\.com/.test(host)) return ["linkedin_click", base];
    if (path.endsWith(".pdf") || anchor.hasAttribute("download")) return ["file_download", base];
    if (/\/articles\/|article-|articles\.html|insights-city-tour/.test(path)) return ["article_click", base];
    if (/projects\.html|infradispatch|infrasky|infraquote|pickup-planner|pickup-dropoff-planner/.test(path)) {
      return ["project_click", base];
    }
    if (absoluteUrl.origin !== window.location.origin && !href.startsWith("#")) return ["outbound_click", base];
    return null;
  }

  function bindLinkTracking() {
    document.addEventListener("click", function (event) {
      var customTarget = event.target.closest && event.target.closest("[data-analytics-event]");
      if (customTarget) sendEvent(customTarget.dataset.analyticsEvent, {
        item_label: (customTarget.textContent || customTarget.getAttribute("aria-label") || "").trim().slice(0, 120),
        page_path: window.location.pathname + window.location.hash
      });
      if (customTarget && customTarget.closest("a[href]")) return;
      var anchor = event.target.closest && event.target.closest("a[href]");
      if (!anchor) return;
      var tracked = classifyLink(anchor);
      if (!tracked) return;
      sendEvent(tracked[0], tracked[1]);
      if (tracked[0] === "email_click" && hasValidAdsId && adsConversionLabel) {
        window.gtag("event", "conversion", { send_to: googleAdsId + "/" + adsConversionLabel });
      }
    });
  }

  function bindReaderTracking() {
    var sentDepths = {};
    window.addEventListener("scroll", function () {
      if (consent !== "granted" || !document.querySelector(".article-reader-page, .article-page, .reader-shell")) return;
      var total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var depth = Math.round((window.scrollY / total) * 100);
      [25, 50, 75, 90].forEach(function (threshold) {
        if (depth >= threshold && !sentDepths[threshold]) {
          sentDepths[threshold] = true;
          sendEvent("article_scroll_depth", { percent_scrolled: threshold, page_path: window.location.pathname });
          if (threshold === 75) sendEvent("article_read_75", { page_path: window.location.pathname });
        }
      });
    }, { passive: true });
    document.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("[data-back-to-top]")) sendEvent("article_back_to_top", { page_path: window.location.pathname });
      if (event.target.closest && event.target.closest("[data-copy-target]")) sendEvent("ai_prompt_copy", { page_path: window.location.pathname });
    });
  }

  function saveConsent(value) {
    consent = value;
    try { window.localStorage.setItem(consentKey, value); } catch (_error) { /* storage can be unavailable */ }
  }

  function createConsentBanner() {
    if (!hasValidGaId || consent !== "unset" || document.querySelector("[data-analytics-consent]")) return;
    var style = document.createElement("style");
    style.textContent = ".analytics-consent{position:fixed;z-index:9999;left:18px;right:18px;bottom:18px;max-width:780px;margin:auto;padding:18px 20px;display:grid;grid-template-columns:1fr auto;gap:16px 22px;align-items:center;border:1px solid #b68a2f;background:#071a32;color:#fff;box-shadow:0 20px 55px rgba(7,26,50,.3);font-family:Arial,sans-serif}.analytics-consent strong{display:block;margin-bottom:5px;font-family:Georgia,serif}.analytics-consent p{margin:0;color:#c7d2df;font-size:12px;line-height:1.55}.analytics-consent a{color:#dfc27d}.analytics-consent-actions{display:flex;gap:8px}.analytics-consent button{min-height:42px;padding:8px 12px;border:1px solid #dfc27d;background:transparent;color:#fff;font-weight:700;cursor:pointer}.analytics-consent button[data-consent=granted]{background:#dfc27d;color:#071a32}@media(max-width:650px){.analytics-consent{grid-template-columns:1fr}.analytics-consent-actions{display:grid;grid-template-columns:1fr 1fr}.analytics-consent button{width:100%}}";
    document.head.appendChild(style);
    var banner = document.createElement("aside");
    banner.className = "analytics-consent";
    banner.dataset.analyticsConsent = "";
    banner.setAttribute("aria-label", "Analytics preference");
    banner.innerHTML = '<div><strong>Privacy-respectful analytics</strong><p>With permission, this site measures anonymous page visits, downloads and interactions. It does not intentionally send names, emails, certificate numbers or prompt content to Google Analytics. <a href="/privacy/index.html">Privacy details</a>.</p></div><div class="analytics-consent-actions"><button type="button" data-consent="denied">Only necessary</button><button type="button" data-consent="granted">Allow analytics</button></div>';
    banner.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-consent]");
      if (!button) return;
      var value = button.dataset.consent;
      saveConsent(value);
      window.gtag("consent", "update", {
        analytics_storage: value,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      banner.remove();
      if (value === "granted") { injectGtag(); trackDiscoverySource(); }
      window.AhmedAnalytics.enabled = hasValidGaId && value === "granted";
      window.AhmedAnalytics.consent = value;
    });
    document.body.appendChild(banner);
  }

  function addPrivacyControl() {
    if (!hasValidGaId || !window.location.pathname.startsWith('/privacy/')) return;
    var main = document.querySelector('main');
    if (!main) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Change analytics preference';
    button.style.cssText = 'min-height:44px;padding:12px 18px;background:#071a32;color:#fff;border:1px solid #b68a2f;cursor:pointer';
    button.addEventListener('click', function () {
      saveConsent('unset');
      window.location.reload();
    });
    main.appendChild(button);
  }

  bindLinkTracking();
  bindReaderTracking();
  trackWebVitals();
  addPrivacyControl();
  if (consent === "granted") {
    window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    injectGtag();
    trackDiscoverySource();
  } else createConsentBanner();
  // In-page heading navigation is not a new page view.

  window.AhmedAnalytics = {
    configured: hasValidGaId,
    enabled: hasValidGaId && consent === "granted",
    consent: consent,
    adsEnabled: hasValidAdsId && consent === "granted",
    event: sendEvent
  };
}());
