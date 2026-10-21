# Environment Variable Checklist — PREIshare Supabase

> Source of truth: `docs/sponsor-auth-requirements.md` (section 7, "Environment & secret hygiene").
> Template: `.env.example` (placeholders only). Setup walkthrough: `docs/setup/supabase-env-checklist.md`.
> This file lists **names and rules only** — never real values.

## Why the prefix matters

This app uses Vite (TanStack Start). Any variable whose name starts with **`VITE_`** is copied
into the **browser bundle**, where anyone can read it. So:

- `VITE_` is allowed **only** for values that are safe to be public.
- Secrets get **no** `VITE_` prefix and are read **only** in server code.

## Variables

| Name | Client-safe or server-only | Used for | Why | Where it is read |
| --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | **Client-safe** | Pointing the browser Supabase client at the project (sign up, sign in, sign out) | A project URL is not a secret; it only says where the API lives. | `src/lib/supabase/client.ts` (`import.meta.env`) |
| `VITE_SUPABASE_ANON_KEY` | **Client-safe** (under RLS) | Auth session: browser sign-in, plus server requests made **as the signed-in sponsor** | It only gets what Row-Level Security allows; with no login it gets nothing from `property_listings`. | `src/lib/supabase/client.ts`; `src/lib/supabase/server.ts` (as the user, with their token) |
| `SUPABASE_URL` | **Server-only name** (value not secret) | Project URL for server code | Same public URL, but server code reads non-`VITE_` names. | `src/lib/supabase/server.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only SECRET** | Admin bypass only (maintenance jobs); **not** used for normal sponsor requests | It **bypasses RLS** and can read or change every sponsor's rows. | `src/lib/supabase/server.ts` → `createServiceRoleSupabaseClient()` only |

## Never do this with `SUPABASE_SERVICE_ROLE_KEY`

- **Never** name it `VITE_SUPABASE_SERVICE_ROLE_KEY` (or give it any public prefix) — Vite would ship it to every browser.
- **Never** read it in browser code: React components, route components, or `src/lib/supabase/client.ts`.
- **Never** import `src/lib/supabase/server.ts` into a shared React component.
- **Never** use it for normal sponsor reads or writes — those use the anon key plus the sponsor's own token so RLS applies.
- **Never** commit it, paste it into chats or prompts, or show it in screenshots.
- **If it leaks:** rotate it in Supabase (Project Settings → API Keys), update `.env.local` and Vercel, then revoke the old key.

## Files: commit or keep local?

| File | Commit? | Contents |
| --- | --- | --- |
| `.env.example` | **Yes** | Variable names + placeholder values only |
| `docs/env-var-checklist.md` | **Yes** | Rules only, no values |
| `.env`, `.env.local`, `.env.*.local`, other `.env.*` | **No, never** | Real values; ignored by `.gitignore` |

`.gitignore` rules that enforce this: `.env`, `.env.local`, `.env.*`, `*.local`, with `!.env.example`
so the template stays tracked.

## Review checklist (before every commit that touches env)

- [ ] `.env.example` contains only placeholders (`your-project-ref`, `your-anon-key-here`,
      `your-service-role-key-here`) — no long JWT-looking or `sb_secret_…` strings.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` has **no** `VITE_` prefix anywhere.
- [ ] `git check-ignore -v .env .env.local` shows both are ignored.
- [ ] `git status` does not list `.env` or `.env.local` as files to commit.
- [ ] No `.ts` / `.tsx` file hard-codes a Supabase URL or key.
- [ ] The same four variables are set in Vercel → Environments (values entered there, never in git).
