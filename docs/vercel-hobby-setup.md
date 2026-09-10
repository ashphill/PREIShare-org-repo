# Vercel Hobby setup — PREIshare investor app

**Date:** 2026-09-09
**Vercel plan:** Hobby (free) — not Pro

## URLs (the same ones you will reuse all semester)

| Item | Value |
| --- | --- |
| GitHub repository (you can push) | `https://github.com/ashphill/PREIShare-org-repo` |
| Instructor collaborator | `thortek` added: TODO — confirm under Settings → Collaborators |
| Vercel Production URL | `https://preishare-org-repo-vercel.vercel.app` |
| Preview URLs | Do **not** submit these to Canvas |

## Hobby constraints I will keep

- One Vercel project for this course
- Production deploys from `main` only
- No cron / Fluid Compute / paid add-ons
- Secrets go in the Vercel dashboard later — never in git

## First production deploy

- Status: Ready (Vercel shows "Ready" in the dashboard, but the Production URL currently returns 404 NOT_FOUND — actively debugging Nitro/build config)
- Incognito check of Production URL: fail — still returns 404 as of this writing
