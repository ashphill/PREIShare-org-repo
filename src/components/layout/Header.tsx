import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { getPageTitle } from './navConfig'

type HeaderProps = {
  navOpen: boolean
  sidebarId: string
  onToggleNav: () => void
  children?: ReactNode
}

/**
 * Top bar: mobile menu toggle, page title from navConfig, optional actions slot.
 * Below 768px the .dash-menu-toggle button (styled in src/styles/dashboard.css)
 * opens and closes the sidebar; aria-expanded and aria-controls describe that state.
 */
export function Header({ navOpen, sidebarId, onToggleNav, children }: HeaderProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <header className="dash-header dashboard-header justify-between">
      <button
        type="button"
        className="dash-menu-toggle"
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={navOpen}
        aria-controls={sidebarId}
        onClick={onToggleNav}
      >
        <span aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
      </button>
      <h1 className="header-title flex-1 text-2xl font-bold">{getPageTitle(pathname)}</h1>
      <div className="header-actions">{children}</div>
    </header>
  )
}
