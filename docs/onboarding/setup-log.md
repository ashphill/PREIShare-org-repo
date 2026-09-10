mkdir -p docs/onboarding
cat > docs/onboarding/setup-log.md << 'EOF'
# PREIshare setup log

**Learner:** Ashton Phillips
**Date:** 2026-09-09
**OS:** macOS
**Team repo (upstream):** https://github.com/EdTechForLearning/PREIShare-org-repo
**Orientation notes used:** `docs/onboarding/team-orientation-notes.md`

## 1. Accounts and fork

| Check | Result | Notes |
| --- | --- | --- |
| GitHub sign-in works | PASS | Account username: @ashphill |
| Can view team repo https://github.com/EdTechForLearning/PREIShare-org-repo | PASS | |
| Fork created in my account | PASS | My fork URL: https://github.com/ashphill/PREIShare-org-repo |

## 2. Git install and identity

```text
<<<<<<< HEAD
$ git --version
git version 2.50.1 (Apple Git-155)

$ git config --global user.name
ashphill

$ git config --global user.email
=======
# paste output of: git --version
git version 2.50.1 (Apple Git-155)

# paste output of: git config --global user.name
ashphill
# paste output of: git config --global user.email
>>>>>>> 3df5c75d3d11bb7fa57882a44f3f3ea386882fd4
asp9soccer@gmail.com
```

Identity configured: PASS

## 3. Clone (of MY fork)

- Parent directory used: `~/projects`
- Clone command used: `git clone https://github.com/ashphill/PREIShare-org-repo.git`
- Cloned my fork (not the team repo): PASS
- Clone completed without error: PASS
- Local project path: `~/projects/PREIShare-org-repo`

## 4. Remotes (run inside the repo)

- `git remote add upstream https://github.com/EdTechForLearning/PREIShare-org-repo.git` run: PASS

### git remote -v

```text
origin    https://github.com/ashphill/PREIShare-org-repo.git (fetch)
origin    https://github.com/ashphill/PREIShare-org-repo.git (push)
upstream  https://github.com/EdTechForLearning/PREIShare-org-repo.git (fetch)
upstream  https://github.com/EdTechForLearning/PREIShare-org-repo.git (push)
```

origin points at MY fork: PASS
upstream points at the team repo: PASS

## 5. Post-clone verification

### git status

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

### Default branch

```text
<<<<<<< HEAD
$ git branch --show-current
=======
# paste output of: git branch --show-current
>>>>>>> 3df5c75d3d11bb7fa57882a44f3f3ea386882fd4
main
```

Default branch name: `main`
Working tree clean after clone: PASS

## 6. Auth notes (no secrets)

- Clone method: HTTPS
- Auth method used (if prompted): browser / credential helper
- Auth succeeded: PASS
- **Do not paste tokens or private keys here**

## 7. Issues and fixes

| Issue | What I tried | Outcome |
| --- | --- | --- |
| None — clone and remote setup completed without errors | | |

## 8. Ready for next step

I have a fork I own, a local clone of it with origin and upstream set, and a setup log another teammate could audit: YES
<<<<<<< HEAD
=======
EOF
>>>>>>> 3df5c75d3d11bb7fa57882a44f3f3ea386882fd4
