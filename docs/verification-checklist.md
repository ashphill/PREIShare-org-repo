# PREIshare Investor Dashboard Shell — Verification Checklist

**Sprint:** 3 (TanStack Start UI shell)
**Verifier:** Ashton Phillips
**Date:** 2026-09-30
**Code verified:** `main` at commit `42a94c3` (Vercel production build: success)
**App URL:** http://localhost:3000 (`npm run dev`) and the Vercel deploy of `main`
**Sources of truth:** `docs/investor-dashboard-brief.md`, `docs/dashboard-ia.md`, `docs/component-plan.md`

## How to use this checklist

- **Pass** — requirement met; evidence names the file, route, or behavior checked.
- **Fail** — in-scope shell issue; fixed before handoff, with the fix noted.
- **Deferred** — intentionally out of scope for this sprint; reason given.

Evidence comes from reading each route and component against the three docs, plus a
successful production build of the same commit. Browser click-through items are marked
with what to confirm on screen.

---

## 1. Routing and information architecture

| ID | Check | Status | Evidence |
|----|-------|--------|----------|
| R1 | `/dashboard` loads dashboard home inside AppShell | Pass | `src/routes/dashboard/index.tsx` uses `createFileRoute('/dashboard/')`; `dashboard.tsx` wraps `<Outlet />` in `<AppShell>`. Header title "Home overview". |
| R2 | `/dashboard/portfolio` loads portfolio page | Pass | `dashboard/portfolio.tsx` renders `<PortfolioTable />`; header title "Your portfolio". |
| R3 | `/dashboard/deals` loads deals page | Pass | `dashboard/deals.tsx` renders `<DealsList />`; header title "Open deals". |
| R4 | `/dashboard/profile` loads profile page | Pass | `dashboard/profile.tsx` renders `<ProfileCard />`; header title "Your profile". |
| R5 | Unknown paths do not break the app | Pass | No custom not-found page; TanStack Router's default "Not Found" renders inside the root shell. Custom 404 page deferred. |
| R6 | Home page links into the shell | Pass | `src/routes/index.tsx` has `<Link to="/dashboard">Open investor dashboard</Link>`. |

**IA notes:** All four URLs, route names, and nav labels match `docs/dashboard-ia.md`. No extra dashboard routes were added.

---

## 2. Navigation labels and active states

| ID | Check | Status | Evidence |
|----|-------|--------|----------|
| N1 | Nav labels match brief/IA (Home, Portfolio, Deals, Profile) | Pass | Single source: `src/components/layout/navConfig.ts` (`dashboardNavItems`). |
| N2 | Active item highlights the current route | Pass | `isNavItemActive` in navConfig: Home matches only `/dashboard`; others match exact path or child paths. Active link gets highlight class and `aria-current="page"`. |
| N3 | Header title updates when routes change | Pass | `Header.tsx` reads the router pathname and shows `getPageTitle(pathname)` from navConfig. |
| N4 | Nav links use client routing | Pass | `NavItems.tsx` renders TanStack Router `<Link>`, not plain `<a>` reloads. |

---

## 3. Layout shell and responsiveness

| ID | Check | Status | Evidence |
|----|-------|--------|----------|
| L1 | Sidebar + header + main on desktop | Pass | `AppShell.tsx`: `.dash-shell` with `<Sidebar>`, `<Header>`, `<main class="dash-content" id="main-content">`. |
| L2 | Narrow viewport: nav still usable | Pass | `src/styles/dashboard.css` below 768px hides `.dash-sidebar` and shows `.dash-menu-toggle`; the button toggles `nav-open`; menu closes after navigating. |
| L3 | No page-wide horizontal scroll at ~375px | Pass | `.dash-main { min-width: 0 }`; portfolio table sits in `.dash-table-wrap` (`overflow-x: auto`). Confirm on screen at 375px. |
| L4 | Cards/tables stack or scroll intentionally | Pass | `.dash-card-grid` is 1 column, 2 at 640px, 3 at 1024px; home panels stack below `lg`. |
| L5 | Keyboard focus and accessible names | Pass | `:focus-visible` outline on nav/header/content links and buttons; menu button has `aria-label`, `aria-expanded`, `aria-controls="dashboard-sidebar"`; icon is `aria-hidden`; sidebar `aria-label="Investor navigation"`. 44px touch targets. |

---

## 4. Mock content clarity (demo readiness)

| ID | Check | Status | Evidence |
|----|-------|--------|----------|
| M1 | Home stats cards show labeled mock metrics | Pass | Three `StatsCard`s: Total portfolio value $300,000, Holdings 3, Open deals 4, each with a "Sample" hint; demo banner on the page. |
| M2 | Portfolio shows clear placeholder holdings | Pass | `PortfolioTable`: 3 "(sample)" rows, currency formatted, "Sample data" note, empty-state message. Home also shows `PortfolioSummary`. |
| M3 | Deals list shows open-deal placeholders | Pass | `DealsList`: 3 "(sample)" deals with location, minimum, and status badge (Open / Closing soon / Waitlist); empty-state message. |
| M4 | Profile card shows member placeholder fields | Pass | `ProfileCard`: name, email, membership, preferred contact, notes; read-only, "Sample profile" note. |
| M5 | No raw TODOs or empty panels | Pass | Search of `src/components` and `src/routes` found no TODO text; every dashboard page renders a component. |

---

## 5. Out-of-scope boundaries (must stay deferred)

| ID | Check | Status | Evidence / reason |
|----|-------|--------|-------------------|
| O1 | No real authentication / login gate | Deferred | Brief scopes this sprint to a shell; auth comes later. |
| O2 | No live Supabase/PostgreSQL data | Deferred | All data is `MOCK_*` constants; search found no `fetch(`, Supabase, or axios calls in dashboard code. |
| O3 | Production deploy not required for verification | Deferred | Local dev server is enough; Vercel build of `main` succeeded anyway. |
| O4 | No payments, document vault, or admin tools | Pass | DealsList has no invest/checkout actions; ProfileCard has no edit, password, or sign-out controls. |

---

## 6. Defects found and resolution

| Defect | Severity | Resolution | Re-check |
|--------|----------|------------|----------|
| Browser tab title still said "TanStack Start Starter" | polish | Changed the title in `src/routes/__root.tsx` to "PREIshare Investor Dashboard" | Pass |
| Starter site header/footer (About and TanStack links) still shows above the dashboard | polish | Deferred: comes from the original template in `__root.tsx`; does not block the shell demo. Clean up in a later pass. | Deferred |
| Child pages first used their own `<main>` inside AppShell's `<main>` | polish | Changed page wrappers to `<section>` so there is one main landmark | Pass |

---

## 7. Sign-off for handoff

- [x] All **blocker** fails fixed or explicitly accepted with reason (no blockers found)
- [x] Deferred items only cover agreed out-of-scope work
- [x] Shell is demoable against the PREIshare client story for Sprint 3

**Overall result:** Ready for stakeholder handoff.

**Verifier signature:** Ashton Phillips
