import Link from 'next/link'
import { requireStudent } from '@/lib/session'
import { getSubmissionsForStudent, getTestsForStudent } from '@/lib/student-data'
import { Badge, Card, EmptyState, PageHeader, StatCard, buttonClass } from '@/components/ui'
import { formatDate, percent } from '@/lib/utils'

export const metadata = { title: 'Dashboard | Gauss Maths Student Portal' }

export default async function PortalDashboard() {
  const student = await requireStudent()
  const [allTests, mySubmissions] = await Promise.all([getTestsForStudent(student.className), getSubmissionsForStudent(student.id)])

  const submittedTestIds = new Set(mySubmissions.filter((s) => s.testId != null).map((s) => s.testId))
  const openTests = allTests.filter((t) => !submittedTestIds.has(t.id))
  const graded = mySubmissions.filter((s) => s.status === 'graded' && s.score != null && s.maxMarks)
  const avg = graded.length ? Math.round(graded.reduce((sum, s) => sum + (percent(s.score, s.maxMarks) ?? 0), 0) / graded.length) : null

  return (
    <>
      <PageHeader title={`Welcome, ${student.name.split(' ')[0]}`} description={`${student.className ?? 'Student'} · Your progress at a glance`}>
        <Link href="/portal/homework" className={buttonClass.lime}>
          Submit homework
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Average score" value={avg == null ? '—' : `${avg}%`} hint={`${graded.length} graded`} />
        <StatCard label="Open tests" value={openTests.length} />
        <StatCard label="Submissions" value={mySubmissions.length} />
        <StatCard label="Awaiting grade" value={mySubmissions.filter((s) => s.status === 'submitted').length} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">Open tests</h2>
            <Link href="/portal/tests" className="text-sm font-semibold text-brand hover:underline">
              All tests
            </Link>
          </div>
          {openTests.length === 0 ? (
            <EmptyState title="No open tests" description="New tests from your teacher will appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {openTests.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{t.title}</p>
                    <p className="text-sm text-muted">
                      {t.maxMarks} marks · Due {formatDate(t.dueAt)}
                    </p>
                  </div>
                  <Link href="/portal/tests" className={`${buttonClass.outline} shrink-0 px-3 py-1.5`}>
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-ink">Report card</h2>
          {graded.length === 0 ? (
            <EmptyState title="No grades yet" description="Your marks and feedback will show up here." />
          ) : (
            <ul className="flex flex-col gap-4">
              {graded.slice(0, 8).map((s) => {
                const pct = percent(s.score, s.maxMarks) ?? 0
                return (
                  <li key={s.id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <Badge tone={s.kind === 'test' ? 'brand' : 'neutral'}>{s.kind === 'test' ? 'Test' : 'HW'}</Badge>
                        <span className="truncate font-medium text-ink">{s.title}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-ink">
                        {s.score}/{s.maxMarks}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.title} score`}>
                      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                    {s.feedback ? <p className="mt-1.5 text-xs text-muted">{s.feedback}</p> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
