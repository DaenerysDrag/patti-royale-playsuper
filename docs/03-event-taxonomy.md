# 03 — Event Taxonomy

**This document is the contract.** The app fires exactly these names. No call site invents one.

---

## Global properties — attached automatically by `track()`

`track(name, props)` merges these into every event, so no call site can forget them.

| Property | Type | Why it exists |
|---|---|---|
| **`coins_short_by`** | int | **The diagnostic.** On any SKU-scoped event: `max(0, coinCost − balance)`. `0` means the player could afford it and chose not to — an **interest** failure. `>0` means they couldn't — a **pricing or placement** failure. Nothing else in this taxonomy can separate those two, and they need opposite fixes |
| `sku_tier` | 1\|2\|3 | The item's tier, which fixes its coin cap. A property of the item, never of the player |
| `days_to_afford` | float | `(coinCost − balance) / archetypeEarnRate` |
| `entry_point` | enum | `reward_moment` / `lobby_tile` / `goal_nudge` / `direct` |
| `archetype` | enum | `grinder` / `dipper` / `whale` |
| `coin_balance` | int | Balance at fire time |
| `goal_active` | bool | Whether a Goal was held when this fired |
| `sessions_today`, `matches_today`, `day_index` | int | Session context |
| `variant` | enum | `A` price-first / `B` reachability-first |

## Events

### Discovery

| Event | Trigger | Extra properties | Surface | Funnel |
|---|---|---|---|---|
| `store_tile_impression` | Store tile rendered in the lobby meta layer | `tile_copy`, `tile_context_sku` | Lobby | **1** |
| `store_opened` | Store shelf mounts | `open_source` | Shelf | **2** |
| `sku_impression` | SKU card enters viewport | `sku_id`, `tier_shown`, `position` | Shelf | — |
| `sku_view` | SKU detail page opens | `sku_id`, `sku_kind`, `sku_tier`, `mrp`, `coin_cost` | Product | **3** |

### Intent

| Event | Trigger | Extra properties | Surface | Funnel |
|---|---|---|---|---|
| `coin_slider_moved` | Slider settles (Tier 3 only) | `coins_applied`, `cash_remaining`, `cap_pct`, `hit_cap` | Product | — |
| `goal_created` | Player reserves a SKU | `sku_id`, `price_locked_until`, `days_to_afford` | Product | **4** |
| `goal_progressed` | A match completes with a Goal held | `pct_complete`, `coins_gained`, `match_result` | Match | — |
| `goal_completed` | Balance first covers the Goal's coin cost | `days_taken`, `matches_taken` | Match / HUD | — |
| `goal_abandoned` | Player deletes a Goal, or the 7-day lock expires | `pct_complete_at_abandon`, `reason` | Goals | — |

`goal_progressed` and `goal_completed` fire **in the match**, not in the store. That is the
point of the mechanic: the retention loop is instrumented where it actually happens.

### Conversion

| Event | Trigger | Extra properties | Surface | Funnel |
|---|---|---|---|---|
| `checkout_started` | Checkout screen opens | `sku_id`, `coins_applied`, `cash_due` | Checkout | **5** |
| `coin_applied` | Coins committed and debited | `coins_applied`, `balance_after` | Checkout | — |
| `payment_success` | Cash leg completes (₹0 for vouchers) | `cash_paid`, `method` | Checkout | **6** |
| `voucher_delivered` | Code issued into the Vault | `sku_id`, `code_id`, `expires_at` | Confirmation | — |

### Post-purchase — the trust layer

| Event | Trigger | Extra properties |
|---|---|---|
| `vault_viewed` | Vault opens | `vouchers_held`, `expiring_within_7d` |
| `goals_viewed` | Goals list opens | `goals_held`, `max_pct_complete` |
| `ledger_viewed` | Coin ledger opens | `entries_shown` |
| `voucher_expired_coins_refunded` | Voucher expires unredeemed; coins returned | `sku_id`, `coins_refunded`, `days_held` |
| `voucher_redeemed` | ⚠️ **Not observable in this prototype.** Fires only from a brand-side webhook | `code_id`, `order_value`, `redeemed_at` |

---

## The funnel

```
1  store_tile_impression
2  store_opened
3  sku_view
4  goal_created          ← THE LEAK WE INSTRUMENT FOR
5  checkout_started
6  payment_success
```

### Why the leak is `sku_view → goal_created`

Two reasons, and the second is the one that matters.

**It is the widest gap.** A player who opens a SKU has shown intent. Creating a Goal costs them
nothing — no coins move, nothing is committed. If they still don't reserve, something in the
merchandising is wrong, and it is the last point where we can still fix it cheaply.

**It is the only expensive drop-off in the funnel.** `02-economy.md` derives that only **~0.12%
of DAU** need to redeem daily to hit the published ARPDAU lift. Steps 5 and 6 are therefore
*already* good enough almost by definition — optimising a checkout that only needs 1 in 840
players to complete is rearranging deck chairs. But every player who views a SKU and reserves
nothing is a player with **no reason to come back tomorrow**, and retention is the actual
product. Step 4 is where the value is.

The PM panel annotates exactly this step and renders the `coins_short_by` distribution beneath
it, so the panel answers *why* it leaks:

- **mass at 0** → interest failure. Wrong SKUs, wrong brands, wrong cohort match.
- **mass just above 0** → pricing failure. The tier boundary is misplaced; nudge the cap or
  restock the band.
- **mass far above 0** → placement failure. We are showing a Dipper the Grinder's shelf.

Those three diagnoses have three different owners, which is the whole reason the property exists.

---

## The measurement gap — stated honestly

`voucher_delivered` is the **last event this system can observe.** The brand's actual conversion
happens off-platform, days later, at Swiggy's checkout or Puma's till.

So: **`payment_success` is not brand revenue.** It is a delivered coupon. Every ROI figure quoted
to a brand on the strength of it is a proxy, and should be labelled as one on the dashboard.

**How to close it:** issue unique per-player coupon codes, and take a brand-side redemption
webhook reconciled against `voucher_delivered` on `code_id`. That fires `voucher_redeemed` and
turns the funnel from six steps into seven — at which point real CAC-per-acquired-customer
becomes computable and the brand conversation changes from attention to outcomes.

Until that integration exists, three numbers are unknowable and should never be asserted:
true redemption rate, true brand CAC per acquired customer, and incremental-vs-cannibalised
brand revenue. The prototype's PM panel marks `voucher_redeemed` as **greyed / not observable**
rather than faking a number, because a fake number here is the one thing that would discredit
everything else on the panel.
