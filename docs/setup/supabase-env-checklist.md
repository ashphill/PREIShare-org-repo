# Supabase environment setup checklist (PREIshare Sprint 4)

## Purpose
Configure the Supabase URL and keys for the TanStack Start dashboard so sponsors
can sign in and listings can load from Postgres, without shipping the
service-role secret to the browser.

## Source requirements
See `docs/requirements/sponsor-auth-and-listings-brief.md`, especially the
Goals, Success criteria, and **Server-only boundary** sections. The variable
names below are the ones later steps (Supabase clients, loaders, server
functions) will read.

## Variables at a glance

| Variable | Public or server-only | Where it is used |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | PUBLIC (browser-safe) | Browser Supabase client |
| `VITE_SUPABASE_ANON_KEY` | PUBLIC (browser-safe, limited by RLS) | Browser Supabase client |
| `SUPABASE_URL` | Server-only name (value is not secret) | Server functions / loaders |
| `SUPABASE_SERVICE_ROLE_KEY` | **SERVER-ONLY SECRET** | Server functions / loaders only |

Why the prefix matters: this project uses Vite's default public prefix `VITE_`.
Vite copies every `VITE_` variable into the browser bundle, so the service-role
key must **never** start with `VITE_`.

## 1. Supabase project (in the browser)
- [ ] Go to https://supabase.com/dashboard and sign in.
- [ ] Click **New project**, name it (for example `preishare`), choose a region,
      and set a strong **database password**.
- [ ] Save the database password in a password manager (not in the repo, not in chat).
      It is not the same as the API keys.
- [ ] Wait until the project shows as ready (this can take a minute or two).

## 2. Copy the keys (into a private note, not a tracked file)
- [ ] Open **Project Settings → API** (newer dashboards may show **API Keys**).
- [ ] Copy the **Project URL** → goes in `VITE_SUPABASE_URL` and `SUPABASE_URL`.
- [ ] Copy the **anon** / **publishable** key → goes in `VITE_SUPABASE_ANON_KEY`.
- [ ] Copy the **service_role** / **secret** key → goes in `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Treat the service_role key like a password: never paste it into chat,
      screenshots, commits, or client-side code.

If labels differ, match by purpose: one key is safe for the browser with RLS;
the other bypasses RLS and is server-only.

## 3. Repo files
- [ ] `.env.example` is committed with placeholder values only.
- [ ] Create your local file: `cp .env.example .env.local` (in the repo root).
- [ ] Paste the real values into `.env.local` yourself (not with an AI agent).
- [ ] `.gitignore` covers `.env`, `.env.local`, and other `.env.*` files
      (only `.env.example` is allowed in Git).
- [ ] `git status` does **not** list `.env.local` or `.env`.
- [ ] `git check-ignore -v .env .env.local` shows both are ignored.

| File | Commit it? |
| --- | --- |
| `.env.example` | Yes (placeholders only) |
| `docs/setup/supabase-env-checklist.md` | Yes |
| `.env.local` / `.env` | **No, never** (real keys, local only) |

## 4. Public vs server-only rules
- [ ] Browser-safe variables use the `VITE_` prefix (`VITE_SUPABASE_URL`,
      `VITE_SUPABASE_ANON_KEY`).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` has **no** `VITE_` prefix.
- [ ] No file under `src/` that runs in the browser reads `SUPABASE_SERVICE_ROLE_KEY`
      (it is read only inside server functions or route loaders).
- [ ] The service-role key must never ship in the client bundle.
- [ ] This checklist and `.env.example` contain zero real key material.

## 5. Smoke checks before feature work
- [ ] Restart the dev server (`npm run dev`) after creating or editing `.env.local`.
- [ ] The app still starts and `/dashboard` still loads.
- [ ] Search tracked files for your real service_role key string
      (for example `git grep "<first 10 characters of the key>"`): zero matches.
- [ ] After a build (`npm run build`), the service_role key does not appear
      in the `.output` client files.

## Handoff notes
- Vercel needs the same split: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  for the client build, and `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` as
  server/runtime environment variables only.
- Not in this step: no login UI, no tables, no Supabase client code yet.
- Next steps later in this sprint: data model, migrations and RLS, then Supabase
  clients that read these exact variable names.
