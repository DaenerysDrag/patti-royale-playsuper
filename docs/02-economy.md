# 02 — The Economy

🟡 = proposal awaiting your sign-off. 🔴 = I think your number breaks and here is why.

---

## 🔴 FLAG 1 — the earn rate and the tier labels contradict each other

You specified **180 coins/win, 60/loss, 150 daily streak**, and a peg of **10 coins = ₹1**.

At the game's own stated cadence (1.8 sessions × 4 matches = 7.2 matches/day, 50% win rate):

```
7.2 matches × 120 avg coins  +  150 streak  =  ~1,014 coins/day  =  ₹101/day of discount value
```

Against your three tiers, that gives:

| Your tier | Coin cost | Actual time to afford |
|---|---|---|
| "Reach today" | 500 | **12 hours** ✅ |
| "**This week**" | 1,500 | **1.5 days** ❌ |
| "**This month**" | 5,200 | **5 days** ❌ |

The labels overstate the effort by 4–6×. A player who reads "this month" and gets there in five
days learns the labels are lying, and the whole time-to-afford merchandising frame — which is the
product — loses its credibility on day one.

Worse: ₹101/day of discount capacity per daily player is ~₹3,000/month. At 1M DAU that is a
brand CAC budget no company on earth would sign.

**Proposed fix 🟡 — cut earn ~3.6×, keep the peg and the tiers exactly as they are:**

| | Yours | Proposed |
|---|---|---|
| Win | 180 | **50** |
| Loss | 60 | **15** |
| Daily streak | 150 | **40** |

The peg stays 10 coins = ₹1. The tier coin-costs stay. Only the faucet narrows. Resulting
coins/day: **Grinder ~528 · Whale ~235 · Dipper ~61.**

*Alternative if you'd rather keep the big satisfying numbers:* keep 180/60/150 and move the peg
to **36 coins = ₹1**. Identical economics, better game feel, uglier arithmetic on screen. Your
call — this is a "things I own" decision.

---

## 🔴 FLAG 2 — reachability tiers cannot be static, and this is the interesting finding

Run the reachability test from the brief — *every archetype needs something inside 48 hours and
something aspirational at ~3 weeks* — against the proposed earn rates:

| Archetype | Coins/day | 48h budget | 3-week budget |
|---|---|---|---|
| Grinder | 528 | 1,056 | 11,088 |
| Whale | 235 | 470 | 4,935 |
| Dipper | 61 | 122 | 1,281 |

A Grinder's 48-hour reach (1,060 coins) is **nine times** a Dipper's (122). No fixed set of
three price bands can be "reach today / this week / this month" for all three at once.

> **⇒ The tier a SKU sits in must be computed from the viewing player's earn rate, not stored on
> the SKU.** The same ₹100 Starbucks voucher is *"reach today"* for a Grinder and
> *"this month"* for a Dipper. Both statements are true and both are useful.

This is what cohort-affinity merchandising actually means once you do the arithmetic, and it
falls out of the numbers rather than being asserted. **`tier` is a function, never a column.**

It also means the shelf is genuinely personalised without any ML: `daysToAfford = (cost −
balance) / archetypeEarnRate` is the whole recommender.

---

## The peg

**10 coins = ₹1 of discount value.** One cell, referenced everywhere. Never restate it.

## Earn

| Event | Coins 🟡 |
|---|---|
| Match win | 50 |
| Match loss | 15 |
| Daily streak | 40 |

A loss still pays. A loss that pays nothing turns a bad match into a dead end, and dead ends are
the thing this product exists to remove.

## The two SKU types — and where the coin/cash mix actually lives

The assignment asks for a store where players spend **coins *and* real money**. That mix only
exists where the coin cap bites, so the catalog needs both types:

| Type | Coin cap | Cash at checkout | Purpose |
|---|---|---|---|
| **Voucher** (coupon codes) | 100% | ₹0 | The habit layer. Fully coin-funded, instant, no friction. Builds the redemption habit and the trust that codes actually work |
| **Product** (subscriptions, physical) | 20–40% by tier | Yes | Where coins *discount* real money. This is PlaySuper's actual model — "coins cover the discount, the rest is cash" — and where the slider lives |

