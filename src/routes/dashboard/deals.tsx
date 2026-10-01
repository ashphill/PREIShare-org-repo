import { createFileRoute } from '@tanstack/react-router'
import { DealsList } from '../../components/dashboard/DealsList'

export const Route = createFileRoute('/dashboard/deals')({
  component: DealsPage,
})

function DealsPage() {
  return (
    <section className="dashboard-page" aria-label="Open deals">
      <DealsList />
    </section>
  )
}
