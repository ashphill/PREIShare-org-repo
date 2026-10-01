export type HoldingSnapshot = {
  id: string
  name: string
  allocationLabel: string
  valueLabel: string
}

export type PortfolioSummaryProps = {
  title?: string
  totalLabel: string
  holdings?: HoldingSnapshot[]
  isSampleData?: boolean
}

/** Sample holdings only. Real portfolio data is wired in a later step. */
export const MOCK_HOLDINGS: HoldingSnapshot[] = [
  { id: 'h1', name: 'Sample Multifamily Fund A', allocationLabel: '40%', valueLabel: '$120,000' },
  { id: 'h2', name: 'Sample Industrial Note B', allocationLabel: '35%', valueLabel: '$105,000' },
  { id: 'h3', name: 'Sample Cash Reserve', allocationLabel: '25%', valueLabel: '$75,000' },
]

/** Short snapshot of total value and holdings mix. Presentational only: no data fetching. */
export function PortfolioSummary({
  title = 'Portfolio summary',
  totalLabel,
  holdings = MOCK_HOLDINGS,
  isSampleData = true,
}: PortfolioSummaryProps) {
  return (
    <section
      className="portfolio-summary rounded-xl border border-[var(--line)] p-4"
      aria-labelledby="portfolio-summary-heading"
    >
      <div className="portfolio-summary__header mb-3">
        <h2 id="portfolio-summary-heading" className="text-lg font-semibold">
          {title}
        </h2>
        {isSampleData ? (
          <p className="sample-data-banner text-xs text-[var(--sea-ink-soft)]" role="note">
            Sample data — placeholders only, not live balances
          </p>
        ) : null}
      </div>
      <p className="portfolio-summary__total mb-3 flex justify-between">
        <span className="portfolio-summary__total-label">Total (sample)</span>
        <span className="portfolio-summary__total-value font-bold">{totalLabel}</span>
      </p>
      <ul className="portfolio-summary__list space-y-2">
        {holdings.map((item) => (
          <li key={item.id} className="portfolio-summary__row flex justify-between gap-3 text-sm">
            <span className="portfolio-summary__name">{item.name}</span>
            <span className="portfolio-summary__allocation">{item.allocationLabel}</span>
            <span className="portfolio-summary__value">{item.valueLabel}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
