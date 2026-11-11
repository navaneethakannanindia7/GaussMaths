'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; icon: LucideIcon }

const NAV: Record<'admin' | 'student', NavItem[]> = {
  admin: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/tests', label: 'Tests', icon: FileText },
    { href: '/admin/resources', label: 'Resources', icon: BookOpen },
    { href: '/admin/submissions', label: 'Grading', icon: ClipboardCheck },
  ],
  student: [
    { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/tests', label: 'Tests', icon: FileText },
    { href: '/portal/homework', label: 'Homework', icon: NotebookPen },
    { href: '/portal/resources', label: 'Resources', icon: BookOpen },
  ],
}

type Props = {
  variant: 'admin' | 'student'
  userName: string
  userMeta?: string
  showNav?: boolean
  children: React.ReactNode
}

export function DashboardShell({ variant, userName, userMeta, showNav = true, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, startTransition] = useTransition()
  const items = NAV[variant]
  const home = variant === 'admin' ? '/admin' : '/portal'

  function signOut() {
    startTransition(async () => {
      await authClient.signOut()
      router.push(variant === 'admin' ? '/admin/login' : '/sign-in')
      router.refresh()
    })
  }

  const isActive = (href: string) => (href === home ? pathname === href : pathname.startsWith(href))

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex flex-col bg-brand text-white lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Logo href={home} light tag={variant === 'admin' ? 'Admin' : 'Student'} />
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>

        {showNav ? (
          <nav aria-label={variant === 'admin' ? 'Admin navigation' : 'Student navigation'} className="px-3 pb-3 lg:flex-1">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                        active ? 'bg-lime text-brand' : 'text-white/80 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : (
          <div className="lg:flex-1" />
        )}

        <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
          <p className="truncate text-sm font-semibold">{userName}</p>
          {userMeta ? <p className="truncate text-xs text-white/60">{userMeta}</p> : null}
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
