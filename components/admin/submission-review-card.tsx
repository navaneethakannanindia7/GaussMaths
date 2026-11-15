import { gradeSubmission } from '@/app/actions/admin'
import { ActionForm } from '@/components/action-form'
import { Badge, Card, inputClass } from '@/components/ui'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'

type SubmissionReviewItem = {
  id: number
  kind: string
  title: string
  chapter: string | null
  pathname: string
  fileName: string
  score: number | null
  maxMarks: number | null
  feedback: string | null
  status: string
  createdAt: Date
  studentName: string
  studentClass: string | null
  studentEmail: string
}

export function SubmissionReviewCard({ submission }: { submission: SubmissionReviewItem }) {
  const isHomework = submission.kind === 'homework'
  const percentage =
    submission.score !== null && submission.maxMarks
      ? Math.round((submission.score / submission.maxMarks) * 100)
      : null

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isHomework ? 'neutral' : 'brand'}>{isHomework ? 'Homework' : 'Test'}</Badge>
            <h2 className="font-semibold text-ink">{submission.title}</h2>
            <Badge tone={submission.status === 'graded' ? 'success' : 'warning'}>
              {submission.status === 'graded' ? 'Graded' : 'Waiting for evaluation'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {submission.studentName} · {submission.studentClass ?? 'No class'}
            {submission.chapter ? ` · ${submission.chapter}` : ''} · Submitted {formatDate(submission.createdAt)}
          </p>
          <p className="mt-1 break-all text-sm text-muted">
            <a href={`mailto:${submission.studentEmail}`} className="hover:text-brand hover:underline">
              {submission.studentEmail}
            </a>
          </p>
          {submission.status === 'graded' && submission.score !== null ? (
            <p className="mt-3 text-sm font-semibold text-ink">
              Current result: {submission.score}/{submission.maxMarks ?? 0}
              {percentage !== null ? <span className="ml-2 text-muted">({percentage}%)</span> : null}
            </p>
          ) : null}
        </div>
        <a
          href={fileHref(submission.pathname)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-sm font-semibold text-brand hover:underline"
        >
          Open {submission.fileName}
        </a>
      </div>

      <ActionForm
        action={gradeSubmission}
        submitLabel={submission.status === 'graded' ? 'Update marks' : 'Save marks'}
        pendingLabel="Saving marks…"
        resetOnSuccess={false}
        className="mt-5 border-t border-line pt-5"
      >
        <input type="hidden" name="id" value={submission.id} />
        <div className="grid gap-4 sm:grid-cols-[130px_130px_minmax(0,1fr)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`score-${submission.id}`} className="text-sm font-medium text-ink">Marks earned</label>
            <input
              id={`score-${submission.id}`}
              name="score"
              type="number"
              min={0}
              max={1000}
              step={1}
              required
              defaultValue={submission.score ?? ''}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`total-${submission.id}`} className="text-sm font-medium text-ink">Total marks</label>
            <input
              id={`total-${submission.id}`}
              name="maxMarks"
              type="number"
              min={1}
              max={1000}
              step={1}
              required
              defaultValue={submission.maxMarks ?? 10}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label htmlFor={`feedback-${submission.id}`} className="text-sm font-medium text-ink">Feedback for student</label>
            <textarea
              id={`feedback-${submission.id}`}
              name="feedback"
              rows={2}
              maxLength={2000}
              defaultValue={submission.feedback ?? ''}
              className={inputClass}
              placeholder="Share a helpful note about the student’s work"
            />
          </div>
        </div>
      </ActionForm>
    </Card>
  )
}
