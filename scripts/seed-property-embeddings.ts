// scripts/seed-property-embeddings.ts
// Loads data/sample-properties.json, generates an embedding for each listing with
// src/lib/embeddings/generate.ts, and upserts the rows into public.properties.
//
// RUN (from the project root, after the pgvector migration is applied):
//   npm run seed:embeddings
// which runs: npx tsx --env-file=.env.local scripts/seed-property-embeddings.ts
//
// Needs these in .env.local (never commit real values; see .env.example):
//   SUPABASE_URL               project URL
//   SUPABASE_SERVICE_ROLE_KEY  server-only admin key; RLS has no insert policy on
//                              properties, so seeding must use the service role.
//                              This script runs locally only, never in the browser.
//   EMBEDDING_API_KEY          embedding provider key (read inside generate.ts)
//
// Safe to re-run: every sample has a fixed uuid, so rows are UPSERTED (updated in
// place), never duplicated. Exits with code 1 if any row fails or a vector is the
// wrong length.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { assertEmbeddingDimension, generatePropertyEmbedding } from '../src/lib/embeddings/generate'
import { EMBEDDING_DIMENSIONS } from '../src/lib/embeddings/types'
import { createServiceRoleSupabaseClient } from '../src/lib/supabase.server'
import type { Database } from '../src/lib/supabase/types'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']

/** One sample listing in data/sample-properties.json (same names as the table columns). */
type SampleProperty = {
  id: string
  title: string
  description: string
  city: string | null
  property_type: string | null
  price: number | null
}

/** pgvector accepts a vector as text like "[0.1,0.2,...]". */
function toPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

async function loadSamples(): Promise<SampleProperty[]> {
  const filePath = path.join(process.cwd(), 'data', 'sample-properties.json')
  const raw = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw) as { properties?: SampleProperty[] }
  const properties = parsed.properties ?? []
  if (properties.length === 0) {
    throw new Error(`No properties found in ${filePath}`)
  }
  return properties
}

async function main(): Promise<void> {
  const samples = await loadSamples()
  console.log(`Seeding ${samples.length} sample properties (expecting ${EMBEDDING_DIMENSIONS}-number embeddings)...`)

  const supabase = createServiceRoleSupabaseClient()
  let failures = 0

  for (const sample of samples) {
    // 1) Generation: title + blank line + description -> 1536 numbers (via generate.ts).
    const result = await generatePropertyEmbedding({ title: sample.title, description: sample.description })

    if (!result.ok) {
      console.error(`FAILED ${sample.id} (${sample.title}): ${result.code} - ${result.message}`)
      failures += 1
      // A missing key will fail every row the same way, so stop early.
      if (result.code === 'MISSING_API_KEY') break
      continue
    }

    // Double-check the length matches the migration's vector(1536) before writing.
    if (!assertEmbeddingDimension(result.embedding, EMBEDDING_DIMENSIONS)) {
      console.error(
        `FAILED ${sample.id}: embedding has ${result.embedding.length} numbers, migration expects ${EMBEDDING_DIMENSIONS}.`,
      )
      failures += 1
      continue
    }

    // 2) Storage: upsert by fixed id so re-runs update instead of duplicating.
    const row: PropertyInsert = {
      id: sample.id,
      title: sample.title,
      description: sample.description,
      city: sample.city,
      property_type: sample.property_type,
      price: sample.price,
      embedding: toPgVector(result.embedding),
    }

    const { error } = await supabase.from('properties').upsert(row, { onConflict: 'id' })
    if (error) {
      console.error(`FAILED ${sample.id} (${sample.title}): database error - ${error.message}`)
      failures += 1
      continue
    }

    console.log(`Seeded ${sample.id}  "${sample.title}"  embedding length: ${result.embedding.length}`)
  }

  if (failures > 0) {
    console.error(`\nDone with ${failures} failure(s). Fix the errors above and re-run (it is safe to re-run).`)
    process.exit(1)
  }

  console.log(`\nAll ${samples.length} properties seeded with ${EMBEDDING_DIMENSIONS}-number embeddings.`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
