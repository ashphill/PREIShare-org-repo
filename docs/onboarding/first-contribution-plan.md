cd ~/projects/PREIShare-org-repo
git checkout main
git pull
git switch -c docs/first-contribution-ashphill

cat > docs/onboarding/first-contribution-plan.md << 'EOF'
# First contribution plan — PREIshare onboarding

## Author
- Name / GitHub handle: ashphill
- Feature branch: docs/first-contribution-ashphill
- Date: 2026-09-09

## One-sentence goal
Add myself as a new contributor in a contributors doc and make one minimal, reviewable docs touch so the team can practice review on a small first PR.

## Why this surface (link to prior artifacts)
- From `docs/onboarding/repo-map.md`: `docs/onboarding/` and `README.md` are named as safe first-touch surfaces, low runtime impact
- From `docs/onboarding/team-orientation-notes.md`: not yet read — to be confirmed before final submission
- From `docs/onboarding/ai-tooling-verification.md`: agent rules passed all four smoke tests (structure, safety, scope, stack) after one refine cycle, so tooling is verified enough to assist on a small implementation

## In scope (only these)
1. Create `CONTRIBUTORS.md` with my name, GitHub handle, and a one-line role ("Onboarding engineer").
2. Optional second touch: none planned yet — will only add if a concrete safe file is named from repo-map.
3. Capture implementation notes later in `docs/onboarding/first-contribution-notes.md` (next step — not done here).

## Out of scope (explicitly not this PR)
- Auth, sessions, or environment secrets
- Database schema, migrations, Supabase policies, or pgvector changes
- Dependency upgrades or lockfile churn unrelated to the contribution
- Multi-package refactors, renames, or formatting the whole repo
- CI/CD workflow edits unless a mentor explicitly assigns them

## Likely files to change
| File | Action | Why |
|------|--------|-----|
| CONTRIBUTORS.md | create | Add my contributor entry |
| n/a | n/a | No second touch chosen yet |
| docs/onboarding/first-contribution-notes.md | create (next step) | Record what the agent did and what I verified |

## Acceptance criteria
- [ ] I am on feature branch `docs/first-contribution-ashphill` (not the default branch).
- [ ] `CONTRIBUTORS.md` lists my name and GitHub handle in a consistent format.
- [ ] Any second touch is limited to the single file named above and does not change behavior beyond copy/docs.
- [ ] No secrets, `.env` files, or generated build artifacts are included.
- [ ] A teammate can review the diff in under 10 minutes without product-context deep dives.

## Verification plan (how I will know it worked)
1. `git status` / `git branch` show I am on the feature branch with only expected files modified.
2. Open `CONTRIBUTORS.md` and confirm my row/section renders as plain Markdown.
3. If a UI touch was included: run `npm run dev` and visually confirm the copy change; otherwise skip.
4. Skim `git diff` and confirm nothing outside the likely-files table appears.

## Risks and mitigations
- Risk: Agent expands scope into app core. Mitigation: refuse diffs that touch files not listed above; re-prompt with the out-of-scope list.
- Risk: Editing default branch by mistake. Mitigation: check `git branch` before every edit session.

## Definition of done for this planning step
- [ ] Feature branch created from updated default branch.
- [ ] This plan file saved at `docs/onboarding/first-contribution-plan.md` with all sections filled (no angle-bracket placeholders left).
- [ ] Ready to implement in the next step without re-deciding scope.
EOF