import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { FUNNEL, countOf, getLog, subscribe, shortByDistribution, type TrackedEvent } from '../events'

/**
 * PM CONSOLE — three sections: funnel, experiment, event stream.
 *
 * Presentation ported from the Claude Design canvas, which read far more like an instrument than
 * our first pass: a blinking live dot, mono section labels at 10px/.16em tracking, a three-column
 * time|name|value event row, and 6px gradient funnel bars with an eased width transition. Type
 * bumped from 9px to 10–10.5px mono, which is the readable floor for a monospace at this size.
 *
 * What we do NOT take from it is the economy readout — and the reason is in that design's own
 * footer: "the funnel and economy figures are illustrative, not instrumented." Everything here is
 * fired by the app.
 */

const Section = ({ title, sub, children }:
  { title: string; sub?: string; children: React.ReactNode }) => (
  <div className="border-b border-white/8 px-5 py-4">
    <div className="t-mono-lbl text-white/40">{title}</div>
    {sub && <div className="t-mono mt-1 text-white/35">{sub}</div>}
    <div className="mt-3">{children}</div>
  </div>
)

export default function PmPanel() {
  const s = useStore()
  const [, force] = useState(0)
  useEffect(() => subscribe(() => force(x => x + 1)), [])
  const log = getLog()

  const counts = FUNNEL.map(n => ({ name: n, n: countOf(n) }))
  const top = counts[0]?.n || 0
  const dist = shortByDistribution()

  const clock = (ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour12: false })

  return (
    <div className="h-full overflow-y-auto bg-slate text-white/80">
      {/* header: live dot + actions + status line */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5BE3A0]"
            style={{ animation: 'prBlink 1.6s ease-in-out infinite' }} />
          <span className="t-mono-lbl text-white/55">instrumentation · live</span>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={() => s.simulateDays(5)}
            className="tappable flex h-[38px] flex-1 items-center justify-center rounded-md
              font-mono text-[11px] font-semibold tracking-[.04em] text-ink"
            style={{ background: 'var(--grad-gold)' }}>
            SIMULATE 5 DAYS
          </button>
          <button onClick={() => s.resolveMatch('win')}
            className="tappable flex h-[38px] w-[86px] items-center justify-center rounded-md
              border border-white/18 font-mono text-[11px] text-white/75">
            +1 WIN
          </button>
        </div>

        <div className="t-mono mt-2.5 text-white/38">
          day {s.dayIndex} · variant {s.variant} · balance {s.wallet.toLocaleString('en-IN')}
        </div>
      </div>

      {/* 1 — FUNNEL */}
      <Section title={`Store funnel · variant ${s.variant}`}
        sub="Drop-off at each step. Step 3→4 is the one we instrument for.">
        <div className="flex flex-col gap-2.5">
          {counts.map((c, i) => {
            const prev = i > 0 ? counts[i - 1].n : c.n
            const drop = prev > 0 ? 1 - c.n / prev : 0
            const isLeak = c.name === 'goal_created'
            return (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 font-mono text-[10.5px]">
                  <span className={`truncate ${isLeak ? 'text-[#FFB454]' : 'text-white/72'}`}>
                    {i + 1}. {c.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-white/50">
                    {c.n}
                    {i > 0 && <span className="pl-1.5 text-white/30">−{Math.round(drop * 100)}%</span>}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${top > 0 ? (c.n / top) * 100 : 0}%`,
                      background: isLeak ? '#FFB454' : 'var(--grad-gold)',
                      transition: 'width 500ms cubic-bezier(.22,.61,.36,1)',
                    }} />
                </div>
                {isLeak && (
                  <div className="font-mono text-[10px] text-[#FFB454]/70">← the leak</div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-white/4 p-3">
          <div className="t-mono-lbl text-[#FFB454]">coins_short_by at sku_view</div>
          <div className="mt-2 space-y-1.5">
            {[
              { k: '= 0 → interest failure', v: dist.zero, c: '#FF7C6B' },
              { k: '≤ 1.5k → pricing failure', v: dist.near, c: '#FFB454' },
              { k: '> 1.5k → placement failure', v: dist.far, c: '#5BE3A0' },
            ].map(b => (
              <div key={b.k}>
                <div className="flex justify-between font-mono text-[10.5px]">
                  <span className="text-white/55">{b.k}</span>
                  <span className="tabular-nums text-white/80">{b.v}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{
                    width: `${dist.total ? (b.v / dist.total) * 100 : 0}%`, background: b.c }} />
                </div>
              </div>
            ))}
          </div>
          <div className="t-mono mt-2.5 text-white/35">
            Three diagnoses, three different owners. No other property separates them.
          </div>
        </div>

        <div className="t-mono mt-2.5 rounded-md border border-white/10 bg-white/4 p-3 text-white/45">
          <span className="text-white/70">voucher_redeemed</span> — the brand's real conversion,
          off-platform at the merchant, days later. Not observable here.
        </div>
      </Section>

      {/* 2 — EXPERIMENT */}
      <Section title="Experiment" sub="Live. Flipping this re-renders the shelf.">
        <div className="mb-3 flex gap-2">
          {(['A', 'B'] as const).map(v => (
            <button key={v} onClick={() => s.setVariant(v)}
              className={`h-[34px] flex-1 rounded-md font-mono text-[10.5px] font-bold
                ${s.variant === v ? 'text-ink' : 'bg-white/6 text-white/50 hover:bg-white/10'}`}
              style={s.variant === v ? { background: 'var(--grad-gold)' } : undefined}>
              {v} · {v === 'A' ? 'price-first' : 'reach-first'}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 font-mono text-[10.5px] leading-relaxed">
          <div><span className="text-white/40">H: </span><span className="text-white/80">
            Reachability-first cards ("3 more wins") increase goal_created per sku_view versus
            price-first cards ("₹389").</span></div>
          <div><span className="text-white/40">Primary: </span>
            <span className="text-white/80">goal-creation rate</span></div>
          <div><span className="text-white/40">Guardrails: </span>
            <span className="text-white/80">IAP ARPDAU · session length · ad impressions/DAU</span></div>
          <div><span className="text-white/40">MDE: </span>
            <span className="text-white/80">+2pp on a ~25% base ≈ 14k/arm — under a day at 1M DAU</span></div>
        </div>
        <div className="t-mono mt-3 rounded-md border border-[#5BE3A0]/25 bg-[#5BE3A0]/8 p-2.5
          text-[#9BEBC4]">
          Only ~0.12% of DAU need to redeem daily to hit PlaySuper's published +5.2% ARPDAU. The
          target is retention breadth — players holding a goal — not conversion depth.
        </div>
      </Section>

      {/* 3 — EVENT STREAM */}
      <Section title="Event stream" sub="Newest first. Names are a closed union — an invented one won't compile.">
        <div className="flex flex-col">
          {log.length === 0 && (
            <div className="t-mono text-white/30">Nothing yet. Play a hand.</div>
          )}
          {log.slice(0, 34).map((e: TrackedEvent) => {
            const leak = e.name === 'sku_view' || e.name === 'goal_created'
            const short = e.props.coins_short_by
            const val = e.props.sku_id ?? (short !== undefined && short !== 0 ? `−${short}` : '')
            return (
              <div key={e.seq}
                className="flex gap-2.5 border-b border-white/5 py-1.5 font-mono text-[10.5px]">
                <span className="shrink-0 tabular-nums text-white/32">{clock(e.ts)}</span>
                <span className={`min-w-0 flex-1 truncate ${leak ? 'text-[#FFB454]' : 'text-[#7FD4AE]'}`}>
                  {e.name}
                </span>
                <span className="shrink-0 truncate text-white/40" style={{ maxWidth: 96 }}>
                  {String(val)}
                </span>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
