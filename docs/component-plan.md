# PREIshare Investor Dashboard — Component Inventory

## Scope
Reusable UI pieces for a responsive dashboard shell with **mock data only**.
Components show structure and labeled placeholder content; none of them call real APIs.
Mock data should use existing types from `src/types/index.ts` where a matching type exists.

## Layout components (shared chrome)

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `AppShell` | Frames every dashboard page by combining Sidebar, Header, and the main content area | All four `/dashboard` pages | Render page-specific widgets or hold mock data |
| `Sidebar` | Shows branding and renders the nav links from `navConfig` | AppShell | Define its own list of links or show page titles |
| `Header` | Shows the current page title and a placeholder user area | AppShell | Define or render the nav list |
| `navConfig` | Single list of nav labels and paths (Home, Portfolio, Deals, Profile) | Sidebar | Render any UI itself |

## Dashboard home widgets

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `StatsCard` | Shows one metric: a label, a value, and a "Mock data" tag | Dashboard home | Fetch data or control page layout |
| `PortfolioSummary` | Short snapshot of total portfolio value and holdings mix | Dashboard home | List every holding (that's PortfolioTable's job) |
| `RecentActivity` | Short list of recent mock events | Dashboard home | Link to pages outside the four in scope |

## Page-level shells

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `PortfolioTable` | Table of mock holdings: property name, type, value | Portfolio page | Pull live market or database data |
| `DealsList` | List of mock open deals: property, asking price, status | Deals page | Offer invest, checkout, or subscribe actions |
| `ProfileCard` | Mock investor name and contact placeholders | Profile page | Offer password change, sign-out, or any auth action |

## Composition rules
1. One job per component. If two rows describe the same job, please merge or delete one.
2. Nav labels and paths live only in `navConfig`.
3. Layout components wrap pages; page widgets never rebuild the shell.
4. Every mock value on screen is visibly labeled as mock.
5. Names above are locked for later prompts. Don't rename without updating both docs.

## Mapping check (IA ↔ components)
- Home (`/dashboard`) → StatsCard ×3, PortfolioSummary, RecentActivity inside AppShell
- Portfolio (`/dashboard/portfolio`) → PortfolioTable inside AppShell
- Deals (`/dashboard/deals`) → DealsList inside AppShell
- Profile (`/dashboard/profile`) → ProfileCard inside AppShell
- Every page has at least one component, and every component is used on at least one page.