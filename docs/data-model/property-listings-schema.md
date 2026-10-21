# Property Listings Data Model & Auth Boundaries

> Sprint 4 design doc for PREIshare. Source of truth for migrations and RLS.
> Inputs: docs/requirements/sponsor-auth-and-listings-brief.md,
>         docs/setup/supabase-env-checklist.md
> This is a design doc only. No SQL is written here; the next step turns it into a migration.

## 1. Purpose

Sponsors sign in and manage **real** property listings stored in Postgres (Supabase).
No mock arrays in the browser: listings come from the database, not from
`MOCK_DEALS`, `MOCK_PORTFOLIO_HOLDINGS`, or `src/fixtures/sample-investor-listings.ts`.
Secrets (the service-role key) never ship to the client.

From the brief, a sponsor must be able to:
1. Sign up and log in with Supabase Auth (email/password).
2. Create a property listing that is saved in Postgres and still there after a refresh.
3. See **only their own** listings (row-level security, tested with two accounts).

## 2. Entity: `property_listings`

Column names follow the existing TypeScript types in `src/types/`
(`InvestorListing`, `Address`, `FinancialSummary`, `ListingStatus`, `PropertyType`),
converted to Postgres `snake_case`.

| Column | Type (Postgres) | Nullable | Notes |
|--------|-----------------|----------|-------|
| `id` | `uuid` | no | Primary key; default `gen_random_uuid()`. Never reassigned. |
| `owner_id` | `uuid` | no | FK → `auth.users(id)`; the sponsor who owns the row. Set from the session, never from the form. |
| `title` | `text` | no | Short headline shown on cards (matches `title`). |
| `summary` | `text` | yes | Longer plain-text description (matches `summary`). |
| `property_type` | `text` | no | One of: `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` (matches `PropertyType`). |
| `address_line1` | `text` | no | Street number and name (matches `Address.line1`). |
| `address_line2` | `text` | yes | Unit, suite, or floor (matches `Address.line2`). |
| `city` | `text` | no | |
| `region` | `text` | no | State / province (required in `Address`). |
| `postal_code` | `text` | no | ZIP / postal code (required in `Address`). |
| `country` | `text` | no | Default `'US'`. |
| `asking_price` | `numeric(12,2)` | yes | Asking price in dollars; must be `>= 0`. Optional while `draft` (matches `FinancialSummary.askingPrice`). |
| `currency` | `text` | no | Default `'USD'`. |
| `status` | `text` | no | Default `'draft'`. One of: `draft`, `published`, `under_offer`, `sold`, `archived` (matches `ListingStatus`). |
| `created_at` | `timestamptz` | no | Default `now()`. |
| `updated_at` | `timestamptz` | no | Default `now()`; bumped on every update. |

### Rules the database should enforce
- `owner_id` is **required** (no listing without an owner).
- `asking_price` cannot be negative.
- `status` and `property_type` only accept the values listed above.

### Indexes (recommended)
- Primary key on `id`
- Index on `owner_id` (the "my listings" query filters by it)
- Optional index on `status` if the dashboard filters draft vs published often

### Out of scope for this sprint
- Images, documents, and file uploads (brief: document uploads deferred)
- Contacts and ownership-structure tables (`InvestorContact`, `Ownership` types stay app-only for now)
- Extra financial metrics (`projectedIrrPercent`, `capRatePercent`) and `closedAt`
- Full-text search or vector embeddings
- Multi-sponsor shared ownership and organizations
- Admin roles and admin dashboards
- A public "browse all published listings" page

## 3. Ownership model

- Every listing row **must** have `owner_id` set to the Supabase Auth user id (`auth.uid()`)
  of the sponsor who created it.
- `owner_id` references `auth.users(id)` with **`ON DELETE CASCADE`**: if a sponsor's
  auth account is deleted, their listings are deleted too. (Chosen because the brief has no
  soft-delete or data-retention requirement this sprint.)
- The app never lets the browser choose `owner_id`. The server reads the signed-in user
  from the session and sets `owner_id` itself; RLS also rejects any insert where
  `owner_id` is not the current user.

## 4. Proposed Row Level Security (RLS) — plain language

RLS is **enabled** on `property_listings`. With RLS on, no policy means no access.

| Policy name | Command | Who | Rule in plain words |
|-------------|---------|-----|---------------------|
| `listings_select_own` | SELECT | authenticated | A sponsor can read a row only if `owner_id = auth.uid()`. |
| `listings_insert_own` | INSERT | authenticated | A new row is allowed only if `owner_id = auth.uid()` (WITH CHECK). |
| `listings_update_own` | UPDATE | authenticated | A sponsor can change only their own rows, and cannot hand a row to someone else: `owner_id = auth.uid()` in both USING and WITH CHECK. |
| `listings_delete_own` | DELETE | authenticated | A sponsor can delete only rows where `owner_id = auth.uid()`. |

Notes:
- Logged-out (`anon`) users get **no** listing access this sprint. There is no policy for the `anon` role.
- There is **no** public or "read all published listings" policy; the brief does not ask for one.
- The brief only builds **create and read** screens this sprint. UPDATE and DELETE policies are
  still defined now so the table is never left open if those features arrive later.
- The service-role key **bypasses RLS**. It is only for server-side admin or maintenance tasks
  and is never used for normal sponsor requests or in browser code.

## 5. Server vs browser operation map

| Operation | Runs where | Client / key | Notes |
|-----------|------------|--------------|-------|
| Sign up / sign in / sign out | Browser + Supabase Auth | Browser client with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | No service-role key. |
| Session check for `/dashboard` routes | Server (route loader / `beforeLoad`) | Server client acting as the user (session cookie) | Redirect to login if there is no session. |
| List my listings | Server loader | Server client acting as the user (anon key + user session) | RLS returns only the sponsor's rows. |
| Create listing | Server function (TanStack Start `createServerFn`) | Server client acting as the user | Validate fields on the server; set `owner_id` from the session. |
| Update / delete listing (later) | Server function | Server client acting as the user | Out of scope for UI this sprint; RLS already blocks cross-owner changes. |
| Admin / maintenance jobs (out of scope) | Server only | `SUPABASE_SERVICE_ROLE_KEY` | Never imported into any file that runs in the browser. |

### Environment boundary reminder
- **Public (`VITE_` prefix):** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only.
- **Server-only (no `VITE_` prefix):** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- The service-role key never appears in the client bundle. See `docs/setup/supabase-env-checklist.md`.

## 6. Acceptance checks for the next (migration) step

- [ ] Table `property_listings` matches the column list above (names, types, nullability, defaults)
- [ ] `owner_id` is NOT NULL with a FK to `auth.users(id)` `ON DELETE CASCADE`
- [ ] Check constraints for `status`, `property_type`, and `asking_price >= 0`
- [ ] Index on `owner_id`
- [ ] RLS enabled with own-row SELECT / INSERT / UPDATE / DELETE policies using `auth.uid()`
- [ ] No policy grants anon or world-readable access
- [ ] SQL lives in a committed migration file, not only in ad-hoc dashboard clicks

## 7. Open questions (resolve before or during the migration)

- Should `status` and `property_type` be Postgres enum types, or `text` + check constraints? (Default plan: `text` + check constraints, easier to change.)
- Is `'US'` the right default `country`, or will sponsors list properties in other countries?
- Should `asking_price` be required once a listing is `published` (enforced in the database or only in the app)?
- Soft-delete (`deleted_at`) vs hard DELETE when delete is added in a later sprint?
- Does `updated_at` get bumped by a database trigger or by the server function?
