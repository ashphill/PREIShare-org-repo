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

**Status after verification:** [ ] Not enabled yet / [x] Enabled on `main` (2026-11-03)

**Evidence:** the Enforcement record in `docs/ci/branch-protection-checklist.md`.

Admin bypass is still allowed, so reviewers must check the PR's **Checks** tab before approving.

---

## 5. Known limits and risks (honest scope)

| Limit | Impact | Recommended next action |
| --- | --- | --- |
| **Branch protection: admin bypass allowed** | Enabled on `main` (2026-11-03), but the admin can still bypass it | Follow the human checklist whenever bypass is used. |
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

1. **Branch protection on `main`: done (2026-11-03)** with the required check and 1 approval. Next, confirm on a test PR that **Merge** is blocked on red.
2. **Add ESLint.** Install `eslint`, `@eslint/js` and `typescript-eslint` locally, add `eslint.config.js`, fix the findings, commit `package.json` and `package-lock.json`, and fold it into the existing **Lint** step.
3. **Add tests where bugs would hurt most:** the listing validators in `src/lib/listings/schema.ts` and `clampMatchCount` and empty-query handling in `src/lib/property-search.ts`. That brings coverage beyond the embedding helper.
4. **Remove local-vs-CI drift:** add `.nvmrc` (22) and update the README's Node requirement so laptops, CI and Vercel agree. Run the full local sequence on Ashton's Mac and record the result in the verification log.
5. **Decide the policy for secrets and Supabase on PRs:** stay secrets-free (current), or add a separate integration job against a *test* Supabase project with GitHub Secrets and manual approval.
6. **Re-run the AI review prompts** on one or two real feature PRs in a fresh chat, refine Prompt 2 so reviewers can paste table context (public vs private) for better severity, and keep the "people merge" rules.
7. **Housekeeping:** delete the leftover `ci/e2e-dry-run` branch on GitHub.

---

## 9. One-paragraph executive summary

Every PREIshare pull request into `main` now automatically runs install, lint, typecheck, unit tests and a production build on GitHub, in about 25 seconds. A broken change shows a red X that names the failing step before anyone merges, instead of failing on a teammate's laptop or in a Vercel deploy. We proved this on a real test PR, which went green, then red on a deliberate error, then green after the fix, and a newer push cancelled the outdated run. A prompt pack helps reviewers spot auth, database and secret risks, but AI output is advice only. Approving and merging, handling secrets and judging the product stay with people. Branch protection is now on (2026-11-03), so a red check blocks normal merging. After that, the next topic should add ESLint, more tests and a matching Node version everywhere.

---

## Topic 2: AI review overlay on the finished CI gate

Topic 1 stays: `.github/workflows/pr-ci.yml` is done. Topic 2 adds human review on top. Branch protection is now on (see section 4).

**AI can:** suggest findings in the required shape (advisor only). **AI cannot:** approve, merge, replace a human decision, or be a required reviewer or check. Green CI isn't permission to merge.

**Where to read:** overview `docs/ci/ai-review-overlay-brief.md`; roles `docs/ci/pr-approval-roles.md`; system instruction `docs/ci/ai-pr-review-prompts.md`; checklist `docs/ci/human-judgment-checklist.md`; runbook `docs/ci/ai-review-orchestration.md`; sample critique `docs/ci/sample-pr-review/critique-and-prompt-revision.md`; branch protection `docs/ci/branch-protection-checklist.md`; practice sample `docs/ci/samples/README.md`.

**Branch protection, enforced now on `main`:** PR required; 1 human approval; required check `Install, lint, typecheck, test, build`. **Documented only, not enforced:** admin bypass; "who may merge"; "up to date"; the checklist and runbook. The AI isn't a required approver or check.

**Sample privacy PR:** PR #4 (planted privacy mistake) **was not merged**. Don't merge it.

**Decision log, why a person approves:**
- Sign-in: tests can pass while the wrong person gets in.
- Money: an AI comment can't accept that a price or cost is right.
- Privacy: the AI flagged the planted leak; a person marked it fail with the checklist.
- Product intent: a change can work yet drift from PREIshare's purpose.

**Sprint 7 next actions:** already done, don't rebuild: the `pr-ci.yml` workflow, the prompt pack, and the live Production site https://prei-share-org-repo-one.vercel.app (no new hosting project). Next: follow the runbook and checklist, fix the severity gap in the same prompt file.
