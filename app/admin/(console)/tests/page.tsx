import { count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { submissions, tests } from '@/lib/db/schema'
import { createTest } from '@/app/actions/admin'
import { ActionForm } from '@/components/action-form'
import { ClassSelect } from '@/components/class-select'
import { DeleteButton } from '@/components/admin/delete-button'
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from '@/components/ui'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Tests | Gauss Maths Admin' }

export default async function AdminTestsPage() {
  const rows = await db
    .select({
      id: tests.id,
      title: tests.title,
      chapter: tests.chapter,
      className: tests.className,
      maxMarks: tests.maxMarks,
      dueAt: tests.dueAt,
      pathname: tests.pathname,
      createdAt: tests.createdAt,
      submissionCount: count(submissions.id),
    })
    .from(tests)
    .leftJoin(submissions, eq(submissions.testId, tests.id))
    .groupBy(tests.id)
    .orderBy(desc(tests.createdAt))

  return (
    <>
      <PageHeader title="Tests" description="Upload a question paper PDF. Students download it and submit their answer sheet." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Publish new test</h2>
          <ActionForm action={createTest} submitLabel="Publish test" pendingLabel="Uploading…">
            <Field label="Test title" htmlFor="title">
              <input id="title" name="title" required className={inputClass} placeholder="Unit Test 1 — Algebra" />
            </Field>
            <Field label="Chapter" htmlFor="chapter">
              <input id="chapter" name="chapter" className={inputClass} placeholder="Polynomials" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class" htmlFor="className">
                <ClassSelect />
              </Field>
              <Field label="Max marks" htmlFor="maxMarks">
                <input id="maxMarks" name="maxMarks" type="number" min={1} max={1000} defaultValue={50} required className={inputClass} />
              </Field>
            </div>
            <Field label="Due date (optional)" htmlFor="dueDate">
              <input id="dueDate" name="dueDate" type="date" className={inputClass} />
            </Field>
            <Field label="Question paper (PDF, max 4 MB)" htmlFor="file">
              <input id="file" name="file" type="file" accept="application/pdf" required className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-3">
          {rows.length === 0 ? (
            <EmptyState title="No tests yet" description="Published tests will be listed here." />
          ) : (
            rows.map((t) => (
              <Card key={t.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{t.title}</h3>
                    <Badge tone="brand">{t.className ?? 'All classes'}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {t.chapter ? `${t.chapter} · ` : ''}
                    {t.maxMarks} marks · Due {formatDate(t.dueAt)} · {t.submissionCount} submitted
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a href={fileHref(t.pathname)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand hover:underline">
                    View PDF
                  </a>
                  <DeleteButton id={t.id} kind="test" label={t.title} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
