export type InvestorProfile = {
  displayName: string
  email: string
  membershipTier: string
  preferredContact: string
  notes: string
}

/** Sample profile only. Real member details are wired in a later step. */
export const MOCK_PROFILE: InvestorProfile = {
  displayName: 'Alex Morgan (sample)',
  email: 'alex.morgan@example.com',
  membershipTier: 'Preferred investor',
  preferredContact: 'Email',
  notes: 'Interested in multifamily and industrial deals in the Mountain West.',
}

type ProfileCardProps = {
  profile?: InvestorProfile
}

/** Read-only investor profile card. No edit form, password, or sign-out actions. */
export function ProfileCard({ profile = MOCK_PROFILE }: ProfileCardProps) {
  const fields: { label: string; value: string }[] = [
    { label: 'Name', value: profile.displayName },
    { label: 'Email', value: profile.email },
    { label: 'Membership', value: profile.membershipTier },
    { label: 'Preferred contact', value: profile.preferredContact },
    { label: 'Notes', value: profile.notes },
  ]

  return (
    <section
      className="dashboard-panel profile-card max-w-xl rounded-xl border border-[var(--line)] p-4"
      aria-labelledby="investor-profile-heading"
    >
      <h2 id="investor-profile-heading" className="mb-1 text-lg font-semibold">
        Your profile
      </h2>
      <p className="sample-data-banner mb-3 text-xs text-[var(--sea-ink-soft)]" role="note">
        Sample profile — placeholder details only
      </p>
      <dl className="space-y-3">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs text-[var(--sea-ink-soft)]">{field.label}</dt>
            <dd className="font-medium">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
