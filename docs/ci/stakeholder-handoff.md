# PREIshare Sprint 6 — Stakeholder Handoff

- **Audience:** PREIshare product owners, tech leads and reviewers
- **Sprint goal:** continuous integration on every pull request, plus AI-assisted review that doesn't replace human judgment
- **Date:** 2026-11-03
- **Author:** Ashton Phillips

Everything here comes from the Sprint 6 files listed in section 7. If something isn't in `.github/workflows/pr-ci.yml` or `docs/ci/e2e-verification-log.md`, this handoff doesn't claim it.

---

## 1. Client story recap (why we did this)

Before this sprint, nothing checked a pull request automatically. Whether a change installed, typechecked and built depended on the author remembering to run it on their own laptop, and laptops can hide problems a clean install would catch. We often found out a change was broken only **after** it reached `main`, when Vercel's deploy failed. In Sprint 4, a TanStack Start import rule broke two Production deploys that way.

**What changed:** every pull request into `main` now runs the same automatic check on GitHub's own computers. A broken change shows a red X on the PR before anyone merges it. People still decide whether the change is right for the product and safe to merge.

**Source notes:** `docs/ci/pr-pain-and-goals.md`, `docs/ci/pipeline-design.md`

---

## 2. What is automated on every pull request

All of this is defined in `.github/workflows/pr-ci.yml` (workflow **`PR CI`**, one job named **`Install, lint, typecheck, test, build`**).

| Stage | What runs (exact step name → command) | Where defined |
| --- | --- | --- |
| Trigger | Every pull request into `main` when it's opened, gets new commits, or is reopened. A newer push cancels the older run for the same PR. | `pr-ci.yml` (`on:` and `concurrency:`) |
| Setup | "Check out repository" (`actions/checkout@v5`) → "Set up Node.js 22" (`actions/setup-node@v5`, npm cache) → "Install dependencies (clean, from package-lock.json)" (`npm ci`) | `pr-ci.yml` |
| Quality gates | **Lint** (`npm run lint`) → **Typecheck** (`npm run typecheck`) → **Test** (`npm run test`) → **Build** (`npm run build`). The order is cheap checks first and the slow build last, per the pipeline design. | `pr-ci.yml` and `docs/ci/ci-scripts-notes.md` |
| Failure behavior | The first failing step turns the job **red**, and later steps are skipped. Nothing hides failures. Merging will be **blocked** on red once branch protection is turned on (section 4). | `docs/ci/branch-protection-checklist.md` |

**What each gate checks, in plain language:**

- **Install:** the project's packages install cleanly from the lockfile.
- **Lint:** no real secret keys in the code, no server-only keys exposed to the browser, no leftover `debugger` or skipped tests, and no CI tricks that hide failures.
- **Typecheck:** no TypeScript type mistakes.
- **Test:** the 8 unit tests for the semantic-search embedding helper pass.
- **Build:** the app builds the same way Vercel builds it.

**Summary for stakeholders:** if install, lint, types, tests or the build break, the PR shows a failed check that names the step, and usually the file and line. Fix the PR and push again, which re-runs the check automatically. Don't skip it.

**What CI does *not* do (by design):**

- It doesn't deploy anything. Vercel still handles Preview and Production deploys on its own.
- It doesn't approve product, UX or security decisions.
- It doesn't replace reading the diff.
- It doesn't use secrets or connect to Supabase, and no secret values appear in its logs.
- It doesn't merge pull requests, automatically or otherwise.

---

## 3. What people still decide

| Decision | Owner | Why it stays human |
| --- | --- | --- |
| Approving and merging a PR | Reviewer / maintainer | Green CI proves the checks passed, not that the feature is right or safe |
| Acting on AI review suggestions | Reviewer | AI can miss context, security nuance or product intent, and can be confidently wrong |
| Secrets and env setup (Supabase keys, embedding API key) | Maintainer | Keys live only in `.env.local` and Vercel settings, never in the workflow, the PR or an AI chat |
| Security-sensitive changes (RLS policies, service-role key use, auth, migrations) | Reviewer + maintainer | CI can't judge whether a database policy or data change is correct |
| Turning on required checks (branch protection) | Repo admin (`ashphill`) | It's a GitHub repo setting, not something a YAML file can switch on |
| How to handle a flaky or unexpected red check | Tech lead | Flaky checks need a fix or a plan, not endless re-runs or disabling CI |

