import { ExternalLink, FileText } from 'lucide-react'
import { Card, EmptyState, PageHeader } from '@/components/ui'
import { requireStudent } from '@/lib/session'
import { getResourcesForStudent, getUsefulLinks } from '@/lib/student-data'
import { CATEGORY_LABELS } from '@/lib/categories'
import { fileHref } from '@/lib/blob'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Resources | Gauss Maths Student Portal' }

export default async function StudentResourcesPage() {
  const student = await requireStudent()
  const [items, links] = await Promise.all([
    getResourcesForStudent(student.className),
    getUsefulLinks(),
  ])
  const groups = Object.keys(CATEGORY_LABELS)
    .map((key) => ({ key, label: CATEGORY_LABELS[key], items: items.filter((i) => i.category === key) }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      <PageHeader title="Resources" description="Notes, important questions and previous year papers shared by your teacher." />

      {groups.length === 0 ? (
        <EmptyState title="No resources yet" description="Study material will appear here once it's uploaded." />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <section key={g.key} aria-labelledby={`h-${g.key}`}>
              <h2 id={`h-${g.key}`} className="mb-3 text-lg font-bold text-ink">
                {g.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((r) => (
                  <a key={r.id} href={fileHref(r.pathname)} target="_blank" rel="noreferrer" className="group">
                    <Card className="flex h-full items-start gap-3 transition group-hover:border-brand/40 group-hover:shadow-md">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lime/60 text-brand">
                        <FileText className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink group-hover:text-brand">{r.title}</span>
                        <span className="mt-0.5 block text-sm text-muted">
                          {r.chapter ? `${r.chapter} · ` : ''}
                          {formatDate(r.createdAt)}
                        </span>
                      </span>
                    </Card>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="mt-10 border-t border-line pt-8" aria-labelledby="useful-links-heading">
        <div className="mb-5">
          <h2 id="useful-links-heading" className="text-xl font-bold tracking-tight text-ink">Useful links</h2>
          <p className="mt-1 text-sm text-muted">Extra learning websites and references selected by your teacher.</p>
        </div>
        {links.length === 0 ? (
          <EmptyState title="No useful links yet" description="Your teacher’s recommended websites will appear here." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group">
                <Card className="flex h-full items-start gap-3 transition group-hover:border-brand/40 group-hover:shadow-md">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lime/60 text-brand">
                    <ExternalLink className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-semibold text-ink group-hover:text-brand">
                      {link.title}
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                    </span>
                    {link.description ? <span className="mt-1 block text-sm text-muted">{link.description}</span> : null}
                    <span className="mt-2 block break-all text-xs text-brand">{link.url}</span>
                  </span>
                </Card>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
