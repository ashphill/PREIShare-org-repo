// src/lib/property-search.ts
// SERVER-ONLY semantic property search helper.
//
// Flow: query text -> query embedding (generate.ts, same model as the listings)
//       -> match_properties RPC (cosine distance in Postgres) -> ranked matches, best first.
//
// Uses the existing server client (src/lib/supabase.server.ts) with the ANON key:
// properties has a public read-only RLS policy, so no service-role key is needed here.
// Call it from server functions / API routes only (generate.ts reads EMBEDDING_API_KEY).

import { generateQueryEmbedding } from './embeddings/generate'
import { EMBEDDING_DIMENSIONS } from './embeddings/types'
import type { EmbeddingErrorCode } from './embeddings/types'
import { createSupabaseServerClient } from './supabase.server'
import type { Database } from './supabase/types'

/** One ranked search result. Field names match the match_properties return columns. */
export type PropertyMatch = Database['public']['Functions']['match_properties']['Returns'][number]
// = { id, title, description, city, property_type, price, similarity }
// similarity = 1 - cosine distance: HIGHER means closer meaning.

/** Default and maximum top-K (the SQL function also clamps to 1..20). */
export const DEFAULT_MATCH_COUNT = 5
export const MAX_MATCH_COUNT = 20

/** Thrown when the query can't be embedded or the database call fails. */
export class PropertySearchError extends Error {
  readonly code: EmbeddingErrorCode | 'RPC_ERROR'

  constructor(code: EmbeddingErrorCode | 'RPC_ERROR', message: string) {
    super(message)
    this.name = 'PropertySearchError'
    this.code = code
  }
}

/** pgvector accepts a vector as text like "[0.1,0.2,...]". */
function toPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

function clampMatchCount(matchCount: number): number {
  if (!Number.isFinite(matchCount)) return DEFAULT_MATCH_COUNT
  return Math.min(Math.max(Math.trunc(matchCount), 1), MAX_MATCH_COUNT)
}

/**
 * Search sample properties by meaning.
 * - Empty / whitespace query -> [] (no model call, no RPC call).
 * - Embedding failure -> throws PropertySearchError with the embedding error code.
 * - RPC failure -> throws PropertySearchError('RPC_ERROR'); never returns [] for an error.
 * - Success -> up to `matchCount` matches, best first (highest similarity first).
 */
export async function searchPropertiesByText(
  query: string,
  matchCount: number = DEFAULT_MATCH_COUNT,
): Promise<PropertyMatch[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  // 1) Generation: embed the query with the same model/length as the stored listings.
  const embedded = await generateQueryEmbedding(trimmed)
  if (!embedded.ok) {
    throw new PropertySearchError(embedded.code, embedded.message)
  }
  if (embedded.embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new PropertySearchError(
      'DIMENSION_MISMATCH',
      `Query embedding has ${embedded.embedding.length} numbers; match_properties expects ${EMBEDDING_DIMENSIONS}.`,
    )
  }

  // 2) Ranking: Postgres compares against stored property vectors (cosine, best first).
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.rpc('match_properties', {
    query_embedding: toPgVector(embedded.embedding),
    match_count: clampMatchCount(matchCount),
  })

  if (error) {
    console.error('[property-search] match_properties failed:', error.message)
    throw new PropertySearchError('RPC_ERROR', `match_properties failed: ${error.message}`)
  }

  return data ?? []
}
