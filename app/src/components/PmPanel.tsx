import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { FUNNEL, countOf, getLog, subscribe, shortByDistribution, type TrackedEvent } from '../events'

/**
 * PM CONSOLE — three sections: funnel, experiment card, event stream.
 *
 * Deliberately not a dashboard. No coin-float charts, no economy tiles. The point is to show the
 * ONE question this product lives or dies on — do players reserve a goal? — and to show it being
 * answered by the app you are clicking, with nothing mocked.
 */

const Section = ({ title, sub, children }:
  { title: string; sub?: string; children: React.ReactNode }) => (
  <div className="border-b border-white/8 px-4 py-3.5">
    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#7FD4AE]">
      {title}
    </div>
    {sub && <div className="mt-0.5 font-mono text-[9px] leading-relaxed text-white/40">{sub}</div>}
    <div className="mt-2.5">{children}</div>
  </div>
)

export default function PmPanel() {
  const s = useStore()
  const [, force] = useState(0)
  useEffect(() => subscribe(() => force(x => x + 1)), [])
  const log = getLog()

  const counts = FUNNEL.map(n => ({ name: n, n: countOf(n) }))
  const dist = shortByDistribution()

  return (
    <div className="h-full overflow-y-auto bg-slate text-white/80">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate/95 px-4 py-3 backdrop-blur">
        <div className="font-mono text-[11px] font-bold tracking-wide text-white">PM CONSOLE</div>
        <div className="mt-0.5 font-mono text-[9px] text-white/40">
          Fired by the app you're clicking. Nothing here is mocked.
        </div>
      </div>

      {/* 1 — FUNNEL */}
      <Section title="Funnel"
        sub="Drop-off at each step. Step 3→4 is the one we instrument for.">
        {counts.map((c, i) => {
          const prev = i > 0 ? counts[i - 1].n : c.n
          const drop = prev > 0 ? 1 - c.n / prev : 0
          const isLeak = c.name === 'goal_created'
          return (
            <div key={c.name} className={`mb-1 rounded-md px-2 py-1.5
              ${isLeak ? 'border border-[#FFB454]/35 bg-[#FFB454]/8' : 'bg-white/4'}`}>
              <div className="flex items-baseline justify-between font-mono text-[10px]">
                <span className={isLeak ? 'text-[#FFB454]' : 'text-white/55'}>
                  {i + 1}. {c.name}
                </span>
                <span className="font-bold tabular-nums text-white">{c.n}</span>
              </div>
              {i > 0 && (
                <>
                  <div className="mt-0.5 h-[3px] overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{
                      width: `${prev > 0 ? (c.n / prev) * 100 : 0}%`,
                      background: isLeak ? '#FFB454' : '#5BE3A0',
                    }} />
                  </div>
                  <div className="mt-0.5 font-mono text-[9px] text-white/35">
                    −{Math.round(drop * 100)}% from previous{isLeak && ' ← THE LEAK'}
                  </div>
                </>
              )}
            </div>
          )
        })}

        <div className="mt-3 rounded-md border border-white/10 bg-white/4 p-2.5">
          <div className="font-mono text-[9px] font-bold uppercase tracking-wide text-[#FFB454]">
            coins_short_by at sku_view — why it leaks
          </div>
          <div className="mt-1.5 space-y-1">
            {[
              { k: '= 0 → interest failure', v: dist.zero, c: '#FF7C6B' },
              { k: '≤ 1.5k → pricing failure', v: dist.near, c: '#FFB454' },
              { k: '> 1.5k → placement failure', v: dist.far, c: '#5BE3A0' },
            ].map(b => (
              <div key={b.k}>
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-white/50">{b.k}</span>
                  <span className="tabular-nums text-white/80">{b.v}</span>
                </div>
                <div className="mt-0.5 h-[3px] overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{
                    width: `${dist.total ? (b.v / dist.total) * 100 : 0}%`, background: b.c }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 font-mono text-[9px] leading-relaxed text-white/35">
            Three diagnoses, three different owners. No other property separates them — which is
            why every SKU-scoped event carries it.
          </div>
        </div>

        <div className="mt-2 rounded-md border border-white/10 bg-white/4 p-2.5
          font-mono text-[9px] leading-relaxed text-white/45">
          <span className="text-white/70">voucher_redeemed</span> — the brand's real conversion,
          off-platform at the merchant, days later. Not observable here. payment_success is a
          delivered coupon, not revenue.
        </div>
      </Section>

      {/* 2 — EXPERIMENT */}
      <Section title="Experiment" sub="Live. Flipping this re-renders the shelf.">
        <div className="mb-2.5 flex gap-1.5">
          {(['A', 'B'] as const).map(v => (
            <button key={v} onClick={() => s.setVariant(v)}
              className={`flex-1 rounded-md px-2 py-2 font-mono text-[10px] font-bold
                ${s.variant === v ? 'bg-[#5BE3A0] text-slate' : 'bg-white/6 text-white/50 hover:bg-white/10'}`}>
              {v} · {v === 'A' ? 'price-first' : 'reach-first'}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 font-mono text-[9px] leading-relaxed">
          <div><span className="text-white/40">H: </span><span className="text-white/80">
            Reachability-first cards ("3 more wins") increase goal_created per sku_view versus
            price-first cards ("₹389").</span></div>
          <div><span className="text-white/40">Primary: </span>
            <span className="text-white/80">goal-creation rate</span></div>
          <div><span className="text-white/40">Secondary: </span>
            <span className="text-white/80">D7 retention</span></div>
          <div><span className="text-white/40">Guardrails: </span>
            <span className="text-white/80">IAP ARPDAU · session length · ad impressions/DAU</span></div>
          <div><span className="text-white/40">MDE: </span>
            <span className="text-white/80">+2pp on a ~25% base ≈ 14k/arm — under a day at 1M DAU</span></div>
        </div>
        <div className="mt-2.5 rounded-md border border-[#5BE3A0]/25 bg-[#5BE3A0]/8 p-2
          font-mono text-[9px] leading-relaxed text-[#9BEBC4]">
          Only ~0.12% of DAU need to redeem daily to hit PlaySuper's published +5.2% ARPDAU. So the
          target is retention BREADTH — players holding a goal — not conversion depth. That is why
          the leak we chase is sku_view → goal_created and not anything nearer the payment.
        </div>
      </Section>

      {/* 3 — EVENT STREAM */}
      <Section title="Event stream"
        sub="Newest first. Names are a closed union — an invented name won't compile.">
        <div className="space-y-1">
          {log.length === 0 && (
            <div className="font-mono text-[10px] text-white/30">Nothing yet. Play a hand.</div>
          )}
          {log.slice(0, 30).map((e: TrackedEvent) => {
            const leak = e.name === 'sku_view' || e.name === 'goal_created'
            const shown = ['sku_id', 'coins_short_by', 'entry_point', 'coin_balance',
              'pct_complete', 'match_result', 'cash_paid', 'coins_applied', 'days_to_afford',
              'variant', 'sku_tier']
            return (
              <div key={e.seq} className={`rounded px-2 py-1.5 font-mono text-[9px] leading-snug
                ${leak ? 'bg-[#FFB454]/10' : 'bg-white/4'}`}>
                <div className="flex items-baseline gap-2">
                  <span className="tabular-nums text-white/25">{String(e.seq).padStart(3, '0')}</span>
                  <span className={`font-bold ${leak ? 'text-[#FFB454]' : 'text-[#7FD4AE]'}`}>
                    {e.name}
                  </span>
                </div>
                <div className="mt-0.5 break-all text-white/40">
                  {Object.entries(e.props)
                    .filter(([k, v]) => v !== null && v !== undefined && shown.includes(k))
                    .map(([k, v]) => `${k}=${v}`).join('  ')}
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
