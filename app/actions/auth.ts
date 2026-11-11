'use server'

import { isAdminEmail } from '@/lib/admin-emails'

export async function checkAdminEmail(email: string) {
  return typeof email === 'string' && isAdminEmail(email)
}
