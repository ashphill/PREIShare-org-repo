import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { getPageTitle } from './navConfig'

type HeaderProps = {
  children?: ReactNode
}

/** Top bar: page title from navConfig for the current route, plus an optional actions slot. */
export function Header({ children }: HeaderProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <header className="dashboard-header flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
      <h1 className="header-title text-2xl font-bold">{getPageTitle(pathname)}</h1>
      <div className="header-actions">{children}</div>
    </header>
  )
}
