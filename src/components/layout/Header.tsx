import type { ReactNode } from 'react'

type HeaderProps = {
  title?: string
  children?: ReactNode
}

/** Top bar: page title plus an optional actions / user slot. */
export function Header({ title = 'Investor Dashboard', children }: HeaderProps) {
  return (
    <header className="dashboard-header flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
      <h1 className="header-title text-2xl font-bold">{title}</h1>
      <div className="header-actions">{children}</div>
    </header>
  )
}
