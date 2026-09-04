import { allocateGuides, buildSopOutline, calculateVehicleRequirement, planArrivalWaves, summarizeJourney } from "./lab-formulas.js";

const page = document.querySelector("[data-lab-tool]");
const analytics = (name, params = {}) => window.AhmedAnalytics?.event?.(name, { ...params, page_path: location.pathname });
if (!page) {
  analytics("lab_opened", { lab_section: "index" });
} else {
  const toolId = page.dataset.labTool;
  const form = page.querySelector("[data-tool-form]");
  const errorsBox = page.querySelector("[data-tool-errors]");
  const results = page.querySelector("[data-tool-results]");
  const outputArea = page.querySelector("[data-tool-output]");
  const status = page.querySelector("[data-tool-status]");
  const resultActions = page.querySelector("[data-result-actions]");
  const storageKey = `ahmed_lab_${toolId}_v1`;
  let lastOutput = null;
  let lastCsv = "";
  analytics("tool_opened", { tool_id: toolId });

  const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const number = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const formValue = (name) => form.elements[name]?.value ?? "";
  const showErrors = (items) => {
    errorsBox.innerHTML = items.length ? `<strong>Review the scenario</strong><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
    if (items.length) { errorsBox.focus(); status.textContent = `The scenario has ${items.length} issue${items.length === 1 ? "" : "s"}.`; }
  };
  const showResult = (html, summary, csv = "") => {
    errorsBox.innerHTML = "";
    outputArea.innerHTML = html;
    lastOutput = summary;
    lastCsv = csv;
    resultActions.hidden = false;
    status.textContent = "Results calculated and ready for review.";
    analytics("tool_calculation_completed", { tool_id: toolId });
    saveDraft();
  };
  const rows = (kind) => [...form.querySelectorAll(`[data-row-kind="${kind}"]`)];
  const rowData = (kind) => rows(kind).map((row) => Object.fromEntries([...row.querySelectorAll("input,select,textarea")].map((control) => [control.dataset.field, control.value])));
  const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const toCsv = (headers, data) => [headers.map(csvCell).join(","), ...data.map((row) => row.map(csvCell).join(","))].join("\n");

  function addRow(kind, values = {}) {
    const tbody = form.querySelector(`[data-row-body="${kind}"]`);
    if (!tbody) return;
    const row = document.createElement("tr");
    row.dataset.rowKind = kind;
    const input = (field, type = "text", extra = "") => `<input data-field="${field}" type="${type}" value="${escapeHtml(values[field] ?? "")}" ${extra}/>`;
    if (kind === "flight") row.innerHTML = `<td>${input("reference", "text", 'aria-label="Flight reference"')}</td><td>${input("time", "time", 'aria-label="Arrival time"')}</td><td>${input("passengers", "number", 'min="1" max="10000" step="1" aria-label="Passengers"')}</td><td>${input("hotel", "text", 'aria-label="Hotel destination"')}</td><td><button type="button" data-remove-row aria-label="Remove arrival">Remove</button></td>`;
    if (kind === "group") row.innerHTML = `<td>${input("id", "text", 'aria-label="Group code"')}</td><td>${input("language", "text", 'aria-label="Required language"')}</td><td>${input("guests", "number", 'min="1" max="10000" step="1" aria-label="Guests"')}</td><td>${input("start", "time", 'aria-label="Group start time"')}</td><td>${input("duration", "number", 'min="15" max="1440" step="15" aria-label="Duration in minutes"')}</td><td>${input("location", "text", 'aria-label="Location"')}</td><td><button type="button" data-remove-row aria-label="Remove group">Remove</button></td>`;
    if (kind === "guide") row.innerHTML = `<td>${input("id", "text", 'aria-label="Guide code"')}</td><td>${input("languages", "text", 'aria-label="Languages separated by commas"')}</td><td>${input("start", "time", 'aria-label="Available from"')}</td><td>${input("end", "time", 'aria-label="Available until"')}</td><td><button type="button" data-remove-row aria-label="Remove guide">Remove</button></td>`;
    if (kind === "journey") row.innerHTML = `<td>${input("stage", "text", 'aria-label="Journey stage"')}</td><td>${input("touchpoint", "text", 'aria-label="Touchpoint"')}</td><td>${input("expectation", "text", 'aria-label="Guest expectation"')}</td><td>${input("owner", "text", 'aria-label="Responsible team"')}</td><td><select data-field="risk" aria-label="Risk level"><option ${values.risk === "Low" ? "selected" : ""}>Low</option><option ${!values.risk || values.risk === "Medium" ? "selected" : ""}>Medium</option><option ${values.risk === "High" ? "selected" : ""}>High</option></select></td><td>${input("kpi", "text", 'aria-label="KPI"')}</td><td>${input("improvement", "text", 'aria-label="Improvement opportunity"')}</td><td><button type="button" data-remove-row aria-label="Remove touchpoint">Remove</button></td>`;
    tbody.appendChild(row);
  }

  function clearRows() { form.querySelectorAll("[data-row-kind]").forEach((row) => row.remove()); }
  function sample() {
    clearRows();
    if (toolId === "vehicle-requirement") { form.elements.passengers.value = 86; form.elements.capacity.value = 50; form.elements.luggage.value = "standard"; form.elements.accessibilityAllowance.value = 1; form.elements.reservePct.value = 10; }
    if (toolId === "mice-arrival-wave") {
      form.elements.vehicleCapacity.value = 45; form.elements.meetCapacity.value = 50; form.elements.groupingWindow.value = 45;
      addRow("flight", { reference: "EY101", time: "09:10", passengers: 38, hotel: "Hotel A" }); addRow("flight", { reference: "BA073", time: "09:35", passengers: 24, hotel: "Hotel B" }); addRow("flight", { reference: "LH966", time: "11:20", passengers: 52, hotel: "Hotel A" });
    }
    if (toolId === "guide-allocation") {
      addRow("group", { id: "Group A", language: "English", guests: 32, start: "09:00", duration: 240, location: "Abu Dhabi" }); addRow("group", { id: "Group B", language: "French", guests: 18, start: "10:00", duration: 180, location: "Abu Dhabi" }); addRow("group", { id: "Group C", language: "English", guests: 25, start: "13:30", duration: 180, location: "Yas Island" });
      addRow("guide", { id: "Guide 01", languages: "English, French", start: "08:00", end: "18:00" }); addRow("guide", { id: "Guide 02", languages: "English", start: "12:00", end: "20:00" });
    }
    if (toolId === "guest-journey-mapper") {
      addRow("journey", { stage: "Booking", touchpoint: "Confirmation", expectation: "Clear inclusions", owner: "Sales", risk: "Medium", kpi: "Confirmation accuracy", improvement: "Standard handover fields" }); addRow("journey", { stage: "Arrival", touchpoint: "Airport greeting", expectation: "Easy recognition", owner: "Airport team", risk: "High", kpi: "Meet success rate", improvement: "Escalation contact on brief" }); addRow("journey", { stage: "Tour", touchpoint: "Guide briefing", expectation: "Relevant story", owner: "Guide team", risk: "Medium", kpi: "Guest rating", improvement: "Profile-based briefing" });
    }
    if (toolId === "sop-structure-builder") {
      form.elements.process.value = "Airport arrival handover"; form.elements.objective.value = "Ensure every arriving guest is identified, received and transferred through a controlled handover."; form.elements.scope.value = "From confirmed arrival list receipt until the guest and baggage are handed to the assigned driver."; form.elements.roles.value = "Airport representative; transport coordinator; driver; duty manager"; form.elements.trigger.value = "Approved arrival manifest and flight monitoring begin."; form.elements.steps.value = "Review the approved arrival manifest\nConfirm flight status and team readiness\nPosition the meeting point and identification sign\nRecord guest contact and baggage status\nComplete the driver handover\nEscalate exceptions and preserve evidence"; form.elements.controls.value = "Manifest version check; team acknowledgement; named handover; exception timestamp"; form.elements.escalation.value = "Escalate missing guest, baggage disruption, flight change or unsafe handover to the duty manager."; form.elements.records.value = "Approved manifest; contact log; handover confirmation; incident record";
    }
    status.textContent = "Illustrative sample loaded. Replace it with your operating assumptions.";
  }

  function calculate() {
    if (toolId === "vehicle-requirement") {
      const output = calculateVehicleRequirement({ passengers: formValue("passengers"), capacity: formValue("capacity"), luggage: formValue("luggage"), accessibilityAllowance: formValue("accessibilityAllowance"), reservePct: formValue("reservePct") });
      if (!output.ok) return showErrors(output.errors);
      const summary = `Vehicle Requirement Calculator\nEffective passenger capacity per vehicle: ${output.effectiveCapacity}\nMinimum vehicles: ${output.minimumVehicles}\nRecommended operational vehicles: ${output.recommendedVehicles}\nSpare seats: ${output.spareSeats}\nOccupancy: ${output.occupancyPct}%`;
      return showResult(`<div class="metric-grid"><div class="metric"><span>Minimum vehicles</span><strong>${output.minimumVehicles}</strong><small>Mathematical minimum using effective capacity.</small></div><div class="metric"><span>Operational recommendation</span><strong>${output.recommendedVehicles}</strong><small>Respects the chosen spare-capacity target.</small></div><div class="metric"><span>Effective capacity</span><strong>${output.effectiveCapacity}</strong><small>Nominal seats adjusted for luggage and accessibility allowance.</small></div><div class="metric"><span>Spare seats</span><strong>${output.spareSeats}</strong><small>Across the recommended vehicle count.</small></div></div><div class="result-explanation"><strong>${output.occupancyPct}% planned occupancy</strong><div class="occupancy" aria-label="${output.occupancyPct}% planned occupancy"><span style="width:${Math.min(100, output.occupancyPct)}%"></span></div><p>Minimum vehicles = passengers ÷ effective capacity, rounded up. The operational recommendation uses a lower target load when spare capacity is requested.</p></div>`, summary);
    }
    if (toolId === "mice-arrival-wave") {
      const output = planArrivalWaves({ flights: rowData("flight"), vehicleCapacity: formValue("vehicleCapacity"), meetCapacity: formValue("meetCapacity"), groupingWindow: formValue("groupingWindow") });
      if (!output.ok) return showErrors(output.errors);
      const csv = toCsv(["Wave", "Start", "End", "Flights", "Passengers", "Vehicles", "Meet teams", "Holding minutes", "Hotel split"], output.waves.map((wave) => [wave.wave, wave.start, wave.end, wave.flights.join(" + "), wave.passengers, wave.vehicles, wave.meetTeams, wave.holdingMinutes, Object.entries(wave.hotels).map(([hotel, pax]) => `${hotel}: ${pax}`).join("; ")]));
      const cards = output.waves.map((wave) => `<article class="wave-card"><h3>Wave ${wave.wave} · ${wave.start}${wave.end !== wave.start ? `–${wave.end}` : ""}</h3><p><strong>${wave.passengers} delegates · ${wave.vehicles} vehicles · ${wave.meetTeams} meet teams</strong></p><p>${escapeHtml(wave.flights.join(" + "))} · Holding span ${wave.holdingMinutes} minutes</p><p>${Object.entries(wave.hotels).map(([hotel, pax]) => `${escapeHtml(hotel)}: ${pax}`).join(" · ")}</p></article>`).join("");
      return showResult(`<div class="metric-grid"><div class="metric"><span>Arrival waves</span><strong>${output.waves.length}</strong></div><div class="metric"><span>Total delegates</span><strong>${number(output.totalPassengers)}</strong></div><div class="metric"><span>Wave vehicle demand</span><strong>${output.totalVehicles}</strong><small>Sum of each wave's requirement; vehicles may be reusable only after an operational timing review.</small></div></div><div class="result-explanation">${cards}<p>Flights are grouped when the gap from the preceding arrival is within the chosen window. This educational grouping does not include immigration, baggage, terminal walking or live delay data.</p></div>`, `MICE Arrival Wave Planner\n${output.waves.map((wave) => `Wave ${wave.wave}: ${wave.start}-${wave.end}; ${wave.passengers} delegates; ${wave.vehicles} vehicles; ${wave.meetTeams} meet teams`).join("\n")}`, csv);
    }
    if (toolId === "guide-allocation") {
      const output = allocateGuides({ groups: rowData("group"), guides: rowData("guide") });
      if (!output.ok) return showErrors(output.errors);
      const csv = toCsv(["Group", "Suggested guide", "Language", "Guests", "Location", "Start", "End", "Status"], [...output.assignments.map((item) => [item.group, item.guide, item.language, item.guests, item.location, item.start, item.end, "Suggested"]), ...output.unassigned.map((item) => [item.id, "", item.language, item.guests, item.location, item.start, "", item.reason])]);
      const table = `<div class="output-table-wrap"><table class="output-table"><thead><tr><th>Group</th><th>Suggested guide</th><th>Language</th><th>Window</th><th>Status</th></tr></thead><tbody>${output.assignments.map((item) => `<tr><td>${escapeHtml(item.group)}</td><td>${escapeHtml(item.guide)}</td><td>${escapeHtml(item.language)}</td><td>${item.start}–${item.end}</td><td>Suggested</td></tr>`).join("")}${output.unassigned.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>—</td><td>${escapeHtml(item.language)}</td><td>${timeLabel(item.start)}</td><td>${escapeHtml(item.reason)}</td></tr>`).join("")}</tbody></table></div>`;
      return showResult(`<div class="metric-grid"><div class="metric"><span>Coverage</span><strong>${output.coveragePct}%</strong></div><div class="metric"><span>Suggested assignments</span><strong>${output.assignments.length}</strong></div><div class="metric"><span>Unassigned groups</span><strong>${output.unassigned.length}</strong></div></div><div class="result-explanation">${table}<p>${escapeHtml(output.note)}</p></div>`, `Guide Allocation Planner\nCoverage: ${output.coveragePct}%\n${output.assignments.map((item) => `${item.group} → ${item.guide}, ${item.start}-${item.end}`).join("\n")}\n${output.unassigned.map((item) => `${item.id}: UNASSIGNED — ${item.reason}`).join("\n")}`, csv);
    }
    if (toolId === "guest-journey-mapper") {
      const output = summarizeJourney(rowData("journey"));
      if (!output.ok) return showErrors(output.errors);
      const csv = toCsv(["Stage", "Touchpoint", "Guest expectation", "Responsible team", "Risk", "KPI", "Improvement opportunity"], output.entries.map((item) => [item.stage, item.touchpoint, item.expectation, item.owner, item.risk, item.kpi, item.improvement]));
      const cards = output.entries.map((item, index) => `<article class="journey-card risk-${item.risk}"><h3>${String(index + 1).padStart(2, "0")} · ${escapeHtml(item.stage)} — ${escapeHtml(item.touchpoint)}</h3><p><strong>Expectation:</strong> ${escapeHtml(item.expectation || "Not defined")}</p><p><strong>Owner:</strong> ${escapeHtml(item.owner)} · <strong>Risk:</strong> ${item.risk}</p><p><strong>KPI:</strong> ${escapeHtml(item.kpi || "Not defined")}</p><p><strong>Opportunity:</strong> ${escapeHtml(item.improvement || "Not defined")}</p></article>`).join("");
      return showResult(`<div class="metric-grid"><div class="metric"><span>Touchpoints</span><strong>${output.entries.length}</strong></div><div class="metric"><span>High risk</span><strong>${output.riskCounts.High}</strong></div><div class="metric"><span>Improvement priorities</span><strong>${output.priorities}</strong></div></div><div class="result-explanation">${cards}</div>`, `Guest Journey Mapper\n${output.entries.map((item) => `${item.stage} — ${item.touchpoint}; Owner: ${item.owner}; Risk: ${item.risk}; KPI: ${item.kpi || "Not defined"}; Improvement: ${item.improvement || "Not defined"}`).join("\n")}`, csv);
    }
    if (toolId === "sop-structure-builder") {
      const payload = Object.fromEntries(["process", "objective", "scope", "roles", "trigger", "steps", "controls", "escalation", "records"].map((key) => [key, formValue(key)]));
      const output = buildSopOutline(payload);
      if (!output.ok) return showErrors(output.errors);
      return showResult(`<div class="metric-grid"><div class="metric"><span>Procedure steps</span><strong>${output.steps.length}</strong></div><div class="metric"><span>Outline sections</span><strong>${output.sections.length}</strong></div></div><div class="result-explanation"><h2>${escapeHtml(output.title)}</h2>${output.sections.map(([title, content]) => `<section class="sop-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(content).replaceAll("\n", "<br/>")}</p></section>`).join("")}</div>`, output.text);
    }
  }

  function timeLabel(minutes) { return Number.isFinite(minutes) ? `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}` : "—"; }
  function saveDraft() {
    try {
      const values = Object.fromEntries([...form.elements].filter((element) => element.name && !element.closest("[data-row-kind]")).map((element) => [element.name, element.value]));
      const dynamic = Object.fromEntries(["flight", "group", "guide", "journey"].map((kind) => [kind, rowData(kind)]));
      localStorage.setItem(storageKey, JSON.stringify({ values, dynamic }));
    } catch (_error) { /* Storage can be disabled. */ }
  }
  function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!draft) return;
      Object.entries(draft.values || {}).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; });
      Object.entries(draft.dynamic || {}).forEach(([kind, values]) => values.forEach((value) => addRow(kind, value)));
      status.textContent = "A non-sensitive draft was restored from this browser.";
    } catch (_error) { /* Ignore unavailable or invalid local storage. */ }
  }
  function reset() {
    form.reset(); clearRows();
    if (toolId === "mice-arrival-wave") addRow("flight");
    if (toolId === "guide-allocation") { addRow("group"); addRow("guide"); }
    if (toolId === "guest-journey-mapper") addRow("journey", { stage: "Booking", risk: "Medium" });
    try { localStorage.removeItem(storageKey); } catch (_error) { /* Storage can be disabled. */ }
    errorsBox.innerHTML = ""; outputArea.innerHTML = '<div class="result-empty"><div><span aria-hidden="true">↳</span><p>Define a scenario, then generate an explainable output.</p></div></div>'; resultActions.hidden = true; lastOutput = null; lastCsv = "";
    status.textContent = "Scenario reset."; analytics("tool_reset_clicked", { tool_id: toolId });
  }
  async function copySummary() {
    if (!lastOutput) return;
    try { await navigator.clipboard.writeText(lastOutput); status.textContent = "Summary copied to the clipboard."; analytics("tool_export_clicked", { tool_id: toolId, export_type: "copy" }); }
    catch (_error) { status.textContent = "Clipboard access is unavailable. Select and copy the visible result instead."; }
  }
  function downloadCsv() {
    if (!lastCsv) return;
    const blob = new Blob([lastCsv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${toolId}-output.csv`; anchor.click(); URL.revokeObjectURL(url); analytics("tool_export_clicked", { tool_id: toolId, export_type: "csv" });
  }

  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  form.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-row]"); if (add) addRow(add.dataset.addRow);
    const remove = event.target.closest("[data-remove-row]"); if (remove) remove.closest("tr")?.remove();
    if (event.target.closest("[data-load-sample]")) sample();
    if (event.target.closest("[data-tool-reset]")) reset();
  });
  resultActions.addEventListener("click", (event) => {
    if (event.target.closest("[data-copy-summary]")) copySummary();
    if (event.target.closest("[data-print-result]")) { window.print(); analytics("tool_export_clicked", { tool_id: toolId, export_type: "print" }); }
    if (event.target.closest("[data-download-csv]")) downloadCsv();
  });
  restoreDraft();
  if (!rows("flight").length && toolId === "mice-arrival-wave") addRow("flight");
  if (!rows("group").length && toolId === "guide-allocation") { addRow("group"); addRow("guide"); }
  if (!rows("journey").length && toolId === "guest-journey-mapper") addRow("journey", { stage: "Booking", risk: "Medium" });
}
