import Link from 'next/link'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui'
import { StudentStatusButtons } from '@/components/admin/student-status-buttons'
import { cn, formatDate } from '@/lib/utils'

export const metadata = { title: 'Students | Gauss Maths Admin' }

const FILTERS = ['pending', 'approved', 'rejected', 'all'] as const
type Filter = (typeof FILTERS)[number]

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const filter: Filter = FILTERS.includes(status as Filter) ? (status as Filter) : 'pending'

  const students = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      className: user.className,
      status: user.status,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(filter === 'all' ? eq(user.role, 'student') : and(eq(user.role, 'student'), eq(user.status, filter)))
    .orderBy(desc(user.createdAt))

  return (
    <>
      <PageHeader title="Students" description="Approve new registrations and manage student access." />

      <nav aria-label="Filter students" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/students?status=${f}`}
            aria-current={filter === f ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition',
              filter === f ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink',
            )}
          >
            {f}
          </Link>
        ))}
      </nav>

      {students.length === 0 ? (
        <EmptyState title={`No ${filter === 'all' ? '' : filter} students`} />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Student</th>
                <th scope="col" className="px-5 py-3 font-semibold">Class</th>
                <th scope="col" className="px-5 py-3 font-semibold">Registered</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">{s.name}</p>
                    <p className="text-muted">{s.email}{s.phone ? ` · ${s.phone}` : ''}</p>
                  </td>
                  <td className="px-5 py-3 text-ink">{s.className ?? '—'}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(s.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={s.status === 'approved' ? 'success' : s.status === 'pending' ? 'warning' : 'danger'}>{s.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <StudentStatusButtons id={s.id} status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  )
}
