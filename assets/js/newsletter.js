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
    var hostedUrl = window.AHMED_SITE_CONFIG?.newsletterFormUrl;
    if (hostedUrl) {
      var parsedUrl = new URL(hostedUrl);
      if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "fc829cd5.sibforms.com") hostedUrl = null;
    }
    if (hostedUrl) {
      var help = document.createElement("p");
      help.className = "newsletter-consent";
      help.id = "newsletter-help-" + email.id;
      help.append("Submit securely with Brevo, then confirm by email. ");
      var fallback = document.createElement("a");
      fallback.href = hostedUrl;
      fallback.textContent = "Open signup form";
      help.append(fallback);
      form.insertBefore(help, status);
      email.setAttribute("aria-describedby", help.id);
      button.textContent = "Join the brief";
      window.addEventListener("pageshow", function () {
        button.disabled = false;
        button.textContent = "Join the brief";
        form.removeAttribute("aria-busy");
        status.textContent = "";
      });
    }
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
      if (hostedUrl) {
        // Use Brevo's public HTML-form contract, not its secret-key API.
        // POST keeps the email out of URLs, history and analytics parameters.
        var submission = document.createElement("form");
        submission.method = "POST";
        submission.action = hostedUrl;
        submission.hidden = true;
        Object.entries({ EMAIL: value, email_address_check: form.elements.company?.value || "", locale: "en" }).forEach(function (entry) {
          var input = document.createElement("input");
          input.type = "hidden";
          input.name = entry[0];
          input.value = entry[1];
          submission.append(input);
        });
        document.body.append(submission);
        setStatus("Opening Brevo securely. Confirm your subscription using the email it sends.");
        analytics("newsletter_signup_started", { signup_location: window.location.pathname });
        submission.submit();
        submission.remove();
        return;
      }
      button.disabled = true;
      form.setAttribute("aria-busy", "true");
      button.textContent = "Subscribing…";
      setStatus("Submitting your request…");
      try {
        var endpoint = window.AHMED_SITE_CONFIG?.newsletterEndpoint || "/api/newsletter/subscribe";
        var response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(15000), headers: { "content-type": "application/json" }, body: JSON.stringify({ email: value, company: form.elements.company?.value || "", startedAt: Number(form.elements.startedAt?.value || 0), source: window.location.pathname }) });
        var payload = await response.json().catch(function () { return {}; });
        if (response.ok && response.headers.get("content-type")?.includes("application/json") && typeof payload.message === "string") {
          setStatus(payload.message || "Check your inbox and confirm your subscription.", "success");
          email.value = "";
          analytics("newsletter_signup_completed", { signup_location: window.location.pathname });
        } else if (response.status === 404 || response.status === 405 || !response.headers.get("content-type")?.includes("application/json")) {
          setStatus("Newsletter signup is not connected yet. No subscription has been created. Please check back later.", "error");
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
  // React may mount the homepage after this shared script has loaded.
  new MutationObserver(function (records) {
    if (records.some(function (record) {
      return Array.from(record.addedNodes).some(function (node) {
        return node.nodeType === 1 && (node.matches("[data-newsletter-form]") || node.querySelector("[data-newsletter-form]"));
      });
    })) setupNewsletterForms();
  }).observe(document.documentElement, { childList: true, subtree: true });
}());
