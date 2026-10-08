/* Local-first quotation tools. No client data or supplier rates are sent to a server. */
(function (root) {
  "use strict";
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const safe = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function extract(text) {
    const proposal = {};
    const date = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (
      date &&
      !Number.isNaN(Date.parse(date[1])) &&
      new Date(date[1]).toISOString().slice(0, 10) === date[1]
    )
      proposal.serviceDate = date[1];
    const adults = text.match(/\b(\d+)\s*adults?\b/i),
      children = text.match(/\b(\d+)\s*(children|child|kids?)\b/i),
      infants = text.match(/\b(\d+)\s*infants?\b/i),
      guests = text.match(/\b(\d+)\s*(guests?|people|pax|persons?)\b/i);
    if (adults) proposal.adults = Number(adults[1]);
    else if (guests && !/\b(children|child|kids?|infants?)\b/i.test(text))
      proposal.adults = Number(guests[1]);
    if (children) proposal.children = Number(children[1]);
    if (infants) proposal.infants = Number(infants[1]);
    if (/full[ -]day/i.test(text)) proposal.tourDuration = "Full day";
    else if (/half[ -]day/i.test(text)) proposal.tourDuration = "Half day";
    const custom = text.match(/\b(\d+(?:\.\d+)?)\s*hours?\b/i);
    if (custom && !proposal.tourDuration) {
      proposal.tourDuration = "Custom";
      proposal.customHours = Number(custom[1]);
    }
    ["Arabic", "English", "French", "Russian", "Dutch"].forEach((language) => {
      if (new RegExp("\\b" + language + "\\b", "i").test(text))
        proposal.guideLanguage = language;
    });
    const pickup = text.match(
      /(?:pickup|pick-up)\s*(?:at|from|:)\s*([^\n;]+)/i,
    );
    if (pickup) proposal.pickupLocation = pickup[1].trim();
    const dropoff = text.match(
      /(?:dropoff|drop-off)\s*(?:at|to|:)\s*([^\n;]+)/i,
    );
    if (dropoff) proposal.dropoffLocation = dropoff[1].trim();
    const name = text.match(/(?:client|company)\s*:\s*([^\n;]+)/i);
    if (name) proposal.clientCompany = name[1].trim();
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (email) proposal.clientEmail = email[0];
    return proposal;
  }
  function changes(before, after) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter(
        (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
      )
      .map((key) => ({ field: key, before: before[key], after: after[key] }));
  }
  function usableRate(rate, date) {
    return (
      Number.isFinite(Number(rate.unitCost)) &&
      Number(rate.unitCost) >= 0 &&
      !!rate.validFrom &&
      !!rate.validTo &&
      rate.validFrom <= date &&
      date <= rate.validTo &&
      rate.verified === true
    );
  }
  function validQuote(q) {
    return (
      q &&
      typeof q === "object" &&
      typeof q.quoteNo === "string" &&
      Array.isArray(q.itinerary) &&
      q.itinerary.every((s) => s && typeof s.name === "string") &&
      Array.isArray(q.costs) &&
      q.costs.every(
        (c) =>
          c &&
          typeof c.name === "string" &&
          Number.isFinite(Number(c.unitCost)) &&
          Number.isFinite(Number(c.quantity)),
      )
    );
  }
  function validBackup(value) {
    const w = value?.workspace;
    return (
      value?.format === "infraquote-backup-v1" &&
      validQuote(value.draft) &&
      w &&
      ["templates", "versions", "rates", "metrics"].every((k) =>
        Array.isArray(w[k]),
      ) &&
      w.templates.length <= 30 &&
      w.versions.length <= 50 &&
      w.rates.length <= 100 &&
      w.metrics.length <= 200 &&
      w.templates.every(
        (t) =>
          typeof t.name === "string" && t.setup && typeof t.setup === "object",
      ) &&
      w.versions.every(
        (v) =>
          validQuote(v.quote) &&
          Number.isInteger(v.number) &&
          v.number > 0 &&
          Number.isFinite(v.total),
      ) &&
      w.rates.every(
        (r) =>
          typeof r.name === "string" &&
          Number.isFinite(Number(r.unitCost)) &&
          Number(r.unitCost) >= 0 &&
          Number(r.quantity) > 0 &&
          typeof r.validFrom === "string" &&
          typeof r.validTo === "string",
      )
    );
  }
  const helpers = { extract, changes, usableRate, validBackup };
  if (typeof module !== "undefined" && module.exports) module.exports = helpers;
  if (!root.document) return;
  const $ = (id) => document.getElementById(id),
    API = () => root.INFRAQUOTE_WORKFLOW;
  const KEY = "infraquote_workspace_v1";
  let store,
    proposal = {},
    last = null,
    comparison = null,
    editingRate = null;
  const startedAt = Date.now();
  const humanize = (value) =>
    String(value)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase());
  const defaults = {
    company: "",
    contact: "",
    preparedBy: "",
    targetMargin: 22,
    handlingFee: 250,
    cancellation: "",
  };
  function load() {
    try {
      store = JSON.parse(localStorage.getItem(KEY) || "null") || {};
    } catch (_) {
      store = {};
    }
    store = {
      settings: defaults,
      templates: [],
      versions: [],
      rates: [],
      metrics: [],
      ...store,
    };
    store.settings = { ...defaults, ...store.settings };
  }
  let persistBlocked = false,
    pendingMessage = "";
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      persistBlocked = false;
      return true;
    } catch (_) {
      persistBlocked = true;
      status("Keep this session open and download a backup before leaving.");
      return false;
    }
  }
  function status(message) {
    pendingMessage =
      (persistBlocked
        ? "This session only: browser storage is unavailable. "
        : "") + message;
    if ($("workspaceStatus")) $("workspaceStatus").textContent = pendingMessage;
    const badge = document.querySelector(".workspace-local");
    if (badge)
      badge.textContent = persistBlocked
        ? "Session only · backup needed"
        : "Saved on this device";
  }
  function download(name, value) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function record(event) {
    store.metrics.push({
      event,
      reference: API()?.get().quoteNo || "",
      at: new Date().toISOString(),
      sessionElapsedMs: Date.now() - startedAt,
    });
    store.metrics = store.metrics.slice(-200);
    persist();
  }
  function labelled(label, id, type = "text", value = "") {
    return `<label>${label}<input id="${id}" type="${type}" value="${safe(value)}"></label>`;
  }
  function render() {
    const cloud = document.querySelector(".cloud-workspace");
    if (cloud) cloud.remove();
    const s = store.settings;
    $("workflowTools").innerHTML =
      `<section class="workflow-tools" aria-labelledby="workspaceHeading"><div class="workflow-heading"><div><span class="eyebrow">Your quotation workspace</span><h2 id="workspaceHeading">Less repetition. Clearer decisions.</h2></div><span class="workspace-local">${persistBlocked ? "Session only · backup needed" : "Saved on this device"}</span></div><p>Request → Build &amp; price → Review &amp; share. Your existing draft is preserved.</p><p id="workspaceStatus" role="status" aria-live="polite">${safe(pendingMessage)}</p>
    <details><summary>Start from an enquiry or a saved tour</summary><div class="tool-content"><label>Paste the enquiry<textarea id="enquiryText" rows="4" placeholder="Client: Example Travel&#10;2026-11-15, 6 adults, full day, French guide&#10;Pickup: Abu Dhabi hotel"></textarea></label><p class="quote-note">Local extraction finds explicit details only. Review suggestions before applying; ambiguous details stay unchanged.</p><button type="button" class="btn secondary" id="extractEnquiry">Find request details</button><div id="enquiryProposal"></div><div class="tool-row"><label>Saved tour<select id="savedTour"><option value="">Choose a template</option>${store.templates.map((t, i) => `<option value="${i}">${safe(t.name)}</option>`).join("")}</select></label><button class="btn secondary" id="applyTour" type="button">Apply tour template</button></div><div class="tool-row">${labelled("Template name", "templateName")}<button class="btn secondary" id="saveTour" type="button">Save current tour as template</button></div><p class="quote-note">Templates reuse the itinerary and service setup, keeping the current client, dates and quotation reference. Rates still need checking.</p></div></details>
    <details><summary>Company defaults and quotation identity</summary><div class="tool-content"><div class="form-grid">${labelled("Company name", "defaultCompany", "text", s.company)}${labelled("Contact shown on client quotation", "defaultContact", "text", s.contact)}${labelled("Prepared by", "defaultPreparedBy", "text", s.preparedBy)}${labelled("Target margin %", "defaultMargin", "number", s.targetMargin)}${labelled("Handling allowance · AED sample base", "defaultHandling", "number", s.handlingFee)}</div><label>Default cancellation wording<textarea id="defaultCancellation">${safe(s.cancellation)}</textarea></label><div class="tool-row"><button class="btn secondary" id="saveDefaults" type="button">Save defaults</button><button class="btn secondary" id="applyDefaults" type="button">Apply to this quotation</button></div><p class="quote-note">The contact line is used in the PDF and preview. Company artwork and multi-user branding can be connected through the prepared backend.</p></div></details>
    <details><summary>Supplier rate book</summary><div class="tool-content"><p>Store negotiated rates with a date range and explicit confirmation. All rates use the demo’s AED base currency.</p><div class="form-grid">${labelled("Service / cost item", "rateName")}${labelled("Supplier", "rateSupplier")}${labelled("Unit cost · AED", "rateCost", "number")}${labelled("Quantity", "rateQty", "number", 1)}${labelled("Valid from", "rateFrom", "date")}${labelled("Valid to", "rateTo", "date")}</div><label>Capacity, overtime and cancellation conditions<textarea id="rateTerms" rows="2"></textarea></label><label class="tool-checkbox"><input type="checkbox" id="rateVerified"> Supplier has confirmed this rate and its conditions</label><button class="btn secondary" id="saveRate" type="button">Save supplier rate</button><div id="rateList">${store.rates.map((r, i) => `<article class="tool-item"><strong>${safe(r.name)}</strong><p>${safe(r.supplier)} · AED ${safe(r.unitCost)} × ${safe(r.quantity)} · ${safe(r.validFrom)}–${safe(r.validTo)} · ${r.verified ? "Confirmed" : "Pending confirmation"}</p><p>${safe(r.terms)}</p><button class="btn secondary" type="button" data-rate="${i}">Apply rate to quotation</button> <button class="btn secondary" type="button" data-edit-rate="${i}">Edit rate</button> <button class="btn secondary" type="button" data-delete-rate="${i}">Delete rate</button></article>`).join("")}</div></div></details>
    <details><summary>Compare Standard, Comfort and Premium</summary><div class="tool-content"><p>Compare the same itinerary using the demo’s comfort allowances. These are illustrative options, not confirmed supplier offers.</p><button class="btn secondary" id="compareOptions" type="button">Calculate three options</button><div id="optionComparison"></div></div></details>
    <details><summary>Versions, approval and operations handover</summary><div class="tool-content"><div class="tool-row">${labelled("Version note", "versionNote")}<button class="btn secondary" id="saveVersion" type="button">Save quotation version</button></div><div id="versionList">${store.versions.map((v, i) => `<article class="tool-item"><strong>${safe(v.quote.quoteNo)} · version ${safe(v.number)} · ${safe(v.note || "Saved draft")}</strong><p>${safe(new Date(v.at).toLocaleString())} · ${safe(v.quote.clientCompany || "Client pending")} · ${v.approved ? "Approved snapshot" : "Draft snapshot"} · AED ${safe(v.total)}</p><div class="tool-row"><button class="btn secondary" data-restore="${i}" type="button">Restore as draft</button><button class="btn secondary" data-diff="${i}" type="button">Compare with current draft</button>${v.document ? `<button class="btn secondary" data-version-pdf="${i}" type="button">Download saved version PDF</button>` : ""}${v.approved ? `<button class="btn secondary" data-handover="${i}" type="button">Send approved version to InfraDispatch</button>` : ""}</div></article>`).join("")}</div><div id="versionDiff"></div><h3>Included costs to confirm</h3><p>Confirm each supplier rate and allowance after checking the service date and conditions. Changes to date, quantity or unit cost reset the confirmation.</p><div id="confirmationCosts"></div><label class="tool-checkbox"><input type="checkbox" id="approvalConfirmation"> I have reviewed supplier conditions, itinerary timing and client acceptance</label><button class="btn" id="approveVersion" type="button">Save approved snapshot</button><p class="quote-note">Approval requires complete mandatory fields, no blocking issues and no unverified included costs. It records your confirmation; it is not a supplier booking.</p></div></details>
    <details><summary>Backup and practical workflow measurements</summary><div class="tool-content"><p>Backups include client details and supplier costs. Keep the file private. Nothing is uploaded automatically.</p><div class="tool-row"><button class="btn secondary" id="backupWorkspace" type="button">Download workspace backup</button><label>Restore workspace backup<input type="file" id="restoreWorkspace" accept="application/json,.json"></label><button class="btn secondary" id="exportMetrics" type="button">Download local activity log</button></div><p>${store.metrics.length} local actions recorded. Use real pilot sessions to measure enquiry-to-quote time and corrections; no time-saving claim has been established.</p></div></details><p id="priceChangeExplanation" class="price-change" aria-live="polite"></p></section>`;
    if (cloud) document.querySelector(".workflow-tools").append(cloud);
    bind();
    renderConfirmations();
  }
  function renderConfirmations() {
    if (!$("confirmationCosts") || !API()) return;
    const q = API().get(),
      review = API().review();
    $("confirmationCosts").innerHTML = review.lines
      .filter(
        (line) =>
          line.include &&
          (line.type !== "Conditional" ||
            ["Included", "Estimated risk"].includes(line.conditionStatus)),
      )
      .map(
        (line, i) =>
          `<label class="tool-checkbox tool-item"><input type="checkbox" data-confirm-cost="${i}" ${line.verification === "Verified" ? "checked" : ""}><span><strong>${safe(line.name)}</strong><br>AED ${safe(line.unitCost)} × ${safe(line.quantity)} · ${safe(line.verification)}<br>${safe(line.internalNote || "Check the supplier and date before confirmation.")}</span></label>`,
      )
      .join("");
    const lines = review.lines.filter(
      (line) =>
        line.include &&
        (line.type !== "Conditional" ||
          ["Included", "Estimated risk"].includes(line.conditionStatus)),
    );
    document.querySelectorAll("[data-confirm-cost]").forEach(
      (box) =>
        (box.onchange = () => {
          const line = lines[Number(box.dataset.confirmCost)],
            current = API().get();
          if (
            line.validFrom &&
            (current.serviceDate < line.validFrom ||
              current.serviceDate > line.validTo)
          ) {
            box.checked = false;
            status(
              "This rate is outside its validity period. Update the supplier rate before confirmation.",
            );
            return;
          }
          const confirmations = { ...(current.costConfirmations || {}) };
          if (box.checked)
            confirmations[line.name] = JSON.stringify([
              line.name,
              line.quantity,
              line.unitCost,
              current.serviceDate,
            ]);
          else confirmations[line.name] = "unconfirmed";
          API().update({ costConfirmations: confirmations });
          renderConfirmations();
          status("Cost review recorded for this date and price.");
        }),
    );
  }
  function saveVersion(approved = false) {
    const q = API().get(),
      r = API().calculate();
    if (approved) {
      const issues = [0, 1, 2, 3, 5].flatMap((i) =>
        root.INFRAQUOTE_CALC.stepIssues(q, i),
      );
      if (
        issues.length ||
        r.blocking.length ||
        r.pending ||
        !$("approvalConfirmation").checked
      ) {
        status(
          "Resolve mandatory fields, blocking checks and supplier verification, then confirm the review before approval.",
        );
        return;
      }
    }
    const number =
      1 +
      Math.max(
        0,
        ...store.versions
          .filter((v) => v.quote.quoteNo === q.quoteNo)
          .map((v) => v.number),
      );
    store.versions.unshift({
      id: crypto.randomUUID(),
      number,
      at: new Date().toISOString(),
      note: $("versionNote").value.trim(),
      quote: clone(q),
      total: r.total,
      minutes: r.minutes,
      document: API().document(),
      review: { ...API().review(), blocking: r.blocking.length },
      approved,
    });
    store.versions = store.versions.slice(0, 50);
    persist();
    record(approved ? "approved-version" : "saved-version");
    render();
    status(
      approved
        ? "Approved snapshot saved. Handover uses this exact version."
        : "Version saved. Your current draft remains editable.",
    );
  }
  function bind() {
    $("extractEnquiry").onclick = () => {
      proposal = extract($("enquiryText").value);
      $("enquiryProposal").innerHTML = Object.keys(proposal).length
        ? `<h3>Suggested details</h3><dl class="proposal-grid">${Object.entries(
            proposal,
          )
            .map(
              ([k, v]) =>
                `<div><dt>${safe(humanize(k))}</dt><dd>${safe(v)}</dd></div>`,
            )
            .join(
              "",
            )}</dl><button class="btn" type="button" id="applyEnquiry">Apply reviewed details</button>`
        : "<p>No unambiguous details found. Enter the request manually.</p>";
      if ($("applyEnquiry"))
        $("applyEnquiry").onclick = () => {
          API().update(proposal);
          record("enquiry-applied");
          status(
            "Reviewed suggestions applied. Check the remaining request fields.",
          );
        };
    };
    $("saveTour").onclick = () => {
      const name = $("templateName").value.trim();
      if (!name) {
        status("Name the template first.");
        return;
      }
      const q = API().get();
      const fields = [
        "itinerary",
        "vehicleId",
        "vehicleQty",
        "guideLanguage",
        "handlingFee",
        "riskBuffer",
        "tourDuration",
        "customHours",
        "tourTitle",
        "tourDescription",
        "inclusions",
        "exclusions",
        "cancellation",
        "comfortLevel",
        "mealPreference",
        "tourPace",
        "tourDifficulty",
        "costs",
      ];
      const setup = Object.fromEntries(fields.map((k) => [k, clone(q[k])]));
      setup.costConfirmations = {};
      setup.costs = setup.costs.map((line) => ({
        ...line,
        verification:
          line.verification === "Verified"
            ? "Pending verification"
            : line.verification,
      }));
      setup.itinerary = setup.itinerary.map((stop) => ({
        ...stop,
        ticketVerification: stop.ticketRequired
          ? "Pending verification"
          : stop.ticketVerification,
      }));
      store.templates.unshift({ name, setup });
      store.templates = store.templates.slice(0, 30);
      persist();
      render();
      status("Tour template saved.");
    };
    $("applyTour").onclick = () => {
      const selected = $("savedTour").value;
      if (selected === "") {
        status("Choose a saved tour first.");
        return;
      }
      API().update(clone(store.templates[Number(selected)].setup));
      record("template-applied");
      status(
        "Tour setup applied. Verify current prices and service-date availability.",
      );
    };
    $("saveDefaults").onclick = () => {
      const margin = Number($("defaultMargin").value),
        handling = Number($("defaultHandling").value);
      if (
        !Number.isFinite(margin) ||
        margin < 0 ||
        margin >= 100 ||
        !Number.isFinite(handling) ||
        handling < 0
      ) {
        status(
          "Use a margin from 0 to below 100 and a non-negative handling allowance.",
        );
        return;
      }
      store.settings = {
        company: $("defaultCompany").value.trim(),
        contact: $("defaultContact").value.trim(),
        preparedBy: $("defaultPreparedBy").value.trim(),
        targetMargin: margin,
        handlingFee: handling,
        cancellation: $("defaultCancellation").value.trim(),
      };
      persist();
      status(
        "Company defaults saved. Apply them when you want to update this quotation.",
      );
    };
    $("applyDefaults").onclick = () => {
      const s = store.settings;
      API().update({
        targetMargin: s.targetMargin,
        handlingFee: s.handlingFee,
        ...(s.contact ? { companyContact: s.contact } : {}),
        ...(s.preparedBy ? { preparedBy: s.preparedBy } : {}),
        ...(s.cancellation ? { cancellation: s.cancellation } : {}),
        companyName: s.company,
      });
      record("defaults-applied");
      status("Saved company defaults applied.");
    };
    $("saveRate").onclick = () => {
      const unitCost = Number($("rateCost").value),
        quantity = Number($("rateQty").value),
        validFrom = $("rateFrom").value,
        validTo = $("rateTo").value,
        name = $("rateName").value.trim();
      if (
        !name ||
        !$("rateCost").value ||
        !Number.isFinite(unitCost) ||
        unitCost < 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !validFrom ||
        !validTo ||
        validFrom > validTo
      ) {
        status(
          "Add a service name, non-negative rate, positive quantity and valid date range.",
        );
        return;
      }
      const rate = {
        id: editingRate || crypto.randomUUID(),
        name,
        supplier: $("rateSupplier").value.trim(),
        unitCost,
        quantity,
        validFrom,
        validTo,
        terms: $("rateTerms").value.trim(),
        verified: $("rateVerified").checked,
      };
      const index = store.rates.findIndex((r) => r.id === editingRate);
      if (index < 0) store.rates.unshift(rate);
      else store.rates[index] = rate;
      editingRate = null;
      store.rates = store.rates.slice(0, 100);
      persist();
      render();
      status("Supplier rate saved.");
    };
    document.querySelectorAll("[data-rate]").forEach(
      (b) =>
        (b.onclick = () => {
          const rate = store.rates[Number(b.dataset.rate)],
            q = API().get();
          const existing = q.costs.findIndex((c) => c.rateId === rate.id);
          const applied = {
            id: crypto.randomUUID(),
            rateId: rate.id,
            name: rate.name,
            category: "Custom",
            type: "Fixed",
            quantity: rate.quantity,
            unitCost: rate.unitCost,
            include: true,
            verification: usableRate(rate, q.serviceDate)
              ? "Verified"
              : "Pending verification",
            supplier: rate.supplier,
            internalNote: `Valid ${rate.validFrom}–${rate.validTo}. ${rate.terms}`,
            clientNote: "",
            conditionStatus: "Included",
            validFrom: rate.validFrom,
            validTo: rate.validTo,
          };
          if (existing < 0) q.costs.push(applied);
          else q.costs[existing] = { ...applied, id: q.costs[existing].id };
          const confirmations = { ...(q.costConfirmations || {}) };
          delete confirmations[rate.name];
          API().update({ costs: q.costs, costConfirmations: confirmations });
          record("supplier-rate-applied");
          status(
            usableRate(rate, q.serviceDate)
              ? "Confirmed rate added. Avoid duplicating an existing transport or guide allowance."
              : "Rate added as pending verification: confirmation or service-date validity is missing.",
          );
        }),
    );
    document.querySelectorAll("[data-edit-rate]").forEach(
      (b) =>
        (b.onclick = () => {
          const rate = store.rates[Number(b.dataset.editRate)];
          editingRate = rate.id;
          [
            ["rateName", rate.name],
            ["rateSupplier", rate.supplier],
            ["rateCost", rate.unitCost],
            ["rateQty", rate.quantity],
            ["rateFrom", rate.validFrom],
            ["rateTo", rate.validTo],
            ["rateTerms", rate.terms],
          ].forEach(([id, value]) => ($(id).value = value));
          $("rateVerified").checked = rate.verified;
          $("rateName").focus();
          status(
            "Editing the supplier rate. Save it, then apply it explicitly to the quotation. Saved versions stay unchanged.",
          );
        }),
    );
    document.querySelectorAll("[data-delete-rate]").forEach(
      (b) =>
        (b.onclick = () => {
          store.rates.splice(Number(b.dataset.deleteRate), 1);
          persist();
          render();
          status(
            "Rate removed from the book. Existing quotation lines are preserved.",
          );
        }),
    );
    $("compareOptions").onclick = () => {
      const original = API().get();
      comparison = ["Standard", "Comfort", "Premium"].map((level) => {
        const result = API().preview({ comfortLevel: level });
        return { level, total: result.total, minutes: result.minutes };
      });
      $("optionComparison").innerHTML =
        `<div class="option-grid">${comparison.map((o) => `<article class="tool-item"><h3>${o.level}</h3><strong>AED ${o.total.toFixed(2)}</strong><p>${o.minutes} min · ${o.level === "Premium" ? "Includes sample premium setup allowance" : "Same itinerary and selected vehicle"}</p><button class="btn secondary" type="button" data-option="${o.level}">Choose ${o.level}</button></article>`).join("")}</div>`;
      document.querySelectorAll("[data-option]").forEach(
        (b) =>
          (b.onclick = () => {
            API().update({ comfortLevel: b.dataset.option });
            record("option-selected");
            status(
              `${b.dataset.option} selected. Confirm the actual service specification and supplier price.`,
            );
          }),
      );
      record("options-compared");
    };
    $("saveVersion").onclick = () => saveVersion();
    $("approveVersion").onclick = () => saveVersion(true);
    document.querySelectorAll("[data-restore]").forEach(
      (b) =>
        (b.onclick = () => {
          const v = store.versions[Number(b.dataset.restore)];
          API().restore({ ...clone(v.quote), quoteStatus: "Draft" });
          record("version-restored");
          status(
            "Saved version restored as an editable draft. Approved history is preserved.",
          );
        }),
    );
    document.querySelectorAll("[data-diff]").forEach(
      (b) =>
        (b.onclick = () => {
          const diff = changes(
            store.versions[Number(b.dataset.diff)].quote,
            API().get(),
          );
          const version = store.versions[Number(b.dataset.diff)],
            current = API().calculate();
          $("versionDiff").innerHTML =
            `<h3>Changes since this version</h3><p>Price difference: ${current.total - version.total >= 0 ? "+" : ""}AED ${(current.total - version.total).toFixed(2)}${version.minutes !== undefined ? ` · Duration difference: ${current.minutes - version.minutes >= 0 ? "+" : ""}${current.minutes - version.minutes} min` : ""}</p>${diff.length ? `<ul>${diff.map((d) => (typeof d.before === "object" || typeof d.after === "object" ? `<li><details><summary>${safe(humanize(d.field))} changed</summary><pre>Saved version\n${safe(JSON.stringify(d.before, null, 2))}\nCurrent draft\n${safe(JSON.stringify(d.after, null, 2))}</pre></details></li>` : `<li><strong>${safe(humanize(d.field))}</strong>: ${safe(d.before)} → ${safe(d.after)}</li>`)).join("")}</ul>` : "<p>No differences.</p>"}`;
        }),
    );
    document.querySelectorAll("[data-version-pdf]").forEach(
      (b) =>
        (b.onclick = async () => {
          const v = store.versions[Number(b.dataset.versionPdf)];
          try {
            await root.INFRAQUOTE_PDF.download({
              ...v.document,
              reference: `${v.quote.quoteNo}-v${v.number}`,
            });
            status(
              "Saved version PDF downloaded with the original pricing and wording.",
            );
          } catch (_) {
            status(
              "Saved-version PDF could not download. Restore the draft to use the print fallback.",
            );
          }
        }),
    );
    document.querySelectorAll("[data-handover]").forEach(
      (b) =>
        (b.onclick = () => {
          const v = store.versions[Number(b.dataset.handover)];
          const q = v.quote;
          const payload = {
            reference: q.quoteNo,
            version: v.number,
            approvedAt: v.at,
            tourName: q.tourTitle,
            serviceDate: q.serviceDate,
            guestCount:
              Number(q.adults) + Number(q.children) + Number(q.infants),
            adults: Number(q.adults),
            children: Number(q.children),
            infants: Number(q.infants),
            pickupLocation: q.pickupLocation,
            dropoffLocation: q.dropoffLocation,
            pickupTime: q.pickupTime,
            guideLanguage: q.guideLanguage,
            itineraryStops: q.itinerary
              .filter((s) => s.status !== "Excluded")
              .map((s) => ({ name: s.name, note: s.operationalNote })),
            accessibility: q.accessibility,
            airportPickup: q.airportPickup,
            airportDropoff: q.airportDropoff,
            ...(q.airportPickup || q.airportDropoff
              ? {
                  flightNumber: q.flightNumber,
                  flightTime: q.flightTime,
                  terminalNote: q.terminalNote,
                }
              : {}),
            vehicleId: q.vehicleId,
            vehicleQty: q.vehicleQty,
          };
          try {
            localStorage.setItem(
              "infraquote_dispatch_handover_v1",
              JSON.stringify(payload),
            );
            record("approved-handover");
            location.href =
              "/live-demos/infradispatch/index.html#quotation-handover";
          } catch (_) {
            download(`${q.quoteNo}-approved-handover.json`, payload);
            status(
              "Storage unavailable; approved handover downloaded instead.",
            );
          }
        }),
    );
    $("backupWorkspace").onclick = () =>
      download("InfraQuote-workspace-backup.json", {
        format: "infraquote-backup-v1",
        workspace: store,
        draft: API().get(),
      });
    $("restoreWorkspace").onchange = async () => {
      const file = $("restoreWorkspace").files[0];
      if (!file) return;
      if (file.size > 2000000) {
        status("Backup is too large. Maximum 2 MB.");
        return;
      }
      try {
        const value = JSON.parse(await file.text());
        if (!validBackup(value)) throw Error("format");
        if (
          !confirm("Replace this device’s workspace and draft with the backup?")
        )
          return;
        store = value.workspace;
        store.settings = { ...defaults, ...store.settings };
        persist();
        API().restore(value.draft);
        render();
        status("Workspace and draft restored.");
      } catch (_) {
        status("That file is not a valid InfraQuote workspace backup.");
      }
    };
    $("exportMetrics").onclick = () =>
      download("InfraQuote-local-activity.json", store.metrics);
  }
  root.addEventListener("infraquote:calculated", (event) => {
    const next = event.detail;
    if (
      last &&
      changes(last.quote, next.quote).length &&
      $("approvalConfirmation")
    )
      $("approvalConfirmation").checked = false;
    if (last && $("priceChangeExplanation")) {
      const delta = next.total - last.total,
        time = next.minutes - last.minutes,
        changed = changes(last.quote, next.quote);
      if (delta || time) {
        $("priceChangeExplanation").textContent =
          `Latest change: ${changed.map((x) => x.field.replace(/([A-Z])/g, " $1")).join(", ") || "cost inputs"} → ${delta >= 0 ? "+" : ""}AED ${delta.toFixed(2)}; ${time >= 0 ? "+" : ""}${time} minutes. Supplier rates remain subject to confirmation.`;
      }
    }
    last = clone(next);
    renderConfirmations();
  });
  root.addEventListener("infraquote:import-tools", (event) => {
    if (event.detail.settings)
      store.settings = { ...defaults, ...event.detail.settings };
    store.templates = [...event.detail.templates, ...store.templates].slice(
      0,
      30,
    );
    store.rates = [...event.detail.rates, ...store.rates].slice(0, 100);
    persist();
    render();
  });
  document.addEventListener("DOMContentLoaded", () => {
    load();
    if (!store.starterTemplatesAdded) {
      store.templates.push(
        {
          name: "Cultural highlights · full day (sample)",
          setup: {
            tourDuration: "Full day",
            tourTitle: "Abu Dhabi Cultural Highlights",
            itinerary: API().templateStops([
              "grand-mosque",
              "qasr-al-watan",
              "louvre",
              "emirates-palace",
            ]),
            costConfirmations: {},
          },
        },
        {
          name: "City highlights · half day (sample)",
          setup: {
            tourDuration: "Half day",
            tourTitle: "Abu Dhabi City Highlights",
            itinerary: API().templateStops([
              "grand-mosque",
              "corniche",
              "dates-market",
            ]),
            costConfirmations: {},
          },
        },
      );
      store.starterTemplatesAdded = true;
      persist();
    }
    render();
    record("workspace-opened");
  });
})(typeof window !== "undefined" ? window : globalThis);
