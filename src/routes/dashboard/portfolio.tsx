import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <main>
      <h1>Portfolio</h1>
      <p>Placeholder for holdings and performance.</p>
    </main>
  )
}
