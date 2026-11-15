import { desc } from 'drizzle-orm'
import { createUsefulLink } from '@/app/actions/admin'
import { ActionForm } from '@/components/action-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from '@/components/ui'
import { CLASS_OPTIONS, formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { usefulLinks } from '@/lib/db/schema'
import { safeResourceHref } from '@/lib/useful-links'

export const metadata = { title: 'Useful Links | Gauss Maths Admin' }

export default async function AdminUsefulLinksPage() {
  const [linksResult] = await Promise.allSettled([
    db.select().from(usefulLinks).orderBy(desc(usefulLinks.createdAt)),
  ])
  const linksUnavailable = linksResult.status === 'rejected'
  const links = linksUnavailable ? [] : linksResult.value

  return (
    <>
      <PageHeader title="Useful Links" description="Publish trusted learning links for a specific class and chapter." />

      {linksUnavailable ? (
        <div role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Useful links could not be loaded. The publishing form is still available; reload to retry.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Publish a useful link</h2>
          <ActionForm action={createUsefulLink} submitLabel="Publish link" pendingLabel="Publishing…">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" required maxLength={160} className={inputClass} placeholder="Interactive algebra practice" />
            </Field>
            <Field label="Description" htmlFor="description">
              <textarea id="description" name="description" required maxLength={1200} rows={3} className={inputClass} placeholder="What students will learn or practice" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class" htmlFor="className">
                <select id="className" name="className" required defaultValue="" className={inputClass}>
                  <option value="" disabled>Select a class</option>
                  {CLASS_OPTIONS.map((className) => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </Field>
              <Field label="Chapter" htmlFor="chapter">
                <input id="chapter" name="chapter" required maxLength={160} className={inputClass} placeholder="Linear equations" />
              </Field>
            </div>
            <Field label="Resource link" htmlFor="url" hint="Use a full http or https URL. Students open links in a new tab.">
              <input id="url" name="url" type="url" required maxLength={2048} className={inputClass} placeholder="https://example.com/resource" />
            </Field>
            <p className="-mt-2 text-sm text-muted">The link will appear in Useful Links for students assigned to the selected class.</p>
          </ActionForm>
        </Card>

        <section className="flex flex-col gap-3 lg:col-span-3" aria-label="Published useful links">
          {linksUnavailable ? (
            <EmptyState title="Useful links could not be loaded" description="The publishing form is available. Reload to try loading the list again." />
          ) : links.length === 0 ? (
            <EmptyState title="No useful links yet" description="Links you publish will appear here and in the selected students’ portal." />
          ) : (
            links.map((link) => {
              const href = safeResourceHref(link.url)
              return (
                <Card key={link.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{link.title}</h3>
                      <Badge tone="brand">{link.className ?? 'Unassigned class'}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{link.chapter ?? 'No chapter'} · Published {formatDate(link.createdAt)}</p>
                    {link.description ? <p className="mt-2 text-sm text-ink">{link.description}</p> : null}
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block max-w-full truncate text-sm font-semibold text-brand hover:underline">
                        {link.url}
                      </a>
                    ) : <p className="mt-2 text-sm text-danger">This saved URL is not a valid web link.</p>}
                    <p className="mt-1 text-xs text-muted">Published by admin</p>
                  </div>
                  <DeleteButton id={link.id} kind="useful-link" label={link.title} />
                </Card>
              )
            })
          )}
        </section>
      </div>
    </>
  )
}
