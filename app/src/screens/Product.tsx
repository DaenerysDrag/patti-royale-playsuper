import { useState } from 'react'
import { useStore } from '../store'
import { skuById } from '../catalog'
import { priceFor } from '../pricing'
import { PEG, TIER_NOTE, rupees } from '../constants'
import { CoinAmount, Btn, TopBar, Tag, Ring } from '../components/ui'
import { track } from '../events'
import CoinSlider from '../components/CoinSlider'

/**
 * PRODUCT PAGE.
 *
 * Three things a traditional PDP does not do:
 *  1. Prices the item in EFFORT ("6 more wins · 2.4 days") from this player's earn rate.
 *  2. States the coin cap as a fact about the item, the same for everybody — no tiers, no
 *     dynamic pricing, nothing to feel cheated by.
 *  3. Never dead-ends. If you can't afford it, the primary action becomes "reserve it and play" —
 *     the retention loop, not a consolation prize.
 */
export default function Product() {
  const s = useStore()
  const { activeSkuId, wallet, archetype, goals } = s
  const sku = skuById(activeSkuId!)
  const p = priceFor(sku, wallet, archetype)

  const capCoins = p.coinCost
  const [applied, setApplied] = useState(Math.min(capCoins, wallet))
  const cashDue = Math.max(0, Math.round(sku.mrp - applied / PEG))
  const reserved = goals.some(g => g.skuId === sku.id)
  const fullyCoinFunded = p.capPct >= 1

  const onSlide = (v: number) => {
    setApplied(v)
    track('coin_slider_moved', {
      coins_applied: v,
      cash_remaining: Math.max(0, Math.round(sku.mrp - v / PEG)),
      cap_pct: p.capPct,
      hit_cap: v >= capCoins,
    })
  }

  return (
    <div className="flex h-full flex-col bg-felt-deep">
      <TopBar title={sku.brand} onBack={() => s.go('shelf')}
        right={<CoinAmount n={wallet} size={12} className="text-[12px] text-gold" />} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid h-[120px] place-items-center rounded-2xl text-[52px]"
          style={{ background: sku.art.bg }}>{sku.art.emoji}</div>

        <div className="mt-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[20px] font-extrabold leading-tight">{sku.title}</div>
            <div className="mt-0.5 text-[11px] text-cream-dim">{sku.short}</div>
          </div>
          <Tag tone={p.affordable ? 'gold' : 'neutral'}>
            {p.affordable ? 'Ready' : `Tier ${sku.tier}`}
          </Tag>
        </div>

        {/* EFFORT PRICE — the in-game equivalent of a price tag */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3.5">
          {p.affordable ? (
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/18
                text-[15px] text-gold">✓</div>
              <div>
                <div className="font-display text-[14px] font-bold text-gold">You can claim this</div>
                <div className="text-[10px] text-cream-dim">Earned over {s.dayIndex} days of play</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Ring pct={Math.min(1, wallet / capCoins)} size={42}>
                {Math.round(Math.min(1, wallet / capCoins) * 100)}%
              </Ring>
              <div>
                <div className="font-display text-[15px] font-extrabold">
                  {p.matches} more {p.matches === 1 ? 'win' : 'wins'}
                </div>
                <div className="mt-0.5 text-[10px] text-cream-dim">
                  ≈ {p.days < 1 ? 'under a day' : `${p.days.toFixed(1)} days`} at how you play ·{' '}
                  {p.short.toLocaleString('en-IN')} coins to go
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PRICE */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3.5">
          {fullyCoinFunded ? (
            <>
              <div className="flex items-baseline justify-between">
                <div className="text-[11px] text-cream-dim">
                  {sku.kind === 'voucher' ? 'Coupon value' : 'Retail price'}
                </div>
                <div className="font-display text-[18px] font-extrabold">
                  {rupees(sku.mrp)}{sku.kind === 'voucher' ? ' off' : ''}
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-white/8 pt-2">
                <div className="text-[11px] text-cream-dim">You pay</div>
                <CoinAmount n={capCoins} size={14} className="text-[16px] text-gold" />
              </div>
              <div className="mt-1.5 text-[10px] text-cream-dim/70">
                {TIER_NOTE[sku.tier]}. No cash.
                {sku.minSpend && ` Minimum spend ${rupees(sku.minSpend)} at ${sku.brand}.`}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <div className="text-[11px] text-cream-dim">Retail price</div>
                <div className="font-display text-[18px] font-extrabold">{rupees(sku.mrp)}</div>
              </div>
              <CoinSlider value={applied} max={capCoins} mrp={sku.mrp} onChange={onSlide} />
              <div className="mt-3 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2
                text-[10px] leading-relaxed text-gold/90">
                Coins cover up to <span className="font-bold">
                {Math.round(p.capPct * 100)}%</span> of a Tier 3 reward — the rest is cash. Same
                for every player, every time.
              </div>
            </>
          )}
        </div>

        {/* TRUST */}
        <div className="mt-3 space-y-1.5 text-[10px] leading-relaxed text-cream-dim/75">
          <div>• Code lands in your Vault the moment you claim it.</div>
          <div>• Valid {sku.expiryDays} days.</div>
          <div className="text-gold/85">
            • If it expires unused, your coins come back. You can't get playing time back, so we
            don't keep it.
          </div>
        </div>
      </div>

      {/* ACTIONS — never a dead end */}
      <div className="space-y-2 px-4 pb-5 pt-1">
        {p.affordable ? (
          <>
            <Btn variant="gold" full onClick={() => s.startCheckout(sku.id)}>
              Claim now{cashDue > 0 ? ` · ${rupees(cashDue)} + coins` : ' · coins only'}
            </Btn>
            <Btn variant="ghost" full onClick={() => s.go('match')}>Back to match</Btn>
          </>
        ) : reserved ? (
          <>
            <Btn variant="gold" full onClick={() => s.go('match')}>
              Play to earn {p.short.toLocaleString('en-IN')} coins
            </Btn>
            <Btn variant="ghost" full onClick={() => s.abandonGoal(sku.id, 'user_removed')}>
              Remove goal
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="gold" full onClick={() => { s.createGoal(sku.id); s.go('goals') }}>
              Reserve this · lock the price 7 days
            </Btn>
            <Btn variant="ghost" full onClick={() => s.go('match')}>
              Play {p.matches} {p.matches === 1 ? 'match' : 'matches'} instead
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
