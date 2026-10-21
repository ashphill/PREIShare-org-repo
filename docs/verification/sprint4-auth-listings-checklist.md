# Sprint 4 — Auth & Listings Verification Checklist

**Project:** PREIshare dashboard  
**Date:** 2026-10-21  
**Verifier:** Ashton Phillips  
**Environment:** local dev (`npm run dev`, localhost) + Supabase project "Preishare" (ref `dysentsvguckziflvama`, no secrets) + Vercel production (`prei-share-org-repo-one.vercel.app`)

Related docs: `docs/setup/supabase-env-checklist.md`, `docs/data-model/rls-policy-review.md`,
`docs/data-model/property-listings-schema.md`, `docs/requirements/sponsor-auth-and-listings-brief.md`.

## How to use this doc
Mark each row **PASS** or **FAIL**. Under Evidence, write what you did and what you saw.
If FAIL, note the fix prompt used and re-test before marking PASS.
No passwords, keys, or `.env` contents are recorded here.

---

## 1. Database & migration

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 1.1 | `property_listings` exists in Supabase | PASS | Ran the migration in Supabase SQL Editor (2026-10-20). Table Editor → `public.property_listings` shows the columns from the migration (`id`, `owner_id`, `title`, `summary`, `property_type`, …). |
| 1.2 | RLS is **enabled** on the listings table | PASS | Table Editor shows "4 RLS policies" on `property_listings`; migration contains `alter table public.property_listings enable row level security`. |
| 1.3 | Policies match `docs/data-model/rls-policy-review.md` (select/insert/update/delete scoped to owner) | PASS | 4 policies: `listings_select_own`, `listings_insert_own`, `listings_update_own`, `listings_delete_own`, all `owner_id = auth.uid()` for `authenticated`; no `anon` policy. Also tested the migration on a throwaway Postgres with two users: forged-owner insert and owner reassignment were rejected, anon read was denied. |
| 1.4 | Migration file present: `supabase/migrations/20250321000000_property_listings.sql` | PASS | Path confirmed in repo on `main`. |

## 2. Authentication & session

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 2.1 | Sponsor can sign up with email/password | PASS | User A: `asp9soccer@gmail.com` signed up at `/auth/signup` and landed on `/dashboard` (Supabase "Confirm email" turned off for local testing). |
| 2.2 | Sponsor can log in via `src/routes/auth/login.tsx` | PASS | Signed out, then signed back in at `/auth/login`; dashboard loaded with "Signed in as …". |
| 2.3 | Signed-out user hitting `/dashboard` (or listings) is redirected to login | PASS | Local: `/dashboard` → `/auth/login`. Production: `prei-share-org-repo-one.vercel.app/dashboard` → Sign in page. |
| 2.4 | Sign-out clears session; protected pages no longer load data | PASS | Clicked **Sign out** → `/auth/login`; visiting `/dashboard` again redirected to login. |

## 3. Listings happy path (User A)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 3.1 | Create listing via UI (title, property type, address fields per schema) succeeds | PASS | User A created a listing at `/dashboard/listings/new`; redirected to `/dashboard/listings`. Empty-title submit showed field errors without a crash. |
| 3.2 | New row visible on `src/routes/dashboard/listings/index.tsx` | PASS | Listing card appeared on `/dashboard/listings` after save. |
| 3.3 | Data matches Postgres (Supabase Table Editor), not mock arrays in the client | PASS | Table Editor → `property_listings` shows the created rows. Listings page has no mock arrays; it reads loader data from `listMyListings`. |
| 3.4 | Server path used: create/read go through `src/server/listings.ts` | PASS | Code review: `index.tsx` loader calls `listMyListings()`, `new.tsx` calls `createListing()`; both are `createServerFn` handlers using `createServerSupabaseClient(session.accessToken)` with `owner_id` set from the session. |

