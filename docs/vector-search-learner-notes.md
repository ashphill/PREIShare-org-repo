# Vector search learner notes (PREIshare)

My notes for Sprint 5, Step 3. They build on `docs/semantic-search-requirements.md` (the queries and success criteria) and `docs/embeddings-learner-notes.md` (my definition: an embedding turns property text into a list of numbers so that similar meanings end up close together). Conceptual only: no real SQL or schema yet.

## 1. My plain-language definition

Vector similarity ranking means turning the buyer's query into an embedding, comparing that list of numbers to every stored property embedding, giving each property a score for how close its meaning is, and showing the closest properties first. "Best match" means closest in meaning, not most words in common.

## 2. How a search runs (steps I can explain)

1. The buyer types a natural-language query, like "quiet cabin near water with good rental upside."
2. The system creates a **query embedding** using the same model the listings were embedded with. A different model would make the numbers impossible to compare.
3. The system compares the query embedding to the **stored property embeddings** in the database.
4. Each property gets a **distance or similarity score**.
5. Results are **ranked** best first and cut to the **top-K**, for example K = 5.

```text
[Buyer query text]
        |
        v  (generation — same model as listings)
[Query embedding] ----compare----> [Property embeddings stored in Supabase]
        |
        v
[Score per property] -> [Sort best-first] -> [Top-K listings shown]
```

## 3. Keyword search vs vector search (same query)

**Example query:** "quiet cabin near water with good rental upside" (query 1 in the requirements brief)

| Approach | What it looks for | What it would do with "Lakeside A-frame on a private cove. Peaceful setting, strong short-term rental history." |
| --- | --- | --- |
| Keyword | The exact words "cabin," "water," "rental," "upside" | Weak or no match. Only "rental" overlaps, so a downtown listing that says "rental income" could beat it. |
| Vector / semantic | Nearby meaning, even when the words differ | Strong match. A-frame by a lake means "cabin near water," and "strong rental history" means "rental upside." |

Vector search can still miss a listing if its description is empty or misleading, or if it was never embedded.

**My takeaway:** investors on PREIshare describe what they *want*, and every listing is written differently. Ranking by meaning finds the right property; ranking by shared words finds whichever listing copied the buyer's vocabulary.

## 4. Worked ranking examples (no real math required)

### Example A: clear winner

Query: "family-friendly home near good schools" (close to query 2 in the requirements brief)

| Listing blurb (short) | Expected rank | Why |
| --- | --- | --- |
| "4BR near a top-rated elementary, quiet cul-de-sac, fenced yard for kids" | 1 (best) | Same intent: room for a family, a school nearby, a safe street. It doesn't say "family-friendly" or "good schools," but it means both. |
| "2BR townhouse, close to a park and a grocery store" | 2 (partial) | Livable for a family, but nothing about schools. It should rank in the middle. |
| "Industrial warehouse, high ceilings, loading dock" | 3 (lowest) | Unrelated meaning: a business property, not a home. |

**Keyword trap:** a listing that says "Great home for investors, near Schoolhouse Rd" shares "home" and part of "schools" and could beat listing 1 on keywords, even though it means something else.

### Example B: different words, same intent

- **Query:** "cabin by the lake"
- **Strong match listing:** "Rustic woodland retreat on the water with a private dock"
- **Distractor listing:** "Cabinet showroom and retail space near Lake Street"
- **Why vector should win:** the retreat means the same thing (a small, rustic getaway on the water) even without the words "cabin" or "lake."
- **Why keyword may fail:** the retreat shares no exact words with the query, while the distractor contains "Cabin…" and "Lake," so keyword matching would rank the wrong one first.

## 5. Top-K and scores (what I will check later)

- **Top-K:** return only the K nearest listings. My starting default is K = 5. That's enough to compare options, and the page doesn't dump the whole table, which would bury the good matches and slow the page down.
- **Distance score:** smaller means closer, so sort smallest first.
- **Similarity score:** larger means closer, so sort largest first.
- **My rule:** I will check which kind of score our SQL returns before trusting its sort order. Getting this backwards would show the *worst* matches first, and it would still look like search is "working."
- A score alone isn't enough. Each result should come back with the property id, a title or description snippet, and the score, so I can see *why* it ranked where it did.
- Ties and near-ties are normal. Scores that are very close shouldn't be treated as a big quality difference.

## 6. What good ranking is *not*

- Not alphabetical by title
- Not "newest listing first," unless we add that later as a separate product rule
- Not a keyword filter (SQL `ILIKE` or "contains the word") renamed as semantic search
- Not a comparison between embeddings built with different models or list lengths (apples to oranges)
- Not "return everything that matched": it needs a top-K cut
- Not trustworthy just because rows came back. The order has to make sense for the example queries.

## 7. Assessment questions for a future `match_properties`-style function

I will reject agent output later unless I can answer YES to all of these:

1. **Same embedding method:** Does it take a query embedding, or take query text and embed it with the *same* model and list length used for the listings?
2. **Compares stored vectors:** Does it compare against the stored property embedding column, not the raw description text (no `ILIKE` / keyword matching passed off as semantic)?
3. **Correct sort direction:** Does it put the best matches first, smallest distance or largest similarity, and can I point to the line that decides it?
4. **Top-K:** Does it take a limit (match count) with a sensible default like 5, instead of returning every row?
5. **Explainable rows:** Does each row include the property id, a readable title or snippet, and the score?
6. **No mixed models:** Does it avoid mixing embeddings of different sizes or models, and fail clearly if the query embedding has the wrong length?
7. **Missing embeddings:** Are properties with no embedding skipped safely instead of crashing the search or showing up as fake top results?
8. **Different words, same intent:** With our sample data, does "quiet cabin near water with good rental upside" rank the lakeside A-frame above the downtown loft?
9. **Control query:** Does the farmland control query score clearly weaker than the top results for the real queries?
10. **Repeatable:** Does the same query return the same order twice in a row?

## 8. Link back to requirements

Relevant example queries from `docs/semantic-search-requirements.md`:

- "quiet cabin near water with good rental upside"
- "family-friendly home close to good schools"
- "downtown condo walkable to restaurants"
- Control: "large working farmland with irrigation rights"

Success criteria this ranking model supports:

- A natural-language query returns a list ranked best match first, with a similarity score shown for each result.
- For each of queries 1–4, the top result fits the "good top result" note.
- For at least one query, the top result shares none of the query's key words.
- The control query's best score is lower than the top score for queries 1–4.
- Running the same query twice returns the same order.

From `docs/embeddings-learner-notes.md`: generation (the model makes the numbers) and storage (the database keeps them) stay separate. Ranking is the third job, comparing at search time.

## 9. Open questions for later steps

- Which distance metric will pgvector use in our migration? Cosine is my guess, but I'll confirm by name only.
- Should the default K be 5, and should the page let a buyer ask for more?
- What minimum fields should the first UI show next to each hit? My guess: title, city, a short snippet and the score.
- Should we hide results below some minimum score, so the farmland query shows "no strong matches" instead of five weak ones?
