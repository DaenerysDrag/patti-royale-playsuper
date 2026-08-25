import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { CoinAmount, Ring } from '../components/ui'

/**
 * THE MATCH — and it must be losable.
 *
 * The whole product rests on currency being EARNED: time-to-afford merchandising, "3 more wins",
 * "16 days of play". If the match cannot be lost, coins are granted rather than earned and every
 * one of those claims is decoration.
 *
 * So this is a real trick-taking beat, not a timer with a Skip button. Best of 3 tricks. The
 * opponent leads; you must follow suit and beat it. You hold exactly 3 cards for 3 tricks, so the
 * decision is ALLOCATION — burn your high spade now, or save it for the lead you can see coming?
 * A careless player wins one trick and loses the match. That fail state is the point.
 */

const SUITS = [
  { s: '♠', red: false }, { s: '♥', red: true },
  { s: '♦', red: true },  { s: '♣', red: false },
] as const
const RANKS = [
  { r: '7', v: 7 }, { r: '8', v: 8 }, { r: '9', v: 9 }, { r: '10', v: 10 },
  { r: 'J', v: 11 }, { r: 'Q', v: 12 }, { r: 'K', v: 13 }, { r: 'A', v: 14 },
]

interface Card { suit: string; red: boolean; rank: string; v: number; id: string }

const card = (si: number, ri: number): Card => ({
  suit: SUITS[si].s, red: SUITS[si].red, rank: RANKS[ri].r, v: RANKS[ri].v,
  id: `${SUITS[si].s}${RANKS[ri].r}`,
})

/**
 * Deal so that a perfect player wins exactly 2 of 3 tricks and a careless one wins 1.
 * Two of the opponent's leads are beatable; the third is not. Which is which is not signposted —
 * that is the skill.
 */
function deal() {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
  const suitIdx = [0, 1, 2, 3]
  const leadSuits = [pick(suitIdx), pick(suitIdx), pick(suitIdx)]
  const leads = leadSuits.map(si => card(si, Math.floor(Math.random() * 5)))       // ranks 7..J
  const beatable = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, 2)
  const hand: Card[] = beatable.map(i => {
    const higher = RANKS.findIndex(x => x.v === leads[i].v) + 1
    return card(leadSuits[i], higher + Math.floor(Math.random() * (RANKS.length - higher)))
  })
  const dud = suitIdx.filter(s => !beatable.some(i => leadSuits[i] === s))
  hand.push(card(dud.length ? pick(dud) : pick(suitIdx), Math.floor(Math.random() * 3)))
  return { leads, hand: hand.sort(() => Math.random() - 0.5) }
}

const TRICK_SECONDS = 6

const CardFace = ({ c, dim, big }: { c: Card; dim?: boolean; big?: boolean }) => (
  <div
    className={`relative grid place-items-center rounded-lg bg-cream font-display font-extrabold
      ${big ? 'h-[92px] w-[66px] text-[26px]' : 'h-[84px] w-[60px] text-[22px]'}
      ${dim ? 'opacity-25' : ''}`}
    style={{ color: c.red ? '#C2452D' : '#12211C', boxShadow: '0 6px 14px rgba(0,0,0,.4)' }}
  >
    <div className="leading-none">{c.rank}</div>
    <div className="absolute bottom-1.5 right-2 text-[15px] leading-none">{c.suit}</div>
    <div className="absolute left-2 top-1.5 text-[11px] leading-none">{c.suit}</div>
  </div>
)

