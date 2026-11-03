# CI concepts notes — PREIshare dashboard

My notes for Sprint 6, Step 2. Every idea here maps back to a pain or goal in `docs/ci/pr-pain-and-goals.md`. This is concepts only; there's no workflow file yet.

## In my own words

**Continuous integration (CI)**

CI means the same install and quality checks run **automatically** every time someone proposes a change, which for us means every pull request. They run on a clean shared machine, not on someone's laptop. The point is to find out right away whether a change breaks the dashboard, *before* it lands on `main` and before Vercel tries to deploy it.

**Pipeline / workflow**

A pipeline is the ordered recipe of checks; GitHub calls it a "workflow." For PREIshare the recipe is:

1. Get the PR's code.
2. Install dependencies.
3. Typecheck.
4. Build.
5. Lint and test, once we have those scripts.

People write the recipe once, and a cloud machine follows it the same way every time. If a step fails, the later steps don't run.

**Green check vs red X**

- **Green check:** every required step passed. It means the code installs, typechecks and builds. It's a signal that a person can start reviewing, **not** permission to merge without thinking. Green says nothing about whether the feature is right, safe or well designed.
- **Red X:** at least one step failed. Don't merge. The author opens the log, fixes the problem and pushes again, which re-runs the checks. A red X should never be ignored or "merged anyway."

**Why every pull request (for PREIshare)**

Our pains include:

- PRs show no checks at all.
- Checks only happen if the author remembers to run them.
- Laptops can hide problems a clean install would catch.
- We found broken builds too late, from Vercel, *after* merge. Sprint 4's `*.client.ts` build failure is the real example.

If the checks only run on some PRs, or only after merge, those same problems come back. Running one shared pipeline on **every** PR gives every teammate and reviewer the same signal, catches breakages before `main`, and keeps the Production deploy from being our first test.

## Pain → CI idea map

| Pain (from `pr-pain-and-goals.md`) | CI idea |
| --- | --- |
| Nothing runs automatically on a pull request | A workflow that starts by itself whenever a PR is opened or updated |
| Checks depend on the person remembering them | The pipeline always runs install, typecheck and build, so there's nothing to remember |
| "Works on my machine" problems | One clean shared runner: a fresh `npm ci` from the lockfile with a set Node version, the same for everyone |
| We find out too late, from Vercel | The same `npm run build` Vercel runs happens on the PR, *before* merge |
| No lint or test scripts exist yet | Pipeline slots for lint and test, filled in once the scripts exist (CI can only run checks that exist) |
| Reviewers redo basic work | A red X stops deep review until the basics pass, and a green check means the reviewer can skip "does it build?" |
| No written line between machine checks and human judgment | **Not solvable by CI alone.** This is a human-review gap. We need a written rule that green isn't approval and that AI comments are advice. Later steps will cover it. |

## Non-examples ("CI washing"): not real CI

1. **Only running `npm run build` on my laptop.** It's private and optional, so the reviewer never sees it and a different machine could give a different result.
2. **Merging because an AI comment said "looks good" when no checks ran.** An AI review is an opinion, not an automatic install, typecheck and build, so nothing proves the code works.
3. **A workflow file in `.github/workflows/` that never triggers on `pull_request`.** For example, it only runs when clicked by hand. The recipe exists, but it doesn't run when changes are proposed, so PRs still have no checks.
4. **Letting Vercel's Production deploy be the only check.** It runs *after* merge, so broken code is already on `main`, which is exactly what happened in Sprint 4.
5. **A workflow that hides failures.** For example, a step marked "allowed to fail," or errors piped to nowhere. It always shows green, so the signal means nothing.

## What I will demand from later agent-written YAML (preview)

- It triggers on pull requests to `main` (and pushes to them), not only on manual clicks.
- Its steps are clear and in order: install (`npm ci`) → typecheck → build, then lint and test once those scripts exist.
- Any failing step fails the job and shows a red X. Nothing is ignored or allowed to fail silently.
- It needs no real secrets to typecheck and build, and puts no secret values in logs.
- It never deploys to Production and never merges automatically. Merge decisions stay with people.

## Open questions for inventory/design steps

- Which scripts does the repo actually have? From `package.json`: `typecheck` and `build` exist; `lint` and `test` don't. Which ones should we add?
- Does `npm run build` need any env vars to succeed in CI? Can it build with placeholder values?
- Which Node version should CI use to match Vercel?
- Is `src/routeTree.gen.ts` regenerated during the build, or does CI need to check it's up to date?
- Which checks must stay human: UX, security (RLS and service-role use), data handling?
