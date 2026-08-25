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
5. **Economy numbers live in `app/src/constants.ts` only** — mirrored in prose in
   `docs/02-economy.md`. There is no xlsx model. Nothing else hardcodes an economy number.
6. **Goals = reserved, not owned. Vault = owned voucher codes. Ledger = the only history screen**
   (earns, spends and past claims in one chronological list). No separate order history.
7. **The coin cap is a property of the ITEM, never of the player.** Tier 1/2 = 100%, Tier 3 = 40%.
   No loyalty tiers, no dynamic pricing. The shelf order is fixed and identical for everyone —
   no personalised ranking. Only the effort copy ("3 more wins") varies per player.
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
3. **The PM panel** — three sections only (funnel with the leak named and diagnosed via
   `coins_short_by`, experiment card, live event stream). Shows the analytics thinking rather than
   claiming it. Deliberately not a dashboard.

## Load-bearing facts

- Brands fund the discount as **CAC**, not the studio. ⇒ The binding constraint is brand CAC budget
  and coupon inventory, **not coin supply.** Coins can be generous; conversion must be rationed.
- Back-solving PlaySuper's published +5.2% ARPDAU gives an implied **0.119% of DAU redeeming daily**
  (≈1,189/day at 1M DAU, ≈₹5.35M/month of brand CAC). ⇒ Optimise for **retention breadth**, not
  conversion depth. This is why the instrumented leak is `sku_view → goal_created`. The derivation
  lives in `docs/02-economy.md` and in the note — NOT as a panel section.
- Earn rates: **Grinder 528 · Whale 235 · Dipper 61** coins/day. Peg **10 coins = ₹1**.

## Phase status

- [x] Phase 1 — docs (5 markdown files; no xlsx) → CHECKPOINT 1 signed off
- [x] Phase 2 — scaffold: constants, types, catalog, pricing, event bus, store
- [x] Phase 3 — all 10 screens; match is losable (3 tricks, 3 cards, allocation is the skill)
- [x] Phase 4 — responsive shell, scale() canvas, annotation rail, Simulate 5 days, Reset
- [x] Phase 5 — PM panel, three sections
- [ ] Phase 6 — deploy (needs Karan's Vercel browser auth)
- [ ] Phase 7 — SUBMISSION.md + README + recording script → **CHECKPOINT 4**
- [ ] Browser QA pass — nobody has clicked the UI yet

## Owned by Karan — do not let the model pick these

peg · coin caps · tier thresholds · avg order value (₹700) · commission % (10) · studio share %
(50) · which funnel step is the leak · the IAP guardrail kill criterion · the day-one open
questions. If one of these produces an absurd downstream result, **stop and say so** — do not
quietly substitute a nicer number.
