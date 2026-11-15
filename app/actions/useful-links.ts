'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { usefulLinks } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import type { FormState } from '@/lib/utils'

function formText(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function postgresErrorCode(error: unknown) {
  const visited = new Set<object>()
  let current: unknown = error

  while (current !== null && typeof current === 'object' && !visited.has(current)) {
    visited.add(current)
    const value = current as Record<string, unknown>
    if (typeof value.code === 'string') return value.code
    current = value.cause ?? value.originalError
  }

  return undefined
}

function usefulLinksError(error: unknown, action: string) {
  const code = postgresErrorCode(error)
  console.error('[useful-links] database operation failed', { action, code })

  if (code === '42P01') {
    return 'The useful links table is missing from the connected database. Check that DATABASE_URL points to the Gauss Maths Neon database.'
  }
  if (code === '42703') {
    return 'The useful links table is missing a required column. Check that DATABASE_URL points to the current Gauss Maths database.'
  }
  if (typeof code === 'string' && code.startsWith('08')) {
    return 'The database connection failed. Check the DATABASE_URL configuration for this deployment.'
  }
  return 'Could not save this useful link. Please try again.'
}

export async function createUsefulLink(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin()
  const title = formText(form, 'title')
  const rawUrl = formText(form, 'url')
  const description = formText(form, 'description')
  const className = formText(form, 'className') || null

  if (!title) return { error: 'Title is required.' }
  if (title.length > 160) return { error: 'Title must be 160 characters or fewer.' }
  if (description.length > 600) return { error: 'Description must be 600 characters or fewer.' }
  if (!rawUrl || rawUrl.length > 2048) return { error: 'Enter a valid web address.' }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return { error: 'Enter a valid link starting with https:// or http://.' }
  }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.username || url.password) {
    return { error: 'Use a public http:// or https:// web address.' }
  }

  try {
    await db.insert(usefulLinks).values({
      title,
      url: url.toString(),
      description: description || null,
      className,
      createdBy: admin.id,
    })
    revalidatePath('/admin/resources')
    revalidatePath('/portal/resources')
    return { success: 'Useful link published.' }
  } catch (error) {
    return { error: usefulLinksError(error, 'create') }
  }
}

export async function deleteUsefulLink(id: number) {
  await requireAdmin()
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid useful link id.')

  try {
    await db.delete(usefulLinks).where(eq(usefulLinks.id, id))
    revalidatePath('/admin/resources')
    revalidatePath('/portal/resources')
  } catch (error) {
    usefulLinksError(error, 'delete')
    throw new Error('Could not delete this useful link. Please retry.')
  }
}
