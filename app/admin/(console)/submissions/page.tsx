import Link from 'next/link'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { submissions, user } from '@/lib/db/schema'
import { EmptyState, PageHeader, StatCard } from '@/components/ui'
import { SubmissionReviewCard } from '@/components/admin/submission-review-card'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Grading | Gauss Maths Admin' }

const STATUS_FILTERS = { submitted: 'To grade', graded: 'Graded', all: 'All statuses' } as const
const KIND_FILTERS = { all: 'All work', test: 'Tests', homework: 'Homework' } as const
type StatusFilter = keyof typeof STATUS_FILTERS
type KindFilter = keyof typeof KIND_FILTERS

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string }>
}) {
  const params = await searchParams
  const status: StatusFilter = params.status && params.status in STATUS_FILTERS ? (params.status as StatusFilter) : 'submitted'
  const kind: KindFilter = params.kind && params.kind in KIND_FILTERS ? (params.kind as KindFilter) : 'all'
  const conditions = []
  if (status !== 'all') conditions.push(eq(submissions.status, status))
  if (kind !== 'all') conditions.push(eq(submissions.kind, kind))

  const [rows, [pendingCount], [gradedCount], [homeworkCount]] = await Promise.all([
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
      })
      .from(submissions)
      .innerJoin(user, eq(user.id, submissions.userId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(submissions.createdAt)),
    db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'submitted')),
    db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'graded')),
    db.select({ value: count() }).from(submissions).where(eq(submissions.kind, 'homework')),
  ])

  const filterHref = (nextStatus: StatusFilter, nextKind: KindFilter) =>
    `/admin/submissions?status=${nextStatus}&kind=${nextKind}`

  return (
    <>
      <PageHeader
        title="Grading"
        description="Review student answer sheets, track pending work, and send marks with useful feedback. Homework also has its own dedicated queue."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Waiting to grade" value={pendingCount.value} hint="Tests and homework" />
        <StatCard label="Graded submissions" value={gradedCount.value} hint="Results already shared" />
        <StatCard label="Homework submissions" value={homeworkCount.value} hint="Open the dedicated homework queue" />
      </div>

      <div className="mb-5 flex flex-col gap-3">
        <nav aria-label="Filter by work type" className="flex flex-wrap gap-2">
          {(Object.keys(KIND_FILTERS) as KindFilter[]).map((key) => (
            <Link
              key={key}
              href={filterHref(status, key)}
              aria-current={kind === key ? 'page' : undefined}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                kind === key ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink',
              )}
            >
              {KIND_FILTERS[key]}
            </Link>
          ))}
        </nav>
        <nav aria-label="Filter by grading status" className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_FILTERS) as StatusFilter[]).map((key) => (
            <Link
              key={key}
              href={filterHref(key, kind)}
              aria-current={status === key ? 'page' : undefined}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                status === key ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink',
              )}
            >
              {STATUS_FILTERS[key]}
            </Link>
          ))}
        </nav>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No matching submissions"
          description="Try another work type or grading status, or check the homework queue for student uploads."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((submission) => <SubmissionReviewCard key={submission.id} submission={submission} />)}
        </div>
      )}
    </>
  )
}
