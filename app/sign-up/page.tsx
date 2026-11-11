import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'
import { getSession } from '@/lib/session'

export const metadata = { title: 'Student registration | Gauss Maths' }

export default async function SignUpPage() {
  const session = await getSession()
  if (session?.user) redirect(session.user.role === 'admin' ? '/admin' : '/portal')
  return (
    <AuthCard
      variant="student"
      title="Register as a student"
      description="Create your account. Your teacher will approve it before you can access tests and resources."
    >
      <AuthForm mode="student-sign-up" />
    </AuthCard>
  )
}
