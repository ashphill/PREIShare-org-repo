# Sprint 3 Handoff — PREIshare Investor Dashboard Shell

## Stakeholder summary

We built a responsive investor dashboard **shell** for PREIshare members. An investor can
move between four areas (Home, Portfolio, Deals, and Profile) from one sidebar, on a
laptop or a phone. Every number, holding, deal, and profile detail on screen is **sample
data**, clearly labeled as such, so the layout can be demoed and reviewed before any real
accounts or live data are connected.

## What shipped

- TanStack Start + React + TypeScript app (package name `preishare-org-repo`)
- File-based routes under `src/routes/`:
  - `/dashboard` → `src/routes/dashboard/index.tsx` (Home overview)
  - `/dashboard/portfolio` → `src/routes/dashboard/portfolio.tsx`
  - `/dashboard/deals` → `src/routes/dashboard/deals.tsx`
  - `/dashboard/profile` → `src/routes/dashboard/profile.tsx`
  - Parent layout `src/routes/dashboard.tsx` wraps all four in the shared shell
  - Landing page `/` links in with "Open investor dashboard"
- Shared layout in `src/components/layout/`: `AppShell`, `Sidebar`, `Header`, `NavItems`,
  and `navConfig.ts` (one list of labels, paths, and page titles; active link highlighting)
- Home widgets in `src/components/dashboard/`: `StatsCard` (×3), `PortfolioSummary`, `RecentActivity`
- Area pages: `PortfolioTable`, `DealsList`, `ProfileCard`, each with sample data and,
  for the lists, an empty-state message
- Responsive + accessibility baseline in `src/styles/dashboard.css` (mobile menu below
  768px, 1→2→3 column card grid, scrolling table, visible focus outlines, 44px targets)
- Verification evidence: `docs/verification-checklist.md` (all in-scope checks Pass)

## How to run locally (cold start)

Requires Node.js 20+ and npm (this repo uses `package-lock.json`).

```bash
npm install
npm run dev
```

`npm run dev` runs `vite dev --port 3000`. Open http://localhost:3000, then click
**Open investor dashboard** or go straight to http://localhost:3000/dashboard.

Other scripts from `package.json`: `npm run build`, `npm run preview`, `npm run typecheck`.

## Short demo script (about 3 minutes)

1. Open `/` and click **Open investor dashboard**.
2. On Home, point out the three stat cards (total value, holdings, open deals), the
   portfolio summary, and recent activity. Point at the "Demo shell" note.
3. Click **Portfolio**, **Deals**, and **Profile** in the sidebar. Show that the
   highlighted link and the header title change with each page.
4. Narrow the browser to phone width. Show the ☰ menu button opening and closing the
   sidebar, and the cards stacking into one column.
5. Say plainly: every value here is a sample placeholder for Sprint 3.

## Known limitations

- **All data is fake.** Stats, holdings, deals, activity, and the profile are hard-coded
  `MOCK_*` sample constants. Nothing reflects a real account.
- **No sign-in.** There is no authentication or authorization; anyone can open `/dashboard`.
- **No database.** No Supabase, PostgreSQL, or pgvector integration exists yet.
- **No CI.** There is no GitHub Actions workflow; nothing runs automatically on pull requests.
- **Not production-hardened.** No loading or error states for real data, no custom 404 page.
- The original starter site header/footer (About and TanStack links) still appears above
  the dashboard; cleanup is pending.

## Recommended next-sprint work

1. Supabase auth, with `/dashboard/*` protected and the header/profile personalized
2. Replace mock widgets with live portfolio and deals data via route loaders or server functions
3. pgvector-powered search for deals or documents once data lives in Postgres
4. GitHub Actions CI: `npm ci`, `npm run typecheck`, and `npm run build` on every pull request
5. Loading, empty, and error states for each data widget; remove the starter header/footer

## References

- Client brief: `docs/investor-dashboard-brief.md`
- Information architecture: `docs/dashboard-ia.md`
- Component inventory: `docs/component-plan.md`
- Verification: `docs/verification-checklist.md`
- Architecture decisions: `docs/architecture-decisions.md`
