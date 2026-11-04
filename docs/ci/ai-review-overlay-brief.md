# PREIshare review overlay brief

This brief starts the second Sprint 6 topic. The automatic CI check from topic 1 is already built and working. This topic adds a human-led review layer on top of it. This file only names that layer; later steps write it.

## Words we will use

- **Pull request:** a proposal to change the shared PREIshare project. Its changes are not part of the project until a person accepts them.
- **CI check:** the automatic run GitHub does on every pull request (install, lint, typecheck, test and build). A green check means only that those commands passed.
- **Merge:** a person accepting the pull request, so its changes become part of `main`, the main shared copy that the live site deploys from.
- **Review comment:** a note left on a pull request, by a person or an AI, pointing out a question or a possible problem. A review comment is not an approval and not a merge.

## What topic 1 already finished

All of these are done and working. Nothing here is missing or future work.

- **Existing workflow** (don't create another): `.github/workflows/pr-ci.yml`. It runs on every pull request into `main`.
- **What that check already runs:** install (`npm ci`), lint (`npm run lint`), typecheck (`npm run typecheck`), test (`npm run test`) and build (`npm run build`). The check is named `Install, lint, typecheck, test, build`. It was proven green, red on a deliberate error, and cancelled on a newer push, using a real test pull request.
- **Branch-protection notes already written:** `docs/ci/branch-protection-checklist.md`.
- **Prompt pack already drafted:** `docs/ci/ai-pr-review-prompts.md`. Later steps refine this same file, and no prompt pack gets created under a new name.
- **Verification log already written:** `docs/ci/e2e-verification-log.md`.
- **Stakeholder handoff already written:** `docs/ci/stakeholder-handoff.md`.
- **Hosting:** keep the existing Vercel Production project and URL. No new hosting project gets created.

## What this topic adds

These are named here only. Later steps will write each one.

1. A clear statement of who may approve a pull request and who may merge it.
2. A constrained system instruction with a required output shape, added later inside the existing `docs/ci/ai-pr-review-prompts.md`.
3. A human-judgment checklist for the things a reviewer must decide personally.
4. A practice review on a sample pull request, to try the overlay end to end.
5. An honest record of which branch-protection rules the repository's GitHub plan actually let us save, and which it didn't.

## What this topic will not rebuild

- No second workflow file. `.github/workflows/pr-ci.yml` stays as it is.
- No second CI design and no second dashboard inventory.
- No second prompt-pack filename.
- No new hosting project.
- No claim that a green CI check is permission to merge.

## Risks a green check cannot decide

A passing CI check proves the code installs, follows our lint rules, has no type errors, passes its tests and builds. It can't tell whether the change is the *right* change. A person must judge these four risks:

- **Sign-in:** who is allowed to be logged in and what they're allowed to reach. For example, a change could weaken the dashboard's sign-in guard or a database rule that keeps each sponsor to their own listings, and still pass every test, because no test checks that rule.
- **Money:** anything involving prices, payments or financial records. For example, a listing's asking price shown wrong or stored in the wrong currency. A test only checks what someone thought to test, so it can't confirm the money logic is correct for real investors.
- **Privacy:** member information, such as a sponsor's email or their private listings, reaching people who shouldn't see it. That can happen through a query that skips the ownership rule, an error message or a log, even when every check is green.
- **Product intent:** whether the change still matches what PREIshare is for, which is helping investors and sponsors find and manage real-estate opportunities they can trust. Only a person who knows the product can decide that.

## Who is allowed to decide

- The AI may suggest findings in a review comment.
- The AI may not approve a pull request.
- The AI may not merge a pull request.
- A person approves. A person merges.
- A green CI check is required evidence that the commands passed. It isn't permission to merge.

## How we will direct the agent

For each later step, we plan first, ask a coding agent for a draft, then critique the draft against that step's checklist and send at most one focused fix. The agent is told exactly which file it may write and which files it must leave alone, so it can't invent a second workflow or a second prompt pack. From this step, the only file kept is `docs/ci/ai-review-overlay-brief.md`.
