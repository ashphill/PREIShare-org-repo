// src/lib/embeddings/generate.ts
// SERVER-ONLY: turns property text into a fixed-length embedding (generation).
// Saving the vector into Postgres (storage) is a separate step: seed/backfill code
// calls this function, then writes `embedding` to the `properties` row.
//
// Contract: text in -> { ok: true, embedding: number[1536] } or { ok: false, code }.
// Secrets: the API key is read ONLY from the server environment (EMBEDDING_API_KEY).
// Never import this file from browser code and never give the key a VITE_ prefix.

import { DEFAULT_EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from './types'
import type { EmbeddingResult, PropertyEmbeddingInput } from './types'

/**
 * Default: Google Gemini's OpenAI-compatible embeddings endpoint (free tier).
 * Any OpenAI-compatible provider works via EMBEDDING_API_URL, as long as it returns 1536 numbers.
 */
const DEFAULT_EMBEDDING_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/embeddings'

/** Read a server env var at call time (works with tsconfig "types": ["vite/client"]). */
function readServerEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env
  const value = env?.[name]?.trim()
  return value ? value : undefined
}

/**
 * Build the exact text that gets embedded (the data model's canonical recipe):
 * title, a blank line, then description. Each field is trimmed, nothing else changes.
 * Pure function: same input always gives the same string. Empty fields are skipped,
 * so two empty fields give '' (which generatePropertyEmbedding rejects).
 */
export function buildEmbeddingText(input: PropertyEmbeddingInput): string {
  return [input.title, input.description]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join('\n\n')
}

/**
 * Manual check for local verification: true only when `embedding` is an array of
 * exactly `expected` finite numbers. Use it before seeding to prove the shape, e.g.
 *   const result = await generatePropertyEmbedding({ title: 'Lakeside A-frame', description: 'Quiet cove' })
 *   console.log(result.ok && assertEmbeddingDimension(result.embedding)) // true
 */
export function assertEmbeddingDimension(embedding: unknown, expected: number = EMBEDDING_DIMENSIONS): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === expected &&
    embedding.every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}

/**
 * The one public entry point: embed a property's title + description.
 * - Empty/whitespace input -> EMPTY_INPUT (provider is NOT called).
 * - No EMBEDDING_API_KEY -> MISSING_API_KEY.
 * - Network/HTTP/response problems -> PROVIDER_ERROR.
 * - Wrong vector length -> DIMENSION_MISMATCH (never returned as success).
 */
export async function generatePropertyEmbedding(input: PropertyEmbeddingInput): Promise<EmbeddingResult> {
  const text = buildEmbeddingText(input)
  if (!text) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Property title and description are empty; nothing to embed.' }
  }
  return embedText(text)
}

/**
 * Embed a buyer's search query with the SAME model and length as the listings,
 * so query and property vectors are comparable. (Queries are embedded as typed, trimmed.)
 */
export async function generateQueryEmbedding(query: string): Promise<EmbeddingResult> {
  const text = query.trim()
  if (!text) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Search query is empty; nothing to embed.' }
  }
  return embedText(text)
}

/** Shared path: env check, provider call, then dimension validation. */
async function embedText(text: string): Promise<EmbeddingResult> {
  if (typeof window !== 'undefined') {
    // Defense in depth: this module must never run in the browser (it reads a secret).
    return { ok: false, code: 'PROVIDER_ERROR', message: 'Embeddings can only be generated on the server.' }
  }

  const apiKey = readServerEnv('EMBEDDING_API_KEY')
  if (!apiKey) {
    return {
      ok: false,
      code: 'MISSING_API_KEY',
      message: 'Set EMBEDDING_API_KEY in .env.local (local) or your host\'s server env before generating embeddings.',
    }
  }

  const model = readServerEnv('EMBEDDING_MODEL') ?? DEFAULT_EMBEDDING_MODEL

  let embedding: unknown
  try {
    embedding = await callEmbeddingProvider(text, apiKey, model)
  } catch (err) {
    // Never include the API key in messages; provider errors are summarized only.
    const message = err instanceof Error ? err.message : 'Unknown provider error'
    return { ok: false, code: 'PROVIDER_ERROR', message }
  }

  if (!assertEmbeddingDimension(embedding)) {
    const got = Array.isArray(embedding) ? embedding.length : typeof embedding
    return {
      ok: false,
      code: 'DIMENSION_MISMATCH',
      message: `Expected ${EMBEDDING_DIMENSIONS} numbers from model "${model}", got ${got}. Align the model, EMBEDDING_DIMENSIONS and the vector(1536) column.`,
    }
  }

  return { ok: true, embedding: embedding as number[], model, dimensions: EMBEDDING_DIMENSIONS }
}

/** Provider details stay private to this file so seed/search code only sees one stable function. */
async function callEmbeddingProvider(text: string, apiKey: string, model: string): Promise<unknown> {
  const url = readServerEnv('EMBEDDING_API_URL') ?? DEFAULT_EMBEDDING_API_URL
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // `dimensions` asks the model for exactly this length (gemini-embedding-001 supports 1536).
    body: JSON.stringify({ model, input: text, dimensions: EMBEDDING_DIMENSIONS }),
  })

  if (!response.ok) {
    // Read a short reason from the provider body, if any, without echoing headers or the key.
    let reason = ''
    try {
      const body = (await response.json()) as { error?: { message?: string } }
      reason = body.error?.message ? `: ${body.error.message}` : ''
    } catch {
      // ignore unreadable error bodies
    }
    throw new Error(`Embedding provider returned HTTP ${response.status}${reason}`)
  }

  const body = (await response.json()) as { data?: Array<{ embedding?: unknown }> }
  const embedding = body.data?.[0]?.embedding
  if (embedding === undefined) {
    throw new Error('Embedding provider response had no data[0].embedding')
  }
  return embedding
}
