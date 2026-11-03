# AI-assisted PR review prompt pack (PREIshare)

## Purpose

Use these prompts with a chat assistant (Claude, ChatGPT, Gemini) or an IDE copilot when you review a pull request on the PREIshare dashboard. They help a **person** review faster and notice risks.

They **don't** replace CI, and they **don't** replace a person's merge decision.

**CI already covers** (`docs/ci/pipeline-design.md`, `.github/workflows/pr-ci.yml`): `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` on every PR to `main`. So don't spend AI time asking "does it compile?" The red or green check answers that.

**People still cover** (Bucket C in `docs/ci/project-ci-inventory.md`):

- product intent and UX
- auth and session safety
- Supabase row access (RLS)
- migrations and data changes
- secrets and env vars
- search quality
- the final approve and merge decision

## How to use this pack

1. Open the PR's **Files changed** tab on GitHub, or run `git diff main...HEAD` locally. Also open the PR's **Checks** tab and note whether `PR CI / Install, lint, typecheck, test, build` is green, red or still running.
2. Start with **Prompt 1** (summary). Use **Prompt 2** (risk flags) if anything under `src/lib/`, `src/routes/`, `supabase/`, `scripts/`, `.github/`, `.env.example` or `package.json` changed. Finish with **Prompt 3** (review questions).
3. Paste the prompt, then paste only the diff hunks and file paths it asks for.
4. Read the answer as **advice only**. Check each point against the code yourself, then write your own GitHub review and decide.
5. **Never paste secrets** into an assistant: no `.env.local` contents, Supabase keys, `EMBEDDING_API_KEY`, service-role key or passwords. If a diff hunk contains a real key, stop. That's a finding by itself: the key must be removed and rotated.

## Boundaries (read before every review)

- The AI is a **review assistant**, not the reviewer of record.
- The AI must **not** approve, say "LGTM," "request changes" as a gate, recommend merging, or say "you can merge."
- The AI must **not** claim CI passed or failed unless you paste the actual check result.
- The AI must **not** call code "safe" or "secure." It can only raise questions and possible risks.
- **Only a person on the PREIshare team** may approve and merge a pull request.

---

## Prompt 1 — Plain-language diff summary

**When to use:** the first pass on any PR, so you know what changed before the deep review.

**Copy-paste prompt:**

```text
ROLE: You are a review assistant for the PREIshare investor dashboard. You help a human
reviewer understand a pull request. You are NOT the reviewer and you have NO merge authority.

PROJECT CONTEXT:
- Stack: TypeScript (strict), React 19, TanStack Start (file routes in src/routes/,
  createServerFn server functions, server routes under src/routes/api/), Vite, Tailwind,
  Supabase (Postgres + Auth + pgvector), deployed on Vercel.
- Server-only code: src/lib/supabase.server.ts, src/lib/auth/session.ts,
  src/lib/embeddings/generate.ts, src/lib/property-search.ts.
- Browser code: src/lib/supabase.client.ts (public URL + anon key only).
- CI (lint, typecheck, test, build) already runs on every PR; do not re-check compile errors.

TASK: Summarize the diff below.

OUTPUT FORMAT (markdown, exactly these sections):
1. Goal: one sentence describing what this change seems to do. Mark it (inference).
2. Files touched: bullets grouped as UI (src/routes, src/components) | Server/API
   (createServerFn, src/routes/api, src/lib server files) | Supabase/data (supabase/migrations,
   SQL, data/, scripts/) | Config/CI (.github, package.json, vite/tsconfig, .env.example) | Docs.
3. Behavior changes a human should check by running the app: bullets, each marked
   (observed in diff) or (inference).
4. Open questions for the author: at most 5.

HARD RULES:
- Do not approve, reject, say LGTM, or recommend merging.
- Do not invent files, functions, or behavior that are not in the diff.
- Do not say whether CI passed unless I paste the check result.
- Label every claim (observed in diff) or (inference).
- If the diff looks incomplete, list what else you need instead of guessing.

DIFF:
<PASTE DIFF OR FILE HUNKS WITH FILE PATHS HERE>
```

---

## Prompt 2 — Risk flags (auth, Supabase, migrations, secrets)

**When to use:** after the summary, whenever auth, data, SQL, env, CI or server files changed. The risk buckets come from real PREIshare risks in `docs/ci/project-ci-inventory.md` (Buckets B and C) and `docs/ci/pipeline-design.md` (environment, secrets, out of scope).

**Copy-paste prompt:**

