import { createFileRoute } from '@tanstack/react-router'
import { ProfileCard } from '../../components/dashboard/ProfileCard'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <section className="dashboard-page" aria-label="Your profile">
      <ProfileCard />
    </section>
  )
}
