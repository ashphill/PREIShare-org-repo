import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

type AppShellProps = {
  children: ReactNode
}

/**
 * Shared investor chrome: Sidebar (768px+), Header, MobileNav (phones), and the
 * main content region. Child routes render inside `children` (the layout route's Outlet).
 */
export function AppShell({ children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  // Close the mobile menu after navigating to a new page
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="dash-shell">
      <Sidebar />
      <div className="dash-main">
        <Header />
        <MobileNav open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />
        <main className="dash-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
