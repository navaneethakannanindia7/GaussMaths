import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { resources, usefulLinks } from '@/lib/db/schema'
import { createUsefulLink, uploadResource } from '@/app/actions/admin'
import { ActionForm } from '@/components/action-form'
import { ClassSelect } from '@/components/class-select'
import { DeleteButton } from '@/components/admin/delete-button'
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from '@/components/ui'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/categories'

export const metadata = { title: 'Resource center | Gauss Maths Admin' }

export default async function AdminResourcesPage() {
  const [resourcesResult, linksResult] = await Promise.allSettled([
    db.select().from(resources).orderBy(desc(resources.createdAt)),
    db.select().from(usefulLinks).orderBy(desc(usefulLinks.createdAt)),
  ])
  const resourcesUnavailable = resourcesResult.status === 'rejected'
  const linksUnavailable = linksResult.status === 'rejected'
  const rows = resourcesUnavailable ? [] : resourcesResult.value
  const links = linksUnavailable ? [] : linksResult.value

  return (
    <>
      <PageHeader title="Resource center" description="Upload study material and curate useful links for your students." />

      {resourcesUnavailable || linksUnavailable ? (
        <div role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Some resource lists could not be loaded. The upload forms are still available; reload the page to retry.
        </div>
      ) : null}

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
          {resourcesUnavailable ? (
            <EmptyState title="Resources could not be loaded" description="The upload form is available. Reload the page to try loading the list again." />
          ) : rows.length === 0 ? (
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

      <section className="mt-10 border-t border-line pt-8" aria-labelledby="useful-links-heading">
        <div className="mb-6">
          <h2 id="useful-links-heading" className="text-xl font-bold tracking-tight text-ink">Useful links</h2>
          <p className="mt-1 text-sm text-muted">Publish trusted learning websites and references in the student Resources area.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <h3 className="mb-4 font-bold text-ink">Add a useful link</h3>
            <ActionForm action={createUsefulLink} submitLabel="Publish link">
              <Field label="Title" htmlFor="link-title">
                <input id="link-title" name="title" required maxLength={160} className={inputClass} placeholder="Khan Academy — Algebra" />
              </Field>
              <Field label="Web address" htmlFor="link-url" hint="Use a secure https:// link when possible.">
                <input id="link-url" name="url" type="url" required maxLength={2048} className={inputClass} placeholder="https://example.com/learn" />
              </Field>
              <Field label="Description" htmlFor="link-description">
                <textarea id="link-description" name="description" rows={3} maxLength={600} className={inputClass} placeholder="What students will find at this link" />
              </Field>
            </ActionForm>
          </Card>

          <div className="flex flex-col gap-3 lg:col-span-3">
            {linksUnavailable ? (
              <EmptyState title="Useful links could not be loaded" description="The publish form is available. Reload the page to try loading the list again." />
            ) : links.length === 0 ? (
              <EmptyState title="No useful links yet" description="Links you publish will appear in the student Resources section." />
            ) : (
              links.map((link) => (
                <Card key={link.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{link.title}</h3>
                    <p className="mt-1 break-all text-sm text-brand">{link.url}</p>
                    {link.description ? <p className="mt-1 text-sm text-muted">{link.description}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand hover:underline">Preview</a>
                    <DeleteButton id={link.id} kind="usefulLink" label={link.title} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}
