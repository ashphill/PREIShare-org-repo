# PREIshare pull request approval roles

This is the PREIshare pull request role map. It says who may do each job on a pull request. It follows `docs/ci/ai-review-overlay-brief.md`, and it is the first addition that brief names: who may approve and who may merge.

It doesn't start a new project or a second CI design. It doesn't edit `.github/workflows/pr-ci.yml`. It doesn't rewrite the review prompt pack (`docs/ci/ai-pr-review-prompts.md`).

## Two words, defined before the rules

**Approve** means a person has read the pull request and accepts it. Approve is a review decision. It doesn't put the change into the shared project by itself.

**Merge** means a person combines the approved pull request into `main`, the shared branch. Then the change becomes part of PREIshare for everyone, and Vercel deploys it to the live site.

Approve isn't merge. A green `pr-ci` check isn't approve, and it isn't merge.

## The four roles

| Role | Who | May do | Must not do |
| --- | --- | --- | --- |
| Author | Ashton Phillips (`ashphill`), the developer who writes PREIshare changes | Open the pull request, and update it after feedback or a red `pr-ci` check | Be the only person who approves their own change. Merge before the human reviewer approves, especially when the change touches sign-in, money or privacy. |
| Human reviewer | thortek, the course instructor and a collaborator on this repository | Read the change, comment, approve, or request changes | Hand the approve decision to the AI assistant. Approve without reading the diff. |
| Maintainer | Ashton Phillips (`ashphill`), the repository owner and admin | Merge only after the human reviewer approves and the existing `pr-ci` check (`Install, lint, typecheck, test, build`) is green | Merge because an AI comment said the change looks fine. Merge on a red or missing `pr-ci` check. |
| AI assistant | A chat assistant used as an advisor with the prompts in `docs/ci/ai-pr-review-prompts.md` | Comment with suggested notes and questions for the human reviewer | Approve, request changes as a GitHub reviewer, or merge |

**Author and maintainer are the same person.** Ashton Phillips writes the change and also does the final merge. So Ashton never approves his own pull request: thortek, a different person, approves first. The merge is still done by a person, Ashton, never by the AI.

## What the AI assistant may and must not do

The AI assistant may comment. A comment is a note. A note isn't a decision.

The AI assistant must not approve.

The AI assistant must not request changes as a GitHub reviewer.

The AI assistant must not merge.

"Request changes" is an official GitHub review outcome that sends the pull request back to the author. Only the human reviewer may do that.

## Merge paths

Every allowed path ends with a named person. The AI assistant is never the last actor.

1. Ashton Phillips opens the pull request. The existing `pr-ci` check runs and passes. thortek reads it and approves. Ashton Phillips merges.
2. The `pr-ci` check fails. Ashton Phillips fixes the pull request and pushes again. The check passes. thortek approves. Ashton Phillips merges.
3. thortek requests changes. Ashton Phillips updates the pull request. The `pr-ci` check passes again. thortek approves. Ashton Phillips merges.

**Forbidden path, not allowed:** the AI assistant comments that the change looks fine, and the pull request is merged with no approval from thortek. An AI "looks fine" comment is a note, not an approval and not a merge.

## Aligned with branch protection, not applied yet

This map agrees with `docs/ci/branch-protection-checklist.md`.

These intended gates are already described in that checklist and restated here in plain language:

- The `pr-ci` check, `Install, lint, typecheck, test, build`, should be required to pass before merge.
- A human approval (at least 1) should be required before merge.

This document doesn't change GitHub settings. It doesn't turn branch protection on or off, and it doesn't edit `.github/workflows/pr-ci.yml`. A later step records what the repository's GitHub plan actually enforced.

## Accountability

If a bad change is merged, the person who answers for it is Ashton Phillips, the maintainer who merged it, after thortek approved it. The AI assistant doesn't answer for the merge.
