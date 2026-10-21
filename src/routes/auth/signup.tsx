// Sponsor sign-up page at /auth/signup.
// Browser code: uses ONLY the browser Supabase client (public URL + anon key).
// No service-role key or server secrets are referenced here.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { createBrowserSupabaseClient } from '../../lib/supabase.client'
import { setSession } from '../../lib/auth/session'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
})

const MIN_PASSWORD_LENGTH = 6

function SignupPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setPending(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (!data.session) {
        // Email confirmation is turned on in Supabase Auth settings.
        setNotice('Check your email and click the confirmation link, then sign in.')
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
        <h1 className="mb-6 text-3xl font-bold text-[var(--sea-ink)]">Create your account</h1>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label htmlFor="signup-email" className="block text-sm font-semibold">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="signup-password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            />
            <p className="text-xs text-[var(--sea-ink-soft)]">At least {MIN_PASSWORD_LENGTH} characters.</p>
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {notice ? (
            <p role="status" className="rounded-md border border-[var(--line)] bg-[rgba(79,184,178,0.12)] px-3 py-2 text-sm">
              {notice}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !email || !password}
            className="min-h-[44px] w-full rounded-md bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
