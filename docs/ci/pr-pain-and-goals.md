# PREIshare PR pain points and Sprint 6 CI goals

**Author:** Ashton Phillips · **Sprint:** 6, Step 1 · Planning notes only, no workflow file yet.

## Client need (in my own words)

When someone opens a pull request on the PREIshare dashboard, nothing checks the change automatically. We only find out it's broken when Vercel fails, or when the live site breaks after merge. PREIshare needs every pull request to run the same build-and-check steps in a clean cloud machine, so broken TypeScript or React code is caught before it reaches `main`. People still decide whether a change is good enough to merge; the machine only proves that the project still installs, typechecks, builds, lints and passes its tests.

## Current PR pain points

- **Nothing runs automatically on a pull request.** No GitHub Actions workflow exists in the repo, so a PR shows no checks at all. "Did it build?" is a question someone has to answer by hand.
- **Checks depend on the person remembering them.** `npm install`, `npm run typecheck` and `npm run build` only happen if the author runs them on their own laptop, and they're easy to skip when rushing.
- **"Works on my machine" problems.** A local setup can hide problems a clean install would catch, like a missing dependency, an out-of-date `routeTree.gen.ts`, or a file that only exists locally.
- **We find out too late, from Vercel.** In Sprint 4, a TanStack Start rule that blocks `*.client.ts` imports in the server build made two Production deploys fail after the code was already on `main`. In Sprint 3, Vercel blocked deploys because of a vulnerable TanStack Start version. Both would have shown up earlier with a build check on the PR.
- **No lint or test scripts exist yet.** `package.json` has `typecheck` and `build` but no `lint` or `test`, so there's no shared way to catch style mistakes or broken logic.
- **Reviewers redo basic work.** A reviewer has to pull the branch and run the build just to know it compiles, instead of spending that time on design, security and data handling.
- **No written line between machine checks and human judgment.** Nothing says what a green check means, or that AI review suggestions are only advice, so a passing check could be mistaken for "safe to merge."

## Automated CI goals (machines should do these on every PR)

Run on every pull request to `main`, and on every new push to that PR, in a fresh cloud machine:

1. **Install** dependencies cleanly from the lockfile (`npm ci`), so missing or mismatched packages fail right away.
2. **Typecheck** with the existing `npm run typecheck` (strict TypeScript).
3. **Build** the TanStack Start / React app with `npm run build`, the same build Vercel runs.
4. **Lint**, once a `lint` script is added and agreed on.
5. **Test**, once a `test` script and a first few tests exist (for example, the pure embedding helpers).
6. **Fail clearly.** If any required step fails, the PR shows a red check that names the failing step, and the log explains why.

## Human review stays in charge

- A person approves the pull request or requests changes. CI never does.
- A person decides whether to merge, **even when every check is green.** Green means "it builds and passes the checks," not "it's correct or safe."
- People judge product and UX risk, security-sensitive code (auth, RLS policies, service-role usage), data handling and anything touching secrets.
- AI review prompts can help a reviewer notice things faster, but they're suggestions only. A named human is accountable for every merge.
- Secrets (Supabase keys, the embedding API key) and production access stay outside the PR checks designed this sprint. CI should not need real secrets to typecheck and build.

## Out of scope for this sprint (do not solve in the goals brief)

- Deploying to Production from the PR workflow. Vercel keeps handling deploys as it does today.
- Auto-merging pull requests, by a bot or by AI.
- Putting real Supabase or embedding keys into CI, or running live database or embedding calls in checks.
- Performance or load testing, and end-to-end browser test suites.
- New app features unrelated to PR quality.

## Success signals

These are things I can check on a real pull request later:

- Opening or pushing to a PR against `main` starts **one** clearly named CI workflow, visible in the PR's Checks area.
- The steps run in order, install → typecheck → build → lint → test, and stop at the first failure.
- A PR with a deliberate TypeScript error shows a **red** check on the PR page, and its log points to the file and line, with no one needing to "try it locally."
- A clean PR shows a **green** check within a few minutes.
- The CI logs contain no secret values.
- An AI-assisted review prompt pack exists that helps reviewers without skipping human approval.
- A short handoff doc explains what's automated and what stays human-owned.
