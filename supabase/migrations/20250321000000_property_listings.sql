-- supabase/migrations/20250321000000_property_listings.sql
-- Implements docs/data-model/property-listings-schema.md (Sprint 4).
-- Creates public.property_listings, indexes, an updated_at trigger,
-- Row Level Security, and four owner-only policies.
-- No secrets in this file. Run it in the Supabase SQL Editor or with `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.property_listings (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references auth.users (id) on delete cascade,
  title          text not null,
  summary        text,
  property_type  text not null
    check (property_type in ('multifamily', 'office', 'retail', 'industrial', 'mixed_use', 'land')),
  address_line1  text not null,
  address_line2  text,
  city           text not null,
  region         text not null,
  postal_code    text not null,
  country        text not null default 'US',
  asking_price   numeric(12, 2)
    check (asking_price is null or asking_price >= 0),
  currency       text not null default 'USD',
  status         text not null default 'draft'
    check (status in ('draft', 'published', 'under_offer', 'sold', 'archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.property_listings is
  'Sponsor-owned property listings. RLS limits every row to its owner (owner_id = auth.uid()).';
comment on column public.property_listings.owner_id is
  'Supabase Auth user id of the sponsor who owns the listing. Set from the session, never from the form.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists property_listings_owner_id_idx
  on public.property_listings (owner_id);

create index if not exists property_listings_status_idx
  on public.property_listings (status);

-- ---------------------------------------------------------------------------
-- Keep updated_at current on every update
-- ---------------------------------------------------------------------------
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

drop trigger if exists property_listings_set_updated_at on public.property_listings;
create trigger property_listings_set_updated_at
  before update on public.property_listings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: no policy = no access
-- ---------------------------------------------------------------------------
alter table public.property_listings enable row level security;

-- Logged-out visitors get no table privileges at all (least privilege).
revoke all on public.property_listings from anon;

-- Signed-in sponsors get only the four operations; RLS policies below
-- still limit every one of them to the sponsor's own rows.
grant select, insert, update, delete on public.property_listings to authenticated;

-- Sponsors can read only their own listings
drop policy if exists "listings_select_own" on public.property_listings;
create policy "listings_select_own"
  on public.property_listings
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- Sponsors can insert only rows they own (blocks forged owner_id)
drop policy if exists "listings_insert_own" on public.property_listings;
create policy "listings_insert_own"
  on public.property_listings
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

-- Sponsors can update only their own rows and cannot hand a row to someone else
drop policy if exists "listings_update_own" on public.property_listings;
create policy "listings_update_own"
  on public.property_listings
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Sponsors can delete only their own rows
drop policy if exists "listings_delete_own" on public.property_listings;
create policy "listings_delete_own"
  on public.property_listings
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- No policies exist for the anon role, and there is no "read all published" policy.
