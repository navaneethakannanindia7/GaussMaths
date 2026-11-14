import Link from 'next/link'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { submissions, user } from '@/lib/db/schema'
import { Badge, EmptyState, PageHeader, StatCard } from '@/components/ui'
import { SubmissionReviewCard } from '@/components/admin/submission-review-card'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Homework | Gauss Maths Admin' }

const FILTERS = { submitted: 'To review', graded: 'Reviewed', all: 'All homework' } as const
type Filter = keyof typeof FILTERS

export default async function AdminHomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter: Filter = status && status in FILTERS ? (status as Filter) : 'submitted'
  const conditions = [eq(submissions.kind, 'homework')]
  if (filter !== 'all') conditions.push(eq(submissions.status, filter))

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
      })
      .from(submissions)
      .innerJoin(user, eq(user.id, submissions.userId))
      .where(and(...conditions))
      .orderBy(desc(submissions.createdAt)),
    db.select({ value: count() }).from(submissions).where(and(eq(submissions.kind, 'homework'), eq(submissions.status, 'submitted'))),
    db.select({ value: count() }).from(submissions).where(and(eq(submissions.kind, 'homework'), eq(submissions.status, 'graded'))),
  ])

  return (
    <>
      <PageHeader
        title="Homework review"
        description="Private student uploads are listed here for teacher review and grading. Only admins and the submitting student can open each file."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <StatCard label="Waiting for review" value={pendingCount.value} hint="Homework submissions not yet graded" />
        <StatCard label="Reviewed" value={gradedCount.value} hint="Grades and feedback sent to students" />
      </div>

      <nav aria-label="Filter homework" className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(FILTERS) as Filter[]).map((key) => (
          <Link
            key={key}
            href={`/admin/homework?status=${key}`}
            aria-current={filter === key ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
              filter === key ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink',
            )}
          >
            {FILTERS[key]}
            {key === 'submitted' && pendingCount.value > 0 ? (
              <Badge tone={filter === key ? 'neutral' : 'warning'}>{pendingCount.value}</Badge>
            ) : null}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          title={filter === 'submitted' ? 'No homework waiting' : 'No homework submissions yet'}
          description={filter === 'submitted' ? 'New student uploads will appear here as soon as they are submitted.' : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((submission) => <SubmissionReviewCard key={submission.id} submission={submission} />)}
        </div>
      )}
    </>
  )
}
