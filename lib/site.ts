export const SITE_NAME = "Japan High-Cost Medical Expense Check";

export const SITE_TAGLINE =
  "Big hospital bill in Japan? See your 高額療養費 monthly cap, what you really pay, the refund, the 4th-month rate, the new Aug–Jul yearly cap from 2026, how the August 2027 change hits your income band and your 2-year claim deadline. English + 日本語.";

export const DISCLAIMER_SHORT = "Educational estimate, not medical, financial or legal advice. Not affiliated with MHLW, 協会けんぽ, any health insurance society, city NHI office or hospital. Your insurer decides the actual benefit. Rules as of 2026-11-04.";

export const HONESTY =
  "Rules as of 2026-11-04 from the MHLW 高額療養費 review (caps for treatment up to Jul 2026, Aug 2026–Jul 2027 and from Aug 2027; 政令第240号 promulgated 2026-07-29), 協会けんぽ tables and city NHI pages. Income bands are approximate when you give annual income; insured care only.";

export const SIBLING_TOOLS = [
  { href: "https://japan-job-loss.vercel.app", label: "Japan Job Loss Check" },
  { href: "https://japan-visa-renewal.vercel.app", label: "Japan Visa Renewal Window Check" },
  { href: "https://japan-jlpt-check.vercel.app", label: "Japan JLPT Level Check" },
  { href: "https://japan-graduate-visa.vercel.app", label: "Japan Graduate Visa Check" },
  { href: "https://japan-lost-item.vercel.app", label: "Japan Lost Item Check" },
  { href: "https://japan-disaster-prep.vercel.app", label: "Japan Disaster Prep Check" },
  { href: "https://japan-leaving-tax.vercel.app", label: "Japan Leaving Tax Check" },
  { href: "https://japan-alert-decoder.vercel.app", label: "Japan Alert Decoder" },
  { href: "https://japan-pet-quarantine.vercel.app", label: "Japan Pet Quarantine Check" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-luggage.vercel.app", label: "Japan Luggage Check" },
  { href: "https://japan-reentry-check.vercel.app", label: "Japan Re-entry Deadline Check" },
  { href: "https://japan-mynumber-card-check.vercel.app", label: "Japan My Number Card Check" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://japan-driving-check.vercel.app", label: "Japan Driving Check" },
  { href: "https://japan-intl-postage.vercel.app", label: "Japan Postage Calculator" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-pr-check.vercel.app", label: "Japan PR Guideline Check" },
  { href: "https://japan-hsp-points.vercel.app", label: "Japan HSP Points Calculator" },
  { href: "https://japan-overseas-dependents.vercel.app", label: "Japan Overseas Dependents Check" },
  { href: "https://japan-parttime-check.vercel.app", label: "Japan Part-time Work Check" },
  { href: "https://japan-tb-screening.vercel.app", label: "Japan TB Screening Check" },
  { href: "https://japan-dual-pricing.vercel.app", label: "Japan Dual Pricing Check" },
  { href: "https://kyushu-travel-discount.vercel.app", label: "Kyushu Travel Discount" },
  { href: "https://house-rules-check.vercel.app", label: "House Rules Check" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-medical-cost-cap.vercel.app";
}
