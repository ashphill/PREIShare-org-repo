# Embeddings learner notes (PREIshare)

My notes for Sprint 5, Step 2. I'll use them later to check the embedding code an agent writes.

## Plain-language definition

An embedding turns a piece of text into a long list of numbers, so that text with similar meaning ends up with similar numbers. For PREIshare, the text is either a property description or what a buyer types into search. The list doesn't hold the words themselves and it isn't a summary you can read. It's more like coordinates on a map of meaning: two listings that mean almost the same thing sit close together, even if they use totally different words.

## Tiny intuition (not real model output)

Made-up 3-number embeddings, just to picture "near" vs "far." Think of the three numbers as roughly "nature/water," "quiet getaway" and "city life":

- "lakefront cabin, quiet, strong Airbnb history" → [0.9, 0.8, 0.1]
- "waterfront cottage, peaceful, good short-term rental" → [0.88, 0.82, 0.12] (nearby: almost the same numbers)
- "downtown loft near nightlife and offices" → [0.1, 0.2, 0.95] (far: the pattern is flipped)

Real embeddings have hundreds or thousands of numbers, and no single number has a human label like "water." The idea is the same though: similar meaning gives similar number patterns.

## PREIshare examples from our requirements

- **Buyer query I care about:** "quiet cabin near water with good rental upside" (query 1 in `docs/semantic-search-requirements.md`)
- **Listing A (should be close):** "Lakeside A-frame on a private cove. Peaceful setting, strong short-term rental history every summer."
- **Listing B (should be far):** "Urban loft steps from the dining district, walk to offices and nightlife."
- **Why A is closer than B (in my words):** Listing A never says *cabin*, *water* or *upside*, but "lakeside A-frame" means a cabin by water, and "strong short-term rental history" means good rental upside. Listing B is about city living and walking to restaurants, which is the opposite of a quiet getaway. Keyword search would miss A; embeddings should rank A above B.

## Generation vs storage (do not mix these up)

| Stage | What happens | Where |
| --- | --- | --- |
| Generation | The text is sent to an embedding model, and a list of numbers comes back | App / server code (later: a TypeScript helper) |
| Storage | That list of numbers is saved next to the property it belongs to | Database (later: Supabase Postgres with pgvector) |

At search time the steps are:

1. The buyer types a query.
2. The query gets embedded (generation, same model as the listings).
3. That list gets compared to the stored listing embeddings (storage, then comparison).
4. The closest ones come back first.

How the "closest" ranking actually works is Step 3.

The simple way I remember it: **Text → Model → Numbers → Database.** The model makes the numbers; the database only keeps them.

## Misconceptions to watch for when reviewing agent code later

- **Thinking the vector stores the original sentence.** It doesn't. The description text has to be saved separately if we want to show it.
- **Keyword thinking.** Assuming two listings need the same words to be close. They don't; that's the whole point.
- **Mixed dimensions or mixed models.** Every embedding we compare has to come from the same model, with the same list length. If listings use one model and queries use another, the numbers aren't comparable.
- **Confusing "create embedding" with "INSERT into the database."** Generating calls the model. Saving is a separate database write. Code that does one shouldn't be named like it does the other.
- **Reading one number as a score.** A single number in the list (like 0.9) means nothing on its own. Only the comparison between two whole lists means "how similar."
- **Forgetting to re-embed after edits.** If a listing's description changes, its old embedding no longer matches its text.

## What I can explain to a teammate in 60 seconds

Normal search only finds listings that use the exact words you typed. Embeddings fix that by turning each listing description into a list of numbers that captures what it *means*. Listings that mean similar things get similar numbers, even with different words, so "lakeside A-frame with strong rental history" lands near "quiet cabin near water with good rental upside." Making those numbers is one job: the text goes to a model and the numbers come back. Saving them is a separate job: they go into our Supabase database next to each property. When a buyer searches, we turn their words into numbers the same way and look for the stored listings with the closest numbers.

## Open questions before similarity ranking (Step 3)

- How exactly do we measure "close" between two lists of numbers, and turn that into a ranked list?
- What happens if two different embedding models get mixed in one table? (I think the results become meaningless, but I want to confirm.)
- How close is "close enough"? What score should make the farmland control query count as a weak match?
- Which model and list length will we use, and where does its API key live? (It has to be server-only, like the Sprint 4 secret key.)
- When a listing is edited, how do we make sure its embedding gets updated too?
