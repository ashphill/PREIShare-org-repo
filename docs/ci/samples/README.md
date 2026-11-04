# Privacy-review teaching sample

This folder is a teaching fixture for pull-request review practice.

The file `planted-privacy-snippet.ts` is **not part of the PREIshare TanStack app and must not be imported.** Don't wire it into a route, a page, a server function or Supabase. The contact values in the snippet are fake; they aren't a real member.

## Files this pull request adds

Only these three paths:

- `docs/ci/samples/planted-privacy-snippet.ts`
- `docs/ci/samples/sample-pr-body.md`
- `docs/ci/samples/README.md`

No app routes, no Supabase files, and no change to `.github/workflows/pr-ci.yml`.

## Pull request record

- Pull request URL: https://github.com/ashphill/PREIShare-org-repo/pull/4
- Status: open
- Merged: no

## CI record

- Workflow file: `.github/workflows/pr-ci.yml`
- Result: passed (check "PR CI / Install, lint, typecheck, test, build" ran on this pull request on 2026-11-04 and every step succeeded: install, lint, typecheck, test, build)
- Actions run URL: https://github.com/ashphill/PREIShare-org-repo/actions/runs/41770135837

## Human learner note — don't paste this section into the AI review

One privacy mistake is planted in the snippet on purpose: the public share preview includes a member email and a member phone.

No sign-in, money or product-intent mistake is planted.

Use this note later to judge whether an AI review found that mistake. Don't treat this note as approval to merge.
