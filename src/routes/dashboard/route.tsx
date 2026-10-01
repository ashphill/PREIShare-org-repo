// Layout route for everything under /dashboard (folder form: dashboard/route.tsx).
// Child pages like dashboard/index.tsx render inside the <Outlet /> below.
// AppShell (header, sidebar, mobile nav) lives only here, never in child pages,
// so the dashboard home never shows doubled chrome.
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../../components/dashboard/AppShell'

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
