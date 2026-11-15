import Link from 'next/link'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { submissions, user } from '@/lib/db/schema'
import { EmptyState, PageHeader, StatCard } from '@/components/ui'
import { SubmissionReviewCard } from '@/components/admin/submission-review-card'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Gradings | Gauss Maths Admin' }

const STATUS_FILTERS = { submitted: 'Waiting for evaluation', graded: 'Graded', all: 'All submissions' } as const
type StatusFilter = keyof typeof STATUS_FILTERS

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status: StatusFilter = params.status && params.status in STATUS_FILTERS ? (params.status as StatusFilter) : 'submitted'
  const conditions = [eq(submissions.kind, 'test')]
  if (status !== 'all') conditions.push(eq(submissions.status, status))

  const [rows, [pendingCount], [gradedCount]] = await Promise.all([
    db
      .select({
        id: submissions.id,
        kind: submissions.kind,
        title: submissions.title,
        chapter: submissions.chapter,
        pathname: submissions.pathname,
        fileName: submissions.fileName,
        score: submissions.score,
        maxMarks: submissions.maxMarks,
        feedback: submissions.feedback,
        status: submissions.status,
        createdAt: submissions.createdAt,
        studentName: user.name,
        studentClass: user.className,
        studentEmail: user.email,
      })
      .from(submissions)
      .innerJoin(user, eq(user.id, submissions.userId))
      .where(and(...conditions))
      .orderBy(desc(submissions.status), desc(submissions.createdAt)),
    db
      .select({ value: count() })
      .from(submissions)
      .where(and(eq(submissions.kind, 'test'), eq(submissions.status, 'submitted'))),
    db
      .select({ value: count() })
      .from(submissions)
      .where(and(eq(submissions.kind, 'test'), eq(submissions.status, 'graded'))),
  ])

  const filterHref = (nextStatus: StatusFilter) => `/admin/submissions?status=${nextStatus}`

  return (
    <>
      <PageHeader
        title="Gradings"
        description="Review test answer sheets and enter marks earned out of the total. Students can see their result in Tests after you save it."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <StatCard label="Waiting for evaluation" value={pendingCount.value} hint="Test submissions not yet graded" />
        <StatCard label="Graded tests" value={gradedCount.value} hint="Results are visible to students" />
      </div>

      <nav aria-label="Filter by grading status" className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(STATUS_FILTERS) as StatusFilter[]).map((key) => (
          <Link
            key={key}
            href={filterHref(key)}
            aria-current={status === key ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
              status === key ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink',
            )}
          >
            {STATUS_FILTERS[key]}
            {key === 'submitted' && pendingCount.value > 0 ? (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{pendingCount.value}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          title={status === 'submitted' ? 'No tests waiting for evaluation' : 'No test submissions yet'}
          description={status === 'submitted' ? 'New student answer sheets will appear here after submission.' : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((submission) => <SubmissionReviewCard key={submission.id} submission={submission} />)}
        </div>
      )}
    </>
  )
}
