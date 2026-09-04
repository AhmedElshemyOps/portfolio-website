window.AHMED_SITE_CONFIG = {
  siteUrl: "https://ahmedqualityops.com",
  // GA4 loads only after the visitor grants analytics consent.
  gaMeasurementId: "G-45YNREM1LT",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  googleBusinessProfileUrl: "",
  googleSearchConsoleVerification: "",
  // For GitHub Pages, set this to a separately deployed HTTPS Worker endpoint.
  newsletterEndpoint: "/api/newsletter/subscribe",
  analyticsDebug: false
};

(function setupStaticNavigation() {
  "use strict";
  var header = document.querySelector(".masthead");
  var nav = header?.querySelector("nav");
  if (!header || !nav || header.querySelector(".static-menu-toggle")) return;
  if (!nav.id) nav.id = "static-primary-navigation";
  var button = document.createElement("button");
  button.type = "button";
  button.className = "static-menu-toggle";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", nav.id);
  button.innerHTML = '<span aria-hidden="true">☰</span><span>Menu</span>';
  header.insertBefore(button, nav);

  function closeMenu(restoreFocus) {
    nav.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.querySelector("span:first-child").textContent = "☰";
    button.querySelector("span:last-child").textContent = "Menu";
    document.body.classList.remove("static-menu-open");
    if (restoreFocus) button.focus();
  }
  button.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.querySelector("span:first-child").textContent = open ? "×" : "☰";
    button.querySelector("span:last-child").textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("static-menu-open", open);
    if (open) window.setTimeout(function () { nav.querySelector("a,button")?.focus(); }, 0);
  });
  nav.addEventListener("click", function (event) { if (event.target.closest("a")) closeMenu(false); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true); });
  window.addEventListener("resize", function () { if (window.innerWidth > 760) closeMenu(false); }, { passive: true });
}());

(function registerOfflineReading() {
  "use strict";
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  if (["localhost", "127.0.0.1"].includes(location.hostname)) return;
  window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () { /* Online browsing remains available. */ }); }, { once: true });
}());
