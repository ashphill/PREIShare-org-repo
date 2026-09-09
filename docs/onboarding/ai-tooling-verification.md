cd ~/projects/PREIShare-org-repo
cat > docs/onboarding/ai-tooling-verification.md << 'EOF'
# AI tooling verification — PREIshare onboarding

**Date:** 2026-09-09
**Learner:** Ashton Phillips
**Tool under test:** Cursor IDE agent (rules loaded from `.cursor/rules/preishare.mdc`)
**Context loaded:** `.cursor/rules/preishare.mdc`, `AGENTS.md`, `docs/onboarding/repo-map.md`

## Environment check

- [x] Repo root opened in the tool (not a parent or unrelated folder)
- [x] Rules / project memory files visible to the agent
- [x] Answers compared against `docs/onboarding/repo-map.md` (human source of truth for paths)

## Smoke tests

| ID | Question theme | Result (pass / fail / vague) | Evidence (agent claim vs repo-map or rules) | Re-test after fix |
|----|----------------|------------------------------|---------------------------------------------|-------------------|
| ST1 | Where routes / UI entry / apps vs packages live | pass | Rules correctly state `src/routes/` file-based routing, single package, no apps/packages split — matches repo-map | not needed |
| ST2 | What must not be committed; secret handling | pass | Rules explicitly name `.env` files and secret values as never-commit — matches AGENTS.md and repo-map | not needed |
| ST3 | How to scope a tiny first change | pass | Rules state smallest-diff preference, no drive-by refactors, ask before touching `src/` — matches repo-map's safe/unsafe split | not needed |
| ST4 | Stack names and where their config lives | fail | Rules flatly claim "no database... confirmed blank scaffold," but repo-map still lists the data layer as "not found yet" (open question, not resolved) — rules overclaim certainty repo-map doesn't have | yes — see below |

### ST1 — Structure (notes)

- Prompt summary: Asked where routes/UI entry live and apps vs packages split
- Agent answer (short): `src/routes/` file-based routes, `src/router.tsx`, `src/components/`; single package, no apps/packages folders
- Expected (from repo-map): Matches — repo-map confirms single package, `src/` as app root, no apps/packages split
- Result: PASS

### ST2 — Safety (notes)

- Prompt summary: Asked what must never be committed and how to respond to a request to hardcode secrets
- Agent answer (short): Never commit `.env` files or secret values; refuses to place secrets in source
- Expected (from rules / AGENTS.md): Matches — both files name `.env` explicitly, not just a vague "be careful"
- Result: PASS

### ST3 — Scope (notes)

- Prompt summary: Asked how to scope a tiny first UI/docs change
- Agent answer (short): Smallest diff that solves the task, no drive-by refactors, ask before editing `src/`
- Expected (small surface, no drive-by refactors): Matches
- Result: PASS

### ST4 — Stack awareness (notes)

- Prompt summary: Asked which core technologies this repo uses and where their config lives
- Agent answer (short): TypeScript, React 19, TanStack Start/Router, Tailwind v4, Vite — correct. But also states no database/auth exists, "confirmed"
- Expected (TypeScript, TanStack Start, React, Supabase, etc. as in repo): Stack names correct, but repo-map still lists the data layer as unresolved/"not found yet" — the rules file's "confirmed" wording outpaces what repo-map actually verifies
- Result: FAIL (overconfident data-layer claim, not a stack-naming error)

## Context gaps fixed

1. `.cursor/rules/preishare.mdc` — reworded the data-layer line from "no database... confirmed blank scaffold" to "no data layer wired up yet; repo-map.md is still tracking Supabase/PostgreSQL/pgvector as the intended stack — treat as the target to confirm or build toward, not a client already in place," so the rules file matches repo-map's actual "not found yet" status instead of racing ahead of it.

## Re-verification

- Failed IDs re-run: ST4
- Final results: ST1 PASS, ST2 PASS, ST3 PASS, ST4 PASS (after rules file edit)
- Accepted limitations (if any): `docs/onboarding/repo-map.md` itself still has an open question on the data layer — this is expected and tracked there, not a tooling failure

## Go / no-go

**Decision:** GO for using this AI tooling on the first contribution.

**Rationale (2–4 sentences):** All four smoke tests pass after one focused fix to the data-layer wording in the rules file, and the two most critical checks — safety (ST2) and structure (ST1) — passed cleanly on the first run with no vagueness. The one failure (ST4) was a wording mismatch, not an invented framework or missing file, and was resolved in a single small edit rather than a rewrite. The tooling correctly grounds itself in real repo paths and refuses unsafe secret handling, which is enough confidence for a small, low-risk first contribution.

**Signed off by:** Ashton Phillips
EOF