# Saved Properties feature brief

Status: topic 1 draft. This topic builds the shortlist. It does not merge.
Branch: feature/saved-properties

## Actor

The only actor is the signed-in investor: the person who is logged in and chooses to save a property.

- That person may read and change only their own shortlist.
- Another investor must not see or edit those saved rows.
- A visitor who is not signed in must not open the shortlist.
- Login screens in this repo say "sponsor" (src/routes/login.tsx: "Sponsors", "New sponsor?"). That word still means one signed-in account. The shortlist key is that account's user id (auth.uid()), not a shared company list.

Hiding a Save button in the browser is not enough. The database must refuse other people's rows.

## What the investor needs

- Save a property that already exists in the `properties` table named in the inspection log.
- Remove a property from their own shortlist.
- Open a /saved page that requires sign-in.
- From a saved property, see More like this by reusing the existing match_properties similarity search. Do not add a new embedding column or a new match function.

## Do not recreate

Leave these alone. They already exist in this repo:

- The TanStack Start app. Do not scaffold a new app.
- The existing `properties` table (and the separate sponsor-owned `property_listings` table). Do not rename either one and do not create a second listings table.
- pgvector and the existing `properties.embedding` column (vector(1536)). Do not enable pgvector again and do not add a second embedding column.
- The existing match_properties function and the /search page. Reuse them.
- .github/workflows/pr-ci.yml. Do not add a second continuous integration workflow and do not edit that file in topic 1.
- The one Vercel Hobby project recorded in docs/vercel-hobby-setup.md. Do not create a new hosting project. Do not paste secrets, passwords, or .env lines into this brief.

## Topic split

- Topic 1 (this work): inspect the repo and build the shortlist on branch feature/saved-properties. Stop before the merge pull request.
- Topic 2: demo, open a pull request, wait for a green pr-ci check, human review, merge, then confirm the same Production URL.

## Inspection log

Every path below was opened on disk on branch feature/saved-properties (checked with `ls` and read in the editor).

| Area | Path I opened | What it already does (one sentence) | Decision |
| --- | --- | --- | --- |
| App shell or routes | src/routes/__root.tsx (plus src/routes/search.tsx, src/routes/login.tsx, src/routes/dashboard.tsx) | The root route renders the shared Header, Footer and page shell that every TanStack Start route sits inside. | Extend, do not replace |
| Supabase server or browser client | src/lib/supabase.server.ts and src/lib/supabase.client.ts (re-exported by src/lib/supabase/server.ts and src/lib/supabase/client.ts) | The server file builds request-scoped clients from the user's access token, and the client file builds the browser-safe anon client limited by Row Level Security. | Reuse |
| Listings table and row rules | supabase/migrations/20250315000000_enable_pgvector_properties.sql (also supabase/migrations/20250321000000_property_listings.sql and supabase/migrations/20250321000000_sponsors_properties_rls.sql) | Table name: `properties` (searchable listings with the embedding column and a read-only select policy); `property_listings` is the separate sponsor-owned table with owner-only RLS. | Do not recreate this table |
| Search or match_properties | supabase/migrations/20250315000001_match_properties_function.sql, src/lib/property-search.ts, src/routes/search.tsx | match_properties ranks `properties` rows by cosine similarity to a query embedding, and the helper and /search page call it through /api/properties/search. | Reuse for More like this |
| CI workflow | .github/workflows/pr-ci.yml | Runs install, lint, typecheck, test, and build on pull requests to main. | Do not add a second workflow |
| Hosting notes | docs/vercel-hobby-setup.md | One Hobby project and a Production URL (https://prei-share-org-repo-one.vercel.app) already exist, deploying from main. | Same project; no secrets copied here |

## Planned pieces (requirements only — no code in this file)

- A later saved_properties table, keyed to the signed-in user id and pointing at existing `properties` rows, with row rules so each investor sees only their own rows.
- Save and remove controls on existing property cards and search results.
- A /saved route that requires sign-in.
- More like this that calls the existing similarity helper (src/lib/property-search.ts and match_properties).

## Out of scope for topic 1

- Merging to main.
- A new Vercel project.
- New secrets in git.
- Rewriting listings, embeddings, or pr-ci.yml.

## Check before commit

- I opened every path in the inspection log.
- No API keys, passwords, or environment-variable values are in this file.
- This commit adds this brief only.
