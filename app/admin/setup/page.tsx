import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'
import { getSession } from '@/lib/session'

export const metadata = { title: 'Admin setup | Gauss Maths' }

export default async function AdminSetupPage() {
  const session = await getSession()
  if (session?.user?.role === 'admin') redirect('/admin')
  return (
    <AuthCard
      variant="admin"
      title="Set up admin account"
      description="Only pre-approved staff emails can create an admin account."
    >
      <AuthForm mode="admin-setup" />
    </AuthCard>
  )
}
