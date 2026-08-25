/**
 * SINGLE SOURCE OF TRUTH for every economy number. Mirrors docs/02-economy.md.
 * Nothing else in the app hardcodes an economy value.
 */

/** Coins per ₹1 of value. The peg. */
export const PEG = 10

/** Signed off 2026-08-25: cut the faucet 3.6x so the effort labels stay honest. */
export const EARN = { win: 50, loss: 15, streak: 40 } as const

/** Coins/day per archetype. Streak weighted by days-played/week (a Dipper isn't daily). */
export const EARN_RATE = { grinder: 528, dipper: 61, whale: 235 } as const

/** Average matches/day per archetype — used to convert a coin gap into "N more wins". */
export const MATCHES_PER_DAY = { grinder: 15, dipper: 1.43, whale: 6 } as const

/**
 * Coin cap is a property of the ITEM, never of the player. One flat rule for everyone.
 * Tier 3 is where "coins cover the discount, the rest is cash" actually happens.
 */
export const TIER_CAP = { 1: 1.0, 2: 1.0, 3: 0.4 } as const

export const TIER_LABEL = {
  1: 'Small wins',
  2: 'Save a few days',
  3: 'Coins + cash',
} as const

export const TIER_NOTE = {
  1: 'Fully covered by coins',
  2: 'Fully covered by coins',
  3: 'Coins cover 40% — the rest is cash',
} as const

/**
 * Starting balance for the demo. Not an economy rule — an evaluator affordance, so the whole
 * loop (including a Tier 1/2 claim) is testable the moment the page opens without grinding
 * matches first. A real integration starts every player at zero.
 */
export const DEMO_START_COINS = 1000

export const GUARDRAIL = {
  dailyEarnCeiling: 900,   // ~1.7x a Grinder's normal day: binds bots, not humans
  redemptionsPerWeek: 2,   // protects brand coupon inventory — the real budget control
} as const

/** My assumptions. They set the derivation in docs/02-economy.md. */
export const UNIT_ECON = {
  dau: 1_000_000,
  baselineArpdau: 0.80,
  targetLift: 0.052,
  aov: 700,
  commissionPct: 0.10,
  studioSharePct: 0.50,
} as const

export const rupees = (n: number, dp = 0) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp })
export const coins = (n: number) => Math.round(n).toLocaleString('en-IN')
