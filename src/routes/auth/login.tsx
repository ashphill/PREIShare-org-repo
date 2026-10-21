// Old address kept for bookmarks: /auth/login now redirects to the real sign-in page at /login.
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
})
