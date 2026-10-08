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

const cruise = {
  ...find("blue-boat"),
  attractionId: "blue-boat",
  status: "Included",
  ticketVerification: "Verified",
  adultTicket: 20,
  childTicket: 10,
  infantTicket: 0,
  availabilityConfirmed: true,
  availabilityDate: base.serviceDate,
  entryTime: "13:00",
  conditionsReviewed: true,
  conditionsReviewedDate: base.serviceDate,
};
const cruiseQuote = { ...dated, itinerary: [cruise] };
assert(
  NL.checks(cruiseQuote).blocking.some((x) => x.includes("product price")),
  "A filled rate is not a dated fare confirmation",
);
const confirmedCruise = {
  ...cruise,
  priceConfirmed: true,
  priceConfirmedDate: base.serviceDate,
  priceEvidence:
    "Fictional pilot fare; Classic City Cruise, 22 October 2026, all fees included",
};
assert.equal(
  NL.checks({ ...cruiseQuote, itinerary: [confirmedCruise] }).blocking.length,
  0,
);
assert(
  NL.checks({
    ...cruiseQuote,
    itinerary: [{ ...confirmedCruise, priceEvidence: " " }],
  }).blocking.some((x) => x.includes("product price")),
);
assert(
  NL.checks({
    ...cruiseQuote,
    itinerary: [{ ...confirmedCruise, priceConfirmedDate: "2026-10-23" }],
  }).blocking.some((x) => x.includes("product price")),
);
assert(
  !NL.checks({
    ...cruiseQuote,
    itinerary: [{ ...cruise, ticketVerification: "Client pays directly" }],
  }).blocking.some((x) => x.includes("product price")),
  "Client-paid admission has no included fare to attest",
);
assert(
  NL.checks({
    ...dated,
    adults: 1,
    children: 1,
    guestAges: "40,3",
    itinerary: [{ ...cruise, attractionId: "this-is-holland" }],
  }).blocking.some((x) => x.includes("four or above")),
);
assert(
  NL.checks({
    ...dated,
    serviceDate: "2027-04-27",
    itinerary: [{ ...cruise, attractionId: "hart" }],
  }).blocking.some((x) => x.includes("closed")),
);
assert(
  NL.city.attractions
    .filter((a) => a.dateDependent)
    .every((a) => a.adult === null),
  "Indicative prices never become guaranteed fares",
);
console.log(
  "Date-specific fare evidence, age restrictions and exhibition closures passed.",
);

// Full synthetic template scenarios: no supplier rates are represented as real offers.
for (const [templateIndex, expectedNet] of [
  [0, 220],
  [1, 277],
  [2, 364.5],
  [3, 213],
]) {
  const template = NL.setup(templateIndex);
  const scenario = {
    ...base,
    ...template,
    adults: 2,
    children: 0,
    infants: 0,
    guestAges: "40,35",
    nlGuideRate: 180,
    taxReviewed: true,
    vatMode: "margin",
  };
  if (templateIndex === 2) {
    scenario.children = 2;
    scenario.guestAges = "40,35,10,3";
  }
  scenario.itinerary = template.itineraryIds.map((id) => ({
    ...find(id),
    attractionId: id,
    status: "Included",
    ticketVerification: "Verified",
    adultTicket: id === "blue-boat" ? 20 : find(id).adult,
    childTicket: null,
    infantTicket: null,
    entryTime: "13:00",
    availabilityConfirmed: true,
    availabilityDate: scenario.serviceDate,
    conditionsReviewed: true,
    conditionsReviewedDate: scenario.serviceDate,
    referenceChecked: find(id).reference.checked,
    priceConfirmed: true,
    priceConfirmedDate: scenario.serviceDate,
    priceEvidence: "Synthetic all-in fare for testing only",
  }));
  assert.equal(
    NL.checks(scenario, new Date("2026-10-08")).blocking.length,
    0,
    template.tourTitle,
  );
  const net =
    180 +
    scenario.itinerary
      .filter((stop) => stop.ticketRequired)
      .reduce(
        (sum, stop) =>
          sum +
          NL.tickets(stop, scenario).groups.reduce(
            (n, g) => n + g.quantity * g.price,
            0,
          ),
        0,
      );
  assert.equal(net, expectedNet, template.tourTitle + " costing");
  const price = C.pricing({
    netCost: net,
    method: "margin",
    targetMarginPct: 22,
    vatMode: "margin",
    vatRate: 0.21,
    totalGuests: scenario.adults + scenario.children + scenario.infants,
    adults: 2,
    children: scenario.children,
    rounding: 5,
  });
  assert(price.finalPrice > net);
  assert(price.actualMargin >= 22);
  assert.equal(
    Math.round((price.finalPrice - net - price.vatAmount) * 100),
    Math.round(price.profit * 100),
  );
  assert(
    NL.checks(
      { ...scenario, serviceDate: "2026-10-23" },
      new Date("2026-10-08"),
    ).blocking.some((x) => x.includes("availability")),
    "Date changes require reconfirmation",
  );
}
console.log(
  "Four complete Amsterdam template scenarios passed: costing, margin VAT and date reconfirmation.",
);
