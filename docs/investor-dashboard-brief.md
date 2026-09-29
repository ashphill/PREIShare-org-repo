# PREIshare Investor Dashboard — Client Brief (Sprint 3 Shell)

## Product summary
PREIshare turns raw property and market data into insights investors can act on.
This sprint builds the investor dashboard **shell only**: a layout where an investor
can scan their portfolio value, browse open deals, and review their profile without
digging through cluttered pages. We deliver responsive layout, file-based routes,
and reusable placeholder UI with mock data. No live backend data and no sign-in.

## Primary actors
| Actor | Role in this sprint | In scope to build? |
|-------|---------------------|--------------------|
| Investor (member) | Opens the dashboard to check portfolio value, open deals, and their profile | Yes — the only user we build for |
| Future admin | May manage deals and investors in a later sprint | No — noted as a future actor only |

## Investor goals
1. Land on a home overview and see a portfolio snapshot and recent activity (mock) at a glance.
2. Move between Portfolio, Deals, and Profile without leaving the app shell.
3. Trust what they see: clear page titles, consistent navigation, readable on phone and desktop.

## Must-have dashboard areas (this sprint)
| Area | Route idea | What the investor sees |
|------|-----------|------------------------|
| Home overview | `/dashboard` | Summary stat cards (total value, number of holdings, open deals), recent activity list — all mock |
| Portfolio | `/dashboard/portfolio` | Table or list of holdings (property name, type, value) — mock |
| Deals | `/dashboard/deals` | List of open deals (property, asking price, status) — mock |
| Profile | `/dashboard/profile` | Profile card with name and contact placeholders |

These four areas are the entire scope. No other pages are in scope.

## Success criteria (demo-ready shell)
- [ ] From the home page, the investor can reach Home, Portfolio, Deals, and Profile through persistent navigation.
- [ ] Each of the four areas has its own route and a visible page title matching its name.
- [ ] Every page shows the same shell: navigation (sidebar or equivalent), header, and main content area.
- [ ] At phone width, navigation collapses or stacks and no content overlaps or scrolls sideways.
- [ ] All placeholder numbers and lists are visibly labeled as mock data.
- [ ] No page or link exists outside the four areas listed above.

## Out of scope (explicit non-goals for this sprint)
- Sign-in, authentication, or authorization
- Live Supabase/PostgreSQL portfolio or deals data
- Payments, subscriptions, or document e-signing
- Admin tools for managing investors or deals
- Production hardening or CI beyond the existing project setup

## Prompting notes for later AI steps
When prompting a coding-agent, attach this brief and require: TypeScript, TanStack Start
file-based routes, reusable React components, mock data only, and no auth. Reuse the
existing types in `src/types/index.ts` for any listing or deal data instead of inventing
new shapes. Reject any output that adds pages or features listed under Out of scope.

## Open questions / assumptions
- UI copy is in English.
- One investor persona viewing only their own data (no multi-portfolio switcher yet).
- Visual style should look simple and professional; a full brand system isn't required this sprint.