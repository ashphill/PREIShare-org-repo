// src/lib/embeddings/types.ts
// Contract only: no network code here.
// Source of truth: docs/embedding-data-model.md (DIMENSION_TODO = 1536,
// model text-embedding-3-small) and the migration
// supabase/migrations/20250315000000_enable_pgvector_properties.sql (embedding vector(1536)).

/**
 * Length of every embedding vector. Must equal the pgvector column size
 * `properties.embedding vector(1536)` and the output size of the embedding model.
 * Change it only together with the data model doc, the migration and the model.
 */
export const EMBEDDING_DIMENSIONS = 1536

/** Default embedding model; its output length is EMBEDDING_DIMENSIONS. Override with EMBEDDING_MODEL. */
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'

/**
 * The text fields from a PREIshare property that get embedded.
 * Per the data model, ONLY title + description are embedded;
 * city, property_type and price are display-only and deliberately not here.
 */
export type PropertyEmbeddingInput = {
  title: string
  description: string
}

/** Successful embedding: a fixed-length list of numbers plus which model made it. */
export type EmbeddingSuccess = {
  ok: true
  embedding: number[]
  /** Model id, for handoff notes and debugging (not used in search math). */
  model: string
  /** Always EMBEDDING_DIMENSIONS on success. */
  dimensions: number
}

/** Why an embedding could not be produced. */
export type EmbeddingErrorCode =
  | 'EMPTY_INPUT' // title and description were empty or only spaces; provider not called
  | 'MISSING_API_KEY' // EMBEDDING_API_KEY is not set in the server environment
  | 'PROVIDER_ERROR' // network failure, bad status or unexpected response from the provider
  | 'DIMENSION_MISMATCH' // provider returned a vector whose length is not EMBEDDING_DIMENSIONS

export type EmbeddingFailure = {
  ok: false
  code: EmbeddingErrorCode
  message: string
}

/** Check `result.ok` first: true means `embedding` is safe to store; false means read `code`. */
export type EmbeddingResult = EmbeddingSuccess | EmbeddingFailure
