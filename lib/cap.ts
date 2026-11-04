/**
 * Japan high-cost medical expense benefit (高額療養費) calculator.
 * Monthly cap = base + max(0, 10割 total − threshold) × 1%, three schedules:
 *   pre      : treatment months up to 2026-07
 *   r8       : 2026-08 … 2027-07 (higher caps, new annual cap)
 *   r9       : 2027-08 onward (12 income bands)
 * Source: MHLW 001726232.pdf (高額療養費制度の見直し), 協会けんぽ, city NHI pages. Rules as of RULES_AS_OF.
 */

export const RULES_AS_OF = "2026-11-04";

export const AGE_GROUPS = ["under70", "70plus"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const BANDS = ["y1650", "y1410", "y1160", "y1040", "y950", "y770", "y650", "y510", "y370", "y260", "y200", "y0", "nontaxable", "nontaxable_low"] as const;
export type Band = (typeof BANDS)[number];

export const SETTINGS = ["inpatient", "outpatient"] as const;
export type Setting = (typeof SETTINGS)[number];

export const SCHEDULES = ["pre", "r8", "r9"] as const;
export type ScheduleId = (typeof SCHEDULES)[number];

export class RuleInputError extends Error {}

export const DISCLAIMER =
  "Educational estimate, not medical, financial or legal advice. Not affiliated with the Ministry of Health, Labour and Welfare (MHLW), Japan Health Insurance Association (協会けんぽ), any health insurance society, city NHI office or hospital. Your insurer decides the actual benefit; extra benefits (付加給付) and local subsidies can lower your cost further. Rules as of 2026-11-04.";

export const SOURCES = [
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html",
  "https://www.mhlw.go.jp/content/001726232.pdf",
  "https://www.mhlw.go.jp/content/001729632.pdf",
  "https://www.kyoukaikenpo.or.jp/g3/sb3030/r150/",
  "https://www.city.setagaya.lg.jp/02060/33049.html",
  "https://www.city.machida.tokyo.jp/kurashi/hoken/kokuho/ironnakyuufu/kougaku.html",
  "https://www.city.fukuoka.lg.jp/hofuku/hokennenkin/hp/kokuminkenkouhoken/09-00.html",
  "https://laws.e-gov.go.jp/law/215IO0000000243",
];

export type BandInfo = { id: Band; label: string; labelJa: string; annualIncome: string; smr: string; nhiIncome: string; taxable70: string; legacy: string };

export const BAND_INFO: Record<Band, BandInfo> = {
  y1650: { id: "y1650", label: "Income about ¥16.5M+", labelJa: "年収約1,650万円〜", annualIncome: "about ¥16.5M+", smr: "¥1.27M+", nhiIncome: "over ¥13.56M", taxable70: "¥11.07M+", legacy: "ア" },
  y1410: { id: "y1410", label: "Income about ¥14.1M–16.5M", labelJa: "年収約1,410〜1,650万円", annualIncome: "about ¥14.1M–16.5M", smr: "¥1.03M–1.21M", nhiIncome: "¥11.1M–13.56M", taxable70: "¥9.0M–11.07M", legacy: "ア" },
  y1160: { id: "y1160", label: "Income about ¥11.6M–14.1M", labelJa: "年収約1,160〜1,410万円", annualIncome: "about ¥11.6M–14.1M", smr: "¥830k–980k", nhiIncome: "¥9.01M–11.1M", taxable70: "¥6.9M–9.0M", legacy: "ア" },
  y1040: { id: "y1040", label: "Income about ¥10.4M–11.6M", labelJa: "年収約1,040〜1,160万円", annualIncome: "about ¥10.4M–11.6M", smr: "¥710k–790k", nhiIncome: "¥8.09M–9.01M", taxable70: "¥6.14M–6.9M", legacy: "イ" },
  y950: { id: "y950", label: "Income about ¥9.5M–10.4M", labelJa: "年収約950〜1,040万円", annualIncome: "about ¥9.5M–10.4M", smr: "¥620k–680k", nhiIncome: "¥6.79M–8.09M", taxable70: "¥5.04M–6.14M", legacy: "イ" },
  y770: { id: "y770", label: "Income about ¥7.7M–9.5M", labelJa: "年収約770〜950万円", annualIncome: "about ¥7.7M–9.5M", smr: "¥530k–590k", nhiIncome: "¥6.0M–6.79M", taxable70: "¥3.8M–5.04M", legacy: "イ" },
  y650: { id: "y650", label: "Income about ¥6.5M–7.7M", labelJa: "年収約650〜770万円", annualIncome: "about ¥6.5M–7.7M", smr: "¥440k–500k", nhiIncome: "¥4.1M–6.0M", taxable70: "¥2.8M–3.8M", legacy: "ウ" },
  y510: { id: "y510", label: "Income about ¥5.1M–6.5M", labelJa: "年収約510〜650万円", annualIncome: "about ¥5.1M–6.5M", smr: "¥360k–410k", nhiIncome: "¥3.13M–4.1M", taxable70: "¥2.03M–2.8M", legacy: "ウ" },
  y370: { id: "y370", label: "Income about ¥3.7M–5.1M", labelJa: "年収約370〜510万円", annualIncome: "about ¥3.7M–5.1M", smr: "¥280k–340k", nhiIncome: "¥2.1M–3.13M", taxable70: "¥1.45M–2.03M", legacy: "ウ" },
  y260: { id: "y260", label: "Income about ¥2.6M–3.7M", labelJa: "年収約260〜370万円", annualIncome: "about ¥2.6M–3.7M", smr: "¥200k–260k", nhiIncome: "¥1.27M–2.1M", taxable70: "¥570k–1.45M", legacy: "エ" },
  y200: { id: "y200", label: "Income about ¥2.0M–2.6M", labelJa: "年収約200〜260万円", annualIncome: "about ¥2.0M–2.6M", smr: "¥160k–190k", nhiIncome: "¥860k–1.27M", taxable70: "¥280k–570k", legacy: "エ" },
  y0: { id: "y0", label: "Income up to about ¥2.0M", labelJa: "年収約200万円以下", annualIncome: "up to about ¥2.0M", smr: "¥150k or less", nhiIncome: "¥860k or less", taxable70: "under ¥280k", legacy: "エ" },
  nontaxable: { id: "nontaxable", label: "Resident-tax exempt (住民税非課税)", labelJa: "住民税非課税（低所得者・低所得II）", annualIncome: "resident-tax exempt", smr: "—", nhiIncome: "—", taxable70: "—", legacy: "オ / 低所得II" },
  nontaxable_low: { id: "nontaxable_low", label: "70+, tax exempt with very low income (低所得I)", labelJa: "70歳以上・低所得I（一定所得以下）", annualIncome: "70+ tax exempt, pension ≤ about ¥826,500", smr: "—", nhiIncome: "—", taxable70: "—", legacy: "低所得I" },
};

type Cap = { base: number; threshold: number | null; many: number | null; annual: number | null; outpatient?: number; outpatientAnnual?: number | null };

const f = (base: number, threshold: number | null, many: number | null, annual: number | null, outpatient?: number, outpatientAnnual?: number | null): Cap => ({ base, threshold, many, annual, outpatient, outpatientAnnual });

const HIGH: Band[] = ["y1650", "y1410", "y1160"];
const MID: Band[] = ["y1040", "y950", "y770"];
const LOWER: Band[] = ["y650", "y510", "y370"];
const GENERAL: Band[] = ["y260", "y200", "y0"];

function bucket(b: Band): "high" | "mid" | "lower" | "general" | "nontaxable" | "nontaxable_low" {
  if (HIGH.includes(b)) return "high";
  if (MID.includes(b)) return "mid";
  if (LOWER.includes(b)) return "lower";
  if (GENERAL.includes(b)) return "general";
  return b === "nontaxable" ? "nontaxable" : "nontaxable_low";
}

/** Cap row for an age group, band and schedule. */
export function capFor(age: AgeGroup, band: Band, schedule: ScheduleId): Cap {
  const k = bucket(band);
  if (band === "nontaxable_low" && age === "under70") throw new RuleInputError("band nontaxable_low (低所得I) is for people aged 70+; use nontaxable for under 70");
  if (schedule === "pre") {
    if (k === "high") return f(252600, 842000, 140100, null);
    if (k === "mid") return f(167400, 558000, 93000, null);
    if (k === "lower") return f(80100, 267000, 44400, null);
    if (age === "under70") return k === "general" ? f(57600, null, 44400, null) : f(35400, null, 24600, null);
    if (k === "general") return f(57600, null, 44400, null, 18000, 144000);
    if (k === "nontaxable") return f(24600, null, null, null, 8000, null);
    return f(15000, null, null, null, 8000, null);
  }
  if (schedule === "r8") {
    if (k === "high") return f(270300, 901000, 140100, 1680000);
    if (k === "mid") return f(179100, 597000, 93000, 1110000);
    if (k === "lower") return f(85800, 286000, 44400, 530000);
    const lowAnnual = band === "y0" ? 410000 : 530000;
    if (age === "under70") return k === "general" ? f(61500, null, 44400, lowAnnual) : f(36900, null, 24600, 290000);
    if (k === "general") return f(61500, null, 44400, lowAnnual, 22000, 216000);
    if (k === "nontaxable") return f(25700, null, 24600, 290000, 11000, 96000);
    return f(15700, null, null, 180000, 8000, null);
  }
  const R9: Partial<Record<Band, Cap>> = {
    y1650: f(342000, 1140000, 140100, 1680000),
    y1410: f(303000, 1010000, 140100, 1680000),
    y1160: f(270300, 901000, 140100, 1680000),
    y1040: f(209400, 698000, 93000, 1110000),
    y950: f(194400, 648000, 93000, 1110000),
    y770: f(179100, 597000, 93000, 1110000),
    y650: f(110400, 368000, 44400, 530000),
    y510: f(98100, 327000, 44400, 530000),
    y370: f(85800, 286000, 44400, 530000),
  };
  if (R9[band]) return R9[band]!;
  if (age === "under70") {
    if (band === "y260") return f(69600, null, 44400, 530000);
    if (band === "y200") return f(65400, null, 44400, 530000);
    if (band === "y0") return f(61500, null, 34500, 410000);
    return f(36900, null, 24600, 290000);
  }
  if (band === "y260") return f(69600, null, 44400, 530000, 28000, 216000);
  if (band === "y200") return f(65400, null, 44400, 530000, 28000, 216000);
  if (band === "y0") return f(61500, null, 34500, 410000, 22000, 216000);
  if (band === "nontaxable") return f(25700, null, 24600, 290000, 13000, 96000);
  return f(15700, null, null, 180000, 8000, null);
}

export const SCHEDULE_INFO: Record<ScheduleId, { id: ScheduleId; label: string; from: string | null; to: string | null }> = {
  pre: { id: "pre", label: "Before the 2026 review (treatment up to July 2026)", from: null, to: "2026-07" },
  r8: { id: "r8", label: "Stage 1 (treatment Aug 2026 – Jul 2027): higher caps, new annual cap", from: "2026-08", to: "2027-07" },
  r9: { id: "r9", label: "Stage 2 (treatment from Aug 2027): 12 income bands", from: "2027-08", to: null },
};

export function scheduleFor(month: string): ScheduleId {
  if (month < "2026-08") return "pre";
  if (month < "2027-08") return "r8";
  return "r9";
}

const MONTH = /^(\d{4})-(\d{2})$/;
export function parseMonth(raw: string, name = "month"): string {
  const t = raw.trim().normalize("NFKC").replace(/[/.年]/g, "-").replace(/月$/, "");
  const m = t.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (!m) throw new RuleInputError(`${name} must be YYYY-MM (for example 2026-11)`);
  const mm = Number(m[2]);
  if (mm < 1 || mm > 12) throw new RuleInputError(`${name} must be YYYY-MM with a month from 01 to 12`);
  const out = `${m[1]}-${String(mm).padStart(2, "0")}`;
  if (out < "2018-08") throw new RuleInputError(`${name} must be 2018-08 or later (the current 70+ rules start then)`);
  if (out > "2035-12") throw new RuleInputError(`${name} must be 2035-12 or earlier`);
  return out;
}

function addMonths(month: string, n: number): string {
  const m = month.match(MONTH)!;
  const idx = Number(m[1]) * 12 + Number(m[2]) - 1 + n;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`;
}
function monthDiff(a: string, b: string): number {
  const x = a.match(MONTH)!;
  const y = b.match(MONTH)!;
  return Number(y[1]) * 12 + Number(y[2]) - (Number(x[1]) * 12 + Number(x[2]));
}

export function currentMonthJST(now = new Date()): string {
  const j = new Date(now.getTime() + 9 * 3600 * 1000);
  return `${j.getUTCFullYear()}-${String(j.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Claim expires 2 years from the 1st of the month after treatment (last day = end of the treatment month + 24 months). */
export function claimDeadline(month: string): string {
  // first day of next month + 2 years − 1 day = last day of (treatment month + 24)
  const last = addMonths(month, 24);
  const [y, m] = last.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${last}-${String(d).padStart(2, "0")}`;
}

/** Annual-cap year (Aug–Jul) containing a month, or null before 2026-08. */
export function annualPeriod(month: string): { from: string; to: string } | null {
  if (month < "2026-08") return null;
  const [y, m] = month.split("-").map(Number);
  const startYear = m >= 8 ? y : y - 1;
  return { from: `${startYear}-08`, to: `${startYear + 1}-07` };
}

const man = 10000;
export function bandFromSmr(yen: number): Band {
  const v = yen / man;
  if (v >= 127) return "y1650";
  if (v >= 103) return "y1410";
  if (v >= 83) return "y1160";
  if (v >= 71) return "y1040";
  if (v >= 62) return "y950";
  if (v >= 53) return "y770";
  if (v >= 44) return "y650";
  if (v >= 36) return "y510";
  if (v >= 28) return "y370";
  if (v >= 20) return "y260";
  if (v >= 16) return "y200";
  return "y0";
}
export function bandFromNhiIncome(yen: number): Band {
  const v = yen / man;
  if (v > 1356) return "y1650";
  if (v > 1110) return "y1410";
  if (v > 901) return "y1160";
  if (v > 809) return "y1040";
  if (v > 679) return "y950";
  if (v > 600) return "y770";
  if (v > 410) return "y650";
  if (v > 313) return "y510";
  if (v > 210) return "y370";
  if (v > 127) return "y260";
  if (v > 86) return "y200";
  return "y0";
}
export function bandFromTaxable70(yen: number): Band {
  const v = yen / man;
  if (v >= 1107) return "y1650";
  if (v >= 900) return "y1410";
  if (v >= 690) return "y1160";
  if (v >= 614) return "y1040";
  if (v >= 504) return "y950";
  if (v >= 380) return "y770";
  if (v >= 280) return "y650";
  if (v >= 203) return "y510";
  if (v >= 145) return "y370";
  if (v >= 57) return "y260";
  if (v >= 28) return "y200";
  return "y0";
}
export function bandFromAnnualIncome(yen: number): Band {
  const v = yen / man;
  const cuts: [number, Band][] = [[1650, "y1650"], [1410, "y1410"], [1160, "y1160"], [1040, "y1040"], [950, "y950"], [770, "y770"], [650, "y650"], [510, "y510"], [370, "y370"], [260, "y260"], [200, "y200"]];
  for (const [c, b] of cuts) if (v >= c) return b;
  return "y0";
}

export type MonthEntry = { month: string; totalCost?: number | null; copay?: number | null; setting?: Setting };

export type CapInput = {
  ageGroup?: AgeGroup;
  band?: Band | null;
  standardMonthlyRemuneration?: number | null;
  nhiIncome?: number | null;
  taxableIncome?: number | null;
  annualIncome?: number | null;
  nonTaxable?: boolean;
  month?: string | null;
  totalCost?: number | null;
  copay?: number | null;
  burdenRate?: number | null;
  setting?: Setting;
  manyTimes?: boolean;
  priorHitMonths?: number | null;
  months?: MonthEntry[] | null;
  today?: string | null;
};

function yen(n: number): string {
  return `¥${Math.round(n).toLocaleString("en-US")}`;
}

function resolveBand(i: CapInput, age: AgeGroup): { band: Band; source: string } {
  if (i.band) {
    if (i.band === "nontaxable_low" && age === "under70") throw new RuleInputError("band nontaxable_low (低所得I) is for people aged 70+; use nontaxable for under 70");
    return { band: i.band, source: "band" };
  }
  if (i.nonTaxable) return { band: "nontaxable", source: "nonTaxable" };
  const pos = (v: number | null | undefined, name: string) => {
    if (v === null || v === undefined) return null;
    if (!Number.isFinite(v) || v < 0) throw new RuleInputError(`${name} must be a positive number of yen`);
    return v;
  };
  const smr = pos(i.standardMonthlyRemuneration, "standardMonthlyRemuneration");
  if (smr !== null) return { band: bandFromSmr(smr), source: "standardMonthlyRemuneration" };
  const nhi = pos(i.nhiIncome, "nhiIncome");
  if (nhi !== null) return { band: bandFromNhiIncome(nhi), source: "nhiIncome" };
  const tax = pos(i.taxableIncome, "taxableIncome");
  if (tax !== null) {
    if (age === "70plus") return { band: bandFromTaxable70(tax), source: "taxableIncome" };
    throw new RuleInputError("taxableIncome is used for people aged 70+; under 70 give standardMonthlyRemuneration (employee insurance) or nhiIncome (National Health Insurance)");
  }
  const ann = pos(i.annualIncome, "annualIncome");
  if (ann !== null) return { band: bandFromAnnualIncome(ann), source: "annualIncome (rough)" };
  return { band: "y370", source: "default (most common band; give your income for an exact cap)" };
}

function defaultRate(age: AgeGroup, band: Band): number {
  if (age === "under70") return 0.3;
  const k = bucket(band);
  return k === "high" || k === "mid" || k === "lower" ? 0.3 : 0.2;
}

export type MonthResult = {
  month: string;
  schedule: ScheduleId;
  setting: Setting;
  totalCost: number;
  copay: number;
  manyTimes: boolean;
  monthlyCap: number;
  formula: string;
  outpatientCap: number | null;
  outpatientOnlyCap: boolean;
  youPay: number;
  monthlyRefund: number;
};

function monthCap(age: AgeGroup, band: Band, schedule: ScheduleId, total: number, setting: Setting, many: boolean): { cap: number; formula: string; outpatientCap: number | null; manyApplied: boolean; outpatientOnly: boolean } {
  const c = capFor(age, band, schedule);
  let cap: number;
  let formula: string;
  if (c.threshold === null) {
    cap = c.base;
    formula = `${yen(c.base)} flat`;
  } else {
    cap = c.base + Math.round(Math.max(0, total - c.threshold) * 0.01);
    formula = `${yen(c.base)} + (${yen(total)} − ${yen(c.threshold)}) × 1%`;
  }
  let manyApplied = false;
  if (many && c.many !== null && c.many < cap) {
    cap = c.many;
    formula = `${yen(c.many)} (多数回該当: 4th+ benefit month in 12)`;
    manyApplied = true;
  }
  const outpatientCap = age === "70plus" && c.outpatient !== undefined ? c.outpatient : null;
  if (setting === "outpatient" && outpatientCap !== null && outpatientCap < cap) {
    cap = outpatientCap;
    formula = `${yen(outpatientCap)} (70+ outpatient-only cap per person)`;
    manyApplied = false;
  }
  return { cap, formula, outpatientCap, manyApplied, outpatientOnly: setting === "outpatient" && outpatientCap !== null && cap === outpatientCap && !manyApplied };
}

function oneMonth(age: AgeGroup, band: Band, e: { month: string; totalCost?: number | null; copay?: number | null; setting?: Setting }, rate: number, many: boolean): MonthResult {
  const schedule = scheduleFor(e.month);
  let total = e.totalCost ?? null;
  let copay = e.copay ?? null;
  if (total !== null && (!Number.isFinite(total) || total < 0)) throw new RuleInputError("totalCost must be a positive number of yen (the 10割 total on the bill)");
  if (copay !== null && (!Number.isFinite(copay) || copay < 0)) throw new RuleInputError("copay must be a positive number of yen (what you paid at the counter)");
  if (total === null && copay === null) throw new RuleInputError("Give totalCost (10割 total medical cost) or copay (what you paid, insured care only)");
  if (total === null) total = Math.round(copay! / rate);
  if (copay === null) copay = Math.round(total * rate);
  if (total > 1e9 || copay > 1e9) throw new RuleInputError("Amounts must be under ¥1,000,000,000");
  const setting = e.setting ?? "inpatient";
  const m = monthCap(age, band, schedule, total, setting, many);
  const youPay = Math.min(copay, m.cap);
  return { month: e.month, schedule, setting, totalCost: Math.round(total), copay: Math.round(copay), manyTimes: m.manyApplied, monthlyCap: m.cap, formula: m.formula, outpatientCap: m.outpatientCap, outpatientOnlyCap: m.outpatientOnly, youPay, monthlyRefund: Math.max(0, Math.round(copay) - youPay) };
}

export type Verdict = "under_cap" | "cap_applies" | "many_times_cap" | "annual_cap_reached";

export function checkCap(i: CapInput) {
  const age: AgeGroup = i.ageGroup ?? "under70";
  if (!(AGE_GROUPS as readonly string[]).includes(age)) throw new RuleInputError(`ageGroup must be one of ${AGE_GROUPS.join(", ")}`);
  const { band, source } = resolveBand(i, age);
  const rate = i.burdenRate ?? defaultRate(age, band);
  if (![0.1, 0.2, 0.3].includes(rate)) throw new RuleInputError("burdenRate must be 0.1, 0.2 or 0.3 (or 10, 20, 30)");
  const month = i.month ? parseMonth(i.month) : currentMonthJST();
  const setting = i.setting ?? "inpatient";
  const prior = i.priorHitMonths ?? 0;
  if (!Number.isInteger(prior) || prior < 0 || prior > 11) throw new RuleInputError("priorHitMonths must be a whole number 0–11 (benefit months in the 12 months before)");

  const entries: MonthEntry[] | null = i.months && i.months.length ? i.months.map((m) => ({ ...m, month: parseMonth(m.month, "months[].month") })).sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0)) : null;
  if (entries && entries.length > 36) throw new RuleInputError("months can list at most 36 months");
  if (entries) for (let k = 1; k < entries.length; k++) if (entries[k].month === entries[k - 1].month) throw new RuleInputError(`months lists ${entries[k].month} twice; add the month's bills together`);

  let headline: MonthResult;
  let tracker: null | {
    months: MonthResult[];
    years: { period: { from: string; to: string } | null; paidAfterMonthlyCaps: number; annualCap: number | null; annualRefund: number; outpatientAnnualCap: number | null; outpatientRefund: number }[];
    totalRefund: number;
  } = null;

  if (entries) {
    const results: MonthResult[] = [];
    const hits: string[] = [];
    for (const e of entries) {
      const recent = hits.filter((h) => monthDiff(h, e.month) >= 1 && monthDiff(h, e.month) <= 11).length;
      const extraPrior = results.length === 0 ? prior : Math.max(0, prior - monthDiff(entries[0].month, e.month));
      const many = i.manyTimes === true || recent + extraPrior >= 3;
      const r = oneMonth(age, band, { ...e, setting: e.setting ?? setting }, rate, many);
      if (r.monthlyRefund > 0 && !r.outpatientOnlyCap) hits.push(e.month);
      results.push(r);
    }
    const byYear = new Map<string, MonthResult[]>();
    for (const r of results) {
      const p = annualPeriod(r.month);
      const key = p ? p.from : "pre";
      byYear.set(key, [...(byYear.get(key) ?? []), r]);
    }
    const years = [...byYear.entries()].map(([key, rs]) => {
      const period = key === "pre" ? null : annualPeriod(key)!;
      const sched = key === "pre" ? "pre" : scheduleFor(key);
      const c = capFor(age, band, sched);
      let outpatientRefund = 0;
      const outPaid = rs.filter((r) => r.setting === "outpatient").reduce((a, r) => a + r.youPay, 0);
      const outCap = period && age === "70plus" ? (c.outpatientAnnual ?? null) : null;
      if (outCap !== null && outPaid > outCap) outpatientRefund = outPaid - outCap;
      const paid = rs.reduce((a, r) => a + r.youPay, 0) - outpatientRefund;
      const annualCap = period ? c.annual : null;
      const annualRefund = annualCap !== null && paid > annualCap ? paid - annualCap : 0;
      return { period, paidAfterMonthlyCaps: paid, annualCap, annualRefund, outpatientAnnualCap: outCap, outpatientRefund };
    });
    tracker = { months: results, years, totalRefund: results.reduce((a, r) => a + r.monthlyRefund, 0) + years.reduce((a, y) => a + y.annualRefund + y.outpatientRefund, 0) };
    headline = results[results.length - 1];
  } else {
    const many = i.manyTimes === true || prior >= 3;
    headline = oneMonth(age, band, { month, totalCost: i.totalCost, copay: i.copay, setting }, rate, many);
  }

  const schedule = headline.schedule;
  const c = capFor(age, band, schedule);
  const preview = (s: ScheduleId) => {
    const m = monthCap(age, band, s, headline.totalCost, headline.setting, headline.manyTimes);
    return { schedule: s, monthlyCap: m.cap, youPay: Math.min(headline.copay, m.cap), formula: m.formula, annualCap: capFor(age, band, s).annual };
  };
  const from2027 = schedule === "r9" ? null : preview("r9");
  const before2026 = schedule === "pre" ? null : preview("pre");

  const annualHit = tracker ? tracker.years.some((y) => y.annualRefund > 0 || y.outpatientRefund > 0) : false;
  const verdict: Verdict = annualHit ? "annual_cap_reached" : headline.monthlyRefund === 0 ? "under_cap" : headline.manyTimes ? "many_times_cap" : "cap_applies";
  const info = BAND_INFO[band];
  const summary =
    verdict === "annual_cap_reached"
      ? `Your yearly cap kicks in: about ${yen(tracker!.totalRefund)} comes back in total (monthly caps plus the Aug–Jul annual cap).`
      : verdict === "under_cap"
        ? `${yen(headline.copay)} is under your ${yen(headline.monthlyCap)} cap for ${headline.month}, so no refund for this bill alone. Bills from other hospitals or family members on the same insurance can be combined.`
        : `You pay at most ${yen(headline.monthlyCap)} for ${headline.month}; about ${yen(headline.monthlyRefund)} of your ${yen(headline.copay)} copay comes back${headline.manyTimes ? " (4th-month 多数回 rate)" : ""}.`;

  const steps = [
    "Show your My Number insurance card (マイナ保険証) or a 限度額適用認定証 at the hospital, and the counter charges only up to the cap, so you don't have to pay first and wait.",
    "If you already paid more, claim the refund from your insurer: 協会けんぽ or your company's health insurance society (健康保険組合), or the city office for National Health Insurance (国民健康保険) or late-stage elderly insurance (後期高齢者医療). Many send you the form automatically about 3–4 months later.",
    `Claim deadline for ${headline.month}: ${claimDeadline(headline.month)} (2 years from the 1st of the following month).`,
    age === "under70" ? "Under 70: add bills of ¥21,000 or more per hospital per month (inpatient, outpatient and dental counted separately; pharmacy bills join the prescribing clinic) for you and family on the same insurance, then the cap applies to the total." : "70+: all copays add up, outpatient first per person, then household with inpatient care.",
    "Hospital meals, private-room fees (差額ベッド), advanced medical care (先進医療) and uninsured treatment don't count.",
    "Ask your insurer about extra benefits (付加給付): many company health insurance societies cap costs lower, often around ¥20,000–25,000 a month.",
  ];
  if (schedule !== "pre") steps.push(`From Aug 2026 there is also a yearly cap (Aug–Jul): ${c.annual !== null ? yen(c.annual) : "—"} for your band${band === "y0" && schedule === "r8" ? " (¥410,000 once your insurer confirms the low band; the difference is paid back after Aug 2027)" : ""}. Keep your receipts.`);

  return {
    verdict,
    summary,
    ageGroup: age,
    band: { ...info, source },
    burdenRate: rate,
    schedule: SCHEDULE_INFO[schedule],
    month: headline,
    caps: { monthlyBase: c.base, threshold: c.threshold, manyTimes: c.many, annual: c.annual, outpatient70: age === "70plus" ? (c.outpatient ?? null) : null, outpatientAnnual70: age === "70plus" ? (c.outpatientAnnual ?? null) : null },
    annualCap: schedule === "pre" ? null : { period: annualPeriod(headline.month), amount: c.annual, note: "Counts what you paid after monthly refunds, for the Aug–Jul year. It started for treatment from Aug 2026." },
    from2027: from2027 ? { ...from2027, changeJPY: from2027.youPay - headline.youPay } : null,
    beforeAug2026: before2026 ? { ...before2026, changeJPY: headline.youPay - before2026.youPay } : null,
    claim: { deadline: claimDeadline(headline.month), rule: "2 years from the 1st of the month after treatment (消滅時効 2年)" },
    tracker,
    steps,
    notCounted: ["Hospital meal charges (入院時食事療養費)", "Private / semi-private room fees (差額ベッド代)", "Advanced medical care (先進医療) technical fees", "Uninsured treatment, cosmetics, certificates"],
    callCenter: "MHLW high-cost medical expense call center 0120-617-111 (Japanese)",
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
    disclaimer: DISCLAIMER,
  };
}

export type CapResult = ReturnType<typeof checkCap>;

export const RULES = {
  formula: "monthly cap = base + max(0, 10割 total medical cost − threshold) × 1%, rounded to the yen; flat caps for lower bands",
  schedules: SCHEDULE_INFO,
  manyTimes: "多数回該当: from the 4th month with a benefit in the last 12 months, a lower flat cap applies (none for 70+ 低所得I). 70+ outpatient-only months don't count.",
  annualCap: "From treatment in Aug 2026: yearly cap per Aug–Jul period on what you paid after monthly refunds (and the 70+ outpatient yearly cap).",
  claim: "Claim within 2 years from the 1st of the month after treatment.",
  under70Combine: "Under 70: only bills of ¥21,000+ per facility per month (inpatient / outpatient / dental separate) can be combined within the household.",
  bands: BAND_INFO,
  table: Object.fromEntries(SCHEDULES.map((s) => [s, Object.fromEntries(AGE_GROUPS.map((a) => [a, Object.fromEntries(BANDS.filter((b) => !(a === "under70" && b === "nontaxable_low")).map((b) => [b, capFor(a, b, s)]))]))])),
};
