cd ~/projects/PREIShare-org-repo
cat > docs/vercel-hobby-setup.md << 'EOF'
# Vercel Hobby setup — PREIshare investor app

**Date:** 2026-09-09
**Vercel plan:** Hobby (free) — not Pro

## URLs (the same ones you will reuse all semester)

| Item | Value |
| --- | --- |
| GitHub repository (you can push) | `https://github.com/ashphill/PREIShare-org-repo` |
| Instructor collaborator | `thortek` added: TODO — confirm under Settings → Collaborators |
| Vercel Production URL | `https://prei-share-org-repo-one.vercel.app` |
| Preview URLs | Do **not** submit these to Canvas |

## Hobby constraints I will keep

- One Vercel project for this course
- Production deploys from `main` only
- No cron / Fluid Compute / paid add-ons
- Secrets go in the Vercel dashboard later — never in git

## First production deploy

- Status: Ready — deployment source shows commit a8aea8f on main, real TanStack Start app renders correctly
- Incognito check of Production URL: pass — loads the real app, no 404
EOF