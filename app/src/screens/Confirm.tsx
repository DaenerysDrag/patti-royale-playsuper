import { motion } from 'framer-motion'
import { useStore } from '../store'
import { skuById } from '../catalog'
import { rupees } from '../constants'
import { Btn } from '../components/ui'

export default function Confirm() {
  const s = useStore()
  const v = s.vault[0]
  if (!v) return null
  const sku = skuById(v.skuId)

  return (
    <div className="flex h-full flex-col bg-felt-deep"
      style={{ backgroundImage: 'radial-gradient(110% 55% at 50% 0%, #14503D 0%, #0A3225 60%, #061F18 100%)' }}>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="grid h-16 w-16 place-items-center rounded-full bg-gold text-[30px] text-ink">✓</motion.div>

        <div className="mt-4 font-display text-[19px] font-extrabold">It's yours</div>
        <div className="mt-1 text-[11px] text-cream-dim">
          {sku.brand} {sku.title}
          {v.cashPaid > 0 && ` · ${rupees(v.cashPaid)} paid`}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 w-full rounded-2xl border border-dashed border-gold/45 bg-black/30 p-4">
          <div className="text-[9px] font-bold uppercase tracking-widest text-cream-dim/60">
            Your code
          </div>
          <div className="mt-1.5 font-mono text-[19px] font-bold tracking-wider text-gold">
            {v.code}
          </div>
          <div className="mt-2 text-[10px] text-cream-dim">
            Valid {sku.expiryDays} days
            {sku.minSpend ? ` · min spend ${rupees(sku.minSpend)}` : ''}
          </div>
        </motion.div>

        <div className="mt-3 text-[10px] leading-relaxed text-cream-dim/70">
          Saved to your Vault. Unused after {sku.expiryDays} days and the coins come back.
        </div>
      </div>

      <div className="space-y-2 px-5 pb-6">
        <Btn variant="gold" full onClick={() => s.go('match')}>Back to match</Btn>
        <Btn variant="ghost" full onClick={() => s.go('vault')}>Open Vault</Btn>
      </div>
    </div>
  )
}
