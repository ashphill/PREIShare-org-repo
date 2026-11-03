/// <reference types="node" />
// src/lib/embeddings/generate.test.ts
// Unit tests for the embedding module, run by `npm run test` (Node's built-in test runner).
// Fully offline: the embedding provider is replaced with a fake `fetch`, so no API key,
// network, or Supabase is needed. Safe for PR CI (Bucket A in docs/ci/project-ci-inventory.md).
import { afterEach, beforeEach, test } from 'node:test'
import * as assert from 'node:assert/strict'
import { assertEmbeddingDimension, buildEmbeddingText, generatePropertyEmbedding } from './generate.ts'
import { EMBEDDING_DIMENSIONS } from './types.ts'

const realFetch = globalThis.fetch
const savedKey = process.env.EMBEDDING_API_KEY

/** Replace the provider with a fake that returns `body` with `status`. */
function fakeProvider(body: unknown, status = 200): void {
  globalThis.fetch = (async () => new Response(JSON.stringify(body), { status })) as typeof fetch
}

beforeEach(() => {
  process.env.EMBEDDING_API_KEY = 'test-key-not-real'
})

afterEach(() => {
  globalThis.fetch = realFetch
  if (savedKey === undefined) delete process.env.EMBEDDING_API_KEY
  else process.env.EMBEDDING_API_KEY = savedKey
})

test('buildEmbeddingText joins trimmed title and description with a blank line', () => {
  assert.equal(
    buildEmbeddingText({ title: '  Lakeside A-frame ', description: ' Quiet cove with a dock. ' }),
    'Lakeside A-frame\n\nQuiet cove with a dock.',
  )
})

test('buildEmbeddingText skips empty fields', () => {
  assert.equal(buildEmbeddingText({ title: 'Only a title', description: '   ' }), 'Only a title')
  assert.equal(buildEmbeddingText({ title: ' ', description: '' }), '')
})

test('assertEmbeddingDimension accepts exactly EMBEDDING_DIMENSIONS finite numbers', () => {
  assert.equal(EMBEDDING_DIMENSIONS, 1536)
  assert.equal(assertEmbeddingDimension(new Array<number>(1536).fill(0.1)), true)
  assert.equal(assertEmbeddingDimension(new Array<number>(384).fill(0.1)), false)
  assert.equal(assertEmbeddingDimension([...new Array<number>(1535).fill(0.1), Number.NaN]), false)
  assert.equal(assertEmbeddingDimension('not a vector'), false)
})

test('empty input returns EMPTY_INPUT without calling the provider', async () => {
  let called = false
  globalThis.fetch = (async () => {
    called = true
    return new Response('{}')
  }) as typeof fetch
  const result = await generatePropertyEmbedding({ title: '  ', description: '' })
  assert.equal(result.ok, false)
  assert.equal(result.ok ? null : result.code, 'EMPTY_INPUT')
  assert.equal(called, false)
})

test('missing API key returns MISSING_API_KEY', async () => {
  delete process.env.EMBEDDING_API_KEY
  const result = await generatePropertyEmbedding({ title: 'Cabin', description: 'By the lake' })
  assert.equal(result.ok ? null : result.code, 'MISSING_API_KEY')
})

test('a 1536-number provider response is returned as success', async () => {
  fakeProvider({ data: [{ embedding: new Array<number>(1536).fill(0.01) }] })
  const result = await generatePropertyEmbedding({ title: 'Cabin', description: 'By the lake' })
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.dimensions, 1536)
    assert.equal(result.embedding.length, 1536)
  }
})

test('a wrong-length vector returns DIMENSION_MISMATCH, never success', async () => {
  fakeProvider({ data: [{ embedding: [1, 2, 3] }] })
  const result = await generatePropertyEmbedding({ title: 'Cabin', description: 'By the lake' })
  assert.equal(result.ok ? null : result.code, 'DIMENSION_MISMATCH')
})

test('a provider HTTP error returns PROVIDER_ERROR', async () => {
  fakeProvider({ error: { message: 'Invalid API key' } }, 401)
  const result = await generatePropertyEmbedding({ title: 'Cabin', description: 'By the lake' })
  assert.equal(result.ok ? null : result.code, 'PROVIDER_ERROR')
})
