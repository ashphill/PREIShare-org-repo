# PREIshare human-judgment checklist

This checklist is the human gate for a PREIshare pull request. A **pull request** is a proposal to change the shared project. A **merge** accepts that proposal, so its changes become part of `main`, the main shared copy that Vercel deploys to the live site.

**A person marks this list. The AI doesn't.** Per `docs/ci/pr-approval-roles.md`, the **human reviewer** marks every outcome and may approve, and the **maintainer** may merge. On PREIshare both roles are **Ashton Phillips (`ashphill`)**. The **AI assistant** is an advisor only. It may suggest notes, but it may not mark pass, fail or needs-info, approve the pull request, or merge it.

This file doesn't replace `.github/workflows/pr-ci.yml`. That workflow already runs the automatic commands on every pull request. A green `pr-ci` check is required evidence that those commands passed. It isn't permission to merge.

AI notes, if you read them, must follow the output shape in `docs/ci/ai-pr-review-prompts.md`. That means a Review limits block, findings with severity, evidence, category and question_for_human, not-found blocks, and "Decision: left to the human reviewer. Advisory only." This checklist is how a person accepts or rejects those notes. It isn't a second copy of that prompt pack. If an AI note skips evidence, answers its own question or sounds like an approval, throw it out.

## How the human reviewer uses this file

1. **Wait for the `pr-ci` check result** (`Install, lint, typecheck, test, build`) on the pull request's Checks tab. If it's red, stop. This checklist never overrides a failed automatic check.
2. **Read any AI advisor notes as suggestions only.** Each finding is a hint about where to look, not an answer.
3. **For each of the four sections below,** look at the evidence yourself, then mark exactly one outcome: **pass**, **fail** or **needs-info**. Write one line saying what you looked at.
4. **If any section is fail or needs-info, don't approve or merge,** even when `pr-ci` is green.
5. **Only the human reviewer may approve,** by writing the approval in a review comment, because GitHub won't let an author click Approve on their own pull request. Only the maintainer may merge. This checklist doesn't click Approve or Merge.

## Sign-in

### Risk in PREIshare terms

Sign-in is how a sponsor proves who they are, so the dashboard shows only that sponsor's own information. The risks are a change that lets someone who isn't signed in reach a `/dashboard` page, keeps someone signed in after they sign out, or lets one signed-in sponsor see or edit another sponsor's properties.

### Evidence the human reviewer must point at

- The diff (the lines added or removed) in sign-in code: the guard in `src/routes/dashboard.tsx`, the session cookie helpers in `src/lib/auth/session.ts`, the `/login` and `/auth/signup` pages, and any server function that reads sponsor data. Each such function should still check `requireSessionUser()` first.
- The rule a sponsor sees only their own rows (`owner_id = auth.uid()` in `docs/data-model-and-rls-matrix.md`). Note whether the change still follows it.
- If no sign-in file changed, still look once for new pages or server functions that read sponsor data, and write which files you opened.

The AI's confidence isn't evidence.

### What the AI is not allowed to decide

The AI must not decide that sign-in is safe. It must not mark pass, fail or needs-info for this section, and must not approve or merge.

### Outcomes

- **pass:** the human reviewer read the diff and the own-rows rule, and this change doesn't let a signed-out visitor in or show one sponsor another sponsor's data.
- **fail:** the human reviewer found a sign-in or session problem, a missing session check, or another sponsor's data shown after login. **Fail blocks merge even if `pr-ci` is green.**
- **needs-info:** the human reviewer can't tell who the change signs in, or whose data it shows. **This isn't a pass.** Don't merge until the missing fact is written down and this section is marked again.

## Money

### Risk in PREIshare terms

Money means any amount an investor or sponsor sees or relies on. That includes a property's asking price (`price` / `asking_price`), its currency, and anything a member could treat as a financial figure. It also covers new costs the change creates, such as more calls to the paid embedding API. The risks are a wrong amount, a wrong currency, the wrong person able to change an amount, or a cost increase nobody chose.

### Evidence the human reviewer must point at

- The diff, searched for `price`, `asking_price`, `currency`, money formatting and any embedding or other paid API calls.
- The screen or file where a member would see that amount, such as `/dashboard/properties` or the `/search` results.
- If the change has no money words, write which files you opened and that you found none.

### What the AI is not allowed to decide

The AI must not decide that an amount or cost is correct. It must not mark the money outcome, and must not approve or merge.

### Outcomes

