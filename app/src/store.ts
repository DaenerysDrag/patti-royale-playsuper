import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EARN, EARN_RATE, GUARDRAIL } from './constants'
import { skuById } from './catalog'
import { coinCostFor, priceFor } from './pricing'
import { registerContext, track } from './events'
import type { Archetype, Goal, LedgerEntry, Screen, Variant, Voucher } from './types'

type EntryPoint = 'reward_moment' | 'lobby_tile' | 'goal_nudge' | 'direct'

interface State {
  archetype: Archetype
  variant: Variant

  wallet: number
  /** Coin earns, spends and past orders — ONE chronological list. No separate order history. */
  ledger: LedgerEntry[]
  goals: Goal[]
  vault: Voucher[]

  dayIndex: number
  matchesToday: number
  sessionsToday: number
  coinsEarnedToday: number
  winStreak: number
  streakClaimedDay: number
  lastMatch: 'win' | 'loss' | null
  lastEarned: number
  redemptionsThisWeek: number

  screen: Screen
  activeSkuId: string | null
  entryPoint: EntryPoint
  pmOpen: boolean
  justCompletedGoal: string | null
  /** First-run "How to play" card. Persisted, so it shows once and stays dismissed. */
  seenHowTo: boolean

  go: (s: Screen) => void
  dismissHowTo: () => void
  openStore: (from: EntryPoint) => void
  viewSku: (id: string) => void
  resolveMatch: (r: 'win' | 'loss') => void
  createGoal: (id: string) => void
  abandonGoal: (id: string, reason: string) => void
  startCheckout: (id: string) => void
  purchase: (id: string, coinsApplied: number, cashDue: number) => void
  simulateDays: (n: number) => void
  setVariant: (v: Variant) => void
  setArchetype: (a: Archetype) => void
  togglePm: () => void
  reset: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const initial = {
  archetype: 'dipper' as Archetype,
  variant: 'B' as Variant,
  wallet: 0,
  ledger: [] as LedgerEntry[],
  goals: [] as Goal[],
  vault: [] as Voucher[],
  dayIndex: 1,
  matchesToday: 0,
  sessionsToday: 1,
  coinsEarnedToday: 0,
  winStreak: 0,
  streakClaimedDay: 0,
  lastMatch: null as 'win' | 'loss' | null,
  lastEarned: 0,
  redemptionsThisWeek: 0,
  screen: 'match' as Screen,
  activeSkuId: null as string | null,
  entryPoint: 'direct' as EntryPoint,
  pmOpen: true,
  justCompletedGoal: null as string | null,
  seenHowTo: false,
}

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** The ONLY way the wallet moves. Keeps wallet === sum(ledger.delta) always true. */
      const credit = (
        delta: number, reason: LedgerEntry['reason'], skuId?: string, cashPaid?: number,
      ) => {
        const s = get()
        set({
          wallet: s.wallet + delta,
          ledger: [
            { id: uid(), ts: Date.now(), dayIndex: s.dayIndex, delta, reason, skuId, cashPaid },
            ...s.ledger,
          ].slice(0, 200),
        })
      }

