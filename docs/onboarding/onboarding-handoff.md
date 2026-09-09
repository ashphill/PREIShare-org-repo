cd ~/projects/PREIShare-org-repo
cat > docs/onboarding/onboarding-handoff.md << 'EOF'
# PREIshare onboarding handoff

**Author:** Ashton Phillips (ashphill)
**Date:** 2026-09-09
**Branch / PR:** docs/first-contribution-ashphill — https://github.com/EdTechForLearning/PREIShare-org-repo/pull/11 (open, scope issue unresolved)
**Audience:** mentor, future self, sprint lead

## 1. Stakeholder summary (plain language)

I completed most of PREIshare engineering onboarding for Sprint 1 (dev environment and AI tooling). I forked the team repository, cloned my fork, wired up origin and upstream, verified my local Git toolchain, configured Cursor-style project rules and agent memory, mapped the repo well enough to choose a safe first contribution, and opened a pull request. That PR still has an open scope problem I have not yet resolved. PREIshare remains a real-estate intelligence product; this work does not ship a product feature — it proves I can join the team workflow safely, and that proof is not fully complete yet.

**Definition of done met:**
- [x] Fork created, local clone of my fork, both remotes and toolchain verified (see setup-log.md)
- [x] AI rules / project memory in place and smoke-tested
- [x] First contribution implemented and committed on a feature branch
- [ ] PR opened and review feedback addressed — PR #11 is open, but Files changed still shows 7 files across 21 commits, not the isolated CONTRIBUTORS.md change the plan scoped; this is NOT resolved yet

## 2. Deliverables index (what exists and where)

| Artifact | Path | Why it matters |
| --- | --- | --- |
| Team orientation notes | docs/onboarding/team-orientation-notes.md | Mission, workflow, first-PR definition of done |
| Setup log | docs/onboarding/setup-log.md | Auditable proof of accounts, fork, Git identity, clone, remotes |
| Repo map | docs/onboarding/repo-map.md | Safe contribution surfaces (apps, packages, config) |
| AI tooling verification | docs/onboarding/ai-tooling-verification.md | Evidence agents respect PREIshare stack/conventions |
| Project rules | .cursor/rules/preishare.mdc | Persistent IDE-agent constraints |
| Agent memory entrypoint | AGENTS.md | Cross-tool project context for coding-agents |
| First contribution plan | docs/onboarding/first-contribution-plan.md | Scoped plan before code |
| Contribution notes | docs/onboarding/first-contribution-notes.md | What changed and why |
| Contributors credit | CONTRIBUTORS.md | Visible first contribution surface |
| PR description | docs/onboarding/pr-description.md | Reviewer-facing summary |
| Review response notes | docs/onboarding/review-response-notes.md | How feedback was handled |
| This handoff | docs/onboarding/onboarding-handoff.md | Single entry point for mentors |

## 3. Environment and toolchain snapshot

- OS: macOS
- Git user.name / user.email configured: yes — user.name: ashphill, user.email: asp9soccer@gmail.com
- Git version: 2.50.1 (Apple Git-155)
- Node / package manager versions: TODO — not verified in setup-log.md
- origin (my fork) URL: https://github.com/ashphill/PREIShare-org-repo.git
- upstream (team repo) URL: https://github.com/EdTechForLearning/PREIShare-org-repo.git
- Install/build/test commands run and result: TODO — npm scripts (dev, generate-routes, build, preview) are documented in AGENTS.md but I have not confirmed running them myself
- Blockers hit and how resolved:
  - GitHub push failed with 403 due to password auth; resolved by switching to a Personal Access Token
  - New branches were basing off the team repo's main instead of my fork's main; resolved by changing GitHub Desktop's "Fork Behavior" setting to "For my own purposes"
  - PR #11 still mixes CONTRIBUTORS.md with unrelated onboarding files (7 files, 21 commits) — NOT yet resolved

## 4. AI tooling posture

