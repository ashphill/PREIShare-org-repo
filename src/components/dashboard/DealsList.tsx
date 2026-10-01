export type Deal = {
  id: string
  name: string
  location: string
  assetClass: string
  minimumInvestment: number
  status: 'Open' | 'Closing soon' | 'Waitlist'
}

/** Sample deals only. Live deal data is wired in a later step. */
export const MOCK_DEALS: Deal[] = [
  { id: 'd1', name: 'Harbor View Residences (sample)', location: 'Tampa, FL', assetClass: 'Multifamily', minimumInvestment: 25000, status: 'Open' },
  { id: 'd2', name: 'Summit Logistics Hub (sample)', location: 'Columbus, OH', assetClass: 'Industrial', minimumInvestment: 50000, status: 'Closing soon' },
  { id: 'd3', name: 'Canyon Ridge Self Storage (sample)', location: 'St. George, UT', assetClass: 'Self storage', minimumInvestment: 15000, status: 'Waitlist' },
]

const STATUS_STYLES: Record<Deal['status'], string> = {
  Open: 'bg-[rgba(79,184,178,0.18)]',
  'Closing soon': 'bg-[rgba(234,179,8,0.2)]',
  Waitlist: 'bg-[rgba(148,163,184,0.25)]',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

type DealsListProps = {
  deals?: Deal[]
  emptyMessage?: string
}

/** Scannable list of open deals. Presentational only: no invest or checkout actions. */
export function DealsList({
  deals = MOCK_DEALS,
  emptyMessage = 'No open deals right now. Check back soon for new opportunities.',
}: DealsListProps) {
  return (
    <section
      className="dashboard-panel rounded-xl border border-[var(--line)] p-4"
      aria-labelledby="open-deals-heading"
    >
      <h2 id="open-deals-heading" className="mb-1 text-lg font-semibold">
        Open deals
      </h2>
      <p className="sample-data-banner mb-3 text-xs text-[var(--sea-ink-soft)]" role="note">
        Sample deals — placeholders only, not live offerings
      </p>

      {deals.length === 0 ? (
        <p className="empty-state text-sm text-[var(--sea-ink-soft)]">{emptyMessage}</p>
      ) : (
        <ul className="deals-list space-y-3">
          {deals.map((deal) => (
            <li
              key={deal.id}
              className="deal-card flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--line)] p-3"
            >
              <div>
                <h3 className="font-semibold">{deal.name}</h3>
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  {deal.location} · {deal.assetClass}
                </p>
              </div>
              <p className="text-sm">Min. {formatCurrency(deal.minimumInvestment)}</p>
              <p className={`status rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[deal.status]}`}>
                {deal.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
