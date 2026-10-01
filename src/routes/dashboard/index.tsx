import { createFileRoute } from '@tanstack/react-router'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { PortfolioSummary } from '../../components/dashboard/PortfolioSummary'
import { RecentActivity } from '../../components/dashboard/RecentActivity'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

/**
 * Dashboard home at exactly /dashboard. Renders inside the layout's <Outlet />
 * in dashboard/route.tsx, so it never redraws the shell. All figures are sample placeholders.
 */
function DashboardHomePage() {
  return (
    <section className="dashboard-home space-y-6" aria-label="Home overview">
      <p className="sample-data-banner text-sm text-[var(--sea-ink-soft)]" role="note">
        Demo shell — all figures below are sample placeholders, not live balances.
      </p>

      <div className="dashboard-home__stats dash-card-grid">
        <MetricCard label="Total portfolio value" value="$300,000" hint="Sample total" />
        <MetricCard label="Holdings" value="3" hint="Sample count" />
        <MetricCard label="Open deals" value="4" hint="Sample count" />
      </div>

      <div className="dashboard-home__panels grid gap-4 lg:grid-cols-2">
        <PortfolioSummary totalLabel="$300,000" />
        <RecentActivity />
      </div>
    </section>
  )
}
