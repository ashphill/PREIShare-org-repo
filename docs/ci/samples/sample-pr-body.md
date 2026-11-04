# Pull request title

Add a teaching sample for a public share preview (do not merge)

# Pull request description

This pull request adds three teaching files under `docs/ci/samples` and nothing else:

- `docs/ci/samples/planted-privacy-snippet.ts`
- `docs/ci/samples/sample-pr-body.md`
- `docs/ci/samples/README.md`

The snippet is a small helper that builds the preview card shown when a sponsor shares a property listing link publicly. It is **not** part of the TanStack app and must not be imported. It doesn't change app routes, Supabase, or `.github/workflows/pr-ci.yml`. The contact values are fake (`example@example.com` and a 555 phone number).

Please review the sample helper the way the runbook in `docs/ci/ai-review-orchestration.md` describes, using `docs/ci/human-judgment-checklist.md` for sign-in, money, privacy and product intent.

Roles in `docs/ci/pr-approval-roles.md` still apply: a human may approve, a human may merge, and an AI assistant may only advise.

This description doesn't approve the change. Don't merge this pull request as part of the exercise.
