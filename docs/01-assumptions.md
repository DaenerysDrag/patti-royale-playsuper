# 01 — Assumptions

Everything downstream is traceable to this page. Where a number is a **proposal awaiting
sign-off**, it is marked 🟡. Where it came from the brief, it is unmarked.

---

## The game

**Patti Royale** — casual trick-taking card game.

| | |
|---|---|
| DAU | 1,000,000 |
| Market | India, Android-first |
| Sessions/day | 1.8 |
| Matches/session | 4 |
| Match length | ~3 min |
| **Baseline ARPDAU** | **₹0.80** |
| Existing monetisation | IAP (gem packs) + rewarded ads |
| Existing coin sink | Cosmetic card backs only |

## The three archetypes

| | Grinder | Dipper | Whale |
|---|---|---|---|
| Behaviour | Plays daily, never pays | 2–3 sessions/week, churn-risk | Already buys IAP |
| Coin balance | High | Low | Low |
| Cash willingness | Low | Low | High |
| Matches/day 🟡 | 15 | ~1.4 (10/week) | 6 |
| **Coins/day** 🟡 | **~528** | **~61** | **~235** |
| What the store must do for them | Give the coin pile a purpose | Give a reachable win before they churn | Convert cash willingness without touching gems |
| Share of DAU 🟡 | 25% | 60% | 15% |

Coins/day derives from the earn rates in `02-economy.md` at an assumed **50% win rate** 🟡.

## Non-goals — stated explicitly

1. **The store does not touch the cosmetic card-back sink.** Card backs stay coin-only at their
   existing prices. Two sinks can coexist; competing sinks is a separate economy problem and not
   this one.
2. **The store does not touch IAP pricing.** No discounted gem packs, no coin-for-gem exchange,
   no coins buying anything with in-game utility. The moment coins buy power, this stops being a
   commerce product and becomes a monetisation nerf.

## Who pays — the load-bearing assumption

The **brand** funds the discount out of marketing budget, as customer-acquisition cost. It is
not a studio P&L cost.

> **⇒ The binding constraint is brand CAC budget and coupon inventory, not coin supply.**

Coins can be generous. What must be rationed is **conversion**. Every cap in this design exists
because coupon inventory is finite — not because coins are expensive. See the UnitEconomics
derivation in `02-economy.md`.

## Player-side assumptions

| | |
|---|---|
| Purchase intent on entry | **Zero.** The player came to play |
| Attention window inside the store | ~40 seconds, between matches |
| Trust prior | **Negative.** Indian mobile players are conditioned to treat in-game "free rewards" as scams. Trust must be earned with visible ledgers and copyable codes, not persuasion copy |
| Device | Mid-range Android, ~390pt logical width |
| Payment | UPI. No card-on-file, no stored payment assumption |

## Scope cuts (2026-08-25) — decided, not deferred

No xlsx model · no loyalty tiers (coin cap is a property of the item) · digital-only catalog, so
no address form or profile step · one ledger screen carrying earns, spends and past claims · PM
panel is three sections · no PRD, no gifting, no personalised ranking.

## Commercial assumptions 🟡 — these three set the whole model

| Input | Proposed | Why |
|---|---|---|
| Average order value at redemption | **₹700** | Blended across a ₹149 Swiggy coupon and a ₹1,299 boAt purchase |
| PlaySuper commission on order | **10%** | Affiliate-commission range for Indian D2C/food-delivery |
| Studio share of commission | **50%** | Their site says studios "earn a share"; 50/50 is the neutral assumption |

**These three are yours to confirm.** They determine the implied redemption rate, and therefore
the entire catalog. If commission is 5% rather than 10%, the required redemption rate doubles and
the catalog has to get cheaper.

## What I could not verify

`docs.playsuper.club` is blocked by corporate network filtering on this machine, so SDK method
names and the real event vocabulary are not reflected here. Everything about PlaySuper's model in
these docs comes from playsuper.ai, their for-brands page, and published press. Flagged so it is
not mistaken for verified fact.
