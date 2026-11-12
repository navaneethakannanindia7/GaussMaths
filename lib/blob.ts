import { randomUUID } from 'node:crypto'
import { del, put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { privateFiles } from '@/lib/db/schema'

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

// Public files go to Vercel Blob. Private files (student answer sheets) are
// stored in the database and only served through the authenticated /api/file route.
export async function uploadFile(
  value: FormDataEntryValue | null,
  prefix: string,
  pdfOnly = false,
  access: 'public' | 'private' = 'private',
) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error('Please choose a file to upload.')
  }
  if (value.size > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large. Maximum size is 4 MB.')
  }
  const allowed = pdfOnly ? ['application/pdf'] : ALLOWED_TYPES
  if (!allowed.includes(value.type)) {
    throw new Error(pdfOnly ? 'Only PDF files are allowed.' : 'Only PDF or image files (PNG, JPG, WEBP) are allowed.')
  }
  const safeName = value.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)

  if (access === 'public') {
    const blob = await put(`${prefix}/${safeName}`, value, {
      access: 'public',
      addRandomSuffix: true,
      contentType: value.type,
    })
    return { pathname: blob.url, fileName: value.name }
  }

  const pathname = `${prefix}/${randomUUID()}-${safeName}`
  await db.insert(privateFiles).values({
    pathname,
    fileName: value.name,
    contentType: value.type,
    data: Buffer.from(await value.arrayBuffer()),
  })
  return { pathname, fileName: value.name }
}

export async function deleteFile(pathname: string) {
  if (pathname.startsWith('https://')) {
    await del(pathname)
    return
  }
  await db.delete(privateFiles).where(eq(privateFiles.pathname, pathname))
}

export function fileHref(pathname: string) {
  return pathname.startsWith('https://')
    ? pathname
    : `/api/file?pathname=${encodeURIComponent(pathname)}`
}
