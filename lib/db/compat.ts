import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const legacyUsefulLinks = pgTable('useful_links', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export function isMissingClassNameColumn(error: unknown) {
  const visited = new Set<object>()
  let current: unknown = error

  while (current !== null && typeof current === 'object' && !visited.has(current)) {
    visited.add(current)
    const value = current as Record<string, unknown>
    if (value.code === '42703') {
      return value.column === 'className' || (typeof value.message === 'string' && value.message.includes('className'))
    }
    current = value.cause ?? value.originalError
  }

  return false
}
