# PREIshare PR CI — Pipeline Design

## Purpose

This is the plain-language design for the automated checks that run on every pull request for the PREIshare dashboard. It's the source of truth for the GitHub Actions workflow we'll write next (`.github/workflows/pr-ci.yml`).

It does **not** deploy anything, and it does **not** replace human review.

Built from:

- `docs/ci/pr-pain-and-goals.md`: why we need it
- `docs/ci/ci-concepts-notes.md`: what CI, green and red mean, plus the CI-washing non-examples to avoid
- `docs/ci/project-ci-inventory.md`: the only scripts we're allowed to use

## Trigger

- **Event:** `pull_request`, when a PR is opened, gets new commits (`synchronize`) or is reopened. These are the default `pull_request` activity types.
- **Branches:** PRs targeting `main`, PREIshare's only integration branch and the one Vercel deploys to Production.
- **Not the only trigger:** push-to-main alone or a manual button would be CI washing (non-examples 3 and 4 in `ci-concepts-notes.md`). A manual re-run button can be added later as an *extra*, never a replacement.
- **Goal:** every proposed change gets the same install → check → build loop before anyone discusses merging.
- **Overlapping runs:** if a new commit is pushed while an older run for the same PR is still going, cancel the older run. Only the latest commit's result matters, and it saves runner minutes.

## Ordered stages (happy path)

