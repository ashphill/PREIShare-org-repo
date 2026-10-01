export type ActivityItem = {
  id: string
  title: string
  detail: string
  dateLabel: string
}

export type RecentActivityProps = {
  title?: string
  items?: ActivityItem[]
  isSampleData?: boolean
  /** Shown instead of the list when there is no activity */
  emptyMessage?: string
}

/** MOCK PLACEHOLDER: sample activity only. Replace with a live feed in a later sprint. */
export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', title: 'Distribution posted (sample)', detail: 'Sample Multifamily Fund A', dateLabel: 'Mar 1, 2026' },
  { id: 'a2', title: 'New deal opened (sample)', detail: 'Sample Retail Center C', dateLabel: 'Feb 24, 2026' },
  { id: 'a3', title: 'Capital call notice (sample)', detail: 'Sample Industrial Note B', dateLabel: 'Feb 18, 2026' },
  { id: 'a4', title: 'Profile updated (sample)', detail: 'Contact details', dateLabel: 'Feb 5, 2026' },
]

/** Short list of recent mock events. Presentational only: no data fetching. */
export function RecentActivity({
  title = 'Recent activity',
  items = MOCK_ACTIVITY,
  isSampleData = true,
  emptyMessage = 'No recent activity yet.',
}: RecentActivityProps) {
  return (
    <section
      className="recent-activity rounded-xl border border-[var(--line)] p-4"
      aria-labelledby="recent-activity-heading"
    >
      <div className="recent-activity__header mb-3">
        <h2 id="recent-activity-heading" className="text-lg font-semibold">
          {title}
        </h2>
        {isSampleData ? (
          <p className="sample-data-banner text-xs text-[var(--sea-ink-soft)]" role="note">
            Sample activity — not connected to a live feed
          </p>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="empty-state text-sm text-[var(--sea-ink-soft)]">{emptyMessage}</p>
      ) : (
        <ol className="recent-activity__list space-y-3">
          {items.map((item) => (
            <li key={item.id} className="recent-activity__item flex justify-between gap-3 text-sm">
              <div className="recent-activity__body">
                <p className="recent-activity__title font-medium">{item.title}</p>
                <p className="recent-activity__detail text-[var(--sea-ink-soft)]">{item.detail}</p>
              </div>
              <time className="recent-activity__date shrink-0 text-[var(--sea-ink-soft)]">
                {item.dateLabel}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
