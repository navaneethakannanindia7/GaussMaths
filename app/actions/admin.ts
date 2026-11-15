'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { resources, submissions, tests, usefulLinks, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { deleteFile, uploadFile } from '@/lib/blob'
import { CLASS_OPTIONS, type FormState } from '@/lib/utils'

function text(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function postgresErrorDetails(error: unknown) {
  const visited = new Set<object>()
  let current: unknown = error

  while (current !== null && typeof current === 'object' && !visited.has(current)) {
    visited.add(current)
    const value = current as Record<string, unknown>
    if (typeof value.code === 'string' && /^[0-9A-Z]{5}$/.test(value.code)) {
      return {
        code: value.code,
        ...(typeof value.constraint === 'string' ? { constraint: value.constraint } : {}),
        ...(typeof value.table === 'string' ? { table: value.table } : {}),
        ...(typeof value.column === 'string' ? { column: value.column } : {}),
      }
    }
    current = value.cause ?? value.originalError
  }

  return undefined
}

function errorMessage(error: unknown, action: string, message: string) {
  const databaseError = postgresErrorDetails(error)
  console.error('[admin] action failed', {
    action,
    errorName: error instanceof Error ? error.name : 'UnknownError',
    ...(databaseError ? { databaseError } : {}),
  })
  return message
}

export async function setStudentStatus(studentId: string, status: 'approved' | 'rejected' | 'pending') {
  await requireAdmin()
  await db
    .update(user)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(user.id, studentId), eq(user.role, 'student')))
  revalidatePath('/admin', 'layout')
}

export async function uploadResource(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin()
  try {
    const title = text(form, 'title')
    if (!title) return { error: 'Title is required.' }
    const category = text(form, 'category') || 'notes'
    const file = await uploadFile(form.get('file'), 'resources', false, 'public')
    await db.insert(resources).values({
      title,
      chapter: text(form, 'chapter') || null,
      category,
      className: text(form, 'className') || null,
      pathname: file.pathname,
      fileName: file.fileName,
      createdBy: admin.id,
    })
    revalidatePath('/admin/resources')
    revalidatePath('/portal/resources')
    return { success: 'Resource uploaded.' }
  } catch (error) {
    return { error: errorMessage(error, 'uploadResource', 'Could not upload this resource. Please try again.') }
  }
}

export async function createUsefulLink(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin()
  try {
    const title = text(form, 'title')
    const description = text(form, 'description')
    const className = text(form, 'className')
    const chapter = text(form, 'chapter')
    const rawUrl = text(form, 'url')

    if (!title || !description || !className || !chapter || !rawUrl) {
      return { error: 'Complete every field before publishing.' }
    }
    if (title.length > 160 || description.length > 1200 || chapter.length > 160 || rawUrl.length > 2048) {
      return { error: 'One or more fields exceed the allowed length.' }
    }
    if (!CLASS_OPTIONS.includes(className)) return { error: 'Select a valid class.' }

    let resourceUrl: URL
    try {
      resourceUrl = new URL(rawUrl)
    } catch {
      return { error: 'Enter a valid resource URL.' }
    }
    if (!['http:', 'https:'].includes(resourceUrl.protocol) || resourceUrl.username || resourceUrl.password) {
      return { error: 'Resource links must use a valid http or https URL.' }
    }

    await db.insert(usefulLinks).values({
      title,
      description,
      className,
      chapter,
      url: resourceUrl.toString(),
      createdBy: admin.id,
    })
    revalidatePath('/admin/useful-links')
    revalidatePath('/portal/useful-links')
    return { success: 'Useful link published to students in the selected class.' }
  } catch (error) {
    return { error: errorMessage(error, 'createUsefulLink', 'Could not publish this useful link. Please try again.') }
  }
}

export async function deleteUsefulLink(id: number) {
  await requireAdmin()
  await db.delete(usefulLinks).where(eq(usefulLinks.id, id))
  revalidatePath('/admin/useful-links')
  revalidatePath('/portal/useful-links')
}

export async function deleteResource(id: number) {
  await requireAdmin()
  const [row] = await db.delete(resources).where(eq(resources.id, id)).returning()
  if (row) await deleteFile(row.pathname).catch(() => {})
  revalidatePath('/admin/resources')
}

export async function createTest(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin()
  try {
    const title = text(form, 'title')
    if (!title) return { error: 'Title is required.' }
    const maxMarks = Number.parseInt(text(form, 'maxMarks'), 10)
    if (!Number.isInteger(maxMarks) || maxMarks <= 0 || maxMarks > 1000) {
      return { error: 'Maximum marks must be a whole number between 1 and 1000.' }
    }
    const due = text(form, 'dueDate')
    const dueAt = /^\d{4}-\d{2}-\d{2}$/.test(due) ? new Date(`${due}T23:59:00+05:30`) : null
    const file = await uploadFile(form.get('file'), 'tests', true, 'public')
    await db.insert(tests).values({
      title,
      chapter: text(form, 'chapter') || null,
      className: text(form, 'className') || null,
      maxMarks,
      dueAt,
      pathname: file.pathname,
      fileName: file.fileName,
      createdBy: admin.id,
    })
    revalidatePath('/admin/tests')
    revalidatePath('/portal', 'layout')
    return { success: 'Test published to students.' }
  } catch (error) {
    return { error: errorMessage(error, 'createTest', 'Could not publish this test. Please try again.') }
  }
}

export async function deleteTest(id: number) {
  await requireAdmin()
  const [row] = await db.delete(tests).where(eq(tests.id, id)).returning()
  if (row) await deleteFile(row.pathname).catch(() => {})
  revalidatePath('/admin/tests')
}

export async function gradeSubmission(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const id = Number.parseInt(text(form, 'id'), 10)
    const score = Number.parseInt(text(form, 'score'), 10)
    const maxMarks = Number.parseInt(text(form, 'maxMarks'), 10)
    if (!Number.isInteger(id)) return { error: 'Invalid submission.' }
    if (!Number.isInteger(maxMarks) || maxMarks <= 0 || maxMarks > 1000) return { error: 'Enter valid maximum marks.' }
    if (!Number.isInteger(score) || score < 0 || score > maxMarks) {
      return { error: `Score must be between 0 and ${maxMarks}.` }
    }
    await db
      .update(submissions)
      .set({
        score,
        maxMarks,
        feedback: text(form, 'feedback') || null,
        status: 'graded',
        gradedAt: new Date(),
      })
      .where(eq(submissions.id, id))
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/homework')
    revalidatePath('/admin/submissions')
    revalidatePath('/portal/homework')
    return { success: 'Grade saved.' }
  } catch (error) {
    return { error: errorMessage(error, 'gradeSubmission', 'Could not save this grade. Please try again.') }
  }
}
