# Patti Royale — In-Game Commerce Store

PlaySuper Product Associate assignment. Brief: `../../PLAYSUPER_BUILD_PROMPT.md` (7 gated phases).

## Standing rules

1. **Re-read `docs/03-event-taxonomy.md` before adding any instrumentation.** Never invent an
   event name — `EventName` is a union type, so an invented name is a compile error. Keep it that way.
2. **The store canvas is a fixed 390×844 and never reflows.** To fit smaller viewports apply a CSS
   `transform: scale()` to the canvas wrapper. Never change its internal layout. One layout at
   every breakpoint.
3. **All drag interactions use pointer events** (`onPointerDown`/`onPointerMove`), never touch
   events, so the coin slider works with finger and mouse. Arrow keys too.
4. **Commit after each screen.**
5. **Economy numbers come from `docs/economy_model.xlsx`**, mirrored once in `src/economy.ts`.
   Nothing else hardcodes an economy number. If a number changes, it changes in both.
6. **Goals = reserved, not owned. Vault = owned vouchers. Never merge them.** A delivered voucher
   never lands in "order history" — order history is a receipt, the Vault is an asset, and players
   look for assets.
7. **`tier` is a function, never a column.** Reachability is computed from the *viewing* player's
   earn rate. The same SKU is "reach today" for a Grinder and "this month" for a Dipper.
8. **`wallet` must always equal `sum(ledger.delta)`.** Assert in dev. The ledger is a trust
   feature and a ledger that disagrees with the balance destroys it.
9. **No dead ends.** Every state offers a next action. "You can't afford this" without a path is
   the exact demotivating moment this product exists to remove.
10. **Never fabricate a number the system cannot observe.** `voucher_redeemed` is greyed out in the
    PM panel with a "not observable" note. One fake number discredits the whole panel.

## The three things that make this submission

1. **A losable match.** Win 50 / loss 15. If the match can't be lost, coins are *granted* not
   earned, and every time-to-afford claim ("2 more wins", "16 days") becomes decoration.
2. **Goals** — reserving inverts the funnel from `browse → buy` to `want → play → afford → buy`.
   The only part of the design that plausibly moves D7.
3. **The PM panel** — live funnel with the leak named and diagnosed, plus three-sided unit
   economics. Shows the analytics thinking rather than claiming it.

## Load-bearing facts

- Brands fund the discount as **CAC**, not the studio. ⇒ The binding constraint is brand CAC budget
  and coupon inventory, **not coin supply.** Coins can be generous; conversion must be rationed.
- Back-solving PlaySuper's published +5.2% ARPDAU gives an implied **0.119% of DAU redeeming daily**
  (≈1,189/day at 1M DAU, ≈₹5.35M/month of brand CAC). ⇒ Optimise for **retention breadth**, not
  conversion depth. This is why the instrumented leak is `sku_view → goal_created`.
- Earn rates: **Grinder 528 · Whale 235 · Dipper 61** coins/day. Peg **10 coins = ₹1**.

## Phase status

- [x] Phase 1 — docs (5 files + formula-driven xlsx + CSV) → **CHECKPOINT 1**
- [ ] Phase 2 — scaffold: state + event bus first, no UI
- [ ] Phase 3 — screens: match(losable) → reward → lobby → shelf → product → goals → checkout/vault
- [ ] Phase 4 — responsive shell + desktop chrome
- [ ] Phase 5 — PM panel
- [ ] Phase 6 — deploy
- [ ] Phase 7 — SUBMISSION.md + README + recording script → **CHECKPOINT 4**

## Owned by Karan — do not let the model pick these

peg · coin caps · tier thresholds · avg order value (₹700) · commission % (10) · studio share %
(50) · which funnel step is the leak · the IAP guardrail kill criterion · the day-one open
questions. If one of these produces an absurd downstream result, **stop and say so** — do not
quietly substitute a nicer number.