- **pass:** the human reviewer checked the diff and either found no money change, or found one and confirmed the amount, the currency and who can see or edit it.
- **fail:** the human reviewer found a wrong amount or currency, a hidden money change, the wrong person able to change an amount, or an unplanned cost increase. **Fail blocks merge even if `pr-ci` is green.**
- **needs-info:** the human reviewer sees money words but can't tell what amount a member will see or who can change it. **This isn't a pass.** Don't merge until that fact is known and this section is marked again.

## Privacy

### Risk in PREIshare terms

Privacy means keeping a sponsor's private details and private listings away from people who shouldn't see them. In PREIshare that includes a sponsor's email, their draft or private properties, and secret keys (the Supabase service-role key and `EMBEDDING_API_KEY`). The risk is a leak: private details or keys on a public page, in an error message, in a log, in a browser bundle (a `VITE_`-prefixed secret), or in a query that skips row-level security, for example by using the service-role client in normal requests.

### Evidence the human reviewer must point at

- The diff, read for email fields, `owner_id`, RLS policies in `supabase/migrations/*.sql`, uses of `createServiceRoleSupabaseClient`, new `VITE_` variables, and error or log messages.
- Where that data would appear: a public page such as `/search`, an error, a log, a download, or a screen only one sponsor should see.
- A plain statement of who is allowed to see that field.

An AI sentence that says "looks fine" isn't evidence. A suggested finding is only a hint to check.

### What the AI is not allowed to decide

The AI must not decide that a privacy risk is acceptable. It must not mark the privacy outcome, and must not approve or merge.

### Outcomes

- **pass:** the human reviewer read the diff and confirmed private sponsor fields and secret keys aren't shown to the wrong audience, and row-level security still applies.
- **fail:** the human reviewer found a private field (such as a sponsor email), a private listing or a secret key exposed to the wrong audience, or a query that bypasses row-level security without a reason. **Fail blocks merge even if every automatic command passed.**
- **needs-info:** the human reviewer can't tell who can see a private field or whether row-level security still applies. **This isn't a pass.** Don't merge until the audience is known and this section is marked again.

## Product intent

### Risk in PREIshare terms

Product intent is what PREIshare is for and who it serves. `docs/ci/ai-review-overlay-brief.md` says PREIshare is for "helping investors and sponsors find and manage real-estate opportunities they can trust." The risk is drift: the change still builds and tests, but it serves a different goal or audience, or makes listings or search results less trustworthy.

### Evidence the human reviewer must point at

- The purpose sentence above, copied from the overlay brief. Don't invent a new purpose.
- The pull request description, compared with that sentence.
- The diff, checked for a new audience, a new job the product wasn't meant to do, or a change that makes listings or `/search` results less accurate.

### What the AI is not allowed to decide

The AI must not decide that a change matches product intent. It must not rewrite the product purpose, and must not approve or merge.

### Outcomes

- **pass:** the human reviewer compared the change to the brief's purpose and it still helps investors and sponsors find and manage trustworthy real-estate opportunities.
- **fail:** the human reviewer found drift from that purpose. **Fail blocks merge even if `pr-ci` is green.**
- **needs-info:** the brief doesn't clearly cover this change, or the description doesn't say what investor or sponsor problem it solves. **This isn't a pass.** Ask a human stakeholder, write down the answer, and mark this section again. Don't let the AI invent the purpose.

## Merge rule

- Any **fail** blocks merge, even when the `pr-ci` check is green.
- Any **needs-info** blocks merge until the human reviewer records the missing evidence and marks that section again.
- All four sections must be **pass**, and `pr-ci` must be green, before the human reviewer may approve and the maintainer may merge.
- This checklist never allows the AI to mark outcomes, approve or merge.

## What this checklist does not do

This checklist doesn't repeat the commands already in `.github/workflows/pr-ci.yml`: install, lint, typecheck, test and build. Those aren't human tasks here. If they fail, the automatic check is red, and this checklist doesn't waive that. If they pass, this checklist still has to be completed.

## Practice box (not the sample pull request)

This is practice only, with an imaginary change. It isn't a real pull request and it isn't the sample pull request review.

- **Imaginary change:** the public `/search` results page starts showing each listing's owner email, member@example.com, next to the title. The `pr-ci` check is green.
- **Section marked:** Privacy
- **Outcome:** fail
- **Evidence I'd point at:** the diff line that adds the owner email to the `/search` result card, on a page anyone can open without signing in.
- **Why a green check doesn't allow merge:** install, lint, typecheck, test and build can all pass while a sponsor's private email is shown to the public. A privacy fail blocks merge no matter what the automatic check says.
