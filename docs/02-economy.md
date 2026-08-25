# 02 — The Economy

Half a page. The single source of truth in code is **`app/src/constants.ts`** — nothing else
holds an economy number.

---

## The peg and the faucet

**10 coins = ₹1 of value.** Earn: **win 50 · loss 15 · daily streak 40.**

A loss still pays. A loss that pays nothing turns a bad hand into a dead end, and dead ends are
what this product exists to remove.

Coins/day by archetype: **Grinder ~528 · Whale ~235 · Dipper ~61** (streak weighted by days
actually played — a Dipper doesn't earn a daily bonus daily).

> 🔴 **Why the faucet is 50/15/40 and not 180/60/150.** At 180/60/150 a player earns ~1,014
> coins/day, which makes a "this month" reward affordable in 5 days and a "this week" reward in
> 1.5. The labels would overstate effort by 4–6×, and time-to-afford *is* the merchandising. Cut
> the faucet 3.6×, keep the peg and the item prices. Signed off 2026-08-25.

## Coin cap — a property of the item, never of the player

| Item tier | Coin cap | Meaning |
|---|---|---|
| **Tier 1** | 100% | Coins cover it entirely. No cash. |
| **Tier 2** | 100% | Coins cover it entirely. No cash. |
| **Tier 3** | **40%** | Coins cover 40% of the price; the rest is cash. |

One flat rule, identical for everyone. No loyalty tiers, no engagement-based pricing — charging a
more-engaged player differently for the same item is manipulative, and it reads that way the moment
two players compare screenshots.

Tier 3 is where PlaySuper's actual model lives — *"coins cover the discount, the rest is cash"* —
and it is the only place the coin↔cash slider appears. Without a Tier 3, the coin-plus-cash
mechanic the assignment asks for would be a footnote.

## Catalog — digital only

12 SKUs, all vouchers and subscriptions. **No physical goods**, therefore no address form and no
profile step: an address form mid-session is fatal on a phone, and a delivery promise is a trust
liability we haven't earned.

**Also excluded: gift cards and any cash-equivalent SKU** (Amazon Pay, Google Play balance). A ₹500
card bought for ₹300 cash plus coins is arbitrage with a computable margin — exactly what a coin
farm optimises against. A voucher with a minimum spend at one merchant has no resale value to a bot,
so the merchandising constraint *is* the fraud control.

## Coin refund on unused expiry

If a voucher expires unredeemed, **the coins come back.** Cash never does.

E-commerce has returns; there is no e-commerce analogue for refunding someone's *time*, and coins
are time. Shown at checkout rather than buried in terms, because it is a conversion lever.

## Guardrails

| Guardrail | Value | Protects |
|---|---|---|
| Redemptions / player / week | **2** | Brand coupon inventory — the real budget control |
| Daily coin earn ceiling | **900** | Farming. ~1.7× a Grinder's normal day: binds bots, not humans |

## Who pays — the load-bearing assumption

The **brand** funds the discount as customer-acquisition cost. It is not a studio P&L cost.

> **⇒ The binding constraint is brand CAC budget and coupon inventory, not coin supply.**

Coins can be generous. What must be rationed is **conversion** — which is why there is a redemption
cap and no earn paywall.

### One derivation worth keeping

PlaySuper publishes **+5.2% ARPDAU**. At a ₹0.80 baseline that is ₹0.0416 per DAU per day. On a ₹700
average order at 10% commission with a 50% studio share, the studio makes ₹35 per redemption. So:

```
0.0416 / 35  =  0.119% of DAU need to redeem daily
             ≈  1,189 redemptions/day at 1M DAU
             ≈  ₹5.35M/month of brand-funded discount
```

**Only about 1 player in 840 per day.** That is a tiny conversion requirement, and it reframes the
product: optimise for **retention breadth** (many players holding a reserved goal) over
**conversion depth** (many checkouts). A held goal costs the brand nothing and returns a player
tomorrow; a checkout costs CAC and may not.

That is why the funnel step we instrument for is `sku_view → goal_created`, and not anything nearer
the payment.

*(₹700 AOV, 10% commission, 50% studio share are my assumptions — they set the whole result.)*
