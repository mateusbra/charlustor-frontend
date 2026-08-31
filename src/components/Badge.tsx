import type { ReactNode } from 'react'

export type BadgeColor = 'pink' | 'purple' | 'cyan' | 'gold' | 'green' | 'red' | 'gray'

const COLOR_CLASSES: Record<BadgeColor, string> = {
  pink: 'bg-brand-pink text-white',
  purple: 'bg-brand-purple text-white',
  cyan: 'bg-brand-cyan text-ink-deep',
  gold: 'bg-brand-gold text-ink-deep',
  green: 'bg-brand-green text-ink-deep',
  red: 'bg-brand-red text-white',
  gray: 'bg-panel-border text-text',
}

export function Badge({ color, children }: { color: BadgeColor; children: ReactNode }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase ${COLOR_CLASSES[color]}`}>
      {children}
    </span>
  )
}
