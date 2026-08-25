import { useEffect } from 'react'
import { useStore } from '../store'
import { CATALOG, skuById } from '../catalog'
import { priceFor } from '../pricing'
import { EARN } from '../constants'
import { Bar, CoinIcon } from '../components/ui'
import { track } from '../events'

/**
 * LOBBY — the landing screen, and the game's existing meta layer.
 *
 * Layout ported from the Claude Design canvas: gradient hero card (eyebrow → display title →
 * white pill CTA), a 3-up stat row, an eyebrow'd "next reward" tile with a thin progress bar, and
 * a 3-up bottom row. Kept on felt rather than the design's light SaaS palette so it still reads as
 * a card game — the gradient is gold instead of iris/cyan.
 *
 * The store is ONE contextual tile, never labelled "Store" and never a co-equal nav item. Two of
 * the three bottom buttons are deliberately inert: a real game lobby has more in it than the store,
 * and that is the point being made.
 */
export default function Lobby() {
  const s = useStore()
  const { wallet, goals, archetype, vault } = s

  const goal = goals[0]
  const goalSku = goal ? skuById(goal.skuId) : null

  const priced = CATALOG.map(sku => ({ sku, p: priceFor(sku, wallet, archetype) }))
  const outOfReach = priced.filter(x => x.p.short > 0).sort((a, b) => a.p.short - b.p.short)[0]
  // Never leave the tile empty — it is the only entry point to the store from here.
  const affordable = priced.filter(x => x.p.short === 0).sort((a, b) => b.p.coinCost - a.p.coinCost)[0]
  const nearest = outOfReach ?? affordable

  const ctx = goal && goalSku
    ? { sku: goalSku, p: priceFor(goalSku, wallet, archetype), isGoal: true }
    : nearest ? { ...nearest, isGoal: false } : null

  const pct = ctx
    ? ctx.isGoal ? Math.min(1, wallet / goal!.coinCostLocked)
                 : Math.min(1, wallet / ctx.p.coinCost)
    : 0

  useEffect(() => {
    track('store_tile_impression', {
      tile_copy: ctx?.isGoal ? 'goal_progress' : 'nearest_reward',
      tile_context_sku: ctx?.sku.id ?? null,
    })
  }, [])

  const activeVouchers = vault.filter(v => v.state === 'active').length

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar bg-felt"
      style={{ backgroundImage: 'radial-gradient(120% 55% at 50% 0%, #14503D 0%, #0E3B2E 60%, #072A20 100%)' }}>

      {/* identity */}
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display
          text-[14px] font-extrabold text-ink" style={{ background: 'var(--grad-gold)' }}>K</div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold leading-none">Karan</div>
          <div className="t-sub mt-1 truncate text-cream-dim/70">
            Day {s.dayIndex} · {s.winStreak}-win streak
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-gold/25 px-3 py-1.5"
          style={{ background: 'var(--grad-gold-wash)' }}>
          <CoinIcon size={13} />
          <span className="font-display text-[14px] font-bold text-gold">
            {wallet.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* hero */}
      <div className="mx-5 flex flex-col gap-4 rounded-[20px] p-5"
        style={{ background: 'var(--grad-gold)' }}>
        <div className="t-eyebrow text-ink/60">Table 4 · 3 players waiting</div>
        <div className="t-hero text-ink">Play a hand</div>
        <button onClick={() => s.go('match')}
          className="tappable flex h-[52px] items-center justify-center rounded-full
            bg-[#08130F] text-[15px] font-semibold text-cream">
          Match now · {EARN.win} coins a win
        </button>
      </div>

      {/* stats */}
      <div className="mx-5 mt-3 flex gap-2.5">
        {[
          { v: s.dayIndex, k: 'day' },
          { v: s.matchesToday, k: 'played today' },
          { v: activeVouchers, k: 'in vault' },
        ].map(x => (
          <div key={x.k} className="flex-1 rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="t-stat text-cream">{x.v}</div>
            <div className="t-sub mt-1 text-cream-dim/65">{x.k}</div>
          </div>
        ))}
      </div>

      {/* the one store tile */}
      {ctx && (
        <>
          <div className="t-section mx-5 mb-2 mt-5 text-cream-dim/60">
            {ctx.isGoal ? 'your goal' : 'next reward'}
          </div>
          <button onClick={() => s.openStore('lobby_tile')}
            className="tappable mx-5 flex items-center gap-3 rounded-2xl border border-gold/20 p-3.5
              text-left" style={{ background: 'var(--grad-gold-wash)' }}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[19px]"
              style={{ background: ctx.sku.art.bg }}>{ctx.sku.art.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">
                {ctx.sku.brand} {ctx.sku.title}
              </div>
              <div className="t-sub mt-0.5 text-cream-dim/75">
                {ctx.p.short > 0
                  ? `${ctx.p.short.toLocaleString('en-IN')} coins to go · ${ctx.p.matches} ${ctx.p.matches === 1 ? 'win' : 'wins'}`
                  : 'Ready to claim'}
              </div>
              <div className="mt-2"><Bar pct={pct} /></div>
            </div>
            <span className="text-[18px] text-cream-dim/50">›</span>
          </button>
        </>
      )}

      {/* bottom row — two are inert on purpose: a lobby has more in it than the store */}
      <div className="mx-5 mb-6 mt-auto flex gap-2.5 pt-5">
        <div className="flex h-14 flex-1 items-center justify-center rounded-xl border
          border-white/8 text-[12px] text-cream-dim/35">Tournaments</div>
        <div className="flex h-14 flex-1 items-center justify-center rounded-xl border
          border-white/8 text-[12px] text-cream-dim/35">Friends</div>
        <button onClick={() => s.go('vault')}
          className="tappable flex h-14 flex-1 items-center justify-center rounded-xl border
            border-white/14 bg-black/25 text-[12px] font-semibold text-cream">
          Vault{activeVouchers ? ` · ${activeVouchers}` : ''}
        </button>
      </div>

      <div className="flex gap-4 px-5 pb-5">
        <button onClick={() => s.go('goals')}
          className="tappable t-sub text-cream-dim underline decoration-white/20 underline-offset-4">
          Goals{goals.length ? ` · ${goals.length}` : ''}
        </button>
        <button onClick={() => s.go('ledger')}
          className="tappable t-sub text-cream-dim underline decoration-white/20 underline-offset-4">
          Coin history
        </button>
      </div>
    </div>
  )
}
