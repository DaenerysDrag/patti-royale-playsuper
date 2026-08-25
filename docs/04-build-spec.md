# 04 — Build Spec

Implementation contract for Phases 2–6. Read with `03-event-taxonomy.md` open.

---

## Stack

Vite · React 18 · TypeScript · Tailwind · framer-motion · zustand + `persist` to `localStorage`.
No backend. No router — a single `screen` value in state drives the view (the store is a modal
layer inside a game, not a website).

## Screen graph — 10 screens

```
match ──► reward_moment ──► lobby ──┬─► shelf ──► product ──┬─► checkout ──► confirmation
   ▲            │                   │                       └─► goal_created ─┐
   └────────────┴───────────────────┴───────────────────────────────────────────┘
                                    ├─► goals   (reserved, price-locked)
                                    ├─► vault   (owned voucher codes)
                                    └─► ledger  (earns + spends + past claims — ONE list)
```

Every leaf returns to `match`. The exit CTA is **"Resume match"**, never "Continue shopping".

## State shape

```ts
type Screen = 'match'|'reward'|'lobby'|'shelf'|'product'|'checkout'|'confirm'|'goals'|'vault'|'ledger'

interface Store {
  // identity
  archetype: 'grinder'|'dipper'|'whale'
  variant: 'A'|'B'

  // economy
  wallet: number
  ledger: LedgerEntry[]          // { id, ts, delta, reason, skuId? }

  // objects — Goals and Vault are DISTINCT. Never merge them.
  goals:  Goal[]                 // { skuId, createdAt, lockedUntilDay, coinCostLocked }
  vault:  Voucher[]              // { code, skuId, issuedDay, expiresDay, state }
  // No orders[] — a redemption is a ledger line with a cashPaid field. One history, not two.

  // session
  dayIndex: number
  matchesToday: number
  sessionsToday: number
  winStreak: number
  lastMatch: 'win'|'loss'|null
  redemptionsThisWeek: number

  // ui
  screen: Screen
  activeSkuId: string|null
  pmPanelOpen: boolean
}
```

`wallet` is **derived-checkable**: `sum(ledger.delta)` must always equal `wallet`. Assert it in dev;
a ledger that disagrees with the balance is the fastest way to lose a player's trust, and the
ledger is a trust feature.

## Catalog JSON schema

```ts
interface Sku {
  id: string
  brand: string
  title: string
  kind: 'voucher'|'subscription'      // digital only — no physical goods
  tier: 1|2|3                         // drives the coin cap. A property of the ITEM.
  mrp: number                         // ₹ — for vouchers, the discount face value
  minSpend: number|null               // vouchers only
  expiryDays: number
  art: { bg: string; fg: string; emoji: string }
}
```

**No personalised ranking.** The shelf order is fixed and identical for every player, grouped by
item tier. The only thing that varies per player is the effort copy on a card:

```ts
const coinCost = sku.mrp * TIER_CAP[sku.tier] * PEG   // same for everyone
const short    = Math.max(0, coinCost - wallet)
const matches  = Math.ceil(short / avgMatchValue(archetype))   // "3 more wins"
```

## Constants — single source of truth

`src/constants.ts` mirrors `docs/02-economy.md`. Nothing else hardcodes an economy number:

```ts
export const PEG = 10                    // coins per ₹1 of value
export const EARN = { win: 50, loss: 15, streak: 40 }
export const EARN_RATE = { grinder: 528, dipper: 61, whale: 235 }   // coins/day
export const TIER_CAP = { 1: 1.0, 2: 1.0, 3: 0.4 }                  // item, not player
export const GUARDRAIL = { dailyEarnCeiling: 900, redemptionsPerWeek: 2 }
export const UNIT_ECON = { baselineArpdau: 0.80, aov: 700, commissionPct: 0.10, studioSharePct: 0.50 }
```

## Event bus contract

```ts
track(name: EventName, props?: Record<string, unknown>): void
```

- `EventName` is a **union type generated from `03-event-taxonomy.md`.** An invented name is a
  compile error. This is how the taxonomy stays a contract rather than a suggestion.
- `track()` auto-merges every global property from §03 — including `coins_short_by`, computed from
  `activeSkuId` when one is set.
- Appends to an in-memory ring buffer (cap 500) and mirrors to `localStorage`.
- Exposes `useEventLog()` so the PM panel re-renders live.

## Responsive rules

The store canvas is **always 390×844 and never reflows.** Smaller viewports get
`transform: scale(k)` with `transform-origin: top center` on the canvas wrapper. One layout at
every breakpoint — this is what keeps desktop and mobile identical.

| Breakpoint | Shell |
|---|---|
| ≥1024px | Phone frame left-of-centre, PM panel docked right, annotation rail beside the phone. **The intended view.** |
| 768–1023px | Phone centred and scaled, PM panel as a right-edge drawer |
| <768px | Canvas scaled to fill viewport, frame chrome hidden, PM panel via a **visible toggle** in the top bar (`?pm=1` also works but is never the only way in) |

Hover/cursor styling scoped under `@media (hover: hover)` so mobile never gets stuck states.

## PM panel requirements

**Three sections. Not a dashboard** — no economy tiles, no coin-float charts, no IAP-guardrail
gauges. The panel shows the one question this product lives or dies on.

1. **Funnel** — the six steps with drop-off % per step; step 3→4 (`sku_view → goal_created`)
   annotated as the leak, with the `coins_short_by` histogram beneath it so the panel shows *why*
   it leaks. `voucher_redeemed` noted as **not observable** — never a fabricated number.
2. **Experiment card** — the A/B toggle plus hypothesis, primary metric, guardrails, MDE.
3. **Live event stream** — newest first, name + key props, the leak's events highlighted.

## Desktop-only chrome

1. **Top bar** — game name, thesis line, variant toggle, PM toggle, Reset
2. **Annotation rail** — 4–5 numbered callouts in the dead space beside the phone, changing per
   screen. The highest-leverage feature on the page: it makes product reasoning legible *inside*
   the demo instead of only in the note
3. **"Simulate 5 days of play"** — accrues coins, advances `dayIndex`, completes a held Goal.
   Without it nobody sees a Goal fill, and the retention loop is the product
4. **Reset demo** — clears `localStorage`. Non-negotiable; a second evaluator on the same machine
   must not land mid-state

## Design tokens

```
felt        #0E3B2E   table surface
felt-deep   #072A20   panel ground
gold        #E8B44A   coins — warm, weighted
gold-dim    #A9812E
cream       #F4EDE0   primary text
ink         #08130F   text on gold
danger      #C2452D   loss states
```

Display face for numbers and headings, clean sans for body. The PM panel is the one place a
neutral monospace instrument look is correct — the contrast between the two views *is* the point.

Coins animate on arrival at the reward moment: they should have weight.

## Definition of done per screen

Commit after each. A screen is done when it fires its taxonomy events with correct
`coins_short_by`, survives a reload, and has no dead end — every state offers a next action.
