// src/routes/dashboard/properties.tsx — /dashboard/properties
// Protected list of the signed-in sponsor's properties (table: public.property_listings).
//
// Security model (docs/data-model-and-rls-matrix.md):
// - Nested under src/routes/dashboard.tsx, whose beforeLoad session guard already
//   blocks signed-out visitors. The server function below re-checks the session
//   (defense in depth) and redirects to /login if it is missing.
// - Rows are loaded on the SERVER with createSupabaseServerClient(accessToken) from
//   src/lib/supabase.server.ts: anon key + the sponsor's own token, so the RLS policy
//   `listings_select_own` (owner_id = auth.uid()) decides which rows come back.
// - No service-role key, no secret env vars, and no "fetch everything then filter
//   in React" — the component only renders what RLS already allowed.
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { requireSessionUser } from '../../lib/auth/session'
import { createSupabaseServerClient } from '../../lib/supabase.server'
import type { PropertyListingRow } from '../../lib/supabase/types'

/** List-friendly columns only (names match the migration exactly). */
export type PropertyListItem = Pick<
  PropertyListingRow,
  'id' | 'title' | 'city' | 'region' | 'property_type' | 'status' | 'asking_price' | 'currency' | 'created_at'
>

type PropertiesResult = { properties: PropertyListItem[]; error: string | null }

const LIST_COLUMNS = 'id, title, city, region, property_type, status, asking_price, currency, created_at'

/** Server-only load path. RLS on property_listings restricts rows to the signed-in sponsor. */
const loadSponsorProperties = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PropertiesResult> => {
    const session = await requireSessionUser()
    if (!session) {
      throw redirect({ to: '/login' })
    }

    const supabase = createSupabaseServerClient(session.accessToken)
    const { data, error } = await supabase
      .from('property_listings')
      .select(LIST_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) {
      // Real reason goes to the server log only; the page gets a safe message.
      console.error('[properties] load failed:', error.message)
      return { properties: [], error: 'Could not load your properties. Please try again.' }
    }

    return { properties: data ?? [], error: null }
  },
)

export const Route = createFileRoute('/dashboard/properties')({
  loader: () => loadSponsorProperties(),
  pendingComponent: PropertiesLoading,
  errorComponent: PropertiesLoadError,
  component: PropertiesPage,
})

const STATUS_LABELS: Record<PropertyListItem['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  under_offer: 'Under offer',
  sold: 'Sold',
  archived: 'Archived',
}

function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return 'Price not set'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-US')} ${currency}`
  }
}

function PageHeader() {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 id="properties-heading" className="text-xl font-semibold">
          Your properties
        </h1>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Listings you are allowed to manage. Visibility is enforced by the database (row-level security),
          not only by this page.
        </p>
      </div>
      <Link
        to="/dashboard/listings/new"
        className="min-h-[44px] rounded-md bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white"
      >
        Add property
      </Link>
    </header>
  )
}

function PropertiesPage() {
  const { properties, error } = Route.useLoaderData()

  return (
    <section aria-labelledby="properties-heading">
      <PageHeader />

      {error ? (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!error && properties.length === 0 ? (
        <div className="empty-state rounded-xl border border-dashed border-[var(--line)] p-6 text-center">
          <p className="mb-1 font-semibold">No properties yet</p>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            When you add a listing, it will show up here for your sponsor account only.
          </p>
        </div>
      ) : null}

      {properties.length > 0 ? (
        <ul className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]" aria-label="Your properties">
          {properties.map((property) => (
            <li
              key={property.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">{property.title}</p>
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  {property.city}, {property.region} · {formatPrice(property.asking_price, property.currency)}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-semibold">
                {STATUS_LABELS[property.status]}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function PropertiesLoading() {
  return (
    <section aria-labelledby="properties-heading" aria-busy="true">
      <PageHeader />
      <p role="status" className="text-sm text-[var(--sea-ink-soft)]">
        Loading your properties…
      </p>
    </section>
  )
}

function PropertiesLoadError() {
  return (
    <section aria-labelledby="properties-heading">
      <PageHeader />
      <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
        Something went wrong loading your properties. Please refresh the page.
      </p>
    </section>
  )
}
