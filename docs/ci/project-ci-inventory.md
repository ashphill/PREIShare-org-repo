# PREIshare dashboard — CI project inventory

## Purpose

This lists what the PREIshare repo can run automatically on a GitHub-hosted runner for pull requests, what needs secrets or outside services, and what stays with people. Pipeline design in the next step must use **only** the real package manager and script names found here.

Inputs: `docs/ci/pr-pain-and-goals.md` (pains and goals) and `docs/ci/ci-concepts-notes.md` (CI vocabulary and non-examples).

## Repo facts (from the real project)

- **Package manager:** `npm`
- **Lockfile present:** `package-lock.json` (lockfileVersion 3). No `pnpm-lock.yaml` or `yarn.lock` exists, so there's no conflict. Every dependency in `package.json` also appears in the lockfile's root entry, so `npm ci` should install cleanly.
- **Node version:** not pinned (no `engines` field, `.nvmrc` or `.node-version`). `README.md` says "Node.js 20 or newer."
- **Node/TypeScript app signals:** `package.json` (`"type": "module"`), `tsconfig.json` (strict, `exactOptionalPropertyTypes`, `noEmit`), `tsconfig.typecheck.json`, `src/` with `src/routes/`, `src/lib/`, `src/components/`
- **Framework signals:**
  - React 19 and TanStack Start (`@tanstack/react-start`, `@tanstack/react-router`)
  - `vite.config.ts` plugins: `tanstackStart()`, `nitro()`, `viteReact()`, `tailwindcss()`, `devtools()`
  - File routes in `src/routes/`, with the generated route tree in `src/routeTree.gen.ts`
  - Vite 8, Tailwind v4 and Nitro (the server adapter Vercel uses)
- **Database signals:** `@supabase/supabase-js`, plus `supabase/migrations/` with 4 SQL files (applied by hand in the Supabase SQL Editor, not by a CLI)
- **Test runner:** none found. There's no vitest, jest or test files.
- **Lint tool:** none found. There's no eslint, prettier or lint config.
- **Existing CI:** none. There's no `.github/` folder.

## Scripts discovered in package.json

These are copied exactly from the `"scripts"` block:

| Script name | Exact command (from package.json) | Role |
| --- | --- | --- |
| `dev` | `vite dev --port 3000` | Local dev server (not CI) |
| `generate-routes` | `tsr generate` | Regenerates `src/routeTree.gen.ts` (optional CI check, see risks) |
| `build` | `vite build` | **Build** |
| `preview` | `vite preview` | Serve the built app locally (not CI) |
| `typecheck` | `tsc --noEmit --project tsconfig.typecheck.json` | **Typecheck** (the right one for CI) |
| `typecheck:errors` | `tsc --noEmit` | Typecheck **including** `src/fixtures/invalid-listings.errors.ts`, which has *intentional* type errors, so it always fails. **Never use in CI.** |
| `seed:embeddings` | `npx tsx --env-file=.env.local scripts/seed-property-embeddings.ts` | Writes to Supabase and calls the embedding API (Bucket B, never in PR CI) |

**Missing common checks:**

- typecheck: **present** (`typecheck`)
- build: **present** (`build`)
- lint: **MISSING**
- test: **MISSING**

## Bucket A — Headless-safe on GitHub-hosted runners

These need only a clean checkout, a lockfile install and public tooling. There are no secrets, network calls to Supabase or the embedding API, or a browser. They're in rough order:

1. **Install with `npm ci`.** This is npm's built-in clean install, not a package.json script. It installs exactly what's in `package-lock.json` and fails if the lockfile and `package.json` disagree. It fixes the "works on my machine" and "forgot to install" pains.
2. **Typecheck with `npm run typecheck`.** It catches TypeScript and React type errors before merge, using the strict config and excluding the intentional-error fixture. It fixes the "checks depend on memory" pain.
3. **Build with `npm run build`.** This is the same `vite build` Vercel runs. It catches the kind of failure that broke Production in Sprint 4 (the `*.client.ts` import-protection error), on the PR instead of after merge. It fixes the "we find out too late, from Vercel" pain. It should be headless-safe, because the build reads Supabase and embedding env vars only at **runtime** inside server functions and browser calls, not at build time. This needs to be confirmed on the first CI run (see risks).
4. **Lint: MISSING.** There's no script yet. Leave a placeholder slot in the pipeline design, and add it only after a `lint` script exists.
5. **Test: MISSING.** There's no script yet. Good first headless candidates later are the pure functions `buildEmbeddingText` and `assertEmbeddingDimension` in `src/lib/embeddings/generate.ts`, with the provider mocked.

## Bucket B — Needs secrets, env, or external services

Don't put these in the first PR CI job.

