(function () {
  "use strict";
  var form = document.querySelector("[data-utm-builder]");
  var output = document.querySelector("[data-utm-result]");
  var copy = document.querySelector("[data-utm-copy]");
  var status = document.querySelector("[data-utm-status]");
  if (!form || !output || !copy || !status) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      var data = new FormData(form);
      var url = new URL(String(data.get("url")));
      [["utm_source", "source"], ["utm_medium", "medium"], ["utm_campaign", "campaign"], ["utm_content", "content"]].forEach(function (pair) {
        var value = String(data.get(pair[1]) || "").trim().toLowerCase().replace(/\s+/g, "_");
        if (value) url.searchParams.set(pair[0], value); else url.searchParams.delete(pair[0]);
      });
      output.value = url.href;
      copy.disabled = false;
      status.textContent = "Campaign URL ready.";
      window.AhmedAnalytics?.event("utm_url_built", { campaign_source: url.searchParams.get("utm_source"), campaign_medium: url.searchParams.get("utm_medium") });
    } catch (_error) {
      output.value = "";
      copy.disabled = true;
      status.textContent = "Enter a complete destination URL, including https://.";
    }
  });
  copy.addEventListener("click", async function () {
    if (!output.value) return;
    try { await navigator.clipboard.writeText(output.value); status.textContent = "Campaign URL copied."; }
    catch (_error) { output.focus(); output.select(); status.textContent = "Copy the selected URL."; }
  });
}());
