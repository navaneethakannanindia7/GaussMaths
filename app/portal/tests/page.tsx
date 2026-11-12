import { submitTestAnswer } from '@/app/actions/student'
import { ActionForm } from '@/components/action-form'
import { Badge, Card, EmptyState, PageHeader, inputClass } from '@/components/ui'
import { requireStudent } from '@/lib/session'
import { getSubmissionsForStudent, getTestsForStudent } from '@/lib/student-data'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Tests | Gauss Maths Student Portal' }

export default async function StudentTestsPage() {
  const student = await requireStudent()
  const [allTests, mine] = await Promise.all([getTestsForStudent(student.className), getSubmissionsForStudent(student.id, 'test')])
  const byTest = new Map(mine.map((s) => [s.testId, s]))

  return (
    <>
      <PageHeader title="Tests" description="Download the question paper, solve it, then upload a PDF or photo of your answer sheet (max 4 MB)." />

      {allTests.length === 0 ? (
        <EmptyState title="No tests assigned yet" description="Your teacher hasn't published any tests for your class." />
      ) : (
        <div className="flex flex-col gap-4">
          {allTests.map((t) => {
            const sub = byTest.get(t.id)
            const overdue = !sub && t.dueAt && new Date(t.dueAt) < new Date()
            return (
              <Card key={t.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink">{t.title}</h2>
                      {sub?.status === 'graded' ? (
                        <Badge tone="success">
                          {sub.score}/{sub.maxMarks}
                        </Badge>
                      ) : sub ? (
                        <Badge tone="warning">Submitted</Badge>
                      ) : overdue ? (
                        <Badge tone="danger">Overdue</Badge>
                      ) : (
                        <Badge tone="brand">Open</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {t.chapter ? `${t.chapter} · ` : ''}
                      {t.maxMarks} marks · Due {formatDate(t.dueAt)}
                    </p>
                  </div>
                  <a href={fileHref(t.pathname)} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-semibold text-brand hover:underline">
                    Download question paper
                  </a>
                </div>

                {sub ? (
                  <div className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-sm">
                    <p className="text-muted">
                      {'Submitted '}
                      {formatDate(sub.createdAt)}
                      {' · Your answer sheet is private and visible only in admin grading.'}
                    </p>
                    {sub.feedback ? (
                      <p className="text-ink">
                        <span className="font-semibold">Feedback: </span>
                        {sub.feedback}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <ActionForm action={submitTestAnswer} submitLabel="Submit answer sheet" pendingLabel="Uploading…" className="mt-4 border-t border-line pt-4">
                    <input type="hidden" name="testId" value={t.id} />
                    <label htmlFor={`file-${t.id}`} className="sr-only">
                      Answer sheet for {t.title}
                    </label>
                    <input id={`file-${t.id}`} name="file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" required className={inputClass} />
                  </ActionForm>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
