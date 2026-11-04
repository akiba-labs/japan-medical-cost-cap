import assert from "node:assert/strict";
import test from "node:test";
import { RULES, RuleInputError, annualPeriod, bandFromAnnualIncome, bandFromNhiIncome, bandFromSmr, bandFromTaxable70, capFor, checkCap, claimDeadline, parseMonth, scheduleFor } from "./cap";

test("schedules switch on 2026-08 and 2027-08", () => {
  assert.equal(scheduleFor("2026-07"), "pre");
  assert.equal(scheduleFor("2026-08"), "r8");
  assert.equal(scheduleFor("2027-07"), "r8");
  assert.equal(scheduleFor("2027-08"), "r9");
});

test("MHLW worked example: ¥1,000,000 bill, income ¥3.7M–5.1M", () => {
  const pre = checkCap({ month: "2026-07", totalCost: 1_000_000, band: "y370" });
  assert.equal(pre.month.monthlyCap, 87_430);
  assert.equal(pre.month.copay, 300_000);
  assert.equal(pre.month.monthlyRefund, 212_570);
  const r8 = checkCap({ month: "2026-11", totalCost: 1_000_000, band: "y370" });
  assert.equal(r8.month.monthlyCap, 92_940);
  assert.equal(r8.verdict, "cap_applies");
  assert.equal(r8.beforeAug2026!.changeJPY, 5_510);
  assert.equal(r8.from2027!.youPay, 92_940);
  assert.equal(r8.annualCap!.amount, 530_000);
  assert.deepEqual(r8.annualCap!.period, { from: "2026-08", to: "2027-07" });
});

test("2027-08 split bands", () => {
  assert.equal(checkCap({ month: "2027-09", totalCost: 1_000_000, band: "y510" }).month.monthlyCap, 104_830);
  assert.equal(checkCap({ month: "2027-09", totalCost: 1_000_000, band: "y650" }).month.monthlyCap, 116_720);
  assert.equal(checkCap({ month: "2027-09", totalCost: 2_000_000, band: "y1650" }).month.monthlyCap, 350_600);
  const low = checkCap({ month: "2027-09", totalCost: 500_000, band: "y0", manyTimes: true });
  assert.equal(low.month.monthlyCap, 34_500);
  assert.equal(low.verdict, "many_times_cap");
  const r8 = checkCap({ month: "2026-11", totalCost: 1_000_000, band: "y650" });
  assert.equal(r8.from2027!.monthlyCap, 116_720);
  assert.equal(r8.from2027!.changeJPY, 116_720 - 92_940);
});

test("70+ outpatient caps and flat bands", () => {
  const out = checkCap({ ageGroup: "70plus", band: "y200", month: "2026-11", copay: 30_000, setting: "outpatient" });
  assert.equal(out.burdenRate, 0.2);
  assert.equal(out.month.monthlyCap, 22_000);
  assert.equal(out.month.monthlyRefund, 8_000);
  assert.equal(capFor("70plus", "y260", "r9").outpatient, 28_000);
  assert.equal(capFor("70plus", "nontaxable", "pre").outpatient, 8_000);
  assert.equal(capFor("70plus", "nontaxable_low", "r8").base, 15_700);
  assert.equal(capFor("under70", "nontaxable", "r8").base, 36_900);
  assert.equal(capFor("70plus", "y1160", "r8").outpatient, undefined);
});

test("under cap → no refund", () => {
  const r = checkCap({ month: "2026-11", copay: 20_000, band: "y370" });
  assert.equal(r.verdict, "under_cap");
  assert.equal(r.month.monthlyRefund, 0);
});

test("12-month tracker: 多数回 from the 4th month and the Aug–Jul annual cap", () => {
  const months = Array.from({ length: 12 }, (_, k) => ({ month: k < 5 ? `2026-${String(8 + k).padStart(2, "0")}` : `2027-${String(k - 4).padStart(2, "0")}`, totalCost: 300_000 }));
  const r = checkCap({ band: "y370", months });
  const t = r.tracker!;
  assert.equal(t.months[0].monthlyCap, 85_940);
  assert.equal(t.months[2].manyTimes, false);
  assert.equal(t.months[3].manyTimes, true);
  assert.equal(t.months[3].monthlyCap, 44_400);
  assert.equal(t.years.length, 1);
  assert.equal(t.years[0].paidAfterMonthlyCaps, 657_420);
  assert.equal(t.years[0].annualRefund, 127_420);
  assert.equal(r.verdict, "annual_cap_reached");
});

test("priorHitMonths ≥ 3 triggers 多数回", () => {
  assert.equal(checkCap({ month: "2026-11", totalCost: 1_000_000, band: "y370", priorHitMonths: 3 }).month.monthlyCap, 44_400);
});

test("claim deadline is 2 years from the 1st of the next month", () => {
  assert.equal(claimDeadline("2026-11"), "2028-11-30");
  assert.equal(claimDeadline("2026-12"), "2028-12-31");
  assert.equal(claimDeadline("2026-02"), "2028-02-29");
  assert.deepEqual(annualPeriod("2027-03"), { from: "2026-08", to: "2027-07" });
  assert.equal(annualPeriod("2026-07"), null);
});

test("income → band", () => {
  assert.equal(bandFromSmr(300_000), "y370");
  assert.equal(bandFromSmr(410_000), "y510");
  assert.equal(bandFromSmr(260_000), "y260");
  assert.equal(bandFromSmr(150_000), "y0");
  assert.equal(bandFromSmr(1_270_000), "y1650");
  assert.equal(bandFromNhiIncome(9_000_000), "y1040");
  assert.equal(bandFromNhiIncome(9_020_000), "y1160");
  assert.equal(bandFromTaxable70(1_450_000), "y370");
  assert.equal(bandFromTaxable70(270_000), "y0");
  assert.equal(bandFromAnnualIncome(4_500_000), "y370");
  assert.equal(checkCap({ month: "2026-11", totalCost: 100_000, standardMonthlyRemuneration: 500_000 }).band.id, "y650");
  assert.equal(checkCap({ month: "2026-11", totalCost: 100_000 }).band.source.startsWith("default"), true);
});

test("bad input throws RuleInputError", () => {
  assert.throws(() => checkCap({ band: "nontaxable_low", month: "2026-11", totalCost: 1 }), RuleInputError);
  assert.throws(() => checkCap({ month: "2026-11" }), RuleInputError);
  assert.throws(() => checkCap({ month: "2026-11", totalCost: -5 }), RuleInputError);
  assert.throws(() => checkCap({ month: "2026-11", totalCost: 5, burdenRate: 0.5 }), RuleInputError);
  assert.throws(() => checkCap({ month: "2026-11", totalCost: 5, taxableIncome: 1_000_000 }), RuleInputError);
  assert.throws(() => parseMonth("2026-13"), RuleInputError);
  assert.throws(() => parseMonth("2010-01"), RuleInputError);
  assert.equal(parseMonth("2026年11月"), "2026-11");
  assert.equal(parseMonth("2026/1"), "2026-01");
});

test("rules table covers every schedule", () => {
  assert.equal(Object.keys(RULES.table).length, 3);
  assert.equal(Object.keys(RULES.table.r9.under70).length, 13);
  assert.equal(Object.keys(RULES.table.r9["70plus"]).length, 14);
});
