const assert = require("node:assert/strict");
const NL = require("../live-demos/assets/js/infraquote-amsterdam.js");
const fs = require("node:fs"),
  vm = require("node:vm");
const ctx = {
  window: {},
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {},
  },
};
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync("live-demos/assets/js/infraquote-calculations.js", "utf8"),
  ctx,
);
const C = ctx.window.INFRAQUOTE_CALC;
assert.equal(NL.city.attractions.length, 25);
assert.equal(
  NL.city.attractions.filter((a) => a.ticketRequired && a.reference.checked)
    .length,
  15,
);
assert(
  NL.city.attractions
    .filter((a) => a.ticketRequired && !a.reference.checked)
    .every((a) => a.adult === null),
);
const find = (id) => NL.city.attractions.find((a) => a.id === id);
const q = {
  adults: 2,
  children: 2,
  infants: 1,
  guestAges: "40, 35, 18, 10, 2",
};
const total = (id) =>
  NL.tickets(find(id), q).groups.reduce((s, g) => s + g.quantity * g.price, 0);
assert.equal(total("rijksmuseum"), 50, "18-year-old admission is free");
assert.equal(
  total("anne-frank"),
  57.5,
  "18+ adult, 10–17 youth and booking fee for toddlers",
);
assert.equal(total("nemo"), 86, "Age 4+ paid, toddlers free");
assert.equal(
  total("rembrandt-house"),
  70,
  "18–25 youth product, under six free",
);
assert.equal(
  total("artis"),
  125,
  "13+ adult rate, 3–12 child, under three free",
);
assert(
  NL.tickets(find("adam-lookout"), q).error,
  "Unknown under-four price cannot silently become free",
);
assert(NL.tickets(find("rijksmuseum"), { ...q, guestAges: "40,35" }).error);
assert(
  NL.tickets(find("rijksmuseum"), { ...q, guestAges: "40,35,,10,2" }).error,
);
assert(NL.tickets({ ageBands: [{ min: 0, max: 120, price: -1 }] }, q).error);
assert(
  NL.tickets({ adultTicket: null }, { ...q, children: 0, infants: 0 }).error,
);
const walk = {
  attractionId: "centre-walk",
  name: "Walk",
  centreWalk: true,
  status: "Included",
  ticketRequired: false,
};
const base = {
  city: "amsterdam",
  currency: "EUR",
  adults: 5,
  children: 0,
  infants: 0,
  itinerary: [walk],
  transportPlan: "walking",
  guideIncluded: true,
  nlGuideRate: 180,
  vatMode: "none",
  taxReviewed: true,
  pickupTime: "09:00",
  serviceDate: "2026-10-22",
};
assert(NL.checks(base).blocking.some((x) => x.includes("exemption")));
assert.equal(NL.checks({ ...base, walkExemption: true }).blocking.length, 0);
assert(
  NL.checks({ ...base, adults: 16, walkExemption: true }).blocking.some((x) =>
    x.includes("15 participants"),
  ),
);
assert(
  NL.checks({ ...base, currency: "AED" }).blocking.some((x) =>
    x.includes("EUR"),
  ),
);
assert(
  NL.checks({ ...base, taxReviewed: false }).blocking.some((x) =>
    x.includes("tax"),
  ),
);
assert(
  NL.checks({
    ...base,
    transportPlan: "vehicle",
    nlVehicleRate: 500,
  }).blocking.some((x) => x.includes("vehicle access")),
);
const museum = {
  ...find("rijksmuseum"),
  attractionId: "rijksmuseum",
  status: "Included",
  ticketVerification: "Pending verification",
  conditionsReviewed: true,
  conditionsReviewedDate: base.serviceDate,
  entryTime: "10:00",
  availabilityConfirmed: true,
  availabilityDate: base.serviceDate,
};
const dated = { ...base, adults: 2, guestAges: "40,35", itinerary: [museum] };
assert.equal(NL.checks(dated, new Date("2026-10-08")).blocking.length, 0);
assert(
  NL.checks(
    { ...dated, serviceDate: "2026-10-23" },
    new Date("2026-10-08"),
  ).blocking.some((x) => x.includes("availability")),
);
assert(
  NL.checks(
    { ...dated, itinerary: [{ ...museum, referenceChecked: "2026-08-01" }] },
    new Date("2026-10-08"),
  ).blocking.some((x) => x.includes("30 days")),
);
const margin = C.pricing({
  netCost: 100,
  method: "margin",
  targetMarginPct: 20,
  vatMode: "margin",
  vatRate: 0.21,
  totalGuests: 2,
  adults: 2,
  children: 0,
  rounding: 1,
});
assert.equal(margin.finalPrice, 132);
assert.equal(margin.vatAmount, 5.55);
assert.equal(margin.profit, 26.45);
const standard = C.pricing({
  netCost: 100,
  method: "markup",
  markupPct: 20,
  vatMode: "exclusive",
  vatRate: 0.21,
  totalGuests: 2,
  adults: 2,
  children: 0,
  rounding: 1,
});
assert.equal(standard.finalPrice, 145.2);
assert(NL.setup(2).itineraryIds.includes("nemo"));
assert.equal(NL.setup().vatMode, "pending");
console.log(
  "Amsterdam age bands, unknown prices, date confirmation, local operating rules, native currency and tax calculations passed.",
);

assert.equal(
  total("van-gogh"),
  75,
  "18-year-olds pay adult admission at Van Gogh",
);
assert.equal(total("hortus"), 52.75);
assert.equal(total("resistance"), 62);
assert.equal(
  total("foam"),
  48,
  "13+ use the standard rate unless a discount is confirmed",
);
assert(
  NL.checks({
    ...base,
    adults: 1,
    children: 1,
    guestAges: "40,17",
    itinerary: [
      {
        attractionId: "heineken",
        name: "Heineken",
        status: "Included",
        ticketRequired: false,
      },
    ],
  }).blocking.some((x) => x.includes("restricted")),
);
assert(
  NL.checks({
    ...base,
    serviceDate: "2026-12-25",
    itinerary: [
      {
        attractionId: "hortus",
        name: "Hortus",
        status: "Included",
        ticketRequired: false,
      },
    ],
  }).blocking.some((x) => x.includes("closed")),
);
