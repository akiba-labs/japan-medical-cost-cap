import { InputError, type Endpoint, type Input } from "./agent-api";
import { AGE_GROUPS, BANDS, DISCLAIMER, RULES_AS_OF, RuleInputError, SETTINGS, checkCap, type AgeGroup, type Band, type MonthEntry, type Setting } from "./cap";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-medical-cost-cap.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?month=2026-11&totalCost=1000000&standardMonthlyRemuneration=300000";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
function tb(v: unknown, name: string): boolean | undefined {
  const f = first(v);
  if (typeof f === "boolean") return f;
  if (f === undefined || f === null || String(f).trim() === "") return undefined;
  const t = String(f).trim();
  if (/^(1|true|yes|y|on|はい)$/i.test(t)) return true;
  if (/^(0|false|no|n|off|いいえ)$/i.test(t)) return false;
  throw new InputError(`${name} must be true or false`);
}
/** Yen amount; accepts 1,000,000 / ¥1,000,000 / 100万 / 100万円. */
export function parseYen(raw: unknown, name: string): number | undefined {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw < 0) throw new InputError(`${name} must be a positive number (yen)`);
    return raw;
  }
  const f = s(raw);
  if (f === null) return undefined;
  let t = f.normalize("NFKC").replace(/[,¥円\s]/g, "").toLowerCase();
  let mult = 1;
  if (t.endsWith("万")) { mult = 10000; t = t.slice(0, -1); }
  else if (t.endsWith("m")) { mult = 1_000_000; t = t.slice(0, -1); }
  else if (t.endsWith("k")) { mult = 1000; t = t.slice(0, -1); }
  const x = Number(t);
  if (!Number.isFinite(x) || x < 0 || t === "") throw new InputError(`${name} must be a positive number (yen)`);
  return Math.round(x * mult);
}
function rate(raw: unknown): number | undefined {
  const f = s(raw);
  if (f === null) return undefined;
  const x = Number(f.replace(/[%割]/g, ""));
  if (!Number.isFinite(x)) throw new InputError("burdenRate must be 0.1, 0.2 or 0.3 (or 10, 20, 30, 1割, 2割, 3割)");
  if (/割/.test(f)) return x / 10;
  return x >= 1 ? x / 100 : x;
}

const AGE_ALIASES: Record<string, AgeGroup> = { u70: "under70", under_70: "under70", "69": "under70", "70歳未満": "under70", "69歳以下": "under70", "70": "70plus", "70+": "70plus", "70_plus": "70plus", over70: "70plus", "75": "70plus", "75plus": "70plus", "70歳以上": "70plus", 後期高齢者: "70plus", senior: "70plus" };
const BAND_ALIASES: Record<string, Band> = {
  ア: "y1160", a: "y1160", イ: "y770", i: "y770", b: "y770", ウ: "y370", u: "y370", c: "y370", エ: "y260", e: "y260", d: "y260", オ: "nontaxable", o: "nontaxable",
  非課税: "nontaxable", 住民税非課税: "nontaxable", low_income: "nontaxable", 低所得: "nontaxable", 低所得ii: "nontaxable", low_income_ii: "nontaxable", 低所得i: "nontaxable_low", low_income_i: "nontaxable_low",
  一般: "y260", general: "y260",
};
const SETTING_ALIASES: Record<string, Setting> = { 入院: "inpatient", hospital: "inpatient", hospitalized: "inpatient", admission: "inpatient", 外来: "outpatient", 通院: "outpatient", clinic: "outpatient" };

