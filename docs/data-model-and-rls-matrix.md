# PREIshare — Data model and RLS policy matrix

## Purpose
Design-only blueprint for sponsor auth and property listings (no SQL here).
Step 6 migrations must follow this document; do not invent extra tables or open policies without
updating this file first.

**Starting point:** the project already has `public.property_listings` with RLS
(`supabase/migrations/20250321000000_property_listings.sql`, reviewed in
`docs/data-model/rls-policy-review.md`). This matrix **keeps that table as the properties entity**
(no rename, so existing code in `src/server/listings.ts` keeps working) and adds one new table,
`profiles`, to link a Supabase Auth user to sponsor display data.

## Source requirements
Consumed from: `docs/sponsor-auth-requirements.md`
Also aligned with: `docs/data-model/property-listings-schema.md`, `docs/env-var-checklist.md`

## Actors and identities

| Actor | How identity is established | Notes |
|-------|----------------------------|-------|
| Anonymous visitor | No Supabase session (`anon` role) | Must not read or write `profiles` or `property_listings` |
| Sponsor (authenticated) | Supabase Auth user (email + password); `auth.uid()` is their user id | May read and manage only rows they own |
| Service role / server admin tasks | Secret `SUPABASE_SERVICE_ROLE_KEY`, server only | Bypasses RLS. Never used from the browser or for normal sponsor requests |

## Tables

### `auth.users` (managed by Supabase Auth)
Not created by us. Holds the sponsor's login (email, hashed password). Its `id` is the value
`auth.uid()` returns for the signed-in sponsor.

### `profiles` (sponsor linkage) — **new in Step 6**
Links a Supabase Auth user to sponsor display data. One row per sponsor.

| Column | Type (intent) | Required | Notes |
|--------|---------------|----------|-------|
| id | uuid (PK, FK → `auth.users.id`, on delete cascade) | yes | Same value as `auth.uid()` for that sponsor |
| display_name | text | yes | Shown in the dashboard header instead of the "Investor (demo)" placeholder; 1–120 characters |
| created_at | timestamptz | yes | Default `now()` |
| updated_at | timestamptz | yes | Default `now()`; bumped on update |

### `property_listings` (properties owned by a sponsor) — **already exists**

| Column | Type (intent) | Required | Notes |
|--------|---------------|----------|-------|
| id | uuid (PK) | yes | Default `gen_random_uuid()` |
| owner_id | uuid (FK → `auth.users.id`, on delete cascade) | yes | **RLS hinge column** — must equal `auth.uid()` for every owner policy. Set by the server from the session, never from the form |
| title | text | yes | Listing title (card heading) |
| summary | text | no | Longer description |
| property_type | text | yes | One of `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` (CHECK) |
| address_line1 | text | yes | Street address |
| address_line2 | text | no | Unit / suite |
| city | text | yes | Shown on the card |
| region | text | yes | State / province |
| postal_code | text | yes | |
| country | text | yes | Default `'US'` |
| asking_price | numeric(12,2) | no | `>= 0` (CHECK); may be empty while `draft` |
| currency | text | yes | Default `'USD'` |
| status | text | yes | Default `draft`; one of `draft`, `published`, `under_offer`, `sold`, `archived` (CHECK) |
| created_at | timestamptz | yes | Default `now()`; list is ordered newest first |
| updated_at | timestamptz | yes | Default `now()`; bumped by trigger on update |

Relationship: one sponsor (`auth.users` / `profiles`) → many `property_listings` via `owner_id`.
`owner_id` points at `auth.users.id` (already true today), which is the same id as `profiles.id`.

## RLS posture
- RLS is **enabled** on `property_listings` today and must be enabled on `profiles` in the same
  migration that creates it, before any app code reads it.
- No broad `USING (true)` policy for the `authenticated` role on either table.
- No policies at all for the `anon` role, and no table privileges granted to `anon`.
- Browser code uses only the public URL + anon key (`src/lib/supabase/client.ts`). Server code
  queries **as the signed-in sponsor** (anon key + their token) so RLS still applies. The
  service-role key is never used for sponsor requests.

## RLS policy matrix

