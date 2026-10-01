# Architecture Decisions — PREIshare Dashboard Shell (Sprint 3)

These records explain **why** the shell is built the way it is, so a future teammate knows
what to keep and where new work should plug in. Sources: `docs/investor-dashboard-brief.md`,
`docs/dashboard-ia.md`, `docs/component-plan.md`, `docs/verification-checklist.md`.

## ADR-001: TanStack Start with file-based routes

- **Context:** The brief asks for four investor areas, each with its own clear URL, and the
  stack needs room to grow into server-side data loading later.
- **Decision:** Use TanStack Start + TypeScript. Routes are files under `src/routes/`; the
  four areas live in `src/routes/dashboard/` (`index`, `portfolio`, `deals`, `profile`).
- **Consequences:** URLs match `docs/dashboard-ia.md` with no hand-written route table.
  Adding a page means adding a file. Later sprints can attach loaders or server functions to
  each route without restructuring. Note: `src/routeTree.gen.ts` is generated; don't hand-edit it.

## ADR-002: One shared AppShell layout

- **Context:** Every investor page needs the same sidebar, header, and main content area,
  and layout bugs should be fixed once, not four times.
- **Decision:** `src/routes/dashboard.tsx` is a parent layout route that renders
  `<AppShell><Outlet /></AppShell>`. `AppShell` composes `Sidebar` + `Header` + `<main>`.
- **Consequences:** Page files only contain page content. The shell (and the mobile menu
  state in `AppShell`) stays mounted while investors switch pages. Don't rebuild the shell
  inside individual pages.

## ADR-003: Central nav config as the single source of truth

- **Context:** Nav labels, paths, active states, and header titles must always agree.
- **Decision:** `src/components/layout/navConfig.ts` holds the typed list
  (label, path, title) plus `isNavItemActive` and `getPageTitle`. `NavItems` and `Header`
  both read from it. Home is active only on exact `/dashboard`; other items match by prefix.
- **Consequences:** Adding an area is one config entry plus one route file. No second
  hard-coded link list exists anywhere, so labels can't drift apart.

## ADR-004: Mock data boundary

- **Context:** Sprint 3's goal is a trustworthy UI shell, not live financial data.
- **Decision:** Each widget accepts typed props and falls back to a clearly named `MOCK_*`
  constant in its own file. Every widget shows a "sample" label. There is no fake API layer
  pretending to be production.
- **Consequences:** Next sprint replaces data by passing real props from route loaders,
  with no markup rewrite. Nobody can mistake the demo numbers for real balances.

## ADR-005: Responsive CSS + accessibility baseline

- **Context:** Investors use desktop and mobile; an unusable phone layout or invisible focus
  hurts trust and accessibility.
- **Decision:** Shared rules in `src/styles/dashboard.css` (imported by `src/styles.css`):
  sidebar collapses below 768px behind a labeled menu button (`aria-expanded`,
  `aria-controls`), card grids reflow 1→2→3 columns, tables scroll inside their card,
  `:focus-visible` outlines, and 44px touch targets.
- **Consequences:** The shell demos well at phone and desktop widths. A full accessibility
  audit is still needed before production.

## Next-sprint foundations (do not reverse casually)

| Foundation | Why it builds on this shell |
| --- | --- |
| Supabase auth | Protect `/dashboard/*` at the parent layout route; personalize `Header` and `ProfileCard` |
| Live portfolio data | Swap `MOCK_*` defaults for props supplied by route loaders or server functions (ADR-004) |
| pgvector-powered search | Add search UI to Deals (and later documents) once deal data lives in Postgres |
| GitHub Actions CI | Run `npm ci`, `npm run typecheck`, and `npm run build` on every pull request |

## Explicit non-goals for Sprint 3

- Real money movement, investing, or checkout flows
- Admin or sponsor tools
- A final visual brand system
- Production deployment hardening
