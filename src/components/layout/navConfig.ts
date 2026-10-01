// Single source of truth for investor-facing nav labels, paths, and page titles.
// Wording comes from docs/investor-dashboard-brief.md.

export type DashboardPath =
  | '/dashboard'
  | '/dashboard/portfolio'
  | '/dashboard/deals'
  | '/dashboard/profile'

export type NavItemConfig = {
  label: string
  path: DashboardPath
  title: string
}

export const dashboardNavItems: NavItemConfig[] = [
  { label: 'Home', path: '/dashboard', title: 'Home overview' },
  { label: 'Portfolio', path: '/dashboard/portfolio', title: 'Your portfolio' },
  { label: 'Deals', path: '/dashboard/deals', title: 'Open deals' },
  { label: 'Profile', path: '/dashboard/profile', title: 'Your profile' },
]

/** Strip a trailing slash so "/dashboard/" and "/dashboard" match. */
function normalize(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
}

/** Home is active only on the exact dashboard index; other items match by prefix. */
export function isNavItemActive(item: NavItemConfig, pathname: string): boolean {
  const current = normalize(pathname)
  if (item.path === '/dashboard') return current === '/dashboard'
  return current === item.path || current.startsWith(`${item.path}/`)
}

export function getPageTitle(pathname: string): string {
  const match = dashboardNavItems.find((item) => isNavItemActive(item, pathname))
  return match?.title ?? 'Investor dashboard'
}
