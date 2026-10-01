import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Sidebar } from '../layout/Sidebar'
import { Header } from './Header'

type AppShellProps = {
  children: ReactNode
}

const SIDEBAR_ID = 'dashboard-sidebar'

/**
 * Shared investor chrome: sidebar + header + main content region.
 * Child routes render inside `children` (wired from the dashboard layout route).
 * On narrow screens the sidebar collapses; the header button toggles it open.
 */
export function AppShell({ children }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  // Close the mobile menu after navigating to a new page
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className={navOpen ? 'dash-shell nav-open' : 'dash-shell'}>
      <Sidebar id={SIDEBAR_ID} />
      <div className="dash-main">
        <Header
          navOpen={navOpen}
          sidebarId={SIDEBAR_ID}
          onToggleNav={() => setNavOpen((open) => !open)}
        />
        <main className="dash-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
