# Branch protection checklist (PREIshare PR CI)

## Purpose

This connects the automatic green/red signal from `.github/workflows/pr-ci.yml` to the merge rules for `main`, so a red check actually **blocks** a merge instead of just being a warning.

**Status: prepared, not enabled.** This document is a checklist only. Branch protection has **not** been turned on. Changing it needs **admin** rights on `ashphill/PREIShare-org-repo` (GitHub: **Settings → Branches**, or **Settings → Rules → Rulesets**). A contributor without admin rights prepares and verifies this list, and a maintainer flips the settings.

Sources: `.github/workflows/pr-ci.yml`, `docs/ci/pipeline-design.md` (trigger, failure policy, out of scope), `docs/ci/pr-pain-and-goals.md` (people own merge).

## Protected branches

- [ ] Protect `main`. It's the only merge target in `docs/ci/pipeline-design.md` and the branch Vercel deploys to Production. Don't add other branches unless the design doc changes first.

## Required status checks

GitHub only lists a check in branch protection **after it has run at least once on a PR**, so open one test PR first.

- [ ] Turn on **Require status checks to pass before merging**.
- [ ] Add the required check by the job name in the workflow. `jobs.ci.name` in `.github/workflows/pr-ci.yml` is:
  - **`Install, lint, typecheck, test, build`**
  - On a PR it appears as **`PR CI / Install, lint, typecheck, test, build (pull_request)`**. In the branch-protection search box, type the job name `Install, lint, typecheck, test, build` and pick the one from GitHub Actions.
  - Copy the exact name shown on a real PR check run. If the job is ever renamed, this required check must be updated too, or merges will wait forever for a check that no longer exists.
- [ ] Turn on **Require branches to be up to date before merging**, so the last green run reflects the PR merged with the *current* `main`. Turn it on once PRs are frequent enough that `main` often moves while a PR is open. It costs a CI re-run after each `main` update, which is fine at our size.

## What CI already enforces (automated)

These are the steps from `pr-ci.yml`, in order. Any failure gives a red X, and nothing uses `continue-on-error`.

1. Dependency install: `npm ci` (clean install from `package-lock.json`)
2. Lint: `npm run lint`
3. Typecheck: `npm run typecheck`
4. Tests: `npm run test`
5. Production build: `npm run build`

It triggers on `pull_request` to `main` (types `opened`, `synchronize`, `reopened`), so every new commit on an open PR re-runs it. A newer push cancels the older run for the same PR.

## What people still own (not optional)

- [ ] Turn on **Require a pull request before merging**, with **at least 1 approval**. A person approves; CI never does.
- [ ] Turn on **Dismiss stale approvals when new commits are pushed** (recommended), so an approval covers the code actually being merged.
- [ ] AI-assisted review prompts (a later step) are **helpers only**. Never auto-merge on AI output, and an AI "looks good" never counts as an approval.
- [ ] A person reviews what CI can't judge: product intent and UX, security-sensitive changes (RLS policies, service-role key use, anything that could expose secrets), data and migration changes, and search-quality changes.
- [ ] Green means "automated checks passed," not "safe to merge." The reviewer still decides.

## What not to require yet

- [ ] Don't require Vercel Preview or Production deploy checks. Deploys are out of scope for PR CI (`pipeline-design.md`). Vercel may post its own status, so leave it informational.
- [ ] Don't require optional, flaky or not-yet-existing checks, like ESLint or browser end-to-end tests (gaps listed in `docs/ci/ci-scripts-notes.md`).
- [ ] Don't add secrets (Supabase keys, `EMBEDDING_API_KEY`) to the PR workflow just to make a check pass.
- [ ] Don't turn on auto-merge for now.
- [ ] Consider leaving **Do not allow bypassing the above settings** (include administrators) **off** at first, so a maintainer can recover if CI itself breaks. Turn it on once CI has been stable for a while.

## Readiness sign-off

- [x] Workflow file path: `.github/workflows/pr-ci.yml`
- [x] Triggers: `pull_request` to `main`, types `opened`, `synchronize`, `reopened`
- [x] Concurrency: group `pr-ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}`, `cancel-in-progress: true`
- [x] Required check job name: `Install, lint, typecheck, test, build`
- [x] No secrets, deploy jobs or Supabase steps in the workflow
- [x] Workflow has run green at least once on a real PR: draft PR #3, run 41612327083 (2026-11-03); see `docs/ci/e2e-verification-log.md`
- [ ] Maintainer who can edit branch protection: __________________
- [ ] Date the settings were enabled and checked against a real PR check run: __________________

## Notes for Sprint 6 handoff

- **A red required check should block merge.** Fix and push, and the check re-runs automatically.
- **A green check means** the automated gates passed (install, lint, typecheck, test, build). It doesn't mean product, security or code review is done.
- **Until a maintainer enables these settings,** red checks are visible but **not enforced**. Reviewers must check the PR's Checks tab themselves before approving.
