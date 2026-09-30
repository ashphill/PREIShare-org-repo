import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/deals')({
  component: DealsPage,
})

function DealsPage() {
  return (
    <main>
      <h1>Deals</h1>
      <p>Placeholder for open and past investment deals.</p>
    </main>
  )
}
