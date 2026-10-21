# Sponsor Auth & Property Listings — Requirements Brief (Sprint 4)

## Client story (restated)
PREIshare sponsors need a secure way to sign in to the dashboard and manage
real property listings stored in PostgreSQL. Secret keys and privileged
database access must stay on the server and never ship in the browser bundle.

## Actors
| Actor | Goal |
| --- | --- |
| Sponsor | Sign up / log in with email and password, create and view only their own property listings |
| Unauthenticated visitor | Reach the public pages (`/`, `/about`) and login/signup only; cannot see any listing data |
| System (server) | Check the session on protected routes and talk to Supabase with the correct keys |

## Goals for this sprint
1. Sponsors can register and log in with Supabase Auth (email/password).
2. Dashboard routes that show listings (`/dashboard` and its child pages) require a valid session.
3. Property listings are stored in Postgres, not in mock arrays in client components.
4. A signed-in sponsor can create a listing and read the listings that belong to them.
5. Environment secrets are separated: the project URL and anon/publishable key may be client-safe;
   the service-role key and any other secrets stay server-only.

## Out of scope (defer)
- Payment processing, investor checkout, and distributions
- Document uploads and file storage
- Full admin roles, admin dashboards, and moderation tools
- Editing and deleting listings (create + read only this sprint)
- Social OAuth providers (Google, GitHub, etc.) and magic links
- Password-reset email templates and custom email branding
- Production custom domain and multi-tenant organizations
- Making Portfolio, Deals, Profile, and home widgets use real data (they stay sample data)

## Current dashboard observations
- Framework: TanStack Start + React 19 + TypeScript (strict), Vite, Tailwind v4. Deployed on Vercel.
- Routes found in `src/routes`:
  - `/` (`index.tsx`): landing page with an "Open investor dashboard" link
  - `/about` (`about.tsx`)
  - `/dashboard` layout (`dashboard/route.tsx`): wraps every dashboard page in `AppShell`
  - `/dashboard` home (`dashboard/index.tsx`)
  - `/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile`
- Listings today: mock only. `DEMO_METRICS` in `dashboard/index.tsx`, `MOCK_DEALS` in
  `DealsList.tsx`, `MOCK_PORTFOLIO_HOLDINGS` in `PortfolioTable.tsx`, and `MOCK_PROFILE` in
  `ProfileCard.tsx` are hardcoded arrays. `src/fixtures/sample-investor-listings.ts` holds typed
  sample listings that match the `InvestorListing` type in `src/types/investor-listing.ts`.
- Auth today: none. `src/lib/user.ts` has a `getUser()` that always returns `null`, and the
  dashboard `Header.tsx` shows an "Investor (demo)" placeholder. There are no login or signup
  routes, no session checks, and every dashboard route is open to anyone.
- Database today: none. No Supabase package is in `package.json`, and there is no `.env.example`.
  `.gitignore` already ignores `.env` and `*.local`.
- Gaps this sprint must close: login/signup pages, a session-aware dashboard shell,
  Postgres-backed list + create flows for listings, and env separation.

## Success criteria (how we know it worked)
- [ ] A sponsor can sign up and log in, and is redirected to `/dashboard` after logging in.
- [ ] A logged-out visitor who opens `/dashboard` (or a listings page) is sent to the login page.
- [ ] Logging out ends the session and the dashboard is no longer reachable.
- [ ] Creating a listing saves it in Postgres, and it still appears after a page refresh.
- [ ] Sponsor A cannot see Sponsor B's listings (row-level security is on and tested with two accounts).
- [ ] No service-role key or other secret appears in client code, the built browser bundle, or a committed `.env`.
- [ ] `.env.example` lists the required variable names with no real values.
- [ ] Listings shown to sponsors come from the database, not from mock arrays.

## Server-only boundary (must not ship to the browser)
- Supabase **service role** key, and any other privileged secret
- Direct Postgres connection strings or database passwords
- Any server-only env var used for admin or RLS-bypass operations
- These must never use a `VITE_` prefix, because Vite puts `VITE_` variables into the browser bundle.
- Code that uses them lives only in TanStack Start server functions or route loaders.

Client-safe (exposed by Supabase design):
- Supabase project URL
- Anon / publishable key (still limited by RLS; never treat it as a way to bypass security)

## Implementation notes for later prompts
- Prefer TanStack Start server functions and route loaders for reads and writes that need
  the user session or privileged checks.
- Reuse the existing `InvestorListing` type in `src/types` as the starting point for the listing data shape.
- The data model and RLS policies will be designed in later steps; this brief only locks the product contract.
- The later handoff should map each deliverable back to the goals and success criteria above.
