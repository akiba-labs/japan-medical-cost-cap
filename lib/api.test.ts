import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL, parseYen } from "./api";

const e = ENDPOINTS.check;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} → cap ¥92,940`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.verdict, "cap_applies");
  assert.equal(body.band.id, "y370");
  assert.equal(body.month.monthlyCap, 92_940);
  assert.equal(body.month.monthlyRefund, 207_060);
  assert.equal(body.claim.deadline, "2028-11-30");
  assert.equal(body.rulesAsOf, "2026-11-04");
  assert.ok(body.sources.length >= 6);
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(url.searchParams)) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("aliases, Japanese values, 万 amounts and the months tracker", async () => {
  const b = await (await handler(new Request(`${PUBLIC_URL}${e.path}?age=72&${encodeURIComponent("区分")}=${encodeURIComponent("一般")}&month=${encodeURIComponent("2026年11月")}&paid=30000&care=${encodeURIComponent("外来")}`))).json();
  assert.equal(b.ageGroup, "70plus");
  assert.equal(b.month.setting, "outpatient");
  assert.equal(b.month.monthlyCap, 22_000);
  const t = await (await handler(new Request(`${PUBLIC_URL}${e.path}?band=y370&months=2026-08:30${encodeURIComponent("万")},2026-09:300000,2026-10:300000,2026-11:300000`))).json();
  assert.equal(t.tracker.months.length, 4);
  assert.equal(t.tracker.months[3].manyTimes, true);
  const p = await (await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ band: "y370", months: [{ month: "2026-08", totalCost: 300000 }, { month: "2026-09", copay: 90000 }] }) }))).json();
  assert.equal(p.tracker.months[1].totalCost, 300_000);
  assert.equal(parseYen("100万円", "x"), 1_000_000);
  assert.equal(parseYen("1.5m", "x"), 1_500_000);
  assert.equal(parseYen("¥92,940", "x"), 92_940);
});

test("bad inputs → 400 with example", async () => {
  for (const q of ["month=2026-11", "totalCost=lots", "totalCost=-5", "band=zz", "month=2026-13&totalCost=1", "ageGroup=old&totalCost=1", "burdenRate=0.5&totalCost=1", "nonTaxable=maybe&totalCost=1", "months=garbage", "priorHitMonths=x&totalCost=1", "band=nontaxable_low&totalCost=1"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}?${q}`));
    assert.equal(res.status, 400, q);
    const body = await res.json();
    assert.equal(body.disclaimer, API_DISCLAIMER);
    assert.ok(body.example);
  }
});

test("malformed JSON body → 400", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{nope" }));
  assert.equal(res.status, 400);
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI lists /api/check GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { openapi: string; paths: Record<string, { get: { parameters: { name: string }[] }; post: unknown }> };
  assert.ok(spec.openapi.startsWith("3."));
  assert.ok(spec.paths["/api/check"]?.post);
  assert.ok(spec.paths["/api/check"].get.parameters.find((p) => p.name === "totalCost"));
});
