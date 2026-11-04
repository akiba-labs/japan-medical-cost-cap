import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLES, EXAMPLE_SHARED, isIndexable, parseShared, resultPath, safeCheck, sharedQuery } from "./share";

test("share links round-trip and compute", () => {
  for (const ex of EXAMPLES) {
    const back = parseShared(new URLSearchParams(sharedQuery(ex)));
    assert.deepEqual(back, ex);
    assert.ok(isIndexable(ex));
    assert.ok(safeCheck(ex), JSON.stringify(ex));
  }
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?b=y370&m=2026-11&t=1000000");
  assert.equal(safeCheck(EXAMPLES[0])!.month.monthlyCap, 92_940);
  assert.equal(safeCheck(EXAMPLES[1])!.month.monthlyCap, 121_720);
  assert.equal(safeCheck(EXAMPLES[2])!.month.monthlyCap, 22_000);
});

test("bad share params → null or defaults", () => {
  assert.equal(parseShared(new URLSearchParams("b=y370")), null);
  assert.equal(parseShared(new URLSearchParams("m=soon&t=1")), null);
  assert.equal(parseShared(new URLSearchParams("b=zz&t=100"))!.band, "y370");
  assert.equal(safeCheck(parseShared(new URLSearchParams("m=2010-01&t=100"))!), null);
});
