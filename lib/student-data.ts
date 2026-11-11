import { and, desc, eq, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { resources, submissions, tests } from '@/lib/db/schema'

function forClass<T extends { className: typeof tests.className | typeof resources.className }>(table: T, className: string | null | undefined) {
  return className ? or(isNull(table.className), eq(table.className, className)) : isNull(table.className)
}

export function getTestsForStudent(className: string | null | undefined) {
  return db.select().from(tests).where(forClass(tests, className)).orderBy(desc(tests.createdAt))
}

export function getResourcesForStudent(className: string | null | undefined) {
  return db.select().from(resources).where(forClass(resources, className)).orderBy(desc(resources.createdAt))
}

export function getSubmissionsForStudent(userId: string, kind?: 'test' | 'homework') {
  return db
    .select()
    .from(submissions)
    .where(kind ? and(eq(submissions.userId, userId), eq(submissions.kind, kind)) : eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt))
}
