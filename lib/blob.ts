import { del, put } from '@vercel/blob'

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

export function privateBlobToken() {
  const token = process.env.BLOB_TESTS_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('Private file storage is not configured. Connect the private Vercel Blob store to provide BLOB_TESTS_READ_WRITE_TOKEN.')
  }
  return token
}

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
  const blob = await put(`${prefix}/${safeName}`, value, {
    access,
    addRandomSuffix: true,
    contentType: value.type,
    ...(access === 'private' ? { token: privateBlobToken() } : {}),
  })
  return { pathname: access === 'public' ? blob.url : blob.pathname, fileName: value.name }
}

export async function deleteFile(pathname: string) {
  await del(pathname, pathname.startsWith('https://')
    ? undefined
    : { token: privateBlobToken() })
}

export function fileHref(pathname: string) {
  return pathname.startsWith('https://')
    ? pathname
    : `/api/file?pathname=${encodeURIComponent(pathname)}`
}
