import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('student'),
  status: text('status').notNull().default('pending'),
  className: text('className'),
  phone: text('phone'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  chapter: text('chapter'),
  category: text('category').notNull().default('notes'),
  className: text('className'),
  pathname: text('pathname').notNull(),
  fileName: text('fileName').notNull(),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const tests = pgTable('tests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  chapter: text('chapter'),
  className: text('className'),
  maxMarks: integer('maxMarks').notNull().default(100),
  dueAt: timestamp('dueAt'),
  pathname: text('pathname').notNull(),
  fileName: text('fileName').notNull(),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  kind: text('kind').notNull(),
  testId: integer('testId'),
  title: text('title').notNull(),
  chapter: text('chapter'),
  pathname: text('pathname').notNull(),
  fileName: text('fileName').notNull(),
  score: integer('score'),
  maxMarks: integer('maxMarks'),
  feedback: text('feedback'),
  status: text('status').notNull().default('submitted'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  gradedAt: timestamp('gradedAt'),
})
