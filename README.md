# Patti Royale — an in-game commerce store

A working prototype for the **PlaySuper Product Associate** assignment: a store inside a mobile
game where players spend earned coins plus real money on real-world rewards.

**▶ Live:** **https://daenerysdrag.github.io/patti-royale-playsuper/**
**📄 The note:** [`SUBMISSION.md`](./SUBMISSION.md) — product decisions and assumptions

> In e-commerce, the cart is dead intent. In a game, the cart is a retention loop.

Open it on a laptop if you can: the PM console docks on the right and the reasoning callouts sit
beside the phone, so you can see the decisions and the instrumentation at the same time. It works
on mobile — the PM console moves behind a toggle in the top bar.

---

## 60 seconds — what to click

You start with **1,000 coins** so nothing needs grinding.

0. **You land on the lobby** — "Play now", and one contextual reward tile. If you'd rather skip
   straight to the commerce, tap the tile. Everything below assumes you play first.
1. **Play now → read the card → "Deal my cards"** — three tricks, three cards. Follow suit and
   beat it.
2. **Lose one on purpose** — play an off-suit card. Note that a loss still pays, and never scolds.
   *If the match couldn't be lost, coins would be granted rather than earned, and every "3 more
   wins" on the shelf would be decoration.*
3. **Rewards → claim Starbucks ₹100** — two taps, no cart, code straight into the Vault.
4. **Rewards → reserve JioHotstar Super** — you can't afford it, so the button becomes *reserve and
   play*. A ring appears in the match HUD. **This is the product.**
5. **"Simulate 5 days"** in the top bar — watch the ring fill and the goal complete.
6. **Claim it** — 5,996 coins + ₹899 cash. This is the coin↔cash slider, and PlaySuper's actual
   model: coins cover the discount, the rest is cash.
7. **Watch the PM console** the whole time — the funnel is fired by the app you're clicking.
   Nothing is mocked.

**Reset** (top bar) puts it back to a clean state for the next person.

---

## What's worth noticing

| | |
|---|---|
| **The match is losable** | Two of the opponent's three leads are beatable. The skill is *allocation* — spend your high card on the wrong trick and you lose the match |
| **No search, no filters** | 12 items in 3 fixed groups. The attention window is ~40 seconds |
| **Effort pricing** | "3 more wins" instead of only "₹389". Effort is the honest price of a coin |
| **Zero dead ends** | Every unaffordable item offers a path, never a wall |
| **Goals ≠ Vault** | Goals are reserved and unpaid. The Vault holds codes you own |
| **Coins back on expiry** | You can't refund someone's time, so we don't keep it |
| **`coins_short_by`** | The one property separating a pricing failure from an interest failure. See the PM console's funnel section |

---

## Run it locally

```bash
cd app
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc -p tsconfig.app.json --noEmit
npm run build
```

Node 20+. No backend, no keys, no accounts — state persists to `localStorage`.

## Layout

```
docs/          the reasoning: assumptions, economy, event taxonomy, build spec, integrity
SUBMISSION.md  the note (deliverable #2)
RECORDING.md   walkthrough script
app/
  src/constants.ts   single source of truth for every economy number
  src/catalog.ts     12 digital SKUs across 3 tiers
  src/pricing.ts     coin cost, cash due, effort ("3 more wins")
  src/events.ts      the event bus. EventName is a closed union — invented names won't compile
  src/store.ts       zustand + localStorage. wallet === sum(ledger.delta), asserted in dev
  src/screens/       10 screens
  src/components/PmPanel.tsx    funnel · experiment · live event stream
  src/annotations.ts            the desktop callouts, per screen
```

Built with **Claude Code (Opus 5)**, React + TypeScript + Vite + Tailwind + framer-motion + zustand.
