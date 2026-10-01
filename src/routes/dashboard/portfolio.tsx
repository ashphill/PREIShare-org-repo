import { createFileRoute } from '@tanstack/react-router'
import { PortfolioTable } from '../../components/dashboard/PortfolioTable'

export const Route = createFileRoute('/dashboard/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <section className="dashboard-page" aria-label="Your portfolio">
      <PortfolioTable />
    </section>
  )
}
