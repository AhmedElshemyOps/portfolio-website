const assert = require("node:assert/strict");
const {
  extract,
  changes,
  usableRate,
  validBackup,
} = require("../live-demos/assets/js/infraquote-workspace.js");
assert.deepEqual(
  extract(
    "Client: Example Travel\n2026-11-15; 6 adults; 2 children; full day; French guide\nPickup: Test hotel\nDrop-off: Museum",
  ),
  {
    serviceDate: "2026-11-15",
    adults: 6,
    children: 2,
    tourDuration: "Full day",
    guideLanguage: "French",
    pickupLocation: "Test hotel",
    dropoffLocation: "Museum",
    clientCompany: "Example Travel",
  },
);
assert.deepEqual(extract("Please help me arrange a nice trip."), {});
assert.deepEqual(extract("4 hours, 8 guests"), {
  adults: 8,
  tourDuration: "Custom",
  customHours: 4,
});
assert.equal(extract("12 guests including children").adults, undefined);
assert.equal(extract("2026-02-31").serviceDate, undefined);
assert.equal(
  extract("12 guests; 2 children").adults,
  undefined,
  "Ambiguous adults must not be inferred",
);
assert.equal(extract("No airport pickup needed").airportPickup, undefined);
assert.equal(extract("the full-day itinerary").tourDuration, "Full day");
assert.deepEqual(
  changes({ a: 1, b: [2] }, { a: 2, b: [2], c: 3 }).map((x) => x.field),
  ["a", "c"],
);
const rate = {
  unitCost: 50,
  verified: true,
  validFrom: "2026-10-01",
  validTo: "2026-10-31",
};
assert(usableRate(rate, "2026-10-01"));
assert(usableRate(rate, "2026-10-31"));
assert(!usableRate(rate, "2026-11-01"));
assert(!usableRate({ ...rate, verified: false }, "2026-10-10"));
assert(!usableRate({ ...rate, unitCost: -1 }, "2026-10-10"));
console.log(
  "InfraQuote extraction, version differences and rate validity checks passed.",
);

assert(
  !validBackup({
    format: "infraquote-backup-v1",
    workspace: { templates: [], versions: [{}], rates: [], metrics: [] },
    draft: { quoteNo: "TEST", itinerary: [], costs: [] },
  }),
);

assert(
  validBackup({
    format: "infraquote-backup-v1",
    workspace: { templates: [], versions: [], rates: [], metrics: [] },
    draft: { quoteNo: "TEST", itinerary: [], costs: [] },
  }),
);
