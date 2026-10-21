# PREIshare Sponsor Auth & Property Listings — Security Requirements

> Security contract for sponsor sign-in and property listings. Later steps (env separation,
> RLS policies, login/dashboard routes, list/create flows, and the security verification
> checklist) are checked against this file.
> Related: `docs/requirements/sponsor-auth-and-listings-brief.md`,
> `docs/data-model/property-listings-schema.md`, `docs/setup/supabase-env-checklist.md`.
> This file contains **no real keys, passwords, or connection strings** — names and purposes only.

## 1. Context

PREIshare sponsors need a dashboard where they can sign in, see the property listings they own, and
add new properties. Listings live in PostgreSQL through Supabase (table `public.property_listings`,
owned by `owner_id`). The app is TanStack Start + React + TypeScript, deployed on Vercel.

The core security promise in plain words:
- Only a signed-in sponsor can open the dashboard.
- A sponsor only ever sees and changes **their own** listings.
- Secret keys stay on the server. The browser only gets public, safe values.

## 2. Actors

| Actor | Description | Signed in? |
| --- | --- | --- |
| Anonymous visitor | Anyone not logged in (including someone who copied a dashboard link) | No |
| Sponsor | A partner who creates and manages their own property listings | Yes (sponsor account, email + password) |
| Admin | Internal operator who could see or moderate every sponsor | **Out of scope** this topic |
| System (server) | TanStack Start server functions and loaders that check the session and talk to Supabase | N/A (acts for the signed-in sponsor) |

## 3. User stories (in scope)

1. As a **sponsor**, I can sign up and sign in with my email and password so the app knows who I am.
2. As a **sponsor**, after signing in I land on `/dashboard` and can open `/dashboard/listings`.
3. As a **sponsor**, I see a list of **only my** properties, newest first. With none, I see a clear
   "No properties yet" message.
4. As a **sponsor**, I can create a new property, and it is saved as owned by **my** account — I
   cannot choose a different owner.
5. As a **sponsor**, I can sign out, and afterwards the dashboard no longer opens until I sign in again.
6. As an **anonymous visitor**, I can reach `/auth/login` and `/auth/signup`, but opening any
   `/dashboard` page sends me to `/auth/login`, and I cannot read or change any listing.

## 4. Non-goals (out of scope this topic)

- **Public (anonymous) write access:** anonymous users can never create, update, or delete properties.
- **Public read access:** no "browse all published listings" page for logged-out visitors.
- **Admin features:** no admin console, admin role, or cross-sponsor moderation UI.
- **Service-role key in the browser:** the Supabase service-role (secret) key never goes into any
  client/browser code, any `VITE_` variable, any git commit, or any screenshot.
- Password-reset screens, branded email templates, OAuth/social login, magic links, and
  multi-factor auth.
- Edit and delete screens for listings (owner-only rules must still exist in the database).
- Images, document uploads, payments, and multi-sponsor organizations.

## 5. Success criteria

Each item is something you can pass or fail in a browser or the Supabase dashboard.

- [ ] A sponsor can sign up, sign in, and lands on `/dashboard` (a protected route).
- [ ] Signed out, opening `/dashboard` or `/dashboard/listings` redirects to `/auth/login`.
- [ ] After **Sign out**, opening `/dashboard` redirects to `/auth/login` again.
- [ ] Sponsor A's listings page shows only rows where `owner_id` is Sponsor A; Sponsor B (in a
      separate private window) sees none of Sponsor A's rows.
- [ ] A new property saved by Sponsor A has `owner_id` = Sponsor A's user id in the Supabase
      Table Editor, even if the request body tried to send another `owner_id`.
- [ ] Row-Level Security is **enabled** on `property_listings` with owner-only policies for
      SELECT, INSERT, UPDATE, and DELETE; there is no policy for anonymous users.
- [ ] Browser code reads only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; a search of `src/`
      and the production JS bundle finds no service-role key value.
- [ ] `.env.local` / `.env` are ignored by git; only `.env.example` (placeholders) is committed.

## 6. Simple threat list

| Threat | What goes wrong | Requirement to mitigate |
| --- | --- | --- |
| Stolen or reused session | An attacker acts as the sponsor | Session checked **on the server** for every `/dashboard` route and every listing server function. Session tokens live in httpOnly cookies that browser JavaScript cannot read. Sign out clears the cookies. |
| Guessing another sponsor's property id | An attacker reads or edits someone else's listing by id | RLS policies require `owner_id = auth.uid()` on every operation, and server queries also filter by the session user's id. Knowing an id is not enough. "Not found" and "not yours" return the same message. |
| Forged owner on create/update | A sponsor creates a row "owned" by someone else, or reassigns ownership | The server sets `owner_id` from the session only and ignores any `owner_id` in the request. RLS `WITH CHECK (owner_id = auth.uid())` on INSERT and UPDATE rejects mismatches. |
| Leaked service-role key | An attacker bypasses RLS with full database access | Service-role key only in server-only env vars (no `VITE_` prefix), never in client code, commits, chats, or screenshots. If it leaks, rotate it in Supabase and update local env and Vercel. |
| "Security by hiding buttons" | The UI hides controls but the API still allows the action | Rules are enforced in Postgres RLS and server functions, not only in React components. |
| Anonymous direct API call | Someone calls the Supabase API with the public anon key and no login | No `anon` policies on `property_listings`, so anonymous requests get no rows and cannot write. |

## 7. Environment & secret hygiene notes (requirements only)

| Variable | Public or secret | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Public (safe in browser) | Supabase project URL for the browser client |
| `VITE_SUPABASE_ANON_KEY` | Public (safe in browser, limited by RLS) | Browser sign-in/sign-up and user-scoped requests |
| `SUPABASE_URL` | Server-side name (value not secret) | Project URL for server code |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret — server only** | Bypasses RLS; admin/maintenance jobs only, never for normal sponsor requests |

- The `VITE_` prefix means Vite copies the value into the browser bundle, so only public values may use it.
- Real values live in a local, git-ignored `.env.local` and in Vercel's environment settings.
- `.env.example` is committed with placeholder values only.
- This file lists names and purposes only — **never** real key values.

## 8. Open questions for the team

- **Login method:** default for this sprint is **email + password** (Supabase Auth). Magic links or
  social login would be a later decision.
- **Sponsor profile table:** assumption for now — **no separate `sponsors` table**; a sponsor is a
  Supabase `auth.users` account and listings point to it with `owner_id`. Revisit if sponsors need
  company names, roles, or approval status.
- **Email confirmation:** should new sponsors confirm their email before signing in? (Recommended
  on for production.)
- **Future investor access:** if investors should later see `published` listings, which new read
  policy allows that without exposing drafts?
- **Admin role:** when admins are added, how are they identified, and which actions can they take?

## 9. How later steps use this brief

This file is the contract for:
- **Env separation** — section 7 variable names and public vs secret rules.
- **RLS policy design** — sections 5 and 6 owner-only rules and "no anon policies".
- **Login and dashboard routes** — stories 1, 2, 5, 6 and the redirect criteria.
- **Property list/create flows** — stories 3 and 4 and the forged-owner threat.
- **End-to-end security verification** — every checkbox in section 5 becomes a PASS/FAIL row.
