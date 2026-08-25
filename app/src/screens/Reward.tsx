import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { CATALOG, skuById } from '../catalog'
import { priceFor } from '../pricing'
import { CoinAmount, Btn, Ring } from '../components/ui'
import { track } from '../events'

/**
 * THE POST-MATCH REWARD MOMENT — the most important screen in the build.
 *
 * This placement, not a nav tab, IS the product. The player has just felt something (won or lost)
 * and their balance just moved. That is the only moment in the session when commerce is welcome.
 *
 * Two rules:
 *  - Never scold a loss. A loss still pays, and still shows the path forward.
 *  - If the player holds no Goal, MANUFACTURE one. A player with no goal has no reason to return,
 *    and the store's job is to give them one — so we surface the nearest reachable reward.
 */
export default function Reward() {
  const s = useStore()
  const { lastMatch, lastEarned, wallet, goals, archetype, justCompletedGoal } = s

  const goal = goals[0]
  const goalSku = goal ? skuById(goal.skuId) : null
  const goalP = goalSku ? priceFor(goalSku, wallet, archetype) : null
  const pct = goal ? Math.min(1, wallet / goal.coinCostLocked) : 0

  // No Goal held: pick the cheapest thing still out of reach — close enough to want, far enough
  // to be worth playing for. That is the nudge that manufactures intent.
  const nudge = !goal
    ? CATALOG
        .map(sku => ({ sku, p: priceFor(sku, wallet, archetype) }))
        .filter(x => x.p.short > 0)
        .sort((a, b) => a.p.short - b.p.short)[0]
    : null

  useEffect(() => {
    track('store_tile_impression', {
      tile_copy: goal ? 'goal_progress' : 'nearest_reward',
      tile_context_sku: goal?.skuId ?? nudge?.sku.id ?? null,
    })
  }, [])

  const won = lastMatch === 'win'
  const complete = !!justCompletedGoal

  return (
    <div className="flex h-full flex-col bg-felt-deep"
      style={{ backgroundImage: 'radial-gradient(110% 55% at 50% 0%, #14503D 0%, #0A3225 60%, #061F18 100%)' }}>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`font-display text-[13px] font-extrabold uppercase tracking-[0.16em]
            ${won ? 'text-gold' : 'text-cream-dim'}`}>
          {won ? 'Match won' : 'Match lost'}
        </motion.div>

        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.08 }}
          className="coin-rise mt-3 flex items-baseline gap-2">
          <span className="font-display text-[54px] font-extrabold leading-none text-gold">
            +{lastEarned}
          </span>
          <span className="pb-1 text-[13px] font-bold text-gold-dim">coins</span>
        </motion.div>

        <div className="mt-1.5 text-[11px] text-cream-dim">
          Balance <CoinAmount n={wallet} size={12} className="text-cream" />
        </div>

        {/* Goal held — show progress, and complete it loudly */}
        {goal && goalSku && goalP && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-8 w-full rounded-2xl border p-4 text-left
              ${complete ? 'border-gold/50 bg-gold/10' : 'border-white/10 bg-black/25'}`}>
            <div className="flex items-center gap-3">
              <Ring pct={pct} size={46}>{Math.round(pct * 100)}%</Ring>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[14px] font-bold">
                  {goalSku.brand} {goalSku.title}
                </div>
                <div className="mt-0.5 text-[11px] text-cream-dim">
                  {complete
                    ? 'Ready to claim'
                    : goalP.matches <= 1
                      ? '1 more win'
                      : `${goalP.matches} more wins · ${goalP.days.toFixed(1)} days`}
                </div>
              </div>
            </div>
            {complete && (
              <Btn variant="gold" full className="mt-3"
                onClick={() => s.startCheckout(goal.skuId)}>
                Claim {goalSku.brand} {goalSku.title}
              </Btn>
            )}
          </motion.div>
        )}

        {/* No Goal — manufacture one */}
        {nudge && (
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => { useStore.setState({ entryPoint: 'reward_moment' }); s.viewSku(nudge.sku.id) }}
            className="tappable mt-8 w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-left">
            <div className="text-[9px] font-bold uppercase tracking-widest text-cream-dim/60">
              Closest reward
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl text-[19px]"
                style={{ background: nudge.sku.art.bg }}>{nudge.sku.art.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[14px] font-bold">
                  {nudge.sku.brand} {nudge.sku.title}
                </div>
                <div className="mt-0.5 text-[11px] text-gold">
                  {nudge.p.matches} more {nudge.p.matches === 1 ? 'win' : 'wins'} away
                </div>
              </div>
              <span className="text-cream-dim">›</span>
            </div>
          </motion.button>
        )}
      </div>

      <div className="flex gap-2.5 px-5 pb-6">
        <Btn variant="gold" full onClick={() => s.openStore('reward_moment')}>Rewards</Btn>
        <Btn variant="primary" full onClick={() => s.go('match')}>Next match</Btn>
      </div>
    </div>
  )
}
