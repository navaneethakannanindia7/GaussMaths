import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) redirect('/admin/login')
  if (session.user.role !== 'admin') redirect('/portal')
  return session.user
}

export async function requireStudent() {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  if (session.user.role === 'admin') redirect('/admin')
  return session.user
}

export async function requireApprovedStudent() {
  const user = await requireStudent()
  if (user.status !== 'approved') {
    throw new Error('Your account is waiting for admin approval.')
  }
  return user
}
