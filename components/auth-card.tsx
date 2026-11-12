import Link from 'next/link'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

type Props = {
  variant: 'student' | 'admin'
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ variant, title, description, children }: Props) {
  const admin = variant === 'admin'
  return (
    <div className={cn('flex min-h-dvh flex-col', admin ? 'bg-brand' : 'bg-surface')}>
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo light={admin} tag={admin ? 'Admin' : 'Student'} />
        {admin ? (
          <Link href="/sign-in" className="text-sm font-medium text-white/80 underline-offset-4 hover:underline">
            Student portal
          </Link>
        ) : null}
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-xl sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-muted text-pretty">{description}</p>
          {children}
        </div>
      </main>
    </div>
  )
}
