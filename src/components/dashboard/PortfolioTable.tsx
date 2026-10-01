export type PortfolioHolding = {
  id: string
  propertyName: string
  assetType: string
  investedAmount: number
  currentValue: number
  status: 'Performing' | 'Under review' | 'Exited'
}

/** Sample holdings only. Real portfolio data is wired in a later step. */
export const MOCK_PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  { id: 'h1', propertyName: 'Riverfront Lofts (sample)', assetType: 'Multifamily', investedAmount: 50000, currentValue: 56200, status: 'Performing' },
  { id: 'h2', propertyName: 'Cedar Business Park (sample)', assetType: 'Industrial', investedAmount: 75000, currentValue: 74100, status: 'Under review' },
  { id: 'h3', propertyName: 'Maple Street Retail (sample)', assetType: 'Retail', investedAmount: 40000, currentValue: 46800, status: 'Exited' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

type PortfolioTableProps = {
  holdings?: PortfolioHolding[]
  emptyMessage?: string
}

/** Table of the investor's holdings. Presentational only: no data fetching. */
export function PortfolioTable({
  holdings = MOCK_PORTFOLIO_HOLDINGS,
  emptyMessage = 'No holdings to show yet. New investments will appear here.',
}: PortfolioTableProps) {
  return (
    <section
      className="dashboard-panel rounded-xl border border-[var(--line)] p-4"
      aria-labelledby="portfolio-holdings-heading"
    >
      <h2 id="portfolio-holdings-heading" className="mb-1 text-lg font-semibold">
        Your holdings
      </h2>
      <p className="sample-data-banner mb-3 text-xs text-[var(--sea-ink-soft)]" role="note">
        Sample data — placeholders only, not live balances
      </p>

      {holdings.length === 0 ? (
        <p className="empty-state text-sm text-[var(--sea-ink-soft)]">{emptyMessage}</p>
      ) : (
        <div className="table-wrap overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--sea-ink-soft)]">
              <tr>
                <th scope="col" className="py-2 pr-4">Property</th>
                <th scope="col" className="py-2 pr-4">Type</th>
                <th scope="col" className="py-2 pr-4">Invested</th>
                <th scope="col" className="py-2 pr-4">Current value</th>
                <th scope="col" className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((row) => (
                <tr key={row.id} className="border-t border-[var(--line)]">
                  <td className="py-2 pr-4 font-medium">{row.propertyName}</td>
                  <td className="py-2 pr-4">{row.assetType}</td>
                  <td className="py-2 pr-4">{formatCurrency(row.investedAmount)}</td>
                  <td className="py-2 pr-4">{formatCurrency(row.currentValue)}</td>
                  <td className="py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
