import type { Metadata } from "next";
import { DISCLAIMER, RULES_AS_OF, SOURCES } from "@/lib/cap";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational calculator. It applies a dated reading (as of {RULES_AS_OF}) of the Ministry of Health, Labour and Welfare&apos;s high-cost medical expense benefit (高額療養費) tables, for treatment up to July 2026, August 2026 to July 2027 and from August 2027, to the bill and income band you enter.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it isn&apos;t</h2>
          <p className="mt-2">{DISCLAIMER}</p>
          <p className="mt-2">
            Your insurer works out the real benefit from the hospital&apos;s claims (レセプト), per person, per facility and per household, and applies its own extra benefits (付加給付). Income bands set by annual income are rough; your insurer uses your 標準報酬月額, 旧ただし書き所得 or 課税所得. The Aug 2027 tables are law (政令第240号) but could still be amended. Ask your insurer, or the MHLW call center 0120-617-111, before relying on a number.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">What you enter stays in your browser (or in a share link you create). No login, no names, no medical details beyond an amount, no database.</p>
        </section>
      </div>
    </div>
  );
}
