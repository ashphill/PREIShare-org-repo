-- supabase/migrations/20250321000000_sponsors_properties_rls.sql
-- Implements docs/data-model-and-rls-matrix.md (Sprint 4, Topic 2).
--
-- What this migration does:
--   1. Creates public.profiles (sponsor linkage, 1:1 with auth.users) with RLS
--      and the matrix's owner-only policies (SELECT / INSERT / UPDATE; no DELETE).
--   2. Re-asserts RLS and the four owner-only policies on the EXISTING
--      public.property_listings table (created by
--      20250321000000_property_listings.sql). The matrix keeps that table as the
--      "properties" entity, so it is not re-created or renamed here.
--
-- Safe to re-run: "if not exists" / "drop ... if exists" throughout.
-- No secrets and no service-role logic in this file.
-- Run AFTER 20250321000000_property_listings.sql (Supabase SQL Editor or `supabase db push`).

-- ===========================================================================
-- 1. profiles — sponsor linkage (NEW)
--    Matrix: id (PK, FK -> auth.users.id, on delete cascade), display_name,
--            created_at, updated_at
-- ===========================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null
    check (char_length(btrim(display_name)) between 1 and 120),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'One row per sponsor. id = auth.users.id = auth.uid(). RLS: a sponsor can only see/edit their own row.';

-- Keep updated_at current (same helper the listings migration uses).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- RLS on: with no matching policy, access is denied.
alter table public.profiles enable row level security;

-- Anonymous visitors: no privileges, no policies (matrix: "profiles | ALL | Anonymous | No access").
revoke all on public.profiles from anon;

-- Signed-in sponsors: SELECT / INSERT / UPDATE only. No DELETE grant (matrix: denied this sprint).
revoke delete on public.profiles from authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Matrix: profiles | SELECT | sponsor can read only their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Matrix: profiles | INSERT | sponsor can create a profile only for themselves
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

-- Matrix: profiles | UPDATE | only their own profile, and the id cannot be changed to someone else
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Matrix: profiles | DELETE | no policy (row is removed only via ON DELETE CASCADE from auth.users)

-- ===========================================================================
-- 2. property_listings — properties owned by a sponsor (EXISTS)
--    Matrix hinge column: owner_id uuid not null -> auth.users(id) on delete cascade
--    (defined in 20250321000000_property_listings.sql; owner_id = profiles.id = auth.uid())
-- ===========================================================================

-- Index for "my listings" lookups (no-op if it already exists).
create index if not exists property_listings_owner_id_idx
  on public.property_listings (owner_id);

-- RLS on (no-op if already enabled).
alter table public.property_listings enable row level security;

-- Anonymous visitors: no privileges, no policies.
revoke all on public.property_listings from anon;
grant select, insert, update, delete on public.property_listings to authenticated;

-- Matrix: property_listings | SELECT | sponsor can read only listings they own
drop policy if exists "listings_select_own" on public.property_listings;
create policy "listings_select_own"
  on public.property_listings
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- Matrix: property_listings | INSERT | allowed only if the sponsor is the owner
drop policy if exists "listings_insert_own" on public.property_listings;
create policy "listings_insert_own"
  on public.property_listings
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

-- Matrix: property_listings | UPDATE | only owned rows; cannot hand a row to another sponsor
drop policy if exists "listings_update_own" on public.property_listings;
create policy "listings_update_own"
  on public.property_listings
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Matrix: property_listings | DELETE | only owned rows
drop policy if exists "listings_delete_own" on public.property_listings;
create policy "listings_delete_own"
  on public.property_listings
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- ===========================================================================
-- Review checklist (all true against docs/data-model-and-rls-matrix.md):
-- [x] RLS enabled on every sponsor-owned table (profiles, property_listings)
-- [x] No USING (true) on sponsor or listing data; no policies for anon
-- [x] Every INSERT/UPDATE policy has WITH CHECK tied to auth.uid()
-- [x] Columns and FKs match the matrix (profiles.id -> auth.users.id;
--     property_listings.owner_id -> auth.users.id)
-- [x] No profiles DELETE policy (matrix: denied this sprint)
-- Open (matrix "Open questions"): profile row creation by trigger vs app is
-- not decided, so no signup trigger is added here.
-- ===========================================================================
