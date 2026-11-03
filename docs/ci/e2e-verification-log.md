# PREIshare PR CI — End-to-End Verification Log

- **Date:** 2026-11-03
- **Verifier:** Ashton Phillips (run with a coding agent)
- **Repo / branch used:** `ashphill/PREIShare-org-repo`, with the throwaway branch `ci/e2e-dry-run` → **draft PR #3** into `main` (closed without merging). The fix was then applied to `main`.

**Inputs checked:**

- `.github/workflows/pr-ci.yml`
- `docs/ci/ci-scripts-notes.md`
- `docs/ci/branch-protection-checklist.md`
- `docs/ci/ai-pr-review-prompts.md`

Every result below was observed on a real GitHub Actions run or a real command. Where something was **not** run, the cell says so.

---

## 1. Static workflow review

| Check | Result | Evidence / notes |
| --- | --- | --- |
| Triggers on `pull_request` (branches as designed) | **pass** | `on.pull_request.branches: [main]`, `types: [opened, synchronize, reopened]`. There's no `push` trigger. This matches `pipeline-design.md` (main is the only merge target). |
| Job name clear for GitHub status checks | **pass** | `jobs.ci.name: Install, lint, typecheck, test, build`. GitHub showed exactly this check-run name on PR #3. |
| Step order | **pass** (with a documented difference) | The actual order is checkout → Node 22 → `npm ci` → lint → typecheck → test → build. That's the order in `pipeline-design.md` (cheap checks first, build last). It differs on purpose from the scaffold's "typecheck → build → lint → test." Both start with install and run every gate. |
| Each `run:` matches `ci-scripts-notes.md` | **pass** | `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` match table rows 1–5 exactly, and all four scripts exist in `package.json`. |
| Caching / install strategy | **pass** | `setup-node` with `cache: npm`, keyed on `package-lock.json`, plus `npm ci` (a clean install that fails if the lockfile is out of sync). `node_modules` and build output aren't cached. |
| Fail-fast behavior | **pass** | There's no `continue-on-error` and no `\|\| true` (`npm run lint` also enforces this). It was confirmed live in run 2 below: Typecheck failed, Test and Build were **skipped**, and the job turned red. |
| No plaintext secrets or unsafe `${{ }}` expansions | **pass** | No `secrets.*` are used, and `permissions: contents: read`. The only expressions are `github.workflow`, `github.event.pull_request.number` and `github.ref`, in the concurrency group, not in `run:` lines. I searched the run 1 log for key patterns (`sb_secret`, JWT `eyJ…`, `AIza`, `sk-proj`) and found **0 matches**. |

**Static review summary:** The workflow matches the design and the scripts notes line for line. It runs only on PRs to `main`, uses read-only permissions with no secrets, and every quality gate fails the job. One problem showed up only when it ran: `actions/checkout@v4` and `setup-node@v4` triggered a GitHub "Node.js 20 is deprecated" warning. That's fixed in cycle 2.

---

## 2. Local CI command dry-run

