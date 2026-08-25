# 05 — Integrity & Abuse

Cosmetic card backs were never worth farming. A ₹300 Decathlon voucher is. The moment coins buy
real-world value, this stops being a game economy and becomes a payments surface — and the threat
model changes completely.

An archetype defined as *"plays daily, never pays, high coin balance"* is, from a fraud
perspective, indistinguishable from a bot farm. That is the problem.

---

## Why this belongs in a product doc, not a security backlog

A farmed voucher spends a **brand's** CAC budget on a script. The brand sees zero incremental
customers, concludes gaming commerce doesn't work, and churns. The catalog shrinks. Every honest
player's shelf gets worse.

Fraud here does not leak money from the studio — it **degrades the product for everyone else**,
via the brand. That is why the countermeasures are merchandising decisions, and why they are
specified here rather than deferred.

---

## The one rule that shapes every countermeasure

> **Gate the payout. Never gate the earning.**

Earning coins is the fun. Adding friction to it — captchas, verification walls, throttles a human
can feel — taxes 99.9% of players to inconvenience 0.1%. Every control below sits at the
**redemption** boundary, where the player is already motivated and a moment of friction reads as
security rather than suspicion.

## Countermeasures

### 1. Coin farming

| Control | Value | Note |
|---|---|---|
| Daily earn ceiling | **900 coins/day** | ≈1.7× a Grinder's normal 528. Invisible to humans, hard ceiling on scripts |
| Diminishing returns | Full rate for 20 matches/day, then 50% | A human who plays 25 matches still earns; a farm running 400 gets nothing useful |
| Server-authoritative outcomes | Required | ⚠️ **The prototype cannot do this** — it is client-only with no backend. In production the match result and the coin credit must both come from the server, or the earn rate is whatever the attacker says it is. Flagged as the single largest gap between this prototype and a shippable build |

### 2. Multi-accounting and emulator farms

- **Play Integrity attestation before the first redemption.** Not before earning. A player who has
  never redeemed has cost nobody anything, so there is no reason to check them.
- **Velocity checks on new accounts** — first redemption gated behind an account age and a
  minimum lifetime match count, so a freshly minted account cannot immediately cash out.
- **Device-to-account fan-out limits** — one device redeeming across many accounts is the clearest
  farm signal available, and it costs nothing to compute.

### 3. Voucher abuse

- One-time-use codes, **bound to a player ID** at issue.
- **No stacking.** One voucher per brand order.
- Per-brand per-player caps on top of the global 2/week, so a single brand's inventory cannot be
  drained by a small number of heavy users.
- Coin refund on expiry (`02-economy.md`) is **refund-to-coins only, never to cash.** A
  cash-refund path would turn the store into a coin-to-cash exit and hand a farm a business model.

### 4. What the catalog deliberately excludes

**No cash-equivalent SKUs.** No Amazon Pay balance, no Google Play credit, no wallet top-ups.

A ₹500 gift card bought for ₹300 cash plus coins is arbitrage with a fixed, computable margin —
exactly the shape a farm optimises against. Vouchers with a **minimum spend at a specific
merchant** have no resale value to a bot, because a bot cannot use a Swiggy order. The merchandising
constraint *is* the fraud control, which is why it lives in the catalog spec and not in a rules
engine.

---

## Prototype scope — stated plainly

The prototype is client-only with `localStorage` state. **None of the above is enforced in it**,
and the submission will say so. What the prototype *does* carry is the earn ceiling and the
redemption cap as visible numbers in the PM panel's economy section, so the guardrails are legible
as design decisions even though they are not defended in code.

Claiming otherwise would be the kind of overstatement that makes an evaluator distrust the rest of
the model.
