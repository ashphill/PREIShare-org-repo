# PREIshare semantic search — requirements brief

**Author:** Ashton Phillips · **Sprint:** 5, Topic 1 · **Type:** beginner tutorial slice (requirements and scope only — no code or schema)

## Problem (one paragraph)

PREIshare buyers and investors describe what they want the way they would to a friend: "a quiet cabin near water that would rent well." Today's search can only match the exact words in a listing, so it misses good properties that are described differently — a "lakeside A-frame with strong short-term rental history" never says *cabin*, *near* or *water*, and keyword search skips it. This slice adds a small, meaning-aware search on sample listings: each listing description gets turned into a vector that captures its meaning, the vectors are stored in our Supabase Postgres database, and a buyer's plain-language query returns listings ranked from closest meaning to farthest.

## Actors

| Actor | Goal |
| --- | --- |
| Property buyer / investor | Type what they want in everyday words and see the best-matching listings first, even when the listing uses different words |
| PREIshare builder / operator (me) | Demo trustworthy matches on a small sample set, judge each result against this brief, and hand off cleanly |
| Coding agent (assistant) | Build migrations, embedding helpers, search and a simple page — only inside the scope below |

## Example queries (these drive later tests)

Each query lists what a good top result looks like and why keyword search would fail on it. The sample listings must be written so each query has at least one clear match and the control query has none.

| # | Query | A good top result looks like… | Keyword search fails because… |
| --- | --- | --- | --- |
| 1 | "quiet cabin near water with good rental upside" | A secluded lakeside or riverfront getaway that mentions rental income or vacation-rental demand | The best listing may say "lakeside A-frame" and "strong short-term rental history" and never use *cabin*, *water* or *upside* |
| 2 | "family-friendly home close to good schools" | A house with several bedrooms, a yard or quiet street, and a nearby school or school district mentioned | A listing that says "3-bed near top-rated elementary, fenced backyard" shares almost no words with the query |
| 3 | "downtown condo walkable to restaurants" | A unit in a city center that mentions walking to dining, cafes or nightlife | The listing may say "urban loft steps from the dining district" — *loft* and *dining* aren't *condo* and *restaurants* |
| 4 | "low-maintenance rental for a first-time investor" | A small, newer or recently renovated property that mentions being turnkey or already tenanted | "Turnkey duplex, new roof, tenants in place" matches the meaning but none of the words |
| 5 (control) | "large working farmland with irrigation rights" | **No sample listing should appear as a strong match.** If the samples are cabins, homes and condos, the top results should be clearly weaker than the top results for queries 1–4 | Keyword search might wrongly rank any listing that happens to say "large" first |

## Success criteria (observable — a stranger can mark pass/fail after a demo)

- [ ] At least 8 sample listings exist, each with a plain-language description and a stored embedding vector
- [ ] Every sample listing has an embedding — none are missing or empty
- [ ] Running a natural-language query returns a list ranked best match first, with a similarity score shown for each result
- [ ] For each of queries 1–4, the top result is a listing that fits the "good top result" note in the table above
- [ ] For at least one of queries 1–4, the top result shares **none** of the query's key words (proven by showing the listing text side by side with the query)
- [ ] For query 5 (control), no result's score is as high as the top score for queries 1–4
- [ ] Running the same query twice returns the same order
- [ ] An empty query shows a friendly message instead of an error or a random list
- [ ] I can explain in one sentence, for one demo query, why keyword search would miss its top result
- [ ] Nothing out of scope (below) appears in the code, migrations or UI added by later steps

## In scope for this tutorial

- Plain-language understanding of embeddings and vector similarity
- A data model for properties plus their embedding vectors in Supabase Postgres with pgvector
- A migration that enables pgvector and stores the vectors
- A TypeScript helper that turns property text into an embedding
- Seed and backfill steps for a small sample set
- Similarity search (SQL plus a TypeScript helper)
- A minimal API route and a simple React search page in TanStack Start
- End-to-end verification notes against this brief and a handoff doc

## Out of scope (explicit non-goals)

- Production embedding work: provider billing, rate-limit handling, batch jobs or re-embedding at scale
- Maps, filters (price, beds, location radius), saved searches or alerts
- Auth, permissions or RLS changes for search, payments and messaging
- Advanced ranking: personalization, business rules, or hybrid keyword + vector tuning beyond a basic demo
- Real listing data or imports — sample data only
- Design polish beyond a clean, usable page, and any mobile app work

## Assumptions and open questions

**Assumptions**

- The free Supabase tier is enough for a small sample set.
- Sample listings are written for the demo, not real properties.
- Whatever embedding model is chosen is used for both listings and queries, so they're comparable.

**Open questions (decided in later steps, not here)**

- Which embedding provider and model?
- What vector dimension? It must match the model and stay the same end to end.
- Which distance metric (for example cosine)?
- Exactly how many sample listings, and what score counts as "strong" vs "weak" for the control query?
- Where the API key for the embedding provider lives (it must follow our server-only secret rules from Sprint 4).

## Handoff note for later steps

Every implementation step must be checkable against the example queries and success criteria above. If a prompt would add something from the out-of-scope list, cut it.
