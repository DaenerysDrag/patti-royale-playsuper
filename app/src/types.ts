export type Archetype = 'grinder' | 'dipper' | 'whale'
export type Variant   = 'A' | 'B'
export type SkuTier   = 1 | 2 | 3
export type SkuKind   = 'voucher' | 'subscription'

export type Screen =
  | 'match' | 'reward' | 'lobby' | 'shelf' | 'product'
  | 'checkout' | 'confirm' | 'goals' | 'vault' | 'ledger'

export interface Sku {
  id: string
  brand: string
  title: string
  short: string
  kind: SkuKind
  /** Item tier drives the coin cap. A property of the item, never of the player. */
  tier: SkuTier
  /** ₹. For vouchers this is the discount face value. */
  mrp: number
  minSpend: number | null
  expiryDays: number
  art: { bg: string; fg: string; emoji: string }
}

export interface LedgerEntry {
  id: string
  ts: number
  dayIndex: number
  delta: number
  reason: 'match_win' | 'match_loss' | 'daily_streak' | 'redemption' | 'expiry_refund'
    | 'demo_credit'
  skuId?: string
  /** Cash leg, for redemption lines — so the ledger doubles as order history. */
  cashPaid?: number
}

export interface Goal {
  skuId: string
  createdAt: number
  dayCreated: number
  /** Coin cost frozen at reservation — a 7-day price lock. */
  coinCostLocked: number
  lockedUntilDay: number
}

export interface Voucher {
  code: string
  skuId: string
  issuedDay: number
  expiresDay: number
  coinsPaid: number
  cashPaid: number
  state: 'active' | 'expired_refunded'
}
