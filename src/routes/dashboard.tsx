// src/routes/dashboard.tsx — layout + auth guard for everything under /dashboard.
// (Flat-file layout: child pages live in src/routes/dashboard/ and render in <Outlet />.)
// Child pages like dashboard/index.tsx render inside the <Outlet /> below.
// AppShell (header, sidebar, mobile nav) lives only here, never in child pages,
// so the dashboard home never shows doubled chrome.
//
// AUTH GATE: beforeLoad calls the getUser server function (src/lib/auth/session.ts).
// Its handler runs on the server, reads the httpOnly session cookie, and verifies
// it with the server client from src/lib/supabase.server.ts. No signed-in sponsor
// -> redirect to /login. It only redirects when the session is missing, so a
// signed-in sponsor never bounces. Because this is the layout route, every /dashboard/* child page
// inherits the gate.
import { useState } from 'react'
import { Outlet, createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { AppShell } from '../components/dashboard/AppShell'
import { getUser, signOut } from '../lib/auth/session'
import { createBrowserSupabaseClient } from '../lib/supabase.client'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()

  return (
    <AppShell>
      <SignedInBar email={user.email} />
      {/* Child routes render here, inside the AppShell main region */}
      <Outlet />
    </AppShell>
  )
}

function SignedInBar({ email }: { email: string | null }) {
  const navigate = useNavigate()
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleSignOut() {
    setPending(true)
    try {
      // End the browser's Supabase session, then clear the server session cookies.
      await createBrowserSupabaseClient().auth.signOut()
    } catch {
      // Still clear the server cookies below even if the browser call fails.
    }
    try {
      await signOut()
      await router.invalidate()
      await navigate({ to: '/login' })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-3 text-sm">
      <span className="text-[var(--sea-ink-soft)]">
        Signed in as <strong>{email ?? 'sponsor'}</strong>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="min-h-[44px] rounded-md border border-[var(--line)] px-4 py-2 font-semibold disabled:opacity-60"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