**AI-assisted review boundary:** reviewers can use the three prompts in `docs/ci/ai-pr-review-prompts.md` to speed up reading:

- a diff summary
- PREIshare risk flags for auth, Supabase/RLS, migrations, secrets and CI scripts
- tailored review questions

Every prompt forbids the AI from approving, saying "LGTM" or recommending a merge. **AI output is advice, not a merge vote.** A named person writes the GitHub review and clicks merge, and that person is accountable for it.

---

## 4. How to enable branch protection (operator checklist)

**Admins:** follow `docs/ci/branch-protection-checklist.md` step by step. At minimum:

1. Protect `main` (GitHub **Settings → Branches**, or **Rules → Rulesets**).
2. **Require status checks to pass before merging,** and select the check **`Install, lint, typecheck, test, build`**. It's selectable now, because it has already run on a real PR.
3. **Require a pull request with at least 1 approval,** and dismiss stale approvals when new commits are pushed.
4. Don't require the Vercel checks or any check that doesn't exist yet (like ESLint or end-to-end tests).
5. Don't let routine contributor work bypass these rules. The checklist suggests leaving admin bypass on at first so a maintainer can recover if CI itself breaks.

**Status after verification:** [x] Not enabled yet / [ ] Enabled on `main`

**Evidence:** `docs/ci/e2e-verification-log.md`, section 3 ("Person still required for merge: Needs work, branch protection not enabled").

Until it's enabled, red checks are **visible but not enforced**, so reviewers must check the PR's **Checks** tab before approving.

---

## 5. Known limits and risks (honest scope)

| Limit | Impact | Recommended next action |
| --- | --- | --- |
| **Branch protection not enabled** | A red or unreviewed PR can still be merged by hand | An admin follows section 4 and the checklist. Then open a test PR to confirm merge is blocked on red. |
| **Secrets / private env** | PR CI deliberately runs with no secrets, so nothing that needs Supabase keys or the embedding API key is tested on PRs | Keep it that way by default. If integration tests are ever added, use separate test keys as GitHub Secrets in a separate job, and never commit `.env` files. |
| **Supabase / external services** | Login, dashboard data, migrations, seeding and live semantic search are **not** tested in CI. The embedding API is mocked in tests. | Next sprint, decide whether a separate test Supabase project and integration job are worth the cost. Until then, test these by hand. |
| **Thin tests, no ESLint** | Only 8 unit tests (embedding helper), and the lint is a small custom hygiene check, not ESLint. Most logic and UI bugs won't be caught by CI. | Add ESLint (`npm install -D eslint @eslint/js typescript-eslint` plus a lockfile commit) and tests for `src/lib/listings/schema.ts` and `src/lib/property-search.ts` |
| **Flaky tests** | **None seen so far.** Every run on PR #3 behaved as expected, and current tests are offline and deterministic. Flakes could appear once network or database tests are added. | If a check fails at random, fix it or set it aside with a written note. Never disable the whole workflow. |
| **Local vs CI script drift** | CI uses **Node 22**, and `npm run test` needs **Node 22.6 or newer**. A teammate on Node 20 (the README minimum) will see `npm run test` fail locally while CI passes. The full sequence hasn't been run on Ashton's Mac yet. | Keep scripts matching `docs/ci/ci-scripts-notes.md`, update the README to Node 22, and run the "reproduce CI locally" commands on each laptop once |
| **Vercel doesn't typecheck** | The deliberate type-error commit on PR #3 still built a Vercel Preview successfully, so Vercel alone wouldn't have caught it | This is why the PR CI check matters. Make it required (section 4). |

---

## 6. Verification snapshot

