// src/routes/search.tsx — /search
// Simple semantic property search page for the PREIshare demo.
// Browser code only: it POSTs the query to /api/properties/search and DISPLAYS what comes back.
// It never re-sorts, re-scores, filters or invents results: order and similarity come from the server.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: PropertySearchPage,
})

/** Shape of each result in the API response (matches PropertyMatch on the server). */
type SearchResult = {
  id: string
  title: string
  description: string
  city: string | null
  property_type: string | null
  price: number | null
  similarity: number
}

type SearchResponse = { query?: string; results?: SearchResult[]; error?: string }

type Status = 'idle' | 'loading' | 'error' | 'done'

/** Example queries from docs/semantic-search-requirements.md. */
const EXAMPLE_QUERIES = [
  'quiet cabin near water with good rental upside',
  'family-friendly home close to good schools',
  'downtown condo walkable to restaurants',
]

const SNIPPET_LENGTH = 160

function snippet(text: string): string {
  return text.length > SNIPPET_LENGTH ? `${text.slice(0, SNIPPET_LENGTH).trimEnd()}…` : text
}

function formatPrice(price: number | null): string | null {
  if (price === null) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function PropertySearchPage() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function runSearch(text: string) {
    const trimmed = text.trim()
    if (!trimmed) {
      setResults([])
      setStatus('error')
      setErrorMessage('Type a description of the property you want, like the examples below.')
      return
    }

    setStatus('loading')
    setErrorMessage('')
    setSubmittedQuery(trimmed)

    try {
      const res = await fetch('/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })
      const data = (await res.json().catch(() => ({}))) as SearchResponse
      if (!res.ok) {
        throw new Error(data.error ?? 'Search failed. Please try again.')
      }
      // Display only: keep the server's order and scores exactly as returned.
      setResults(Array.isArray(data.results) ? data.results : [])
      setStatus('done')
    } catch (err) {
      setResults([])
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Search failed. Please try again.')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void runSearch(query)
  }

  function pickExample(example: string) {
    setQuery(example)
    void runSearch(example)
  }

  return (
    <main className="page-wrap px-4 py-10">
      <section className="mx-auto max-w-2xl">
        <p className="island-kicker mb-2">Semantic search demo</p>
        <h1 className="mb-2 text-3xl font-bold text-[var(--sea-ink)]">Find a property by describing it</h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          Describe the kind of investment property you want in everyday words. Results are matched by meaning, not
          only exact keywords, and ranked best match first.
        </p>

        <form onSubmit={handleSubmit} className="mb-3 space-y-2" noValidate>
          <label htmlFor="property-search" className="block text-sm font-semibold">
            What are you looking for?
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="property-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="quiet cabin near water with good rental upside"
              className="min-h-[44px] w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="min-h-[44px] shrink-0 rounded-md bg-[var(--sea-ink)] px-5 py-2 font-semibold text-white disabled:opacity-60"
            >
              {status === 'loading' ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--sea-ink-soft)]">Try:</span>
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => pickExample(example)}
              disabled={status === 'loading'}
              className="rounded-full border border-[var(--line)] px-3 py-1 hover:bg-[rgba(79,184,178,0.12)] disabled:opacity-60"
            >
              {example}
            </button>
          ))}
        </div>

        {status === 'loading' ? (
          <p role="status" className="text-sm text-[var(--sea-ink-soft)]">
            Searching listings by meaning…
          </p>
        ) : null}

        {status === 'error' && errorMessage ? (
          <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {status === 'done' && results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-6 text-center">
            <p className="mb-1 font-semibold">No matching properties</p>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Nothing came back for “{submittedQuery}”. The sample listings may not be loaded yet, or try describing
              the property differently.
            </p>
          </div>
        ) : null}

        {status === 'done' && results.length > 0 ? (
          <>
            <p className="mb-2 text-sm text-[var(--sea-ink-soft)]">
              Top {results.length} for “{submittedQuery}”, best match first. Similarity is from the server: higher
              means closer in meaning.
            </p>
            <ol className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]" aria-label="Search results">
              {results.map((result, index) => {
                const details = [result.city, result.property_type, formatPrice(result.price)].filter(Boolean)
                return (
                  <li key={result.id} className="flex gap-3 px-4 py-3">
                    <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-[var(--sea-ink-soft)]">
                      {index + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold">{result.title}</p>
                        <span className="shrink-0 rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-semibold">
                          Similarity {typeof result.similarity === 'number' ? result.similarity.toFixed(3) : '—'}
                        </span>
                      </div>
                      {details.length > 0 ? (
                        <p className="text-xs text-[var(--sea-ink-soft)]">{details.join(' · ')}</p>
                      ) : null}
                      <p className="mt-1 text-sm">{snippet(result.description)}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        ) : null}
      </section>
    </main>
  )
}
