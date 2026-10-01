# PREIshare Investor Dashboard — Stakeholder Handoff

**Sprint focus:** Responsive investor dashboard shell (TanStack Start routes + React UI)
**Audience:** PREIshare product stakeholders and the next implementation topic owners
**Date:** 2026-10-01
**Prepared by:** Ashton Phillips

## 1. Demo today (what investors can click)

- Visit `/dashboard` to open the investor home base inside the app shell.
- Desktop and tablet (768px and wider): a persistent sidebar with Home, Portfolio, Deals,
  and Profile, plus a header with PREIshare branding, the current page title, and an
  "Investor (demo)" placeholder.
- Phones (below 768px): the sidebar is hidden; an **Open menu** button under the header shows
  the same four links and closes after you pick a page.
- The Home page shows:
  - Three metric cards: Total portfolio value, Holdings, Open deals (sample values)
  - A portfolio summary with three sample holdings
  - A recent activity list with four sample events
  - A "Demo shell" notice; each list also has a friendly empty-state message if it has no items
- Portfolio, Deals, and Profile each open their own sample page inside the same shell.

**Out of scope for this demo:** live Supabase data, sign-in or access control, editing
holdings or the profile, and production deployment hardening.

## 2. Requirements traceability

Criteria copied word for word from `docs/preishare-dashboard-requirements.md` §6.

| Success criterion (from requirements brief) | Status | Evidence |
| --- | --- | --- |
| Opening `/dashboard` in a browser shows the dashboard home | Met | `src/routes/dashboard/route.tsx` (layout) + `src/routes/dashboard/index.tsx` (home); loaded at http://localhost:3000/dashboard during QA |
| Header, navigation, metrics, and activity regions are all visible on desktop | Met | `AppShell`, `Header`, `Sidebar`, `MetricCard`, `RecentActivity`; `docs/responsive-qa-checklist.md` D1–D5 Pass |
| Clicking Portfolio, Deals, and Profile changes the URL, the highlighted link, and the header title | Met | `src/components/layout/navConfig.ts` + `NavItems`; QA M5: tapping Deals went to `/dashboard/deals` and the header changed to "Open deals" |
| At about 375px wide, the menu button opens the navigation and every page is still reachable | Met | `MobileNav`; `docs/responsive-qa-checklist.md` M3–M5 Pass (all four pages reached from the menu) |
| Every placeholder number or list is visibly labeled as sample data | Met | "Sample" hints on every `MetricCard`; sample-data notes in `PortfolioSummary`, `RecentActivity`, `PortfolioTable`, `DealsList`, `ProfileCard`; `MOCK_*` constants |
| Nothing from the "Later" list appears in the build | Met | No fetch/Supabase/axios calls in `src/components` or `src/routes`; no sign-in, payments, or admin pages |
| A teammate can read this brief and explain the scope in under 5 minutes | Partial | Brief is about one page with must-have vs later split; not yet timed with a real teammate |

## 3. Decisions made (so the next topic does not re-litigate them)

- **Routing:** File-based TanStack Start routes. `src/routes/dashboard/route.tsx` is the layout
  for everything under `/dashboard`; `src/routes/dashboard/index.tsx` is the home page. No
  hand-written route config (`docs/dashboard-routing-plan.md`).
- **Shell regions:** `AppShell` composes `Header`, `Sidebar`/`MobileNav`, and the main content
  slot; it lives only in the layout route, so pages never draw a second shell
  (`docs/dashboard-component-architecture.md`).
- **One nav list:** labels, paths, and header titles all come from `navConfig.ts`, so Sidebar,
  MobileNav, and Header can't drift apart.
- **Widgets:** `MetricCard`, `PortfolioSummary`, and `RecentActivity` are presentational
  components with typed props and `MOCK_*` defaults, so real data can replace the mocks later
  without rewriting the page.
- **Responsive approach:** below 768px the sidebar hides and MobileNav's menu button takes over;
  metric cards go 1 → 2 → 3 columns (640px, 1024px); tables scroll inside their card
  (`docs/responsive-qa-checklist.md`).

## 4. Known limitations (honest baseline)

- **Sample data only:** every metric, holding, deal, activity row, and the profile are
  hard-coded placeholders, not PostgreSQL/Supabase.
- **No sign-in:** anyone can open `/dashboard`; there is no session, role, or access check.
- **Read-only:** no forms save anything.
- **Deploys are failing:** Vercel production builds have failed since about 12:04 MDT on
  2026-10-01, starting on a docs-only commit. The live site still shows the last good build;
  the cause is still being diagnosed.
- **QA residual items** (from `docs/responsive-qa-checklist.md`): the original starter site
  header (TanStack Start, Home/About/Docs) still shows above the dashboard; the TanStack
  devtools badge appears in dev mode only.

## 5. Recommended next sprint work

1. Fix the failing Vercel build and confirm `/dashboard` loads on the Production URL.
2. Add Supabase auth and protect the `/dashboard` layout route for signed-in investors only.
3. Read real portfolio, deals, and activity data through route loaders or server functions,
   passing it into the existing widget props.
4. Remove the starter site header/footer and the leftover `/about` page.
5. Re-run `docs/responsive-qa-checklist.md` with real content lengths (long property names,
   empty vs full lists).

## 6. Artifact index (for handoff package)

- Requirements: `docs/preishare-dashboard-requirements.md`
- Routing plan: `docs/dashboard-routing-plan.md`
- Component architecture: `docs/dashboard-component-architecture.md`
- Responsive QA: `docs/responsive-qa-checklist.md`
- Routes: `src/routes/dashboard/route.tsx`, `src/routes/dashboard/index.tsx`
- Components: `src/components/dashboard/` (AppShell, Header, Sidebar, MobileNav, MetricCard,
  PortfolioSummary, RecentActivity) and `src/components/layout/navConfig.ts`
