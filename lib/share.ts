import { AGE_GROUPS, BANDS, SETTINGS, checkCap, type AgeGroup, type Band, type CapInput, type Setting } from "./cap";

export { PUBLIC_URL } from "./api";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, k: string): string | null {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  const f = Array.isArray(v) ? v[0] : v;
  return f === undefined || f === null || f === "" ? null : String(f);
}
function oneOf<T extends string>(p: Params, k: string, allowed: readonly T[], fallback: T): T {
  const v = one(p, k);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}
function optNum(p: Params, k: string): number | null {
  const v = one(p, k);
  return v !== null && /^\d{1,10}$/.test(v) ? Number(v) : null;
}

export type Shared = {
  ageGroup: AgeGroup;
  band: Band;
  month: string;
  totalCost: number | null;
  copay: number | null;
  setting: Setting;
  priorHitMonths: number;
};

const BASE: Shared = { ageGroup: "under70", band: "y370", month: "2026-11", totalCost: 1_000_000, copay: null, setting: "inpatient", priorHitMonths: 0 };
export const DEFAULT_SHARED = BASE;
export const EXAMPLE_SHARED: Shared = { ...BASE };
export const EXAMPLE_2027: Shared = { ...BASE, band: "y650", month: "2027-09", totalCost: 1_500_000 };
export const EXAMPLE_SENIOR: Shared = { ...BASE, ageGroup: "70plus", band: "y200", totalCost: 150_000, setting: "outpatient" };
export const EXAMPLES = [EXAMPLE_SHARED, EXAMPLE_2027, EXAMPLE_SENIOR];

export function parseShared(p: Params): Shared | null {
  const month = one(p, "m");
  if (month !== null && !/^\d{4}-\d{2}$/.test(month)) return null;
  const s: Shared = {
    ageGroup: oneOf(p, "a", AGE_GROUPS, "under70"),
    band: oneOf(p, "b", BANDS, "y370"),
    month: month ?? BASE.month,
    totalCost: optNum(p, "t"),
    copay: optNum(p, "c"),
    setting: oneOf(p, "s", SETTINGS, "inpatient"),
    priorHitMonths: Math.min(11, optNum(p, "h") ?? 0),
  };
  if (s.totalCost === null && s.copay === null) return null;
  return s;
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  if (s.ageGroup !== "under70") q.set("a", s.ageGroup);
  q.set("b", s.band);
  q.set("m", s.month);
  if (s.totalCost !== null) q.set("t", String(s.totalCost));
  if (s.copay !== null) q.set("c", String(s.copay));
  if (s.setting !== "inpatient") q.set("s", s.setting);
  if (s.priorHitMonths) q.set("h", String(s.priorHitMonths));
  return q.toString();
}

export function toCheckInput(s: Shared): CapInput {
  return { ageGroup: s.ageGroup, band: s.band, month: s.month, totalCost: s.totalCost, copay: s.copay, setting: s.setting, priorHitMonths: s.priorHitMonths };
}
export function safeCheck(s: Shared) {
  try {
    return checkCap(toCheckInput(s));
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}
