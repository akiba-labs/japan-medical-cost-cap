/** Verdict labels and colours, shared by server pages and the client calculator. */
export const VERDICT_STYLE: Record<string, string> = {
  under_cap: "text-teal-200",
  cap_applies: "text-amber-200",
  many_times_cap: "text-amber-200",
  annual_cap_reached: "text-teal-200",
};
export const VERDICT_LABEL: Record<string, string> = {
  under_cap: "Under your cap",
  cap_applies: "Cap applies: money back",
  many_times_cap: "4th-month rate applies",
  annual_cap_reached: "Yearly cap reached",
};
