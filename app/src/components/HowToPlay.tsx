import { motion } from 'framer-motion'
import { EARN } from '../constants'
import { Btn } from '../components/ui'

const Mini = ({ rank, suit, red, dim }:
  { rank: string; suit: string; red?: boolean; dim?: boolean }) => (
  <span className={`inline-grid h-[34px] w-[26px] place-items-center rounded-[5px] bg-cream
    font-display text-[13px] font-extrabold leading-none ${dim ? 'opacity-40' : ''}`}
    style={{ color: red ? '#C2452D' : '#12211C' }}>
    {rank}<span className="text-[8px]">{suit}</span>
  </span>
)

/**
 * HOW TO PLAY — shown once before the first match, reopenable from the match HUD.
 *
 * An evaluator opens this cold with about three minutes. If they don't understand the card rule in
 * ten seconds they will hit Skip, never feel a coin being earned, and the entire time-to-afford
 * argument lands as decoration. This card is cheap insurance on the most important screen.
 */
export default function HowToPlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/70 backdrop-blur-[3px]">
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full rounded-t-[26px] border-t border-white/12 bg-felt-deep px-5 pb-6 pt-5"
        style={{ boxShadow: '0 -20px 50px rgba(0,0,0,.5)' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        <div className="font-display text-[19px] font-extrabold leading-tight">How to play</div>
        <div className="mt-1 text-[11px] text-cream-dim">
          Three tricks. Three cards. Takes about twenty seconds.
        </div>

        <div className="mt-4 space-y-3">
          {/* 1 */}
          <div className="flex gap-3">
            <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full
              bg-gold/20 font-mono text-[10px] font-bold text-gold">1</div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold">Beat the card they lead</div>
              <div className="mt-1.5 flex items-center gap-2">
                <Mini rank="9" suit="♠" />
                <span className="text-[11px] font-bold text-gold">beats</span>
                <Mini rank="7" suit="♠" />
                <span className="ml-1 text-[10px] text-cream-dim">same suit, higher number</span>
              </div>
            </div>
          </div>

          {/* 2 */}
          <div className="flex gap-3">
            <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full
              bg-gold/20 font-mono text-[10px] font-bold text-gold">2</div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold">A different suit always loses</div>
              <div className="mt-1.5 flex items-center gap-2">
                <Mini rank="A" suit="♥" red dim />
                <span className="text-[11px] font-bold text-[#FF9C87]">loses to</span>
                <Mini rank="7" suit="♠" />
                <span className="ml-1 text-[10px] text-cream-dim">even an ace</span>
              </div>
            </div>
          </div>

          {/* 3 */}
          <div className="flex gap-3">
            <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full
              bg-gold/20 font-mono text-[10px] font-bold text-gold">3</div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold">You get 3 cards for 3 tricks</div>
              <div className="mt-1 text-[10px] leading-relaxed text-cream-dim">
                Each card is used once, so spending your best card early can cost you the trick you
                could have won later. That choice is the whole game.
              </div>
            </div>
          </div>

          {/* 4 */}
          <div className="flex gap-3">
            <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full
              bg-gold/20 font-mono text-[10px] font-bold text-gold">4</div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold">Win 2 of 3 tricks to win the match</div>
              <div className="mt-1 text-[10px] leading-relaxed text-cream-dim">
                Six seconds a trick. Run out of time and it plays your leftmost card for you.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/20
          bg-gold/8 px-3.5 py-2.5">
          <div className="text-[11px] font-semibold text-gold">Win {EARN.win} coins</div>
          <div className="text-[11px] text-gold/70">Lose {EARN.loss} coins</div>
        </div>
        <div className="mt-1.5 text-[10px] leading-relaxed text-cream-dim/70">
          Coins buy real rewards — Swiggy, Spotify, Zepto. A loss still pays, just less.
        </div>

        <Btn variant="gold" full className="mt-4" onClick={onStart}>Deal my cards</Btn>
      </motion.div>
    </div>
  )
}
