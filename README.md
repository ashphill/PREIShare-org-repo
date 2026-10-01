# PREIshare Investor Dashboard Shell

A responsive investor dashboard shell for PREIshare (Sprint 3), built with TanStack Start,
React, and TypeScript. All data shown is clearly labeled sample data.

## Prerequisites

- Node.js 20 or newer (`node -v` to check; download from https://nodejs.org)
- npm (comes with Node; this repo uses `package-lock.json`)

## Run it

1. Open a terminal in the project folder (the one that contains `package.json`).
2. Install the packages:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000 and click **Open investor dashboard** (or go to http://localhost:3000/dashboard).
5. To stop the server, press `Ctrl + C` in the terminal.

Other scripts in `package.json`: `npm run build`, `npm run preview`, `npm run typecheck`.

## Where things live

- `src/routes/` holds the pages (file-based routing).
  - `__root.tsx` wraps every page; `index.tsx` is the landing page at `/`.
  - `dashboard.tsx` is the shared dashboard layout; `dashboard/` holds Home, Portfolio, Deals, and Profile.
- `src/components/layout/` holds the shell: `AppShell`, `Sidebar`, `Header`, `NavItems`, `navConfig.ts`.
- `src/components/dashboard/` holds the widgets: `StatsCard`, `PortfolioSummary`, `RecentActivity`, `PortfolioTable`, `DealsList`, `ProfileCard`.
- `src/styles/dashboard.css` holds the responsive and accessibility rules.
- `docs/` holds the planning and handoff docs.

## Docs

- Sprint 3 handoff (what shipped, demo script, limitations): [docs/sprint3-handoff.md](docs/sprint3-handoff.md)
- Architecture decisions and next-sprint foundations: [docs/architecture-decisions.md](docs/architecture-decisions.md)
- Verification checklist: [docs/verification-checklist.md](docs/verification-checklist.md)
- Client brief, IA, and component plan: `docs/investor-dashboard-brief.md`, `docs/dashboard-ia.md`, `docs/component-plan.md`

## Not built yet

No sign-in, no live database (Supabase/PostgreSQL/pgvector), and no CI. See the handoff doc for next-sprint plans.
