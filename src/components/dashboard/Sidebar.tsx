import { NavItems } from '../layout/NavItems'

type SidebarProps = {
  brandLabel?: string
}

/**
 * Desktop/tablet navigation for the investor dashboard shell.
 * Visible at 768px and wider; hidden on phones, where MobileNav takes over.
 * Links, labels, and the active state come from the shared list in
 * src/components/layout/navConfig.ts (same list MobileNav uses), matching
 * docs/dashboard-routing-plan.md: Home, Portfolio, Deals, Profile.
 */
export function Sidebar({ brandLabel = 'PREIshare' }: SidebarProps) {
  return (
    <aside className="dash-sidebar dashboard-sidebar" aria-label="Investor navigation">
      <div className="sidebar-brand mb-4 text-lg font-bold">{brandLabel}</div>
      <NavItems />
    </aside>
  )
}
