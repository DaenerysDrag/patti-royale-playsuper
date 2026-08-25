import { useState } from 'react'
import { useStore } from '../store'
import { skuById } from '../catalog'
import { priceFor } from '../pricing'
import { PEG, rupees, GUARDRAIL } from '../constants'
import { Btn, CoinAmount, TopBar } from '../components/ui'

/**
 * CHECKOUT — two taps, no address form, no cart.
 *
 * Vouchers are coin-only and settle instantly. Products take a UPI leg. The whole screen is one
 * scroll-free view because every second here is a second not playing, which costs the studio the
 * session it was paid to protect.
 *
 * The coin-refund promise appears HERE, not buried in terms — it is a conversion lever precisely
 * because it removes the fear of wasting earned time.
 */
export default function Checkout() {
  const s = useStore()
  const { activeSkuId, wallet, archetype, redemptionsThisWeek } = s
  const sku = skuById(activeSkuId!)
  const p = priceFor(sku, wallet, archetype)
  const coinsApplied = Math.min(p.coinCost, wallet)
  const cashDue = Math.max(0, Math.round(sku.mrp - coinsApplied / PEG))
  const [paying, setPaying] = useState(false)

  const capped = redemptionsThisWeek >= GUARDRAIL.redemptionsPerWeek

  const pay = () => {
    setPaying(true)
    // Fake latency so the commit feels real rather than instant-and-suspicious.
    window.setTimeout(() => { s.purchase(sku.id, coinsApplied, cashDue); setPaying(false) }, 850)
  }

  return (
    <div className="flex h-full flex-col bg-felt-deep">
      <TopBar title="Confirm" onBack={() => s.viewSku(sku.id)} />

      <div className="flex-1 px-4">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl text-[21px]"
              style={{ background: sku.art.bg }}>{sku.art.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold uppercase tracking-wide"
                style={{ color: sku.art.fg }}>{sku.brand}</div>
              <div className="truncate font-display text-[15px] font-bold">{sku.title}</div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3 text-[12px]">
            <div className="flex justify-between text-cream-dim">
              <span>{sku.kind === 'voucher' ? 'Coupon value' : 'Retail price'}</span>
              <span className="text-cream">{rupees(sku.mrp)}</span>
            </div>
            <div className="flex justify-between text-cream-dim">
              <span>Coins applied</span>
              <span className="text-gold">− {rupees(Math.round(coinsApplied / PEG))}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-1.5 font-bold">
              <span>Pay by UPI</span>
              <span className="font-display text-[16px]">{rupees(cashDue)}</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-black/30 px-3 py-2">
            <span className="text-[10px] text-cream-dim">Coin balance after</span>
            <CoinAmount n={wallet - coinsApplied} size={11} className="text-[11px] text-gold" />
          </div>

          {cashDue > 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10
              bg-black/20 px-3 py-2.5">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-white/10
                text-[9px] font-bold">UPI</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-semibold">karan@okhdfc</div>
                <div className="text-[9px] text-cream-dim/70">No address needed</div>
              </div>
              <button className="tappable rounded-lg bg-white/10 px-2.5 py-1.5
                text-[10px] font-bold text-cream-dim">Change</button>
            </div>
          )}
        </div>

        <div className="mt-2.5 rounded-2xl border border-gold/20 bg-gold/8 p-3.5">
          <div className="text-[11px] font-bold text-gold">Coins back if it expires</div>
          <div className="mt-1 text-[10px] leading-relaxed text-gold/80">
            Don't use it in {sku.expiryDays} days and every coin returns to your balance. We can't
            give you playing time back, so we don't keep it.
          </div>
        </div>

        {capped && (
          <div className="mt-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3
            text-[10px] leading-relaxed text-[#FFB3A2]">
            You've claimed {GUARDRAIL.redemptionsPerWeek} rewards this week — the weekly cap. Brand
            coupon stock is limited, so this resets Monday. Your coins keep building.
          </div>
        )}
      </div>

      <div className="space-y-2 px-4 pb-5">
        <Btn variant="gold" full disabled={paying || capped} onClick={pay}>
          {paying ? 'Confirming…' : cashDue > 0 ? `Pay ${rupees(cashDue)} by UPI` : 'Claim with coins'}
        </Btn>
        <Btn variant="ghost" full onClick={() => s.go('match')}>Not now — back to match</Btn>
      </div>
    </div>
  )
}
