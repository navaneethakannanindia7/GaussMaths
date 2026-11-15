import { Badge, Card } from '@/components/ui'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'

type TestSubmissionItem = {
  id: number
  title: string
  chapter: string | null
  pathname: string
  fileName: string
  createdAt: Date
  studentName: string
  studentClass: string | null
  studentEmail: string
}

export function TestSubmissionCard({ submission }: { submission: TestSubmissionItem }) {
  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-ink">{submission.title}</h2>
            <Badge tone="brand">Test</Badge>
          </div>
          {submission.chapter ? <p className="mt-1 text-sm text-muted">{submission.chapter}</p> : null}

          <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-muted">Student</dt>
              <dd className="mt-0.5 font-medium text-ink">{submission.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Class</dt>
              <dd className="mt-0.5 font-medium text-ink">{submission.studentClass ?? 'Not assigned'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted">Email</dt>
              <dd className="mt-0.5 truncate font-medium text-ink">
                <a href={`mailto:${submission.studentEmail}`} className="hover:text-brand hover:underline">
                  {submission.studentEmail}
                </a>
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted">Submitted {formatDate(submission.createdAt)}</p>
        </div>

        <a
          href={fileHref(submission.pathname)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open submitted answer sheet: ${submission.fileName}`}
          className="shrink-0 text-sm font-semibold text-brand hover:underline"
        >
          Open {submission.fileName}
        </a>
      </div>
    </Card>
  )
}
