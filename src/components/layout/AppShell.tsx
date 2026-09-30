import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

type AppShellProps = {
  title?: string
  children: ReactNode
}

/**
 * Shared investor chrome: sidebar + header + main content region.
 * Child routes render inside `children` (wired from the dashboard layout route).
 */
export function AppShell({ title = 'Investor Dashboard', children }: AppShellProps) {
  return (
    <div className="app-shell flex min-h-[70vh] flex-col sm:flex-row">
      <Sidebar />
      <div className="app-shell-main-column flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="app-shell-content flex-1 p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
