(function newsletterModule() {
  "use strict";
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var analytics = function (name, params) { window.AhmedAnalytics?.event(name, params || {}); };
  function setupNewsletterForms() { document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
    if (form.dataset.newsletterReady === "true") return;
    form.dataset.newsletterReady = "true";
    if (form.elements.startedAt) form.elements.startedAt.value = String(Date.now());
    var email = form.elements.email;
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector("[data-newsletter-status]");
    function setStatus(message, kind) {
      status.textContent = message;
      status.classList.toggle("is-error", kind === "error");
      status.classList.toggle("is-success", kind === "success");
      status.setAttribute("role", kind === "error" ? "alert" : "status");
      email.setAttribute("aria-invalid", String(kind === "error"));
    }
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var value = email.value.trim();
      if (!value) { setStatus("Enter your email address to subscribe.", "error"); email.focus(); return; }
      if (!emailPattern.test(value)) { setStatus("Enter a valid email address, such as name@example.com.", "error"); email.focus(); return; }
      button.disabled = true;
      form.setAttribute("aria-busy", "true");
      button.textContent = "Subscribing…";
      setStatus("Submitting your request…");
      try {
        var endpoint = window.AHMED_SITE_CONFIG?.newsletterEndpoint || "/api/newsletter/subscribe";
        var response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: value, company: form.elements.company?.value || "", startedAt: Number(form.elements.startedAt?.value || 0), source: window.location.pathname }) });
        var payload = await response.json().catch(function () { return {}; });
        if (response.ok) {
          setStatus(payload.message || "Check your inbox and confirm your subscription.", "success");
          email.value = "";
          analytics("newsletter_signup_completed", { signup_location: window.location.pathname });
        } else if (response.status === 429) {
          setStatus("Too many attempts. Please wait a moment and try again.", "error");
        } else {
          setStatus(payload.message || "Subscription is temporarily unavailable. Please try again later.", "error");
        }
      } catch (_error) {
        setStatus("We could not connect. Check your connection and try again.", "error");
      } finally {
        button.disabled = false;
        form.removeAttribute("aria-busy");
        button.textContent = "Subscribe";
      }
    });
  }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupNewsletterForms, { once: true }); else setupNewsletterForms();
}());
