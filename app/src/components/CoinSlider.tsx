import { useCallback, useEffect, useRef } from 'react'
import { PEG, coins as fmtCoins } from '../constants'
import { rupees } from '../constants'
import { CoinIcon } from './ui'

/**
 * The coin↔cash slider. Pointer events only (never touch events) so it drags with a finger AND a
 * mouse, plus arrow-key support for keyboard and for anyone poking at it on a laptop.
 *
 * `max` is the coin cap — the share of the price coins may cover. It is framed in the UI above as
 * a benefit the player has unlocked, never as a limit imposed on them.
 */
export default function CoinSlider({ value, max, mrp, onChange }: {
  value: number; max: number; mrp: number; onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    onChange(Math.round((pct * max) / 10) * 10)
  }, [max, onChange])

  useEffect(() => {
    const move = (e: PointerEvent) => { if (dragging.current) setFromClientX(e.clientX) }
    const up = () => { dragging.current = false }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [setFromClientX])

  const pct = max > 0 ? value / max : 0
  const cash = Math.max(0, Math.round(mrp - value / PEG))

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-cream-dim/60">
            Pay with coins
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-display text-[19px]
            font-extrabold leading-none text-gold">
            <CoinIcon size={15} />{fmtCoins(value)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-widest text-cream-dim/60">
            Pay by UPI
          </div>
          <div className="mt-1 font-display text-[19px] font-extrabold leading-none text-cream">
            {rupees(cash)}
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}
        aria-label="Coins applied to this purchase"
        onPointerDown={(e) => { dragging.current = true; setFromClientX(e.clientX) }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? Math.round(max / 10) : Math.max(10, Math.round(max / 40))
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { e.preventDefault(); onChange(Math.min(max, value + step)) }
          if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(0, value - step)) }
          if (e.key === 'Home') { e.preventDefault(); onChange(0) }
          if (e.key === 'End')  { e.preventDefault(); onChange(max) }
        }}
        className="relative h-9 cursor-pointer touch-none select-none rounded-full
          border border-white/10 bg-black/40 outline-none focus-visible:border-gold/60"
      >
        <div className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: 'linear-gradient(90deg, #A9812E 0%, #E8B44A 100%)',
            transition: dragging.current ? 'none' : 'width .18s ease',
          }} />
        <div className="absolute top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center
          rounded-full border-2 border-[#6B4F14] bg-cream text-[10px] font-extrabold text-ink"
          style={{
            left: `calc(${pct * 100}% - 14px)`,
            transition: dragging.current ? 'none' : 'left .18s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,.45)',
          }}>⇆</div>
      </div>

      <div className="mt-2 flex justify-between text-[9px] text-cream-dim/55">
        <span>All cash</span>
        <span>Max coins ({Math.round((max / PEG / mrp) * 100)}% of price)</span>
      </div>
    </div>
  )
}
