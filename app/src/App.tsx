import { useEffect, useState } from 'react'
import { useStore } from './store'
import { clearLog } from './events'
import { ANNOTATIONS } from './annotations'
import PmPanel from './components/PmPanel'
import Match from './screens/Match'
import Reward from './screens/Reward'
import Lobby from './screens/Lobby'
import Shelf from './screens/Shelf'
import Product from './screens/Product'
import Goals from './screens/Goals'
import Checkout from './screens/Checkout'
import Confirm from './screens/Confirm'
import Vault from './screens/Vault'
import Ledger from './screens/Ledger'

const W = 390, H = 844   // The canvas NEVER reflows. Small viewports scale it.

function useViewport() {
  const [v, setV] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return v
}

const SCREENS = {
  match: Match, reward: Reward, lobby: Lobby, shelf: Shelf, product: Product,
  goals: Goals, checkout: Checkout, confirm: Confirm, vault: Vault, ledger: Ledger,
}

export default function App() {
  const s = useStore()
  const { w, h } = useViewport()
  const desktop = w >= 1024
  const tablet = w >= 768 && w < 1024
  const Screen = SCREENS[s.screen]
  const notes = ANNOTATIONS[s.screen] ?? []

  const [pmDrawer, setPmDrawer] = useState(false)
  const pmVisible = desktop ? s.pmOpen : pmDrawer

  // Scale the fixed canvas to fit. One layout at every breakpoint.
  const chrome = desktop ? 108 : 96
  const scale = Math.min(
    1,
    (h - chrome) / H,
    ((desktop ? Math.min(430, w - 700) : tablet ? 430 : w) - 16) / W,
  )

  const reset = () => { s.reset(); clearLog(); localStorage.removeItem('pr_state') }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* TOP BAR */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10
        bg-[#04100B] px-4 py-2.5">
        <div className="min-w-0">
          <div className="font-display text-[14px] font-extrabold leading-none">
            Patti Royale <span className="text-gold">· Rewards</span>
          </div>
          <div className="mt-1 hidden truncate text-[10px] text-cream-dim/70 sm:block">
            In e-commerce the cart is dead intent. In a game, the cart is a retention loop.
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => s.simulateDays(5)}
            className="tappable rounded-lg border border-gold/35 bg-gold/12 px-2.5 py-2
              text-[10px] font-bold text-gold">
            Simulate 5 days
          </button>
          <div className="hidden items-center gap-1 rounded-lg border border-white/12
            bg-white/5 p-0.5 sm:flex">
            {(['A', 'B'] as const).map(v => (
              <button key={v} onClick={() => s.setVariant(v)}
                className={`rounded-md px-2 py-1.5 text-[10px] font-bold
                  ${s.variant === v ? 'bg-cream text-ink' : 'text-cream-dim'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => desktop ? s.togglePm() : setPmDrawer(x => !x)}
            className={`tappable rounded-lg border px-2.5 py-2 text-[10px] font-bold
              ${pmVisible ? 'border-[#5BE3A0]/40 bg-[#5BE3A0]/12 text-[#5BE3A0]'
                          : 'border-white/12 bg-white/5 text-cream-dim'}`}>
            PM
          </button>
          <button onClick={reset}
            className="tappable rounded-lg border border-white/12 bg-white/5 px-2.5 py-2
              text-[10px] font-bold text-cream-dim">
            Reset
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ANNOTATION RAIL — desktop only */}
        {desktop && (
          <aside className="no-scrollbar w-[280px] shrink-0 overflow-y-auto border-r
            border-white/8 px-4 py-4">
            <div className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em]
              text-gold/70">
              Why it's built this way
            </div>
            {notes.map((n, i) => (
              <div key={n.t} className="mb-3.5">
                <div className="flex gap-2">
                  <div className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full
                    bg-gold/20 font-mono text-[9px] font-bold text-gold">{i + 1}</div>
                  <div>
                    <div className="font-display text-[12px] font-bold leading-tight">{n.t}</div>
                    <div className="mt-1 text-[10px] leading-relaxed text-cream-dim/80">{n.d}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-5 border-t border-white/8 pt-3 text-[9px] leading-relaxed
              text-cream-dim/45">
              Callouts change with the screen. Everything in the PM console on the right is fired
              by the app on the left — nothing is mocked.
            </div>
          </aside>
        )}

        {/* PHONE */}
        <main className="flex min-w-0 flex-1 items-start justify-center overflow-hidden py-3">
          <div style={{ width: W * scale, height: H * scale }}>
            <div className="canvas overflow-hidden rounded-[30px] border border-white/12
              bg-felt shadow-2xl"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <Screen />
            </div>
          </div>
        </main>

        {/* PM CONSOLE */}
        {desktop && s.pmOpen && (
          <aside className="w-[370px] shrink-0 border-l border-white/10"><PmPanel /></aside>
        )}
        {!desktop && pmDrawer && (
          <aside className="fixed inset-0 z-50 bg-slate">
            <button onClick={() => setPmDrawer(false)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-white/10 px-3 py-2
                font-mono text-[10px] font-bold text-white">close</button>
            <PmPanel />
          </aside>
        )}
      </div>
    </div>
  )
}
