# PREIshare Dashboard — Component Architecture & Responsive Layout Map

## Purpose
Blueprint for the investor dashboard **shell** only. Implementation agents must follow
these names, regions, and responsive rules. There is no real portfolio API yet; every
widget shows clearly labeled sample data.

## Sources
- `docs/preishare-dashboard-requirements.md` (actor, goals, layout regions, must-have vs later)
- `docs/dashboard-routing-plan.md` (URLs, layout vs index, nav labels)

## Layout regions
| Region | Role | Typical components |
|--------|------|--------------------|
| Header | Top bar: current page title, menu button on small screens, account placeholder | Header |
| Sidebar | Vertical nav with PREIshare brand on tablet/desktop | Sidebar |
| Mobile nav | Menu button + slide-down nav panel on small screens | MobileNav |
| Main | Scrollable content for the active route | Route `<Outlet />` + widgets |

**AppShell is the frame.** It places Header, Sidebar/MobileNav, and Main together, and the
`/dashboard` layout route renders it once around every dashboard page.

## Component inventory

### AppShell
- **Responsibility:** Outer dashboard frame; arranges header, nav, and main.
- **Parent:** Dashboard layout route (`/dashboard`, see routing plan).
- **Children:** Header, Sidebar, MobileNav, main content slot.
- **Props:** `children` (the page content to show in main).
- **Owns:** the mobile menu's open/closed state, and closes it after navigation.

### Header
- **Responsibility:** Top bar showing the current page title and the mobile menu button.
- **Parent:** AppShell.
- **Children:** none required.
- **Props:** `title` (text, optional; defaults to the title for the current route from the nav list), `menuOpen` (yes/no), `onMenuToggle` (action to run when the menu button is tapped).

### Sidebar
- **Responsibility:** Tablet/desktop navigation: PREIshare brand plus links.
- **Parent:** AppShell.
- **Children:** nav links.
- **Props:** `items` (list of `{ label, to }` from the shared nav list), `brandLabel` (text, optional; default "PREIshare").

### MobileNav
- **Responsibility:** Small-screen navigation panel opened by the Header menu button.
- **Parent:** AppShell.
- **Children:** the same links as Sidebar.
- **Props:** `items` (same list as Sidebar), `open` (yes/no), `onClose` (action to close the panel).

### MetricCard
- **Responsibility:** One reusable metric tile: label, value, optional hint.
- **Parent:** Dashboard home (main).
- **Props:** `label` (text), `value` (text, e.g. "$300,000"), `hint` (text, optional, e.g. "Sample total").

### PortfolioSummary
- **Responsibility:** Short snapshot of total value and holdings mix.
- **Parent:** Dashboard home.
- **Props:** `totalLabel` (text), `holdings` (list of `{ name, allocation, value }` as text), `emptyMessage` (text when the list is empty).

### RecentActivity
- **Responsibility:** Short list of recent investment events.
- **Parent:** Dashboard home.
- **Props:** `items` (list of `{ id, title, detail, dateLabel }`), `emptyMessage` (text).

**Shared nav list:** one list of `{ label, to, title }` feeds Sidebar, MobileNav, and the
Header title, so labels can't drift apart. Destinations match the routing plan:
Home `/dashboard`, Portfolio `/dashboard/portfolio`, Deals `/dashboard/deals`,
Profile `/dashboard/profile`. (`/dashboard/activity` is added only when that page exists.)

## Composition (dashboard home, `/dashboard`)
1. Short "sample data" notice
2. Row/grid of 3 MetricCards: Total portfolio value, Holdings, Open deals
3. PortfolioSummary and RecentActivity, side by side on desktop, stacked on smaller screens

Empty states: PortfolioSummary and RecentActivity each show their `emptyMessage` when given
an empty list. No component fetches data; values arrive through props.

## Responsive behavior
| Viewport | Approx width | Nav behavior | Main content |
|----------|--------------|--------------|--------------|
| Mobile | < 768px | Sidebar hidden; Header shows a menu button that opens MobileNav; panel closes after picking a page | Single column; cards stack; tables scroll sideways inside their card |
| Tablet | 768px–1024px | Sidebar always visible (narrow, about 14rem); no menu button | 2-column MetricCard grid; summary and activity stacked |
| Desktop | > 1024px | Sidebar always visible beside main | 3-column MetricCard grid; summary and activity side by side |

Notes for implementers:
- Menu button and nav links are at least 44px tall so they're easy to tap.
- The menu button has a text label for screen readers and reports open/closed (`aria-expanded`).
- Every link and button shows a visible focus outline for keyboard users.
- Main content scrolls; the header must not crowd it out. No hover-only actions.

## File targets
Components should live in these files. Some already exist under another name or folder;
later steps rename or move them rather than create duplicates.

| Component | Target file | Today |
|-----------|-------------|-------|
| AppShell | `src/components/dashboard/AppShell.tsx` | exists at `src/components/layout/AppShell.tsx` |
| Header | `src/components/dashboard/Header.tsx` | exists at `src/components/layout/Header.tsx` |
| Sidebar | `src/components/dashboard/Sidebar.tsx` | exists at `src/components/layout/Sidebar.tsx` |
| MobileNav | `src/components/dashboard/MobileNav.tsx` | not yet separate; the menu currently reuses the Sidebar panel |
| MetricCard | `src/components/dashboard/MetricCard.tsx` | exists as `StatsCard.tsx` (same props) |
| PortfolioSummary | `src/components/dashboard/PortfolioSummary.tsx` | exists |
| RecentActivity | `src/components/dashboard/RecentActivity.tsx` | exists |

## Out of scope (prevent scope creep)
- Real Supabase/PostgreSQL data fetching, pgvector search, and sign-in/auth
- Chart libraries, maps, PDF export
- Routes beyond `docs/dashboard-routing-plan.md`
- Investing, payments, or editing holdings and profile
- A separate design-system package or animation-heavy UI

## Success criteria for this blueprint
- Every named component has one clear job and a known parent.
- Props are plain-language inputs (text, yes/no, list, action), never hard-coded investor data.
- Mobile, tablet, and desktop nav behavior are each spelled out.
- Home widgets match the requirements brief: metrics, portfolio snapshot, recent activity.
- Nav destinations match the routing plan exactly.
