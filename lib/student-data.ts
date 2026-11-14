import { and, desc, eq, isNull, or } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/lib/db'
import { isMissingClassNameColumn, legacyUsefulLinks } from '@/lib/db/compat'
import { resources, submissions, tests, usefulLinks } from '@/lib/db/schema'

async function getLegacyUsefulLinks() {
  const rows = await db.select().from(legacyUsefulLinks).orderBy(desc(legacyUsefulLinks.createdAt))
  return rows.map((link) => ({ ...link, className: null }))
}

function forClass(column: AnyPgColumn, className: string | null | undefined) {
  return className ? or(isNull(column), eq(column, className)) : isNull(column)
}

export function getTestsForStudent(className: string | null | undefined) {
  return db.select().from(tests).where(forClass(tests.className, className)).orderBy(desc(tests.createdAt))
}

export function getResourcesForStudent(className: string | null | undefined) {
  return db.select().from(resources).where(forClass(resources.className, className)).orderBy(desc(resources.createdAt))
}

export async function getUsefulLinksForAdmin() {
  try {
    return await db.select().from(usefulLinks).orderBy(desc(usefulLinks.createdAt))
  } catch (error) {
    if (!isMissingClassNameColumn(error)) throw error
    return getLegacyUsefulLinks()
  }
}

export async function getUsefulLinks(className: string | null | undefined) {
  try {
    return await db
      .select()
      .from(usefulLinks)
      .where(forClass(usefulLinks.className, className))
      .orderBy(desc(usefulLinks.createdAt))
  } catch (error) {
    if (!isMissingClassNameColumn(error)) throw error
    return getLegacyUsefulLinks()
  }
}

export function getSubmissionsForStudent(userId: string, kind?: 'test' | 'homework') {
  return db
    .select()
    .from(submissions)
    .where(kind ? and(eq(submissions.userId, userId), eq(submissions.kind, kind)) : eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt))
}
