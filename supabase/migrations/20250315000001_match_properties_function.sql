-- Sprint 5: similarity search over the sample `properties` table.
-- Depends on 20250315000000_enable_pgvector_properties.sql (pgvector + properties.embedding vector(1536)).
-- Source of truth: docs/embedding-data-model.md, docs/pgvector-setup-plan.md,
-- docs/vector-search-learner-notes.md.
--
-- What it does: given a buyer's query embedding (made by src/lib/embeddings/generate.ts
-- with the SAME model as the listings), return the closest listings, best match first.

create or replace function public.match_properties(
  -- Must be the same length as properties.embedding (1536). A different length errors out.
  query_embedding extensions.vector(1536),
  -- Top-K: how many listings to return. Clamped to 1..20 below.
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  description text,
  city text,
  property_type text,
  price integer,
  -- SCORE DIRECTION: similarity = 1 - cosine distance.
  -- HIGHER = closer meaning (1.0 = identical direction, ~0 = unrelated).
  similarity double precision
)
language sql
stable                -- read-only: same inputs give the same rows within a query
security invoker      -- runs with the CALLER's rights, so RLS on properties still applies
set search_path = public, extensions   -- fixed path; `extensions` holds pgvector's <=> operator
as $$
  select
    p.id,
    p.title,
    p.description,
    p.city,
    p.property_type,
    p.price,
    -- <=> is pgvector's COSINE DISTANCE (lower = closer). Convert to similarity so
    -- the returned score reads "higher is better" for stakeholders.
    1 - (p.embedding <=> query_embedding) as similarity
  from public.properties p
  -- Rows not embedded yet are skipped, so they can never show up as fake matches.
  where p.embedding is not null
  -- Best first: smallest cosine DISTANCE first (same as highest similarity first).
  order by p.embedding <=> query_embedding asc, p.id
  limit least(greatest(coalesce(match_count, 5), 1), 20);
$$;

comment on function public.match_properties(extensions.vector, int) is
  'Semantic search: ranks properties by cosine distance (<=>) to query_embedding, best first. Returns similarity = 1 - distance (higher = better). Top-K via match_count (1..20).';

-- Grants: only the roles that need to search. The sample listings are public demo data
-- (RLS allows SELECT for anon and authenticated), so the search page can call this.
revoke all on function public.match_properties(extensions.vector, int) from public;
grant execute on function public.match_properties(extensions.vector, int) to anon, authenticated, service_role;
