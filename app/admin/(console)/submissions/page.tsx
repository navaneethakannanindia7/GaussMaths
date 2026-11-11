import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { submissions, user } from '@/lib/db/schema'
import { gradeSubmission } from '@/app/actions/admin'
import { ActionForm } from '@/components/action-form'
import { Badge, Card, EmptyState, PageHeader, inputClass } from '@/components/ui'
import { fileHref } from '@/lib/blob'
import { cn, formatDate } from '@/lib/utils'

export const metadata = { title: 'Grading | Gauss Maths Admin' }

const FILTERS = { submitted: 'To grade', graded: 'Graded', all: 'All' } as const
type Filter = keyof typeof FILTERS

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const filter: Filter = status && status in FILTERS ? (status as Filter) : 'submitted'

  const base = db
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
  const rows = await (filter === 'all' ? base : base.where(eq(submissions.status, filter))).orderBy(desc(submissions.createdAt))

  return (
    <>
      <PageHeader title="Grading" description="Review answer sheets and homework, then record marks and feedback." />

      <nav aria-label="Filter submissions" className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(FILTERS) as Filter[]).map((f) => (
          <Link
            key={f}
            href={`/admin/submissions?status=${f}`}
            aria-current={filter === f ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
              filter === f ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink',
            )}
          >
            {FILTERS[f]}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="Nothing here" description={filter === 'submitted' ? 'All caught up — no submissions to grade.' : undefined} />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((s) => (
            <Card key={s.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={s.kind === 'test' ? 'brand' : 'neutral'}>{s.kind === 'test' ? 'Test' : 'Homework'}</Badge>
                    <h3 className="font-semibold text-ink">{s.title}</h3>
                    {s.status === 'graded' ? <Badge tone="success">Graded</Badge> : <Badge tone="warning">Pending</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {s.studentName} · {s.studentClass ?? 'No class'}
                    {s.chapter ? ` · ${s.chapter}` : ''} · {formatDate(s.createdAt)}
                  </p>
                </div>
                <a
                  href={fileHref(s.pathname)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-sm font-semibold text-brand hover:underline"
                >
                  Open submission
                </a>
              </div>

              <ActionForm action={gradeSubmission} submitLabel={s.status === 'graded' ? 'Update grade' : 'Save grade'} resetOnSuccess={false} className="mt-4 border-t border-line pt-4">
                <input type="hidden" name="id" value={s.id} />
                <div className="grid gap-3 sm:grid-cols-[110px_110px_1fr]">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`score-${s.id}`} className="text-xs font-medium text-muted">Score</label>
                    <input id={`score-${s.id}`} name="score" type="number" min={0} required defaultValue={s.score ?? ''} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`max-${s.id}`} className="text-xs font-medium text-muted">Out of</label>
                    <input id={`max-${s.id}`} name="maxMarks" type="number" min={1} max={1000} required defaultValue={s.maxMarks ?? 10} className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`fb-${s.id}`} className="text-xs font-medium text-muted">Feedback</label>
                    <input id={`fb-${s.id}`} name="feedback" defaultValue={s.feedback ?? ''} className={inputClass} placeholder="Good work. Revise step 3." />
                  </div>
                </div>
              </ActionForm>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