If the catalog were all vouchers, the coin-cash slider — the mechanic the assignment explicitly
asks for — would be a footnote. Six vouchers and six products keeps both real.

## Coin cap by loyalty tier

Bronze **20%** → Silver **30%** → Gold **40%**.

Framed in the UI as a benefit unlocked ("Gold: coins now cover 40%"), never as a paywall
("Bronze players limited to 20%"). Same number, opposite feeling.

**Explicitly rejected: engagement-based dynamic pricing.** Charging a more-engaged player more
coins for the same SKU is manipulative, it reads as manipulative the moment anyone compares
notes, and one screenshot on Reddit costs more trust than the margin is worth. Loyalty tiers move
the cap in the player's *favour* only.

## Catalog — 12 SKUs

Coin cost = `MRP × coinCap × peg`. Cash = `MRP − (coins / peg)`.

| # | SKU | Type | MRP | Cap | Coins | Cash |
|---|---|---|---|---|---|---|
| 1 | Zepto ₹10 off ₹99 | voucher | ₹10 | 100% | 100 | ₹0 |
| 2 | Swiggy ₹40 off ₹149 | voucher | ₹40 | 100% | 400 | ₹0 |
| 3 | Zomato ₹50 off ₹199 | voucher | ₹50 | 100% | 500 | ₹0 |
| 4 | Starbucks ₹100 off ₹299 | voucher | ₹100 | 100% | 1,000 | ₹0 |
| 5 | PharmEasy ₹200 off ₹799 | voucher | ₹200 | 100% | 2,000 | ₹0 |
| 6 | Decathlon ₹300 off ₹999 | voucher | ₹300 | 100% | 3,000 | ₹0 |
| 7 | Spotify Premium 1mo | product·digital | ₹139 | 40% | 556 | ₹83 |
| 8 | Netflix Mobile 1mo | product·digital | ₹149 | 40% | 596 | ₹89 |
| 9 | JioHotstar Super 1yr | product·digital | ₹1,499 | 40% | 5,996 | ₹899 |
| 10 | boAt Airdopes 141 | product·**physical** | ₹1,299 | 40% | 5,196 | ₹779 |
| 11 | Puma Softride sliders | product·**physical** | ₹1,499 | 40% | 5,996 | ₹899 |
| 12 | Sony WH-CH520 | product·**physical** | ₹2,999 | 40% | 11,996 | ₹1,799 |

### Reachability test — all six cells pass

Pass condition: something reachable in **≤2 days**, something aspirational at **14–28 days**.

| | Cheapest in reach | Days | Aspiration | Days | |
|---|---|---|---|---|---|
| **Grinder** (528/day) | #4 Starbucks ₹100 | 1.9 | #12 Sony WH-CH520 | 22.7 | ✅ |
| **Whale** (235/day) | #2 Swiggy ₹40 | 1.7 | #10 boAt Airdopes | 22.1 | ✅ |
| **Dipper** (61/day) | #1 Zepto ₹10 | 1.6 | #4 Starbucks ₹100 | 16.5 | ✅ |

The test is on **days-to-afford**, not on a coin budget — because days is what the player
experiences and what the shelf labels promise. The `Catalog` tab computes this live, so changing
the peg or an earn rate re-runs the test.

🔴 **FLAG 3 — deviation from your non-goals.** You specified *2* physical SKUs. There are **3**.
Reason: nothing digital is expensive enough to be a 3-week aspiration for a Grinder (11,088
coins), and an archetype with no aspiration hoards coins forever and never sinks. #12 Sony exists
solely to give the Grinder a ceiling. Cut it and the Grinder's economy has no top. Your call.

**Also deliberately excluded: gift cards and any cash-equivalent SKU** (Amazon Pay, Google Play
balance). A ₹500 card bought for ₹300 cash + coins is arbitrage, and arbitrage is what coin farms
are built to exploit. See `05-integrity-and-abuse.md`.