      return {
        ...initial,

        go: (screen) => {
          set({ screen })
          const s = get()
          if (screen === 'vault') {
            track('vault_viewed', {
              vouchers_held: s.vault.filter(v => v.state === 'active').length,
              expiring_within_7d: s.vault.filter(
                v => v.state === 'active' && v.expiresDay - s.dayIndex <= 7).length,
            })
          }
          if (screen === 'goals') {
            const pcts = s.goals.map(g => Math.min(1, s.wallet / g.coinCostLocked))
            track('goals_viewed', {
              goals_held: s.goals.length,
              max_pct_complete: pcts.length ? Math.round(Math.max(...pcts) * 100) : 0,
            })
          }
          if (screen === 'ledger') track('ledger_viewed', { entries_shown: s.ledger.length })
        },

        openStore: (from) => {
          set({ entryPoint: from, screen: 'shelf' })
          track('store_opened', { open_source: from })
        },

        viewSku: (id) => {
          const s = get()
          const sku = skuById(id)
          const p = priceFor(sku, s.wallet, s.archetype)
          set({ activeSkuId: id, screen: 'product' })
          track('sku_view', {
            sku_id: id, sku_kind: sku.kind, sku_tier: sku.tier, mrp: sku.mrp,
            coin_cost: p.coinCost,
          })
        },

        resolveMatch: (result) => {
          const s = get()
          const base = result === 'win' ? EARN.win : EARN.loss
          const streakDue = s.streakClaimedDay !== s.dayIndex

          // Daily earn ceiling — a farming guardrail, invisible to a human.
          const headroom = Math.max(0, GUARDRAIL.dailyEarnCeiling - s.coinsEarnedToday)
          const basePaid = Math.min(base, headroom)
          const streakPaid = streakDue ? Math.min(EARN.streak, headroom - basePaid) : 0
          const earned = basePaid + streakPaid

          if (basePaid > 0) credit(basePaid, result === 'win' ? 'match_win' : 'match_loss')
          if (streakPaid > 0) credit(streakPaid, 'daily_streak')

          set({
            matchesToday: s.matchesToday + 1,
            coinsEarnedToday: s.coinsEarnedToday + earned,
            winStreak: result === 'win' ? s.winStreak + 1 : 0,
            streakClaimedDay: streakDue ? s.dayIndex : s.streakClaimedDay,
            lastMatch: result,
            lastEarned: earned,
            screen: 'reward',
          })

          // Goal progress fires IN THE MATCH, not in the store. That is the mechanic.
          const after = get()
          for (const g of after.goals) {
            const pct = Math.min(1, after.wallet / g.coinCostLocked)
            track('goal_progressed', {
              sku_id: g.skuId,
              pct_complete: Math.round(pct * 100),
              coins_gained: earned,
              match_result: result,
            })
            if (pct >= 1 && after.wallet - earned < g.coinCostLocked) {
              track('goal_completed', {
                sku_id: g.skuId,
                days_taken: after.dayIndex - g.dayCreated,
                matches_taken: after.matchesToday,
              })
              set({ justCompletedGoal: g.skuId })
            }
          }
        },

        createGoal: (id) => {
          const s = get()
          if (s.goals.some(g => g.skuId === id)) return
          const sku = skuById(id)
          const cost = coinCostFor(sku)
          const p = priceFor(sku, s.wallet, s.archetype)
          set({
            goals: [
              { skuId: id, createdAt: Date.now(), dayCreated: s.dayIndex,
                coinCostLocked: cost, lockedUntilDay: s.dayIndex + 7 },
              ...s.goals,
            ],
          })
          track('goal_created', {
            sku_id: id,
            price_locked_until: s.dayIndex + 7,
            days_to_afford: Number(p.days.toFixed(1)),
          })
        },

        abandonGoal: (id, reason) => {
          const s = get()
          const g = s.goals.find(x => x.skuId === id)
          if (!g) return
          track('goal_abandoned', {
            sku_id: id,
            pct_complete_at_abandon: Math.round(Math.min(1, s.wallet / g.coinCostLocked) * 100),
            reason,
          })
          set({ goals: s.goals.filter(x => x.skuId !== id) })
        },

        startCheckout: (id) => {
          const s = get()
          const p = priceFor(skuById(id), s.wallet, s.archetype)
          set({ activeSkuId: id, screen: 'checkout' })
          track('checkout_started', { sku_id: id, coins_applied: p.coinCost, cash_due: p.cash })
        },

        purchase: (id, coinsApplied, cashDue) => {
          const s = get()
          const sku = skuById(id)
          credit(-coinsApplied, 'redemption', id, cashDue)
          track('coin_applied', {
            coins_applied: coinsApplied, balance_after: s.wallet - coinsApplied,
          })
          track('payment_success', {
            cash_paid: cashDue, method: cashDue > 0 ? 'upi' : 'coins_only',
          })

          const code = `${sku.brand.slice(0, 4).toUpperCase()}-${uid().slice(0, 6).toUpperCase()}`
          const voucher: Voucher = {
            code, skuId: id, issuedDay: s.dayIndex,
            expiresDay: s.dayIndex + sku.expiryDays,
            coinsPaid: coinsApplied, cashPaid: cashDue, state: 'active',
          }
          set({
            vault: [voucher, ...get().vault],
            goals: s.goals.filter(g => g.skuId !== id),
            redemptionsThisWeek: s.redemptionsThisWeek + 1,
            screen: 'confirm',
            justCompletedGoal: null,
          })
          track('voucher_delivered', { sku_id: id, code_id: code, expires_at: voucher.expiresDay })
        },

        /** Desktop demo affordance. Without it nobody sees a goal fill, and goals ARE the product. */
        simulateDays: (n) => {
          const s = get()
          const perDay = Math.min(EARN_RATE[s.archetype], GUARDRAIL.dailyEarnCeiling)
          let day = s.dayIndex
          for (let i = 0; i < n; i++) { day++; credit(perDay, 'match_win') }
          set({ dayIndex: day, coinsEarnedToday: 0, matchesToday: 0, streakClaimedDay: day })

          const after = get()
          for (const g of after.goals) {
            const pct = Math.min(1, after.wallet / g.coinCostLocked)
            track('goal_progressed', {
              sku_id: g.skuId, pct_complete: Math.round(pct * 100),
              coins_gained: perDay * n, match_result: 'simulated',
            })
            if (pct >= 1) {
              track('goal_completed', {
                sku_id: g.skuId, days_taken: after.dayIndex - g.dayCreated, matches_taken: 0,
              })
              set({ justCompletedGoal: g.skuId })
            }
          }

          // Expire anything past its date and refund the coins. Cash is never refunded.
          for (const v of get().vault) {
            if (v.state === 'active' && get().dayIndex > v.expiresDay) {
              credit(v.coinsPaid, 'expiry_refund', v.skuId)
              track('voucher_expired_coins_refunded', {
                sku_id: v.skuId, coins_refunded: v.coinsPaid,
                days_held: get().dayIndex - v.issuedDay,
              })
              set({
                vault: get().vault.map(x =>
                  x.code === v.code ? { ...x, state: 'expired_refunded' as const } : x),
              })
            }
          }
        },

        dismissHowTo: () => set({ seenHowTo: true }),

        setVariant: (variant) => set({ variant }),
        setArchetype: (archetype) => set({ archetype }),
        togglePm: () => set({ pmOpen: !get().pmOpen }),
        reset: () => set({ ...initial }),
      }
    },
    { name: 'pr_state', version: 3 },
  ),
)

/** Global event properties. Registered here so events.ts never imports the store. */
registerContext(() => {
  const s = useStore.getState()
  const sku = s.activeSkuId ? skuById(s.activeSkuId) : null
  const p = sku ? priceFor(sku, s.wallet, s.archetype) : null
  return {
    coins_short_by: p ? p.short : 0,
    days_to_afford: p ? Number(p.days.toFixed(1)) : null,
    entry_point: s.entryPoint,
    archetype: s.archetype,
    coin_balance: s.wallet,
    goal_active: s.goals.length > 0,
    sessions_today: s.sessionsToday,
    matches_today: s.matchesToday,
    day_index: s.dayIndex,
    variant: s.variant,
  }
})

/** Dev-only invariant: the ledger is a trust feature, so it must never disagree with the balance. */
if (import.meta.env.DEV) {
  useStore.subscribe((s) => {
    const sum = s.ledger.reduce((n, e) => n + e.delta, 0)
    if (sum !== s.wallet) console.error(`[invariant] wallet ${s.wallet} != ledger sum ${sum}`)
  })
}
