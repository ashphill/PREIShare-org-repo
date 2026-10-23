# Sprint 4 Topic 2 Handoff — PREIshare Sponsor Auth & Protected Listings

**Date:** 2026-10-23  
**Author:** Ashton Phillips  
**Status:** Verified on Vercel Production (`prei-share-org-repo-one.vercel.app`) — see
`docs/security-verification-checklist.md` (all checks pass, verdict: ready for stakeholders, with
residual risks listed below).

## Client story outcomes

PREIshare asked for a dashboard where sponsors sign in, see only their own properties, and add new
ones, with secret keys kept out of the browser. What sponsors can do now:

- **Sign in and out.** Sponsors sign in with email + password at `/login` (sign up at `/auth/signup`)
  and reach the dashboard. Signing out ends access. Signed-out visitors who open any `/dashboard`
  page are sent to `/login`.
- **See only their own properties.** `/dashboard/properties` lists the signed-in sponsor's
  properties, newest first. A second sponsor sees none of the first sponsor's rows — the database
  enforces this with Row-Level Security (RLS), not just the page.
- **Add properties they own.** `/dashboard/properties/new` creates a property that is always saved
  as owned by the signed-in sponsor. Invalid input shows clear errors and never pretends to succeed.
- **Secrets stay on the server.** The browser only ever gets the public Supabase URL and anon key.
  The service-role (secret) key is read only in server code and is not in the client bundle.

## Architecture decisions (why we built it this way)

- **Auth sessions:** Supabase Auth (email + password). After sign-in, the browser hands the tokens to
  a server function that verifies them and stores them in **httpOnly cookies** (JavaScript in the
  page cannot read them). The dashboard layout (`src/routes/dashboard.tsx`) checks the session **on
  the server** before any dashboard page loads, so the check cannot be faked in the browser.
- **Data:** two tables (see `docs/data-model-and-rls-matrix.md`):
  - `profiles` — one row per sponsor, `id` = `auth.users.id` = `auth.uid()`, holds `display_name`.
  - `property_listings` — the properties table; `owner_id` (→ `auth.users.id`) is the ownership column.
- **RLS isolation:** RLS is enabled on both tables. Every policy is "own rows only"
  (`owner_id = auth.uid()` / `id = auth.uid()`), INSERT and UPDATE use `WITH CHECK` so a sponsor
  cannot write a row owned by someone else, and there are no policies for logged-out (`anon`) users.
- **Client split:** `src/lib/supabase.client.ts` (browser-safe: public URL + anon key) vs
  `src/lib/supabase.server.ts` (server-only). Sponsor reads and writes use the server client **as
  the sponsor** (anon key + their token), so RLS still applies. The service-role client exists only
  for future admin jobs and is not used anywhere.
- **Ownership comes from the session:** create flows set `owner_id` from the verified session; any
  owner id sent from the browser is ignored, and RLS would reject a mismatch anyway.
- **Env hygiene:** variable names and public/secret rules live in `.env.example` and
  `docs/env-var-checklist.md`. Real values live only in a git-ignored `.env.local` and in Vercel's
  environment settings.

## Source documents (read these first)

| Doc | Path | Purpose |
| --- | --- | --- |
| Requirements | `docs/sponsor-auth-requirements.md` | Actors, user stories, non-goals, success criteria, threat list |
| Data model & RLS | `docs/data-model-and-rls-matrix.md` | Tables, columns, ownership key, per-operation policy matrix |
| Env checklist | `docs/env-var-checklist.md` | Which variables are public vs secret, and where each is read |
| Security verification | `docs/security-verification-checklist.md` | What was tested (pass/fail), gaps fixed, residual risks, verdict |

## Key implementation files