export default function Match() {
  const { resolveMatch, goals, wallet, ledger, go } = useStore()
  const [{ leads, hand }, setDeal] = useState(deal)
  const [used, setUsed] = useState<string[]>([])
  const [trick, setTrick] = useState(0)
  const [won, setWon] = useState(0)
  const [flash, setFlash] = useState<'win' | 'loss' | null>(null)
  const [played, setPlayed] = useState<Card | null>(null)
  const [t, setT] = useState(TRICK_SECONDS)
  const busy = useRef(false)

  const hasPlayedBefore = ledger.some(e => e.reason === 'match_win' || e.reason === 'match_loss')

  // The HUD goal ring — this is what makes a reserved Goal a retention loop and not a wishlist.
  const goal = goals[0]
  const goalPct = goal ? Math.min(1, wallet / goal.coinCostLocked) : 0

  const lead = leads[trick]

  const play = (c: Card) => {
    if (busy.current || !lead) return
    busy.current = true
    const beat = c.suit === lead.suit && c.v > lead.v
    setPlayed(c); setUsed(u => [...u, c.id]); setFlash(beat ? 'win' : 'loss')
    if (beat) setWon(w => w + 1)
    window.setTimeout(() => {
      setFlash(null); setPlayed(null); busy.current = false
      if (trick === 2) {
        const total = won + (beat ? 1 : 0)
        resolveMatch(total >= 2 ? 'win' : 'loss')
      } else {
        setTrick(x => x + 1); setT(TRICK_SECONDS)
      }
    }, 1000)
  }

  // Timeout plays your leftmost unused card — usually the wrong one. Hesitation costs you.
  useEffect(() => {
    if (flash) return
    if (t <= 0) {
      const next = hand.find(c => !used.includes(c.id))
      if (next) play(next)
      return
    }
    const id = window.setTimeout(() => setT(x => x - 0.1), 100)
    return () => window.clearTimeout(id)
  }, [t, flash])

  return (
    <div className="flex h-full flex-col bg-felt"
      style={{ backgroundImage: 'radial-gradient(120% 60% at 50% 0%, #14503D 0%, #0E3B2E 55%, #072A20 100%)' }}>

      {/* HUD — coin chip is an entry point, goal ring is the retention loop made visible */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="rounded-full bg-black/35 px-2.5 py-1.5 border border-white/10">
          <CoinAmount n={wallet} size={13} className="text-[12px] text-gold" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {goal && (
            <button onClick={() => go('goals')} className="tappable flex items-center gap-1.5
              rounded-full bg-black/35 px-2 py-1 border border-gold/30">
              <Ring pct={goalPct} size={22} stroke={3} />
              <span className="pr-1 text-[10px] font-bold text-gold">
                {Math.round(goalPct * 100)}%
              </span>
            </button>
          )}
          <div className="rounded-full bg-black/35 px-2.5 py-1.5 text-[11px] font-bold
            text-cream-dim border border-white/10">
            Trick {trick + 1}/3 · Won {won}
          </div>
        </div>
      </div>

      {/* timer */}
      <div className="mx-4 mt-3 h-1 overflow-hidden rounded-full bg-black/35">
        <div className="h-full rounded-full transition-[width] duration-100"
          style={{ width: `${(t / TRICK_SECONDS) * 100}%`,
                   background: t < 2 ? 'var(--color-danger)' : 'var(--color-gold)' }} />
      </div>

      {/* opponent */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-cream-dim/70">
          Opponent leads
        </div>
        {lead && <CardFace c={lead} big />}
      </div>

      {/* result flash */}
      <div className="mt-4 grid h-[70px] place-items-center">
        <AnimatePresence mode="wait">
          {flash && played ? (
            <motion.div key="flash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="flex flex-col items-center gap-1.5">
              <div className={`font-display text-[17px] font-extrabold
                ${flash === 'win' ? 'text-gold' : 'text-[#FF9C87]'}`}>
                {flash === 'win' ? 'Trick won' : 'Trick lost'}
              </div>
              <div className="text-[11px] text-cream-dim">
                {flash === 'win'
                  ? `${played.rank}${played.suit} beats ${lead!.rank}${lead!.suit}`
                  : played.suit !== lead!.suit
                    ? `${played.suit} can't follow ${lead!.suit}`
                    : `${played.rank}${played.suit} is under ${lead!.rank}${lead!.suit}`}
              </div>
            </motion.div>
          ) : (
            <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-[11px] leading-relaxed text-cream-dim">
              Follow <span className="font-bold text-cream">{lead?.suit}</span> and beat{' '}
              <span className="font-bold text-cream">{lead?.rank}</span>
              <div className="mt-0.5 text-[10px] text-cream-dim/60">
                3 cards, 3 tricks — spend them well
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* hand */}
      <div className="mt-auto px-4 pb-5">
        <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest
          text-cream-dim/70">Your hand</div>
        <div className="flex justify-center gap-2.5">
          {hand.map(c => {
            const spent = used.includes(c.id)
            return (
              <motion.button key={c.id} onClick={() => !spent && play(c)}
                whileTap={{ scale: spent ? 1 : 0.94 }}
                animate={{ y: spent ? 10 : 0 }}
                className={spent ? 'pointer-events-none' : 'tappable'}>
                <CardFace c={c} dim={spent} />
              </motion.button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {/* Skip unlocks only AFTER one real match, so the first run through the demo is honest. */}
          {hasPlayedBefore ? (
            <button onClick={() => resolveMatch(Math.random() > 0.45 ? 'win' : 'loss')}
              className="tappable text-[11px] font-semibold text-cream-dim underline
                decoration-white/25 underline-offset-4">
              Skip match
            </button>
          ) : (
            <div className="text-[10px] text-cream-dim/45">Skip unlocks after your first match</div>
          )}
          <button onClick={() => { setDeal(deal()); setUsed([]); setTrick(0); setWon(0); setT(TRICK_SECONDS) }}
            className="tappable text-[11px] font-semibold text-cream-dim underline
              decoration-white/25 underline-offset-4">
            New deal
          </button>
        </div>
      </div>
    </div>
  )
}