## 4. Row Level Security (User B)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 4.1 | Second account User B can sign up / log in | PASS | User B: `phill@gmail.com` signed up in a separate private window; header showed "Signed in as phill@gmail.com". |
| 4.2 | User B **cannot** see User A's listings in the UI | PASS | User B's `/dashboard/listings` showed the empty state "No properties yet." while User A's listing existed. |
| 4.3 | Direct read as User B shows no foreign rows | PASS | User B's list (RLS `listings_select_own` + `.eq('owner_id', user.id)` in `listMyListings`) returned zero of User A's rows. |
| 4.4 | User B can create their own listing and only see their own | PASS | User B created a listing; User A (other window) still saw only User A's listing. Table Editor shows both rows with different `owner_id`s. |

## 5. Secret-hygiene audit

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 5.1 | `.env` with real values is **not** committed | PASS | `git ls-files` lists only `.env.example`. `git check-ignore -v` → `.env` ignored by `.gitignore:6`, `.env.local` by `.gitignore:8` (`.env.*`). Real values present in local `.env.local` only. |
| 5.2 | `.env.example` has placeholder values only | PASS | Values are `your-project-ref`, `your-anon-or-publishable-key`, `your-service-role-key`. |
| 5.3 | Repo search: no service-role key material in source, docs, or history | PASS | `git grep` for `sb_secret_…`, `sb_publishable_…`, and JWT-shaped strings: 0 hits. `git log -p` for secret-shaped strings: 0 hits. `SUPABASE_SERVICE_ROLE_KEY` appears only as a name in `.env.example` and `src/lib/supabase/server.ts`. |
| 5.4 | Browser-exposed env only uses public names (`VITE_`), never service role | PASS | Only `src/lib/supabase/client.ts` reads `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Service role is read only in `server.ts` (no `VITE_` prefix), matching `docs/setup/supabase-env-checklist.md`. |
| 5.5 | Client bundle does not contain or send the service-role key | PASS | Scanned all 9 production JS files (~535 KB) on Vercel: no service-role key value. The only `sb_secret_` match is supabase-js's own prefix check (`startsWith('sb_secret_')`), not a key. |

## 6. Gaps fixed this session

| Gap | Agent fix summary | Re-test result |
|-----|-------------------|----------------|
| Sign-up showed "Failed to fetch" | `VITE_SUPABASE_URL` in local `.env.local` was still the placeholder; replaced with the real project URL and restarted the dev server. | PASS |
| Login showed "Could not verify your session (fetch failed)" | `SUPABASE_URL` was still the placeholder. Fixed the env value; `src/lib/supabase/server.ts` now falls back to the public URL and rejects the placeholder with a clear error. | PASS |
| Production had no Supabase env vars | Added the four variables in Vercel → Environments and redeployed. | PASS (`/dashboard` redirects to login on production) |
| Secret key was visible in a screenshot shared during setup (not in the repo) | Recommended rotating the Supabase secret key and updating `.env.local` + Vercel. | Not rotated: owner chose to keep the current key (accepted risk, documented in handoff). Key is still absent from repo, history, and client bundle (rows 5.1–5.5). |
| "Confirm email" off for local testing | Turned back on in Supabase Authentication → Sign In / Providers (2026-10-21). | PASS |

## 7. Sign-off

- [x] Client story covered: sponsors can log in; listings load from Postgres under RLS; secrets kept out of the client bundle
- [x] All critical rows above are PASS (one accepted risk noted in section 6)
- [x] No real secrets written into this markdown file

**Overall:** PASS  
**Notes for handoff (Step 12):**
- Supabase "Confirm email" turned back **on** (2026-10-21); confirm Site URL points to production.
- Supabase secret key was not rotated (owner's decision); rotating it before real sponsor data is stored is still recommended.
- Edit/delete listing UI is not built yet (server `updateListing` and RLS update/delete policies exist).
- Home, Portfolio, Deals, and Profile still show labeled sample data; only Listings is live.
