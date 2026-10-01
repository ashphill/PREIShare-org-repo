import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { getPageTitle } from '../layout/navConfig'

type HeaderProps = {
  /** Optional actions shown on the right, before the user placeholder */
  children?: ReactNode
}

/**
 * Top bar: PREIshare branding, page title from navConfig, optional actions slot,
 * and a demo investor placeholder (no real auth). The phone menu lives in MobileNav.
 */
export function Header({ children }: HeaderProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <header className="dash-header dashboard-header justify-between">
      <div className="header-brand flex min-w-0 flex-1 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--sea-ink)] text-sm font-semibold text-white"
          aria-hidden="true"
        >
          P
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-wide text-[var(--sea-ink-soft)]">PREIshare</p>
          <h1 className="header-title truncate text-2xl font-bold">{getPageTitle(pathname)}</h1>
        </div>
      </div>
      <div className="header-actions flex items-center gap-3">
        {children}
        {/* Demo placeholder only: there is no sign-in yet, so this is not a real user session. */}
        <div
          className="header-user flex items-center gap-2 rounded-full border border-[var(--line)] px-2 py-1"
          aria-label="Investor placeholder (demo, not signed in)"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(79,184,178,0.18)] text-xs font-semibold" aria-hidden="true">
            IN
          </span>
          <span className="hidden text-sm sm:inline">Investor (demo)</span>
        </div>
      </div>
    </header>
  )
}
