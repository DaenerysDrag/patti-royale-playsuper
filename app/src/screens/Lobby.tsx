import { useEffect } from 'react'
import { useStore } from '../store'
import { CATALOG, skuById } from '../catalog'
import { priceFor } from '../pricing'
import { CoinAmount, Btn, Ring } from '../components/ui'
import { track } from '../events'

/**
 * LOBBY — the game's existing meta layer, with exactly ONE store tile in it.
 *
 * The tile is never labelled "STORE". It is always contextual — "320 coins to your Zepto voucher" —
 * because the player has no shopping intent to appeal to, only a goal to be reminded of.
 * The store is a guest in someone else's game: no new nav, no new tab bar.
 */
export default function Lobby() {
  const s = useStore()
  const { wallet, goals, archetype, vault } = s

  const goal = goals[0]
  const goalSku = goal ? skuById(goal.skuId) : null
  const priced = CATALOG.map(sku => ({ sku, p: priceFor(sku, wallet, archetype) }))
  // Cheapest thing still out of reach — close enough to want, far enough to play for.
  const outOfReach = priced.filter(x => x.p.short > 0).sort((a, b) => a.p.short - b.p.short)[0]
  // If the player can already afford everything, fall back to the most valuable claimable item.
  // Never leave the tile empty: it is the only entry point to the store from here.
  const affordable = priced.filter(x => x.p.short === 0).sort((a, b) => b.p.coinCost - a.p.coinCost)[0]
  const nearest = outOfReach ?? affordable

  const ctx = goal && goalSku
    ? { sku: goalSku, p: priceFor(goalSku, wallet, archetype), isGoal: true }
    : nearest ? { ...nearest, isGoal: false } : null

  useEffect(() => {
    track('store_tile_impression', {
      tile_copy: ctx?.isGoal ? 'goal_progress' : 'nearest_reward',
      tile_context_sku: ctx?.sku.id ?? null,
    })
  }, [])

  const activeVouchers = vault.filter(v => v.state === 'active').length

  return (
    <div className="flex h-full flex-col bg-felt"
      style={{ backgroundImage: 'radial-gradient(120% 55% at 50% 0%, #14503D 0%, #0E3B2E 60%, #072A20 100%)' }}>

      <div className="flex items-center gap-2.5 px-4 pt-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border
          border-gold/30 bg-gold/15 font-display text-[14px] font-extrabold text-gold">K</div>
        <div className="min-w-0">
          <div className="font-display text-[16px] font-extrabold leading-none">Patti Royale</div>
          <div className="mt-1 truncate text-[10px] text-cream-dim/70">
            Table 4 · 3 players waiting
          </div>
        </div>
        <div className="ml-auto rounded-full bg-black/35 px-3 py-2 border border-white/10">
          <CoinAmount n={wallet} size={14} className="text-[13px] text-gold" />
        </div>
      </div>

      {/* Stat strip — makes the lobby read as a game's meta layer rather than a shop's home */}
      <div className="mx-4 mt-3 grid grid-cols-3 overflow-hidden rounded-xl border
        border-white/10 bg-black/25">
        {[
          { v: s.dayIndex, k: 'day' },
          { v: s.winStreak, k: 'win streak' },
          { v: s.matchesToday, k: 'played today' },
        ].map((x, i) => (
          <div key={x.k} className={`px-2 py-2.5 text-center ${i ? 'border-l border-white/8' : ''}`}>
            <div className="font-display text-[16px] font-extrabold leading-none text-cream">
              {x.v}
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-wider text-cream-dim/60">{x.k}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 px-4">
        <button onClick={() => s.go('match')}
          className="tappable w-full rounded-2xl border border-gold/25 p-5 text-left"
          style={{ background: 'linear-gradient(135deg, #16553F 0%, #0C3626 100%)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
            Classic
          </div>
          <div className="mt-1 font-display text-[24px] font-extrabold leading-none">Play now</div>
          <div className="mt-1.5 text-[11px] text-cream-dim">
            Best of 3 tricks · {50} coins a win
          </div>
        </button>
      </div>

      {/* THE store tile. One, contextual, inside the existing meta layer. */}
      {ctx && (
        <div className="mt-3 px-4">
          <button onClick={() => s.openStore('lobby_tile')}
            className="tappable w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-left">
            <div className="flex items-center gap-3">
              {ctx.isGoal
                ? <Ring pct={Math.min(1, wallet / goal!.coinCostLocked)} size={42}>
                    {Math.round(Math.min(1, wallet / goal!.coinCostLocked) * 100)}%
                  </Ring>
                : <div className="grid h-10 w-10 place-items-center rounded-xl text-[19px]"
                    style={{ background: ctx.sku.art.bg }}>{ctx.sku.art.emoji}</div>}
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold uppercase tracking-widest text-cream-dim/60">
                  {ctx.isGoal ? 'Your goal' : ctx.p.short > 0 ? 'Closest reward' : 'Ready to claim'}
                </div>
                <div className="mt-0.5 truncate font-display text-[14px] font-bold">
                  {ctx.p.short > 0
                    ? <><span className="text-gold">{ctx.p.short.toLocaleString('en-IN')} coins</span>
                        {' '}to {ctx.sku.brand} {ctx.sku.title}</>
                    : <>Ready — {ctx.sku.brand} {ctx.sku.title}</>}
                </div>
              </div>
              <span className="text-cream-dim">›</span>
            </div>
          </button>
        </div>
      )}

      <div className="mt-auto grid grid-cols-3 gap-2 px-4 pb-6 pt-4">
        <Btn variant="dark" onClick={() => s.go('goals')}>
          Goals{goals.length ? ` · ${goals.length}` : ''}
        </Btn>
        <Btn variant="dark" onClick={() => s.go('vault')}>
          Vault{activeVouchers ? ` · ${activeVouchers}` : ''}
        </Btn>
        <Btn variant="dark" onClick={() => s.go('ledger')}>Coins</Btn>
      </div>
    </div>
  )
}
