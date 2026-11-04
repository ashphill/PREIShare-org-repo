# PREIshare review orchestration runbook

This runbook is the step-by-step order for reviewing a PREIshare pull request, the same way every time. **A person starts any AI review** by opening a chat assistant themselves. A GitHub Action never starts it.

The AI is an **advisor only**. It may suggest findings. It may not approve or merge.

## What this file is not

- This topic doesn't add a new GitHub Action.
- This topic doesn't edit `.github/workflows/pr-ci.yml`.
- This file doesn't replace `docs/ci/human-judgment-checklist.md`.
- A green check or a red check never replaces the checklist or a human approval. Both are evidence only.
- This file doesn't change branch-protection settings. A later step records what the repository's GitHub plan can actually enforce.

## Pieces this sequence uses

These pieces already exist. This runbook points to them in order and doesn't rewrite them.

1. **CI workflow:** `.github/workflows/pr-ci.yml` (workflow **PR CI**, check **Install, lint, typecheck, test, build**) already runs install, lint, typecheck, test and build on every pull request into `main`. Don't edit it, and don't add another workflow file.
2. **System instruction:** `docs/ci/ai-pr-review-prompts.md` holds the standing rules and the required output shape for the chat assistant.
3. **Human checklist:** `docs/ci/human-judgment-checklist.md` covers sign-in, money, privacy and product intent. A person walks this list.
4. **Role map:** `docs/ci/pr-approval-roles.md` says who may approve and who may merge.
5. **Overlay brief:** `docs/ci/ai-review-overlay-brief.md` explains why this review overlay exists.

## Who may act

Copied from `docs/ci/pr-approval-roles.md`:

- **Who may approve:** Ashton Phillips (`ashphill`), as the human reviewer. GitHub doesn't let a pull request's author click **Approve** on their own pull request, so Ashton records his approval as a written review comment after finishing the checklist, as the role map describes.
- **Who may merge:** Ashton Phillips (`ashphill`), as the maintainer. **The same person may both approve and merge.** Ashton is the author, human reviewer and maintainer on this one-developer project. He approves first, then merges.
- **AI assistant:** advisor only. It may suggest findings. It may not approve, may not request changes as a GitHub reviewer, may not merge, and may not start the review by itself.

## Where to click

1. Sign in to GitHub in your browser.
2. Open the repository **ashphill/PREIShare-org-repo**.
3. Click **Pull requests** in the repository's top bar.
4. Click the title of the pull request you're reviewing. That opens the proposal. The **Files changed** tab shows the diff, meaning the lines added or removed.
5. To see whether the automatic check ran, click the **Actions** tab in the same top bar. Find the **PR CI** run for this pull request's branch and open it.
   - A **yellow dot or spinning circle** means it's still running.
   - A **green check mark** means it finished and passed.
   - A **red X** means it finished and a step failed. Open the run to see which step: install, lint, typecheck, test or build.
6. You can also see the same check near the bottom of the pull request's **Conversation** tab, or under its **Checks** tab, listed as "PR CI / Install, lint, typecheck, test, build." The Actions tab is the full history of those runs.

## Never paste these into a chat assistant

- **Secrets:** passwords, API keys, tokens, Supabase keys (including the service-role key), `EMBEDDING_API_KEY`, and anything from a `.env` or `.env.local` file.
- **Real member data:** real sponsor or investor names, email addresses, phone numbers, home addresses, or payment or bank details.
- **What you may share:** only the proposed change (the diff), plus made-up examples like `member@example.com`.
- **If the diff already contains a real secret or a real member's data,** don't paste that part. Stop. The person who may approve (Ashton) must remove it from the change and rotate any exposed key. Don't "clean it up" by sending it to the AI.

## Sequence and stop points

A **stop point** is a moment where a person must decide before anyone continues.

### A. Check the CI result

Open the Actions tab (or the pull request's Checks tab) and write down one state: **still running**, **green check** or **red check**.

- **Stop 1: not finished.** If the PR CI check is still running, wait. Don't review as if the check were done.
- **Stop 2: the check isn't a decision.**
  - A green check isn't permission to merge. It only means the commands in `pr-ci.yml` passed.
  - A red check means a command failed. The author fixes it and pushes again, and the human checklist doesn't overrule it.
  - A red check also doesn't replace the human checklist or a human approval.
  - Neither result means the change is right for PREIshare investors and sponsors.

### B. A person starts the AI review

A person opens a chat assistant (Claude, ChatGPT or Gemini). They paste the **System instruction** section from `docs/ci/ai-pr-review-prompts.md` first, then a one-off task prompt with the pull request title, the changed files, the diff and the CI result. They don't paste secrets or real member data.

- **Stop 3: no made-up prompt.** If that system-instruction file isn't open, stop and open it. Don't ask the AI to invent a new standing rule. The AI doesn't start this step, and a GitHub Action doesn't start this step.

The AI's notes are suggestions in the required output shape: Review limits, findings with severity, evidence, category and question_for_human, not-found blocks, and "Decision: left to the human reviewer. Advisory only." They aren't an approval. If a note skips evidence, answers its own question or sounds like an approval, throw it out and re-run the review, or continue without it.

### C. A person walks the judgment checklist

Open `docs/ci/human-judgment-checklist.md`. The human reviewer (Ashton), not the AI, walks **sign-in, money, privacy and product intent**, and marks each one **pass**, **fail** or **needs-info** based on evidence he can point at. For each AI finding, he accepts it or rejects it after checking the real code.

- **Stop 4: checklist not finished.** Don't approve while any section is unmarked, **fail** or **needs-info**. An AI note you haven't judged isn't a decision. If the change could show a sponsor's email, mishandle a price, weaken who can sign in, or drift from what PREIshare is for, mark that section yourself even if the AI said nothing.

### D. Human approval

Only the person listed under **Who may approve** (Ashton Phillips) may approve. He does it with a review comment that says he approves and that all four checklist sections are pass.

- **Stop 5: wrong person or the AI.** If you aren't allowed to approve, stop and ask Ashton. Don't ask the AI to approve. Don't treat the AI's notes as the approval.

### E. Merge

Merge means accepting the proposal so it becomes part of `main`, the shared project that deploys to the live site. Only the person listed under **Who may merge** (Ashton Phillips) may merge, and only after Stop 5 has a real human approval and the PR CI check is green.

- **Stop 6: approval missing.** A green check plus AI notes isn't enough. If the human approval is missing, don't merge. If any checklist section is fail or needs-info, don't merge.

## When the AI is wrong

Don't merge just to keep moving. Write down what the AI missed or invented, in the pull request or in a note. Changing the system instruction in `docs/ci/ai-pr-review-prompts.md` is a later human decision. This runbook doesn't edit that file and doesn't edit the workflow file.

## Roles critique (complete before you commit)

Checked side by side with `docs/ci/pr-approval-roles.md` (Author, Human reviewer and Maintainer are all Ashton Phillips (`ashphill`); the AI assistant may only comment):

- I opened `docs/ci/pr-approval-roles.md` and compared it to the Who may act section: YES
- The approver line matches that role map (Ashton Phillips as human reviewer, approval written as a review comment), and no new role was invented: YES
- The merger line matches that role map (Ashton Phillips as maintainer, the same person who approves): YES
- The AI is an advisor only and can't approve or merge: YES
- This file doesn't add a GitHub Action and doesn't edit `.github/workflows/pr-ci.yml`: YES
