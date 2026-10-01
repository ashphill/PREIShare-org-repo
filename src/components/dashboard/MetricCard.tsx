import type { ReactNode } from 'react'

export type MetricCardProps = {
  label: string
  value: string
  hint?: string
  /** Optional icon or badge slot for later polish */
  icon?: ReactNode
}

/**
 * MetricCard: one reusable investor KPI tile (label, main value, optional hint).
 * Presentational only: props in, JSX out. No data fetching, router hooks, or charts.
 * Callers pass sample values for now (e.g. hint="Sample total").
 */
export function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <article
      className="stats-card rounded-xl border border-[var(--line)] p-4"
      aria-label={label}
    >
      <header className="stats-card__header flex items-center justify-between gap-2">
        <p className="stats-card__label text-sm text-[var(--sea-ink-soft)]">{label}</p>
        {icon ? <span className="stats-card__icon">{icon}</span> : null}
      </header>
      <p className="stats-card__value mt-1 text-3xl font-bold">{value}</p>
      {hint ? (
        <p className="stats-card__hint mt-1 text-xs text-[var(--sea-ink-soft)]">{hint}</p>
      ) : null}
    </article>
  )
}