From `docs/ci/e2e-verification-log.md` (2026-11-03, throwaway draft **PR #3**, closed without merging):

- **PR opened / workflow triggered:** **yes.** `PR CI` started automatically on opening and on every push. The first run was [41612327083](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612327083) (green, about 25 seconds).
- **Expected steps ran in order:** **yes.** Checkout → Node 22 → `npm ci` → Lint → Typecheck → Test (8 of 8 passed) → Build.
- **Deliberate failure test:** **yes, it went red.** A deliberate type error failed at **Typecheck** with the exact file and line ([41612453594](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612453594)). Test and Build were skipped. After the fix it was green again.
- **Cancel-in-progress:** **yes.** A newer push cancelled the older run ([41612679971](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612679971), cancelled) and the new run passed.
- **AI review prompt test:** **yes.** "Prompt 2 — Risk flags" on a sample risky change flagged the service-role key (HIGH, bypasses RLS) and a 10× query limit (MEDIUM, API cost). It never said approve, and **a person made the call: request changes.** Caveat: the AI was the same model that helped write the prompts, so it should be re-run in a fresh chat.
- **Blockers found:** none. One real issue was fixed: GitHub warned that `checkout@v4` and `setup-node@v4` run on the deprecated Node 20, so both were upgraded to **v5** and the warning went away.
- **Overall verdict:** **credible with known gaps** (section 5).

---

## 7. Artifact index (where everything lives)

| Artifact | Purpose |
| --- | --- |
| `docs/ci/pr-pain-and-goals.md` | The original PR pain points, CI goals, the human-review boundary and success signals |
| `docs/ci/ci-concepts-notes.md` | Plain-language CI vocabulary, what green and red mean, and the "CI washing" non-examples |
| `docs/ci/project-ci-inventory.md` | The real scripts and tools in the repo, sorted into headless, needs-secrets and human-only |
| `docs/ci/pipeline-design.md` | The planned stages, failure policy, caching and secrets rules, written before the YAML |
| `.github/workflows/pr-ci.yml` | The live PR CI workflow |
| `docs/ci/ci-scripts-notes.md` | Each CI step's script and local command, gaps, and how to reproduce CI locally |
| `scripts/lint.mjs`, `src/lib/embeddings/generate.test.ts` | The lint script and unit tests CI runs |
| `docs/ci/branch-protection-checklist.md` | Admin steps to require the check and human approval |
| `docs/ci/ai-pr-review-prompts.md` | Three copy-paste review prompts that keep people in charge of merging |
| `docs/ci/e2e-verification-log.md` | Proof the PR → CI → AI review loop was run (green, red, cancelled, fixed) |
| `docs/ci/stakeholder-handoff.md` | This handoff |

---

## 8. What should roll into the next Sprint 6 topic

1. **Turn on branch protection on `main`** with the required check `Install, lint, typecheck, test, build` and 1 required approval. Then open a test PR with a deliberate error and confirm the **Merge** button is blocked.
2. **Add ESLint.** Install `eslint`, `@eslint/js` and `typescript-eslint` locally, add `eslint.config.js`, fix the findings, commit `package.json` and `package-lock.json`, and fold it into the existing **Lint** step.
3. **Add tests where bugs would hurt most:** the listing validators in `src/lib/listings/schema.ts` and `clampMatchCount` and empty-query handling in `src/lib/property-search.ts`. That brings coverage beyond the embedding helper.
4. **Remove local-vs-CI drift:** add `.nvmrc` (22) and update the README's Node requirement so laptops, CI and Vercel agree. Run the full local sequence on Ashton's Mac and record the result in the verification log.
5. **Decide the policy for secrets and Supabase on PRs:** stay secrets-free (current), or add a separate integration job against a *test* Supabase project with GitHub Secrets and manual approval.
6. **Re-run the AI review prompts** on one or two real feature PRs in a fresh chat, refine Prompt 2 so reviewers can paste table context (public vs private) for better severity, and keep the "people merge" rules.
7. **Housekeeping:** delete the leftover `ci/e2e-dry-run` branch on GitHub.

---

## 9. One-paragraph executive summary

Every PREIshare pull request into `main` now automatically runs install, lint, typecheck, unit tests and a production build on GitHub, in about 25 seconds. A broken change shows a red X that names the failing step before anyone merges, instead of failing on a teammate's laptop or in a Vercel deploy. We proved this on a real test PR, which went green, then red on a deliberate error, then green after the fix, and a newer push cancelled the outdated run. A prompt pack helps reviewers spot auth, database and secret risks, but AI output is advice only. Approving and merging, handling secrets and judging the product stay with people. The main open item is for an admin to turn on branch protection using the checklist so a red check actually blocks merging. After that, the next topic should add ESLint, more tests and a matching Node version everywhere.

---

## Topic 2: AI review overlay on the finished CI gate

The topic 1 record above stays in force. Continuous integration is already done: the GitHub Actions workflow at `.github/workflows/pr-ci.yml` already installs, lints, typechecks, tests and builds every pull request into `main`.

This section doesn't rebuild that workflow, the prompt pack or the live site. It explains how human review sits on top of that finished gate.

**Update to topic 1, section 4:** branch protection on `main` has since been **turned on**. Section 4 above said "Not enabled yet." The current status is in "Branch protection" below, copied from the Enforcement record in `docs/ci/branch-protection-checklist.md`.

### What the AI review can and cannot do

The AI review can:

- Suggest findings on a pull request, in the required output shape from the system instruction: Review limits, then findings with severity, evidence, category and question_for_human, then not-found blocks, then "Decision: left to the human reviewer. Advisory only."
- Help a human reviewer look faster. It's an advisor only.

The AI review cannot:

- Approve a pull request.
- Merge a pull request.
- Replace a human decision about sign-in, money, privacy or product intent.
- Count as a required GitHub status check or a required reviewer.
- Start a review by itself. A person opens the chat assistant; no GitHub Action runs it.

A green CI check is evidence that the commands passed. It isn't permission to merge.

### Where to read the overlay

There's no second handoff file. Start with the overview, then open the piece you need.

| Piece | Path | What a stakeholder uses it for |
| --- | --- | --- |
| Overlay overview | `docs/ci/ai-review-overlay-brief.md` | Why this review layer exists, and the four risks a green check can't decide |
| Who may approve and who may merge | `docs/ci/pr-approval-roles.md` | People only: Ashton Phillips (`ashphill`) approves and merges, and the AI is an advisor |
| System instruction and output shape | `docs/ci/ai-pr-review-prompts.md` | The standing rules and required answer shape for the AI, plus the revision rule added after the sample |
| Human-judgment checklist | `docs/ci/human-judgment-checklist.md` | Pass, fail or needs-info for sign-in, money, privacy and product intent; any fail or needs-info blocks merge |
| Review runbook | `docs/ci/ai-review-orchestration.md` | The same order every time, with six stop points before approval and merge |
| Sample critique and prompt revision | `docs/ci/sample-pr-review/critique-and-prompt-revision.md` | What the practice review caught, what it got wrong, and the one rule we added |
| Branch-protection record | `docs/ci/branch-protection-checklist.md` | What GitHub actually saved (see its "Enforcement record") |
| Practice sample | `docs/ci/samples/README.md` | The planted privacy sample and its CI result. It's not app code. |

### Branch protection: enforced now versus only documented

Copied from the Enforcement record in `docs/ci/branch-protection-checklist.md` (2026-11-03, `ashphill`, classic branch protection on `main`, GitHub Free plan, no paid upgrade). This handoff doesn't change GitHub settings.

#### Enforced on this repository now

- **Require a pull request before merging into `main`.** Result: saved.
- **At least 1 human approval before merge,** with stale approvals dismissed when new commits are pushed. Result: saved.
- **Required status check `Install, lint, typecheck, test, build`** from the existing `.github/workflows/pr-ci.yml`. Result: saved.
- Force pushes and branch deletion on `main` aren't allowed.

#### Documented but not enforced on this plan

- **Admin bypass is allowed.** "Do not allow bypassing the above settings" was left off on purpose, so the admin (`ashphill`) can still merge without an approval or with a red check, and can push to `main` directly. For the admin, the approval and status-check rules aren't fully enforced. This was a deliberate choice: GitHub won't let a pull request's author approve their own pull request, so on a one-person project a strict rule would block every merge.
- **"Who may merge" isn't enforced by GitHub.** The control wasn't shown for this personal-account repository.
- **"Require branches to be up to date before merging" is off.**
- **The human-judgment checklist and the runbook are documented process,** not GitHub settings. People have to follow them, especially whenever admin bypass is used.

The AI assistant isn't a required approver and isn't a required status check.

### Sample privacy pull request

The practice pull request with one planted privacy mistake, PR #4 (https://github.com/ashphill/PREIShare-org-repo/pull/4), **wasn't merged**. It's still open, and its `pr-ci` check passed, which shows CI alone doesn't catch privacy problems.

The practice files stay under `docs/ci/samples/` on that unmerged branch for learning. They aren't live member-facing code. Sprint 7 must not merge that sample.

### Decision log: why people remain the approvers

Approval and merge stay with the person named in `docs/ci/pr-approval-roles.md`, Ashton Phillips. A passing CI run can't judge these four risks. The AI may comment, but a person must decide.

| Risk | Why a person must decide | Artifact that supports the person |
| --- | --- | --- |
| Sign-in | A change can pass every test and still let a signed-out visitor reach `/dashboard`, or show one sponsor another sponsor's listings, because no test checks that rule. | `docs/ci/pr-approval-roles.md` and `docs/ci/human-judgment-checklist.md` (Sign-in) |
| Money | Asking prices, currency and new paid-API costs affect what investors rely on, and an AI comment can't accept that an amount or cost is right. | `docs/ci/human-judgment-checklist.md` (Money) |
| Privacy | The practice review planted a privacy mistake on purpose: contact details on a public share preview. The AI flagged it, but it also made up a second finding and later lowered the severity. A person judged the AI's notes against the checklist and marked privacy as a fail that blocks merge. See `docs/ci/sample-pr-review/critique-and-prompt-revision.md`. | `docs/ci/human-judgment-checklist.md` (Privacy) and the critique file |
| Product intent | A change can be technically fine and still drift from what PREIshare is for: helping investors and sponsors find and manage real-estate opportunities they can trust. | `docs/ci/ai-review-overlay-brief.md` and `docs/ci/human-judgment-checklist.md` (Product intent) |

### Sprint 7 next actions

These pieces are already done and working, so none of them is missing, unbuilt or work to create:

- **The pull-request CI workflow is done and running.** Don't rebuild `.github/workflows/pr-ci.yml`.
- **The AI review prompt pack, meaning the system instruction, is done.** `docs/ci/ai-pr-review-prompts.md` is written and has already been revised once.
- **The existing Production site is already live** at https://prei-share-org-repo-one.vercel.app on the current Vercel Hobby project. Don't create a new hosting project. Later confirmation uses that same public URL.

What Sprint 7 should do:

- Keep merge decisions with the person named in the roles file. The AI remains an advisor.
- On future pull requests, follow `docs/ci/ai-review-orchestration.md` and `docs/ci/human-judgment-checklist.md`, and write the approval before merging, including whenever admin bypass is used.
- Fix the severity gap the critique recorded: the re-run rated the planted privacy leak "medium," not "high." Make that fix inside `docs/ci/ai-pr-review-prompts.md`, not in a new prompt file.
- If a second collaborator joins, make them the human reviewer who gives the official GitHub approval, and consider turning off admin bypass.
- If the GitHub plan or repo setup later allows a rule that's only documented today, such as "who may merge," apply it from the branch-protection checklist. Until then, keep that gap recorded honestly. The gap doesn't mean CI was never built.
- Leave PR #4 unmerged.

### What stakeholders should remember

The automatic checks stay required evidence. The person who approves is still a person. The sample privacy change wasn't merged.
