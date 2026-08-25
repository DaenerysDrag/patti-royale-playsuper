import { useStore } from '../store'
import { skuById } from '../catalog'
import { rupees } from '../constants'
import { Btn, CoinAmount, TopBar } from '../components/ui'

const LABEL: Record<string, string> = {
  match_win: 'Match won',
  match_loss: 'Match played',
  daily_streak: 'Daily streak',
  redemption: 'Reward claimed',
  expiry_refund: 'Expired — coins returned',
  demo_credit: 'Starter balance',
}

/**
 * LEDGER — a trust feature, and the ONLY history screen.
 *
 * Coin earns, coin spends and past orders in one chronological list. There is no separate order
 * history: a player does not think in "orders", they think "what happened to my coins". Splitting
 * that into two screens serves the database, not the person.
 *
 * The invariant `wallet === sum(ledger.delta)` is asserted in dev, because a ledger that disagrees
 * with the balance destroys exactly the trust it exists to build.
 */
export default function Ledger() {
  const s = useStore()
  return (
    <div className="flex h-full flex-col bg-felt-deep">
      <TopBar title="Coin history" onBack={() => s.go('lobby')}
        right={<CoinAmount n={s.wallet} size={12} className="text-[12px] text-gold" />} />

      <div className="px-4 pb-2 text-[10px] text-cream-dim/70">
        Coins in, coins out, and everything you've claimed — one list, newest first.
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
        {s.ledger.length === 0 && (
          <div className="mt-14 text-center text-[12px] text-cream-dim">
            Play a hand and it shows up here.
          </div>
        )}
        {s.ledger.map(e => (
          <div key={e.id} className="flex items-center gap-2.5 border-b border-white/6 py-2.5">
            <div className={`grid h-7 w-7 place-items-center rounded-full text-[12px]
              ${e.delta > 0 ? 'bg-gold/15 text-gold' : 'bg-white/8 text-cream-dim'}`}>
              {e.delta > 0 ? '+' : '−'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold">
                {LABEL[e.reason] ?? e.reason}
                {e.skuId && <span className="text-cream-dim"> · {skuById(e.skuId).brand}</span>}
              </div>
              <div className="text-[10px] text-cream-dim/70">
                Day {e.dayIndex}
                {e.reason === 'redemption' && e.cashPaid !== undefined && e.cashPaid > 0
                  && ` · ${rupees(e.cashPaid)} paid by UPI`}
                {e.reason === 'redemption' && e.cashPaid === 0 && ' · coins only'}
              </div>
            </div>
            <div className={`font-display text-[14px] font-extrabold tabular-nums
              ${e.delta > 0 ? 'text-gold' : 'text-cream-dim'}`}>
              {e.delta > 0 ? '+' : ''}{e.delta.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-5">
        <div className="mb-2.5 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5
          text-[10px] leading-relaxed text-cream-dim/75">
          Every credit and debit is listed. Coins have no cash value outside the store.
        </div>
        <Btn variant="primary" full onClick={() => s.go('match')}>Back to match</Btn>
      </div>
    </div>
  )
}