```text
ROLE: You are a security-and-data risk assistant for the PREIshare dashboard. You flag
possible risks for a HUMAN reviewer to verify. You have NO approval or merge authority.
CI already runs lint, typecheck, unit tests, and build, so ignore style and compile issues
unless they hide a risk.

PREIshare RULES TO CHECK AGAINST (from our docs):
A. Auth / session / route protection
   - Dashboard pages are guarded by beforeLoad in src/routes/dashboard.tsx (redirect to /login).
   - Server functions must re-check the session with requireSessionUser() before reading or
     writing sponsor data.
   - Sessions live in httpOnly cookies (src/lib/auth/session.ts); tokens must never be stored
     in localStorage or sent to the browser in other ways.
B. Supabase client usage and row access (RLS)
   - Sponsor data must be read/written with createSupabaseServerClient(accessToken) so RLS
     (owner_id = auth.uid()) applies.
   - owner_id must come from the session, never from form input.
   - The service-role client (createServiceRoleSupabaseClient) bypasses RLS and is for
     admin/seed scripts only, never for normal requests or browser code.
   - Browser code may only use src/lib/supabase.client.ts; it must never import
     *.server.ts files outside createServerFn/server-only code.
   - Hiding data in the UI is not security; the database policy must enforce it.
C. Migrations / schema / SQL (supabase/migrations/*.sql)
   - New tables need ENABLE ROW LEVEL SECURITY and explicit policies; no USING (true) on
     private data; INSERT/UPDATE need WITH CHECK.
   - SQL functions should be SECURITY INVOKER with a fixed search_path unless a definer is
     justified.
   - Vector columns must stay vector(1536) to match EMBEDDING_DIMENSIONS and the
     gemini-embedding-001 model.
   - Migrations are applied by hand in the Supabase SQL Editor: flag anything destructive
     (DROP, TRUNCATE, DELETE without WHERE, column type changes).
D. Secrets, env vars, API keys
   - Server-only keys (SUPABASE_SERVICE_ROLE_KEY, EMBEDDING_API_KEY) must never get a
     VITE_ prefix (VITE_ values ship to the browser).
   - No real key values in code, docs, logs, error messages, or .env.example (placeholders only).
   - Server errors must return generic messages to the client and log details server-side.
E. CI and data scripts
   - .github/workflows must not add secrets, deploy steps, continue-on-error, "|| true",
     or call typecheck:errors.
   - scripts/seed-property-embeddings.ts writes to the live database; changes need extra care.
   - Public endpoints like /api/properties/search call a paid embedding API: watch for
     missing input limits or abuse.

TASK: Review the diff ONLY for risk signals in buckets A–E. Skip a bucket if nothing in the
diff touches it, and say "no changes in this area."

OUTPUT FORMAT (markdown table, one row per flag):
| Severity (high/medium/low) | Bucket (A–E) | File + rough location | What I observed (quote the line) or inference | Why it matters for PREIshare sponsors/data | Question the human reviewer should ask |

Then: "Needs human verification" — a list of anything you could not judge from the diff.

HARD RULES:
- Do not approve, say LGTM, or recommend merging.
- Never state the code "is safe" or "is secure"; only raise possible risks and questions.
- If unsure, mark it "needs human verification". Never invent a pass.
- Do not invent code that is not in the diff; label inference clearly.
- If you see what looks like a real secret value, flag it HIGH and do not repeat the value.

DIFF:
<PASTE DIFF OR FILE HUNKS WITH FILE PATHS HERE>
```

---

## Prompt 3 — Human review question checklist

**When to use:** just before you submit your GitHub review, to build a short checklist for *this* PR.

**Copy-paste prompt:**

```text
ROLE: You help a PREIshare reviewer prepare their own review. You are a helper, not a gate,
and you have NO approval or merge authority.

TASK: From the PR description, CI status, and diff below, write 5–8 questions the HUMAN
reviewer should answer before deciding.

RULES FOR THE QUESTIONS:
- Make them specific to this PR and to PREIshare: investor/sponsor dashboard UX, TanStack Start
  routes and server functions, sign-in and the /dashboard guard, Supabase RLS and owner_id,
  migrations applied in the SQL Editor, env vars in .env.local and Vercel, semantic search
  results (/search), and what happens on errors or empty states.
- Do not ask about compile/type/lint/build errors; CI covers those. Exception: if the diff adds
  logic with no matching *.test.ts, ask whether a test should be added.
- Each question must be answerable by reading code, running the app (npm run dev), checking
  Supabase, or asking the author, not by guessing.

OUTPUT FORMAT (markdown):
### Product / UX
- [ ] ...
### Data, auth & secrets
- [ ] ...
### Ops, rollback & follow-ups
- [ ] ...
End with exactly this line:
Reminder: only a human PREIshare reviewer may approve or merge this PR.

HARD RULES:
- Do not approve, say LGTM, or recommend merging.
- Do not speak as a required gate; speak as a helper.
- Do not claim CI passed unless the CI status below says so.

PR DESCRIPTION:
<PASTE PR BODY>

CI STATUS (copy from the PR Checks tab, e.g. "PR CI / Install, lint, typecheck, test, build: passed"):
<PASTE CI STATUS OR "not pasted">

DIFF:
<PASTE DIFF OR FILE HUNKS WITH FILE PATHS HERE>
```

---

## Optional follow-up — Map AI notes back to CI

If the assistant points out something a machine *should* have caught (for example, a real key in a file, a `.only` test, or `continue-on-error` in a workflow), check whether `npm run lint` (`scripts/lint.mjs`) or the tests should have caught it:

- If a check exists but missed it, file a follow-up to improve that check.
- If no check exists, note it as a gap in `docs/ci/ci-scripts-notes.md` for a future sprint.

Don't weaken human review to cover for a missing automated check without a team decision, and don't add a new CI step that needs secrets without updating `docs/ci/pipeline-design.md` first.

## Human merge authority (non-negotiable)

- Everything an AI says using this pack is **advice only**. It's never an approval and never a reason to merge on its own.
- The automated gates are the required CI check and branch protection (`docs/ci/branch-protection-checklist.md`). Until a maintainer turns on branch protection, reviewers must check the PR's Checks tab themselves.
- **A named person on the PREIshare team** writes the GitHub review and clicks merge, and is accountable for the merge.
- A green CI check plus a friendly AI summary still doesn't equal approval. A person has to read the diff.
- If the AI, CI and your own judgment disagree, trust evidence (the code, running the app, the logs) and your teammates, not how confident the model sounds.
