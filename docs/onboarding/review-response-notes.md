cd ~/projects/PREIShare-org-repo
cat > docs/onboarding/review-response-notes.md << 'EOF'
# Review response notes — first PREIshare PR

## PR under review
- Branch name: docs/first-contribution-ashphill
- PR title (after any edits): Add CONTRIBUTORS.md entry for Ashton Phillips
- Link or local identifier: https://github.com/EdTechForLearning/PREIShare-org-repo/pull/11
- Related files: CONTRIBUTORS.md, docs/onboarding/pr-description.md, docs/onboarding/first-contribution-notes.md

## Simulated reviewer setup
- Tool used: chat-assistant
- What context I pasted for the reviewer: first-contribution-plan.md scope, PR #11 Files changed list, draft commit messages
- Date of simulation: 2026-09-09

## Feedback received

### Comment 1
- **Theme:** scope
- **Blocking?** yes
- **Reviewer said:** "PR #11 mixes CONTRIBUTORS.md with several other onboarding files across many commits — this needs to be isolated to match the plan's docs-only roster scope."
- **My decision:** accept-later
- **Why:** The branch already has real, useful onboarding history (setup-log, repo-map, AGENTS.md, etc.) mixed in from earlier steps. Cleanly separating it now would mean rebasing or cherry-picking commits, which is risky for me to attempt alone at this stage.
- **Action taken:** none yet — documented as a known limitation for a mentor to help resolve
- **Evidence:** confirmed via Files changed tab — still shows 7 files changed across 21 commits as of this writing

### Comment 2
- **Theme:** commits
- **Blocking?** yes
- **Reviewer said:** "A commit message like 'update url' doesn't explain what changed or why."
- **My decision:** accept-now
- **Why:** A teammate should be able to understand a change from its commit message alone.
- **Action taken:** follow-up commit with a clearer message
- **Evidence:** commit "Add real PR URL for pull request #11" replaced the earlier vague message

### Comment 3
- **Theme:** PR clarity
- **Blocking?** no
- **Reviewer said:** "Title looked like two drafts pasted together, and description was empty."
- **My decision:** accept-now
- **Why:** Cheap fix, immediately improves reviewer experience.
- **Action taken:** edited PR title and description
- **Evidence:** PR now has a clean title and a full Problem/Approach/Test plan description

### Comment 4
- **Theme:** verification
- **Blocking?** no
- **Reviewer said:** "Don't claim a checklist item is done until you've actually checked it."
- **My decision:** accept-now
- **Why:** Keeps the PR description and my own notes honest.
- **Action taken:** actually opened Files changed and confirmed the real count
- **Evidence:** Files changed shows 7 files across 21 commits — confirming Comment 1's scope concern is still open, not resolved

## Follow-up commits (if any)
| Commit message | Files touched | Addresses which comment # |
| --- | --- | --- |
| Add real PR URL for pull request #11 | docs/onboarding/pr-description.md | 2 |

## PR description edits (if any)
- Sections changed: Problem, Approach, Test plan added; PR URL corrected
- Before → after: went from "No description provided" and a placeholder branch link to a full Problem/Approach/Test plan writeup with the real PR #11 URL
- Why the edit helps a reviewer: lets them understand the change and verify it without opening every file first

## Re-verification checklist
- [x] Still on the same feature branch (not main)
- [x] Latest commits pushed; PR shows updated head
- [ ] Diff includes only intended onboarding files — FAILS: 7 files across 21 commits, not just CONTRIBUTORS.md
- [x] No secrets, .env values, or machine-specific paths added
- [ ] Manual or scripted checks claimed in the PR still pass — test plan step 1 (only expected paths appear) does not pass yet
- [x] Blocking comments all have a written resolution (Comment 1 documented as accepted-later with reason; Comment 2 fixed)
- [x] Non-blocking items either fixed or parked with a reason

## Merge-readiness statement
This PR is not fully merge-ready yet: the scope issue from Comment 1 is real and confirmed (7 files, 21 commits) rather than just a beginner's assumption. The commit-message and PR-clarity issues are genuinely fixed. Before merging, I'd want a mentor to help me either split CONTRIBUTORS.md into its own clean PR or explain how to safely narrow this branch's diff without risking the rest of the onboarding history.

## What I learned about review culture
- One habit I will keep: actually opening Files changed myself before claiming a diff is clean, instead of assuming.
- One mistake I will avoid next time: creating a feature branch from a long-running branch full of unrelated prior work instead of starting fresh from an up-to-date main for each new, single-purpose PR.
EOF