# PREIshare Investor Dashboard — Information Architecture

## Purpose
Map of the investor-facing pages for the Sprint 3 dashboard shell.
Mock data only. No sign-in, admin tools, or live Supabase data in this sprint.
Source of truth: `docs/investor-dashboard-brief.md`.

## URL map and page purposes

| URL path | Route name | Nav label | Page purpose | Primary content |
|----------|------------|-----------|--------------|-----------------|
| `/dashboard` | Dashboard home | Home | Let an investor scan portfolio value and recent activity at a glance | Stats row (total value, holdings, open deals), portfolio summary, recent activity list |
| `/dashboard/portfolio` | Portfolio | Portfolio | Review each property the investor holds | Portfolio table: property name, type, value (mock rows) |
| `/dashboard/deals` | Deals | Deals | Browse open investment opportunities | Deals list: property, asking price, status (mock rows) |
| `/dashboard/profile` | Profile | Profile | View the investor's own member details | Profile card: name and contact placeholders |

These four pages are the full scope. No other routes are planned.

## Navigation rules
- Every page shares the same shell: sidebar nav, header, and main content area.
- The header shows a page title that matches the nav label of the current page.
- The active nav item matches the current URL.
- Nav labels stay one word: Home, Portfolio, Deals, Profile.
- At phone width (about 375px), the sidebar collapses or stacks; nothing overlaps or scrolls sideways.
- All routes nest under `/dashboard` so one parent layout wraps every investor page.

## Out of scope for this shell
- Sign-in, sign-up, or any auth pages
- Live Supabase/PostgreSQL queries
- Admin or sponsor tools
- Settings, notifications, payments, or document vaults

## Notes for later route files
- Parent layout route: `dashboard`
- Child routes: index (home), `portfolio`, `deals`, `profile`