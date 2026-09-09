mkdir -p docs
cat > docs/repo-map.md << 'EOF'
# PREIshare repository map

> Onboarding map for first contribution planning. Built with AI-assisted
> inventory + human path verification. Do not treat this as architecture law
> if the real tree disagrees—update this file when you learn more.

## Meta

- Clone path (from setup-log): `~/projects/PREIShare-org-repo`
- Date mapped: `2026-09-09`
- Agent tool used: `chat-assistant + manual listing`
- Mapper: `ashphill`

## 1. Overview (5–8 sentences)

PREIshare appears to be organized as: single package — unclear, only one src/ folder seen so far, no apps/ or packages/ folders. In plain language, the product code seems to live mainly in `src/`. Shared libraries or packages appear in: none found yet (no packages/ folder at top level). Docs and onboarding notes live in `docs/` (including this file). Config suggests TypeScript, Vite, and possibly TanStack Router (`tsr.config.json`), but this is not yet confirmed by opening `package.json`. I am intentionally not editing application code while building this map.

## 2. Top-level inventory

| Path | Kind (app / package / config / docs / other) | One-sentence purpose | Verified by me? (yes/no) |
|------|-----------------------------------------------|----------------------|---------------------------|
| `.cta.json` | config | Unclear — not a standard file, purpose unknown | no |
| `.cursorrules` | config | Rules file for the Cursor AI code editor | no |
| `.git` | other | Git's internal metadata folder | yes |
| `.gitignore` | config | Lists files/folders Git should not track | no |
| `.vscode` | config | VS Code editor/workspace settings | no |
| `AGENTS.md` | docs | Likely instructions for AI coding agents working in this repo | no |
| `docs` | docs | Documentation folder, including onboarding notes | yes |
| `package-lock.json` | config | Locks exact npm dependency versions | yes |
| `package.json` | config | Root Node package manifest / scripts | no |
| `README.md` | docs | Project overview/readme | no |
| `src` | app | Likely main application source code folder | no |
| `tsconfig.json` | config | TypeScript compiler configuration | yes |
| `tsr.config.json` | config | Possibly TanStack Router config | no |
| `vite.config.ts` | config | Vite build tool configuration | yes |

## 3. Frontend concerns (TypeScript, React, TanStack Start)

- Likely app root(s): `src/`
- Clues I used (file names, frameworks mentioned in package.json): `tsconfig.json`, `vite.config.ts`, `tsr.config.json` (not yet opened to confirm)
- Entry / routes / UI areas worth knowing: not found yet — need to open src/
- How this area relates to user-facing screens: unclear until src/ and package.json are opened

## 4. Backend / data concerns (Supabase, PostgreSQL, pgvector, APIs)

- Supabase or data config paths: not found yet
- Migrations / SQL / schema-related paths: not found yet
- Env examples (NOT secret values): not found yet
- Notes on what a beginner should not touch in production data: not yet known — no data/config paths located

## 5. Tooling and CI

- TypeScript / lint / format config: `tsconfig.json`
- CI workflows (e.g. GitHub Actions): not found yet — no .github/ folder seen in top-level listing
- Editor or agent config already present: `.vscode`, `.cursorrules`, `AGENTS.md`
- Scripts from package manifests that look like dev/build/test: not found yet — need to open package.json

## 6. Safe first-touch vs do-not-edit-yet

### Safe first-touch (good candidates for a tiny onboarding PR)

| Path or area | Why it is relatively safe | Risk if handled carelessly |
|--------------|---------------------------|----------------------------|
| `docs/onboarding/` | Docs-only; helps the team | Misleading docs |
| `README.md` | Low runtime impact | Wrong links / formatting |

### Do not edit yet (wait until you have tests, review, and a real task)

| Path or area | Why wait | What could break |
|--------------|----------|-------------------|
| `src/` | Not yet verified what it contains | Unknown — could be core app logic |
| `package.json` / `package-lock.json` | Dependency graph | Install failures for all |
| `.git` | Git internals | Repo history/integrity |
| Supabase / migrations / production env | Data and secrets | Data loss or leaked secrets (not yet located) |

## 7. Open questions for the team

- What does `.cta.json` do — is it a custom internal tool config?
- Is `tsr.config.json` confirming TanStack Router, and where do routes live inside `src/`?
- Where (if anywhere) does Supabase/PostgreSQL config live — no such paths found in the top-level listing yet.

## 8. How I will use this map next

- Configure AI project rules/memory using the paths above (next tooling steps).
- Pick a first contribution only from **Safe first-touch** unless a mentor expands scope.
- Revisit and edit this file when a path claim is proven wrong.
EOF