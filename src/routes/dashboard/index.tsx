import { createFileRoute } from '@tanstack/react-router'
import { MetricCard } from '../../components/dashboard/MetricCard'
import type { MetricCardProps } from '../../components/dashboard/MetricCard'
import { MOCK_HOLDINGS, PortfolioSummary } from '../../components/dashboard/PortfolioSummary'
import { MOCK_ACTIVITY, RecentActivity } from '../../components/dashboard/RecentActivity'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

// Shell demo data only. Replace with route loaders / Supabase in a later sprint.
const DEMO_METRICS: MetricCardProps[] = [
  { label: 'Total portfolio value', value: '$300,000', hint: 'Sample total' },
  { label: 'Holdings', value: '3', hint: 'Sample count' },
  { label: 'Open deals', value: '4', hint: 'Sample count' },
]

/**
 * Dashboard home at exactly /dashboard. Renders inside the layout's <Outlet />
 * in dashboard/route.tsx (AppShell lives there), so this page only composes widgets.
 */
function DashboardHomePage() {
  return (
    <section className="dashboard-home space-y-6" aria-labelledby="dashboard-home-heading">
      <div className="space-y-1">
        <h2 id="dashboard-home-heading" className="text-xl font-semibold">
          Welcome to your PREIshare dashboard
        </h2>
        <p className="sample-data-banner text-sm text-[var(--sea-ink-soft)]" role="note">
          Demo shell — all figures below are sample placeholders, not live balances.
        </p>
      </div>

      <div className="dashboard-home__stats dash-card-grid" aria-label="Key metrics">
        {DEMO_METRICS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="dashboard-home__panels grid gap-4 lg:grid-cols-2">
        <PortfolioSummary
          totalLabel="$300,000"
          holdings={MOCK_HOLDINGS}
          emptyMessage="No holdings to show yet. Once your account is linked, your portfolio snapshot will appear here."
        />
        <RecentActivity
          items={MOCK_ACTIVITY}
          emptyMessage="No recent activity yet. Distributions, new deals, and profile updates will be listed here."
        />
      </div>
    </section>
  )
}
