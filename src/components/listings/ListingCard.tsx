// Presentational card for one property listing.
// Props in, markup out: no data fetching, no Supabase client, no env access.
import type { PropertyListingRow } from '../../lib/supabase/types'

export type ListingCardProps = {
  listing: PropertyListingRow
}

const STATUS_LABELS: Record<PropertyListingRow['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  under_offer: 'Under offer',
  sold: 'Sold',
  archived: 'Archived',
}

const PROPERTY_TYPE_LABELS: Record<PropertyListingRow['property_type'], string> = {
  multifamily: 'Multifamily',
  office: 'Office',
  retail: 'Retail',
  industrial: 'Industrial',
  mixed_use: 'Mixed use',
  land: 'Land',
}

function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return 'Price not set'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-US')} ${currency}`
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const headingId = `listing-${listing.id}-title`

  return (
    <article
      aria-labelledby={headingId}
      className="listing-card flex h-full flex-col gap-2 rounded-xl border border-[var(--line)] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={headingId} className="text-lg font-semibold leading-snug">
          {listing.title}
        </h2>
        <span className="shrink-0 rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-semibold">
          {STATUS_LABELS[listing.status]}
        </span>
      </div>

      <p className="text-sm text-[var(--sea-ink-soft)]">
        {listing.city}, {listing.region} · {PROPERTY_TYPE_LABELS[listing.property_type]}
      </p>

      <p className="text-base font-semibold">{formatPrice(listing.asking_price, listing.currency)}</p>

      {listing.summary ? <p className="text-sm">{listing.summary}</p> : null}
    </article>
  )
}
