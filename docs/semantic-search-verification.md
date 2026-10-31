# Semantic search verification report (PREIshare)

All results below come from real calls I ran on 2026-10-30 against the live API (`POST /api/properties/search`) and the `/search` page. Nothing is estimated or invented. Scores are the server's `similarity` (1 − cosine distance; **higher = closer meaning**), rounded to 3 decimals.

## Scope checked

- Requirements source: `docs/semantic-search-requirements.md`
- UI: `src/routes/search.tsx`
- API: `src/routes/api/properties/search.ts`
- Search helper: `src/lib/property-search.ts`, which calls `match_properties` (`supabase/migrations/20250315000001_match_properties_function.sql`)
- Embeddings: `src/lib/embeddings/generate.ts`, `src/lib/embeddings/types.ts`
- Seed inputs: `data/sample-properties.json`, `scripts/seed-property-embeddings.ts`

## Environment

- **Date tested:** 2026-10-30
- **Supabase project:** ref `dysentsvguckziflvama` (no keys recorded here)
- **App run method:** Vercel Production (`prei-share-org-repo-one.vercel.app`, deploy `916c616`). The API was called with `fetch` from the `/search` page, and the UI was checked by clicking an example query.
- **Embedding model / dimension:** Google `gemini-embedding-001` at **1536** dimensions, the same model for listings and queries. The column is `properties.embedding vector(1536)`.

## Data checks

| Check | Result | Notes |
| --- | --- | --- |
| Sample properties present | PASS | All 10 sample listings from `data/sample-properties.json` came back when I asked for `matchCount: 20`. There were no duplicates and no unexpected rows. |
| Embeddings non-null for all samples | PASS | `match_properties` skips rows where `embedding is null`, so 10 of 10 returned means all 10 have a 1536-number embedding (null count = 0). Confirm in SQL with `SELECT count(*), count(embedding) FROM properties;`, which should return 10 / 10. |
| Seed script re-runnable without breaking search | SKIPPED | It wasn't re-run during this check. It's designed to be safe: it upserts on fixed UUIDs, and the current table has exactly 10 distinct rows. |

## Query results (semantic)

The top 3 of 5 are shown, from the API JSON. For query 3, I also clicked the example button on `/search`, and the page showed the same order.

| # | Query | Top 3 results (similarity) | Sensible neighbors? | Notes |
| --- | --- | --- | --- | --- |
| 1 | quiet cabin near water with good rental upside | Lakeside A-frame on a private cove (0.707); Rustic woodland retreat on the river (0.705); Turnkey duplex with tenants in place (0.621) | YES | Both waterfront getaways lead by a clear gap (about 0.08) over everything else. |
| 2 | family-friendly home close to good schools | Four-bedroom home near a top-rated elementary (0.714); Suburban starter home with a big yard (0.683); Turnkey duplex with tenants in place (0.609) | YES | The school listing is #1, and the other family-style home is #2. |
| 3 | downtown condo walkable to restaurants | Urban loft above the dining district (0.710); High-rise condo with skyline views (0.700); Ski-town condo steps from the gondola (0.677) | YES | Both downtown units lead. The loft is #1 even though it says "loft" and "dining," not "condo" and "restaurants." |
| 4 | low-maintenance rental for a first-time investor | Turnkey duplex with tenants in place (0.718); Ski-town condo steps from the gondola (0.613); Suburban starter home with a big yard (0.609) | YES | This is the strongest single winner (about 0.10 ahead). |
| 5 (control) | large working farmland with irrigation rights | Rustic woodland retreat on the river (0.572); Industrial warehouse with loading docks (0.568); Ski-town condo steps from the gondola (0.554) | YES (expected weak) | There's no farmland in the samples. The best score, 0.572, is below every top score for queries 1–4 (lowest is 0.707). |

Repeat check: running query 1 a second time returned the identical order and scores.

## Keyword-trap check

- **Trap query (paraphrase, not exact listing text):** "tranquil hideaway beside a pond with Airbnb potential"
- **Expected kind of property:** a quiet getaway by water with short-term rental income, meaning the river retreat or the lakeside A-frame
- **Actual top results:** Rustic woodland retreat on the river (0.691); Lakeside A-frame on a private cove (0.685); Suburban starter home with a big yard (0.590)
- **Did semantic search beat exact-keyword matching?** YES
- **Evidence:** the #1 listing shares **none** of the query's content words ("tranquil," "hideaway," "beside," "pond," "Airbnb," "potential"). A keyword search would return nothing, but semantic search ranked both water getaways first, about 0.10 ahead of the rest.

Other trap results I logged:

| Query | Top 3 (similarity) | Notes |
| --- | --- | --- |
| cabin by the lake | Lakeside A-frame on a private cove (0.651); Rustic woodland retreat on the river (0.610); Retail storefront near Lake Street (0.579) | This is the planted trap. The storefront is a cabinet showroom on "Lake Street," so keywords would favor it. Semantic search ranked both real getaways above it, though the trap still reached #3. |
| a place for raising children near excellent education | Four-bedroom home near a top-rated elementary (0.678); Suburban starter home with a big yard (0.610); Urban loft above the dining district (0.575) | The #1 listing shares no content words with the query; "near" is the only overlap. |
| somewhere peaceful on the water I can rent out on weekends | Lakeside A-frame on a private cove (0.639); Rustic woodland retreat on the river (0.633); High-rise condo with skyline views (0.577) | The correct two lead. |

