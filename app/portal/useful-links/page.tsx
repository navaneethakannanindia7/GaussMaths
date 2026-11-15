import { ExternalLink, Link2 } from 'lucide-react'
import { Card, EmptyState, PageHeader } from '@/components/ui'
import { requireStudent } from '@/lib/session'
import { getUsefulLinksForStudent } from '@/lib/student-data'
import { formatDate } from '@/lib/utils'
import { safeResourceHref } from '@/lib/useful-links'

export const metadata = { title: 'Useful Links | Gauss Maths Student Portal' }

export default async function StudentUsefulLinksPage() {
  const student = await requireStudent()
  const [linksResult] = await Promise.allSettled([getUsefulLinksForStudent(student.className)])
  const linksUnavailable = linksResult.status === 'rejected'
  const links = linksUnavailable ? [] : linksResult.value.filter((link) => safeResourceHref(link.url))

  return (
    <>
      <PageHeader
        title="Useful Links"
        description={student.className ? `Learning links shared for ${student.className}.` : 'Learning links shared by your teacher.'}
      />

      {linksUnavailable ? (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Useful links could not be loaded. Reload to retry.
        </div>
      ) : !student.className ? (
        <EmptyState title="Class not assigned" description="Ask your teacher to assign your class so we can show the right links." />
      ) : links.length === 0 ? (
        <EmptyState title="No useful links yet" description="Your teacher’s links for your class will appear here." />
      ) : (
        <section aria-label="Useful links for your class" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const href = safeResourceHref(link.url)
            if (!href) return null

            return (
              <a key={link.id} href={href} target="_blank" rel="noopener noreferrer" className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <Card className="flex h-full flex-col gap-4 transition group-hover:border-brand/40 group-hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lime/60 text-brand">
                      <Link2 className="size-5" aria-hidden="true" />
                    </span>
                    <ExternalLink className="mt-1 size-4 shrink-0 text-muted transition group-hover:text-brand" aria-hidden="true" />
                  </div>
                  <span className="block">
                    <span className="block font-semibold text-ink group-hover:text-brand">{link.title}</span>
                    {link.description ? <span className="mt-1 block text-sm leading-6 text-muted">{link.description}</span> : null}
                  </span>
                  <span className="mt-auto block border-t border-line pt-3 text-xs text-muted">
                    <span className="block font-medium text-ink">{link.className}{link.chapter ? ` · ${link.chapter}` : ''}</span>
                    <span className="mt-1 block">Published by admin · {formatDate(link.createdAt)}</span>
                  </span>
                </Card>
              </a>
            )
          })}
        </section>
      )}
    </>
  )
}
