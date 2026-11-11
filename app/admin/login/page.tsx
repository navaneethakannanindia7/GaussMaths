import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'
import { getSession } from '@/lib/session'

export const metadata = { title: 'Admin sign in | Gauss Maths' }

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session?.user?.role === 'admin') redirect('/admin')
  return (
    <AuthCard variant="admin" title="Admin access" description="Restricted to Gauss Maths staff. Student accounts cannot sign in here.">
      <AuthForm mode="admin-sign-in" />
    </AuthCard>
  )
}
