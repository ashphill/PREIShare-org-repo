# RLS policy review — property_listings

> Sprint 4 review of the migration that implements
> `docs/data-model/property-listings-schema.md`.

## Migration file
- **Path:** `supabase/migrations/20250321000000_property_listings.sql`
- **What it creates:**
  - Table `public.property_listings` with an `owner_id` linked to `auth.users`
  - Indexes on `owner_id` and `status`
  - An `updated_at` trigger (`set_updated_at`) that refreshes the timestamp on every update
  - Row Level Security turned on, plus four owner-only policies
  - Least-privilege grants: no table access for `anon`; `authenticated` gets select/insert/update/delete, still limited by RLS
- **What it does not contain:** any secret, any service-role key, any TypeScript.

## How to apply

### Option A: Supabase SQL Editor (recommended for this sprint)
1. Open the Supabase Dashboard → your **Preishare** project.
2. In the left sidebar, click **SQL Editor** → **New query**.
3. Open `supabase/migrations/20250321000000_property_listings.sql`, copy **all** of it, and paste it in.
4. Click **Run**. You should see "Success. No rows returned."
5. Go to **Table Editor** → `property_listings` and confirm the table exists and is marked **RLS enabled**.
6. Go to **Authentication → Policies** (or the table's policies view) and confirm the four policies are listed.

### Option B: Supabase CLI (only if the CLI is already linked)
```
supabase link --project-ref <your-project-ref>
supabase db push
```

If the run fails, read the error, fix the SQL in the migration file, and run it again.
Never leave the table half-created without RLS. The script is safe to re-run
(`if not exists` / `drop ... if exists`).

## Policies (plain language)

| Policy | Operation | Who | Rule | In plain words |
|--------|-----------|-----|------|----------------|
| `listings_select_own` | SELECT | authenticated | `using (owner_id = auth.uid())` | A signed-in sponsor only sees their own listings. Other sponsors' rows are invisible. |
| `listings_insert_own` | INSERT | authenticated | `with check (owner_id = auth.uid())` | A sponsor can only create a listing that belongs to them. A forged `owner_id` is rejected. |
| `listings_update_own` | UPDATE | authenticated | `using` + `with check (owner_id = auth.uid())` | A sponsor can only edit their own listings, and cannot change `owner_id` to give a row to someone else. |
| `listings_delete_own` | DELETE | authenticated | `using (owner_id = auth.uid())` | A sponsor can only delete their own listings. |

- **Logged-out visitors (`anon`):** no policies and no table grants, so no access at all.
- **No public read:** there is no "anyone can read published listings" policy.
- **Service role:** bypasses RLS by design. It is not used in this migration and must
  only be used in server code (see `docs/setup/supabase-env-checklist.md`).
- `auth.uid()` is wrapped as `(select auth.uid())`. This is Supabase's recommended form;
  it means the same thing but is evaluated once per query instead of once per row.

## Alignment with design doc

| Check | Result |
|-------|--------|
| Columns match `property-listings-schema.md` (names, types, nullability, defaults) | Yes: `id`, `owner_id`, `title`, `summary`, `property_type`, `address_line1`, `address_line2`, `city`, `region`, `postal_code`, `country`, `asking_price`, `currency`, `status`, `created_at`, `updated_at` |
| `owner_id` NOT NULL, FK to `auth.users(id)` `ON DELETE CASCADE` | Yes |
| Check constraints for `status`, `property_type`, `asking_price >= 0` | Yes (`text` + check, the design's default plan) |
| Index on `owner_id` | Yes (plus optional `status` index) |
| RLS enabled | Yes |
| One own-row policy each for SELECT / INSERT / UPDATE / DELETE | Yes |
| Missing policies | None |
| Overly open grants | None: no `using (true)`, no anon policy, `anon` privileges revoked |
| Out-of-scope items kept out (images, contacts, extra metrics, public browse) | Yes |

### Decisions made for the design's open questions
- `status` / `property_type`: `text` + check constraints (not Postgres enums).
- `updated_at`: refreshed by a database trigger, not by app code.
- Delete: hard `DELETE` (no `deleted_at` column this sprint).
- `country` defaults to `'US'`.

## Risks and open questions
- **Empty table is expected.** Until login and the create-listing server function exist,
  queries return no rows. Do **not** "fix" this with `using (true)`.
- **Service-role misuse** would bypass every policy. Keep `SUPABASE_SERVICE_ROLE_KEY`
  server-only and never prefix it with `VITE_`.
- **`asking_price` on published listings:** the database allows it to be empty. The app
  should require it before a listing is published (decide in the create-listing step).
- **Future sharing:** if published listings should be visible to investors or other sponsors
  later, that needs a new, separately reviewed SELECT policy.
- **Two-account test still to do:** once login exists, sign in as Sponsor A and Sponsor B and
  confirm each only sees their own rows (brief success criterion).

## Sign-off
- Reviewed by: Ashton Phillips
- Date: 2026-10-20
- Applied to Supabase project: [x] 2026-10-20 (SQL Editor run; Table Editor shows property_listings with 4 RLS policies)
