import { Link, useRouterState } from '@tanstack/react-router'
import { dashboardNavItems, isNavItemActive } from './navConfig'

/** Renders the sidebar links from navConfig and marks the active area. */
export function NavItems() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav className="sidebar-nav" aria-label="Dashboard">
      <ul className="nav-list flex flex-wrap gap-2 sm:flex-col">
        {dashboardNavItems.map((item) => {
          const isActive = isNavItemActive(item, pathname)

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={
                  isActive
                    ? 'nav-link nav-link-active block rounded-md bg-[rgba(79,184,178,0.18)] px-3 py-1.5 font-semibold no-underline'
                    : 'nav-link block rounded-md px-3 py-1.5 no-underline'
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
