import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(
  process.argv[2] ? pathToFileURL(process.argv[2]).href : "@electric-sql/pglite"
);
const db = new PGlite();
await db.exec(
  await fs.readFile(
    new URL("../backend/infraquote/test-bootstrap.sql", import.meta.url),
    "utf8",
  ),
);
await db.exec(
  await fs.readFile(
    new URL("../backend/infraquote/schema.sql", import.meta.url),
    "utf8",
  ),
);
const [owner, other, sales, ops] = [1, 2, 3, 4].map(
  (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
);
await db.query("insert into auth.users values ($1),($2),($3),($4)", [
  owner,
  other,
  sales,
  ops,
]);
async function as(user, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    user || "",
  ]);
  await db.exec(`set role ${role}`);
}
async function rejected(sql, params = []) {
  await assert.rejects(() => db.query(sql, params));
}
async function count(table) {
  return Number(
    (await db.query(`select count(*) n from public.${table}`)).rows[0].n,
  );
}
await as(owner);
const workspace = (
  await db.query("select public.iq_create_workspace('Test Company') id")
).rows[0].id;
await db.query("select public.iq_add_member($1,$2,$3)", [
  workspace,
  sales,
  "sales",
]);
await db.query("select public.iq_add_member($1,$2,$3)", [
  workspace,
  ops,
  "operations",
]);
await db.query(
  "insert into public.iq_rates(workspace_id,name,unit_cost,quantity,valid_from,valid_to,verified) values($1,'Private test rate',100,1,'2026-10-01','2026-12-01',true)",
  [workspace],
);
await db.query(
  "insert into public.iq_templates(workspace_id,name,setup) values($1,'Template','{}')",
  [workspace],
);
const payload = {
  quote: {
    quoteNo: "TEST-001",
    clientCompany: "Synthetic Client",
    tourTitle: "Test Tour",
    serviceDate: "2026-11-01",
    tourDuration: "Full day",
    vehicleQty: 1,
    validityDate: "2026-10-20",
    quoteDate: "2026-10-08",
    cancellation: "Supplier terms apply.",
    adults: 4,
    children: 0,
    infants: 0,
    pickupLocation: "Test hotel",
    dropoffLocation: "Test hotel",
    itinerary: [
      {
        name: "Test stop",
        status: "Included",
        operationalNote: "Meet at entrance",
      },
    ],
    costs: [{ supplier: "private supplier", unitCost: 100 }],
    targetMargin: 22,
  },
  lines: [
    { name: "Vehicle", type: "Fixed", include: true, verification: "Verified" },
  ],
  blocking: 0,
  pending: 0,
  reviewConfirmed: true,
};
const version = (
  await db.query("select public.iq_save_version($1,$2,true) id", [
    workspace,
    payload,
  ])
).rows[0].id;
assert.equal(await count("iq_versions"), 1);
assert.equal(await count("iq_handovers"), 1);
await rejected("update public.iq_versions set approved=false where id=$1", [
  version,
]);
await rejected("delete from public.iq_versions where id=$1", [version]);
await rejected("select public.iq_add_member($1,$2,$3)", [
  workspace,
  owner,
  "operations",
]);
await as(other);
assert.equal(await count("iq_workspaces"), 0);
assert.equal(await count("iq_members"), 0);
assert.equal(await count("iq_rates"), 0);
assert.equal(await count("iq_templates"), 0);
assert.equal(await count("iq_versions"), 0);
assert.equal(await count("iq_handovers"), 0);
assert.equal(await count("iq_audit"), 0);
await rejected("select public.iq_save_version($1,$2,false)", [
  workspace,
  payload,
]);
await rejected(
  "insert into public.iq_rates(workspace_id,name,unit_cost,quantity,valid_from,valid_to) values($1,'Intrusion',10,1,'2026-10-01','2026-12-01')",
  [workspace],
);
await rejected("select public.iq_add_member($1,$2,$3)", [
  workspace,
  other,
  "admin",
]);
await as(ops);
assert.equal(await count("iq_rates"), 0);
assert.equal(await count("iq_templates"), 0);
assert.equal(await count("iq_versions"), 0);
assert.equal(await count("iq_handovers"), 1);
assert.equal(await count("iq_audit"), 0);
const service = (await db.query("select service from public.iq_handovers"))
  .rows[0].service;