- `src/lib/supabase.client.ts` — browser-safe Supabase client (public URL + anon key only)
- `src/lib/supabase.server.ts` — server-only clients: session-aware sponsor client (default) and an unused service-role client
- `src/lib/auth/session.ts` — server-side session helpers (httpOnly cookies, `getUser`, `requireSessionUser`, sign out)
- `src/routes/login.tsx` — sponsor login (`/login`); `src/routes/auth/signup.tsx` — sign up
- `src/routes/dashboard.tsx` — session-aware dashboard layout and guard (redirects to `/login`)
- `src/routes/dashboard/properties.tsx` — protected property list, loaded on the server under RLS
- `src/routes/dashboard/properties.new.tsx` — create property under RLS (owner from session)
- `src/lib/listings/schema.ts` — shared input validation for property fields
- `supabase/migrations/20250321000000_property_listings.sql` — `property_listings` table + RLS (applied in Supabase)
- `supabase/migrations/20250321000000_sponsors_properties_rls.sql` — `profiles` table + RLS, and re-asserted listing policies

## Known limitations

Taken from `docs/security-verification-checklist.md` (all checks passed; these are the honest leftovers):

- **Secret key not rotated.** The Supabase secret key appeared in a setup screenshot shared in a chat
  (never in the repo or the bundle). The owner chose to keep it; rotation is still recommended before
  real sponsor data is stored.
- **`profiles` migration may not be applied yet.** `20250321000000_sponsors_properties_rls.sql` was
  reviewed and tested on a local Postgres. Confirm it has been run in the Supabase project (SQL
  Editor) before relying on `profiles`. It shares a version number with the first migration, so it
  should not be applied with `supabase db push`.
- **No profile UI.** Nothing creates or shows a `profiles` row yet; the header still shows the
  "Investor (demo)" placeholder next to the real "Signed in as …" bar.
- **No edit/delete UI.** RLS update and delete policies exist, but those flows are not built or
  tested through the UI.
- **Listing fields are minimal.** No images, documents, contacts, or financial metrics.
- **No invites or multi-user sponsor accounts.** One login = one sponsor.
- **No CI secret injection or automated tests.** Verification was manual with two test accounts.
- **Other dashboard pages are still sample data.** Home, Portfolio, Deals, and Profile show labeled
  mock data; `/dashboard/listings` and `/dashboard/properties` are both live views of the same table.

## Recommended next work (next topic / sprint)

1. **Richer property fields and edit/delete.** Add an edit page and delete action on top of the
   existing owner-only RLS, plus deferred fields (images via Supabase Storage, financial metrics),
   each with a migration and matching updates to `src/lib/listings/schema.ts`.
2. **Profiles in the UI.** Create the `profiles` row on signup (database trigger recommended), show
   `display_name` in the header, and remove the demo placeholder.
3. **Sponsor invites / roles.** If several people manage one sponsor, add an organization or
   membership table and update RLS from "owner" to "member of the owning sponsor".
4. **CI secret injection.** Store Supabase values as GitHub Actions / Vercel secrets, add a build-time
   check that fails if a `VITE_` variable looks like a secret, and add a secret scan to CI.
5. **Automated RLS tests.** Script the two-sponsor test (Sponsor A cannot read or write Sponsor B's
   rows; anon gets nothing) so it runs on every change.
6. **Rotate the Supabase secret key** and update `.env.local` and Vercel.

## Handoff checklist for the next learner

- [ ] Read the four source docs above before changing auth or RLS.
- [ ] Copy `.env.example` to `.env.local` and fill in values yourself; never commit real secret values or paste them into chats or screenshots.
- [ ] Confirm `20250321000000_sponsors_properties_rls.sql` has been run in Supabase (Table Editor shows `profiles` with RLS on).
- [ ] Keep service-role usage server-only (`src/lib/supabase.server.ts`); never give it a `VITE_` prefix.
- [ ] Use `src/lib/supabase.client.ts` in browser code and wrap it in `createClientOnlyFn` inside route files (TanStack Start blocks `*.client.ts` in the server build).
- [ ] Re-run `docs/security-verification-checklist.md` after any policy, client, or env change.
