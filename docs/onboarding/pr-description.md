# Pull request description — first PREIshare contribution

**PR URL:** https://github.com/ashphill/PREIShare-org-repo/tree/docs/first-contribution-ashphill
**Base repository:** EdTechForLearning/PREIShare-org-repo
**Base branch:** main
**Head repository (my fork):** ashphill/PREIShare-org-repo
**Compare branch:** docs/first-contribution-ashphill
**Author:** Ashton Phillips (ashphill)
**Date opened:** 2026-09-09

## Problem
PREIshare had no clear, reviewed onboarding contribution from this engineer yet.
The team needs a small, low-risk change that proves the Git → review → merge path works
for a new teammate without touching product runtime code.

## Approach
- Added a personal entry to `CONTRIBUTORS.md` following the repo's existing format.
- Kept the change scoped to documentation only (no app, package, or config runtime edits).
- Followed the plan in `docs/onboarding/first-contribution-plan.md` and implementation notes in
  `docs/onboarding/first-contribution-notes.md`.

## What reviewers should look at
- [ ] `CONTRIBUTORS.md` — new entry is accurate, formatted like neighbors, and free of secrets
- [ ] Diff contains only intended files (no accidental `.env`, build output, or editor junk)
- [ ] Commit message explains *why* this onboarding change exists

## Test plan
1. Open the Files changed tab and confirm only the expected path(s) appear.
2. Skim `CONTRIBUTORS.md` in the PR diff: name/link/role lines render as valid Markdown.
3. Search the diff for tokens, passwords, or local absolute paths — expect none.
4. (Optional) Check out the branch locally and open `CONTRIBUTORS.md` in a Markdown preview.

## Screenshots / notes
No UI screenshots (docs-only change).
Implementation decisions and verification notes: see `docs/onboarding/first-contribution-notes.md`.

## Checklist before requesting review
- [ ] Feature branch is pushed and up to date with this description
- [ ] PR title is specific (not "update" or "fixes")
- [ ] Description states problem, approach, and test plan
- [ ] I can explain every staged line if a reviewer asks