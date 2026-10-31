# PREIshare semantic search — handoff

**Author:** Ashton Phillips · **Date:** 2026-10-30 · **Status:** demo slice shipped and verified on Vercel Production (`prei-share-org-repo-one.vercel.app/search`)

Every fact here comes from the four source docs listed in section 9. Where a value is quoted, the source is named next to it.

## 1. Client story recap

PREIshare buyers and investors describe what they want in everyday words, like "quiet cabin near water with good rental upside." Keyword search only finds listings that use those exact words. A listing that says "lakeside A-frame with strong short-term rental history" means the same thing but gets missed (`semantic-search-requirements.md`, Problem).

This sprint shipped a small **semantic search** slice on sample data. Each listing's text is turned into a list of 1536 numbers that captures its meaning (an *embedding*). Those numbers are stored in Supabase Postgres with pgvector. A buyer's query is turned into numbers the same way, and listings are ranked by how close their meaning is. A simple API and search page let a stakeholder try it.

**Result in one line:** "tranquil hideaway beside a pond with Airbnb potential" returns the Rustic woodland retreat first, even though it shares no words with the query (`semantic-search-verification.md`, Keyword-trap check).

## 2. Stakeholder goals ↔ deliverables

| Stakeholder goal | What we delivered | Where to look |
| --- | --- | --- |
| Search by meaning, not only exact words | Embedding module (text to 1536 numbers) and a server-side search helper | `src/lib/embeddings/types.ts`, `src/lib/embeddings/generate.ts`, `src/lib/property-search.ts` |
| Store vectors next to property data | pgvector enabled, a `properties` table with `embedding vector(1536)`, and read-only RLS | `supabase/migrations/20250315000000_enable_pgvector_properties.sql` |
| Ranked matches, best first | `match_properties` SQL function (cosine, top-K, similarity score) | `supabase/migrations/20250315000001_match_properties_function.sql` |
| Something stakeholders can try | `POST /api/properties/search` and a `/search` page with example queries | `src/routes/api/properties/search.ts`, `src/routes/search.tsx` |
| Realistic sample data | 10 varied listings, including planted keyword traps, and a re-runnable seed script | `data/sample-properties.json`, `scripts/seed-property-embeddings.ts` (`npm run seed:embeddings`) |
| Proof it works | Live query results, edge cases, a refine cycle and requirement-by-requirement pass/fail | `docs/semantic-search-verification.md` |
| Clear scope and design before code | Requirements brief, learner notes, data model and setup plan | `docs/semantic-search-requirements.md`, `docs/embeddings-learner-notes.md`, `docs/vector-search-learner-notes.md`, `docs/embedding-data-model.md`, `docs/pgvector-setup-plan.md` |

## 3. Architectural decisions (what we actually chose)

| Decision | Value | Source |
| --- | --- | --- |
| What text is embedded | `title`, a blank line, then `description` (each trimmed). City, type, price and ids are **not** embedded. Queries are embedded as typed (trimmed). | `embedding-data-model.md`, "What text is embedded" |
| Embedding model | Google `gemini-embedding-001` (free tier) through its OpenAI-compatible endpoint. It was first planned as OpenAI `text-embedding-3-small`, then switched to stay free; the size didn't change. | `embedding-data-model.md`, Dimension placeholder; `pgvector-setup-plan.md`, Source of truth |
| Embedding dimensions | **1536** for every row and every query (`EMBEDDING_DIMENSIONS`, `vector(1536)`) | `embedding-data-model.md`; `pgvector-setup-plan.md` |
| Distance / similarity metric | Cosine distance with pgvector's `<=>`, sorted ascending (closest first). The API returns **similarity = 1 − distance, so higher is better**. | `pgvector-setup-plan.md`, Similarity approach; `semantic-search-verification.md` |
| Top-K | Default **5**; callers can ask for 1–20 (clamped in both the helper and SQL) | `pgvector-setup-plan.md` (K planned); `semantic-search-verification.md` (tested with 5 and 20) |
| Minimum score cutoff | **None**. A 0.60 cutoff was tested and deliberately not applied. | `semantic-search-verification.md`, Refine cycle |
| Where embeddings are created | App side, in server-only TypeScript (`generate.ts`). The database only stores and compares them. The API key is server-only (`EMBEDDING_API_KEY`, never `VITE_`). | `embedding-data-model.md`, Separation of concerns; `pgvector-setup-plan.md`, Environment values |
| Nulls | `embedding` stays empty until seeded. Rows without one are skipped by search. | `embedding-data-model.md`, Nullability and backfill |
| Index | **None**. An exact scan is correct and instant for 10 rows. Add HNSW with `vector_cosine_ops` only once the data is large. | `pgvector-setup-plan.md`, Index recommendation |
| Security | Sample table has RLS on and one read-only policy, with no browser writes. Seeding uses the service-role key locally only. Search uses the anon key. `match_properties` is `SECURITY INVOKER`. | `pgvector-setup-plan.md`, Migration goals |
| Seed / backfill path | `scripts/seed-property-embeddings.ts` reads `data/sample-properties.json` and upserts on fixed UUIDs, so re-running is safe | `semantic-search-verification.md`, Data checks |

## 4. In scope vs out of scope (this tutorial)

**In scope (done for the demo slice)**

- 10 sample properties, each with a stored 1536-number embedding
- One search path: `match_properties` SQL with the `searchPropertiesByText` helper
- A minimal API route and a React `/search` page that displays server results without re-sorting
- A verification report with live results for the brief's example queries, keyword traps and edge cases