1. **Checkout.** Fetch the PR's code (the merge of the PR into `main`, which is GitHub's default for `pull_request`) so the runner checks what would actually land.
2. **Setup Node.** Install **Node.js 22**. The README says "Node.js 20 or newer"; it was 20 at first, then raised to 22 in Step 8 because `npm run test` uses Node's built-in TypeScript type stripping, which needs Node 22.6 or newer. Turn on npm caching here (see Caching intent).
3. **Install dependencies.** Run `npm ci` for a clean install exactly from `package-lock.json`. It fails if the lockfile and `package.json` disagree.
4. **Lint.** Run `npm run lint` (`node scripts/lint.mjs`, added in Step 8). It's the zero-dependency hygiene lint: no secrets, no `VITE_` server keys, no `debugger` or `.only`, no hidden CI failures. ESLint is still a gap (see `ci-scripts-notes.md`).
5. **Typecheck.** Run `npm run typecheck` (strict TypeScript, no output files). It's fast, so it runs before the slower build.
6. **Test.** Run `npm run test` (Node's built-in test runner, run once with no watch mode, offline; added in Step 8). It starts with the embedding helpers.
7. **Build.** Run `npm run build` (`vite build`), the same build Vercel runs, so broken imports or config (like the Sprint 4 `*.client.ts` failure) fail on the PR, not after merge.

**Why this order:**

- Checkout and Node have to come before install.
- Install has to come before anything that needs `node_modules`.
- Typecheck (fast, cheap) comes before build (slower), so most mistakes show up quickly.
- Each stage only runs if the one before it passed.
- Lint and test will slot in at positions 4 and 6 once those scripts exist, with no reordering.

## Commands / scripts (from inventory)

| Stage | Script or command (from `project-ci-inventory.md`) | Required on PR? | Inventory source |
| --- | --- | --- | --- |
| Checkout | GitHub checkout (no script) | Yes | n/a |
| Setup Node | Node 22, npm cache on | Yes | README "Node.js 20 or newer"; 22 needed by `test` |
| Install | `npm ci` | Yes | Bucket A #1; `package-lock.json` (lockfileVersion 3) |
| Lint | `npm run lint` (= `node scripts/lint.mjs`) | Yes | Added in Step 8 (was MISSING in the inventory) |
| Typecheck | `npm run typecheck` (= `tsc --noEmit --project tsconfig.typecheck.json`) | Yes | Scripts table: `typecheck`; Bucket A #2 |
| Test | `npm run test` (= `node --test --experimental-strip-types "src/**/*.test.ts"`) | Yes | Added in Step 8 (was MISSING in the inventory) |
| Build | `npm run build` (= `vite build`) | Yes | Scripts table: `build`; Bucket A #3 |

**Never used in CI:**

- `npm run typecheck:errors`, which always fails on the intentional-error fixture `src/fixtures/invalid-listings.errors.ts`
- `npm run seed:embeddings` (Bucket B: live database and paid API)
- `dev` and `preview` (local servers)

## Failure policy

- **Any required stage failing fails the CI job** and shows a **red X** on the PR. Later stages don't run.
- **No `continue-on-error: true`** on install, typecheck or build. No `|| true`, no swallowed exit codes. A required check that can't fail is CI washing (non-example 5).
- **Optional checks** (none exist now) must be clearly labeled optional and listed separately, so they never hide or confuse a required failure.
- **On red:** don't merge. The author reads the log, fixes the problem and pushes again, which re-runs CI automatically.
- **On green:** it only means install, typecheck and build passed. **People still decide whether to merge.** CI reports; it doesn't approve.
- **Later (not this step):** once the workflow is proven, consider making this check *required* in GitHub branch protection for `main`, so a red PR can't be merged by accident. A person sets that up in GitHub settings.

## Caching intent

- **Cache npm downloads**, keyed on `package-lock.json`, so repeat PRs install faster. The cache refreshes automatically whenever the lockfile changes.
- **Don't cache `node_modules` or build output** (`dist`, `.output`, `.tanstack`, `.nitro`) between runs. Every PR must build from a clean install so stale files can't hide a real failure.
- The exact cache setting goes in the workflow YAML next. This only records the intent.

## Environment and secrets

- **The first pipeline needs no secrets.** Typecheck and build read only committed code and config. Supabase and embedding keys are read at **runtime** (in server functions and browser calls), not at build time, according to the inventory.
- **No GitHub repository secrets** are added for this workflow.
- **If the build turns out to need `VITE_*` values,** use clearly fake placeholders (like `https://placeholder.supabase.co`) written in the workflow, **never real keys**. Write down why in this doc.
- **Never in PR CI:** `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_API_KEY`, real `VITE_SUPABASE_ANON_KEY` or `SUPABASE_URL` values.
- **No secret values in logs,** and no steps that print environment variables.
- **No connection to any Supabase project** (Production or otherwise).
- **Least privilege:** the workflow only needs permission to read the repo's contents.

## Explicitly out of scope for this PR pipeline

- **Deploying** to Production or Preview from this workflow. Vercel's own GitHub integration keeps handling deploys.
- **Live Supabase changes:** running migrations, `npm run seed:embeddings`, or any reads or writes against a real database.
- **Calls to the embedding API**, or end-to-end search, login or dashboard tests (all Bucket B).
- **ESLint and browser end-to-end tests** (gaps, see `docs/ci/ci-scripts-notes.md`).
- **Manual QA, product acceptance and final merge approval,** which stay with people (Bucket C).
- **AI auto-merge** or automatic approval of PRs. AI review prompts later are advice for people only.
- **Branch protection settings** (a person does that in GitHub after the workflow is proven).

## Mapping back to PREIshare goals

| Required stage | Pain it fixes (`pr-pain-and-goals.md`) | Inventory row |
| --- | --- | --- |
| Trigger on `pull_request` | "Nothing runs automatically on a pull request" | No `.github/` today |
| `npm ci` on a fresh runner | "Checks depend on the person remembering them" and "works on my machine" | Bucket A #1 |
| `npm run typecheck` | Type errors caught before review, without anyone remembering to run them | `typecheck` script |
| `npm run build` | "We find out too late, from Vercel" (Sprint 4 build failures) | `build` script |
| Red X stops on the first failure | "Reviewers redo basic work": no deep review until basics pass | Failure policy |

- **Human boundary:** CI gives one consistent signal. Reviewers still own judgment on UX, security (RLS, service-role use), data changes and merge. Later AI review prompts support that judgment; they don't replace it (Bucket C).
- **Not yet addressed:** lint and test (MISSING scripts).

## Open questions / gaps

- [x] **Lint script:** added in Step 8 (`scripts/lint.mjs`). Still open: add ESLint, which needs a local `npm install -D` and a lockfile commit.
- [x] **Test script:** added in Step 8 (Node's built-in runner, 8 tests for `src/lib/embeddings/generate.ts`).
- [ ] **Node version not pinned.** We're using 20 from the README. Should we add `.nvmrc` or `engines` so local, CI and Vercel agree?
- [ ] **Does the build pass on a clean runner** with no env vars at all? The first CI run will tell us. If not, add placeholders (see Environment and secrets).
- [ ] **Committed `src/routeTree.gen.ts`.** Should CI also run `npm run generate-routes` and fail if the file changes? That's optional and not in the first version.
- [ ] **Tests that need a database** stay out until there's a safe test Supabase project, or they're mocked.

## Sign-off for next step

When this design is stable, Step 6 may scaffold `.github/workflows/pr-ci.yml` from **these stages only**:

checkout → setup Node 22 with npm cache → `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` (lint and test added in Step 8)

It runs on `pull_request` to `main`, with read-only permissions, no secrets, and no deploy or database steps.
