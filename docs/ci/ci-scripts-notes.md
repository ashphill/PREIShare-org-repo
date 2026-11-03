# CI scripts notes — PREIshare dashboard

These notes connect your laptop to the GitHub runner. Every command here is exactly what `.github/workflows/pr-ci.yml` runs, in the same order. If CI is red, run the same commands locally (see the end of this doc) to reproduce it.

Sources: `docs/ci/pipeline-design.md` (order and policies) and `docs/ci/project-ci-inventory.md` (real scripts).

## Package manager

- **CI uses:** `npm`
- **Lockfile:** `package-lock.json` (the only lockfile). CI installs with `npm ci`, never `npm install`.
- **Node version:** **22** in CI (`actions/setup-node`, `node-version: "22"`). The README says "Node.js 20 or newer," and 22 fits that. `npm run test` **needs Node 22.6 or newer**, because Node's built-in runner strips TypeScript types itself. Check yours with `node -v`.

## Scripts CI calls (match `package.json` and `pr-ci.yml`)

| # | CI step | package.json script | Exact local command | Purpose |
| --- | --- | --- | --- | --- |
| 1 | Install | none (npm built-in) | `npm ci` | Clean install exactly from `package-lock.json`. Fails if the lockfile and `package.json` disagree. |
| 2 | Lint | `lint` → `node scripts/lint.mjs` | `npm run lint` | Repo hygiene: no real secret values, no `VITE_` prefix on server-only keys, no `debugger`, no `.only` tests, no hidden CI failures |
| 3 | Typecheck | `typecheck` → `tsc --noEmit --project tsconfig.typecheck.json` | `npm run typecheck` | Strict TypeScript with no output files. It leaves out the intentional-error fixture. |
| 4 | Test | `test` → `node --test --experimental-strip-types "src/**/*.test.ts"` | `npm run test` | Unit tests, run once with no watch mode, so the job always finishes. Offline, with the embedding provider faked. |
| 5 | Build | `build` → `vite build` | `npm run build` | The same production build Vercel runs |

Each step only runs if the one before passed. Any failure gives a **red X**, and no step has `continue-on-error`.

**Never in CI:**

- `npm run typecheck:errors` (always fails on purpose because of `src/fixtures/invalid-listings.errors.ts`)
- `npm run seed:embeddings` (live database and paid API)
- `dev` and `preview`

## package.json script entries added this step

These need **no new dependencies**, because they use only Node and git, which the inventory already has. `package-lock.json` didn't change, so `npm ci` still works.

```json
{
  "scripts": {
    "lint": "node scripts/lint.mjs",
    "test": "node --test --experimental-strip-types \"src/**/*.test.ts\""
  }
}
```

Supporting files:

- **`scripts/lint.mjs`:** the zero-dependency lint. Rules and reasons are in the file header. It prints `file:line [rule]` for each problem and exits 1 if any exist.
- **`src/lib/embeddings/generate.test.ts`:** 8 offline tests covering:
  - `buildEmbeddingText` (title + blank line + description, trimming)
  - `assertEmbeddingDimension` (exactly 1536 finite numbers)
  - `generatePropertyEmbedding` returning `EMPTY_INPUT`, `MISSING_API_KEY`, success, `DIMENSION_MISMATCH` and `PROVIDER_ERROR` (the provider is a fake `fetch`)
- **`src/lib/embeddings/generate.ts`:** its imports now say `./types.ts` with the extension, so Node's test runner can load it. The tsconfig already allows `.ts` extensions (`allowImportingTsExtensions`).

**Writing a new test:** name the file `something.test.ts` anywhere under `src/`, use `node:test` and `node:assert/strict`, import relative files **with** the `.ts` extension, and don't call real services.

## Verified locally (2026-11-03, Node 22)

- `npm run lint` → `lint: OK (73 files checked, 0 problems)`. A planted fake key, `debugger` and a `VITE_EMBEDDING_API_KEY` were each caught, with exit code 1.
- `npm run test` → `# pass 8`, `# fail 0`.
- Not yet run in this environment: `npm ci`, `npm run typecheck` and `npm run build`, because packages couldn't be downloaded here. The first PR run on GitHub is their real test.

## Intentional gaps

- **No ESLint yet.** `scripts/lint.mjs` covers our security and CI-hygiene rules but not React and TypeScript code-style rules. Adding ESLint means new dev dependencies and a lockfile update, which someone has to do locally:
  1. Run `npm install -D eslint @eslint/js typescript-eslint`.
  2. Add an `eslint.config.js`.
  3. Fix any findings, then commit **both** `package.json` and `package-lock.json`.
- **No browser end-to-end suite** (Playwright or Cypress). Login, dashboard and search flows need live Supabase and API keys (Bucket B). They stay manual for now.
- **Tests cover only the embedding module.** There are no React component tests and nothing that touches the database. The next good candidates are `src/lib/listings/schema.ts` validators and `clampMatchCount` in `src/lib/property-search.ts`.
- **No secrets in CI.** Supabase and embedding keys are never needed or used. Production deploys stay with Vercel, outside this workflow.

## How to reproduce a CI failure locally

Run these in the same order as the workflow, from the project root in the VS Code terminal:

1. In GitHub Desktop, switch to the PR's branch and click **Pull**.
2. Check `node -v` is **22.6 or newer**.
3. Run `npm ci`.
4. Run `npm run lint`.
5. Run `npm run typecheck`.
6. Run `npm run test`.
7. Run `npm run build`.
8. Fix the first one that fails, rerun from that step until everything passes, then commit and push. CI re-runs automatically on the PR.

Shortcut for steps 4–7 together, which stops at the first failure just like CI:

```
npm run lint && npm run typecheck && npm run test && npm run build
```
