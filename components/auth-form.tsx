'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { checkAdminEmail } from '@/app/actions/auth'
import { buttonClass, Field, inputClass } from '@/components/ui'
import { CLASS_OPTIONS } from '@/lib/utils'

type Mode = 'student-sign-in' | 'student-sign-up' | 'admin-sign-in' | 'admin-setup'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'student-sign-up' || mode === 'admin-setup'
  const isAdmin = mode === 'admin-sign-in' || mode === 'admin-setup'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    try {
      if (mode === 'admin-setup') {
        const allowed = await checkAdminEmail(email)
        if (!allowed) {
          setError('This email is not on the admin list. Students should register through the student portal.')
          return
        }
      }

      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          ...(mode === 'student-sign-up'
            ? { className: String(form.get('className') ?? ''), phone: String(form.get('phone') ?? '').trim() }
            : {}),
        })
        if (error) {
          setError(error.message ?? 'Could not create account.')
          return
        }
        router.push(isAdmin ? '/admin' : '/portal')
        router.refresh()
        return
      }

      const { data, error } = await authClient.signIn.email({ email, password })
      if (error) {
        setError(error.message ?? 'Invalid email or password.')
        return
      }
      const role = (data?.user as { role?: string } | undefined)?.role
      if (mode === 'admin-sign-in' && role !== 'admin') {
        await authClient.signOut()
        setError('This account does not have admin access. Please use the student portal.')
        return
      }
      router.push(role === 'admin' ? '/admin' : '/portal')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitLabel = {
    'student-sign-in': 'Sign in to portal',
    'student-sign-up': 'Create student account',
    'admin-sign-in': 'Sign in as admin',
    'admin-setup': 'Create admin account',
  }[mode]

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {isSignUp ? (
        <Field label="Full name" htmlFor="name">
          <input id="name" name="name" required autoComplete="name" className={inputClass} placeholder="Your full name" />
        </Field>
      ) : null}

      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@example.com" />
      </Field>

      {mode === 'student-sign-up' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class" htmlFor="className">
            <select id="className" name="className" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select class
              </option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone (optional)" htmlFor="phone">
            <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="+91 …" />
          </Field>
        </div>
      ) : null}

      <Field label="Password" htmlFor="password" hint={isSignUp ? 'At least 8 characters.' : undefined}>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className={inputClass}
        />
      </Field>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`${buttonClass.primary} w-full`}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? 'Please wait…' : submitLabel}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === 'student-sign-in' ? (
          <>
            {'New student? '}
            <Link href="/sign-up" className="font-semibold text-brand underline-offset-4 hover:underline">
              Register here
            </Link>
          </>
        ) : null}
        {mode === 'student-sign-up' ? (
          <>
            {'Already registered? '}
            <Link href="/sign-in" className="font-semibold text-brand underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        ) : null}
        {mode === 'admin-sign-in' ? (
          <>
            {'First time? '}
            <Link href="/admin/setup" className="font-semibold text-brand underline-offset-4 hover:underline">
              Set up admin account
            </Link>
          </>
        ) : null}
        {mode === 'admin-setup' ? (
          <>
            {'Already set up? '}
            <Link href="/admin/login" className="font-semibold text-brand underline-offset-4 hover:underline">
              Admin sign in
            </Link>
          </>
        ) : null}
      </p>
    </form>
  )
}
