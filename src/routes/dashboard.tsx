import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div data-area="dashboard-layout" className="page-wrap px-4 pb-8 pt-10">
      <p>PREIshare investor dashboard layout (shell comes next)</p>
      {/* Child routes render here */}
      <Outlet />
    </div>
  )
}
