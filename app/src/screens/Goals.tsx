import { useStore } from '../store'
import { skuById } from '../catalog'
import { priceFor } from '../pricing'
import { rupees } from '../constants'
import { Btn, CoinAmount, Ring, TopBar, Tag } from '../components/ui'

/**
 * GOALS — the cart replacement, and the mechanic that makes this a retention product.
 *
 * In e-commerce a cart is dead intent: an abandoned cart is a lost sale you email about. Here the
 * "cart" is the reason to open the app tomorrow. Reserving inverts the funnel from
 * browse → buy into want → play → afford → buy.
 *
 * Goals are NOT the Vault. A Goal is reserved and unpaid. The Vault holds what you own.
 */
export default function Goals() {
  const s = useStore()
  const { goals, wallet, archetype, dayIndex } = s

  return (
    <div className="flex h-full flex-col bg-felt-deep">
      <TopBar title="Your goals" onBack={() => s.go('lobby')}
        right={<CoinAmount n={wallet} size={12} className="text-[12px] text-gold" />} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
        {goals.length === 0 ? (
          <div className="mt-14 text-center">
            <div className="text-[34px]">🎯</div>
            <div className="mt-2 font-display text-[15px] font-bold">No goals yet</div>
            <div className="mx-auto mt-1.5 max-w-[250px] text-[11px] leading-relaxed text-cream-dim">
              Reserve a reward and it shows up in your match HUD. Every hand you play fills it.
            </div>
            <Btn variant="gold" className="mt-5" onClick={() => s.openStore('direct')}>
              Browse rewards
            </Btn>
          </div>
        ) : (
          <>
            <div className="pb-3 text-[10px] leading-relaxed text-cream-dim/70">
              Price locked for 7 days. Playing fills the ring — you'll see it in the match HUD.
            </div>
            {goals.map(g => {
              const sku = skuById(g.skuId)
              const p = priceFor(sku, wallet, archetype)
              const pct = Math.min(1, wallet / g.coinCostLocked)
              const done = pct >= 1
              const daysLeft = g.lockedUntilDay - dayIndex
              return (
                <div key={g.skuId}
                  className={`mb-2.5 rounded-2xl border p-3.5
                    ${done ? 'border-gold/45 bg-gold/8' : 'border-white/10 bg-black/25'}`}>
                  <div className="flex items-center gap-3">
                    <Ring pct={pct} size={50}>{Math.round(pct * 100)}%</Ring>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold uppercase tracking-wide"
                        style={{ color: sku.art.fg }}>{sku.brand}</div>
                      <div className="truncate font-display text-[14px] font-bold">{sku.title}</div>
                      <div className="mt-0.5 text-[10px] text-cream-dim">
                        {done
                          ? 'Ready to claim'
                          : `${p.matches} more ${p.matches === 1 ? 'win' : 'wins'} · ${p.short.toLocaleString('en-IN')} coins to go`}
                      </div>
                    </div>
                    <div className="text-right">
                      <CoinAmount n={g.coinCostLocked} size={11} className="text-[11px] text-gold" />
                      {p.cash > 0 && (
                        <div className="mt-0.5 text-[10px] text-cream-dim">+ {rupees(p.cash)}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    {done
                      ? <Btn variant="gold" full onClick={() => s.startCheckout(g.skuId)}>Claim now</Btn>
                      : <Btn variant="gold" full onClick={() => s.go('match')}>Play a hand</Btn>}
                    <Btn variant="ghost" onClick={() => s.abandonGoal(g.skuId, 'user_removed')}>
                      Remove
                    </Btn>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <Tag>{daysLeft > 0 ? `Price locked ${daysLeft}d` : 'Lock expired'}</Tag>
                    <Tag>Reserved day {g.dayCreated}</Tag>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <div className="px-4 pb-5">
        <Btn variant="primary" full onClick={() => s.go('match')}>Back to match</Btn>
      </div>
    </div>
  )
}
