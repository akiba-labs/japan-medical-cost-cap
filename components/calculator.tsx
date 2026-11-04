"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { BANDS, BAND_INFO, type AgeGroup, type Band, type Setting } from "@/lib/cap";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, safeCheck, type Shared } from "@/lib/share";
import { VERDICT_LABEL, VERDICT_STYLE } from "@/lib/verdict";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";
const yen = (n: number) => `¥${Math.round(n).toLocaleString("en-US")}`;
const SCHEDULE_SHORT: Record<string, string> = { pre: "up to Jul 2026", r8: "Aug 2026 – Jul 2027", r9: "from Aug 2027" };

export function Calculator({ initial }: { initial?: Shared }) {
  const [s, setS] = useState<Shared>(initial ?? EXAMPLE_SHARED);
  const [mode, setMode] = useState<"total" | "copay">(initial?.totalCost === null && initial?.copay !== null ? "copay" : "total");
  const set = <K extends keyof Shared>(k: K) => (v: Shared[K]) => setS((p) => ({ ...p, [k]: v }));
  const amount = mode === "total" ? s.totalCost : s.copay;
  const setAmount = (v: number | null) => setS((p) => (mode === "total" ? { ...p, totalCost: v, copay: null } : { ...p, copay: v, totalCost: null }));
  const bands = BANDS.filter((b) => !(s.ageGroup === "under70" && b === "nontaxable_low"));
  const r = safeCheck(s);
  const shareUrl = `${PUBLIC_URL}${resultPath(s)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your bill · 医療費</p>
        <div className="mt-3 flex gap-2">
          {(["under70", "70plus"] as AgeGroup[]).map((a) => (
            <button key={a} type="button" data-testid={`age-${a}`} aria-pressed={s.ageGroup === a} onClick={() => setS((p) => ({ ...p, ageGroup: a, band: a === "under70" && p.band === "nontaxable_low" ? "nontaxable" : p.band }))} className={`rounded-full border px-3 py-1 text-xs ${s.ageGroup === a ? "border-amber bg-amber/15 text-foreground" : "border-line text-muted hover:text-foreground"}`}>
              {a === "under70" ? "Under 70 (70歳未満)" : "70 or older (70歳以上)"}
            </button>
          ))}
        </div>
        <label className="mt-5 block">
          <span className="text-sm font-medium text-foreground">Income band 所得区分</span>
          <select data-testid="band" className={field} value={s.band} onChange={(e) => set("band")(e.target.value as Band)}>
            {bands.map((b) => (
              <option key={b} value={b}>{BAND_INFO[b].label}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">
            Employee insurance 標準報酬月額 {BAND_INFO[s.band].smr} · NHI 旧ただし書き所得 {BAND_INFO[s.band].nhiIncome}{s.ageGroup === "70plus" ? ` · 70+ 課税所得 ${BAND_INFO[s.band].taxable70}` : ""} · old band {BAND_INFO[s.band].legacy}
          </span>
        </label>
        <label className="mt-3 block">
          <span className="text-sm font-medium text-foreground">Treatment month 診療月</span>
          <input data-testid="month" type="month" min="2018-08" max="2035-12" className={field} value={s.month} onChange={(e) => e.target.value && set("month")(e.target.value)} />
        </label>
        <div className="mt-4 flex gap-2 text-xs">
          <button type="button" data-testid="mode-total" aria-pressed={mode === "total"} onClick={() => { setMode("total"); setS((p) => ({ ...p, totalCost: p.totalCost ?? (p.copay !== null ? Math.round(p.copay / 0.3) : 1_000_000), copay: null })); }} className={`rounded-full border px-3 py-1 ${mode === "total" ? "border-amber bg-amber/15 text-foreground" : "border-line text-muted"}`}>Total cost (10割)</button>
          <button type="button" data-testid="mode-copay" aria-pressed={mode === "copay"} onClick={() => { setMode("copay"); setS((p) => ({ ...p, copay: p.copay ?? (p.totalCost !== null ? Math.round(p.totalCost * 0.3) : 300_000), totalCost: null })); }} className={`rounded-full border px-3 py-1 ${mode === "copay" ? "border-amber bg-amber/15 text-foreground" : "border-line text-muted"}`}>What I paid (窓口負担)</button>
        </div>
        <label className="mt-2 block">
          <span className="text-xs font-medium text-muted">{mode === "total" ? "Total medical cost this month, yen (総医療費)" : "Insured copay this month, yen"}</span>
          <input data-testid="amount" type="number" inputMode="numeric" min={0} step={1000} className={field} value={amount ?? ""} onChange={(e) => setAmount(e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-muted">Care 入院・外来</span>
            <select data-testid="setting" className={field} value={s.setting} onChange={(e) => set("setting")(e.target.value as Setting)}>
              <option value="inpatient">Hospital stay / total</option>
              <option value="outpatient">Outpatient only</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Refund months in last 12</span>
            <select data-testid="prior" className={field} value={s.priorHitMonths} onChange={(e) => set("priorHitMonths")(Number(e.target.value))}>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>{n === 3 ? "3 or more (多数回)" : n}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">Insured care only. Hospital meals, private rooms, 先進医療 and uninsured care don&apos;t count. Your insurer may pay more (付加給付).</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                {VERDICT_LABEL[r.verdict]} · {r.month.month} · {SCHEDULE_SHORT[r.schedule.id]}
              </p>
              <p className={`mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl ${VERDICT_STYLE[r.verdict]}`}>{r.summary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">Your monthly cap</p>
                  <p className="mt-1 font-mono text-xl text-foreground" data-testid="cap">{yen(r.month.monthlyCap)}</p>
                  <p className="text-xs text-muted">{r.month.formula}</p>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">Comes back</p>
                  <p className="mt-1 font-mono text-xl text-teal-200" data-testid="refund">{yen(r.month.monthlyRefund)}</p>
                  <p className="text-xs text-muted">of {yen(r.month.copay)} copay ({Math.round(r.burdenRate * 10)}割)</p>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">Yearly cap (Aug–Jul)</p>
                  <p className="mt-1 font-mono text-xl text-foreground">{r.annualCap?.amount ? yen(r.annualCap.amount) : "—"}</p>
                  <p className="text-xs text-muted">{r.annualCap?.period ? `${r.annualCap.period.from} → ${r.annualCap.period.to}` : "starts with Aug 2026 treatment"}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {r.from2027 ? (
                  <div className="rounded-2xl border border-line p-3" data-testid="from2027">
                    <p className="text-xs text-muted">Same bill from Aug 2027</p>
                    <p className="mt-1 font-mono text-lg text-foreground">{yen(r.from2027.youPay)} <span className={r.from2027.changeJPY > 0 ? "text-rose-200" : r.from2027.changeJPY < 0 ? "text-teal-200" : "text-muted"}>({r.from2027.changeJPY >= 0 ? "+" : "−"}{yen(Math.abs(r.from2027.changeJPY))})</span></p>
                  </div>
                ) : null}
                {r.beforeAug2026 ? (
                  <div className="rounded-2xl border border-line p-3">
                    <p className="text-xs text-muted">Before Aug 2026 you&apos;d have paid</p>
                    <p className="mt-1 font-mono text-lg text-foreground">{yen(r.beforeAug2026.youPay)} <span className="text-muted">(now {r.beforeAug2026.changeJPY >= 0 ? "+" : "−"}{yen(Math.abs(r.beforeAug2026.changeJPY))})</span></p>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">Claim refund by</p>
                  <p className="mt-1 font-mono text-lg text-foreground">{r.claim.deadline}</p>
                </div>
                <div className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-muted">4th-month rate (多数回)</p>
                  <p className="mt-1 font-mono text-lg text-foreground">{r.caps.manyTimes !== null ? yen(r.caps.manyTimes) : "none"}</p>
                </div>
              </div>
              <h3 className="mt-6 text-sm font-semibold text-foreground">What to do</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted" data-testid="steps">
                {r.steps.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted">Band: {r.band.label} ({r.band.labelJa}). {r.callCenter}.</p>
              <div className="mt-6">
                <ShareBar url={shareUrl} text={`Japan 高額療養費: ${r.summary}`} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Enter a bill amount and a month from 2018-08.</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}
