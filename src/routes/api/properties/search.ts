// src/routes/api/properties/search.ts — POST /api/properties/search
// Server route (TanStack Start server handlers): the "server door" for semantic search.
//
// Contract:
//   request:  POST JSON { "query": "quiet cabin near water with good rental upside", "matchCount"?: 5 }
//   200:      { query, results: [{ id, title, description, city, property_type, price, similarity }] }
//             results are ranked BEST FIRST by the database; similarity = 1 - cosine distance (higher = better)
//   400:      { error, results: [] }  (missing/empty query or bad JSON)
//   500/503:  { error, results: [] }  (no secrets, keys or raw provider/database details)
//
// All embedding + ranking happens in src/lib/property-search.ts (server-only).
// This route does not touch SQL or embeddings directly, and never re-sorts results.
import { createFileRoute } from '@tanstack/react-router'
import { DEFAULT_MATCH_COUNT, PropertySearchError, searchPropertiesByText } from '../../../lib/property-search'

const MAX_QUERY_LENGTH = 500

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export const Route = createFileRoute('/api/properties/search')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1) Read and validate input.
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return jsonResponse({ error: 'Send JSON like { "query": "quiet cabin near water" }.', results: [] }, 400)
        }

        const raw = (body ?? {}) as { query?: unknown; matchCount?: unknown }
        const query = typeof raw.query === 'string' ? raw.query.trim() : ''
        if (!query) {
          return jsonResponse({ error: 'Please describe the property you are looking for.', results: [] }, 400)
        }
        if (query.length > MAX_QUERY_LENGTH) {
          return jsonResponse({ error: `Please keep your search under ${MAX_QUERY_LENGTH} characters.`, results: [] }, 400)
        }
        const matchCount = typeof raw.matchCount === 'number' ? raw.matchCount : DEFAULT_MATCH_COUNT

        // 2) Search on the server with the existing helper (embed query -> match_properties RPC).
        try {
          const results = await searchPropertiesByText(query, matchCount)
          return jsonResponse({ query, results })
        } catch (err) {
          // Full details go to the server log only.
          console.error('[api/properties/search] search failed:', err instanceof Error ? err.message : err)

          if (err instanceof PropertySearchError && err.code === 'MISSING_API_KEY') {
            return jsonResponse({ error: 'Search is not configured yet. Please try again later.', results: [] }, 503)
          }
          return jsonResponse({ error: 'Search failed. Please try again.', results: [] }, 500)
        }
      },
    },
  },
})
