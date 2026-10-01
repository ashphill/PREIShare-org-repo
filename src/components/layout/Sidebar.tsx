import type { ReactNode } from 'react'
import { NavItems } from './NavItems'

type SidebarProps = {
  id?: string
  brandLabel?: string
  children?: ReactNode
}

/** Left navigation chrome for the investor dashboard shell. */
export function Sidebar({ id, brandLabel = 'PREIshare', children }: SidebarProps) {
  return (
    <aside id={id} className="dash-sidebar dashboard-sidebar" aria-label="Investor navigation">
      <div className="sidebar-brand mb-4 text-lg font-bold">{brandLabel}</div>
      {/* Links, labels, and active state all come from navConfig */}
      <NavItems />
      {children}
    </aside>
  )
}
