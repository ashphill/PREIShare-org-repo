import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../components/layout/AppShell'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell>
      {/* Child routes render here, inside the AppShell main region */}
      <Outlet />
    </AppShell>
  )
}
