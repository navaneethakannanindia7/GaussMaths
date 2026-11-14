import { and, desc, eq, isNull, or } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/lib/db'
import { resources, submissions, tests, usefulLinks } from '@/lib/db/schema'

function forClass(column: AnyPgColumn, className: string | null | undefined) {
  return className ? or(isNull(column), eq(column, className)) : isNull(column)
}

export function getTestsForStudent(className: string | null | undefined) {
  return db.select().from(tests).where(forClass(tests.className, className)).orderBy(desc(tests.createdAt))
}

export function getResourcesForStudent(className: string | null | undefined) {
  return db.select().from(resources).where(forClass(resources.className, className)).orderBy(desc(resources.createdAt))
}

export function getUsefulLinks(className: string | null | undefined) {
  return db.select().from(usefulLinks).where(forClass(usefulLinks.className, className)).orderBy(desc(usefulLinks.createdAt))
}

export function getSubmissionsForStudent(userId: string, kind?: 'test' | 'homework') {
  return db
    .select()
    .from(submissions)
    .where(kind ? and(eq(submissions.userId, userId), eq(submissions.kind, kind)) : eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt))
}
