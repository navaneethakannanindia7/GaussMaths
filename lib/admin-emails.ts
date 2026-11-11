const DEFAULT_ADMIN_EMAILS = ['gaussmaths26@gmail.com']

export function getAdminEmails() {
  const fromEnv = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAILS
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase())
}
