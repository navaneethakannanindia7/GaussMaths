import { DashboardShell } from '@/components/dashboard-shell'
import { requireAdmin } from '@/lib/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  return (
    <DashboardShell variant="admin" userName={admin.name} userMeta={admin.email}>
      {children}
    </DashboardShell>
  )
}
