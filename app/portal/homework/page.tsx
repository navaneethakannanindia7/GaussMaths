import { submitHomework } from '@/app/actions/student'
import { ActionForm } from '@/components/action-form'
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from '@/components/ui'
import { requireStudent } from '@/lib/session'
import { getSubmissionsForStudent } from '@/lib/student-data'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Homework | Gauss Maths Student Portal' }

export default async function HomeworkPage() {
  const student = await requireStudent()
  const items = await getSubmissionsForStudent(student.id, 'homework')

  return (
    <>
      <PageHeader title="Homework" description="Upload your completed homework as a PDF or photo. Your teacher will review and grade it." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">New submission</h2>
          <ActionForm action={submitHomework} submitLabel="Submit homework" pendingLabel="Uploading…">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" required maxLength={200} className={inputClass} placeholder="Exercise 4.2 — Q1 to Q10" />
            </Field>
            <Field label="Chapter" htmlFor="chapter">
              <input id="chapter" name="chapter" className={inputClass} placeholder="Quadratic Equations" />
            </Field>
            <Field label="File (PDF or image, max 4 MB)" htmlFor="file">
              <input id="file" name="file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" required className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-3">
          {items.length === 0 ? (
            <EmptyState title="No homework submitted yet" />
          ) : (
            items.map((h) => (
              <Card key={h.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{h.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {h.chapter ? `${h.chapter} · ` : ''}
                      {formatDate(h.createdAt)}
                      {' · '}
                      <a href={fileHref(h.pathname)} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
                        View file
                      </a>
                    </p>
                  </div>
                  {h.status === 'graded' ? (
                    <Badge tone="success">
                      {h.score}/{h.maxMarks}
                    </Badge>
                  ) : (
                    <Badge tone="warning">Under review</Badge>
                  )}
                </div>
                {h.feedback ? (
                  <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-ink">
                    <span className="font-semibold">Feedback: </span>
                    {h.feedback}
                  </p>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
