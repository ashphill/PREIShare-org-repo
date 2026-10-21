# Sprint 4 Handoff — Sponsor Auth & Postgres Property Listings

**Project:** PREIshare dashboard  
**Sprint:** 4 (Topic 1) — Supabase auth & database  
**Audience:** PREIshare sponsors and the next-sprint implementer  
**Status date:** 2026-10-21  
**Overall verification:** PASS (see `docs/verification/sprint4-auth-listings-checklist.md`)

## 1. Client story recap

PREIshare sponsors need a secure way to sign in to the dashboard and manage **real** property
listings stored in PostgreSQL, not mock data in the browser. Secret keys and privileged database
access must stay on the server and never ship in the browser bundle.

## 2. Delivered vs original request

| Client need | Delivered? | Where / evidence |
| --- | --- | --- |
| Secure sponsor login | **Yes** | Sign up at `/auth/signup`, sign in at `/auth/login`, sign out from the dashboard. Every `/dashboard/*` page is protected by a server-side session check in `src/routes/dashboard/route.tsx` using `src/lib/auth/session.ts`. Checklist rows 2.1–2.4 PASS, including production redirect. |
| Postgres-backed listings (create / read / display) | **Yes** (create + read) | `/dashboard/listings` and `/dashboard/listings/new` call server functions in `src/server/listings.ts`, which read and write `public.property_listings`. Checklist rows 3.1–3.4 PASS; rows confirmed in the Supabase Table Editor. |
| Row-level security so sponsors only see their own rows | **Yes** | `supabase/migrations/20250321000000_property_listings.sql` enables RLS with four owner-only policies (`owner_id = auth.uid()`). Two-account test: User B could not see User A's listing, and each user only saw their own. Checklist rows 1.2–1.3 and 4.1–4.4 PASS. |
| Secrets kept out of the client bundle | **Yes** | `.env.example` has placeholders only; real values live in an ignored `.env.local` and Vercel env settings. The service-role key is read only in `src/lib/supabase/server.ts` with no `VITE_` prefix. Repo, git history, and the production JS bundle contain no key values. Checklist rows 5.1–5.5 PASS. |

**Gaps:** everything the brief put in scope passed verification. Supabase "Confirm email" was
switched off for local testing and has been turned back on (2026-10-21). One accepted risk remains:
the Supabase secret key appeared in a setup screenshot shared in a chat (never in the repo), and the
team chose to keep the current key for now (see Known limitations). Listing **update** exists as a server function only (no edit screen), and
there is no delete screen. Both were out of scope in the brief (create + read only).

## 3. Architecture decisions

- **Auth:** Supabase Auth with email + password. The browser signs in with the public client, then
  hands the tokens to a server function (`setSession`) that verifies them with Supabase and stores
  them in **httpOnly cookies**. The dashboard's `beforeLoad` calls `getUser` on the server, so the
  login check cannot be faked from the browser.
- **Data:** one PostgreSQL table, `public.property_listings`, per
  `docs/data-model/property-listings-schema.md`. Key columns: `id` (uuid PK), `owner_id`
  (uuid → `auth.users`, `ON DELETE CASCADE`), `title`, `summary`, `property_type`, address fields,
  `asking_price`, `currency`, `status` (`draft`, `published`, `under_offer`, `sold`, `archived`),
  `created_at`, `updated_at` (kept current by a trigger). Schema changes go through migration files.
- **Authorization:** RLS is the final guard. Policies `listings_select_own`, `listings_insert_own`,
  `listings_update_own`, `listings_delete_own` allow only `owner_id = auth.uid()` for signed-in
  users; logged-out (`anon`) users have no access. Server code also filters by `owner_id` and always
  sets `owner_id` from the session, never from the form.
- **Clients:**
  - `src/lib/supabase/client.ts`: browser client. Public URL + anon key only; used for sign in,
    sign up and sign out.
  - `src/lib/supabase/server.ts`: server-only. `createServerSupabaseClient(token)` acts **as the
    signed-in sponsor** (anon key + their token, so RLS applies) and is used for all listing reads
    and writes. `createServiceRoleSupabaseClient()` bypasses RLS and is reserved for admin jobs; no
    feature uses it today.
- **Validation:** `src/lib/listings/schema.ts` validates listing input on both the form and the
  server, returning field-by-field errors instead of crashing.
- **Env hygiene** (from `docs/setup/supabase-env-checklist.md`):

  | Variable | Public or server-only |
  | --- | --- |
  | `VITE_SUPABASE_URL` | Public (browser-safe) |
  | `VITE_SUPABASE_ANON_KEY` | Public (browser-safe, limited by RLS) |
  | `SUPABASE_URL` | Server-side name (value not secret) |
  | `SUPABASE_SERVICE_ROLE_KEY` | **Server-only secret.** Never `VITE_`, never in browser code, never committed |

