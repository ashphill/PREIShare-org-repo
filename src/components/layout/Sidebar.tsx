import type { ReactNode } from 'react'

type SidebarProps = {
  brandLabel?: string
  children?: ReactNode
}

/** Left navigation chrome for the investor dashboard shell. */
export function Sidebar({ brandLabel = 'PREIshare', children }: SidebarProps) {
  return (
    <aside
      className="dashboard-sidebar border-b border-[var(--line)] p-4 sm:w-56 sm:shrink-0 sm:border-r sm:border-b-0"
      aria-label="Investor navigation"
    >
      <div className="sidebar-brand mb-4 text-lg font-bold">{brandLabel}</div>
      <nav className="sidebar-nav">
        {/* Placeholder links. Full nav config and active states come in the next step. */}
        <ul className="flex flex-wrap gap-3 sm:flex-col sm:gap-2">
          <li><a href="/dashboard">Home</a></li>
          <li><a href="/dashboard/portfolio">Portfolio</a></li>
          <li><a href="/dashboard/deals">Deals</a></li>
          <li><a href="/dashboard/profile">Profile</a></li>
        </ul>
        {children}
      </nav>
    </aside>
  )
}