- Rules file purpose (one sentence): .cursor/rules/preishare.mdc states PREIshare's real stack (TypeScript, React 19, TanStack Start/Router, Tailwind v4, Vite), names safe vs. do-not-edit-yet surfaces per repo-map.md, and sets explicit do-not rules (no secrets, no drive-by refactors, no unverified scripts).
- AGENTS.md purpose (one sentence): serves as the front-door file telling a human or agent what PREIshare is, which real npm scripts exist, and pointing to the rules file and onboarding docs.
- Smoke-test prompt used and whether the agent correctly named stack pieces: four smoke tests (structure, safety, scope, stack) were evaluated against the rules file content; all four ultimately matched repo-map.md's verified facts after one correction — the rules file originally overstated certainty about the data layer ("no database, confirmed") when repo-map.md still listed it as "not found yet," and was corrected to reflect that open question.
- Context gaps found and fixes applied: see docs/onboarding/ai-tooling-verification.md — one fix applied, reworded the data-layer line in preishare.mdc to match repo-map's actual "not found yet" status instead of claiming resolution.

## 5. First contribution and review outcome

- Plan goal (from first-contribution-plan.md): add myself to CONTRIBUTORS.md and make at most one minimal, reviewable docs touch.
- Files touched: CONTRIBUTORS.md, docs/onboarding/first-contribution-notes.md, docs/onboarding/pr-description.md
- PR title and link: "Add CONTRIBUTORS.md entry for Ashton Phillips" — https://github.com/EdTechForLearning/PREIShare-org-repo/pull/11
- Review-style feedback received (summary): simulated mentor review flagged four items — scope (blocking: PR mixes CONTRIBUTORS.md with unrelated onboarding files), commit hygiene (blocking: a vague "update url" commit message), PR clarity (non-blocking: messy title/empty description, now fixed), and verification (non-blocking: checklist items were marked done before actually being checked).
- Changes made in response: fixed the commit message and the PR title/description; the scope issue is NOT fixed — Files changed still shows 7 files across 21 commits as of this writing.
- Merge readiness: blocked — the scope comment is still open. PR #11 needs either a genuinely isolated follow-up (a clean branch containing only CONTRIBUTORS.md) or explicit mentor guidance on how to safely narrow this branch's diff before merge.

## 6. Open risks and environment gaps

1. PR #11's diff is not isolated to the planned CONTRIBUTORS.md change — it still includes 7 files across 21 commits from earlier onboarding steps, which a reviewer would reasonably reject as out of scope.
2. Node/package manager versions and actual `npm run dev` / `build` results were never confirmed and recorded in setup-log.md — TODO before assuming the environment is fully verified.
3. The data layer (Supabase/PostgreSQL/pgvector) remains an open question in repo-map.md — not confirmed present or absent with certainty; rules file has been corrected to reflect this honestly.

## 7. Decisions log (for stakeholders)

| Decision | Choice | Rationale |
| --- | --- | --- |
| First contribution surface | CONTRIBUTORS.md | Low risk, visible, matches onboarding plan |
| Branch naming | docs/first-contribution-ashphill | Matches team Git habit from orientation |
| AI tool category used most | chat-assistant + coding-agent (Cursor) | Chat-assistant for wording/planning docs; coding-agent for reading repo files and drafting rules |
| Fork behavior setting | "For my own purposes" | Needed so new branches base off my fork's main, not the team repo's main |

## 8. Next-sprint preview (what this unlocks)

The next sprint topic can assume:

1. **Trusted local environment** — clone + toolchain documented in setup-log.md; re-run only if OS or versions change. Node/package manager version verification is still outstanding.
2. **AI alignment** — .cursor/rules/preishare.mdc and AGENTS.md exist; extend rules when new packages appear, do not start from zero.
3. **Git habit** — feature branch → small commits → PR → respond to review was practiced once, but the isolation step was not done correctly the first time — next sprint should start each new PR from a freshly updated main, not a long-running branch.
4. **First PR path** — NOT yet merge-ready; do not assume PR #11 is a template for "clean scope" until it is actually fixed.

**Explicitly out of scope until later:** large product features, production deployments, and database migrations I have not been trained on yet.

## 9. Ask for mentor

- Questions still open: should PR #11 be fixed in place (removing unrelated commits) or superseded by a new, clean PR containing only CONTRIBUTORS.md?
- Review of this handoff requested: yes
- Preferred follow-up time or channel: TODO

---

*End of handoff. Keep this file updated if merge status or env gaps change before the next sprint starts.*
EOF