| Check or step | Why it isn't headless-safe | What would be required later |
| --- | --- | --- |
| `npm run seed:embeddings` | It **writes** to the live Supabase database with the service-role key and calls the embedding API (which costs money) | Never on PRs. If ever automated, use a separate protected job with repo secrets, a test Supabase project and manual approval. |
| Applying `supabase/migrations/*.sql` | Migrations are run by hand in the Supabase SQL Editor against the real project, and changing the database from a PR is risky | A separate test or branch database, the Supabase CLI and a Supabase access token as a secret. That's a later sprint. |
| Calling `/api/properties/search` or `match_properties` end to end | It needs the Supabase URL and anon key, the `EMBEDDING_API_KEY` and network access, and each call costs an embedding request | An integration-test job with test secrets and a seeded test database, or a mocked provider |
| Login, sign-up and dashboard data flows (`/login`, `/dashboard/properties`) | They need real Supabase Auth, test accounts and RLS against a live project | An end-to-end browser test setup (out of scope for Sprint 6) |
| Vercel Preview or Production deploy | It's handled by Vercel's own GitHub integration with Vercel-stored env vars, not by our CI | Keep it as is. Deploying from the PR workflow is out of scope (`pr-pain-and-goals.md`). |

## Bucket C — Human judgment (not a green checkmark)

- Whether to **merge**, even when every check is green.
- Product intent and UX: does the page or feature do what PREIshare asked, and is it understandable?
- Security-sensitive design:
  - RLS policies
  - where the service-role key is used
  - `SECURITY INVOKER`/`DEFINER` choices
  - anything that could leak secrets to the browser or into logs
- Data handling: migrations changing real tables, deleting data, seed changes.
- Search quality: whether ranking results "make sense" (`docs/semantic-search-verification.md` was a human judgment).
- AI review suggestions: a person decides whether each one is right. An AI "looks good" isn't a check (`ci-concepts-notes.md`, non-example 2).

## Supabase / env caveats for CI

- **Env var names** referenced by the app or `.env.example`. These are **names only**; values are never committed:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public, read in `src/lib/supabase.client.ts` and `src/lib/supabase.server.ts`)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `EMBEDDING_API_KEY`, `EMBEDDING_API_URL`, `EMBEDDING_MODEL` (server-only, read in `src/lib/embeddings/generate.ts`)
- **Local-only or dashboard-only steps:**
  - running migrations in the Supabase SQL Editor
  - `npm run seed:embeddings` with `.env.local`
  - setting Vercel environment variables in the Vercel dashboard
- **Recommendation for Sprint 6 PR CI:** keep the first pipeline to **Bucket A only** (`npm ci` → `npm run typecheck` → `npm run build`). It needs no GitHub secrets. If the build ever needs `VITE_*` values to succeed, use obvious placeholders, never real keys.

## Risks and open questions

- **Node version isn't pinned.** CI should use Node 20 or newer to match the README, ideally the same major version Vercel uses. Consider adding `engines` or `.nvmrc` later.
- **Watch the two typecheck scripts.** CI must call `typecheck`, not `typecheck:errors`, or every PR will fail on the intentional fixture errors.
- **Not yet run on a clean machine.** I couldn't install dependencies in this check, so whether `typecheck` and `build` pass from a fresh `npm ci` is unproven until the first CI run. Expect the first run to surface any hidden local-only problems; that's the point.
- **`src/routeTree.gen.ts` is committed** but regenerated by the TanStack plugin during dev and build. `typecheck` uses the committed copy, so if a PR adds a route without committing the regenerated file, typecheck could fail while build passes. An optional later check: run `npm run generate-routes` and fail if git shows a diff.
- **`"latest"` versions** (`@tanstack/react-devtools`, `@tanstack/devtools-vite`) are locked in `package-lock.json`, so `npm ci` is stable. Running `npm install` instead could pull new versions, so CI must use `npm ci`.
- **No lint or test** means the first pipeline can only catch type and build errors, not logic bugs.
- **`tsconfig.json` includes `**/*.ts`,** so `scripts/` and `data/` are typechecked too. That's fine, but script changes can fail typecheck.

## Link back to earlier docs

**Pains and goals addressed by Bucket A** (`docs/ci/pr-pain-and-goals.md`):

- "Nothing runs automatically on a pull request": install, typecheck and build run on every PR.
- "Checks depend on the person remembering them": the pipeline always runs them.
- "Works on my machine": a clean `npm ci` on a fresh runner.
- "We find out too late, from Vercel": the same `vite build` runs before merge.
- "Reviewers redo basic work": a green or red signal before deep review.

**Not yet addressed:** lint and test (MISSING scripts), and the machine-vs-human line (Bucket C, covered in later steps).

**CI idea used** (`docs/ci/ci-concepts-notes.md`): one shared pipeline runs the same checks on every PR before merge. A red X blocks merge; a green check starts human review but doesn't replace it.

## Source files inspected

- `package.json` (scripts, dependencies)
- `package-lock.json` (lockfileVersion 3; checked against `package.json`)
- `tsconfig.json`, `tsconfig.typecheck.json` (the excluded fixture)
- `src/fixtures/invalid-listings.errors.ts` (intentional type errors)
- `vite.config.ts`, `app.config.ts`
- `README.md` (Node 20+)
- `.env.example` (variable names only)
- `.gitignore`
- `src/lib/supabase.client.ts`, `src/lib/supabase.server.ts`, `src/lib/embeddings/generate.ts` (where env vars are read)
- `supabase/migrations/` (4 files)
- `src/routeTree.gen.ts`
- No `.github/` folder exists