## Safety / edge cases

| Case | Expected | Actual | PASS / FAIL |
| --- | --- | --- | --- |
| Empty query (`"   "`) | Clear error or empty list, no crash | HTTP **400** `{ "error": "Please describe the property you are looking for.", "results": [] }`. The UI shows a red message and doesn't call the API. | PASS |
| Nonsense tokens (`xqzv blorf`) | Low similarity or empty, no crash | HTTP 200 with 5 results, all low (top 0.489, below every real query's top score) | PASS (see refine cycle) |
| Very short query (`pool`) | Stable response | HTTP 200. #1 is High-rise condo with skyline views (0.529), the only listing with a rooftop pool. | PASS |

## Refine cycle (required)

- **Weak example:** `xqzv blorf` still returns 5 "matches" (0.457–0.489), and the farmland control query returns 5 (top 0.572). The page lists them like any other results, so a stakeholder could read them as real matches. Related: for `cabin by the lake`, the keyword-trap storefront reaches #3 (0.579).
- **Suspected layer:** the helper and SQL contract (`match_properties` always returns the top-K, with no minimum score). This isn't a ranking bug: the order is correct in every case, and the weak results really are weak. It isn't a seed data or embedding text issue either.
- **Change considered:** add a minimum similarity cutoff (0.60) to `match_properties`, so weak queries return "no strong matches."
- **Re-test (simulated on the scores logged above, no code changed):**
  - A 0.60 cutoff would hide every nonsense, farmland and `pool` result, and keep every correct #1 for queries 1–4 and all four trap queries (the lowest correct #1 is 0.651).
  - It would also hide the legitimate `pool` answer (0.529).
  - It's tied to this model: Gemini scores sit in a narrow 0.45–0.72 band, so the number would need re-tuning if the model or sample set changed.
- **Keep or revert decision:** **not applied** (deliberate no-change). For this beginner slice the requirement is "the control query scores lower than real queries," and that already passes. A fixed cutoff would trade a clear contract (always top-K, best first) for a brittle magic number. Recorded as a follow-up: calibrate a cutoff on more data, or show a "weak match" note driven by the server.

## Requirements traceability

From the success criteria in `docs/semantic-search-requirements.md`:

| Requirement / success criterion | Met? | Evidence |
| --- | --- | --- |
| At least 8 sample listings, each with a description and stored embedding | YES | 10 listings, all returned by `match_properties` (non-null embeddings only) |
| Every sample listing has an embedding; none missing | YES | 10 of 10 returned with `matchCount: 20`; null count 0 |
| A natural-language query returns a list ranked best first, with a similarity score for each | YES | Every query above returns scores in descending order, shown on `/search` |
| For queries 1–4, the top result fits the "good top result" note | YES | A-frame (waterfront + rental); four-bedroom near elementary; urban loft by the dining district; turnkey duplex |
| For at least one query, the top result shares **none** of the query's key words | YES | "tranquil hideaway beside a pond with Airbnb potential" → Rustic woodland retreat (0 shared content words) |
| Query 5 (control): no score as high as the top score for queries 1–4 | YES | Farmland top 0.572 vs lowest real top 0.707 |
| Running the same query twice returns the same order | YES | Query 1 repeated: identical order and scores |
| An empty query shows a friendly message, not an error or random list | YES | 400 plus a plain message; the UI shows the alert |
| I can explain why keyword search would miss a top result | YES | Query 1's #1 says "lakeside A-frame" and "calm lake," never "cabin," "water" or "upside" |
| Nothing out of scope appears in code, migrations or UI | YES | No maps, filters, auth changes, payments or production embedding jobs; `property_listings` and `profiles` untouched |

## Remaining limitations (honest handoff)

**What this slice does not do yet**

- No filters (price, beds, location), maps, saved searches or personalization.
- No hybrid keyword + vector ranking.
- Uses only 10 hand-written sample listings, not real or imported data.
- No automatic re-embedding when a listing is edited; the seed script is run by hand.
- No production embedding operations (batching, retries, rate limits, monitoring).
- No vector index; with 10 rows, an exact scan is correct and fast.
- No rate limiting on the public `/api/properties/search` route; each call uses the embedding API.

**Known ranking weaknesses on the sample set**

- There's no "no good match" state: nonsense and farmland queries still show 5 low-score results (see the refine cycle).
- The planted "Lake Street" storefront still reaches #3 for "cabin by the lake," below the real matches.
- Scores fall in a narrow band (about 0.45–0.72), so gaps between #1 and #5 are small numbers. Read them by relative order, not absolute value.
- The ski-town condo shows up mid-list for many queries, because its text mixes rental, mountain and town signals.

**Follow-ups for the next topic**

- Calibrate a minimum-score cutoff, or a server-provided "weak match" label, on a larger sample set.
- Add rate limiting or auth to the search API before sharing the link widely.
- Re-embed on listing create and edit.
- Rotate the Gemini key, since it was shared in a chat once.

## Sign-off

- **Verified by:** Ashton Phillips (2026-10-30)
- **Ready to demo to a stakeholder?** YES
- **Blockers before demo:** none. Before a wider rollout, add API rate limiting and rotate the embedding key.