## Coin refund on unused expiry

If a voucher expires unredeemed, **coins return to the wallet in full.** Cash is not refunded.

E-commerce has returns. There is no e-commerce analogue for refunding someone's *time* — and
coins are time. This is the cheapest trust mechanic in the build and it is a direct answer to the
assignment's core question, because no traditional store can offer it.

Shown **at checkout**, not buried in terms. It is a conversion lever precisely because it removes
the fear of wasting earned time.

*Float impact:* assume 15% voucher non-redemption 🟡 → ~15% of sunk coins return. Guardrails tab
models it.

## Guardrails

| Guardrail | Value 🟡 | Protects |
|---|---|---|
| Redemptions per player per week | **2** | Brand CAC budget and coupon inventory. This is the real budget control |
| Daily coin earn ceiling | **900** | Farming (≈1.7× a Grinder's normal day — binds bots, not humans) |
| Coin float ratio | monitored | Minted ÷ sunk. A ratio that only climbs means the catalog has no top |
| Whale IAP ARPDAU | **kill at −2%** | The thing this store was sold to protect |

The redemption cap binds the Grinder (who could afford ~7 vouchers/week) and never touches the
Dipper (who can afford ~1 every 2 weeks). That is the correct shape: **cap the players who
threaten the budget, not the players you are trying to retain.**

---

## UnitEconomics — back-solving the economy from PlaySuper's own published number

Do not guess a redemption rate. PlaySuper publishes **+5.2% ARPDAU**, so derive it:

```
baseline ARPDAU                              ₹0.80
target lift (published)                      +5.2%
incremental revenue per DAU per day          ₹0.0416
average order value at redemption 🟡         ₹700
PlaySuper commission @ 10% 🟡                ₹70
studio share @ 50% 🟡                        ₹35   ← studio revenue per redemption
──────────────────────────────────────────────────
implied daily redemption rate   0.0416 / 35  = 0.119% of DAU
at 1M DAU                                    ≈ 1,190 redemptions/day
                                             ≈ 35,700 /month
brand-funded discount @ ₹150 avg             ≈ ₹5.35M/month of CAC budget
```

### Two conclusions, and they reframe the whole product

**1. Only ~0.12% of DAU need to redeem daily to hit the published ARPDAU lift.**

That is a *tiny* conversion requirement — roughly 1 player in 840 per day. Which means the store
should be optimised for **retention breadth**, not **conversion depth**: many players holding a
reserved Goal beats many players checking out. A held Goal costs the brand nothing and returns a
player tomorrow; a checkout costs CAC and may not.

This inverts the instinct to optimise checkout conversion, and it is why the funnel leak we
instrument for is `sku_view → goal_created` rather than anything nearer the payment.

**2. The ₹5.35M/month figure is the real ceiling — and it is what the redemption cap protects.**

Not studio cost. Brand CAC budget. If brands fund ₹3M/month instead of ₹5.35M, the redemption
cap tightens or the average discount drops; the coin faucet does not move at all. Faucet and
budget are independent levers, which is the single most useful thing to understand about this
economy.

### Sanity check on the cap

35,700 redemptions/month ÷ 1M DAU ≈ **3.6% of DAU redeem in a month**. A 2/week cap allows 8/month
— so the cap is ~2× headroom above the *modal* player and only binds the top few percent. Correct
calibration: invisible to almost everyone, hard ceiling on farms.

---

## Per-archetype mint vs sink 🟡

| | Earn/week | Max sink/week (2 redemptions) | Verdict |
|---|---|---|---|
| Grinder | 3,710 | ~6,000 (2 × #4/#5) | Balanced — can sink faster than they mint if they want to |
| Whale | 1,645 | ~1,000 | Mints slightly faster; the coin/cash slider is their real sink |
| Dipper | 427 | ~500 | Balanced at the bottom of the catalog |

No archetype mints faster than it can possibly sink. That was the failure mode to check for, and
the reason #12 Sony exists.