**Out of scope (not claimed as done)**

- Filters (price, beds, location, property type) combined with vector ranking
- Hybrid keyword + vector ranking
- Automatic re-embedding when a listing changes, and production embedding jobs (batching, retries, rate limits)
- Auth, rate limiting or abuse protection on the search API
- Changes to the Sprint 4 `property_listings` / `profiles` tables or their RLS
- Large evaluation sets, quality dashboards, or CI that calls the embedding API
- Maps, payments, messaging, design polish (`semantic-search-requirements.md`, Out of scope)

## 5. Demo limitations (honest)

From `semantic-search-verification.md`:

- **Tiny sample set.** There are 10 hand-written listings, so results show the idea, not real catalog quality.
- **No "no good match" state.** Nonsense (`xqzv blorf`) and the farmland control query still list 5 low-score results. They score lower (top 0.489 and 0.572) than every real query's top result (0.707 or higher), but the page doesn't say they're weak.
- **The keyword trap leaks a little.** For "cabin by the lake," the "Retail storefront near Lake Street" reaches #3, though it stays below both real getaways.
- **Narrow score band.** Gemini scores sit at about 0.45–0.72, so read them by order, not as a percentage.
- **Depends on keys.** Search needs `EMBEDDING_API_KEY` (plus the URL and model vars) locally and in Vercel. Without it, the API returns 503 "Search is not configured yet."
- **The public API has no rate limit.** Each search costs one embedding call.
- **The key was exposed once.** The Gemini key was pasted in a chat and should be rotated.
- **Not production-hardened.** There are no latency or cost controls, and the search covers sample data only.

## 6. How to re-run the demo (checklist)

1. **Migrations.** In the Supabase SQL Editor, run `20250315000000_enable_pgvector_properties.sql`, then `20250315000001_match_properties_function.sql`.
2. **Env vars.** In `.env.local` you need `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (seed only), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `EMBEDDING_API_KEY`, `EMBEDDING_API_URL` and `EMBEDDING_MODEL`. See `.env.example` for names, and never commit real values. Add the three `EMBEDDING_*` vars in Vercel too, then redeploy.
3. **Seed.** Run `npm run seed:embeddings`. Expect 10 lines saying "embedding length: 1536."
4. **Check the data.** Run `SELECT count(*), count(embedding) FROM properties;`, which should return 10 | 10.
5. **Try it.** Run `npm run dev`, open `/search`, and click the example queries from `docs/semantic-search-requirements.md`.
6. **Compare.** Check the results against the tables in `docs/semantic-search-verification.md`. Query 1 should return the Lakeside A-frame first at about 0.707.

## 7. Next actions for later Sprint 5 work

Each item names what to build and where:

1. **Filters plus vector search.** Add optional `max_price` and `property_type` parameters to `match_properties` (as a new migration) and to `POST /api/properties/search`. Filter in the `WHERE` clause but still `ORDER BY embedding <=> query_embedding`. Add one verification row per filter.
2. **Hybrid search.** Add a Postgres full-text column (`tsvector` on title and description) and a `hybrid_match_properties` function that blends keyword rank and vector similarity with a documented weight. Re-test the "cabin by the lake" trap to check the storefront doesn't move up.
3. **Re-embed on update.** When a listing's title or description changes, call `generatePropertyEmbedding` and update `embedding`, or set it to null and let a backfill script fill rows where `embedding IS NULL`. Reuse the seed script's upsert pattern.
4. **Grow the evaluation set.** Expand `data/sample-properties.json` to about 30 listings and add a fixed `data/search-eval.json` of queries with expected top-3 IDs. Write a script that reports how many expected IDs land in the top 3.
5. **"Weak match" handling.** Use the larger evaluation set to calibrate a minimum similarity, then return a server-side `weak: true` flag or an empty list so nonsense queries show "no strong matches" (see the refine cycle in the verification doc).
6. **CI considerations.** In CI, run `npm run typecheck`, unit tests for `buildEmbeddingText` and `assertEmbeddingDimension` with a mocked provider, and a SQL lint of the migrations. Keep live embedding calls and seeding manual, because they cost money and need secrets.
7. **Protect the API.** Add simple rate limiting (per IP) to `/api/properties/search`, and log query length, latency and top score (not full text) for debugging.
8. **Rotate the embedding key.** Delete the shared Gemini key in AI Studio, create a new one, and update `.env.local` and Vercel.

## 8. Open questions for mentor / next owner

- Is `gemini-embedding-001` at 1536 the long-term model, or should PREIshare standardize on a paid provider? Switching means re-embedding every row.
- Should cosine stay the app-wide standard for any future vector features?
- Should the sample `properties` table eventually merge with Sprint 4's `property_listings`, and how would owner-only RLS work with public search?
- Who owns the embedding API budget and key rotation?
- Which filters matter most for the next stakeholder demo: price, location or property type?
- Is a minimum-score cutoff wanted, or should the UI always show top-K?

## 9. Sources used for this handoff

- `docs/semantic-search-requirements.md`: client story, actors, example queries, success criteria, scope
- `docs/embedding-data-model.md`: embedded text recipe, fields, 1536 dimensions, null lifecycle
- `docs/pgvector-setup-plan.md`: migration order, cosine `<=>`, index decision, env var names, RLS
- `docs/semantic-search-verification.md`: live results, keyword-trap proof, edge cases, refine cycle, limitations