function norm(raw: string): string {
  return raw.normalize("NFKC").toLowerCase().replace(/[\s-]+/g, "_").replace(/'/g, "");
}
function pick<T extends string>(raw: string | null, allowed: readonly T[], aliases: Record<string, T>, name: string): T | undefined {
  if (!raw) return undefined;
  const k = norm(raw);
  const v = (aliases[k] ?? aliases[raw] ?? k) as T;
  if (!(allowed as readonly string[]).includes(v)) throw new InputError(`Invalid ${name} "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}
function age(raw: unknown): AgeGroup | undefined {
  const t = s(raw);
  if (t === null) return undefined;
  if (/^\d{1,3}$/.test(t)) {
    const n = Number(t);
    if (n > 120) throw new InputError("age must be 0–120");
    return n >= 70 ? "70plus" : "under70";
  }
  return pick(t, AGE_GROUPS, AGE_ALIASES, "ageGroup");
}
/** months: JSON array [{month,totalCost|copay,setting}] or GET string "2026-08:300000,2026-09:300000:outpatient". */
function months(v: unknown): MonthEntry[] | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (Array.isArray(v) && v.length && typeof v[0] === "object" && v[0] !== null) {
    return v.map((m: Record<string, unknown>) => {
      if (!m.month) throw new InputError("each months[] item needs month (YYYY-MM)");
      return { month: String(m.month), totalCost: parseYen(m.totalCost ?? m.total, "months[].totalCost") ?? null, copay: parseYen(m.copay ?? m.paid, "months[].copay") ?? null, setting: pick(s(m.setting), SETTINGS, SETTING_ALIASES, "months[].setting") };
    });
  }
  const parts = (Array.isArray(v) ? v : [v]).flatMap((x) => String(x).split(/[,;、|]/)).map((x) => x.trim()).filter(Boolean);
  return parts.map((p) => {
    const [m, amt, set] = p.split(/[:=]/);
    if (!m || !amt) throw new InputError('months must look like "2026-08:300000,2026-09:300000" (month:10割 total[:outpatient])');
    const isCopay = /^copay/i.test(amt) || /^paid/i.test(amt);
    const val = parseYen(amt.replace(/^(copay|paid|total)/i, ""), "months amount");
    return { month: m, totalCost: isCopay ? null : val ?? null, copay: isCopay ? val ?? null : null, setting: pick(set ?? null, SETTINGS, SETTING_ALIASES, "months setting") };
  });
}

export function computeCheck(input: Input) {
  try {
    return checkCap({
      ageGroup: age(input.ageGroup ?? input.age ?? input.年齢),
      band: pick(s(input.band ?? input.incomeBand ?? input.区分 ?? input.所得区分), BANDS, BAND_ALIASES, "band") ?? null,
      standardMonthlyRemuneration: parseYen(input.standardMonthlyRemuneration ?? input.smr ?? input.標準報酬月額, "standardMonthlyRemuneration") ?? null,
      nhiIncome: parseYen(input.nhiIncome ?? input.旧ただし書き所得, "nhiIncome") ?? null,
      taxableIncome: parseYen(input.taxableIncome ?? input.課税所得, "taxableIncome") ?? null,
      annualIncome: parseYen(input.annualIncome ?? input.income ?? input.salary ?? input.年収, "annualIncome") ?? null,
      nonTaxable: tb(input.nonTaxable ?? input.taxExempt ?? input.非課税, "nonTaxable"),
      month: s(input.month ?? input.treatmentMonth ?? input.診療月),
      totalCost: parseYen(input.totalCost ?? input.total ?? input.medicalCost ?? input.医療費, "totalCost") ?? null,
      copay: parseYen(input.copay ?? input.paid ?? input.windowPayment ?? input.窓口負担, "copay") ?? null,
      burdenRate: rate(input.burdenRate ?? input.rate ?? input.負担割合) ?? null,
      setting: pick(s(input.setting ?? input.care ?? input.入院外来), SETTINGS, SETTING_ALIASES, "setting"),
      manyTimes: tb(input.manyTimes ?? input.多数回, "manyTimes"),
      priorHitMonths: (() => {
        const v = s(input.priorHitMonths ?? input.prior);
        if (v === null) return null;
        if (!/^\d{1,2}$/.test(v)) throw new InputError("priorHitMonths must be a whole number 0–11");
        return Number(v);
      })(),
      months: months(input.months) ?? null,
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanHighCostMedicalCheck",
    summary: "Japan high-cost medical expense cap (高額療養費): your monthly cap, what you really pay, the refund, the 4th-month rate, the new Aug–Jul annual cap, the Aug 2027 change and the claim deadline.",
    description: `Applies Japan's 高額療養費 rules as of ${RULES_AS_OF} (MHLW review: caps rose for treatment from 2026-08 with a new yearly cap; from 2027-08 the bands split into 12). Monthly cap = base + (10割 total − threshold) × 1% (flat for lower bands); 多数回該当 from the 4th benefit month in 12; yearly cap per Aug–Jul on what you paid after monthly refunds (¥1.68M / ¥1.11M / ¥530k / ¥410k / ¥290k / 70+ 低所得I ¥180k); 70+ outpatient caps (¥18,000 → ¥22,000 → ¥28,000 for 一般). Give income one way: band, standardMonthlyRemuneration (employee insurance 標準報酬月額), nhiIncome (NHI 旧ただし書き所得), taxableIncome (70+ 課税所得) or rough annualIncome; or nonTaxable=true. Returns verdict (under_cap | cap_applies | many_times_cap | annual_cap_reached), summary, band {id, label, source}, schedule, month {monthlyCap, formula, youPay, monthlyRefund, manyTimes}, caps, annualCap {period, amount}, from2027 {monthlyCap, youPay, changeJPY}, beforeAug2026, claim {deadline}, tracker {months[], years[{annualRefund}]} when months are given, steps, notCounted, sources, disclaimer. Insured care only: meals, private rooms, 先進医療 and uninsured care don't count.`,
    params: [
      { name: "month", type: "string", description: "Treatment month YYYY-MM (default this month in JST). Picks the schedule: up to 2026-07, 2026-08…2027-07, 2027-08+." },
      { name: "totalCost", type: "number", description: "10割 total medical cost on the bill (総医療費), yen. Accepts 100万." },
      { name: "copay", type: "number", description: "What you paid at the counter for insured care (窓口負担), yen. Give this or totalCost." },
      { name: "ageGroup", type: "string", enum: AGE_GROUPS, default: "under70", description: "under70 or 70plus (70–74 and 75+ 後期高齢者). A number age also works." },
      { name: "band", type: "string", enum: BANDS, description: "Income band directly (y370 = income about ¥3.7M–5.1M). Old letters ア/イ/ウ/エ/オ map to a middle band." },
      { name: "standardMonthlyRemuneration", type: "number", description: "Employee insurance 標準報酬月額 in yen (e.g. 300000)." },
      { name: "nhiIncome", type: "number", description: "National Health Insurance 旧ただし書き所得 (household total) in yen." },
      { name: "taxableIncome", type: "number", description: "70+: resident-tax 課税所得 in yen." },
      { name: "annualIncome", type: "number", description: "Rough annual income (年収) in yen, if nothing better is known." },
      { name: "nonTaxable", type: "boolean", default: false, description: "Resident-tax exempt household (住民税非課税)." },
      { name: "burdenRate", type: "number", description: "Copay rate 0.1 / 0.2 / 0.3 (default 0.3 under 70; 70+ 0.3 for high bands else 0.2)." },
      { name: "setting", type: "string", enum: SETTINGS, default: "inpatient", description: "inpatient (or any household total) / outpatient (70+ outpatient-only cap per person)." },
      { name: "manyTimes", type: "boolean", default: false, description: "Already had a benefit in 3+ of the last 12 months (多数回該当)." },
      { name: "priorHitMonths", type: "integer", minimum: 0, maximum: 11, description: "Benefit months in the 12 months before (3+ = 多数回)." },
      { name: "months", type: "string", description: 'Optional yearly tracker: "2026-08:300000,2026-09:300000" (month:10割 total[:outpatient]; prefix copay for copay amounts) or POST array [{month,totalCost|copay,setting}]. Auto-applies 多数回 and the Aug–Jul annual cap.' },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan High-Cost Medical Expense Check",
  nameForModel: "japan_high_cost_medical",
  descriptionForHuman: "Japan 高額療養費: your monthly medical cost cap, refund, annual cap and the Aug 2027 change.",
  descriptionForModel:
    "Use when someone in Japan asks how much a hospital stay, surgery, cancer treatment or a big medical bill will really cost them, whether they get money back (高額療養費), what their 自己負担限度額 is, how the Aug 2026 / Aug 2027 changes and the new yearly cap (年間上限) affect them, the 多数回該当 rate, or the claim deadline. Gives the cap with the MHLW formula instead of guessing; relay the disclaimer (estimate, the insurer decides).",
  logo: "/icon.svg",
};
