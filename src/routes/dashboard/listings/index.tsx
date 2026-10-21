// /dashboard/listings — the signed-in sponsor's property listings, live from Postgres.
// Lives under src/routes/dashboard/, so the dashboard layout's beforeLoad session
// gate (dashboard/route.tsx) protects it. Data comes only from the listMyListings
// server function (src/server/listings.ts) — no mock arrays, no browser DB queries.
import { Link, createFileRoute } from '@tanstack/react-router'
import { ListingCard } from '../../../components/listings/ListingCard'
import { listMyListings } from '../../../server/listings'

export const Route = createFileRoute('/dashboard/listings/')({
  loader: () => listMyListings(),
  pendingComponent: ListingsLoading,
  errorComponent: ListingsLoadError,
  component: ListingsIndexPage,
})

function PageHeader() {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 id="listings-heading" className="text-xl font-semibold">
        Your property listings
      </h1>
      <Link
        to="/dashboard/listings/new"
        className="min-h-[44px] rounded-md bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white"
      >
        Add listing
      </Link>
    </header>
  )
}

function ListingsIndexPage() {
  const result = Route.useLoaderData()

  if (!result.ok) {
    return (
      <section aria-labelledby="listings-heading">
        <PageHeader />
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      </section>
    )
  }

  const { listings } = result

  return (
    <section aria-labelledby="listings-heading">
      <PageHeader />

      {listings.length === 0 ? (
        <div className="empty-state rounded-xl border border-dashed border-[var(--line)] p-6 text-center">
          <p className="mb-1 font-semibold">No properties yet.</p>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Add your first listing to get started. Only you can see your listings.
          </p>
        </div>
      ) : (
        <ul className="dash-card-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Property listings">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ListingsLoading() {
  return (
    <section aria-labelledby="listings-heading" aria-busy="true">
      <PageHeader />
      <p role="status" className="text-sm text-[var(--sea-ink-soft)]">
        Loading your listings…
      </p>
    </section>
  )
}

function ListingsLoadError() {
  return (
    <section aria-labelledby="listings-heading">
      <PageHeader />
      <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
        Something went wrong loading your listings. Please refresh the page.
      </p>
    </section>
  )
}
