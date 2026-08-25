import type { ReactNode } from 'react'
import { coins as fmtCoins } from '../constants'

export const CoinIcon = ({ size = 14 }: { size?: number }) => (
  <span
    className="inline-flex items-center justify-center rounded-full shrink-0"
    style={{
      width: size, height: size,
      background: 'radial-gradient(circle at 32% 28%, #F7D889 0%, #E8B44A 46%, #A9812E 100%)',
      boxShadow: 'inset 0 -1px 1px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.35)',
      fontSize: size * 0.6, color: '#6B4F14', fontWeight: 800, lineHeight: 1,
    }}
  >₹</span>
)

export const CoinAmount = ({ n, size = 14, className = '' }:
  { n: number; size?: number; className?: string }) => (
  <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${className}`}>
    <CoinIcon size={size} />{fmtCoins(n)}
  </span>
)

/**
 * Button geometry ported from the Claude Design canvas: pill radius, 48px tall (hero 52px),
 * 14–15px at weight 600. Taller and rounder than what we had, which reads far more like a
 * mobile game's CTA than a web button.
 */
export function Btn({ children, onClick, variant = 'primary', size = 'md', full, disabled,
  className = '' }: {
  children: ReactNode; onClick?: () => void
  variant?: 'primary' | 'ghost' | 'gold' | 'dark'
  size?: 'md' | 'hero' | 'sm'
  full?: boolean; disabled?: boolean; className?: string
}) {
  const styles = {
    primary: 'text-cream border border-white/14 bg-felt-lift',
    gold:    'text-ink border border-gold-dim/60 font-bold',
    ghost:   'text-cream-dim border border-white/14 bg-transparent',
    dark:    'text-cream border border-white/12 bg-black/35',
  }[variant]
  const dims = {
    hero: 'h-[52px] text-[15px] px-6',
    md:   'h-12 text-[14px] px-5',
    sm:   'h-9 text-[12px] px-4',
  }[size]
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={variant === 'gold' ? { background: 'var(--grad-gold)' } : undefined}
      className={`tappable inline-flex items-center justify-center rounded-full font-semibold
        leading-none ${dims} ${styles} ${full ? 'w-full' : ''}
        ${disabled ? 'pointer-events-none opacity-40' : ''} ${className}`}
    >{children}</button>
  )
}

/** Thin progress bar. The design uses this inside tiles where a ring would be too heavy. */
export const Bar = ({ pct, h = 5 }: { pct: number; h?: number }) => (
  <div className="overflow-hidden rounded-full border border-white/10 bg-black/40"
    style={{ height: h }}>
    <div className="h-full rounded-full"
      style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%`,
               background: 'var(--grad-gold)', transition: 'width 600ms cubic-bezier(.22,.61,.36,1)' }} />
  </div>
)

/** Progress ring used for Goals. The visual promise that there is always a path. */
export function Ring({ pct, size = 40, stroke = 4, children }:
  { pct: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gold)"
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, pct)))}
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.2,.9,.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[9px] font-bold text-cream">
        {children}
      </div>
    </div>
  )
}

export const Tag = ({ children, tone = 'neutral' }:
  { children: ReactNode; tone?: 'neutral' | 'gold' | 'warn' }) => (
  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
    tone === 'gold' ? 'bg-gold/18 text-gold'
    : tone === 'warn' ? 'bg-danger/22 text-[#FF9C87]'
    : 'bg-white/10 text-cream-dim'}`}>{children}</span>
)

export const TopBar = ({ title, onBack, right }:
  { title: string; onBack?: () => void; right?: ReactNode }) => (
  <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
    {onBack && (
      <button onClick={onBack} className="tappable -ml-1 grid h-8 w-8 place-items-center
        rounded-lg bg-white/8 text-cream text-lg leading-none">‹</button>
    )}
    <div className="font-display text-[15px] font-bold">{title}</div>
    <div className="ml-auto">{right}</div>
  </div>
)
