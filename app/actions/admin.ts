'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { resources, submissions, tests, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { uploadFile } from '@/lib/blob'
import type { FormState } from '@/lib/utils'

function text(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
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
    const file = await uploadFile(form.get('file'), 'resources')
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
    return { error: errorMessage(error) }
  }
}

export async function deleteResource(id: number) {
  await requireAdmin()
  const [row] = await db.delete(resources).where(eq(resources.id, id)).returning()
  if (row) await del(row.pathname).catch(() => {})
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
    const file = await uploadFile(form.get('file'), 'tests', true)
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
    return { error: errorMessage(error) }
  }
}

export async function deleteTest(id: number) {
  await requireAdmin()
  const [row] = await db.delete(tests).where(eq(tests.id, id)).returning()
  if (row) await del(row.pathname).catch(() => {})
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
    return { success: 'Saved.' }
  } catch (error) {
    return { error: errorMessage(error) }
  }
}
