'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { submissions, tests } from '@/lib/db/schema'
import { requireApprovedStudent } from '@/lib/session'
import { uploadFile } from '@/lib/blob'
import type { FormState } from '@/lib/utils'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export async function submitTestAnswer(_: FormState, form: FormData): Promise<FormState> {
  try {
    const student = await requireApprovedStudent()
    const testId = Number.parseInt(String(form.get('testId') ?? ''), 10)
    if (!Number.isInteger(testId)) return { error: 'Invalid test.' }

    const [test] = await db.select().from(tests).where(eq(tests.id, testId)).limit(1)
    if (!test) return { error: 'Test not found.' }
    if (test.className && test.className !== student.className) return { error: 'This test is not assigned to your class.' }

    const [existing] = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(and(eq(submissions.userId, student.id), eq(submissions.testId, testId)))
      .limit(1)
    if (existing) return { error: 'You have already submitted this test.' }

    const file = await uploadFile(form.get('file'), `test-submissions/${student.id}`, false, 'private')
    await db.insert(submissions).values({
      userId: student.id,
      kind: 'test',
      testId,
      title: test.title,
      chapter: test.chapter,
      maxMarks: test.maxMarks,
      pathname: file.pathname,
      fileName: file.fileName,
    })
    revalidatePath('/portal', 'layout')
    return { success: 'Answer sheet submitted.' }
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function submitHomework(_: FormState, form: FormData): Promise<FormState> {
  try {
    const student = await requireApprovedStudent()
    const title = String(form.get('title') ?? '').trim()
    if (!title) return { error: 'Please give your homework a title.' }
    const chapter = String(form.get('chapter') ?? '').trim() || null
    const file = await uploadFile(form.get('file'), `submissions/${student.id}`)
    await db.insert(submissions).values({
      userId: student.id,
      kind: 'homework',
      title: title.slice(0, 200),
      chapter,
      pathname: file.pathname,
      fileName: file.fileName,
    })
    revalidatePath('/portal', 'layout')
    return { success: 'Homework submitted.' }
  } catch (error) {
    return { error: errorMessage(error) }
  }
}