| Table | Operation | Who | Rule (plain English) | Intended rule shape (for Step 6) | Status |
|-------|-----------|-----|----------------------|----------------------------------|--------|
| profiles | SELECT | Authenticated sponsor | Can read **only their own** profile | `id = auth.uid()` | New |
| profiles | INSERT | Authenticated sponsor | Can create a profile **only for themselves** | WITH CHECK `id = auth.uid()` | New |
| profiles | UPDATE | Authenticated sponsor | Can edit **only their own** profile and cannot change its id to someone else | USING + WITH CHECK `id = auth.uid()` | New |
| profiles | DELETE | — | Denied for sponsors this sprint (profile goes away only when the auth user is deleted, via cascade) | No policy | New |
| profiles | ALL | Anonymous | No access | No policy, no grant | New |
| property_listings | SELECT | Authenticated sponsor | Can read **only listings they own** | `owner_id = auth.uid()` (`listings_select_own`) | Exists |
| property_listings | INSERT | Authenticated sponsor | Can insert **only if they are the owner** | WITH CHECK `owner_id = auth.uid()` (`listings_insert_own`) | Exists |
| property_listings | UPDATE | Authenticated sponsor | Can update **only owned rows**, and cannot hand a row to another sponsor | USING + WITH CHECK `owner_id = auth.uid()` (`listings_update_own`) | Exists |
| property_listings | DELETE | Authenticated sponsor | Can delete **only owned rows** (no delete screen yet) | `owner_id = auth.uid()` (`listings_delete_own`) | Exists |
| property_listings | ALL | Anonymous | No access | No policy; `anon` privileges revoked | Exists |

Rule of thumb for review: if any future row would let Sponsor A read or change Sponsor B's data,
reject it.

## Requirement → design mapping

| Requirement (from `docs/sponsor-auth-requirements.md`) | Satisfied by |
|-----------------------------------------------|--------------|
| Story 1: sponsor signs up and signs in with email + password | `auth.users` (Supabase Auth); `profiles.id` = `auth.uid()` links display data |
| Story 2 / success: only a signed-in sponsor can open `/dashboard` | Server session check (app); every table denies `anon` (matrix "Anonymous" rows) |
| Story 3: sponsor sees **only their** properties, newest first | `property_listings` SELECT `owner_id = auth.uid()`; `created_at` for ordering |
| Story 4: new property is owned by the sponsor, who cannot choose another owner | INSERT WITH CHECK `owner_id = auth.uid()` + server sets `owner_id` from the session |
| Story 6: anonymous visitors cannot read or change any listing | No `anon` policies or grants on either table |
| Non-goal: no public read or public write | No `USING (true)` policies; no anon rows in the matrix |
| Non-goal: no admin features | No admin role column or admin policies; service role stays server-only and out of band |
| Threat: guessing another sponsor's property id | Every `property_listings` policy is owner-scoped, so knowing an id returns nothing |
| Threat: forged owner on create / update | INSERT and UPDATE WITH CHECK `owner_id = auth.uid()` |
| Threat: leaked service-role key | Matrix assumes only anon/authenticated roles reach the database from the app; see `docs/env-var-checklist.md` |
| Threat: "security by hiding buttons" | All rules live in RLS, not only in React |
| Success: list scoped to owner, tested with two accounts | SELECT row for `property_listings` |
| Dashboard card fields | `title`, `city`, `region`, `property_type`, `asking_price`, `status`, `created_at` |
| Open question: separate sponsors table? | Resolved: add a small `profiles` table for display data; ownership stays on `owner_id` → `auth.users.id` |

## Out of scope this sprint
- Public marketplace / investor read of `published` listings (would need a separate, reviewed SELECT policy).
- Multi-sponsor or team ownership of one property; organizations.
- Admin roles, admin override UI, or cross-sponsor moderation.
- Profile fields beyond `display_name` (company, phone, avatar).
- Images, document uploads, payments.
- Sponsors deleting their own profile.

## Open questions for review
- [ ] Is a `profiles` row created by a database trigger on signup, or by the app on first login?
      (Recommendation: trigger, so every sponsor always has one.)
- [ ] When delete is added to the UI: hard DELETE, or soft delete with `status = 'archived'`?
- [ ] What `display_name` default to use if the sponsor never sets one (for example, the part of
      their email before the @)?

## Ready for Step 6 when
- [x] Every sponsor-facing action in the requirements maps to a matrix row.
- [x] `owner_id` exists and is named consistently (`property_listings.owner_id` → `auth.users.id`).
- [x] No policy grants all authenticated users access to all properties.
- [ ] Open question on profile creation (trigger vs app) is decided.
