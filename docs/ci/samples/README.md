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

- Pull request URL: REPLACE_WITH_YOUR_PULL_REQUEST_URL
- Status: open
- Merged: no

## CI record

- Workflow file: `.github/workflows/pr-ci.yml`
- Result: REPLACE_WITH_passed_OR_failed_OR_did_not_start
- Actions run URL: REPLACE_WITH_ACTIONS_RUN_URL_OR_checks_note

## Human learner note — don't paste this section into the AI review

One privacy mistake is planted in the snippet on purpose: the public share preview includes a member email and a member phone.

No sign-in, money or product-intent mistake is planted.

Use this note later to judge whether an AI review found that mistake. Don't treat this note as approval to merge.
