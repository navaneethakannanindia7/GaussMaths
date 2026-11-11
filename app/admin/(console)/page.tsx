import Link from 'next/link'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { resources, submissions, tests, user } from '@/lib/db/schema'
import { Badge, Card, EmptyState, PageHeader, StatCard, buttonClass } from '@/components/ui'
import { StudentStatusButtons } from '@/components/admin/student-status-buttons'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Admin overview | Gauss Maths' }

export default async function AdminOverviewPage() {
  const [[approved], [pendingCount], [ungraded], [testCount], [resourceCount], pendingStudents] = await Promise.all([
    db.select({ n: count() }).from(user).where(and(eq(user.role, 'student'), eq(user.status, 'approved'))),
    db.select({ n: count() }).from(user).where(and(eq(user.role, 'student'), eq(user.status, 'pending'))),
    db.select({ n: count() }).from(submissions).where(eq(submissions.status, 'submitted')),
    db.select({ n: count() }).from(tests),
    db.select({ n: count() }).from(resources),
    db
      .select({ id: user.id, name: user.name, email: user.email, className: user.className, status: user.status, createdAt: user.createdAt })
      .from(user)
      .where(and(eq(user.role, 'student'), eq(user.status, 'pending')))
      .orderBy(desc(user.createdAt))
      .limit(5),
  ])

  return (
    <>
      <PageHeader title="Admin overview" description="Manage students, publish tests and grade submissions." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active students" value={approved.n} />
        <StatCard label="Awaiting approval" value={pendingCount.n} />
        <StatCard label="To grade" value={ungraded.n} hint="Tests and homework" />
        <StatCard label="Tests / Resources" value={`${testCount.n} / ${resourceCount.n}`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">Pending registrations</h2>
            <Link href="/admin/students" className="text-sm font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          {pendingStudents.length === 0 ? (
            <EmptyState title="No pending students" description="New registrations will appear here for approval." />
          ) : (
            <ul className="divide-y divide-line">
              {pendingStudents.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{s.name}</p>
                    <p className="truncate text-sm text-muted">
                      {s.email} · {s.className ?? 'No class'} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <StudentStatusButtons id={s.id} status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="font-bold text-ink">Quick actions</h2>
          <Link href="/admin/tests" className={buttonClass.primary}>
            Publish a test
          </Link>
          <Link href="/admin/resources" className={buttonClass.outline}>
            Upload resource
          </Link>
          <Link href="/admin/submissions" className={buttonClass.outline}>
            Grade submissions {ungraded.n > 0 ? <Badge tone="warning">{ungraded.n}</Badge> : null}
          </Link>
        </Card>
      </div>
    </>
  )
}