The same sequence as CI. Commands come from `docs/ci/ci-scripts-notes.md`. Two environments were used: **(a)** a clean GitHub-hosted runner (PR #3, the real CI environment) and **(b)** the agent's cloud workspace.

| Step | Exact command | Exit on GitHub runner (PR #3, run [41612327083](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612327083)) | Exit in agent workspace | Notes |
| --- | --- | --- | --- | --- |
| Install | `npm ci` | **pass** | **not run** (no npm registry access there) | "added 221 packages, and audited 222 packages in 6s" |
| Lint | `npm run lint` | **pass** | **pass** | `lint: OK (73 files checked, 0 problems)` in both. A planted fake key, `debugger` and a `VITE_EMBEDDING_API_KEY` were each caught (exit 1) in the workspace. |
| Typecheck | `npm run typecheck` | **pass** | **not run** (needs `npm ci`) | `tsc --noEmit --project tsconfig.typecheck.json`, no errors |
| Test | `npm run test` | **pass** | **pass** | `# tests 8 / # pass 8 / # fail 0` |
| Build | `npm run build` | **pass** | **not run** (needs `npm ci`) | Three Vite builds with "✓ built" (client, SSR, Nitro). The whole job took about 25 seconds. |

**Environment notes:**

- **GitHub runner:** `ubuntu-latest`, Node **22.23.4** (from the tool cache), npm with `package-lock.json`.
- **Agent workspace:** Linux, Node 22.23.4.
- **Ashton's Mac:** **not run yet.**

**Local dry-run summary:** The full sequence passed on a clean runner on the first try. Nothing broke first. Running it on a personal laptop is still to do: Ashton should run `npm ci && npm run lint && npm run typecheck && npm run test && npm run build` on his Mac with Node 22.6 or newer.

---

## 3. PR → CI loop checklist

Items come from `docs/ci/branch-protection-checklist.md`.

| Checklist item | Status | Evidence |
| --- | --- | --- |
| Workflow runs on pull requests | **Ready** | Draft PR #3 started `PR CI` automatically on open and on every push. There were 5 runs: [success](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612327083), [failure](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612453594), [success](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612555096), [cancelled](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612679971) and [success](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612712167). |
| Check names suitable as required status checks | **Ready** | The check-run API for the PR's commits listed **`Install, lint, typecheck, test, build`** (app: github-actions). Vercel also posts **`Vercel Preview Comments`**, which should **not** be required (checklist: "Don't require deploy checks"). |
| Concurrency / duplicate-run behavior | **Ready** | Seen live. Commit `8f95857` started run 41612679971. While it was `in_progress`, commit `507385d` was pushed, and the older run ended **`cancelled`** while the new run 41612712167 ended **`success`**. Separately, two pushes made seconds apart produced only one run, for the latest commit. |
| Person still required for merge (CI isn't auto-merge) | **Needs work** | The workflow has no merge or auto-merge step (pass). But branch protection is **not enabled** on `main` yet, so a red or unreviewed PR could still be merged by hand. `ashphill` has admin rights and can turn on the settings in `branch-protection-checklist.md`. |
| Branch protection readiness gaps listed | **Ready** | The checklist names the exact required check, 1 required approval, dismissing stale approvals, and what *not* to require. Its sign-off now records the first real green run. |

**PR loop summary:** Yes. A teammate who opens a PR tomorrow gets an automatic, trustworthy green or red result in about 25 seconds, and a red check names the failing step and the file and line. It isn't **enforced** until branch protection is turned on, so until then reviewers have to look at the Checks tab themselves.

---

## 4. AI-assisted review dry-run (a person stays accountable)

- **Sample change used:** a short *hypothetical* risky diff, written for this test and **not committed**:
  - In `src/lib/property-search.ts`, `createSupabaseServerClient()` is swapped for `createServiceRoleSupabaseClient()`.
  - In `src/routes/api/properties/search.ts`, `MAX_QUERY_LENGTH` goes from `500` to `5000`.
- **Prompt chosen:** **Prompt 2 — Risk flags (auth, Supabase, migrations, secrets)** from `docs/ci/ai-pr-review-prompts.md`, pasted unchanged with the diff.
- **Tool category used:** chat assistant (Claude, answering in this working session; see the caveat under problems).

**AI output — what helped:**

- **HIGH, bucket B:** `property-search.ts` now uses the service-role client, which **bypasses RLS**. It quoted the changed line, explained that search would read every row regardless of policy, and asked: "Why does search need to bypass RLS when the anon key plus the public read policy already work?"
- **MEDIUM, bucket E:** `MAX_QUERY_LENGTH 500 → 5000` on a public endpoint that calls a paid embedding API. It asked: "Is there a reason for 10× longer queries, and is there any rate limit?"
- Buckets A, C and D were marked "no changes in this area." It didn't invent findings there.
- It listed "Needs human verification: whether `properties` will ever hold non-public rows."
- It never said approve, LGTM, safe or merge, and it didn't claim anything about CI status, because no CI result was pasted.

**AI output — problems:**

- It rated the service-role change HIGH without being able to know that `properties` is currently a public, read-only demo table, so the real exposure today is lower. That's correct in principle but needed a person to put it in context.
- **Caveat:** the assistant that answered is the same AI model that helped write the prompt pack, so this isn't a fully independent test. Ashton should re-run Prompt 2 in a fresh chat to confirm.

**Human judgment call:** **Request changes.** The service-role client is never needed for public search (`pipeline-design.md` and the inventory say service role is for admin and seed scripts only), and it would silently remove RLS protection if the table ever gets private rows. The 10× query length needs a reason and a rate limit first. The AI raised the right questions; the decision is mine.

**Prompt fix applied?** **No.** The output stayed advisory and stayed within the PREIshare buckets on the first run, so no fix was needed. A possible later improvement is to let the reviewer paste table context (public or private) into Prompt 2 so severity is better calibrated.

---

## 5. Assess → fix → re-verify cycles

| Cycle | What failed | Fix applied (file + change) | Re-verify result |
| --- | --- | --- | --- |
| 1 (deliberate) | I added `src/lib/ci-dry-run-probe.ts` with `export const probe: number = 'not a number'` to prove the gate catches errors. Run [41612453594](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612453594): **Typecheck failed** with `src/lib/ci-dry-run-probe.ts(2,14): error TS2322: Type 'string' is not assignable to type 'number'`. Test and Build were **skipped** and the job was red. | Deleted the probe file (branch only, never on `main`). | Run [41612555096](https://github.com/ashphill/PREIShare-org-repo/actions/runs/41612555096): **success**, all steps green. |
| 2 (real gap) | Run 1 showed `##[warning]Node.js 20 is deprecated … actions/checkout@v4, actions/setup-node@v4 … forced to run on Node.js 24`. It didn't fail the job, but it's a coming breakage and noise in the logs. | `.github/workflows/pr-ci.yml`: `actions/checkout@v4 → @v5`, `actions/setup-node@v4 → @v5`. Tested on PR #3, then applied to `main` in the same commit as this log. | Run 41612555096 on v5: **success**, and the Node 20 deprecation warning is **gone**. Only harmless dependency warnings remain (`punycode` / `url.parse` DEP notices from packages). |

**Residual risk:** the workflow has only run on the throwaway PR branch. The first real feature PR after this is the true test of the version on `main`, though its content is identical apart from this log.

---

## 6. Gate credibility decision

**Overall gate status:** **Credible with known gaps.**

**Known gaps still open:**

1. **Branch protection isn't enabled on `main`,** so red checks and missing approvals are visible but not enforced. Owner: Ashton (admin). Follow `docs/ci/branch-protection-checklist.md` and select the required check `Install, lint, typecheck, test, build`.
2. **No ESLint.** `npm run lint` is the zero-dependency hygiene lint. React and TypeScript style rules need `npm install -D eslint @eslint/js typescript-eslint` plus a lockfile commit (see `ci-scripts-notes.md`).
3. **Test coverage is thin:** 8 unit tests, only for `src/lib/embeddings/generate.ts`. There are no component, route or database tests, and no browser end-to-end tests (they need Supabase secrets, Bucket B).
4. **Not verified on Ashton's Mac yet.** The local `npm ci` → build sequence and his Node version (22.6 or newer needed for `npm run test`) haven't been checked.
5. **The AI review test wasn't independent** (same model). Re-run one prompt in a fresh chat on a real PR.
6. **Housekeeping:** the closed throwaway branch `ci/e2e-dry-run` still exists on GitHub. The agent wasn't allowed to delete it, so delete it in the GitHub UI.

**Safe for Sprint 6 stakeholder handoff?** **Yes, with caveats** (gaps 1–4).

**Notes for Step 12 handoff:**

- Every PR to `main` now runs install → lint → typecheck → test → build automatically on GitHub in about 25 seconds. It was proven green, red and cancelled on real runs on PR #3.
- A red check names the exact failing step and the file and line. Later steps are skipped, and nothing hides failures.
- The required check name to use in branch protection is `Install, lint, typecheck, test, build`. Turning on enforcement is a manual admin step that isn't done yet.
- The AI review prompts produced useful, advisory-only risk flags (service-role use, API cost). A person made and owns the merge decision.
- Next work: ESLint, more tests, enabling branch protection, and a local Mac run.
