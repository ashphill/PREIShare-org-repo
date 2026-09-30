import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

function DashboardHomePage() {
  return (
    <main>
      <h1>Dashboard overview</h1>
      <p>Placeholder for portfolio value, open deals, and recent activity.</p>
    </main>
  )
}
