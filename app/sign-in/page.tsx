import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'
import { getSession } from '@/lib/session'

export const metadata = { title: 'Student sign in | Gauss Maths' }

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect(session.user.role === 'admin' ? '/admin' : '/portal')
  return (
    <AuthCard variant="student" title="Student portal" description="Sign in to view tests, submit homework and track your progress.">
      <AuthForm mode="student-sign-in" />
    </AuthCard>
  )
}
