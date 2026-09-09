# Review response notes — first PREIshare PR

## PR under review
- Branch name: docs/contributors-ashphill (new isolated branch, replacing mixed PR #11)
- PR title (after any edits): Add CONTRIBUTORS.md with entry for Ashton Phillips
- Link or local identifier: <paste https://github.com/EdTechForLearning/PREIShare-org-repo/pull/11
- Related files: CONTRIBUTORS.md, docs/onboarding/pr-description.md, docs/onboarding/first-contribution-notes.md

## Simulated reviewer setup
- Tool used: chat-assistant
- What context I pasted for the reviewer: first-contribution-plan.md scope, the real PR #11 files-changed list, and my draft commit messages
- Date of simulation: 2026-09-09

## Feedback received

### Comment 1
- **Theme:** scope
- **Blocking?** yes
- **Reviewer said:** "PR #11 mixes CONTRIBUTORS.md with 9 other onboarding files across 19 commits — split it into an isolated PR."
- **My decision:** accept-now
- **Why:** Matches the plan's explicit scope of a docs-only roster addition; a mixed diff can't be reviewed in under 10 minutes.
- **Action taken:** created new branch docs/contributors-ashphill with only CONTRIBUTORS.md, opened a fresh PR
- **Evidence:** new PR shows 1 file changed under Files changed tab

### Comment 2
- **Theme:** commits
- **Blocking?** yes
- **Reviewer said:** "'update url' doesn't explain what changed or why."
- **My decision:** accept-now
- **Why:** A teammate should understand the change from the commit message alone.
- **Action taken:** follow-up commit
- **Evidence:** commit message rewritten to "Add CONTRIBUTORS.md with entry for Ashton Phillips" with a body explaining the onboarding exercise

### Comment 3
- **Theme:** PR clarity
- **Blocking?** no
- **Reviewer said:** "Title looked like two drafts pasted together, and description was empty."
- **My decision:** accept-now
- **Why:** Cheap fix, improves reviewer experience immediately.
- **Action taken:** edit PR description
- **Evidence:** description now includes Problem, Approach, and Test plan sections

### Comment 4
- **Theme:** verification
- **Blocking?** no
- **Reviewer said:** "Don't claim a checklist item is done until you've actually done it."
- **My decision:** accept-now
- **Why:** Keeps the PR description honest and matches what a reviewer will actually find.
- **Action taken:** none yet — will verify Files changed before final submission
- **Evidence:** N/A until re-checked

## Follow-up commits (if any)
| Commit message | Files touched | Addresses which comment # |
| --- | --- | --- |
| Add CONTRIBUTORS.md with entry for Ashton Phillips | CONTRIBUTORS.md | 1, 2 |

## PR description edits (if any)
- Sections changed: Problem, Approach, Test plan added
- Before → after: went from "No description provided" to a full Problem/Approach/Test plan writeup
- Why the edit helps a reviewer: lets them understand the change without opening every file first

## Re-verification checklist
- [ ] Still on the same feature branch (not main)
- [ ] Latest commits pushed; PR shows updated head
- [ ] Diff includes only intended onboarding files
- [ ] No secrets, .env values, or machine-specific paths added
- [ ] Manual or scripted checks claimed in the PR still pass
- [ ] Blocking comments all have a written resolution
- [ ] Non-blocking items either fixed or parked with a reason

## Merge-readiness statement
This PR is close to merge-ready once the isolated branch replaces PR #11 and Files changed is confirmed to show only CONTRIBUTORS.md. A human mentor should still double-check that the new PR's diff is truly clean before approving, since earlier claims about scope weren't verified before being written down.

## What I learned about review culture
- One habit I will keep: writing the PR description before asking for review, not after.
- One mistake I will avoid next time: claiming a check passed without actually opening the tab to look.