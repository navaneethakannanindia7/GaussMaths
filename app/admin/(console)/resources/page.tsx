import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { resources } from '@/lib/db/schema'
import { uploadResource } from '@/app/actions/admin'
import { ActionForm } from '@/components/action-form'
import { ClassSelect } from '@/components/class-select'
import { DeleteButton } from '@/components/admin/delete-button'
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from '@/components/ui'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/categories'

export const metadata = { title: 'Resources | Gauss Maths Admin' }

export default async function AdminResourcesPage() {
  const rows = await db.select().from(resources).orderBy(desc(resources.createdAt))

  return (
    <>
      <PageHeader title="Resources" description="Share notes, important questions and previous year papers with students." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Upload resource</h2>
          <ActionForm action={uploadResource} submitLabel="Upload" pendingLabel="Uploading…">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" required className={inputClass} placeholder="Trigonometry formula sheet" />
            </Field>
            <Field label="Chapter" htmlFor="chapter">
              <input id="chapter" name="chapter" className={inputClass} placeholder="Trigonometry" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="category">
                <select id="category" name="category" defaultValue="notes" className={inputClass}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Class" htmlFor="className">
                <ClassSelect />
              </Field>
            </div>
            <Field label="Resource file (PDF or image, max 4 MB)" htmlFor="file">
              <input
                id="file"
                name="file"
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                required
                className={inputClass}
              />
            </Field>
            <p className="-mt-2 text-sm text-muted">
              Students in the selected class can view this resource as soon as it&apos;s uploaded. Leave Class set to All classes to share it with everyone.
            </p>
          </ActionForm>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-3">
          {rows.length === 0 ? (
            <EmptyState title="No resources yet" description="Uploaded study material will appear here." />
          ) : (
            rows.map((r) => (
              <Card key={r.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{r.title}</h3>
                    <Badge tone="brand">{CATEGORY_LABELS[r.category] ?? r.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {r.chapter ? `${r.chapter} · ` : ''}
                    {r.className ?? 'All classes'} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a href={fileHref(r.pathname)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand hover:underline">
                    View
                  </a>
                  <DeleteButton id={r.id} kind="resource" label={r.title} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
