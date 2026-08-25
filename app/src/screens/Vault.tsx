import { useStore } from '../store'
import { skuById } from '../catalog'
import { rupees } from '../constants'
import { Btn, CoinAmount, TopBar, Tag } from '../components/ui'

/**
 * VAULT — what you OWN. Distinct from Goals, which is what you have reserved.
 *
 * A delivered voucher must never land in "order history". Order history is a receipt; the Vault is
 * an asset. A player asking "where's my Swiggy code?" is looking for an asset, and Indian mobile
 * players start from the assumption that in-game rewards are a scam — so a copyable code with a
 * visible expiry does more for conversion than any amount of persuasion copy.
 */
export default function Vault() {
  const s = useStore()
  const active = s.vault.filter(v => v.state === 'active')
  const past = s.vault.filter(v => v.state !== 'active')

  return (
    <div className="flex h-full flex-col bg-felt-deep">
      <TopBar title="Vault" onBack={() => s.go('lobby')}
        right={<CoinAmount n={s.wallet} size={12} className="text-[12px] text-gold" />} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
        {s.vault.length === 0 && (
          <div className="mt-14 text-center">
            <div className="text-[34px]">🎟️</div>
            <div className="mt-2 font-display text-[15px] font-bold">Nothing here yet</div>
            <div className="mx-auto mt-1.5 max-w-[240px] text-[11px] leading-relaxed text-cream-dim">
              Rewards you claim land here with their codes.
            </div>
          </div>
        )}

        {active.map(v => {
          const sku = skuById(v.skuId)
          const daysLeft = v.expiresDay - s.dayIndex
          return (
            <div key={v.code} className="mb-2.5 rounded-2xl border border-white/10 bg-black/25 p-3.5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl text-[19px]"
                  style={{ background: sku.art.bg }}>{sku.art.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-bold uppercase tracking-wide"
                    style={{ color: sku.art.fg }}>{sku.brand}</div>
                  <div className="truncate font-display text-[13px] font-bold">{sku.title}</div>
                </div>
                <Tag tone={daysLeft <= 7 ? 'warn' : 'neutral'}>
                  {daysLeft > 0 ? `${daysLeft}d left` : 'expired'}
                </Tag>
              </div>

              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-dashed
                border-gold/40 bg-black/35 px-3 py-2.5">
                <div className="font-mono text-[14px] font-bold tracking-wider text-gold">{v.code}</div>
                <button
                  onClick={() => navigator.clipboard?.writeText(v.code).catch(() => {})}
                  className="tappable ml-auto rounded-lg bg-white/10 px-2.5 py-1.5
                    text-[10px] font-bold">Copy</button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-cream-dim">
                <span>
                  Paid <CoinAmount n={v.coinsPaid} size={9} />
                  {v.cashPaid > 0 && ` + ${rupees(v.cashPaid)}`}
                </span>
                {sku.minSpend && <span>Min spend {rupees(sku.minSpend)}</span>}
              </div>
            </div>
          )
        })}

        {past.length > 0 && (
          <>
            <div className="mb-2 mt-4 font-display text-[11px] font-extrabold uppercase
              tracking-widest text-cream-dim/60">Past</div>
            {past.map(v => {
              const sku = skuById(v.skuId)
              return (
                <div key={v.code} className="mb-2 flex items-center gap-2.5 rounded-xl
                  border border-white/8 bg-black/15 px-3 py-2.5">
                  <div className="text-[15px] opacity-50">{sku.art.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] text-cream-dim">
                      {sku.brand} {sku.title}
                    </div>
                    {v.state === 'expired_refunded' && (
                      <div className="text-[10px] text-gold/80">
                        Expired unused · {v.coinsPaid.toLocaleString('en-IN')} coins returned
                      </div>
                    )}
                  </div>
                  <Tag>{v.state === 'expired_refunded' ? 'refunded' : 'used'}</Tag>
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
