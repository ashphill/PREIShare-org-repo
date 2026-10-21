// Sponsor sign-in page at /auth/login.
// Browser code: uses ONLY the browser Supabase client (public URL + anon key).
// No service-role key or server secrets are referenced here.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { createBrowserSupabaseClient } from '../../lib/supabase.client'
import { setSession } from '../../lib/auth/session'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError || !data.session) {
        setError(signInError?.message ?? 'Sign in failed. Please check your email and password.')
        return
      }

      // Hand the tokens to the server so the /dashboard gate can verify the session.
      await setSession({
        data: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
        },
      })

      await router.invalidate()
      await navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell mx-auto max-w-md rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Sponsors</p>
        <h1 className="mb-6 text-3xl font-bold text-[var(--sea-ink)]">Sign in</h1>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label htmlFor="login-email" className="block text-sm font-semibold">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !email || !password}
            className="min-h-[44px] w-full rounded-md bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">
          New sponsor?{' '}
          <Link to="/auth/signup" className="font-semibold underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}
