import type { ReactNode } from 'react'
import { NavItems } from './NavItems'

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
      {/* Links, labels, and active state all come from navConfig */}
      <NavItems />
      {children}
    </aside>
  )
}
