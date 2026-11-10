import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { EXAMPLE_GET } from "@/lib/api";
import { SOURCES } from "@/lib/cap";
import { EXAMPLE_2027, EXAMPLE_SENIOR, EXAMPLE_SHARED, PUBLIC_URL, resultPath } from "@/lib/share";

const title = "Japan high-cost medical expense cap (高額療養費) calculator: your monthly cap, refund, yearly cap and the Aug 2027 change";
const description =
  "Free 高額療養費 calculator for Japan in English and Japanese. Enter your hospital bill and income band to see your monthly cap (自己負担限度額), what you really pay, the refund, the 4th-month 多数回 rate, the new Aug–Jul yearly cap (年間上限) from Aug 2026, how the Aug 2027 change hits your band, and your 2-year claim deadline. Free JSON API and MCP tool for AI agents. Educational, not official.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan High-Cost Medical Expense Check",
  alternateName: ["高額療養費 計算", "高額療養費 シミュレーション 2027", "自己負担限度額 計算", "高額療養費 年間上限", "Japan medical bill cap calculator"],
  url: PUBLIC_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free 高額療養費 (high-cost medical expense benefit) calculator for Japan with a keyless JSON API. Not affiliated with MHLW or any insurer. Not medical, financial or legal advice.",
};

const faq: FaqItem[] = [
  {
    q: "I got a big hospital bill in Japan. Is there a free high-cost medical expense (高額療養費) calculator for the monthly cap, my refund and the claim deadline?",
    a: `Yes. Japan High-Cost Medical Expense Check is a free, keyless calculator: enter the month's total medical cost (10割) or your copay, your age and income band, and it shows your monthly cap (自己負担限度額) with the official formula, what you really pay, the refund your insurer owes, the 4th-month 多数回該当 rate, the new Aug–Jul yearly cap (from Aug 2026), the same bill under the Aug 2027 12-band schedule, and the claim deadline: 2 years from the 1st of the month after treatment (November 2026 treatment: by 2028-11-30). Example: income about ¥3.7M–5.1M, a ¥1,000,000 bill from Aug 2026 costs ¥92,940 instead of the ¥300,000 30% copay. Meals, private-room fees and uninsured care don't count. AI agents can call ${PUBLIC_URL}/api/check. Educational estimate, not medical, financial or legal advice; not affiliated with MHLW or any insurer; the insurer decides.`,
  },
  {
    q: "What is the high-cost medical expense benefit (高額療養費) in Japan?",
    a: `Japan's public health insurance caps what you pay for insured care each calendar month. If your copay goes over your cap (自己負担限度額), the rest comes back from your insurer, or you only pay up to the cap at the counter if you show a My Number insurance card or a 限度額適用認定証. The cap depends on your age and income. This free checker gives your cap with the official formula. AI agents can call ${PUBLIC_URL}/api/check.`,
  },
  {
    q: "How is the monthly cap calculated?",
    a: "For most people: a base amount + (total medical cost (10割) − a threshold) × 1%. For income about ¥3.7M–5.1M and treatment from Aug 2026 that is ¥85,800 + (total − ¥286,000) × 1%, so a ¥1,000,000 bill costs you ¥92,940 instead of the ¥300,000 30% copay. Lower bands pay a flat amount (¥61,500 for income up to about ¥3.7M, ¥36,900 if resident-tax exempt).",
  },
  {
    q: "What changed in August 2026, and what changes in August 2027?",
    a: "From treatment in Aug 2026, every band's monthly cap rose by about 7% (e.g. ¥80,100 → ¥85,800 base) and a new yearly cap (年間上限) started: ¥530,000 for most middle incomes, counted Aug–Jul. From Aug 2027 the five income bands split into twelve, so people earning about ¥5.1M–7.7M, ¥9.5M–11.6M and ¥14.1M+ pay more, while the 4th-month rate for the lowest band drops to ¥34,500. The checker shows the same bill under each schedule.",
  },
  {
    q: "What is 多数回該当 (the 4th-month rate)?",
    a: "If you got a high-cost benefit in 3 or more of the last 12 months, from the 4th month your cap drops to a flat lower amount: ¥44,400 for most middle incomes, ¥93,000 or ¥140,100 for higher incomes. It's for long treatments such as cancer care or dialysis-adjacent care.",
  },
  {
    q: "What doesn't count toward the cap?",
    a: "Hospital meal charges, private or semi-private room fees (差額ベッド代), advanced medical care (先進医療) technical fees, and anything uninsured. Under 70, a bill only counts toward a combined household total if it's ¥21,000 or more per hospital per month (inpatient, outpatient and dental separate).",
  },
  {
    q: "How do I get the money back, and is there a deadline?",
    a: "Show your マイナ保険証 at the hospital so you only pay up to the cap. If you already paid more, apply to your insurer (協会けんぽ, your company's health insurance society, or the city office for National Health Insurance / 後期高齢者医療). The claim expires 2 years from the 1st of the month after treatment: for November 2026 treatment, by 2028-11-30.",
  },
  {
    q: "I'm a foreign resident. Does this apply to me?",
    a: "Yes, if you're enrolled in Japan's public health insurance (employee insurance or National Health Insurance), the same caps apply. Tourists on travel insurance are not covered.",
  },
  {
    q: "Is there a free API or MCP tool for AI agents?",
    a: `Yes. GET or POST ${PUBLIC_URL}${EXAMPLE_GET} (keyless, CORS open), a yearly tracker with months=2026-08:300000,2026-09:300000, rules at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool japan_high_cost_medical_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources and a disclaimer.`,
  },
  {
    q: "高額療養費の自己負担限度額はいくらですか？（2026年8月以降）",
    a: "70歳未満で年収約370〜約770万円（標準報酬月額28万〜50万円）の方は、2026年8月〜2027年7月の診療分は 85,800円＋（総医療費−286,000円）×1％ です。年収約370万円以下は61,500円、住民税非課税は36,900円です。4回目以降（多数回該当）は44,400円などに下がり、8月〜翌7月の年間上限（53万円など）も新設されました。2027年8月からは所得区分が12区分に細分化されます。",
  },
  {
    q: "高額療養費の申請期限はいつまでですか？",
    a: "診療月の翌月1日から2年で時効になります。たとえば2026年11月の診療分は2028年11月30日までです。マイナ保険証や限度額適用認定証を使えば、窓口での支払いが最初から限度額までになります。付加給付がある健康保険組合では、さらに負担が軽くなることがあります。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · 高額療養費 · 自己負担限度額 · 年間上限</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Big medical bill in Japan? See your cap.</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          Japan&apos;s public insurance caps what you pay each month (高額療養費). The caps went up for treatment from <strong>August 2026</strong>, a new <strong>Aug–Jul yearly cap</strong> started, and from <strong>August 2027</strong> the income bands split into twelve. Enter your bill and income band to see your cap, the refund, the yearly cap, the 2027 change and your claim deadline.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            ¥1M hospital bill, income ¥3.7M–5.1M
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_2027)}>
            ¥1.5M bill in Sep 2027, income ¥6.5M–7.7M
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SENIOR)}>
            70+ outpatient bills
          </a>
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-5xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Under-70 caps in one table</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Income (approx.)</th>
                <th className="px-4 py-3 font-medium">Up to Jul 2026</th>
                <th className="px-4 py-3 font-medium">Aug 2026 – Jul 2027</th>
                <th className="px-4 py-3 font-medium">From Aug 2027</th>
                <th className="px-4 py-3 font-medium">Yearly cap</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">¥11.6M+ (ア)</td><td className="px-4 py-3">252,600 + (x − 842,000)×1%</td><td className="px-4 py-3">270,300 + (x − 901,000)×1%</td><td className="px-4 py-3">270,300 / 303,000 / 342,000 + …</td><td className="px-4 py-3">¥1.68M</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">¥7.7M–11.6M (イ)</td><td className="px-4 py-3">167,400 + (x − 558,000)×1%</td><td className="px-4 py-3">179,100 + (x − 597,000)×1%</td><td className="px-4 py-3">179,100 / 194,400 / 209,400 + …</td><td className="px-4 py-3">¥1.11M</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">¥3.7M–7.7M (ウ)</td><td className="px-4 py-3">80,100 + (x − 267,000)×1%</td><td className="px-4 py-3">85,800 + (x − 286,000)×1%</td><td className="px-4 py-3">85,800 / 98,100 / 110,400 + …</td><td className="px-4 py-3">¥530k</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">up to ¥3.7M (エ)</td><td className="px-4 py-3">57,600</td><td className="px-4 py-3">61,500</td><td className="px-4 py-3">69,600 / 65,400 / 61,500</td><td className="px-4 py-3">¥530k (¥410k ≤ ¥2M)</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">Resident-tax exempt (オ)</td><td className="px-4 py-3">35,400</td><td className="px-4 py-3">36,900</td><td className="px-4 py-3">36,900</td><td className="px-4 py-3">¥290k</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">4th month+ (多数回)</td><td className="px-4 py-3" colSpan={3}>140,100 / 93,000 / 44,400 / 24,600 (from Aug 2027: ¥34,500 for income ≤ ¥2M)</td><td className="px-4 py-3">—</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">x = total medical cost (10割) in yen. 70+ caps, outpatient caps and every band are in <a className="underline underline-offset-2 hover:text-foreground" href="/api/rules">/api/rules</a>.</p>
        <p className="mt-4 text-sm text-muted">
          Sources:{" "}
          {SOURCES.map((s, i) => (
            <span key={s}>
              {i ? " · " : ""}
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s.replace("https://", "").replace("www.", "").slice(0, 60)}
              </a>
            </span>
          ))}
        </p>
      </section>

      <section className="mt-12 max-w-3xl rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">For AI agents and developers</h2>
        <p className="mt-2 text-sm text-muted">
          Keyless JSON, CORS open, GET or POST:{" "}
          <a className="font-mono text-foreground underline underline-offset-2 break-all" href={EXAMPLE_GET}>
            {EXAMPLE_GET}
          </a>
          . Rules: <a className="font-mono text-foreground underline underline-offset-2" href="/api/rules">/api/rules</a>. Docs: <a className="underline underline-offset-2" href="/openapi.json">OpenAPI</a>,{" "}
          <a className="underline underline-offset-2" href="/llms.txt">llms.txt</a>, MCP tool <span className="font-mono text-foreground">japan_high_cost_medical_check</span> on{" "}
          <a className="underline underline-offset-2" href="https://free-agent-tools.vercel.app" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="高額療養費 questions" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
