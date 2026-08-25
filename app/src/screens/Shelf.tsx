import { useEffect, useMemo } from 'react'
import { useStore } from '../store'
import { CATALOG } from '../catalog'
import { priceFor } from '../pricing'
import { TIER_LABEL, TIER_NOTE, rupees } from '../constants'
import { CoinAmount, TopBar, Tag } from '../components/ui'
import { track } from '../events'
import type { SkuTier } from '../types'

/**
 * THE SHELF — a shelf, not a search engine.
 *
 * No search bar. No filters. No categories. The attention window is ~40 seconds between matches
 * and choice paralysis is the enemy, so there are 12 items in three fixed groups and nothing else.
 *
 * The order is IDENTICAL for every player — grouped by item tier, which is a property of the item.
 * No personalised ranking, no recommender. What varies per player is only the effort copy on each
 * card ("3 more wins"), because effort is the honest price of a coin.
 */
const TIERS: SkuTier[] = [1, 2, 3]

export default function Shelf() {
  const s = useStore()
  const { wallet, archetype, variant, goals } = s

  const priced = useMemo(
    () => CATALOG.map(sku => ({ sku, p: priceFor(sku, wallet, archetype) })),
    [wallet, archetype],
  )

  useEffect(() => {
    priced.forEach((x, i) => track('sku_impression', {
      sku_id: x.sku.id, tier_shown: x.sku.tier, position: i,
    }))
  }, [])

  return (
    <div className="flex h-full flex-col bg-felt-deep">
      <TopBar title="Rewards" onBack={() => s.go('lobby')}
        right={<div className="rounded-full bg-black/35 px-2.5 py-1.5 border border-white/10">
          <CoinAmount n={wallet} size={12} className="text-[12px] text-gold" />
        </div>} />

      <div className="px-4 pb-1 text-[10px] leading-relaxed text-cream-dim/70">
        Real brands. Coins cover the discount — the rest is cash.
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {TIERS.map(tier => {
          const items = priced.filter(x => x.sku.tier === tier)
          return (
            <div key={tier} className="mb-5">
              <div className="mb-0.5 flex items-center gap-2">
                <div className="font-display text-[12px] font-extrabold uppercase tracking-widest
                  text-cream-dim">{TIER_LABEL[tier]}</div>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="mb-2 text-[9px] text-cream-dim/50">{TIER_NOTE[tier]}</div>

              <div className="grid grid-cols-2 gap-2.5">
                {items.map(({ sku, p }) => {
                  const reserved = goals.some(g => g.skuId === sku.id)
                  return (
                    <button key={sku.id} onClick={() => s.viewSku(sku.id)}
                      className="tappable overflow-hidden rounded-2xl border border-white/10
                        bg-black/25 text-left">
                      <div className="relative grid h-[62px] place-items-center text-[26px]"
                        style={{ background: sku.art.bg }}>
                        {sku.art.emoji}
                        {reserved && (
                          <div className="absolute right-1.5 top-1.5"><Tag tone="gold">Goal</Tag></div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="text-[9px] font-bold uppercase tracking-wide"
                          style={{ color: sku.art.fg }}>{sku.brand}</div>
                        <div className="mt-0.5 truncate text-[12px] font-semibold leading-tight">
                          {sku.title}
                        </div>

                        {/* A/B: the hero line. This is the experiment. */}
                        {variant === 'A' ? (
                          <>
                            <div className="mt-1.5 font-display text-[15px] font-extrabold text-cream">
                              {rupees(sku.mrp)}
                            </div>
                            <div className="mt-0.5 text-[10px] text-cream-dim">
                              <CoinAmount n={p.coinCost} size={10} />
                              {p.cash > 0 && <span> + {rupees(p.cash)}</span>}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={`mt-1.5 font-display text-[15px] font-extrabold
                              ${p.affordable ? 'text-gold' : 'text-cream'}`}>
                              {p.affordable
                                ? 'Ready now'
                                : p.matches <= 1 ? '1 more win' : `${p.matches} more wins`}
                            </div>
                            <div className="mt-0.5 text-[10px] text-cream-dim">
                              <CoinAmount n={p.coinCost} size={10} />
                              {p.cash > 0 && <span> + {rupees(p.cash)}</span>}
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="rounded-xl border border-white/8 bg-black/20 p-3 text-[10px]
          leading-relaxed text-cream-dim/70">
          Same twelve rewards for everyone, in the same order. The only thing that changes is how
          many hands <span className="text-cream-dim">you</span> need — because that's the real
          price of a coin.
        </div>
      </div>
    </div>
  )
}
