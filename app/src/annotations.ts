import type { Screen } from './types'

/**
 * The annotation rail. Desktop has dead space beside a 390px phone, and an evaluator opening this
 * cold has about three minutes — so the reasoning goes NEXT TO the thing it explains rather than
 * only in the note.
 */
export const ANNOTATIONS: Partial<Record<Screen, { t: string; d: string }[]>> = {
  match: [
    { t: 'The match is losable',
      d: 'Win 50, lose 15. Three cards for three tricks, so the skill is allocation — burn your high spade now or save it? If you could not lose, coins would be granted rather than earned and every "3 more wins" on the shelf would be decoration.' },
    { t: 'The goal ring is in the HUD',
      d: 'A reserved reward lives in the game, not in the store. That is what makes it a retention loop instead of a wishlist.' },
    { t: 'Hesitation costs you',
      d: 'Six seconds a trick. Time out and it plays your leftmost card — usually the wrong one.' },
  ],
  reward: [
    { t: 'This is the product',
      d: 'The post-match moment, not a nav tab. It is the only point in a session where the player has just felt something and their balance just moved — so it is the only point where commerce is welcome.' },
    { t: 'A loss is never scolded',
      d: 'A loss still pays, and still shows the path. Dead ends are what this product exists to remove.' },
    { t: 'No goal? Manufacture one',
      d: 'A player holding no goal has no reason to return, so we surface the nearest reward instead of a catalog. Close enough to want, far enough to play for.' },
  ],
  lobby: [
    { t: 'You land here, and you get a choice',
      d: 'Play, or go straight to the rewards. But notice the merchandising: "Play now" is the hero and the store is one contextual tile. Not a 50/50 home screen with a "Collect Rewards" button — that would make the store a destination, which is the thing this design argues against.' },
    { t: 'One tile, never labelled "Store"',
      d: '"320 coins to your Zepto voucher" — the player has no shopping intent to appeal to, only a goal to be reminded of.' },
    { t: 'A guest in someone else\'s game',
      d: 'No new nav, no new tab bar. The store lives inside the meta layer the studio already ships.' },
  ],
  shelf: [
    { t: 'A shelf, not a search engine',
      d: 'No search, no filters, no categories. Twelve items in three fixed groups. The attention window is about forty seconds and choice paralysis is the enemy.' },
    { t: 'Same order for everyone',
      d: 'Grouped by item tier — a property of the item. No personalised ranking. The only thing that varies per player is the effort line on the card.' },
    { t: 'Effort is the real price',
      d: '"3 more wins" is the honest price of a coin. Rupees are what the brand gave up; hands played are what the player gave up.' },
    { t: 'Flip the A/B toggle',
      d: 'Variant A puts the rupee price first, B puts reachability first. That is the experiment, and it re-renders live.' },
  ],
  product: [
    { t: 'Coins cover the discount',
      d: 'Tier 1 and 2 are fully coin-funded. Tier 3 caps coins at 40% and the rest is cash — PlaySuper\'s actual model, and the only place the slider appears.' },
    { t: 'One flat rule',
      d: 'The cap is a property of the item, identical for every player. No loyalty tiers, no engagement pricing — charging an engaged player more for the same thing reads as manipulation the moment two players compare screenshots.' },
    { t: 'Coins back on expiry',
      d: 'E-commerce has returns. There is no e-commerce analogue for refunding someone\'s time — and coins are time. Shown at checkout, not buried in terms, because it is a conversion lever.' },
    { t: 'No dead end',
      d: 'Cannot afford it? The primary action becomes "reserve and play". That is the loop, not a consolation prize.' },
  ],
  goals: [
    { t: 'The cart, inverted',
      d: 'In e-commerce a cart is dead intent you email about. Here it is the reason to open the app tomorrow: want → play → afford → buy.' },
    { t: 'Price locked 7 days',
      d: 'Reserving freezes the coin cost. Playing toward a moving target is not a goal, it is a treadmill.' },
    { t: 'Try "Simulate 5 days"',
      d: 'Top bar. Without it nobody sees a goal fill in a three-minute demo — and the fill is the whole mechanic.' },
  ],
  checkout: [
    { t: 'Two taps, no cart',
      d: 'Single-item impulse only. Every second here is a second not playing, which costs the studio the session this plugin was sold to protect.' },
    { t: 'No address form',
      d: 'Digital only. A form mid-session is fatal on a phone, and a delivery promise is a trust liability we have not earned.' },
    { t: 'The weekly cap is honest',
      d: 'Two rewards a week, and it says why: brand coupon stock is finite. The constraint is brand CAC budget, not coin supply.' },
  ],
  confirm: [
    { t: 'The code, immediately',
      d: 'Indian mobile players start from the assumption that in-game rewards are a scam. A copyable code with a visible expiry does more for the next conversion than any persuasion copy.' },
  ],
  vault: [
    { t: 'Vault, not order history',
      d: 'A delivered voucher is an asset, not a receipt. A player asking "where is my Swiggy code?" is looking for an asset — so it gets its own home.' },
  ],
  ledger: [
    { t: 'One history, not two',
      d: 'Coin earns, spends and past claims in a single list. Players do not think in "orders", they think "what happened to my coins".' },
    { t: 'An asserted invariant',
      d: 'wallet always equals the sum of the ledger. A ledger that disagrees with the balance destroys the trust it exists to build.' },
  ],
}
