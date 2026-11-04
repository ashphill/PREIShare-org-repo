# Branch protection checklist (PREIshare PR CI)

## Purpose

This connects the automatic green/red signal from `.github/workflows/pr-ci.yml` to the merge rules for `main`, so a red check actually **blocks** a merge instead of just being a warning.

**Status: enabled on `main` (2026-11-03).** Enforced now: a pull request is required, 1 human approval, and the required check `Install, lint, typecheck, test, build`. Documented only, not enforced: admin bypass is allowed, "who may merge" can't be set, and "up to date before merging" is off. Full details are in the **Enforcement record** at the end of this file. The checklist below is the original plan.

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
- **These settings are now enabled (2026-11-03),** but admin bypass is allowed, so reviewers must still check the PR's Checks tab and follow the human checklist before approving.

## Enforcement record

This section was added after the existing checklist. The sections above stay in this file: they describe the rules we intended. This section records what GitHub actually saved.

Branch protection is a GitHub website setting, not code, so writing this file doesn't turn a rule on. A rule that didn't save isn't enforced and isn't described as on.

- **Date:** 2026-11-03
- **GitHub user who tried:** `ashphill` (Ashton Phillips). He signed in to GitHub himself in the Claude desktop app's browser panel, and his coding agent clicked through the settings at his direction.
- **Repository visibility seen on the repo page:** public
- **Could open Settings and change rules:** yes, `ashphill` is the admin, and the save worked.
- **Screen used:** classic branch protection (Settings → Branches → Add classic branch protection rule). No ruleset was created.
- **Branch name pattern:** `main`
- **Paid upgrade:** No paid GitHub upgrade was purchased. The page showed "Your GitHub Free plan," with no price or trial prompt, because classic protection is available on public repos on the Free plan.

### Intended rules versus what saved

After saving, the Branches page was reloaded and still listed **`main` — "Currently applies to 1 branch."** GitHub's branch API, read afterward, reported `protected: true` with the same settings.

- **Require a pull request before merging.**
  - Wanted: yes. **Result: saved.**
  - After refresh: the `main` rule is listed, and the API shows pull request reviews are required.
- **Human approvals before merge.**
  - Count and approver from `docs/ci/pr-approval-roles.md`: **1** approval, from the human reviewer **Ashton Phillips (`ashphill`)**. The count is at least 1. The AI assistant isn't an approver and wasn't added as a reviewer.
  - **Result: saved.**
  - After refresh: the API shows `required_approving_review_count: 1`, and "Dismiss stale pull request approvals when new commits are pushed" is also on.
- **Required status check from the existing workflow `.github/workflows/pr-ci.yml`.**
  - Exact check name selected: **`Install, lint, typecheck, test, build`**. It was found in the search list with source **GitHub Actions**, and it's the job name in `pr-ci.yml`. No new workflow was added, and the workflow wasn't renamed.
  - **Result: saved.**
  - After refresh: the API lists `required_status_checks.contexts: ["Install, lint, typecheck, test, build"]`. "Require branches to be up to date before merging" was left **off**.
- **Who may merge, from `docs/ci/pr-approval-roles.md`:** Ashton Phillips (`ashphill`), the maintainer.
  - Did GitHub limit merge to that person? **Could not set.** The classic rule form for this personal-account repo didn't show a "restrict who can merge/push" control, so that limit **isn't enforced by GitHub**.
  - In practice, only users with write access can merge, and today that's `ashphill` (plus collaborators GitHub lists under Settings → Collaborators).
- **Left off on purpose:**
  - "Do not allow bypassing the above settings" (`enforce_admins: false`)
  - Lock branch
  - Require signed commits
  - Require deployments
  - Require conversation resolution
  - Require linear history
  - Allow force pushes
  - Allow deletions

### Gaps

- **Admin bypass is allowed.** Because "Do not allow bypassing the above settings" is off, `ashphill` (admin) can still merge without an approval or with a red check by using GitHub's bypass option, and can push to `main` directly. This was left on deliberately. GitHub won't let a pull request's author approve their own pull request, so on this one-person project a strict rule would block every merge (see `docs/ci/pr-approval-roles.md`). **For the admin, the approval and status-check rules are therefore not fully enforced.** Using bypass is a human decision that still has to follow the checklist below.
- **"Who may merge" isn't enforced by GitHub.** That control wasn't shown for this repo.
- **"Require branches to be up to date" isn't enforced.** It was left off to avoid extra CI re-runs at our size (checklist above).
- **The sample review isn't a check.** `docs/ci/sample-pr-review/critique-and-prompt-revision.md` and the AI findings aren't a required status check and can't block or allow a merge.

### What people still do

People still follow `docs/ci/human-judgment-checklist.md` and `docs/ci/ai-review-orchestration.md` before every merge, including whenever an admin uses bypass, and would do the same if GitHub hadn't saved the rule.

The sample review in `docs/ci/sample-pr-review/critique-and-prompt-revision.md` is advice only, not a required status check. The AI assistant doesn't approve or merge.

The existing `pr-ci` workflow is the only automated check this record required. It wasn't edited or rebuilt.

The sample pull request #4 (planted privacy mistake) is still open and wasn't merged.
