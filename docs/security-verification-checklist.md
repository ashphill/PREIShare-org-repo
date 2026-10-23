# Security verification checklist — PREIshare sponsor auth & properties

**Date:** 2026-10-23  
**Verifier:** Ashton Phillips  
**Build / branch:** `main` @ `646659d` (Vercel Production: `prei-share-org-repo-one.vercel.app`)  
**Related docs:** `docs/sponsor-auth-requirements.md`, `docs/env-var-checklist.md`, `docs/data-model-and-rls-matrix.md`

Status values: `pass` | `fail` | `not-run`

Test accounts: **Sponsor A** = `asp9soccer@gmail.com`, **Sponsor B** = `phill@gmail.com` (no passwords recorded here).

---

## 1. Environment and secret hygiene

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 1.1 | Browser-safe client (`src/lib/supabase.client.ts`) uses only public URL + anon key | Opened file; searched it for `SERVICE_ROLE`, `service_role`, `sb_secret`, `process.env` | pass | Only `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read; zero secret matches. |
| 1.2 | Service-role / secret key used only in server module (`src/lib/supabase.server.ts`) | `git grep SUPABASE_SERVICE_ROLE_KEY -- src`; searched for callers of the service-role client | pass | Read only in `supabase.server.ts` (`createServiceRoleSupabaseClient`). That function is never called anywhere in the app. No route file references it. |
| 1.3 | No raw secrets committed in source or checklist | `git grep` + full `git log -p` for `sb_secret_…` and JWT-shaped strings; `git ls-files` for env files; scanned all 10 production JS files (~537 KB) on Vercel | pass | 0 key-shaped matches in repo, history, or live bundle. Only `.env.example` is tracked; `.env` / `.env.local` ignored (`.gitignore` lines 6 and 8). No key values in this document. |
| 1.4 | `.env.example` documents required vars without real values | Compared to `docs/env-var-checklist.md` | pass | Four names match the checklist; values are placeholders (`your-project-ref`, `your-anon-key-here`, `your-service-role-key-here`). |

**Section result:** pass

---

## 2. Login and session-aware routing

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 2.1 | Unauthenticated visit to dashboard (or properties) redirects or blocks access | Logged-out browser on Production: opened `/dashboard`, `/dashboard/properties`, `/dashboard/properties/new` | pass | All three redirected to `/login` (guard in `src/routes/dashboard.tsx`, re-checked in the properties server functions). |
| 2.2 | Valid sponsor credentials reach an authenticated dashboard session | Signed in as Sponsor A via `src/routes/login.tsx` on Production | pass | Landed on `/dashboard` with "Signed in as …" shown. |
| 2.3 | Invalid credentials do not grant dashboard access | Signed in with a wrong password | pass | Red error message shown; stayed on `/login`; no dashboard access. |
| 2.4 | Logout clears session; protected routes no longer load data as that user | Clicked **Sign out**, then opened `/dashboard/properties` | pass | Redirected to `/login`; no property data shown. |

**Section result:** pass

---

## 3. Property list isolation (RLS)

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 3.1 | Signed-in sponsor sees property list UI from `src/routes/dashboard/properties.tsx` | Opened `/dashboard/properties` as Sponsor A | pass | Heading, **Add property** button, and Sponsor A's rows rendered. |
| 3.2 | List shows only rows owned by the current sponsor (per `docs/data-model-and-rls-matrix.md`) | Compared Sponsor A's list to known test rows; query has no app-side owner filter, so RLS `listings_select_own` alone decides | pass | Only Sponsor A's properties shown. |
| 3.3 | Empty state is safe (no error that leaks other tenants' data) | Opened `/dashboard/properties` as Sponsor B before B had matching rows; reviewed error branch in code | pass | Empty state "No properties yet" shown; load errors show a generic message and log details server-side only. |

**Section result:** pass

---

## 4. Property create under RLS

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 4.1 | Create form on `src/routes/dashboard/properties.new.tsx` requires an authenticated session | Opened `/dashboard/properties/new` logged out (→ `/login`) vs logged in (form shown) | pass | Server function `createProperty` also returns "You must be signed in" without a session. |
| 4.2 | Successful create inserts a row owned by the current sponsor | Submitted valid fields as Sponsor A | pass | Returned to `/dashboard/properties` with the new property listed. `owner_id` is set from the session only; the form has no owner field and any `owner_id` in the request is ignored. |
| 4.3 | Create failure (validation or RLS) does not expose secret keys or raw DB internals in the UI | Submitted with **Title** empty | pass | Field error + red alert shown; stayed on the form; no success navigation. RLS rejections map to a plain message; raw DB errors are only logged on the server. |

**Section result:** pass

---

## 5. Cross-sponsor access attempt

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 5.1 | Sponsor B cannot list Sponsor A's properties in the UI | Private window, signed in as Sponsor B, opened `/dashboard/properties` | pass | None of Sponsor A's properties appeared. |
| 5.2 | Direct read/update of another sponsor's row is denied by RLS | Ran both migrations on a test Postgres with two users; policy review against the matrix | pass | Forged-owner insert and owner reassignment rejected ("new row violates row-level security policy"); cross-user reads returned 0 rows; anon access denied. Policies: `listings_select_own`, `listings_insert_own`, `listings_update_own`, `listings_delete_own` (all `owner_id = auth.uid()`). |

**Section result:** pass

---

## 6. Gaps found and fixes applied

| Gap (checklist #) | What was wrong | Fix applied (files) | Re-test status |
|-------------------|----------------|---------------------|----------------|
| 2.1 / 2.2 (deploy) | Production build failed after splitting the Supabase clients: TanStack Start import protection blocked `*.client.ts` imports in the server (SSR) bundle | Wrapped browser-client use in `createClientOnlyFn` in `src/routes/login.tsx`, `src/routes/dashboard.tsx`, `src/routes/auth/signup.tsx` (commit `9d3e6d7`) | pass — Production deploy green; login and guard re-tested |

No security gaps were found in the checks above; the only failure was the build issue listed.

---

## 7. Residual risks (honest leftovers)

- **Supabase secret key not rotated:** the secret key appeared in a setup screenshot shared in a chat (never in the repo or bundle). The owner chose to keep it; rotating it before real sponsor data is stored is still recommended.
- **Service-role client exists but is unused:** `createServiceRoleSupabaseClient` is defined in `src/lib/supabase.server.ts` for future admin jobs. Any future use must stay in server code and be reviewed.
- **`profiles` migration:** `20250321000000_sponsors_properties_rls.sql` was reviewed and tested on a local Postgres. Confirm it has been run in the Supabase project before features depend on `profiles`. It shares a version number with the first migration, so apply it via the SQL Editor, not `supabase db push`.
- **No edit/delete UI yet:** RLS update/delete policies exist but those flows have not been exercised through the UI.
- **Testing used two accounts and the happy paths;** no automated tests or load testing.

---

## 8. Stakeholder verdict

**Ready to show stakeholders?** yes

**Summary:**
On 2026-10-23 I verified on the Production site that signed-out visitors are redirected from every dashboard and properties URL to `/login`, that a wrong password is rejected, that a valid sponsor can sign in, and that sign-out ends access. As Sponsor A I saw only my own properties, created a new property that was saved as mine, and saw a clear error (with no success) for an invalid submit. As Sponsor B in a separate window I could not see any of Sponsor A's properties, and the RLS policies rejected forged owners in a two-user database test. A review of `src/lib/supabase.client.ts` vs `src/lib/supabase.server.ts`, plus a scan of the live JS bundle, confirmed the service-role key stays out of the client. The remaining risks above (key rotation, applying the profiles migration) do not block a demo.

**Sign-off:** Ashton Phillips, 2026-10-23
