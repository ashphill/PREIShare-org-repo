# PREIshare setup log

**Learner:** <Ashton Phillips>
**Date:** <2026-09-09>
**OS:** macOS
**Team repo (upstream):** https://github.com/EdTechForLearning/PREIShare-org-repo
**Orientation notes used:** `docs/onboarding/team-orientation-notes.md`

## 1. Accounts and fork

| Check | Result | Notes |
| --- | --- | --- |
| GitHub sign-in works | PASS / FAIL | Account username: <@handle> |
| Can view team repo https://github.com/EdTechForLearning/PREIShare-org-repo | PASS / FAIL | |
| Fork created in my account | PASS / FAIL | My fork URL: https://github.com/<your-github-username>/PREIShare-org-repo |

## 2. Git install and identity

```text
# paste output of: git --version

# paste output of: git config --global user.name
# paste output of: git config --global user.email
# (email may be partially redacted in shared copies)
```

Identity configured: PASS / FAIL

## 3. Clone (of MY fork)

- Parent directory used: `<path>`
- Clone command used: `git clone https://github.com/<your-github-username>/PREIShare-org-repo.git`
- Cloned my fork (not the team repo): PASS / FAIL
- Clone completed without error: PASS / FAIL
- Local project path: `<path-to-cloned-folder>`

## 4. Remotes (run inside the repo)

- `git remote add upstream https://github.com/EdTechForLearning/PREIShare-org-repo.git` run: PASS / FAIL

### git remote -v

```text
# paste output — expect four lines:
# origin    https://github.com/<your-github-username>/PREIShare-org-repo.git (fetch)
# origin    https://github.com/<your-github-username>/PREIShare-org-repo.git (push)
# upstream  https://github.com/EdTechForLearning/PREIShare-org-repo.git (fetch)
# upstream  https://github.com/EdTechForLearning/PREIShare-org-repo.git (push)
```

origin points at MY fork: PASS / FAIL
upstream points at the team repo: PASS / FAIL

## 5. Post-clone verification

### git status

```text
# paste output — expect clean tree on default branch
```

### Default branch

```text
# paste output of: git branch --show-current
# or: git branch
```

Default branch name: `<main or other>`
Working tree clean after clone: PASS / FAIL

## 6. Auth notes (no secrets)

- Clone method: HTTPS / SSH
- Auth method used (if prompted): browser / credential helper / SSH key / other
- Auth succeeded: PASS / FAIL
- **Do not paste tokens or private keys here**

## 7. Issues and fixes

| Issue | What I tried | Outcome |
| --- | --- | --- |
| <none or describe> | | |

## 8. Ready for next step

I have a fork I own, a local clone of it with origin and upstream set, and a setup log another teammate could audit: YES / NO