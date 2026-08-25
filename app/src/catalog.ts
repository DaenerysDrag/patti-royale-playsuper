import type { Sku } from './types'

/**
 * 12 SKUs. DIGITAL ONLY — vouchers and subscriptions. No physical goods, so no address form and
 * no profile step: a form mid-session is fatal on a phone, and a delivery promise is a trust
 * liability we haven't earned.
 *
 * Tier drives the coin cap (see constants.ts). Tier 3 is the only place a cash leg exists, and
 * therefore the only place the coin-cash slider appears — that is PlaySuper's actual model.
 *
 * Deliberately excluded: gift cards and any cash-equivalent SKU. A ₹500 card bought for ₹300 cash
 * plus coins is arbitrage with a computable margin, which is exactly what a coin farm optimises
 * against. A voucher with a minimum spend at one merchant has no resale value to a bot.
 */
export const CATALOG: Sku[] = [
  // ── Tier 1 · fully coin-funded, reachable fast ────────────────────────────────
  { id: 'zepto-10', brand: 'Zepto', title: '₹10 off', short: 'Groceries in 10 min',
    kind: 'voucher', tier: 1, mrp: 10, minSpend: 99, expiryDays: 14,
    art: { bg: '#3D1F63', fg: '#F5D90A', emoji: '🛒' } },
  { id: 'swiggy-40', brand: 'Swiggy', title: '₹40 off', short: 'Food delivery',
    kind: 'voucher', tier: 1, mrp: 40, minSpend: 149, expiryDays: 14,
    art: { bg: '#6B2D0E', fg: '#FC8019', emoji: '🍜' } },
  { id: 'zomato-50', brand: 'Zomato', title: '₹50 off', short: 'Food delivery',
    kind: 'voucher', tier: 1, mrp: 50, minSpend: 199, expiryDays: 14,
    art: { bg: '#5C1023', fg: '#E23744', emoji: '🍛' } },

  // ── Tier 2 · fully coin-funded, worth saving for ──────────────────────────────
  { id: 'starbucks-100', brand: 'Starbucks', title: '₹100 off', short: 'Coffee',
    kind: 'voucher', tier: 2, mrp: 100, minSpend: 299, expiryDays: 30,
    art: { bg: '#0B3A28', fg: '#00A862', emoji: '☕' } },
  { id: 'spotify-1m', brand: 'Spotify', title: 'Premium · 1 month', short: 'Ad-free music',
    kind: 'subscription', tier: 2, mrp: 139, minSpend: null, expiryDays: 30,
    art: { bg: '#0C2E1B', fg: '#1DB954', emoji: '🎧' } },
  { id: 'netflix-1m', brand: 'Netflix', title: 'Mobile · 1 month', short: 'One phone, HD',
    kind: 'subscription', tier: 2, mrp: 149, minSpend: null, expiryDays: 30,
    art: { bg: '#3A0B0B', fg: '#E50914', emoji: '🎬' } },
  { id: 'pharmeasy-200', brand: 'PharmEasy', title: '₹200 off', short: 'Medicines',
    kind: 'voucher', tier: 2, mrp: 200, minSpend: 799, expiryDays: 30,
    art: { bg: '#0A3350', fg: '#31C0BE', emoji: '💊' } },
  { id: 'decathlon-300', brand: 'Decathlon', title: '₹300 off', short: 'Sports gear',
    kind: 'voucher', tier: 2, mrp: 300, minSpend: 999, expiryDays: 30,
    art: { bg: '#0B2E5C', fg: '#3643BA', emoji: '🏸' } },

  // ── Tier 3 · 40% coin cap. The only place a cash leg exists. ──────────────────
  { id: 'spotify-3m', brand: 'Spotify', title: 'Premium · 3 months', short: 'Ad-free music',
    kind: 'subscription', tier: 3, mrp: 389, minSpend: null, expiryDays: 45,
    art: { bg: '#0C2E1B', fg: '#1DB954', emoji: '🎶' } },
  { id: 'netflix-3m', brand: 'Netflix', title: 'Mobile · 3 months', short: 'One phone, HD',
    kind: 'subscription', tier: 3, mrp: 447, minSpend: null, expiryDays: 45,
    art: { bg: '#3A0B0B', fg: '#E50914', emoji: '🍿' } },
  { id: 'yt-3m', brand: 'YouTube', title: 'Premium · 3 months', short: 'No ads, downloads',
    kind: 'subscription', tier: 3, mrp: 477, minSpend: null, expiryDays: 45,
    art: { bg: '#2B0B0B', fg: '#FF0033', emoji: '▶️' } },
  { id: 'hotstar-1y', brand: 'JioHotstar', title: 'Super · 1 year', short: 'Live cricket',
    kind: 'subscription', tier: 3, mrp: 1499, minSpend: null, expiryDays: 60,
    art: { bg: '#101A44', fg: '#1F80E0', emoji: '🏏' } },
]

export const skuById = (id: string) => CATALOG.find(s => s.id === id)!
