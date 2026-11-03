#!/usr/bin/env node
// scripts/lint.mjs — PREIshare repo lint (run with `npm run lint`).
//
// Zero-dependency stand-in until ESLint is added (see docs/ci/ci-scripts-notes.md, "Intentional gaps").
// It uses only Node + git, so it runs the same on a laptop and on the PR CI runner.
// Rules come straight from our Sprint 4–6 docs (secret hygiene + CI non-examples):
//   1. no secret-looking values in tracked code or config
//   2. server-only env names never get a VITE_ prefix
//   3. no `debugger` statements in source
//   4. no focused tests (`test.only` / `it.only` / `describe.only`) that silently skip the rest
//   5. CI workflows never hide failures (`continue-on-error`, `|| true`) or call `typecheck:errors`
// Exits 1 (red X in CI) if any rule fails, printing file:line for each problem.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/
const SCANNED = /^(src\/|scripts\/|\.github\/|data\/)|^[^/]+\.(ts|js|mjs|json)$|^\.env\.example$/
const SKIP = new Set(['package-lock.json', 'src/routeTree.gen.ts', 'scripts/lint.mjs'])

/** Secret-looking values: real keys never belong in the repo (names in .env.example are fine). */
const SECRET_PATTERNS = [
  { name: 'Supabase secret key', re: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'JWT-style key (e.g. Supabase anon/service_role)', re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'OpenAI-style key', re: /\bsk-(proj-)?[A-Za-z0-9_-]{20,}/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}/ },
  { name: 'Google AI Studio key', re: /\bAQ\.[A-Za-z0-9_-]{30,}/ },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}/ },
]

const SERVER_ONLY_VITE = /\bVITE_(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|EMBEDDING_API_KEY|OPENAI_API_KEY)\b/

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && SCANNED.test(f) && !SKIP.has(f))

const problems = []
const report = (file, lineNo, rule, detail) => problems.push(`${file}:${lineNo}  [${rule}] ${detail}`)

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue // deleted in the working tree but still tracked
  }
  const isWorkflow = file.startsWith('.github/workflows/')
  const isSource = SOURCE_EXT.test(file)
  const isTest = /\.test\.(ts|tsx|js|mjs)$/.test(file)

  text.split('\n').forEach((line, i) => {
    const n = i + 1
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(line)) report(file, n, 'no-secrets', `looks like a real ${name}; keep it in .env.local / Vercel only`)
    }
    if (SERVER_ONLY_VITE.test(line)) {
      report(file, n, 'no-vite-secrets', 'server-only key must never use the VITE_ prefix (it would ship to the browser)')
    }
    if (isSource && /^\s*debugger\s*;?\s*$/.test(line)) report(file, n, 'no-debugger', 'remove debugger statement')
    if (isTest && /\b(test|it|describe)\.only\s*\(/.test(line)) {
      report(file, n, 'no-focused-tests', '.only skips every other test in CI')
    }
    if (isWorkflow && !line.trim().startsWith('#')) {
      if (/continue-on-error\s*:\s*true/.test(line)) report(file, n, 'ci-no-hidden-failures', 'continue-on-error hides failures')
      if (/\|\|\s*true\b/.test(line)) report(file, n, 'ci-no-hidden-failures', '|| true hides failures')
      if (/typecheck:errors/.test(line)) report(file, n, 'ci-wrong-typecheck', 'use `npm run typecheck`, not `typecheck:errors`')
    }
  })
}

if (problems.length > 0) {
  console.error(`lint: ${problems.length} problem(s) found\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error('\nFix these, then run `npm run lint` again.')
  process.exit(1)
}

console.log(`lint: OK (${files.length} files checked, 0 problems)`)
