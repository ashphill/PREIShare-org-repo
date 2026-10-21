// src/lib/auth/session.ts
// Server-side session helpers for sponsor auth.
//
// Every export is a TanStack Start server function (createServerFn): the handler
// code runs ONLY on the server, even when a route's beforeLoad or a button calls it
// from the browser. Session decisions that protect /dashboard live here so the
// browser cannot spoof them by editing client code.
//
// - Uses ONLY the server Supabase client from src/lib/supabase/server.ts
//   (anon key + the sponsor's own token, so RLS still applies).
// - Never uses the service-role key.
// - The sponsor's Supabase tokens live in httpOnly cookies that browser
//   JavaScript cannot read.

import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { createServerSupabaseClient } from '../supabase/server'

const ACCESS_TOKEN_COOKIE = 'preishare-access-token'
const REFRESH_TOKEN_COOKIE = 'preishare-refresh-token'

/** Refresh tokens are kept for 30 days; access tokens expire sooner (Supabase default 1 hour). */
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60

const cookieOptions = {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax',
  path: '/',
} as const

/** The only user details the app needs. Tokens are never sent back to the browser. */
export type SessionUser = {
  id: string
  email: string | null
}

export type SponsorSession = {
  user: SessionUser
}

type TokenPair = {
  accessToken: string
  refreshToken: string
  expiresIn?: number
}

function writeSessionCookies({ accessToken, refreshToken, expiresIn }: TokenPair): void {
  setCookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: expiresIn ?? DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
  })
  setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  })
}

function clearSessionCookies(): void {
  deleteCookie(ACCESS_TOKEN_COOKIE, { path: '/' })
  deleteCookie(REFRESH_TOKEN_COOKIE, { path: '/' })
}

function toSessionUser(user: { id: string; email?: string | undefined }): SessionUser {
  return { id: user.id, email: user.email ?? null }
}

/**
 * Read the sponsor session from cookies and verify it with Supabase Auth.
 * If the access token expired, try the refresh token once and rotate the cookies.
 * Returns null (and clears cookies) when there is no valid session.
 */
async function readVerifiedSession(): Promise<SponsorSession | null> {
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE)
  const refreshToken = getCookie(REFRESH_TOKEN_COOKIE)

  if (!accessToken && !refreshToken) return null

  const supabase = createServerSupabaseClient()

  if (accessToken) {
    // getUser(token) asks Supabase Auth to validate the token; it does not just decode it.
    const { data, error } = await supabase.auth.getUser(accessToken)
    if (!error && data.user) return { user: toSessionUser(data.user) }
  }

  if (refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (!error && data.session && data.user) {
      writeSessionCookies({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      })
      return { user: toSessionUser(data.user) }
    }
  }

  clearSessionCookies()
  return null
}

/** Current sponsor session (user only), or null when signed out. */
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  return readVerifiedSession()
})

/** Current signed-in sponsor, or null. Used by the /dashboard beforeLoad gate. */
export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await readVerifiedSession()
  return session?.user ?? null
})

/**
 * Called by the login/signup pages right after Supabase Auth succeeds in the browser.
 * Verifies the access token with Supabase on the server, then stores the tokens
 * in httpOnly cookies so server loaders and beforeLoad can see the session.
 */
export const setSession = createServerFn({ method: 'POST' })
  .validator((input: unknown): TokenPair => {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Invalid session payload.')
    }
    const { accessToken, refreshToken, expiresIn } = input as Record<string, unknown>
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Missing access token.')
    }
    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      throw new Error('Missing refresh token.')
    }
    return typeof expiresIn === 'number'
      ? { accessToken, refreshToken, expiresIn }
      : { accessToken, refreshToken }
  })
  .handler(async ({ data }) => {
    const supabase = createServerSupabaseClient()
    const { data: userData, error } = await supabase.auth.getUser(data.accessToken)
    if (error || !userData.user) {
      clearSessionCookies()
      // Log the real reason on the server (Terminal) and include it in the message for debugging.
      console.error('[auth] setSession could not verify token:', error?.message ?? 'no user returned', error)
      throw new Error(
        `Could not verify your session (${error?.message ?? 'no user returned'}). Please sign in again.`,
      )
    }
    writeSessionCookies(data)
    return { user: toSessionUser(userData.user) }
  })

/** Clear the server session cookies. The browser also calls supabase.auth.signOut(). */
export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  clearSessionCookies()
  return { ok: true }
})
