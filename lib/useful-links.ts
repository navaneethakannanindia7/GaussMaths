import { desc, eq, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { usefulLinks } from '@/lib/db/schema'

export function getUsefulLinksForAdmin() {
  return db.select().from(usefulLinks).orderBy(desc(usefulLinks.createdAt))
}

export function getUsefulLinksForStudent(className: string | null | undefined) {
  const visibility = className
    ? or(isNull(usefulLinks.className), eq(usefulLinks.className, className))
    : isNull(usefulLinks.className)

  return db.select().from(usefulLinks).where(visibility).orderBy(desc(usefulLinks.createdAt))
}