## 4. How to run locally

1. **Get the code:** clone or pull the repo, then run `npm install` in the repo root.
2. **Create your env file:** `cp .env.example .env.local`, then fill in the four values from
   Supabase → Project Settings → API Keys (steps in `docs/setup/supabase-env-checklist.md`).
   Paste real values yourself. Never commit `.env.local` or share it in chat or screenshots.
3. **Database:** if setting up a new Supabase project, run
   `supabase/migrations/20250321000000_property_listings.sql` in the Supabase SQL Editor, then check
   Table Editor → `property_listings` shows RLS enabled with 4 policies
   (see `docs/data-model/rls-policy-review.md`).
4. **Start the app:** `npm run dev`, then open the address it prints (usually
   `http://localhost:3000`). Restart the dev server after any `.env.local` change.
5. **Try it:** sign up at `/auth/signup` → open **Listings** → **Add listing** → save → the listing
   appears on `/dashboard/listings` and in the Supabase Table Editor.
6. **Deploy (Vercel):** the same four variables must exist in Vercel → Environments; redeploy after
   changing them.

## 5. Known limitations

- **Email confirmation:** "Confirm email" is back **on** (2026-10-21). New sponsors must click the
  emailed link before signing in. Check that Authentication → URL Configuration → Site URL points to
  the production URL so the link opens the live site.
- **Secret key not rotated (accepted risk):** the Supabase secret (service-role) key was visible in
  a setup screenshot shared in a chat; it was never committed to the repo or shipped to the browser.
  The team decided to keep the current key for now. Recommendation: rotate it in Supabase
  (Project Settings → API Keys), update `.env.local` and Vercel, and revoke the old key before real
  sponsor data is stored.
- **No edit or delete screens:** `updateListing` exists on the server and RLS allows owner-only
  update and delete, but there is no edit or delete UI.
- **Minimal listing fields:** no images, documents, contacts, IRR / cap-rate metrics, or
  `closedAt`. These were deferred in the schema doc.
- **Auth extras not built:** no password reset screen, no branded email templates, no social login.
- **Rest of the dashboard is still sample data:** Home, Portfolio, Deals and Profile show labeled
  mock data. Only Listings is live. The header still shows the "Investor (demo)" placeholder next to
  the real "Signed in as …" bar.
- **No admin role:** nobody can see across sponsors; there is no public "browse published listings"
  page.

## 6. Recommended next-sprint work (pick with stakeholders)

All three options build on the current Supabase Auth session, the `property_listings` table, and
its owner-only RLS. None of them should move the service-role key into the browser or loosen RLS.

1. **Richer listing fields + edit/delete.** Add an edit screen wired to the existing
   `updateListing` server function and a delete action under the existing `listings_delete_own`
   policy. Then add deferred fields (financial metrics, contacts, images via Supabase Storage) with
   new migrations and matching updates to `src/lib/listings/schema.ts`.
   *Depends on:* current schema, validation, and owner-only RLS.
2. **Approvals workflow.** Use the existing `status` column for draft → submitted → approved /
   rejected, with rules for who may change each state. This needs a reviewer role (for example a
   `profiles` table with `role`) and new RLS policies so reviewers can read submitted listings
   while sponsors still only edit their own.
   *Depends on:* Supabase Auth identities and per-row ownership; adds roles on top.
3. **pgvector search.** Enable the `pgvector` extension, store an embedding per listing (from
   `title` + `summary`), and add a server function for similarity search. Embedding API keys stay
   server-only like the service-role key, and search results still go through RLS.
   *Depends on:* stable listing CRUD and enough real listing data.

## 7. Open questions for stakeholders

- Who may create listings and who may only view them? Will investors get read access to
  `published` listings, and if so, through which new policy?
- Is multi-sponsor organization sharing needed, or does one sponsor = one owner remain correct?
- Who approves listings, if anyone? (This decides whether option 2 is next.)
- Should `asking_price` be required before a listing can be `published`?
- When delete is added: hard delete, or soft delete with `deleted_at`?
- Preferred next theme: richer fields, approvals, or search?

## 8. Source artifacts

- `docs/requirements/sponsor-auth-and-listings-brief.md`
- `docs/verification/sprint4-auth-listings-checklist.md`
- `docs/data-model/property-listings-schema.md`
- `docs/setup/supabase-env-checklist.md`

Supporting: `docs/data-model/rls-policy-review.md`,
`supabase/migrations/20250321000000_property_listings.sql`, `.env.example`.
