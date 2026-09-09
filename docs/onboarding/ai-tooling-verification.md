cd ~/projects/PREIShare-org-repo
mkdir -p docs/onboarding
cat > docs/onboarding/ai-tooling-verification.md << 'EOF'
# AI tooling verification — PREIshare onboarding

**Date:** 2026-09-09
**Learner:** Ashton Phillips
**Tool under test:** <e.g. Cursor IDE agent>
**Context loaded:** `.cursor/rules/preishare.mdc`, `AGENTS.md`, `docs/onboarding/repo-map.md`

## Environment check

- [ ] Repo root opened in the tool (not a parent or unrelated folder)
- [ ] Rules / project memory files visible to the agent
- [ ] Answers compared against `docs/onboarding/repo-map.md` (human source of truth for paths)

## Smoke tests

| ID | Question theme | Result (pass / fail / vague) | Evidence (agent claim vs repo-map or rules) | Re-test after fix |
|----|----------------|------------------------------|---------------------------------------------|-------------------|
| ST1 | Where routes / UI entry / apps vs packages live | | | |
| ST2 | What must not be committed; secret handling | | | |
| ST3 | How to scope a tiny first change | | | |
| ST4 | Stack names and where their config lives | | | |

### ST1 — Structure (notes)

- Prompt summary:
- Agent answer (short):
- Expected (from repo-map):
- Result:

### ST2 — Safety (notes)

- Prompt summary:
- Agent answer (short):
- Expected (from rules / AGENTS.md):
- Result:

### ST3 — Scope (notes)

- Prompt summary:
- Agent answer (short):
- Expected (small surface, no drive-by refactors):
- Result:

### ST4 — Stack awareness (notes)

- Prompt summary:
- Agent answer (short):
- Expected (TypeScript, TanStack Start, React, Supabase, etc. as in repo):
- Result:

## Context gaps fixed

List each edit (file + one-line why). Example:

1. `AGENTS.md` — added explicit "never commit `.env*`" bullet after ST2 fail
2. `.cursor/rules/preishare.mdc` — named real apps/packages paths after ST1 vague answer

If no edits were needed, write: "No gaps; all four passed on first run."

## Re-verification

- Failed IDs re-run: …
- Final results: ST1 … ST2 … ST3 … ST4 …
- Accepted limitations (if any): …

## Go / no-go

**Decision:** GO / NO-GO for using this AI tooling on the first contribution.

**Rationale (2–4 sentences):**

**Signed off by:** Ashton Phillips
EOF