for (const key of [
  "costs",
  "targetMargin",
  "sellingPrice",
  "clientEmail",
  "supplier",
  "flightNumber",
])
  assert.equal(key in service, false, `Handover must omit ${key}`);
assert.equal(service.guestCount, 4);
assert.equal(service.reference, "TEST-001");
await rejected("select public.iq_save_version($1,$2,false)", [
  workspace,
  payload,
]);
await as(sales);
assert.equal(await count("iq_rates"), 1);
assert.equal(await count("iq_templates"), 1);
assert.equal(await count("iq_versions"), 1);
await rejected("select public.iq_add_member($1,$2,$3)", [
  workspace,
  other,
  "sales",
]);
await rejected("update public.iq_workspaces set owner_id=$1 where id=$2", [
  sales,
  workspace,
]);
await db.query("select public.iq_save_version($1,$2,false)", [
  workspace,
  payload,
]);
assert.equal(await count("iq_versions"), 2);
await rejected("select public.iq_save_version($1,$2,true)", [
  workspace,
  { ...payload, pending: 1 },
]);
await rejected("select public.iq_save_version($1,$2,true)", [
  workspace,
  {
    ...payload,
    lines: [
      { include: true, type: "Fixed", verification: "Pending verification" },
    ],
  },
]);
await rejected("select public.iq_save_version($1,$2,true)", [
  workspace,
  {
    ...payload,
    lines: [
      {
        include: true,
        type: "Fixed",
        verification: "Verified",
        validFrom: "2026-12-01",
        validTo: "2026-12-31",
      },
    ],
  },
]);
await rejected("select public.iq_save_version($1,$2,true)", [
  workspace,
  { ...payload, quote: { ...payload.quote, children: -1 } },
]);
assert.equal(
  (
    await db.query(
      "update public.iq_workspaces set name='Unauthorized change' where id=$1 returning id",
      [workspace],
    )
  ).rows.length,
  0,
);
await rejected("insert into public.iq_members values($1,$2,$3)", [
  workspace,
  other,
  "admin",
]);
await db.query("insert into public.iq_rates(workspace_id,name,unit_cost,quantity,currency,valid_from,valid_to) values($1,'Amsterdam guide',180,1,'EUR','2026-10-01','2026-12-01')",[workspace]);
const dutch={...payload,quote:{...payload.quote,quoteNo:'AMS-TEST',city:'amsterdam',currency:'EUR',taxReviewed:true,vatMode:'margin'}};
await rejected("select public.iq_save_version($1,$2,true)",[workspace,{...dutch,quote:{...dutch.quote,currency:'AED'}}]);
await rejected("select public.iq_save_version($1,$2,true)",[workspace,{...dutch,quote:{...dutch.quote,taxReviewed:false}}]);
const dutchVersion=(await db.query("select public.iq_save_version($1,$2,true) id",[workspace,dutch])).rows[0].id;
const dutchHandover=(await db.query("select service from public.iq_handovers where version_id=$1",[dutchVersion])).rows[0].service;
assert.equal(dutchHandover.country,'netherlands');assert.equal(dutchHandover.city,'amsterdam');assert.equal(dutchHandover.costs,undefined);
await as(null, "anon");
for (const table of [
  "iq_workspaces",
  "iq_members",
  "iq_rates",
  "iq_templates",
  "iq_versions",
  "iq_handovers",
  "iq_audit",
])
  await rejected(`select * from public.${table}`);
await rejected("select public.iq_create_workspace('Anonymous')");
await db.close();
console.log(
  "Postgres migration, company isolation, permissions, immutable history, approval gates and sanitized handover checks passed.",
);
