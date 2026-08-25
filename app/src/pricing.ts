import { PEG, TIER_CAP, EARN_RATE, MATCHES_PER_DAY } from './constants'
import type { Archetype, Sku } from './types'

/** Coin cap is read off the ITEM's tier. One flat rule, identical for every player. */
export const capFor = (sku: Sku) => TIER_CAP[sku.tier]

/** coins = MRP × cap × peg */
export const coinCostFor = (sku: Sku) => Math.round(sku.mrp * capFor(sku) * PEG)

/** cash = MRP − coins/peg. Zero for Tier 1 and 2. */
export const cashDueFor = (sku: Sku, coinsApplied?: number) => {
  const c = coinsApplied ?? coinCostFor(sku)
  return Math.max(0, Math.round(sku.mrp - c / PEG))
}

export const shortBy = (coinCost: number, wallet: number) => Math.max(0, coinCost - wallet)

export const daysToAfford = (short: number, a: Archetype) =>
  short <= 0 ? 0 : short / EARN_RATE[a]

/** Matches to close the gap, at this archetype's average match value. */
export const matchesToAfford = (short: number, a: Archetype) => {
  const perMatch = EARN_RATE[a] / MATCHES_PER_DAY[a]
  return short <= 0 ? 0 : Math.ceil(short / perMatch)
}

/**
 * One call site for everything the UI needs to price a SKU.
 *
 * Note what this does NOT do: it does not reorder or rank the catalog. The shelf order is fixed
 * and identical for everyone — grouped by item tier. What varies per player is only the EFFORT
 * COPY on each card ("3 more wins"), because effort is the honest price of a coin.
 */
export function priceFor(sku: Sku, wallet: number, archetype: Archetype) {
  const coinCost = coinCostFor(sku)
  const cash = cashDueFor(sku)
  const short = shortBy(coinCost, wallet)
  return {
    coinCost, cash, short,
    days: daysToAfford(short, archetype),
    matches: matchesToAfford(short, archetype),
    affordable: short === 0,
    capPct: capFor(sku),
  }
}
