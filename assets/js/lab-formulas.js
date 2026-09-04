const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : NaN;
export const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

export function calculateVehicleRequirement(input) {
  const passengers = finite(input.passengers);
  const nominalCapacity = finite(input.capacity);
  const accessibilityAllowance = finite(input.accessibilityAllowance || 0);
  const reservePct = finite(input.reservePct || 0);
  const luggageFactor = ({ none: 1, standard: 0.85, heavy: 0.7 })[input.luggage] || NaN;
  const errors = [];
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 100000) errors.push("Passenger count must be a whole number between 1 and 100,000.");
  if (!Number.isInteger(nominalCapacity) || nominalCapacity < 1 || nominalCapacity > 100) errors.push("Vehicle capacity must be a whole number between 1 and 100.");
  if (!Number.isInteger(accessibilityAllowance) || accessibilityAllowance < 0 || accessibilityAllowance > 20) errors.push("Accessibility allowance must be a whole number from 0 to 20 seats per vehicle.");
  if (!Number.isFinite(reservePct) || reservePct < 0 || reservePct > 50) errors.push("Spare-capacity target must be between 0% and 50%.");
  if (!Number.isFinite(luggageFactor)) errors.push("Choose a luggage profile.");
  if (errors.length) return { ok: false, errors };
  const capacityAfterLuggage = Math.floor(nominalCapacity * luggageFactor);
  const effectiveCapacity = capacityAfterLuggage - accessibilityAllowance;
  if (effectiveCapacity < 1) return { ok: false, errors: ["The luggage and accessibility allowances leave no usable passenger capacity."] };
  const minimumVehicles = Math.ceil(passengers / effectiveCapacity);
  const targetLoad = Math.max(1, Math.floor(effectiveCapacity * (1 - reservePct / 100)));
  const recommendedVehicles = Math.ceil(passengers / targetLoad);
  const availableSeats = recommendedVehicles * effectiveCapacity;
  return {
    ok: true,
    effectiveCapacity,
    minimumVehicles,
    recommendedVehicles,
    spareSeats: availableSeats - passengers,
    occupancyPct: round((passengers / availableSeats) * 100, 1),
    targetLoad,
  };
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
export function minutesFromTime(value) {
  const match = String(value || "").match(timePattern);
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}
export function timeFromMinutes(value) {
  const normalized = ((value % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

export function planArrivalWaves(input) {
  const flights = Array.isArray(input.flights) ? input.flights : [];
  const vehicleCapacity = finite(input.vehicleCapacity);
  const meetCapacity = finite(input.meetCapacity);
  const groupingWindow = finite(input.groupingWindow);
  const errors = [];
  if (!flights.length) errors.push("Add at least one arrival.");
  if (!Number.isInteger(vehicleCapacity) || vehicleCapacity < 1 || vehicleCapacity > 100) errors.push("Vehicle capacity must be a whole number between 1 and 100.");
  if (!Number.isInteger(meetCapacity) || meetCapacity < 1 || meetCapacity > 500) errors.push("Meet-and-greet capacity must be a whole number between 1 and 500 delegates per team.");
  if (!Number.isInteger(groupingWindow) || groupingWindow < 0 || groupingWindow > 240) errors.push("Grouping window must be between 0 and 240 minutes.");
  const cleaned = flights.map((flight, index) => ({
    reference: String(flight.reference || "").trim(),
    time: String(flight.time || ""),
    minutes: minutesFromTime(flight.time),
    passengers: finite(flight.passengers),
    hotel: String(flight.hotel || "").trim(),
    index,
  }));
  cleaned.forEach((flight, index) => {
    if (!flight.reference) errors.push(`Arrival ${index + 1}: add a flight reference.`);
    if (!Number.isFinite(flight.minutes)) errors.push(`Arrival ${index + 1}: use a valid 24-hour arrival time.`);
    if (!Number.isInteger(flight.passengers) || flight.passengers < 1 || flight.passengers > 10000) errors.push(`Arrival ${index + 1}: passengers must be a whole number from 1 to 10,000.`);
    if (!flight.hotel) errors.push(`Arrival ${index + 1}: add a hotel or destination.`);
  });
  if (errors.length) return { ok: false, errors };
  const sorted = cleaned.sort((a, b) => a.minutes - b.minutes);
  const waves = [];
  sorted.forEach((flight) => {
    const current = waves[waves.length - 1];
    if (!current || flight.minutes - current.lastMinutes > groupingWindow) {
      waves.push({ flights: [flight], startMinutes: flight.minutes, lastMinutes: flight.minutes });
    } else {
      current.flights.push(flight);
      current.lastMinutes = flight.minutes;
    }
  });
  const hotelTotals = {};
  const output = waves.map((wave, index) => {
    const passengers = wave.flights.reduce((sum, flight) => sum + flight.passengers, 0);
    const hotels = {};
    wave.flights.forEach((flight) => {
      hotels[flight.hotel] = (hotels[flight.hotel] || 0) + flight.passengers;
      hotelTotals[flight.hotel] = (hotelTotals[flight.hotel] || 0) + flight.passengers;
    });
    return {
      wave: index + 1,
      start: timeFromMinutes(wave.startMinutes),
      end: timeFromMinutes(wave.lastMinutes),
      holdingMinutes: wave.lastMinutes - wave.startMinutes,
      passengers,
      vehicles: Math.ceil(passengers / vehicleCapacity),
      meetTeams: Math.ceil(passengers / meetCapacity),
      flights: wave.flights.map((flight) => flight.reference),
      hotels,
    };
  });
  return { ok: true, waves: output, hotelTotals, totalPassengers: sorted.reduce((sum, flight) => sum + flight.passengers, 0), totalVehicles: output.reduce((sum, wave) => sum + wave.vehicles, 0) };
}

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}
export function allocateGuides(input) {
  const groups = Array.isArray(input.groups) ? input.groups : [];
  const guides = Array.isArray(input.guides) ? input.guides : [];
  const errors = [];
  if (!groups.length) errors.push("Add at least one group.");
  if (!guides.length) errors.push("Add at least one available guide.");
  const cleanGroups = groups.map((group, index) => ({ id: String(group.id || `Group ${index + 1}`).trim(), language: String(group.language || "").trim().toLowerCase(), guests: finite(group.guests), start: minutesFromTime(group.start), duration: finite(group.duration), location: String(group.location || "").trim() }));
  const cleanGuides = guides.map((guide, index) => ({ id: String(guide.id || `Guide ${index + 1}`).trim(), languages: String(guide.languages || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean), start: minutesFromTime(guide.start), end: minutesFromTime(guide.end), assignments: [] }));
  cleanGroups.forEach((group, index) => {
    if (!group.language || !Number.isFinite(group.start) || !Number.isFinite(group.duration) || group.duration <= 0 || group.duration > 1440 || !Number.isInteger(group.guests) || group.guests < 1 || !group.location) errors.push(`Group ${index + 1} has missing or invalid operating information.`);
  });
  cleanGuides.forEach((guide, index) => {
    if (!guide.languages.length || !Number.isFinite(guide.start) || !Number.isFinite(guide.end) || guide.end <= guide.start) errors.push(`Guide ${index + 1} has missing languages or an invalid availability window.`);
  });
  if (errors.length) return { ok: false, errors };
  const assignments = [];
  const unassigned = [];
  cleanGroups.sort((a, b) => a.start - b.start).forEach((group) => {
    const end = group.start + group.duration;
    const eligible = cleanGuides.filter((guide) => guide.languages.includes(group.language) && guide.start <= group.start && guide.end >= end && !guide.assignments.some((item) => intervalsOverlap(group.start, end, item.start, item.end))).sort((a, b) => a.assignments.length - b.assignments.length || a.id.localeCompare(b.id));
    if (!eligible.length) {
      unassigned.push({ ...group, reason: "No listed guide matches the language and complete availability window without an overlap." });
      return;
    }
    const guide = eligible[0];
    const record = { group: group.id, guide: guide.id, language: group.language, guests: group.guests, location: group.location, start: timeFromMinutes(group.start), end: timeFromMinutes(end) };
    guide.assignments.push({ start: group.start, end });
    assignments.push(record);
  });
  return { ok: true, assignments, unassigned, coveragePct: round((assignments.length / cleanGroups.length) * 100, 1), note: "Assignments use a transparent greedy fit by language and availability; a supervisor must review competence, licences, service fit and local requirements." };
}

export function summarizeJourney(rows) {
  const entries = Array.isArray(rows) ? rows.map((row) => ({ stage: String(row.stage || "").trim(), touchpoint: String(row.touchpoint || "").trim(), expectation: String(row.expectation || "").trim(), owner: String(row.owner || "").trim(), risk: String(row.risk || "").trim(), kpi: String(row.kpi || "").trim(), improvement: String(row.improvement || "").trim() })) : [];
  const errors = [];
  if (!entries.length) errors.push("Add at least one guest touchpoint.");
  entries.forEach((row, index) => { if (!row.stage || !row.touchpoint || !row.owner || !["Low", "Medium", "High"].includes(row.risk)) errors.push(`Touchpoint ${index + 1} needs a stage, touchpoint, owner and risk level.`); });
  if (errors.length) return { ok: false, errors };
  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  entries.forEach((row) => { riskCounts[row.risk] += 1; });
  return { ok: true, entries, riskCounts, priorities: entries.filter((row) => row.risk === "High" || row.improvement).length };
}

export function buildSopOutline(input) {
  const value = (key) => String(input[key] || "").trim();
  const steps = value("steps").split(/\n+/).map((item) => item.replace(/^\s*\d+[.)-]?\s*/, "").trim()).filter(Boolean);
  const errors = [];
  for (const [key, label] of [["process", "Process name"], ["objective", "Objective"], ["scope", "Scope"], ["trigger", "Trigger"]]) if (!value(key)) errors.push(`${label} is required.`);
  if (!steps.length) errors.push("Add at least one main procedure step, one per line.");
  if (errors.length) return { ok: false, errors };
  const sections = [
    ["1. Purpose", value("objective")], ["2. Scope", value("scope")], ["3. Roles and responsibilities", value("roles") || "To be assigned and approved."], ["4. Trigger and entry conditions", value("trigger")], ["5. Procedure", steps.map((step, index) => `${index + 1}. ${step}`).join("\n")], ["6. Controls and decision points", value("controls") || "To be defined through operational and risk review."], ["7. Exceptions and escalation", value("escalation") || "Follow approved management authority and company escalation rules."], ["8. Records and evidence", value("records") || "Define the minimum evidence, owner, storage location and retention rule."],
  ];
  const text = `${value("process")} — SOP STRUCTURE\n\n${sections.map(([title, content]) => `${title}\n${content}`).join("\n\n")}\n\nPlanning note: This outline requires company, legal, safety, privacy and regulatory review where applicable.`;
  return { ok: true, title: value("process"), steps, sections, text };
}
